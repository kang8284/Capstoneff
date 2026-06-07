"""
AI 서비스 — 체형 분석 FastAPI 서버
====================================
POST /api/analyze-body
  : 이미지 + 성별/키/몸무게 → 서버 사이드 MediaPipe 분석
  : 브라우저 WASM 한계를 벗어난 더 정밀한 측정값 반환

POST /api/recommend  (기존 기능, 유지)
"""

from __future__ import annotations

import base64
import io
import math
from typing import Optional

import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from pydantic import BaseModel

# ── MediaPipe (구형 solutions API: 서버에서 더 안정적) ──
import mediapipe as mp

app = FastAPI(title="체형 분석 AI 서비스")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── MediaPipe 모델 (앱 시작 시 1회 로드) ──
_pose = mp.solutions.pose.Pose(
    static_image_mode=True,
    model_complexity=2,          # 0/1/2 중 가장 정밀
    enable_segmentation=True,    # 세그멘테이션 마스크도 함께 추출
    min_detection_confidence=0.5,
)

# ─────────────────────────────────────────
# 파라미터
# ─────────────────────────────────────────
SHR_PARAMS = {
    "여자": {"Straight": (0.97, 0.09), "Natural": (1.09, 0.10), "Wave": (0.84, 0.08)},
    "남자": {"Straight": (1.12, 0.09), "Natural": (1.28, 0.11), "Wave": (0.97, 0.08)},
}
HEIGHT_PARAMS = {
    "여자": {"Straight": (165, 5), "Natural": (169, 6), "Wave": (161, 5)},
    "남자": {"Straight": (175, 5), "Natural": (179, 6), "Wave": (172, 5)},
}
RATIO_PARAMS = {
    "여자": {"Straight": (0.65, 0.07), "Natural": (0.72, 0.08), "Wave": (0.60, 0.06)},
    "남자": {"Straight": (0.68, 0.07), "Natural": (0.75, 0.08), "Wave": (0.63, 0.06)},
}
TYPES = ["Straight", "Wave", "Natural"]


def gaussian(x: float, mean: float, std: float) -> float:
    return math.exp(-0.5 * ((x - mean) / std) ** 2)


# ─────────────────────────────────────────
# 세그멘테이션 마스크에서 너비 측정
# ─────────────────────────────────────────
def measure_width_at_y(mask: np.ndarray, center_y: int, scan_lines: int = 9) -> Optional[float]:
    """마스크에서 center_y 행 근방의 신체 너비(정규화)를 반환"""
    H, W = mask.shape
    half = scan_lines // 2
    widths = []
    for dy in range(-half, half + 1):
        y = center_y + dy
        if y < 0 or y >= H:
            continue
        row = mask[y]
        xs = np.where(row > 0.5)[0]
        if len(xs) >= 2:
            widths.append((xs[-1] - xs[0]) / W)
    return float(np.mean(widths)) if widths else None


# ─────────────────────────────────────────
# 요청/응답 스키마
# ─────────────────────────────────────────
class BodyAnalysisRequest(BaseModel):
    image: str          # base64 JPEG/PNG
    gender: str         # "남자" | "여자"
    height: float       # cm
    weight: float       # kg


class BodyAnalysisResponse(BaseModel):
    shr: Optional[float]
    bodyRatio: Optional[float]
    scores: dict
    primary: str
    usedIndicators: list[str]
    debug: dict


# ─────────────────────────────────────────
# 체형 분석 엔드포인트
# ─────────────────────────────────────────
@app.post("/api/analyze-body", response_model=BodyAnalysisResponse)
async def analyze_body(req: BodyAnalysisRequest):
    # 1. 이미지 디코딩
    try:
        raw = base64.b64decode(req.image.split(",")[-1])
        pil_img = Image.open(io.BytesIO(raw)).convert("RGB")
        img_np = np.array(pil_img)
    except Exception as e:
        raise HTTPException(400, f"이미지 디코딩 실패: {e}")

    H, W = img_np.shape[:2]

    # 2. MediaPipe Pose 실행
    results = _pose.process(img_np)
    if not results.pose_landmarks:
        raise HTTPException(422, "포즈 감지 실패")

    lm = results.pose_landmarks.landmark

    # 가시성 검사
    for idx in [11, 12, 23, 24]:
        if lm[idx].visibility < 0.5:
            raise HTTPException(422, f"landmark {idx} visibility 부족")

    # 3. 측정값 계산
    shoulder_yn = (lm[11].y + lm[12].y) / 2
    hip_yn      = (lm[23].y + lm[24].y) / 2

    # LM 기반 SHR
    lm_sw = math.dist((lm[11].x, lm[11].y), (lm[12].x, lm[12].y))
    lm_hw = math.dist((lm[23].x, lm[23].y), (lm[24].x, lm[24].y))
    lm_shr = lm_sw / lm_hw if lm_hw > 0.001 else None

    # 세그멘테이션 기반 SHR (버스트 레벨)
    seg_shr = None
    mask = results.segmentation_mask  # float32 (H, W)
    if mask is not None:
        # 버스트 레벨(어깨~힙 10~20%) 너비
        bust_y   = int((shoulder_yn + (hip_yn - shoulder_yn) * 0.15) * H)
        hip_y_px = int(hip_yn * 0.85 * H + hip_yn * 0.15 * H)  # 힙 근방

        bust_w = measure_width_at_y(mask, bust_y)
        hip_w  = measure_width_at_y(mask, hip_y_px)

        if bust_w and hip_w and bust_w > 0.02 and hip_w > 0.02:
            seg_shr = bust_w / hip_w

    shr = seg_shr if seg_shr else lm_shr

    # 상체/하체 비율
    body_ratio = None
    if lm[27].visibility >= 0.3 and lm[28].visibility >= 0.3:
        ankle_yn = (lm[27].y + lm[28].y) / 2
        upper    = hip_yn - shoulder_yn
        lower    = ankle_yn - hip_yn
        if lower > 0.01:
            body_ratio = upper / lower

    # 4. 가중 스코어 계산
    gender = req.gender if req.gender in SHR_PARAMS else "여자"
    shrP   = SHR_PARAMS[gender]
    hP     = HEIGHT_PARAMS[gender]
    rP     = RATIO_PARAMS[gender]

    available = []
    if shr:
        available.append(("SHR",    [gaussian(shr,          *shrP[t]) for t in TYPES], 0.40))
    if req.height:
        available.append(("Height", [gaussian(req.height,   *hP[t])   for t in TYPES], 0.25))
    if body_ratio:
        available.append(("Ratio",  [gaussian(body_ratio,   *rP[t])   for t in TYPES], 0.35))

    if not available:
        raise HTTPException(422, "측정 가능한 지표가 없습니다")

    total_w = sum(w for _, _, w in available)
    raw = [
        sum(g[i] * (w / total_w) for _, g, w in available)
        for i in range(3)
    ]
    total_g = sum(raw)
    pcts = [round(v / total_g * 100) for v in raw]
    pcts[2] = 100 - pcts[0] - pcts[1]  # 합 100 보정

    scores = {TYPES[i]: pcts[i] for i in range(3)}
    primary = max(scores, key=scores.__getitem__)

    return BodyAnalysisResponse(
        shr=round(shr, 3) if shr else None,
        bodyRatio=round(body_ratio, 3) if body_ratio else None,
        scores=scores,
        primary=primary,
        usedIndicators=[label for label, _, _ in available],
        debug={
            "lm_shr": round(lm_shr, 3) if lm_shr else None,
            "seg_shr": round(seg_shr, 3) if seg_shr else None,
            "image_size": f"{W}x{H}",
            "vis_11": round(lm[11].visibility, 2),
            "vis_12": round(lm[12].visibility, 2),
            "vis_23": round(lm[23].visibility, 2),
            "vis_24": round(lm[24].visibility, 2),
        },
    )


# ─────────────────────────────────────────
# 헬스체크
# ─────────────────────────────────────────
@app.get("/health")
async def health():
    return {"status": "ok"}

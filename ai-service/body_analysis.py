"""
체형 분석 모듈
==============
Straight / Wave / Natural 세 체형의 퍼센테이지를 입력받아
대표 체형과(필요시) 보조 체형을 판별합니다.

규칙:
    - 1위 체형이 대표 체형
    - 1위와 2위의 차이가 threshold 이하이면 보조 체형도 함께 반환
    - threshold 기본값: 10 percentage points
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Optional


# ──────────────────────────────────────────
# 상수
# ──────────────────────────────────────────

DEFAULT_THRESHOLD: float = 10.0  # 대표·보조 체형 판단 임계값 (pp)

# 인덱스 순서: 0=Straight, 1=Wave, 2=Natural
_BODY_TYPES: tuple[str, str, str] = ("Straight", "Wave", "Natural")


# ──────────────────────────────────────────
# 결과 데이터 클래스
# ──────────────────────────────────────────

@dataclass(slots=True, frozen=True)
class BodyAnalysisResult:
    """체형 분석 결과 (불변 객체)"""

    primary: str                  # 대표 체형
    secondary: Optional[str]      # 보조 체형 (없으면 None)
    scores: dict[str, float]      # {"Straight": x, "Wave": y, "Natural": z}

    @property
    def has_secondary(self) -> bool:
        return self.secondary is not None

    def __str__(self) -> str:
        body = f"대표 체형: {self.primary}"
        if self.secondary:
            body += f"  보조 체형: {self.secondary}"
        scores_str = "  |  ".join(
            f"{k}: {v:.1f}%" for k, v in self.scores.items()
        )
        return f"{body}  ({scores_str})"


# ──────────────────────────────────────────
# 핵심 분석 함수
# ──────────────────────────────────────────

def analyze_body_type(
    straight: float,
    wave: float,
    natural: float,
    *,
    threshold: float = DEFAULT_THRESHOLD,
    validate: bool = True,
) -> BodyAnalysisResult:
    """
    체형 분석 함수

    Args:
        straight  : Straight 체형 퍼센테이지 (0~100)
        wave      : Wave 체형 퍼센테이지 (0~100)
        natural   : Natural 체형 퍼센테이지 (0~100)
        threshold : 1위·2위 차이가 이 값(pp) 이하면 보조 체형 포함 (기본 10)
        validate  : 합계 100 검증 여부 (기본 True)

    Returns:
        BodyAnalysisResult

    Raises:
        ValueError: 퍼센테이지 합이 100에서 ±1 이상 벗어날 때 (validate=True)
    """
    if validate:
        total = straight + wave + natural
        if not (99.0 <= total <= 101.0):
            raise ValueError(
                f"퍼센테이지 합이 100이어야 합니다. 현재 합: {total:.2f}"
            )

    scores = (straight, wave, natural)

    # 고정 크기(3) → 정렬(O(n log n)) 대신 직접 비교로 O(1) 처리
    if straight >= wave and straight >= natural:
        p = 0
        s = 1 if wave >= natural else 2
    elif wave >= natural:
        p = 1
        s = 0 if straight >= natural else 2
    else:
        p = 2
        s = 0 if straight >= wave else 1

    secondary = _BODY_TYPES[s] if scores[p] - scores[s] <= threshold else None

    return BodyAnalysisResult(
        primary=_BODY_TYPES[p],
        secondary=secondary,
        scores={_BODY_TYPES[i]: scores[i] for i in range(3)},
    )


# ──────────────────────────────────────────
# 배치 분석 (여러 결과를 한 번에 처리)
# ──────────────────────────────────────────

def analyze_batch(
    records: list[tuple[float, float, float]],
    *,
    threshold: float = DEFAULT_THRESHOLD,
) -> list[BodyAnalysisResult]:
    """
    여러 체형 데이터를 한꺼번에 분석합니다.

    Args:
        records  : [(straight, wave, natural), ...] 리스트
        threshold: 보조 체형 판단 임계값

    Returns:
        BodyAnalysisResult 리스트
    """
    return [
        analyze_body_type(s, w, n, threshold=threshold)
        for s, w, n in records
    ]


# ──────────────────────────────────────────
# 동작 확인용 예시
# ──────────────────────────────────────────

if __name__ == "__main__":
    cases: list[tuple[float, float, float]] = [
        (70.0, 20.0, 10.0),   # Straight 압도적 → 단독
        (45.0, 40.0, 15.0),   # Straight + Wave (5pp 차 → 보조 표시)
        (34.0, 33.0, 33.0),   # 세 체형 거의 동일 (1위·2위 1pp 차 → 보조 표시)
        (10.0, 80.0, 10.0),   # Wave 압도적 → 단독
        (20.0, 45.0, 35.0),   # Wave + Natural (10pp 차 경계 → 보조 표시)
        (15.0, 14.0, 71.0),   # Natural 압도적 → 단독
    ]

    print("=" * 60)
    for s, w, n in cases:
        result = analyze_body_type(s, w, n)
        print(result)
    print("=" * 60)

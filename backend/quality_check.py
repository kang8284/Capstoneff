import cv2
import json
import sys
import numpy as np
import mediapipe as mp

# -----------------------------
# 이미지 경로
# -----------------------------
image_path = sys.argv[1]

img = cv2.imread(image_path)

if img is None:
    print(json.dumps({
        "valid": False,
        "reasons": ["이미지를 읽을 수 없습니다."]
    }, ensure_ascii=False))
    sys.exit()

reasons = []

height, width = img.shape[:2]

# -----------------------------
# 해상도 검사
# -----------------------------
#if width < 300 or height < 600:
    #reasons.append("사진 해상도가 너무 낮습니다.")

# -----------------------------
# 밝기 검사
# -----------------------------
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

brightness = np.mean(gray)

if brightness < 50:
    reasons.append("사진이 너무 어둡습니다.")

if brightness > 220:
    reasons.append("사진이 너무 밝습니다.")

# -----------------------------
# 흐림 검사
# -----------------------------
blur_score = cv2.Laplacian(
    gray,
    cv2.CV_64F
).var()

if blur_score < 60:
    reasons.append("사진이 흐립니다.")

# -----------------------------
# MediaPipe Pose 검사
# -----------------------------
mp_pose = mp.solutions.pose

try:
    with mp_pose.Pose(
        static_image_mode=True,
        model_complexity=1,
        min_detection_confidence=0.5
    ) as pose:

        rgb = cv2.cvtColor(
            img,
            cv2.COLOR_BGR2RGB
        )

        result = pose.process(rgb)

        # 사람 인식 실패
        if not result.pose_landmarks:
            reasons.append("사람을 인식할 수 없습니다.")

        else:
            landmarks = result.pose_landmarks.landmark

            required_points = [
                mp_pose.PoseLandmark.LEFT_SHOULDER,
                mp_pose.PoseLandmark.RIGHT_SHOULDER,
                mp_pose.PoseLandmark.LEFT_HIP,
                mp_pose.PoseLandmark.RIGHT_HIP,
                mp_pose.PoseLandmark.LEFT_KNEE,
                mp_pose.PoseLandmark.RIGHT_KNEE,
                mp_pose.PoseLandmark.LEFT_ANKLE,
                mp_pose.PoseLandmark.RIGHT_ANKLE,
            ]

            full_body_visible = True

            for point in required_points:

                visibility = landmarks[point].visibility

                if visibility < 0.5:
                    full_body_visible = False
                    break

            if not full_body_visible:
                reasons.append(
                    "전신이 모두 보이도록 촬영해주세요."
                )

            # -----------------------------
            # 정면 여부 검사 (어깨 높이 비교)
            # -----------------------------
            left_shoulder = landmarks[
                mp_pose.PoseLandmark.LEFT_SHOULDER
            ]

            right_shoulder = landmarks[
                mp_pose.PoseLandmark.RIGHT_SHOULDER
            ]

            shoulder_diff = abs(
                left_shoulder.y -
                right_shoulder.y
            )

            if shoulder_diff > 0.08:
                reasons.append(
                    "정면을 보고 똑바로 서서 촬영해주세요."
                )

except Exception as e:
    reasons.append(
        f"Pose 분석 실패: {str(e)}"
    )

# -----------------------------
# 결과 출력
# -----------------------------
result = {
    "valid": len(reasons) == 0,
    "reasons": reasons,
    "width": int(width),
    "height": int(height),
    "brightness": float(brightness),
    "blur": float(blur_score)
}

print(
    json.dumps(
        result,
        ensure_ascii=False
    )
)
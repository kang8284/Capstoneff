import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Camera() {
  const navigate = useNavigate();

  const [capturedImage, setCapturedImage] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [isCounting, setIsCounting] = useState(false);

  const handleCapture = () => {
    if (isCounting) return;

    setCapturedImage(null);
    setIsCounting(true);
    setCountdown(3);

    let count = 3;

    const timer = setInterval(() => {
      count -= 1;

      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(timer);
        setCountdown(null);
        setIsCounting(false);

        // 지금은 더미 이미지로 촬영 대체
        setCapturedImage("/images/sample-person.jpg");
      }
    }, 1000);
  };

  const handleResult = () => {
    navigate("/result", {
      state: {
        image: capturedImage,
      },
    });
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-emerald-200 via-violet-100 to-cyan-100 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 왼쪽: 촬영 화면 */}
        <div className="relative bg-white/50 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden flex items-center justify-center h-[500px]">
          <img
            src="/images/sample-person.jpg"
            alt="camera"
            className="h-full object-contain"
          />

          {/* 가이드 라인 */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
  <svg
    width="230"
    height="420"
    viewBox="0 0 220 420"
    fill="none"
    stroke="#22c55e"
    strokeWidth="8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="opacity-80 drop-shadow-[0_0_10px_#4ade80]"
  >
    {/* 머리 */}
    <circle cx="110" cy="45" r="34" />

    {/* 몸통 + 팔 + 다리 외곽선 */}
    <path
      d="
        M82 95
        C65 95 52 108 52 125
        L52 235
        C52 250 63 260 77 260
        C82 260 85 257 85 252
        L85 135

        L85 365
        C85 385 98 398 110 398
        C122 398 135 385 135 365
        L135 135

        L135 252
        C135 257 138 260 143 260
        C157 260 168 250 168 235
        L168 125
        C168 108 155 95 138 95
        Z
      "
    />

    {/* 다리 사이 구분선 */}
    <line x1="110" y1="235" x2="110" y2="385" />
  </svg>
</div>

          {/* 카운트다운 표시 */}
          {countdown && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="w-32 h-32 rounded-full bg-white/80 flex items-center justify-center shadow-2xl">
                <span className="text-6xl font-extrabold text-purple-500">
                  {countdown}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 오른쪽: 결과 미리보기 */}
        <div className="bg-white/50 backdrop-blur-md rounded-2xl shadow-lg p-4 flex flex-col justify-between h-[500px]">
          <div className="flex-1 flex items-center justify-center bg-white/60 rounded-xl overflow-hidden">
            {capturedImage ? (
              <img
                src={capturedImage}
                alt="result"
                className="h-full object-contain"
              />
            ) : (
              <p className="text-gray-400">
                {isCounting
                  ? "촬영 준비 중입니다..."
                  : "촬영된 이미지가 여기에 표시됩니다"}
              </p>
            )}
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleCapture}
              disabled={isCounting}
              className={`flex-1 h-12 rounded-full text-white font-bold shadow-md ${
                isCounting
                  ? "bg-gray-300"
                  : "bg-gradient-to-r from-purple-400 to-indigo-400"
              }`}
            >
              {isCounting ? "WAIT" : "CAPTURE"}
            </button>

            <button
              onClick={() => setCapturedImage(null)}
              disabled={isCounting}
              className="flex-1 h-12 rounded-full bg-gray-200 font-bold"
            >
              RETRY
            </button>

            <button
              onClick={handleResult}
              disabled={!capturedImage || isCounting}
              className={`flex-1 h-12 rounded-full font-bold text-white shadow-md ${
                capturedImage && !isCounting
                  ? "bg-gradient-to-r from-green-400 to-emerald-400"
                  : "bg-gray-300"
              }`}
            >
              RESULT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Camera;
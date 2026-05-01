import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Camera() {
  const navigate = useNavigate();

  const [capturedImage, setCapturedImage] = useState(null);

  const handleCapture = () => {
    // 지금은 더미 이미지로 대체
    setCapturedImage("/images/sample-person.png");
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

        {/* 🔵 왼쪽: 촬영 화면 */}
        <div className="relative bg-white/50 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden flex items-center justify-center h-[500px]">
          
          {/* 더미 이미지 */}
          <img
            src="/images/sample-person.png"
            alt="camera"
            className="h-full object-contain"
          />

          {/* 🟢 가이드 라인 */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[250px] h-[420px] border-4 border-green-400 rounded-[120px] opacity-70"></div>
          </div>

        </div>

        {/* 🟣 오른쪽: 결과 미리보기 */}
        <div className="bg-white/50 backdrop-blur-md rounded-2xl shadow-lg p-4 flex flex-col justify-between h-[500px]">

          {/* 결과 이미지 */}
          <div className="flex-1 flex items-center justify-center bg-white/60 rounded-xl overflow-hidden">
            {capturedImage ? (
              <img
                src={capturedImage}
                alt="result"
                className="h-full object-contain"
              />
            ) : (
              <p className="text-gray-400">촬영된 이미지가 여기에 표시됩니다</p>
            )}
          </div>

          {/* 버튼 영역 */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleCapture}
              className="flex-1 h-12 rounded-full bg-gradient-to-r from-purple-400 to-indigo-400 text-white font-bold shadow-md"
            >
              CAPTURE
            </button>

            <button
              onClick={() => setCapturedImage(null)}
              className="flex-1 h-12 rounded-full bg-gray-200 font-bold"
            >
              RETRY
            </button>

            <button
              onClick={handleResult}
              disabled={!capturedImage}
              className={`flex-1 h-12 rounded-full font-bold text-white shadow-md
                ${
                  capturedImage
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
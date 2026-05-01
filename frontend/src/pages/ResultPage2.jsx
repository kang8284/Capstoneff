import { useNavigate } from "react-router-dom";

const mockResult = {
  fittingImage: "/images/sample-fitting.png",
  outfits: [
    { id: 1, title: "코디 1", image: "/images/outfit1.png" },
    { id: 2, title: "코디 2", image: "/images/outfit2.png" },
    { id: 3, title: "코디 3", image: "/images/outfit3.png" },
  ],
  bodyComment:
    "분석 결과 상체와 하체의 균형이 좋은 체형입니다. 전체적으로 깔끔한 실루엣의 옷이 잘 어울립니다.",
  outfitComment:
    "너무 타이트한 핏보다는 자연스럽게 떨어지는 핏을 추천합니다. 상의와 하의의 색상 대비를 활용하면 체형 비율이 더 좋아 보입니다.",
};

function ResultPage2() {
  const navigate = useNavigate();

  const handleRestart = () => {
    navigate("/");
  };

  const handleBack = () => {
    navigate("/camera");
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-emerald-200 via-violet-100 to-cyan-100 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute left-[-60px] bottom-[-40px] w-52 h-52 rounded-full bg-emerald-300/40 blur-xl" />
      <div className="absolute right-[-50px] top-[-50px] w-56 h-56 rounded-full bg-purple-300/40 blur-xl" />

      <div className="w-full max-w-6xl z-10">
        <h1 className="text-3xl font-extrabold text-center text-gray-900 mb-6">
          AI 체형 분석 결과
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-6">
          {/* 왼쪽: 가상피팅 */}
          <div className="rounded-3xl bg-white/60 backdrop-blur-md shadow-xl p-5">
            <h2 className="text-xl font-extrabold text-gray-800 mb-4">
              BEST 가상 피팅
            </h2>

            <div className="h-[480px] rounded-2xl bg-white/70 flex items-center justify-center overflow-hidden">
              <img
                src={mockResult.fittingImage}
                alt="가상피팅 결과"
                className="h-full object-contain"
              />
            </div>
          </div>

          {/* 오른쪽: 추가 코디 3개 */}
          <div className="rounded-3xl bg-white/60 backdrop-blur-md shadow-xl p-5">
            <h2 className="text-xl font-extrabold text-gray-800 mb-4">
              추가 추천 코디
            </h2>

            <div className="grid grid-cols-1 gap-4">
              {mockResult.outfits.map((outfit) => (
                <div
                  key={outfit.id}
                  className="h-[145px] rounded-2xl bg-white/70 shadow-md flex items-center gap-4 p-4"
                >
                  <div className="w-32 h-full rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden">
                    <img
                      src={outfit.image}
                      alt={outfit.title}
                      className="h-full object-contain"
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-extrabold text-gray-800">
                      {outfit.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      체형과 선택한 스타일을 반영한 추천 코디입니다.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 아래 코멘트 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="rounded-3xl bg-white/65 backdrop-blur-md shadow-xl p-6">
            <h2 className="text-lg font-extrabold text-gray-800 mb-3">
              체형 분석 코멘트
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {mockResult.bodyComment}
            </p>
          </div>

          <div className="rounded-3xl bg-white/65 backdrop-blur-md shadow-xl p-6">
            <h2 className="text-lg font-extrabold text-gray-800 mb-3">
              코디 추천 코멘트
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {mockResult.outfitComment}
            </p>
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={handleBack}
            className="w-40 h-12 rounded-full bg-white/70 text-gray-700 font-extrabold shadow-md hover:scale-105 transition"
          >
            되돌아가기
          </button>

          <button
            onClick={handleRestart}
            className="w-40 h-12 rounded-full bg-gradient-to-r from-purple-400 to-indigo-400 text-white font-extrabold shadow-md hover:scale-105 transition"
          >
            종료하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResultPage2;
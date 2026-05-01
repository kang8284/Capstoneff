import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const data = location.state;
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!data) return;

    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/recommend', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            gender: data.gender,
            style: data.style
          })
        });

        const json = await res.json();
        setResult(json);

      } catch (err) {
        console.error('추천 API 오류:', err);
      }
    };

    fetchData();
  }, [data]);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white p-6 rounded-xl shadow w-full max-w-sm">
          <h2 className="mb-4 text-lg font-semibold text-center">
            잘못된 접근입니다
          </h2>
          <button
            onClick={() => navigate('/')}
            className="w-full py-2 bg-gray-800 text-white rounded-lg"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-100 to-indigo-100 px-4 sm:px-6 py-6">

      <div className="max-w-4xl mx-auto space-y-6">

        {/* ===== 상단 정보 카드 ===== */}
        <div className="bg-white/80 backdrop-blur p-5 sm:p-6 rounded-xl shadow border border-gray-200">
          <h1 className="text-xl sm:text-2xl font-bold mb-3 text-gray-800">
            추천 결과
          </h1>

          <p className="text-gray-600 text-sm sm:text-base">
            성별: {data.gender}
          </p>
          <p className="text-gray-600 text-sm sm:text-base">
            스타일: {data.style}
          </p>
        </div>

        {/* ===== 로딩 ===== */}
        {!result ? (
          <div className="bg-white/80 p-6 rounded-xl shadow text-center animate-pulse">
            추천 생성 중...
          </div>
        ) : (
          <>
            {/* ===== 체형 카드 ===== */}
            <div className="bg-white/80 backdrop-blur p-5 sm:p-6 rounded-xl shadow border border-gray-200">
              <h2 className="text-base sm:text-lg font-semibold text-indigo-500">
                체형 분석 결과
              </h2>
              <p className="text-lg sm:text-xl font-bold mt-2">
                {result.bodyType}
              </p>
            </div>

            {/* ===== 의류 섹션 ===== */}
            <ClothSection title="상의" items={result.top} color="blue" />
            <ClothSection title="하의" items={result.bottom} color="green" />
            <ClothSection title="아우터" items={result.jacket} color="purple" />
          </>
        )}

        {/* ===== 버튼 ===== */}
        <button
          onClick={() => navigate('/')}
          className="w-full py-3 rounded-xl font-semibold text-white 
                     bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500
                     hover:shadow-xl active:scale-95 transition"
        >
          다시 입력
        </button>

      </div>
    </div>
  );
}

/* ================= 공통 카드 섹션 ================= */

function ClothSection({ title, items, color }) {
  const colorMap = {
    blue: "text-blue-500",
    green: "text-green-500",
    purple: "text-purple-500"
  };

  return (
    <div className="bg-white/80 backdrop-blur p-5 sm:p-6 rounded-xl shadow border border-gray-200">
      <h3 className={`text-base sm:text-lg font-semibold mb-4 ${colorMap[color]}`}>
        {title}
      </h3>

      {/* 🔥 반응형 grid 핵심 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {items?.map((item, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-sm p-3 hover:shadow-lg transition"
          >
            <img
              src={item.imageUrl}
              className="w-full h-40 sm:h-[150px] object-cover rounded-lg"
            />
            <p className="mt-2 text-center text-sm font-medium">
              {item.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ResultPage;
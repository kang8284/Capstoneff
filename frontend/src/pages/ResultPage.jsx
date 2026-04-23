import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const data = location.state;
  const [result, setResult] = useState(null);

  // 🔥 1. useEffect는 항상 먼저
  useEffect(() => {
    if (!data) return; // 🔥 안전장치

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

  // 🔥 2. 조건 return은 여기 (hook 이후)
  if (!data) {
    return (
      <div>
        <h2>잘못된 접근입니다</h2>
        <button onClick={() => navigate('/')}>돌아가기</button>
      </div>
    );
  }

  return (
    <div>
      <h1>추천 결과</h1>

      <p>성별: {data.gender}</p>
      <p>스타일: {data.style}</p>

      {/* 🔥 로딩 */}
      {!result ? (
        <p>추천 로딩중...</p>
      ) : (
        <>
          <h2>랜덤 체형: {result.bodyType}</h2>

          {/* ================= 상의 ================= */}
          <h3>상의</h3>
          <div>
            {result.top?.map((item, i) => (
              <div key={i} style={{ marginBottom: '10px' }}>
                <img src={item.imageUrl} width="120" />
                <p>{item.name}</p>
              </div>
            ))}
          </div>

          {/* ================= 하의 ================= */}
          <h3>하의</h3>
          <div>
            {result.bottom?.map((item, i) => (
              <div key={i} style={{ marginBottom: '10px' }}>
                <img src={item.imageUrl} width="120" />
                <p>{item.name}</p>
              </div>
            ))}
          </div>

          {/* ================= 아우터 ================= */}
          <h3>아우터</h3>
          <div>
            {result.jacket?.map((item, i) => (
              <div key={i} style={{ marginBottom: '10px' }}>
                <img src={item.imageUrl} width="120" />
                <p>{item.name}</p>
              </div>
            ))}
          </div>
        </>
      )}

      <br />
      <button onClick={() => navigate('/')}>다시 입력</button>
    </div>
  );
}

export default ResultPage;
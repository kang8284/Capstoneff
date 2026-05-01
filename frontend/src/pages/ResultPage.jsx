import { useLocation, useNavigate } from 'react-router-dom';

const KR = { Straight: '스트레이트', Wave: '웨이브', Natural: '내추럴' };
const THRESHOLD = 10; // 보조 체형 표시 임계값 (pp)

function ResultPage() {
  const { state } = useLocation();
  const navigate  = useNavigate();

  if (!state?.userData) {
    return (
      <div>
        <h2>잘못된 접근입니다</h2>
        <button onClick={() => navigate('/')}>돌아가기</button>
      </div>
    );
  }

  const { userData, scores, primary, photo, recommendation } = state;

  // 보조 체형 계산
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const secondary = scores[primary] - sorted[1][1] <= THRESHOLD ? sorted[1][0] : null;

  return (
    <div>
      <h1>분석 결과</h1>

      {/* 촬영 사진 */}
      {photo && (
        <img src={photo} width={240} style={{ borderRadius: 8 }} alt="촬영 사진" />
      )}

      {/* 입력 정보 */}
      <p>성별: {userData.gender} | 스타일: {userData.style}</p>
      <p>키: {userData.height}cm | 몸무게: {userData.weight}kg</p>

      {/* 체형 분석 결과 */}
      <h2>
        체형: {KR[primary]}
        {secondary && ` + ${KR[secondary]}`}
      </h2>
      <p>
        스트레이트 {scores.Straight}% &nbsp;|&nbsp;
        웨이브 {scores.Wave}% &nbsp;|&nbsp;
        내추럴 {scores.Natural}%
      </p>

      {/* 의상 추천 */}
      {recommendation ? (
        <>
          <h2>추천 의상</h2>

          <h3>상의</h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {recommendation.top?.map((item, i) => (
              <div key={i}>
                {item.imageUrl && <img src={item.imageUrl} width={120} alt={item.name} />}
                <p>{item.name}</p>
              </div>
            ))}
          </div>

          <h3>하의</h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {recommendation.bottom?.map((item, i) => (
              <div key={i}>
                {item.imageUrl && <img src={item.imageUrl} width={120} alt={item.name} />}
                <p>{item.name}</p>
              </div>
            ))}
          </div>

          <h3>아우터</h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {recommendation.jacket?.map((item, i) => (
              <div key={i}>
                {item.imageUrl && <img src={item.imageUrl} width={120} alt={item.name} />}
                <p>{item.name}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p>추천 데이터를 불러오지 못했습니다.</p>
      )}

      <br />
      <button onClick={() => navigate('/')}>다시 시작</button>
    </div>
  );
}

export default ResultPage;

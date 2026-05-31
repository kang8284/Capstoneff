import { useLocation, useNavigate } from 'react-router-dom';

const KR        = { Straight: '스트레이트', Wave: '웨이브', Natural: '내추럴' };
const THRESHOLD = 10;

function ScoreBar({ label, value, color }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 3 }}>
        <span>{label}</span>
        <span style={{ fontWeight: 'bold' }}>{value}%</span>
      </div>
      <div style={{ background: '#eee', borderRadius: 4, height: 10, overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, background: color, height: '100%', borderRadius: 4, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  );
}

function ResultPage() {
  const { state } = useLocation();
  const navigate  = useNavigate();

  if (!state?.userData) {
    return (
      <div>
        <h2>잘못된 접근입니다</h2>
        <button onClick={() => navigate('/body-input')}>돌아가기</button>
      </div>
    );
  }

  const { userData, scores, primary, photo, overlayPhoto, recommendation } = state;

  const sorted    = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const secondary = scores[primary] - sorted[1][1] <= THRESHOLD ? sorted[1][0] : null;

  const displayPhoto = overlayPhoto ?? photo;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '20px' }}>
      <h1>분석 결과</h1>

      {/* 촬영 사진 (랜드마크 오버레이 포함) */}
      {displayPhoto && (
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <img src={displayPhoto} style={{ maxWidth: '100%', width: 320, borderRadius: 8 }} alt="분석 사진" />
          {overlayPhoto && (
            <p style={{ fontSize: 11, color: '#888', margin: '4px 0 0' }}>
              ↑ 랜드마크·세그멘테이션 오버레이
            </p>
          )}
        </div>
      )}

      {/* 입력 정보 */}
      <p>성별: {userData.gender} | 스타일: {userData.style}</p>
      <p>키: {userData.height}cm | 몸무게: {userData.weight}kg</p>

      {/* 체형 분석 결과 */}
      <h2>
        체형: {KR[primary]}
        {secondary && ` + ${KR[secondary]}`}
      </h2>

      <div style={{ background: '#f8f8f8', borderRadius: 8, padding: '16px 20px', marginBottom: 20 }}>
        <ScoreBar label="스트레이트" value={scores.Straight} color="#4caf50" />
        <ScoreBar label="웨이브"     value={scores.Wave}     color="#2196f3" />
        <ScoreBar label="내추럴"     value={scores.Natural}  color="#ff9800" />
      </div>

      {/* 의상 추천 */}
      {recommendation ? (
        <>
          <h2>추천 의상</h2>

          <h3>상의</h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {recommendation.top?.map((item, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                {item.imageUrl && <img src={item.imageUrl} width={120} alt={item.name} style={{ borderRadius: 6 }} />}
                <p style={{ fontSize: 13, margin: '4px 0 0' }}>{item.name}</p>
              </div>
            ))}
          </div>

          <h3>하의</h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {recommendation.bottom?.map((item, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                {item.imageUrl && <img src={item.imageUrl} width={120} alt={item.name} style={{ borderRadius: 6 }} />}
                <p style={{ fontSize: 13, margin: '4px 0 0' }}>{item.name}</p>
              </div>
            ))}
          </div>

          <h3>아우터</h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {recommendation.jacket?.map((item, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                {item.imageUrl && <img src={item.imageUrl} width={120} alt={item.name} style={{ borderRadius: 6 }} />}
                <p style={{ fontSize: 13, margin: '4px 0 0' }}>{item.name}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p style={{ color: '#999' }}>추천 데이터를 불러오지 못했습니다.</p>
      )}

      <br />
      <button onClick={() => navigate('/body-input')}>다시 시작</button>
    </div>
  );
}

export default ResultPage;

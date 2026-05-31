import { useEffect, useRef, useState } from 'react';
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

/* 피팅 결과 폴링 훅 */
function useFittingPoll(jobId) {
  const [fittingData, setFittingData] = useState(null);
  const pollRef = useRef(null);

  useEffect(() => {
    if (!jobId) return;

    const poll = async () => {
      try {
        const res  = await fetch(`http://localhost:3000/api/fitting/${jobId}`);
        const data = await res.json();
        setFittingData(data);
        if (data.status === 'done' || data.status === 'failed') {
          clearInterval(pollRef.current);
        }
      } catch {
        // 네트워크 오류 무시
      }
    };

    poll();
    pollRef.current = setInterval(poll, 3000);
    return () => clearInterval(pollRef.current);
  }, [jobId]);

  return fittingData;
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

  const {
    userData, scores, primary, photo, overlayPhoto, recommendation,
    fittingJobId, fittingOutfitName, fittingOutfitImg,
  } = state;

  const fittingData = useFittingPoll(fittingJobId);

  const sorted    = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const secondary = scores[primary] - sorted[1][1] <= THRESHOLD ? sorted[1][0] : null;
  const displayPhoto = overlayPhoto ?? photo;

  const fittingDone   = fittingData?.status === 'done';
  const fittingFailed = fittingData?.status === 'failed';
  const fittingImg    = fittingData?.resultUrl;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px' }}>
      <h1>분석 결과</h1>

      {/* ── 사진 영역: 좌(랜드마크) + 우(가상피팅) ── */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 24, alignItems: 'flex-start' }}>

        {/* 왼쪽: 랜드마크 오버레이 */}
        <div style={{ flex: 1, textAlign: 'center' }}>
          {displayPhoto && (
            <img
              src={displayPhoto}
              style={{ width: '100%', maxWidth: 320, borderRadius: 8, display: 'block', margin: '0 auto' }}
              alt="체형 분석 사진"
            />
          )}
          <p style={{ fontSize: 11, color: '#888', margin: '4px 0 0' }}>
            {overlayPhoto ? '랜드마크 오버레이' : '촬영 사진'}
          </p>
        </div>

        {/* 오른쪽: 가상 피팅 */}
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{
            width: '100%', maxWidth: 320, margin: '0 auto',
            minHeight: 280,
            borderRadius: 8,
            border: '1px solid #ddd',
            background: '#f5f5f5',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}>
            {!fittingJobId ? (
              <p style={{ color: '#aaa', fontSize: 13, padding: 20 }}>피팅 데이터 없음</p>
            ) : fittingFailed ? (
              <p style={{ color: '#e53e3e', fontSize: 13, padding: 20 }}>피팅 실패</p>
            ) : fittingDone && fittingImg ? (
              <img
                src={fittingImg}
                style={{ width: '100%', borderRadius: 8, display: 'block' }}
                alt="가상 피팅 결과"
              />
            ) : (
              /* 로딩 중 */
              <div style={{ padding: 20 }}>
                {/* 의상 미리보기 */}
                {fittingOutfitImg && (
                  <img
                    src={fittingOutfitImg}
                    style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 6, marginBottom: 12 }}
                    alt="의상"
                  />
                )}
                <div style={{ fontSize: 13, color: '#666' }}>
                  {fittingData?.currentStep ?? '피팅 시작 중...'}
                </div>
                <div style={{ marginTop: 8 }}>
                  <span style={{
                    display: 'inline-block',
                    width: 24, height: 24,
                    border: '3px solid #ccc',
                    borderTopColor: '#555',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }} />
                </div>
              </div>
            )}
          </div>
          <p style={{ fontSize: 11, color: '#888', margin: '4px 0 0' }}>
            {fittingDone
              ? `가상 피팅 — ${fittingOutfitName ?? '테스트 룩'}${fittingData?.mock ? ' (mock)' : ''}`
              : fittingJobId
                ? '가상 피팅 처리중...'
                : ''}
          </p>
        </div>
      </div>

      {/* CSS 애니메이션 */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

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

import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const IS_DEV = import.meta.env.DEV;

/* ──────────────────────────────────────────
   체형 분석 유틸
────────────────────────────────────────── */
function dist(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function gaussian(x, mean, std) {
  return Math.exp(-0.5 * ((x - mean) / std) ** 2);
}

function calcBodyTypeScores(landmarks) {
  const shoulderW = dist(landmarks[11], landmarks[12]);
  const hipW      = dist(landmarks[23], landmarks[24]);
  if (hipW < 0.001) return { Straight: 34, Wave: 33, Natural: 33 };

  const shr = shoulderW / hipW;

  const s = gaussian(shr, 1.00, 0.10);
  const n = gaussian(shr, 1.20, 0.12);
  const w = gaussian(shr, 0.85, 0.10);
  const total = s + n + w;

  const straightPct = Math.round((s / total) * 100);
  const naturalPct  = Math.round((n / total) * 100);
  const wavePct     = 100 - straightPct - naturalPct;

  return { Straight: straightPct, Wave: wavePct, Natural: naturalPct };
}

const KR = { Straight: '스트레이트', Wave: '웨이브', Natural: '내추럴' };

/* ──────────────────────────────────────────
   개발자용 스켈레톤 오버레이 드로잉
   빨간 점: 측정 기준 (어깨·힙)
   하늘색 점: 나머지 랜드마크
   초록 선: 스켈레톤
   노란 점선: 어깨 너비 / 힙 너비 측정선
────────────────────────────────────────── */
const CONNECTIONS = [
  [11, 12],            // 어깨
  [11, 13], [13, 15],  // 왼쪽 팔
  [12, 14], [14, 16],  // 오른쪽 팔
  [11, 23], [12, 24],  // 몸통 옆선
  [23, 24],            // 힙
  [23, 25], [25, 27],  // 왼쪽 다리
  [24, 26], [26, 28],  // 오른쪽 다리
];
const KEY_POINTS = new Set([11, 12, 23, 24]);

function drawDebugOverlay(canvas, img, landmarks) {
  const W = img.naturalWidth || img.width;
  const H = img.naturalHeight || img.height;
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  ctx.drawImage(img, 0, 0);

  // 스켈레톤 연결선
  ctx.strokeStyle = 'rgba(0,255,80,0.85)';
  ctx.lineWidth   = Math.max(2, W * 0.003);
  for (const [a, b] of CONNECTIONS) {
    const la = landmarks[a], lb = landmarks[b];
    ctx.beginPath();
    ctx.moveTo(la.x * W, la.y * H);
    ctx.lineTo(lb.x * W, lb.y * H);
    ctx.stroke();
  }

  // 랜드마크 점
  for (let i = 0; i < landmarks.length; i++) {
    const lm = landmarks[i];
    const isKey = KEY_POINTS.has(i);
    ctx.fillStyle = isKey ? 'rgba(255,40,40,0.95)' : 'rgba(0,210,255,0.85)';
    ctx.beginPath();
    ctx.arc(lm.x * W, lm.y * H, isKey ? W * 0.01 : W * 0.006, 0, Math.PI * 2);
    ctx.fill();
  }

  // 어깨 측정선 (노란 점선)
  ctx.strokeStyle = 'rgba(255,230,0,1)';
  ctx.lineWidth   = Math.max(2, W * 0.004);
  ctx.setLineDash([8, 6]);
  const ls = landmarks[11], rs = landmarks[12];
  ctx.beginPath();
  ctx.moveTo(ls.x * W, ls.y * H);
  ctx.lineTo(rs.x * W, rs.y * H);
  ctx.stroke();

  // 힙 측정선 (분홍 점선)
  ctx.strokeStyle = 'rgba(255,100,200,1)';
  const lh = landmarks[23], rh = landmarks[24];
  ctx.beginPath();
  ctx.moveTo(lh.x * W, lh.y * H);
  ctx.lineTo(rh.x * W, rh.y * H);
  ctx.stroke();

  ctx.setLineDash([]);

  // 레이블
  const fs = Math.max(14, W * 0.022);
  ctx.font      = `bold ${fs}px monospace`;
  ctx.fillStyle = 'rgba(255,230,0,1)';
  ctx.fillText('← 어깨 →', ls.x * W + 6, ls.y * H - 8);
  ctx.fillStyle = 'rgba(255,100,200,1)';
  ctx.fillText('← 힙 →', lh.x * W + 6, lh.y * H + fs + 4);
}

/* ──────────────────────────────────────────
   컴포넌트
────────────────────────────────────────── */
function AnalyzingPage() {
  const { state } = useLocation();
  const navigate  = useNavigate();
  const ran        = useRef(false);
  const debugCanvas = useRef(null);
  const [devLog, setDevLog] = useState([]);

  const log = (msg) => {
    const ts = new Date().toLocaleTimeString('ko-KR', { hour12: false });
    setDevLog(prev => [...prev, `[${ts}] ${msg}`]);
  };

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    if (!state?.photo || !state?.userData) { navigate('/body-input'); return; }
    runAnalysis(state.userData, state.photo);
  }, []);

  async function runAnalysis(userData, photo) {
    try {
      if (IS_DEV) log('MediaPipe 모델 로딩 시작...');

      const { PoseLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');

      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );
      if (IS_DEV) log('WASM FilesetResolver 로드 완료');

      const landmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
          delegate: 'GPU',
        },
        runningMode: 'IMAGE',
        numPoses: 1,
      });
      if (IS_DEV) log('PoseLandmarker 모델 로드 완료');

      // 이미지 로드
      const img = new Image();
      img.src = photo;
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });
      if (IS_DEV) log(`이미지 로드 완료 (${img.naturalWidth}×${img.naturalHeight})`);

      // 포즈 감지
      const result = landmarker.detect(img);
      landmarker.close();

      const detected = result.landmarks?.length > 0;
      if (IS_DEV) log(detected
        ? `포즈 감지 성공 — 랜드마크 ${result.landmarks[0].length}개 검출`
        : '포즈 감지 실패 — fallback 값 사용');

      // 스켈레톤 오버레이 그리기
      if (IS_DEV && detected && debugCanvas.current) {
        drawDebugOverlay(debugCanvas.current, img, result.landmarks[0]);
        log('스켈레톤 오버레이 렌더링 완료');
      }

      // 체형 점수 계산
      const scores = detected
        ? calcBodyTypeScores(result.landmarks[0])
        : { Straight: 34, Wave: 33, Natural: 33 };

      const primary = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];

      if (IS_DEV) {
        const shr = detected
          ? (dist(result.landmarks[0][11], result.landmarks[0][12]) /
             dist(result.landmarks[0][23], result.landmarks[0][24])).toFixed(3)
          : 'N/A';
        log(`어깨÷힙 비율(SHR): ${shr}`);
        log(`Straight ${scores.Straight}%  Wave ${scores.Wave}%  Natural ${scores.Natural}%`);
        log(`대표 체형: ${primary} (${KR[primary]})`);
      }

      // 추천 API 호출
      if (IS_DEV) log('추천 API 호출중...');
      const recRes = await fetch('http://localhost:3000/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gender:   userData.gender,
          style:    userData.style,
          bodyType: KR[primary],
        }),
      });
      const recommendation = await recRes.json();
      if (IS_DEV) log('추천 API 응답 완료 → 결과 페이지로 이동');

      navigate('/body-result', {
        state: { userData, scores, primary, photo, recommendation },
      });

    } catch (err) {
      console.error('분석 실패:', err);
      if (IS_DEV) log(`오류 발생: ${err.message}`);
      navigate('/body-result', {
        state: {
          userData,
          scores:   { Straight: 34, Wave: 33, Natural: 33 },
          primary:  'Straight',
          photo,
          recommendation: null,
        },
      });
    }
  }

  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <h1>분석중...</h1>
      <p>체형을 분석하고 있습니다. 잠시만 기다려 주세요.</p>

      {/* ── 개발자 전용 디버그 패널 (npm run dev 환경에서만 표시) ── */}
      {IS_DEV && (
        <div style={{
          marginTop: 40,
          textAlign: 'left',
          background: '#0d0d0d',
          border: '1px solid #333',
          borderRadius: 8,
          padding: '16px 20px',
          maxWidth: 700,
          marginInline: 'auto',
        }}>
          <p style={{ color: '#888', fontSize: 11, margin: '0 0 8px' }}>
            🛠 DEV ONLY — 프로덕션 빌드에서는 표시되지 않음
          </p>

          {/* 로그 */}
          <div style={{
            fontFamily: 'monospace',
            fontSize: 13,
            lineHeight: 1.7,
            color: '#00e676',
            minHeight: 40,
          }}>
            {devLog.length === 0
              ? <span style={{ color: '#555' }}>대기중...</span>
              : devLog.map((line, i) => <div key={i}>{line}</div>)
            }
          </div>

          {/* 스켈레톤 오버레이 캔버스 */}
          <canvas
            ref={debugCanvas}
            style={{
              marginTop: 16,
              maxWidth: '100%',
              borderRadius: 6,
              border: '1px solid #444',
              display: 'block',
            }}
          />
          <p style={{ color: '#555', fontSize: 11, marginTop: 6 }}>
            빨간점: 어깨·힙 측정 기준  /  노란선: 어깨 너비  /  분홍선: 힙 너비
          </p>
        </div>
      )}
    </div>
  );
}

export default AnalyzingPage;

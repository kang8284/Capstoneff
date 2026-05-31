import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const IS_DEV = import.meta.env.DEV;

/* ──────────────────────────────────────────
   성별별 Gaussian 파라미터 [mean, std]
────────────────────────────────────────── */
const SHR_PARAMS = {
  여자: { Straight: [0.97, 0.09], Natural: [1.09, 0.10], Wave: [0.84, 0.08] },
  남자: { Straight: [1.12, 0.09], Natural: [1.28, 0.11], Wave: [0.97, 0.08] },
};
const HEIGHT_PARAMS = {
  여자: { Straight: [165, 5], Natural: [169, 6], Wave: [161, 5] },
  남자: { Straight: [175, 5], Natural: [179, 6], Wave: [172, 5] },
};
const RATIO_PARAMS = {
  여자: { Straight: [0.65, 0.07], Natural: [0.72, 0.08], Wave: [0.60, 0.06] },
  남자: { Straight: [0.68, 0.07], Natural: [0.75, 0.08], Wave: [0.63, 0.06] },
};
const TYPES = ['Straight', 'Wave', 'Natural'];
const KR    = { Straight: '스트레이트', Wave: '웨이브', Natural: '내추럴' };

function gaussian(x, mean, std) {
  return Math.exp(-0.5 * ((x - mean) / std) ** 2);
}

function dist(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

/* ──────────────────────────────────────────
   세그멘테이션 마스크에서 너비 측정
   bustLevel: 0~1 (어깨에서 힙까지의 비율)
────────────────────────────────────────── */
function measureWidthAtY(maskArr, maskW, maskH, centerY, scanLines = 9) {
  const half = Math.floor(scanLines / 2);
  const widths = [];
  for (let dy = -half; dy <= half; dy++) {
    const y = centerY + dy;
    if (y < 0 || y >= maskH) continue;
    let left = -1, right = -1;
    for (let x = 0; x < maskW; x++) {
      if (maskArr[y * maskW + x] > 0.5) { if (left < 0) left = x; right = x; }
    }
    if (left >= 0 && right > left) widths.push((right - left) / maskW);
  }
  return widths.length ? widths.reduce((a, b) => a + b, 0) / widths.length : null;
}

/* ──────────────────────────────────────────
   단일 프레임 분석
────────────────────────────────────────── */
async function analyzeFrame(img, landmarker, segmenter) {
  const lmResult  = landmarker.detect(img);
  const segResult = segmenter.segment(img);

  const landmarks = lmResult.landmarks?.[0] ?? null;
  let segData = null;

  // 세그멘테이션 마스크
  if (segResult.confidenceMasks?.length > 0) {
    const cm = segResult.confidenceMasks[0];
    const arr = cm.getAsFloat32Array();
    segData = { arr, width: cm.width, height: cm.height };
    cm.close();
  }

  if (!landmarks) return { landmarks: null, shr: null, lmSHR: null, segSHR: null, bodyRatio: null, segData, visMap: {} };

  // 가시성 체크
  const visMap = {};
  for (const idx of [11, 12, 23, 24, 27, 28]) {
    visMap[idx] = landmarks[idx]?.visibility ?? 0;
  }
  const coreVisible = [11, 12, 23, 24].every(i => visMap[i] >= 0.5);
  if (!coreVisible) return { landmarks, shr: null, lmSHR: null, segSHR: null, bodyRatio: null, segData, visMap };

  // LM 기반 SHR
  const lmSHR = dist(landmarks[11], landmarks[12]) / dist(landmarks[23], landmarks[24]);

  // 세그멘테이션 기반 SHR (버스트 레벨 10-22%)
  let segSHR = null;
  if (segData) {
    const { arr, width: mW, height: mH } = segData;
    const shoulderY = (landmarks[11].y + landmarks[12].y) / 2;
    const hipY      = (landmarks[23].y + landmarks[24].y) / 2;
    const range     = hipY - shoulderY;

    const bustCY = Math.round((shoulderY + range * 0.15) * mH);
    const hipCY  = Math.round((hipY - range * 0.05)      * mH);

    const bustW = measureWidthAtY(arr, mW, mH, bustCY);
    const hipW  = measureWidthAtY(arr, mW, mH, hipCY);

    if (bustW && hipW && bustW > 0.02 && hipW > 0.02) {
      segSHR = bustW / hipW;
    }
  }

  const shr = segSHR ?? lmSHR;

  // 상하체 비율
  let bodyRatio = null;
  if (visMap[27] >= 0.3 && visMap[28] >= 0.3) {
    const shoulderY = (landmarks[11].y + landmarks[12].y) / 2;
    const hipY      = (landmarks[23].y + landmarks[24].y) / 2;
    const ankleY    = (landmarks[27].y + landmarks[28].y) / 2;
    const upper = hipY - shoulderY;
    const lower = ankleY - hipY;
    if (lower > 0.01) bodyRatio = upper / lower;
  }

  return { landmarks, shr, lmSHR, segSHR, bodyRatio, segData, visMap, usingSeg: segSHR !== null };
}

/* ──────────────────────────────────────────
   가중 점수 계산
────────────────────────────────────────── */
function computeScores({ shr, height, bodyRatio, serverSHR, gender }) {
  const g = (SHR_PARAMS[gender] ? gender : '여자');
  const indicators = [];

  if (shr != null)       indicators.push({ label: 'SHR',    vals: TYPES.map(t => gaussian(shr,       ...SHR_PARAMS[g][t])),   w: 0.40 });
  if (serverSHR != null) indicators.push({ label: 'Server', vals: TYPES.map(t => gaussian(serverSHR, ...SHR_PARAMS[g][t])),   w: 0.20 });
  if (height)            indicators.push({ label: 'Height', vals: TYPES.map(t => gaussian(height,    ...HEIGHT_PARAMS[g][t])), w: 0.20 });
  if (bodyRatio != null) indicators.push({ label: 'Ratio',  vals: TYPES.map(t => gaussian(bodyRatio, ...RATIO_PARAMS[g][t])), w: 0.20 });

  if (!indicators.length) return { Straight: 34, Wave: 33, Natural: 33 };

  const totalW = indicators.reduce((s, i) => s + i.w, 0);
  const raw = TYPES.map((_, ti) =>
    indicators.reduce((s, ind) => s + ind.vals[ti] * (ind.w / totalW), 0)
  );
  const totalG = raw.reduce((a, b) => a + b, 0);
  const pcts = raw.map(v => Math.round(v / totalG * 100));
  pcts[2] = 100 - pcts[0] - pcts[1];

  return Object.fromEntries(TYPES.map((t, i) => [t, pcts[i]]));
}

/* ──────────────────────────────────────────
   서버 분석 (FastAPI)
────────────────────────────────────────── */
async function fetchServerAnalysis(photo, gender, height, weight) {
  const base64 = photo.split(',')[1];
  const res = await fetch('http://localhost:8000/api/analyze-body', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64, gender, height: Number(height), weight: Number(weight) }),
  });
  if (!res.ok) throw new Error(`Server ${res.status}`);
  return await res.json();
}

/* ──────────────────────────────────────────
   스켈레톤 + 디버그 오버레이 드로잉
────────────────────────────────────────── */
const CONNECTIONS = [
  [11, 12],
  [11, 13], [13, 15],
  [12, 14], [14, 16],
  [11, 23], [12, 24],
  [23, 24],
  [23, 25], [25, 27],
  [24, 26], [26, 28],
];
const KEY_POINTS = new Set([11, 12, 23, 24]);

function drawDebugOverlay(canvas, img, landmarks, segData, infoPanel) {
  const W = img.naturalWidth || img.width;
  const H = img.naturalHeight || img.height;
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);

  // 세그멘테이션 마스크 (반투명 보라)
  if (segData) {
    const { arr, width: mW, height: mH } = segData;
    const tmp = document.createElement('canvas');
    tmp.width = mW; tmp.height = mH;
    const tctx = tmp.getContext('2d');
    const id = tctx.createImageData(mW, mH);
    for (let i = 0; i < arr.length; i++) {
      const conf = arr[i];
      id.data[i * 4]     = 120;
      id.data[i * 4 + 1] = 80;
      id.data[i * 4 + 2] = 220;
      id.data[i * 4 + 3] = conf > 0.5 ? Math.round(conf * 80) : 0;
    }
    tctx.putImageData(id, 0, 0);
    ctx.drawImage(tmp, 0, 0, W, H);
  }

  // 스켈레톤 연결선
  ctx.strokeStyle = 'rgba(0,255,80,0.85)';
  ctx.lineWidth   = Math.max(2, W * 0.003);
  for (const [a, b] of CONNECTIONS) {
    const la = landmarks[a], lb = landmarks[b];
    if (!la || !lb) continue;
    ctx.beginPath();
    ctx.moveTo(la.x * W, la.y * H);
    ctx.lineTo(lb.x * W, lb.y * H);
    ctx.stroke();
  }

  // 랜드마크 점
  for (let i = 0; i < landmarks.length; i++) {
    const lm = landmarks[i];
    if (!lm) continue;
    const isKey = KEY_POINTS.has(i);
    ctx.fillStyle = isKey ? 'rgba(255,40,40,0.95)' : 'rgba(0,210,255,0.85)';
    ctx.beginPath();
    ctx.arc(lm.x * W, lm.y * H, isKey ? W * 0.012 : W * 0.006, 0, Math.PI * 2);
    ctx.fill();
  }

  // 어깨·힙 측정선
  const ls = landmarks[11], rs = landmarks[12];
  const lh = landmarks[23], rh = landmarks[24];
  ctx.setLineDash([8, 6]);
  ctx.lineWidth = Math.max(2, W * 0.004);

  ctx.strokeStyle = 'rgba(255,230,0,1)';
  ctx.beginPath(); ctx.moveTo(ls.x * W, ls.y * H); ctx.lineTo(rs.x * W, rs.y * H); ctx.stroke();

  ctx.strokeStyle = 'rgba(255,100,200,1)';
  ctx.beginPath(); ctx.moveTo(lh.x * W, lh.y * H); ctx.lineTo(rh.x * W, rh.y * H); ctx.stroke();

  ctx.setLineDash([]);

  // 레이블
  const fs = Math.max(14, W * 0.022);
  ctx.font = `bold ${fs}px monospace`;
  ctx.fillStyle = 'rgba(255,230,0,1)';
  ctx.fillText('← 어깨 →', ls.x * W + 6, ls.y * H - 8);
  ctx.fillStyle = 'rgba(255,100,200,1)';
  ctx.fillText('← 힙 →', lh.x * W + 6, lh.y * H + fs + 4);

  // 정보 패널 (우측 상단)
  if (infoPanel?.length) {
    const lineH = Math.max(16, H * 0.028);
    const panelW = Math.max(200, W * 0.38);
    const panelH = infoPanel.length * lineH + 16;
    const px = W - panelW - 10, py = 10;

    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.beginPath();
    ctx.roundRect(px, py, panelW, panelH, 6);
    ctx.fill();

    ctx.font = `bold ${Math.max(11, lineH * 0.72)}px monospace`;
    ctx.fillStyle = '#00e676';
    infoPanel.forEach((line, i) => {
      ctx.fillText(line, px + 8, py + 10 + lineH * (i + 0.8));
    });
  }
}

/* ──────────────────────────────────────────
   컴포넌트
────────────────────────────────────────── */
function AnalyzingPage() {
  const { state }    = useLocation();
  const navigate     = useNavigate();
  const ran           = useRef(false);
  const debugCanvas   = useRef(null);
  const [devLog,      setDevLog]      = useState([]);
  const [resultState, setResultState] = useState(null); // 분석 완료 후 세팅

  const log = (msg) => {
    const ts = new Date().toLocaleTimeString('ko-KR', { hour12: false });
    setDevLog(prev => [...prev, `[${ts}] ${msg}`]);
  };

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    if (!state?.photo || !state?.userData) { navigate('/body-input'); return; }
    runAnalysis(state.userData, state.photo, state.photos ?? [state.photo]);
  }, []);

  async function runAnalysis(userData, photo, photos) {
    // 피팅은 분석과 독립적으로 즉시 시작 (try/catch 바깥)
    if (IS_DEV) log('피팅 API 즉시 호출...');
    const fittingPromise = fetch('http://localhost:3000/api/fitting-simple', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ personImage: photo, gender: userData.gender }),
    }).then(r => r.json()).catch(e => {
      if (IS_DEV) log(`피팅 호출 실패: ${e.message}`);
      return null;
    });

    try {
      if (IS_DEV) log('MediaPipe 모델 로딩 시작...');

      const { PoseLandmarker, ImageSegmenter, FilesetResolver } = await import('@mediapipe/tasks-vision');

      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );
      if (IS_DEV) log('WASM 로드 완료');

      const [landmarker, segmenter] = await Promise.all([
        PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/1/pose_landmarker_heavy.task',
            delegate: 'GPU',
          },
          runningMode: 'IMAGE',
          numPoses: 1,
        }),
        ImageSegmenter.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite',
            delegate: 'GPU',
          },
          runningMode: 'IMAGE',
          outputConfidenceMasks: true,
          outputCategoryMask: false,
        }),
      ]);
      if (IS_DEV) log('모델 로드 완료 (heavy + segmenter)');

      // 멀티프레임 분석
      const frames = [];
      for (const src of photos) {
        const img = new Image();
        img.src = src;
        await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });
        const result = await analyzeFrame(img, landmarker, segmenter);
        frames.push({ result, img });
        if (IS_DEV) log(`프레임 분석 — SHR: ${result.shr?.toFixed(3) ?? 'N/A'} | seg: ${result.usingSeg ? 'O' : 'X'}`);
      }

      // 평균값 집계
      const validSHR   = frames.map(f => f.result.shr).filter(v => v != null);
      const validRatio = frames.map(f => f.result.bodyRatio).filter(v => v != null);
      const avgSHR     = validSHR.length   ? validSHR.reduce((a, b) => a + b, 0) / validSHR.length   : null;
      const avgRatio   = validRatio.length ? validRatio.reduce((a, b) => a + b, 0) / validRatio.length : null;

      // 대표 프레임 (첫 번째, 오버레이용)
      const { result: primary, img: primaryImg } = frames[0];

      if (IS_DEV) {
        log(`평균 SHR: ${avgSHR?.toFixed(3) ?? 'N/A'} | 평균 Ratio: ${avgRatio?.toFixed(3) ?? 'N/A'}`);
        for (const [idx, vis] of Object.entries(primary.visMap)) {
          log(`  lm[${idx}] vis: ${vis?.toFixed(2) ?? 'N/A'}`);
        }
      }

      // 서버 분석
      let serverSHR = null;
      try {
        if (IS_DEV) log('서버 분석 요청중...');
        const srv = await fetchServerAnalysis(photo, userData.gender, userData.height, userData.weight);
        serverSHR = srv.shr ?? null;
        if (IS_DEV) log(`서버 SHR: ${serverSHR?.toFixed(3) ?? 'N/A'} | ${srv.usedIndicators?.join(', ')}`);
      } catch (e) {
        if (IS_DEV) log(`서버 분석 실패 (무시): ${e.message}`);
      }

      landmarker.close();
      segmenter.close();

      // 점수 계산
      const scores = computeScores({
        shr:       avgSHR,
        height:    Number(userData.height),
        bodyRatio: avgRatio,
        serverSHR,
        gender:    userData.gender,
      });
      const primaryType = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];

      if (IS_DEV) {
        log(`Straight ${scores.Straight}%  Wave ${scores.Wave}%  Natural ${scores.Natural}%`);
        log(`대표 체형: ${primaryType} (${KR[primaryType]})`);
      }

      // 오버레이 이미지 생성
      let overlayPhoto = null;
      if (primary.landmarks && debugCanvas.current) {
        const infoPanel = [
          `SHR: ${avgSHR?.toFixed(3) ?? 'N/A'}  (seg: ${primary.usingSeg ? 'O' : 'X'})`,
          `Ratio: ${avgRatio?.toFixed(3) ?? 'N/A'}`,
          `Server: ${serverSHR?.toFixed(3) ?? 'N/A'}`,
          `── 결과 ──`,
          `Straight ${scores.Straight}%`,
          `Wave     ${scores.Wave}%`,
          `Natural  ${scores.Natural}%`,
          `→ ${KR[primaryType]}`,
        ];
        drawDebugOverlay(debugCanvas.current, primaryImg, primary.landmarks, primary.segData, IS_DEV ? infoPanel : null);
        overlayPhoto = debugCanvas.current.toDataURL('image/jpeg', 0.92);
        if (IS_DEV) log('오버레이 이미지 생성 완료');
      }

      // 추천 API + 피팅 결과 동시 수집
      if (IS_DEV) log('추천 API 호출중...');

      const [recRes, fittingResult] = await Promise.all([
        fetch('http://localhost:3000/api/recommend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gender:   userData.gender,
            style:    userData.style,
            bodyType: KR[primaryType],
          }),
        }).then(r => r.json()).catch(() => null),
        fittingPromise,
      ]);

      const fittingInfo = fittingResult && !fittingResult.error ? fittingResult : null;

      if (IS_DEV) {
        log(`추천: ${recRes ? 'OK' : 'FAIL'}`);
        if (!fittingResult)        log('피팅: 호출 실패');
        else if (fittingResult.error) log(`피팅 서버 오류: ${fittingResult.error}`);
        else log(`피팅 시작 OK — jobId=${fittingInfo?.jobId} outfit=${fittingInfo?.outfitName}`);
      }

      setResultState({
        userData, scores, primary: primaryType, photo, overlayPhoto,
        recommendation: recRes,
        fittingJobId:      fittingInfo?.jobId ?? null,
        fittingOutfitName: fittingInfo?.outfitName ?? null,
        fittingOutfitImg:  fittingInfo?.outfitImageUrl ?? null,
      });

    } catch (err) {
      console.error('분석 실패:', err);
      if (IS_DEV) log(`오류: ${err.message}`);
      const fittingResult = await fittingPromise;
      const fittingInfo   = fittingResult && !fittingResult.error ? fittingResult : null;
      if (IS_DEV) log(`catch — 피팅: ${fittingInfo ? `jobId=${fittingInfo.jobId}` : 'null'}`);
      setResultState({
        userData,
        scores:   { Straight: 34, Wave: 33, Natural: 33 },
        primary:  'Straight',
        photo,
        overlayPhoto:      null,
        recommendation:    null,
        fittingJobId:      fittingInfo?.jobId ?? null,
        fittingOutfitName: fittingInfo?.outfitName ?? null,
        fittingOutfitImg:  fittingInfo?.outfitImageUrl ?? null,
      });
    }
  }

  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      {resultState ? (
        <>
          <h1>분석 완료!</h1>
          <p>결과를 확인할 준비가 됐습니다.</p>
          <button
            onClick={() => navigate('/body-result', { state: resultState })}
            style={{
              marginTop: 20,
              padding: '14px 48px',
              fontSize: 18,
              background: '#2196f3',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            결과 보기
          </button>
        </>
      ) : (
        <>
          <h1>분석중...</h1>
          <p>체형을 분석하고 있습니다. 잠시만 기다려 주세요.</p>
        </>
      )}

      {/* 오버레이 생성용 숨김 캔버스 (항상 마운트) */}
      <canvas ref={debugCanvas} style={{ display: 'none' }} />

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
            🛠 DEV ONLY
          </p>
          <div style={{ fontFamily: 'monospace', fontSize: 13, lineHeight: 1.7, color: '#00e676', minHeight: 40 }}>
            {devLog.length === 0
              ? <span style={{ color: '#555' }}>대기중...</span>
              : devLog.map((line, i) => <div key={i}>{line}</div>)
            }
          </div>
        </div>
      )}
    </div>
  );
}

export default AnalyzingPage;

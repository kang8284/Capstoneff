import { useRef, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/* ──────────────────────────────────────────
   촬영 포즈 가이드 SVG
────────────────────────────────────────── */
function PoseGuide({ width = 260, height = 420 }) {
  const cx = width / 2;
  const headR = width * 0.10;
  const headCY = height * 0.10;

  const shoulderY = height * 0.22;
  const shoulderW = width * 0.38;
  const hipY      = height * 0.52;
  const hipW      = width * 0.28;
  const kneeY     = height * 0.72;
  const ankleY    = height * 0.90;
  const footSpread = width * 0.12;

  const lShoulder = [cx - shoulderW, shoulderY];
  const rShoulder = [cx + shoulderW, shoulderY];
  const lHip      = [cx - hipW,      hipY];
  const rHip      = [cx + hipW,      hipY];
  const lKnee     = [cx - footSpread * 1.2, kneeY];
  const rKnee     = [cx + footSpread * 1.2, kneeY];
  const lAnkle    = [cx - footSpread, ankleY];
  const rAnkle    = [cx + footSpread, ankleY];

  const lElbow = [cx - shoulderW * 1.25, shoulderY + (hipY - shoulderY) * 0.30];
  const rElbow = [cx + shoulderW * 1.25, shoulderY + (hipY - shoulderY) * 0.30];
  const lWrist = [cx - shoulderW * 1.15, hipY - (hipY - shoulderY) * 0.05];
  const rWrist = [cx + shoulderW * 1.15, hipY - (hipY - shoulderY) * 0.05];

  const neckY = headCY + headR;

  const line = (a, b, color = 'rgba(255,255,255,0.55)', w = 2) => (
    <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={color} strokeWidth={w} strokeLinecap="round" />
  );
  const dot = (p, r = 5, color = 'rgba(255,255,255,0.7)') => (
    <circle cx={p[0]} cy={p[1]} r={r} fill={color} />
  );

  return (
    <svg
      width={width} height={height}
      style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none' }}
    >
      {/* 머리 */}
      <circle cx={cx} cy={headCY} r={headR} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth={2} />

      {/* 목 */}
      {line([cx, neckY], [cx, shoulderY])}

      {/* 어깨선 측정 표시 */}
      <line x1={lShoulder[0]} y1={shoulderY} x2={rShoulder[0]} y2={shoulderY}
        stroke="rgba(255,230,0,0.85)" strokeWidth={2} strokeDasharray="6 4" />
      <text x={cx} y={shoulderY - 6} textAnchor="middle"
        fill="rgba(255,230,0,0.9)" fontSize={11} fontFamily="sans-serif">← 어깨 →</text>

      {/* 몸통 */}
      {line(lShoulder, lHip)}
      {line(rShoulder, rHip)}

      {/* 힙선 측정 표시 */}
      <line x1={lHip[0]} y1={hipY} x2={rHip[0]} y2={hipY}
        stroke="rgba(255,100,200,0.85)" strokeWidth={2} strokeDasharray="6 4" />
      <text x={cx} y={hipY + 16} textAnchor="middle"
        fill="rgba(255,100,200,0.9)" fontSize={11} fontFamily="sans-serif">← 힙 →</text>

      {/* 팔 */}
      {line(lShoulder, lElbow)}
      {line(lElbow, lWrist)}
      {line(rShoulder, rElbow)}
      {line(rElbow, rWrist)}

      {/* 다리 */}
      {line(lHip, lKnee)}
      {line(lKnee, lAnkle)}
      {line(rHip, rKnee)}
      {line(rKnee, rAnkle)}

      {/* 주요 랜드마크 점 */}
      {dot(lShoulder, 5, 'rgba(255,230,0,0.9)')}
      {dot(rShoulder, 5, 'rgba(255,230,0,0.9)')}
      {dot(lHip, 5, 'rgba(255,100,200,0.9)')}
      {dot(rHip, 5, 'rgba(255,100,200,0.9)')}
      {dot(lElbow, 4)}
      {dot(rElbow, 4)}
      {dot(lWrist, 4)}
      {dot(rWrist, 4)}
      {dot(lKnee, 4)}
      {dot(rKnee, 4)}
      {dot(lAnkle, 4)}
      {dot(rAnkle, 4)}
    </svg>
  );
}

/* ──────────────────────────────────────────
   컴포넌트
────────────────────────────────────────── */
function CameraPage() {
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const navigate  = useNavigate();
  const location  = useLocation();
  const userData  = location.state;

  const [ready,     setReady]     = useState(false);
  const [captured,  setCaptured]  = useState(null);
  const [allFrames, setAllFrames] = useState([]);
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    if (!userData) { navigate('/body-input'); return; }
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 }
      });
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      setReady(true);
    } catch (err) {
      console.error('카메라 오류:', err);
      alert('카메라를 사용할 수 없습니다.');
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
  };

  const captureFrame = () => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.92);
  };

  const capture = async () => {
    if (!ready || countdown !== null) return;

    // 카운트다운
    for (let i = 3; i >= 1; i--) {
      setCountdown(i);
      await new Promise(r => setTimeout(r, 900));
    }
    setCountdown('📸');

    // 3프레임 연속 촬영
    const frames = [];
    for (let i = 0; i < 3; i++) {
      frames.push(captureFrame());
      if (i < 2) await new Promise(r => setTimeout(r, 300));
    }

    await new Promise(r => setTimeout(r, 200));
    setCountdown(null);
    stopCamera();
    setCaptured(frames[0]);
    setAllFrames(frames);
  };

  const retake = () => {
    setCaptured(null);
    setAllFrames([]);
    setCountdown(null);
    startCamera();
  };

  const proceed = () => {
    navigate('/analyzing', { state: { userData, photo: captured, photos: allFrames } });
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h1>사진 촬영</h1>
      <p>전신이 가이드 실루엣에 맞도록 서주세요.</p>

      {!captured ? (
        <>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: 480, borderRadius: 8, transform: 'scaleX(-1)', display: 'block' }}
            />
            {/* 포즈 가이드 오버레이 */}
            <PoseGuide width={260} height={420} />

            {/* 카운트다운 */}
            {countdown !== null && (
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: typeof countdown === 'number' ? 96 : 64,
                color: '#fff',
                textShadow: '0 0 20px rgba(0,0,0,0.8)',
                pointerEvents: 'none',
              }}>
                {countdown}
              </div>
            )}
          </div>
          <br /><br />
          <button onClick={capture} disabled={!ready || countdown !== null}>
            {countdown !== null ? '촬영중...' : '촬영'}
          </button>
        </>
      ) : (
        <>
          <img src={captured} style={{ width: 480, borderRadius: 8 }} alt="촬영 사진" />
          <br />
          <p style={{ color: '#666', fontSize: 13 }}>3프레임 캡처 완료</p>
          <br />
          <button onClick={retake}>다시 촬영</button>
          &nbsp;
          <button onClick={proceed}>분석 시작</button>
        </>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}

export default CameraPage;

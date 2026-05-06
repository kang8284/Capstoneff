import { useRef, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function CameraPage() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const userData = location.state;

  const [ready, setReady] = useState(false);
  const [captured, setCaptured] = useState(null);

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

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    // 좌우반전된 영상 그대로 캡처 (사용자가 본 화면과 동일하게)
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    setCaptured(canvas.toDataURL('image/jpeg', 0.92));
    stopCamera();
  };

  const retake = () => {
    setCaptured(null);
    startCamera();
  };

  const proceed = () => {
    navigate('/analyzing', { state: { userData, photo: captured } });
  };

  return (
    <div>
      <h1>사진 촬영</h1>
      <p>전신이 잘 보이도록 서주세요.</p>

      {!captured ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ width: 480, borderRadius: 8, transform: 'scaleX(-1)' }}
          />
          <br /><br />
          <button onClick={capture} disabled={!ready}>촬영</button>
        </>
      ) : (
        <>
          <img src={captured} style={{ width: 480, borderRadius: 8 }} alt="촬영 사진" />
          <br /><br />
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

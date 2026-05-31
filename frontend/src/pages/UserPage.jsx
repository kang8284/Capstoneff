import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function UserPage() {
    const navigate = useNavigate();

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

    const [gender, setGender] = useState('female');
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');

    const [capturedImage, setCapturedImage] = useState(null);
    const [countdown, setCountdown] = useState(null);
    const [isCounting, setIsCounting] = useState(false);

    useEffect(() => {
        startCamera();

        return () => {
            stopCamera();
        };
    }, []);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' },
                audio: false,
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }

            streamRef.current = stream;
        } catch (error) {
            console.error('카메라 실행 실패:', error);
            alert('카메라를 실행할 수 없습니다. 브라우저 권한을 확인해주세요.');
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
    };

    const captureCurrentFrame = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (!video || !canvas) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');

        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = canvas.toDataURL('image/jpeg', 0.92);
        setCapturedImage(imageData);
    };

    const handleCapture = () => {
        if (isCounting) return;

        setCapturedImage(null);
        setIsCounting(true);
        setCountdown(3);

        let count = 3;

        const timer = setInterval(() => {
            count -= 1;

            if (count > 0) {
                setCountdown(count);
            } else {
                clearInterval(timer);
                setCountdown(null);
                setIsCounting(false);
                captureCurrentFrame();
            }
        }, 1000);
    };

    const handleRetry = () => {
        if (isCounting) return;

        setCapturedImage(null);

        // 카메라가 꺼져있으면 다시 실행
        if (!streamRef.current) {
            startCamera();
        }

        // 바로 다시 촬영 시작
        setIsCounting(true);
        setCountdown(3);

        let count = 3;

        const timer = setInterval(() => {
            count -= 1;

            if (count > 0) {
                setCountdown(count);
            } else {
                clearInterval(timer);
                setCountdown(null);
                setIsCounting(false);
                captureCurrentFrame();
            }
        }, 1000);
    };

    const handleNext = () => {
        if (!height || !weight) {
            alert('키와 몸무게를 입력해주세요.');
            return;
        }

        if (!capturedImage) {
            alert('사진을 먼저 촬영해주세요.');
            return;
        }

        stopCamera();

        navigate('/camera', {
            state: {
                gender,
                height,
                weight,
                image: capturedImage,
            },
        });
    };

    return (
        <div className="min-h-screen w-full overflow-hidden bg-gradient-to-br from-emerald-200 via-violet-100 to-cyan-100 flex items-center justify-center px-6 py-10 relative">
            <div className="w-full max-w-[920px]">
                <h1 className="text-center text-3xl font-extrabold text-gray-900 mb-8">
                    체형 분석을 위한 사전 정보 입력
                </h1>

                <div className="flex flex-col items-center">
                    <div className="flex flex-col lg:flex-row justify-center gap-5 w-full">
                        {/* 왼쪽 입력 카드 */}
                        <div className="w-full lg:w-[300px] rounded-xl bg-white/55 backdrop-blur-md shadow-lg p-7">
                            <h2 className="text-xl font-extrabold text-center text-gray-900 mb-5">신체 데이터 입력</h2>

                            <label className="block text-sm font-bold text-gray-800 mb-2">키 (cm)</label>
                            <input
                                value={height}
                                onChange={(e) => setHeight(e.target.value)}
                                type="number"
                                className="w-full h-10 rounded-lg bg-white border border-gray-200 px-3 outline-none shadow-inner mb-5 focus:ring-2 focus:ring-emerald-300"
                            />

                            <label className="block text-sm font-bold text-gray-800 mb-2">몸무게 (kg)</label>
                            <input
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                type="number"
                                className="w-full h-10 rounded-lg bg-white border border-gray-200 px-3 outline-none shadow-inner mb-5 focus:ring-2 focus:ring-purple-300"
                            />

                            <label className="block text-sm font-bold text-gray-800 mb-3">성별 선택</label>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setGender('male')}
                                    className={`flex-1 h-9 rounded-full text-sm font-extrabold text-white shadow-md transition ${
                                        gender === 'male' ? 'bg-blue-500 scale-105' : 'bg-blue-300'
                                    }`}
                                >
                                    MALE
                                </button>

                                <button
                                    onClick={() => setGender('female')}
                                    className={`flex-1 h-9 rounded-full text-sm font-extrabold text-white shadow-md transition ${
                                        gender === 'female' ? 'bg-pink-500 scale-105' : 'bg-pink-300'
                                    }`}
                                >
                                    FEMALE
                                </button>
                            </div>
                        </div>

                        {/* 오른쪽 카메라 카드 */}
                        <div className="w-full lg:w-[590px] rounded-xl bg-white/55 backdrop-blur-md shadow-lg p-4">
                            <h2 className="text-xl font-extrabold text-center text-gray-900 mb-3">
                                카메라 촬영 및 미리보기
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="relative h-[270px] bg-white/70 rounded-lg overflow-hidden flex items-center justify-center">
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className="h-full w-full object-cover scale-x-[-1]"
                                    />

                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <svg
                                            width="140"
                                            height="250"
                                            viewBox="0 0 220 420"
                                            fill="none"
                                            stroke="#22c55e"
                                            strokeWidth="8"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="opacity-80 drop-shadow-[0_0_10px_#4ade80]"
                                        >
                                            <circle cx="110" cy="45" r="34" />
                                            <path
                                                d="
                          M82 95
                          C65 95 52 108 52 125
                          L52 235
                          C52 250 63 260 77 260
                          C82 260 85 257 85 252
                          L85 135

                          L85 365
                          C85 385 98 398 110 398
                          C122 398 135 385 135 365
                          L135 135

                          L135 252
                          C135 257 138 260 143 260
                          C157 260 168 250 168 235
                          L168 125
                          C168 108 155 95 138 95
                          Z
                        "
                                            />
                                            <line x1="110" y1="235" x2="110" y2="385" />
                                        </svg>
                                    </div>

                                    {countdown && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                            <div className="w-24 h-24 rounded-full bg-white/80 flex items-center justify-center shadow-2xl">
                                                <span className="text-5xl font-extrabold text-purple-500">
                                                    {countdown}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="h-[270px] bg-white/70 rounded-lg overflow-hidden flex items-center justify-center">
                                    {capturedImage ? (
                                        <img
                                            src={capturedImage}
                                            alt="촬영 결과"
                                            className="h-full w-full object-contain"
                                        />
                                    ) : (
                                        <p className="text-gray-500 text-sm">촬영된 이미지가 여기에 표시됩니다</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2 mt-3">
                                <button
                                    onClick={handleCapture}
                                    disabled={isCounting}
                                    className={`px-6 h-9 rounded-full text-sm font-extrabold border-2 border-black ${
                                        isCounting ? 'bg-gray-300 text-white' : 'bg-white text-black'
                                    }`}
                                >
                                    촬영 (CAPTURE)
                                </button>

                                <button
                                    onClick={handleRetry}
                                    disabled={isCounting}
                                    className="px-6 h-9 rounded-full text-sm font-extrabold bg-gray-200"
                                >
                                    재촬영 (RETRY)
                                </button>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleNext}
                        className="mt-9 w-[320px] h-12 rounded-full bg-gradient-to-r from-purple-400 to-indigo-400 text-white font-extrabold shadow-lg"
                    >
                        다음 단계로 이동 (NEXT)
                    </button>
                </div>
            </div>

            <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
    );
}

export default UserPage;

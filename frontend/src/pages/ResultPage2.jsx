import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const outfitSets = [
    {
        id: 'casual',
        title: '캐주얼',
        image: '/images/outfit1.png',
        desc: '깔끔한 기본 아이템 중심의 코디입니다. 내추럴 체형의 자연스러운 골격감을 살리면서도 단정한 분위기를 만들어줍니다.',
    },
    {
        id: 'street',
        title: '스트릿',
        image: '/images/outfit2.png',
        desc: '여유 있는 실루엣과 스트릿 무드를 살린 코디입니다. 상체는 편안하게, 하체는 길어 보이도록 균형을 잡아줍니다.',
    },
    {
        id: 'lovely',
        title: '러블리',
        image: '/images/outfit3.png',
        desc: '부드럽고 사랑스러운 분위기를 살린 코디입니다.',
    },
    {
        id: 'formal',
        title: '포멀',
        image: '/images/outfit4.png',
        desc: '단정하고 깔끔한 인상을 주는 코디입니다.',
    },
];

/* ── 유틸 ── */
function dist(a, b) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

const CONNECTIONS = [
    [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
    [11, 23], [12, 24], [23, 24],
    [23, 25], [25, 27], [24, 26], [26, 28],
];
const KEY_POINTS = new Set([11, 12, 23, 24]);

/* ── 바운딩박스 크롭 + 랜드마크 그리기 ── */
function buildPersonCanvas(img, landmarks) {
    const W = img.naturalWidth, H = img.naturalHeight;

    // 랜드마크 바운딩박스 계산
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const lm of landmarks) {
        if (!lm) continue;
        if (lm.x < minX) minX = lm.x;
        if (lm.y < minY) minY = lm.y;
        if (lm.x > maxX) maxX = lm.x;
        if (lm.y > maxY) maxY = lm.y;
    }
    if (minX === Infinity) return null;

    // 15% 패딩 추가
    const padX = (maxX - minX) * 0.15;
    const padY = (maxY - minY) * 0.15;
    minX = Math.max(0, minX - padX);
    minY = Math.max(0, minY - padY);
    maxX = Math.min(1, maxX + padX);
    maxY = Math.min(1, maxY + padY);

    const cropX = minX * W, cropY = minY * H;
    const cropW = (maxX - minX) * W, cropH = (maxY - minY) * H;

    const canvas = document.createElement('canvas');
    canvas.width = cropW; canvas.height = cropH;
    const ctx = canvas.getContext('2d');

    // 크롭 영역 그리기
    ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

    // 랜드마크 그리기 (크롭 좌표 기준으로 변환)
    ctx.strokeStyle = 'rgba(0,255,80,0.9)';
    ctx.lineWidth = Math.max(2, cropW * 0.005);
    for (const [a, b] of CONNECTIONS) {
        const la = landmarks[a], lb = landmarks[b];
        if (!la || !lb) continue;
        ctx.beginPath();
        ctx.moveTo(la.x * W - cropX, la.y * H - cropY);
        ctx.lineTo(lb.x * W - cropX, lb.y * H - cropY);
        ctx.stroke();
    }
    for (let i = 0; i < landmarks.length; i++) {
        const lm = landmarks[i]; if (!lm) continue;
        const lx = lm.x * W - cropX, ly = lm.y * H - cropY;
        ctx.fillStyle = KEY_POINTS.has(i) ? 'rgba(255,40,40,0.95)' : 'rgba(0,210,255,0.85)';
        ctx.beginPath();
        ctx.arc(lx, ly, KEY_POINTS.has(i) ? cropW * 0.013 : cropW * 0.008, 0, Math.PI * 2);
        ctx.fill();
    }

    return canvas.toDataURL('image/jpeg', 0.92);
}

/* ── 측정선 + 수치 오버레이 이미지 ── */
function buildMeasureCanvas(img, landmarks) {
    const W = img.naturalWidth, H = img.naturalHeight;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    if (!landmarks) return { url: canvas.toDataURL('image/jpeg', 0.92), metrics: null };

    const ls = landmarks[11], rs = landmarks[12];
    const lh = landmarks[23], rh = landmarks[24];
    if (!ls || !rs || !lh || !rh) return { url: canvas.toDataURL('image/jpeg', 0.92), metrics: null };

    const shoulderW = dist(ls, rs);
    const hipW      = dist(lh, rh);
    const shr       = shoulderW / hipW;

    /* 어깨 측정선 (노란 점선) */
    ctx.setLineDash([10, 7]);
    ctx.strokeStyle = 'rgba(255,230,0,1)';
    ctx.lineWidth = Math.max(2, W * 0.005);
    ctx.beginPath(); ctx.moveTo(ls.x * W, ls.y * H); ctx.lineTo(rs.x * W, rs.y * H); ctx.stroke();

    /* 힙 측정선 (분홍 점선) */
    ctx.strokeStyle = 'rgba(255,100,200,1)';
    ctx.beginPath(); ctx.moveTo(lh.x * W, lh.y * H); ctx.lineTo(rh.x * W, rh.y * H); ctx.stroke();
    ctx.setLineDash([]);

    /* 수직 중심선 */
    ctx.strokeStyle = 'rgba(160,160,255,0.6)';
    ctx.lineWidth = Math.max(1, W * 0.003);
    const midShX = (ls.x + rs.x) / 2 * W;
    ctx.beginPath(); ctx.moveTo(midShX, ls.y * H); ctx.lineTo(midShX, lh.y * H); ctx.stroke();

    /* 상하체 비율 */
    let bodyRatio = null;
    const la = landmarks[27], ra = landmarks[28];
    if (la && ra) {
        const shoulderY = (ls.y + rs.y) / 2;
        const hipY      = (lh.y + rh.y) / 2;
        const ankleY    = (la.y + ra.y) / 2;
        const upper = hipY - shoulderY;
        const lower = ankleY - hipY;
        if (lower > 0.01) bodyRatio = upper / lower;

        /* 상하체 분리선 (힙에 수평 흰 선) */
        ctx.strokeStyle = 'rgba(255,255,255,0.55)';
        ctx.lineWidth = Math.max(1, W * 0.003);
        ctx.setLineDash([6, 5]);
        ctx.beginPath(); ctx.moveTo(0, hipY * H); ctx.lineTo(W, hipY * H); ctx.stroke();
        ctx.setLineDash([]);
    }

    /* 수치 패널 (우측 상단) */
    ctx.shadowColor = 'rgba(0,0,0,0.9)';
    ctx.shadowBlur  = 3;
    const lines = [
        `SHR (어깨/힙): ${shr.toFixed(3)}`,
        `어깨 너비: ${(shoulderW * 100).toFixed(1)}%`,
        `힙 너비:   ${(hipW * 100).toFixed(1)}%`,
    ];
    if (bodyRatio !== null) lines.push(`상/하체 비율: ${bodyRatio.toFixed(3)}`);

    const lh2 = Math.max(20, H * 0.033);
    const panelW = Math.max(230, W * 0.42);
    const panelH = lines.length * lh2 + 18;
    const px = W - panelW - 10, py = 10;

    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0,0,0,0.72)';
    ctx.beginPath(); ctx.roundRect(px, py, panelW, panelH, 7); ctx.fill();

    ctx.font = `bold ${Math.max(11, lh2 * 0.68)}px monospace`;
    ctx.fillStyle = '#00e676';
    lines.forEach((line, i) => ctx.fillText(line, px + 10, py + 12 + lh2 * (i + 0.75)));

    /* 어깨/힙 인라인 레이블 */
    const fs = Math.max(12, W * 0.026);
    ctx.font = `bold ${fs}px sans-serif`;
    ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = 4;
    ctx.fillStyle = 'rgba(255,230,0,1)';
    ctx.fillText('← 어깨 →', ls.x * W + 6, ls.y * H - 8);
    ctx.fillStyle = 'rgba(255,100,200,1)';
    ctx.fillText('← 힙 →',   lh.x * W + 6, lh.y * H + fs + 4);
    ctx.shadowBlur = 0;

    return {
        url: canvas.toDataURL('image/jpeg', 0.92),
        metrics: { shr, shoulderW, hipW, bodyRatio },
    };
}

/* ── 컴포넌트 ── */
function ResultPage2() {
    const navigate = useNavigate();
    const { state } = useLocation();

    const [selectedOutfit, setSelectedOutfit] = useState(null);
    const [personImgUrl,   setPersonImgUrl]   = useState(null);
    const [metrics,        setMetrics]        = useState(null);
    const [processing,     setProcessing]     = useState(false);

    const styleId    = state?.style;
    const gender     = state?.gender;
    const photo      = state?.image;
    const bodyType   = state?.bodyType;

    const otherOutfits = outfitSets.filter((o) => {
        if (gender === 'male' && o.id === 'lovely') return false;
        return o.id !== styleId;
    });

    useEffect(() => {
        if (!photo) return;
        runMediaPipe(photo);
    }, [photo]);

    async function runMediaPipe(photoDataUrl) {
        setProcessing(true);
        try {
            const { PoseLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');
            const vision = await FilesetResolver.forVisionTasks(
                'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
            );

            const landmarker = await PoseLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/1/pose_landmarker_heavy.task',
                    delegate: 'GPU',
                },
                runningMode: 'IMAGE', numPoses: 1,
            });

            const img = new Image();
            img.src = photoDataUrl;
            await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });

            const lmResult  = landmarker.detect(img);
            const landmarks = lmResult.landmarks?.[0] ?? null;
            landmarker.close();

            /* 1. 바운딩박스 크롭 + 랜드마크 이미지 */
            if (landmarks) setPersonImgUrl(buildPersonCanvas(img, landmarks));

            /* 2. 수치 계산 (이미지 저장 없이 metrics만 추출) */
            const { metrics: m } = buildMeasureCanvas(img, landmarks);
            setMetrics(m);

        } catch (err) {
            console.error('MediaPipe 처리 실패:', err);
        } finally {
            setProcessing(false);
        }
    }

    const KR_BODY = { straight: '스트레이트', wave: '웨이브', natural: '내추럴' };
    const bodyTypeKr = KR_BODY[bodyType] ?? bodyType ?? '내추럴';

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-emerald-200 via-violet-100 to-cyan-100 px-6 py-6 flex items-center justify-center">
            <div className="w-full max-w-[1320px] rounded-[28px] bg-white/65 backdrop-blur-md shadow-2xl p-6">
                <h1 className="text-center text-3xl font-extrabold text-gray-900 mb-7">
                    체형 분석 기반 코디 추천 결과
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-[2.7fr_1.45fr] gap-5">

                    {/* ── 왼쪽: BODY MAP (측정 이미지 + 크롭 사람 + 텍스트) ── */}
                    <div className="rounded-2xl bg-gradient-to-br from-indigo-100/80 to-cyan-100/70 shadow-md p-6 min-h-[560px]">
                        <div className="flex gap-7 h-full">

                            {/* 이미지 컬럼 */}
                            <div className="flex flex-col items-center gap-3">
                                {/* 크롭된 사람 + 랜드마크 이미지 */}
                                <div className="w-[240px] h-[460px] rounded-xl overflow-hidden shadow-md flex items-center justify-center bg-gray-800">
                                    {processing && !personImgUrl ? (
                                        <p className="text-gray-400 text-sm">분석 중...</p>
                                    ) : personImgUrl ? (
                                        <img src={personImgUrl} alt="랜드마크" className="h-full w-full object-contain" />
                                    ) : (
                                        <p className="text-gray-500 text-sm">사진 없음</p>
                                    )}
                                </div>

                                {/* 수치 요약 박스 */}
                                <div className="w-[240px] rounded-xl bg-black/70 p-3 text-xs font-mono text-green-400 space-y-1">
                                    <div>SHR: <span className="text-yellow-300">{metrics ? metrics.shr.toFixed(3) : '-'}</span></div>
                                    <div>어깨: <span className="text-yellow-300">{metrics ? `${(metrics.shoulderW * 100).toFixed(1)}%` : '-'}</span></div>
                                    <div>힙:   <span className="text-pink-300">{metrics ? `${(metrics.hipW * 100).toFixed(1)}%` : '-'}</span></div>
                                    <div>상/하체: <span className="text-cyan-300">{metrics?.bodyRatio != null ? metrics.bodyRatio.toFixed(3) : '-'}</span></div>
                                </div>
                            </div>

                            {/* 텍스트 분석 */}
                            <div className="flex-1 pt-6">
                                <h2 className="text-3xl font-extrabold text-gray-900 mb-6 leading-snug">
                                    당신의 Body 타입은
                                    <br />
                                    <span className="text-purple-600">{bodyTypeKr}</span>입니다
                                </h2>

                                <div className="space-y-5 text-gray-900">
                                    <section className="rounded-2xl bg-white/55 p-4 shadow-sm">
                                        <h3 className="text-xl font-extrabold mb-2">숄더 라인 및 상체 분석:</h3>
                                        <p className="text-base leading-relaxed font-semibold">
                                            어깨선과 상체 비율이 안정적으로 보이며, 전체적으로 깔끔한 실루엣을 만들기
                                            좋은 체형입니다. 상의는 너무 달라붙는 핏보다 자연스럽게 떨어지는 핏이 잘
                                            어울립니다.
                                        </p>
                                    </section>

                                    <section className="rounded-2xl bg-white/55 p-4 shadow-sm">
                                        <h3 className="text-xl font-extrabold mb-2">하체 및 비율 분석:</h3>
                                        <p className="text-base leading-relaxed font-semibold">
                                            하체 라인이 비교적 곧게 보여 스트레이트 팬츠나 와이드 팬츠처럼 세로선을
                                            살리는 아이템이 좋습니다.
                                        </p>
                                    </section>

                                    <section className="rounded-2xl bg-white/55 p-4 shadow-sm">
                                        <h3 className="text-xl font-extrabold mb-2">코디네이션 전략:</h3>
                                        <p className="text-base leading-relaxed font-semibold">
                                            선택한 선호 스타일인{' '}
                                            <span className="text-purple-600">{styleId || '캐주얼'}</span>을 기반으로,
                                            상체는 깔끔하게 정리하고 하체는 비율을 길게 보이게 하는 조합을 추천합니다.
                                        </p>
                                    </section>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── 오른쪽: OTHER STYLES (변경 없음) ── */}
                    <div className="relative rounded-2xl bg-gradient-to-br from-violet-100/80 to-emerald-100/70 shadow-md p-4 min-h-[560px] overflow-hidden">
                        <h2 className="text-lg font-extrabold text-center text-gray-900 mb-4">OTHER STYLES</h2>

                        {!selectedOutfit ? (
                            <div className="flex flex-col gap-4 transition-all duration-500">
                                {otherOutfits.map((set) => (
                                    <button
                                        key={set.id}
                                        onClick={() => setSelectedOutfit(set)}
                                        className="rounded-2xl bg-white/70 shadow-md p-3 hover:scale-[1.03] transition duration-300 text-left"
                                    >
                                        <h3 className="text-center text-sm font-extrabold text-gray-900 mb-2">
                                            [{set.title}]
                                        </h3>
                                        <div className="h-[125px] rounded-xl bg-white/80 flex items-center justify-center overflow-hidden shadow-inner">
                                            <img src={set.image} alt={set.title} className="h-full w-full object-contain" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="animate-[scaleIn_0.45s_ease-out] rounded-2xl bg-white/90 shadow-xl p-4 min-h-[500px] flex flex-col">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-base font-extrabold text-gray-900">[{selectedOutfit.title}]</h3>
                                    <button
                                        onClick={() => setSelectedOutfit(null)}
                                        className="w-8 h-8 rounded-full bg-gray-200 text-xl font-extrabold hover:bg-gray-300"
                                    >×</button>
                                </div>
                                <div className="h-[210px] rounded-2xl bg-gradient-to-br from-purple-100 to-cyan-100 flex items-center justify-center overflow-hidden shadow-inner mb-4">
                                    <img src={selectedOutfit.image} alt={selectedOutfit.title} className="h-full w-full object-contain" />
                                </div>
                                <div className="flex-1 rounded-2xl bg-gradient-to-br from-emerald-100/80 to-violet-100/80 p-4">
                                    <h4 className="text-lg font-extrabold text-gray-900 mb-3">스타일 설명</h4>
                                    <p className="text-base leading-relaxed font-semibold text-gray-800">{selectedOutfit.desc}</p>
                                    <div className="flex flex-wrap gap-2 mt-5">
                                        <span className="px-3 py-1 rounded-full bg-white/80 text-purple-600 font-bold">#체형보완</span>
                                        <span className="px-3 py-1 rounded-full bg-white/80 text-purple-600 font-bold">#비율보정</span>
                                        <span className="px-3 py-1 rounded-full bg-white/80 text-purple-600 font-bold">#추천코디</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <style>{`
                    @keyframes scaleIn {
                        0%   { opacity: 0; transform: scale(0.85) translateY(20px); }
                        100% { opacity: 1; transform: scale(1) translateY(0); }
                    }
                `}</style>

                <div className="flex justify-center mt-6">
                    <button
                        onClick={() => navigate('/')}
                        className="w-[300px] h-14 rounded-full bg-gradient-to-r from-purple-400 to-indigo-400 text-white text-xl font-extrabold shadow-lg hover:scale-105 transition"
                    >
                        ← 처음으로 돌아가기
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ResultPage2;

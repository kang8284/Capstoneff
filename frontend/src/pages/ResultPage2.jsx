import { useState } from 'react';
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

function ResultPage2() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const bodyType = state?.bodyType || '분석 결과 없음';

    const [selectedOutfit, setSelectedOutfit] = useState(null);

    const style = state?.style;
    const gender = state?.gender;
    const fittingImage = state?.fittingImage || state?.image || '';

    const otherOutfits = outfitSets.filter((outfit) => {
        if (gender === 'male' && outfit.id === 'lovely') {
            return false;
        }

        return outfit.id !== style;
    });

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-emerald-200 via-violet-100 to-cyan-100 px-6 py-6 flex items-center justify-center">
            <div className="w-full max-w-[1320px] rounded-[28px] bg-white/65 backdrop-blur-md shadow-2xl p-6">
                <h1 className="text-center text-3xl font-extrabold text-gray-900 mb-7">
                    체형 분석 기반 코디 추천 결과
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_2.7fr_1.45fr] gap-5">
                    <div className="rounded-2xl bg-gradient-to-br from-pink-100/80 to-purple-100/80 shadow-md p-4 flex flex-col items-center justify-center min-h-[560px]">
                        <h2 className="text-xl font-extrabold text-gray-900 mb-4">Best Style</h2>

                        <div className="w-full h-[500px] rounded-2xl bg-white/75 flex items-center justify-center overflow-hidden shadow-inner">
                            <img
                                src={fittingImage}
                                alt="가상피팅 결과 이미지"
                                className="h-full w-full object-contain"
                            />
                        </div>
                    </div>

                    <div className="rounded-2xl bg-gradient-to-br from-indigo-100/80 to-cyan-100/70 shadow-md p-6 min-h-[560px]">
                        <div className="flex gap-7 h-full">
                            <div className="flex justify-center items-center">
                                <div className="relative w-[240px] h-[500px] flex items-center justify-center">
                                    <div className="absolute top-0 left-3 px-4 py-1 rounded-full bg-indigo-300 text-white font-extrabold shadow">
                                        BODY MAP
                                    </div>

                                    <svg
                                        width="235"
                                        height="470"
                                        viewBox="0 0 220 420"
                                        fill="none"
                                        className="drop-shadow-[0_0_16px_rgba(168,85,247,0.8)] mt-8"
                                    >
                                        <path
                                            d="M110 80 C130 80 145 63 145 43 C145 23 130 8 110 8 C90 8 75 23 75 43 C75 63 90 80 110 80Z"
                                            fill="rgba(216,180,254,0.22)"
                                            stroke="#d8b4fe"
                                            strokeWidth="4"
                                        />
                                        <path
                                            d="M78 95 L55 170 L45 265 L62 270 L82 178 L88 360 L104 390 L116 390 L132 360 L138 178 L158 270 L175 265 L165 170 L142 95 Z"
                                            fill="rgba(216,180,254,0.18)"
                                            stroke="#d8b4fe"
                                            strokeWidth="5"
                                            strokeLinejoin="round"
                                        />
                                        <line x1="110" y1="82" x2="110" y2="360" stroke="#a78bfa" strokeWidth="3" />
                                        <line x1="78" y1="115" x2="142" y2="115" stroke="#a78bfa" strokeWidth="3" />
                                        <line x1="88" y1="190" x2="132" y2="190" stroke="#a78bfa" strokeWidth="3" />
                                        <line x1="88" y1="360" x2="132" y2="360" stroke="#a78bfa" strokeWidth="3" />

                                        {[110, 78, 142, 88, 132, 62, 158].map((x, idx) => (
                                            <circle
                                                key={idx}
                                                cx={x}
                                                cy={[82, 115, 115, 190, 190, 265, 265][idx]}
                                                r="5"
                                                fill="#a78bfa"
                                            />
                                        ))}
                                    </svg>
                                </div>
                            </div>

                            <div className="flex-1 pt-6">
                                <h2 className="text-3xl font-extrabold text-gray-900 mb-6 leading-snug">
                                    당신의 Body 타입은
                                    <br />
                                    <span className="text-purple-600">{bodyType}</span>입니다
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
                                            <span className="text-purple-600">{style || '캐주얼'}</span>을 기반으로,
                                            상체는 깔끔하게 정리하고 하체는 비율을 길게 보이게 하는 조합을 추천합니다.
                                        </p>
                                    </section>
                                </div>
                            </div>
                        </div>
                    </div>

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
                                            <img
                                                src={set.image}
                                                alt={set.title}
                                                className="h-full w-full object-contain"
                                            />
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
                                    >
                                        ×
                                    </button>
                                </div>

                                <div className="h-[210px] rounded-2xl bg-gradient-to-br from-purple-100 to-cyan-100 flex items-center justify-center overflow-hidden shadow-inner mb-4">
                                    <img
                                        src={selectedOutfit.image}
                                        alt={selectedOutfit.title}
                                        className="h-full w-full object-contain"
                                    />
                                </div>

                                <div className="flex-1 rounded-2xl bg-gradient-to-br from-emerald-100/80 to-violet-100/80 p-4">
                                    <h4 className="text-lg font-extrabold text-gray-900 mb-3">스타일 설명</h4>

                                    <p className="text-base leading-relaxed font-semibold text-gray-800">
                                        {selectedOutfit.desc}
                                    </p>

                                    <div className="flex flex-wrap gap-2 mt-5">
                                        <span className="px-3 py-1 rounded-full bg-white/80 text-purple-600 font-bold">
                                            #체형보완
                                        </span>
                                        <span className="px-3 py-1 rounded-full bg-white/80 text-purple-600 font-bold">
                                            #비율보정
                                        </span>
                                        <span className="px-3 py-1 rounded-full bg-white/80 text-purple-600 font-bold">
                                            #추천코디
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <style>
                    {`
            @keyframes scaleIn {
              0% {
                opacity: 0;
                transform: scale(0.85) translateY(20px);
              }
              100% {
                opacity: 1;
                transform: scale(1) translateY(0);
              }
            }
          `}
                </style>

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

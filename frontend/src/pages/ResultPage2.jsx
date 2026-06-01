import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const styleLabels = {
    casual: '캐주얼',
    street: '스트릿',
    formal: '포멀',
    lovely: '러블리',
};

const bodyTypeLabels = {
    natural: '내추럴',
    wave: '웨이브',
    straight: '스트레이트',
};

const outfitImages = {
    male: {
        natural: {
            casual: '/images/male-natural-casual.png',
            street: '/images/male-natural-street.png',
            formal: '/images/male-natural-formal.png',
        },
        wave: {
            casual: '/images/male-wave-casual.png',
            street: '/images/male-wave-street.png',
            formal: '/images/male-wave-formal.png',
        },
        straight: {
            casual: '/images/male-straight-casual.png',
            street: '/images/male-straight-street.png',
            formal: '/images/male-straight-formal.png',
        },
    },
    female: {
        natural: {
            casual: '/images/female-natural-casual.png',
            street: '/images/female-natural-street.png',
            formal: '/images/female-natural-formal.png',
            lovely: '/images/female-natural-lovely.png',
        },
        wave: {
            casual: '/images/female-wave-casual.png',
            street: '/images/female-wave-street.png',
            formal: '/images/female-wave-formal.png',
            lovely: '/images/female-wave-lovely.png',
        },
        straight: {
            casual: '/images/female-straight-casual.png',
            street: '/images/female-straight-street.png',
            formal: '/images/female-straight-formal.png',
            lovely: '/images/female-straight-lovely.png',
        },
    },
};

const bodyComments = {
    natural: {
        shoulder:
            '어깨선과 골격감이 자연스럽게 드러나는 체형입니다. 너무 달라붙는 핏보다는 여유 있게 떨어지는 실루엣이 잘 어울립니다.',
        lower: '하체 라인은 직선적인 느낌을 살리는 아이템이 좋습니다. 와이드 팬츠나 스트레이트 팬츠처럼 자연스럽게 떨어지는 핏을 추천합니다.',
        styling: '전체적으로 힘 있는 소재와 여유로운 핏을 활용하면 내추럴 체형의 분위기를 가장 잘 살릴 수 있습니다.',
    },
    wave: {
        shoulder:
            '상체 라인이 비교적 부드럽고 곡선적인 느낌을 주는 체형입니다. 상의는 너무 박시한 핏보다 적당히 몸선을 살리는 디자인이 좋습니다.',
        lower: '허리선을 강조하거나 하체 비율을 보완하는 아이템이 잘 어울립니다. 하이웨이스트 팬츠나 스커트가 비율을 정리해줍니다.',
        styling:
            '부드러운 소재, 짧은 기장 상의, 허리 라인을 살리는 코디를 활용하면 웨이브 체형의 장점을 살릴 수 있습니다.',
    },
    straight: {
        shoulder: '상체와 하체의 균형이 비교적 안정적인 체형입니다. 깔끔하고 정돈된 실루엣이 잘 어울립니다.',
        lower: '과하게 넓거나 너무 달라붙는 핏보다는 일자로 떨어지는 팬츠가 체형 밸런스를 좋게 보여줍니다.',
        styling: '기본 아이템을 중심으로 깔끔한 라인을 유지하면 스트레이트 체형의 단정한 분위기를 잘 살릴 수 있습니다.',
    },
};

const styleDescriptions = {
    casual: '일상에서 편하게 활용하기 좋은 완성 코디입니다. 과하지 않으면서도 자연스러운 분위기를 만들어줍니다.',
    street: '여유 있는 실루엣과 개성 있는 무드를 살린 코디입니다. 활동적이고 트렌디한 인상을 줄 수 있습니다.',
    formal: '단정하고 깔끔한 인상을 주는 코디입니다. 정돈된 실루엣으로 전체적인 비율을 안정적으로 보여줍니다.',
    lovely: '부드럽고 사랑스러운 분위기를 살린 코디입니다. 화사한 이미지와 여성스러운 무드를 강조합니다.',
};

function ResultPage2() {
    const navigate = useNavigate();
    const { state } = useLocation();

    const [selectedOutfit, setSelectedOutfit] = useState(null);

    const gender = state?.gender || state?.analysis?.gender || 'female';
    const bodyType = state?.bodyType || state?.analysis?.bodyType || 'natural';
    const style = state?.style || state?.analysis?.style || 'casual';

    const bodyTypeText = bodyTypeLabels[bodyType] || bodyType;
    const selectedStyleText = styleLabels[style] || style;

    const currentImages = outfitImages[gender]?.[bodyType] || {};
    const bodyComment = bodyComments[bodyType] || bodyComments.natural;

    const fittingImage = state?.fittingImage || currentImages[style] || state?.image || '';

    const otherOutfits = Object.entries(currentImages)
        .filter(([styleId]) => styleId !== style)
        .map(([styleId, image]) => ({
            id: styleId,
            title: styleLabels[styleId] || styleId,
            image,
            desc: styleDescriptions[styleId] || '추천 스타일 코디입니다.',
        }));

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
                            {fittingImage ? (
                                <img
                                    src={fittingImage}
                                    alt="추천 코디 이미지"
                                    className="h-full w-full object-contain"
                                />
                            ) : (
                                <p className="text-gray-500 font-bold">추천 이미지가 없습니다.</p>
                            )}
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
                                    <span className="text-purple-600">{bodyTypeText}</span>입니다
                                </h2>

                                <div className="space-y-5 text-gray-900">
                                    <section className="rounded-2xl bg-white/55 p-4 shadow-sm">
                                        <h3 className="text-xl font-extrabold mb-2">숄더 라인 및 상체 분석:</h3>
                                        <p className="text-base leading-relaxed font-semibold">
                                            {bodyComment.shoulder}
                                        </p>
                                    </section>

                                    <section className="rounded-2xl bg-white/55 p-4 shadow-sm">
                                        <h3 className="text-xl font-extrabold mb-2">하체 및 비율 분석:</h3>
                                        <p className="text-base leading-relaxed font-semibold">{bodyComment.lower}</p>
                                    </section>

                                    <section className="rounded-2xl bg-white/55 p-4 shadow-sm">
                                        <h3 className="text-xl font-extrabold mb-2">코디네이션 전략:</h3>
                                        <p className="text-base leading-relaxed font-semibold">
                                            선택한 선호 스타일인{' '}
                                            <span className="text-purple-600">{selectedStyleText}</span>을 기반으로,{' '}
                                            {bodyComment.styling}
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
                                {otherOutfits.length > 0 ? (
                                    otherOutfits.map((set) => (
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
                                    ))
                                ) : (
                                    <p className="text-center text-gray-500 font-bold mt-10">
                                        다른 스타일 이미지가 없습니다.
                                    </p>
                                )}
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

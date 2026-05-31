import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const styles = [
    {
        id: 'casual',
        label: '캐주얼',
        img: '/images/casual.jpg',
        tags: ['#꾸안꾸', '#데일리룩', '#편안함', '#트렌디'],
        desc: '일상에서 가장 자연스럽게 입기 좋은 편안한 스타일',
    },
    {
        id: 'street',
        label: '스트릿',
        img: '/images/street.jpg',
        tags: ['#힙한', '#오버핏', '#개성', '#유니크'],
        desc: '자유롭고 개성 있는 분위기를 강조하는 스타일',
    },
    {
        id: 'lovely',
        label: '러블리',
        img: '/images/lovely.jpg',
        tags: ['#데이트룩', '#페미닌', '#부드러운', '#화사한'],
        desc: '부드럽고 사랑스러운 이미지를 살리는 스타일',
    },
    {
        id: 'formal',
        label: '포멀',
        img: '/images/formal.jpg',
        tags: ['#자유로운', '#빈티지', '#내추럴', '#감성룩'],
        desc: '자연스럽고 여유로운 분위기를 담은 스타일',
    },
];

const getSelectableStyles = (gender) => {
    if (gender === 'male') {
        return styles.filter((style) => style.id !== 'lovely');
    }

    return styles;
};

function Camera() {
    const navigate = useNavigate();
    const location = useLocation();

    const userData = location.state;
    const [selectedStyle, setSelectedStyle] = useState(null);

    const handleSelect = (styleId) => {
        setSelectedStyle((prev) => (prev === styleId ? null : styleId));
    };

    const handleResult = () => {
        if (!userData) {
            navigate('/input');
            return;
        }

        if (!selectedStyle) {
            alert('선호 스타일을 선택해주세요.');
            return;
        }

        navigate('/result', {
            state: {
                ...userData,
                style: selectedStyle,
            },
        });
    };

    return (
        <div className="min-h-screen w-full overflow-hidden bg-gradient-to-br from-emerald-200 via-violet-100 to-cyan-100 flex items-center justify-center px-6 py-10 relative">
            <div className="w-full max-w-[1050px]">
                <h1 className="text-center text-4xl font-extrabold text-gray-900 mb-10">선호 스타일 선택</h1>

                <div
                    className={
                        userData?.gender === 'male'
                            ? 'grid grid-cols-1 md:grid-cols-3 gap-6 justify-items-center'
                            : 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6'
                    }
                >
                    {getSelectableStyles(userData?.gender).map((item) => {
                        const isOpen = selectedStyle === item.id;

                        return (
                            <div key={item.id} className="flex flex-col items-center w-full max-w-[260px] mx-auto">
                                <button
                                    onClick={() => handleSelect(item.id)}
                                    className={`w-full h-20 rounded-full text-2xl font-extrabold text-white shadow-lg transition-all duration-300 ${
                                        isOpen
                                            ? 'bg-gradient-to-r from-pink-500 to-purple-500 scale-105'
                                            : 'bg-gradient-to-r from-purple-400 to-indigo-400 hover:scale-105'
                                    }`}
                                >
                                    {item.label}
                                </button>

                                <div
                                    className={`w-full mt-4 overflow-hidden transition-all duration-500 ${
                                        isOpen ? 'max-h-[420px] opacity-100' : 'max-h-0 opacity-0'
                                    }`}
                                >
                                    <div className="rounded-[32px] bg-white/65 backdrop-blur-md shadow-xl p-5">
                                        <div className="h-52 rounded-3xl bg-white/70 overflow-hidden flex items-center justify-center mb-4">
                                            <img
                                                src={item.img}
                                                alt={item.label}
                                                className="h-full w-full object-contain"
                                            />
                                        </div>

                                        <p className="text-center text-gray-700 font-semibold mb-4">{item.desc}</p>

                                        <div className="flex flex-wrap justify-center gap-2">
                                            {item.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-bold"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="flex justify-center mt-10">
                    <button
                        onClick={handleResult}
                        className="w-[320px] h-14 rounded-full bg-gradient-to-r from-purple-400 to-indigo-400 text-white text-xl font-extrabold shadow-lg hover:scale-105 transition"
                    >
                        결과 보기
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Camera;

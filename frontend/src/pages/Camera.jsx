import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function Camera() {
    const navigate  = useNavigate();
    const location  = useLocation();
    const userData  = location.state;
    const [status, setStatus] = useState('체형 분석 중...');

    useEffect(() => {
        if (!userData) {
            navigate('/input');
            return;
        }
        runAnalysis();
    }, []);

    const dataURLtoFile = (dataUrl, filename) => {
        const arr  = dataUrl.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) u8arr[n] = bstr.charCodeAt(n);
        return new File([u8arr], filename, { type: mime });
    };

    const runAnalysis = async () => {
        try {
            setStatus('체형 분석 중...');
            const personFile = dataURLtoFile(userData.image, 'person.jpg');

            const bodyFormData = new FormData();
            bodyFormData.append('image', personFile);
            bodyFormData.append('height', userData.height);
            bodyFormData.append('weight', userData.weight);
            bodyFormData.append('gender', userData.gender);

            const bodyResponse = await fetch('http://localhost:3000/api/body-analysis', {
                method: 'POST',
                body: bodyFormData,
            });
            const bodyResult = await bodyResponse.json();

            if (!bodyResponse.ok || !bodyResult.success) {
                throw new Error(bodyResult.message || '체형 분석 실패');
            }

            setStatus('코디 추천 중...');
            const recommendResponse = await fetch('http://localhost:3000/api/recommend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    gender: userData.gender,
                    bodyType: bodyResult.bodyType,
                }),
            });
            const recommendResult = await recommendResponse.json();

            navigate('/result', {
                state: {
                    ...userData,
                    bodyType: bodyResult.bodyType,
                    recommend: recommendResult,
                },
            });
        } catch (error) {
            console.error('분석 실패:', error);
            alert(error.message || '분석 중 오류가 발생했습니다.');
            navigate('/input');
        }
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-emerald-200 via-violet-100 to-cyan-100 flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                <p className="text-2xl font-extrabold text-gray-800">{status}</p>
                <p className="text-gray-500 mt-2">잠시만 기다려주세요</p>
            </div>
        </div>
    );
}

export default Camera;

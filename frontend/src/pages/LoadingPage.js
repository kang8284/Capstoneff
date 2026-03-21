import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAPI } from '../utils/api';

function LoadingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🔥 LoadingPage 진입');

    const processData = async () => {
      try {
        console.log('⏳ 분석 시작');

        // 🔥 [임시] 최소 1초 로딩 유지
        // 실제 서비스에서는 제거 가능
        await Promise.all([
          fetchAPI('/process', {
            method: 'POST'
          }),
          new Promise(resolve => setTimeout(resolve, 1000)) // ⏱ 1초 대기
        ]);

        console.log('✅ 분석 완료 → 결과 페이지 이동');

        navigate('/result');

      } catch (err) {
        console.error('❌ 처리 실패:', err);
        alert('처리 실패');
        navigate('/');
      }
    };

    processData();
  }, [navigate]);

  return (
    <div style={{ textAlign: 'center', padding: 50 }}>
      <h2>Loading...</h2>
      <p>AI가 분석 중입니다...</p>
    </div>
  );
}

export default LoadingPage;
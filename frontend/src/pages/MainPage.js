import React from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAPI } from '../utils/api';

function MainPage() {
  const navigate = useNavigate();

  const handleStart = async () => {
    try {
      console.log('세션 생성 요청');

      const data = await fetchAPI('/sessions', {
        method: 'POST'
      });

      console.log('세션 생성 완료:', data);

      localStorage.setItem('session_id', data.session_id);

      navigate('/loading');

    } catch (err) {
      console.error(err);
      alert('세션 생성 실패');
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: 50 }}>
      <h1>Welcome to Our App</h1>
      <button onClick={handleStart} style={{ fontSize: 20, padding: '10px 30px' }}>
        시작하기
      </button>
    </div>
  );
}

export default MainPage;
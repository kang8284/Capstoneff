import React from 'react';
import { useNavigate } from 'react-router-dom';

function MainPage() {
  const navigate = useNavigate();

  const handleStart = () => {
    console.log('새로운 세션 생성 요청');

    // user_id 없이 세션만 생성
    fetch('http://localhost:5000/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
      .then(res => res.json())
      .then(data => {
        console.log('세션 생성 완료:', data);

        // 필요하면 session_id 저장 가능
        localStorage.setItem('session_id', data.session_id);

        navigate('/loading');
      })
      .catch(err => {
        console.error('세션 생성 실패:', err);
        alert('세션 생성 실패');
      });
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
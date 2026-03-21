import React from 'react';
import { useNavigate } from 'react-router-dom';

function ResultPage({ setUserId }) {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div style={{ textAlign: 'center', padding: 50 }}>
      <h1>Result Page</h1>
      <p>여기에 결과 화면 표시 예정</p>
      <button onClick={handleBack} style={{ marginTop: 20, padding: '10px 20px' }}>
        처음으로 돌아가기
      </button>
    </div>
  );
}

export default ResultPage;
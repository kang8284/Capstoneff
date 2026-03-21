import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function LoadingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/result');
    }, 3000); // 3초 후 이동

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={{ textAlign: 'center', padding: 50 }}>
      <h2>Loading...</h2>
      <p>잠시만 기다려주세요.</p>
    </div>
  );
}

export default LoadingPage;
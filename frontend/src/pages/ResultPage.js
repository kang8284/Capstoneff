import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAPI } from '../utils/api';

function ResultPage() {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const data = await fetchAPI('/result');
        setResult(data);
      } catch (err) {
        console.error(err);
        alert('결과 조회 실패');
        navigate('/');
      }
    };

    fetchResult();
  }, [navigate]);

  return (
    <div style={{ textAlign: 'center', padding: 50 }}>
      <h1>Result Page</h1>

      {result ? (
        <div>
          <p>스타일: {result.style_type}</p>
          <p>설명: {result.description}</p>
        </div>
      ) : (
        <p>결과 불러오는 중...</p>
      )}

      <button onClick={() => navigate('/')} style={{ marginTop: 20 }}>
        처음으로
      </button>
    </div>
  );
}

export default ResultPage;
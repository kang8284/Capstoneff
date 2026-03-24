import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getResult } from '../api/result';

function ResultPage() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const result = await getResult();
        console.log('📊 결과:', result);
        setData(result);
      } catch (err) {
        console.error(err);
        alert('결과 불러오기 실패');
        navigate('/');
      }
    };

    fetchResult();
  }, [navigate]);

  if (!data) {
    return <div style={{ padding: 50 }}>결과 불러오는 중...</div>;
  }

  return (
    <div style={{ textAlign: 'center', padding: 50 }}>
      <h1>Result Page</h1>

      <h2>스타일: {data.style_type}</h2>
      <p>{data.description}</p>

      <button
        onClick={() => navigate('/')}
        style={{ marginTop: 20, padding: '10px 20px' }}
      >
        처음으로 돌아가기
      </button>
    </div>
  );
}

export default ResultPage;
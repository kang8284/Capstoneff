export const getResult = async () => {
  const sessionId = localStorage.getItem('session_id');

  if (!sessionId) {
    throw new Error('세션 없음');
  }

  const res = await fetch('http://localhost:5000/api/result', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'session-id': sessionId
    }
  });

  if (!res.ok) {
    throw new Error('결과 조회 실패');
  }

  return res.json();
};
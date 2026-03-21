const BASE_URL = 'http://localhost:5000/api';

// 🔥 공통 fetch 함수
export const fetchAPI = async (endpoint, options = {}) => {
  const sessionId = localStorage.getItem('session_id');

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(sessionId && { 'session-id': sessionId }), // 있으면 추가
      ...(options.headers || {})
    }
  });

  // ❗ 에러 처리
  if (!res.ok) {
    const text = await res.text();

    if (res.status === 401) {
      // 세션 만료 처리
      localStorage.removeItem('session_id');
      window.location.href = '/';
    }

    throw new Error(text || 'API 요청 실패');
  }

  return res.json();
};
import { fetchAPI } from '../utils/api';

// 세션 생성
export const createSession = () => {
  return fetchAPI('/sessions', {
    method: 'POST'
  });
};

// 전체 세션 조회 (필요할 때)
export const getSessions = () => {
  return fetchAPI('/sessions');
};

// 세션 삭제 (선택)
export const deleteSession = (id) => {
  return fetchAPI(`/sessions/${id}`, {
    method: 'DELETE'
  });
};
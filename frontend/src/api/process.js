import { fetchAPI } from '../utils/api';

// 분석 처리 요청
export const processData = () => {
  return fetchAPI('/process', {
    method: 'POST'
  });
};
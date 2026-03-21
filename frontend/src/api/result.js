import { fetchAPI } from '../utils/api';

// 결과 조회
export const getResult = () => {
  return fetchAPI('/result');
};
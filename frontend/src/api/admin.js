import { fetchAPI } from '../utils/api';

// DB 초기화
export const resetDatabase = () => {
  return fetchAPI('/admin/reset', {
    method: 'DELETE',
    headers: {
      'admin-key': '1234' // 🔥 백엔드랑 맞춰야 함
    }
  });
};
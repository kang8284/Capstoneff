import React from 'react';
import { useNavigate } from 'react-router-dom';
import { resetDatabase } from '../api/admin';

function AdminPage() {
  const navigate = useNavigate();

  // 🔥 DB 초기화
  const handleReset = async () => {
    const confirmReset = window.confirm('⚠️ 정말 DB를 초기화하시겠습니까?');

    if (!confirmReset) return;

    try {
      console.log('🔥 DB 초기화 요청');

      const res = await resetDatabase();

      console.log('✅ 초기화 완료:', res);
      alert('DB 초기화 완료');

    } catch (err) {
      console.error('❌ 초기화 실패:', err);
      alert('DB 초기화 실패');
    }
  };

  // 🔙 메인으로 돌아가기 (버튼용)
  const handleBack = () => {
    navigate('/');
  };

  return (
    <div style={{ textAlign: 'center', padding: 50 }}>
      <h1>🛠 관리자 페이지</h1>

      <p style={{ marginBottom: 30 }}>
        DB 관리 및 테스트 기능
      </p>

      {/* 🔥 DB 초기화 버튼 */}
      <button
        onClick={handleReset}
        style={{
          backgroundColor: 'red',
          color: 'white',
          fontSize: 18,
          padding: '10px 20px',
          marginRight: 10,
          cursor: 'pointer'
        }}
      >
        DB 초기화
      </button>

      {/* 🔙 메인 이동 버튼 */}
      <button
        onClick={handleBack}
        style={{
          fontSize: 16,
          padding: '10px 20px',
          cursor: 'pointer'
        }}
      >
        메인으로
      </button>
    </div>
  );
}

export default AdminPage;
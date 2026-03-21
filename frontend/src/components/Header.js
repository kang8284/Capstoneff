import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function Header() {
  const navigate = useNavigate();
  const clickTimer = useRef(null); // 🔥 타이머 관리

  // 🔥 단일 클릭 → 메인 이동 (딜레이 적용)
  const handleClick = () => {
    if (clickTimer.current) return;

    clickTimer.current = setTimeout(() => {
      console.log('🏠 메인 페이지 이동');
      navigate('/');
      clickTimer.current = null;
    }, 200); // 더블클릭 감지 시간
  };

  // 🔥 더블 클릭 → 관리자 이동
  const handleDoubleClick = () => {
    // 단일 클릭 취소
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
    }

    const key = prompt('관리자 키 입력');

    if (key === '1234') {
      console.log('✅ 관리자 페이지 이동');
      navigate('/admin');
    } else {
      console.log('❌ 관리자 접근 실패');
    }
  };

  return (
    <div
      style={{
        width: '100%',
        padding: '15px 20px',
        backgroundColor: '#222',
        color: 'white',
        fontSize: '18px',
        fontWeight: 'bold',
        cursor: 'pointer'
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      My App 🚀
    </div>
  );
}

export default Header;
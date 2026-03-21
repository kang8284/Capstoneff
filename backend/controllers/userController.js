// backend/controllers/userController.js
const userModel = require('../models/userModel');
const poolPromise = require('../config/db');

// =======================
// 세션 관련
// =======================

// 전체 세션 조회
exports.getSessions = async (req, res) => {
  try {
    const sessions = await userModel.getAllSessions();
    res.json(sessions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'DB 조회 실패' });
  }
};

// 세션 생성
exports.createSession = async (req, res) => {
  try {
    const result = await userModel.createSession();
    res.json({ session_id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'DB insert 실패' });
  }
};

// 세션 삭제
exports.deleteSession = async (req, res) => {
  try {
    const { id } = req.params;
    await userModel.deleteSession(id);
    res.json({ message: '세션 삭제 완료' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'DB 삭제 실패' });
  }
};


// =======================
// 분석 처리
// =======================

// 분석 처리
exports.processData = async (req, res) => {
  try {
    const sessionId = req.headers['session-id'];

    if (!sessionId) {
      return res.status(400).json({ message: 'session_id 필요' });
    }

    console.log('🔥 분석 요청 session:', sessionId);

    // 👉 TODO: 실제 DB 저장 로직
    // image_check → body_analysis_result → recommendation 연결 예정

    res.json({
      message: '처리 완료',
      session_id: sessionId
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '처리 실패' });
  }
};


// =======================
// 결과 조회
// =======================

// 결과 조회
exports.getResult = async (req, res) => {
  try {
    const sessionId = req.headers['session-id'];

    if (!sessionId) {
      return res.status(400).json({ message: 'session_id 필요' });
    }

    console.log('📊 결과 조회 session:', sessionId);

    // 👉 TODO: DB 조회 로직
    res.json({
      style_type: '캐주얼',
      description: '편안하고 자연스러운 스타일입니다.'
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '조회 실패' });
  }
};


// =======================
// 🔥 관리자 기능 (DB 초기화)
// =======================

exports.resetDatabase = async (req, res) => {
  try {
    // 🔐 간단한 관리자 키 (필수는 아니지만 추천)
    const adminKey = req.headers['admin-key'];

    if (adminKey !== '1234') {
      return res.status(403).json({ message: '권한 없음' });
    }

    const pool = await poolPromise;

    console.log('🔥🔥 DB 초기화 시작');

    // FK 비활성화
    await pool.query('SET FOREIGN_KEY_CHECKS = 0');

    // 🔥 순서 중요 (자식 → 부모)
    await pool.query('TRUNCATE TABLE fitting_result');
    await pool.query('TRUNCATE TABLE outfit_tag_map');
    await pool.query('TRUNCATE TABLE outfit');
    await pool.query('TRUNCATE TABLE recommendation');
    await pool.query('TRUNCATE TABLE body_analysis_result');
    await pool.query('TRUNCATE TABLE image_check');
    await pool.query('TRUNCATE TABLE user_session');

    // FK 다시 활성화
    await pool.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('✅ DB 초기화 완료');

    res.json({ message: 'DB 초기화 완료' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'DB 초기화 실패' });
  }
};
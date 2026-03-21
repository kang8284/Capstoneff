// backend/models/userModel.js
const poolPromise = require('../config/db');

// 전체 세션 조회
exports.getAllSessions = async () => {
  const pool = await poolPromise;
  const [results] = await pool.query('SELECT * FROM user_session');
  return results;
};

// 세션 생성 (🔥 user_id 제거)
exports.createSession = async () => {
  const pool = await poolPromise;
  const sql = 'INSERT INTO user_session () VALUES ()';
  const [result] = await pool.query(sql);
  return result;
};

// 세션 삭제
exports.deleteSession = async (session_id) => {
  const pool = await poolPromise;
  const [result] = await pool.query(
    'DELETE FROM user_session WHERE session_id = ?', 
    [session_id]
  );
  return result;
};
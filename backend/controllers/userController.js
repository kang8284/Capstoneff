// backend/controllers/userController.js
const userModel = require('../models/userModel');

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

// 세션 생성 (🔥 user_id 제거)
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
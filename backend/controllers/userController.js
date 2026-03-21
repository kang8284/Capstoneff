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



// 🔥🔥🔥 추가 시작 🔥🔥🔥

// 분석 처리
exports.processData = async (req, res) => {
  try {
    const sessionId = req.headers['session-id'];

    if (!sessionId) {
      return res.status(400).json({ message: 'session_id 필요' });
    }

    console.log('분석 요청 session:', sessionId);

    // 👉 TODO: 실제 DB 저장 로직 (지금은 더미)
    // 나중에 image_check → analysis → recommendation 연결

    res.json({
      message: '처리 완료',
      session_id: sessionId
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '처리 실패' });
  }
};


// 결과 조회
exports.getResult = async (req, res) => {
  try {
    const sessionId = req.headers['session-id'];

    if (!sessionId) {
      return res.status(400).json({ message: 'session_id 필요' });
    }

    console.log('결과 조회 session:', sessionId);

    // 👉 TODO: DB에서 가져오기 (지금은 더미)
    res.json({
      style_type: '캐주얼',
      description: '편안하고 자연스러운 스타일입니다.'
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '조회 실패' });
  }
};
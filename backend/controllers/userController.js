// backend/controllers/userController.js
const userModel = require('../models/userModel');

let dbPool;
exports.setPool = (pool) => {
  dbPool = pool;
};

// =======================
// 세션 생성
// =======================
exports.createSession = async (req, res) => {
  try {
    const result = await userModel.createSession();
    res.json({ session_id: result.insertId });
  } catch (err) {
    console.error('❌ createSession:', err);
    res.status(500).json({ message: '세션 생성 실패' });
  }
};

// =======================
// 세션 조회
// =======================
exports.getSessions = async (req, res) => {
  try {
    const [rows] = await dbPool.query(`
      SELECT 
        s.session_id,
        s.created_at,
        COUNT(*) AS recommendation_count
      FROM user_session s
      LEFT JOIN user_recommendation ur 
        ON s.session_id = ur.session_id
      GROUP BY s.session_id
      ORDER BY s.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('❌ getSessions:', err);
    res.status(500).json({ message: '세션 조회 실패' });
  }
};

// =======================
// 세션 삭제
// =======================
exports.deleteSession = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await dbPool.query(
      'DELETE FROM user_session WHERE session_id = ?',
      [id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: '세션 없음' });
    res.json({ message: '세션 삭제 완료' });
  } catch (err) {
    console.error('❌ deleteSession:', err);
    res.status(500).json({ message: '삭제 실패' });
  }
};

// =======================
// 추천 생성
// =======================
exports.processData = async (req, res) => {
  try {
    const sessionId = req.headers['session-id'];
    if (!sessionId) return res.status(400).json({ message: 'session_id 필요' });

    console.log('🔥 추천 생성 session:', sessionId);

    const [sessionRows] = await dbPool.query(
      'SELECT session_id FROM user_session WHERE session_id = ?',
      [sessionId]
    );
    if (sessionRows.length === 0) return res.status(400).json({ message: '유효하지 않은 session_id' });

    const [recRows] = await dbPool.query(
      'SELECT recommendation_id FROM recommendation ORDER BY RAND() LIMIT 1'
    );
    if (!recRows.length) return res.status(500).json({ message: '추천 데이터 없음 (seed 필요)' });

    const recommendationId = recRows[0].recommendation_id;

    await dbPool.query('DELETE FROM user_recommendation WHERE session_id = ?', [sessionId]);
    await dbPool.query(
      'INSERT INTO user_recommendation (session_id, recommendation_id) VALUES (?, ?)',
      [sessionId, recommendationId]
    );

    res.json({ message: '추천 생성 완료', recommendation_id: recommendationId });
  } catch (err) {
    console.error('❌ processData 에러:', err);
    res.status(500).json({ message: '추천 생성 실패', error: err.message });
  }
};

// =======================
// 결과 조회
// =======================
exports.getResult = async (req, res) => {
  try {
    const sessionId = req.headers['session-id'];
    if (!sessionId) return res.status(400).json({ message: 'session_id 필요' });

    const [rows] = await dbPool.query(`
      SELECT 
        r.style_type,
        r.description,
        o.outfit_id,
        o.name,
        o.image_url,
        o.category
      FROM user_recommendation ur
      JOIN recommendation r ON ur.recommendation_id = r.recommendation_id
      LEFT JOIN outfit o ON r.recommendation_id = o.recommendation_id
      WHERE ur.session_id = ?
    `, [sessionId]);

    if (!rows.length) return res.status(404).json({ message: '결과 없음' });

    const result = {
      style_type: rows[0].style_type,
      description: rows[0].description,
      outfits: rows.map(r => ({
        outfit_id: r.outfit_id,
        name: r.name,
        image_url: r.image_url,
        category: r.category
      }))
    };

    res.json(result);
  } catch (err) {
    console.error('❌ getResult 에러:', err);
    res.status(500).json({ message: '조회 실패', error: err.message });
  }
};

// =======================
// DB 초기화 + Seed 재생성
// =======================
exports.resetDatabase = async (req, res) => {
  try {
    console.log('🔥 DB 초기화 시작');
    await dbPool.query('SET FOREIGN_KEY_CHECKS = 0');

    const tables = [
      'fitting_result',
      'user_recommendation',
      'outfit_tag_map',
      'outfit',
      'recommendation',
      'body_analysis_result',
      'image_check',
      'user_session'
    ];

    for (const t of tables) await dbPool.query(`TRUNCATE TABLE ${t}`);
    await dbPool.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ DB 초기화 완료');

    // 🔥 Seed 재생성
    const runSeed = require('../seed');
    await runSeed(dbPool);
    console.log('🌱 Seed 재생성 완료');

    res.json({ message: 'DB 초기화 및 Seed 재생성 완료' });

  } catch (err) {
    console.error('❌ resetDatabase:', err);
    res.status(500).json({ message: '초기화 실패', error: err.message });
  }
};
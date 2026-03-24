// backend/seed/recommendation.seed.js
const poolPromise = require('../config/db');

async function seedRecommendation() {
  const pool = await poolPromise;

  const [analysisRows] = await pool.query(
    `SELECT analysis_id FROM body_analysis_result LIMIT 1`
  );

  let analysisId;

  if (analysisRows.length > 0) {
    analysisId = analysisRows[0].analysis_id;
    console.log('⏩ 기존 analysis 사용:', analysisId);
  } else {
    console.log('⚠️ analysis 없음 → 생성');

    const [sessionResult] = await pool.query(`INSERT INTO user_session () VALUES ()`);
    const sessionId = sessionResult.insertId;

    const [imageResult] = await pool.query(
      `INSERT INTO image_check (session_id, image_url, check_status)
       VALUES (?, 'seed.jpg', '완료')`,
      [sessionId]
    );

    const [analysisResult] = await pool.query(
      `INSERT INTO body_analysis_result 
       (image_id, body_type, height, weight, details)
       VALUES (?, '보통형', 175, 70, 'seed 데이터')`,
      [imageResult.insertId]
    );

    analysisId = analysisResult.insertId;
  }

  const [rows] = await pool.query(
    `SELECT recommendation_id FROM recommendation WHERE analysis_id = ? LIMIT 1`,
    [analysisId]
  );

  if (rows.length > 0) {
    console.log('⏩ recommendation 이미 존재');
    return rows[0].recommendation_id;
  }

  const [result] = await pool.query(
    `INSERT INTO recommendation (analysis_id, style_type, description)
     VALUES (?, '캐주얼', '편안한 스타일')`,
    [analysisId]
  );

  console.log('✅ recommendation 생성');

  return result.insertId;
}

module.exports = seedRecommendation;
const poolPromise = require('../config/db');

async function seedTemplateAnalysis() {
  const pool = await poolPromise;

  // 이미 템플릿 analysis 있으면 그대로 사용
  const [rows] = await pool.query(`
    SELECT analysis_id FROM body_analysis_result 
    WHERE details = '템플릿용 더미' LIMIT 1
  `);

  if (rows.length > 0) {
    console.log('⏩ 기존 템플릿 analysis 사용:', rows[0].analysis_id);
    return rows[0].analysis_id;
  }

  console.log('🧱 템플릿 analysis 생성');

  // session 없이 생성 (FK 때문에 image 필요)
  const [session] = await pool.query(`INSERT INTO user_session () VALUES ()`);
  const [image] = await pool.query(`
    INSERT INTO image_check (session_id, image_url, check_status)
    VALUES (?, 'template.jpg', '완료')
  `, [session.insertId]);

  const [analysis] = await pool.query(`
    INSERT INTO body_analysis_result
    (image_id, body_type, height, weight, details)
    VALUES (?, '템플릿형', 0, 0, '템플릿용 더미')
  `, [image.insertId]);

  return analysis.insertId;
}

module.exports = { seedTemplateAnalysis };
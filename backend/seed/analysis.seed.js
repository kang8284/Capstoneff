// backend/seed/analysis.seed.js

async function seedTemplateAnalysis(pool) {
  console.log('🧱 템플릿 analysis 생성');

  const [session] = await pool.query(
    `INSERT INTO user_session () VALUES ()`
  );

  const [image] = await pool.query(
    `INSERT INTO image_check (session_id, image_url, check_status)
     VALUES (?, 'template.jpg', '완료')`,
    [session.insertId]
  );

  const [analysis] = await pool.query(
    `INSERT INTO body_analysis_result
     (image_id, body_type, height, weight, details)
     VALUES (?, '템플릿형', 0, 0, '템플릿용 더미')`,
    [image.insertId]
  );

  return analysis.insertId;
}

module.exports = { seedTemplateAnalysis };
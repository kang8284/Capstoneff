// backend/seed/recommendation.seed.js

async function seedRecommendation(pool, analysisId) {
  const [result] = await pool.query(
    `INSERT INTO recommendation (analysis_id, style_type, description)
     VALUES (?, '캐주얼', '편안한 스타일')`,
    [analysisId]
  );

  console.log('✅ recommendation 생성');

  return result.insertId;
}

module.exports = seedRecommendation;
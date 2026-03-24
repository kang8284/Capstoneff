// backend/seed/index.js

const { seedTemplateAnalysis } = require('./analysis.seed');
const seedRecommendation = require('./recommendation.seed');
const seedOutfit = require('./outfit.seed');
const seedTag = require('./tag.seed');

async function runSeed(pool) {
  try {
    console.log('🌱 Seed 시작');

    // 0️⃣ 초기화
    await pool.query('SET FOREIGN_KEY_CHECKS = 0');

    await pool.query('TRUNCATE TABLE outfit_tag_map');
    await pool.query('TRUNCATE TABLE outfit');
    await pool.query('TRUNCATE TABLE recommendation');
    await pool.query('TRUNCATE TABLE body_analysis_result');
    await pool.query('TRUNCATE TABLE image_check');
    await pool.query('TRUNCATE TABLE user_session');

    await pool.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('🧹 전체 초기화 완료');

    // 1️⃣ analysis
    const analysisId = await seedTemplateAnalysis(pool);
    console.log('🧱 analysis:', analysisId);

    // 2️⃣ recommendation
    const recommendationId = await seedRecommendation(pool, analysisId);
    console.log('✅ recommendation:', recommendationId);

    // 3️⃣ outfit
    const outfitIds = await seedOutfit(pool, recommendationId);
    console.log('👕 outfit:', outfitIds);

    // 4️⃣ tag
    await seedTag(pool, outfitIds);
    console.log('🏷️ tag 완료');

    console.log('✅ Seed 완료');

  } catch (err) {
    console.error('❌ Seed 실패:', err);
    throw err;
  }
}

module.exports = runSeed;
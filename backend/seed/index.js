const poolPromise = require('../config/db');

// 🔹 템플릿용 analysis 시드
const { seedTemplateAnalysis } = require('./analysis.seed');

const seedRecommendation = require('./recommendation.seed');
const seedOutfit = require('./outfit.seed');
const seedTag = require('./tag.seed');

async function runSeed() {
  try {
    const pool = await poolPromise;

    console.log('🌱 Seed 시작');

    // =========================
    // 1️⃣ analysis 템플릿용 더미 생성
    // =========================
    const analysisId = await seedTemplateAnalysis();
    console.log('🧱 템플릿 analysis ID:', analysisId);

    // =========================
    // 2️⃣ recommendation
    // =========================
    const [recRows] = await pool.query(
      `SELECT recommendation_id FROM recommendation LIMIT 1`
    );

    let recommendationId;

    if (recRows.length > 0) {
      recommendationId = recRows[0].recommendation_id;
      console.log('⚠️ 기존 recommendation 사용:', recommendationId);
    } else {
      // ⚡ analysisId를 전달하여 FK 문제 방지
      recommendationId = await seedRecommendation(analysisId);
      console.log('✅ recommendation 생성:', recommendationId);
    }

    // =========================
    // 3️⃣ outfit
    // =========================
    const [outfitRows] = await pool.query(
      `SELECT COUNT(*) as count FROM outfit WHERE recommendation_id = ?`,
      [recommendationId]
    );

    let outfitIds;

    if (outfitRows[0].count > 0) {
      console.log('⚠️ outfit 이미 존재 → 조회');

      const [existing] = await pool.query(
        `SELECT outfit_id FROM outfit WHERE recommendation_id = ?`,
        [recommendationId]
      );

      outfitIds = existing.map(o => o.outfit_id);
    } else {
      outfitIds = await seedOutfit(recommendationId);
      console.log('👕 outfit 생성:', outfitIds);
    }

    // =========================
    // 4️⃣ tag
    // =========================
    const [tagRows] = await pool.query(
      `SELECT COUNT(*) as count FROM outfit_tag_map`
    );

    if (tagRows[0].count > 0) {
      console.log('⚠️ tag 이미 존재 → 스킵');
    } else {
      await seedTag(outfitIds);
      console.log('🏷️ tag 생성 완료');
    }

    console.log('✅ Seed 완료');

  } catch (err) {
    console.error('❌ Seed 실패:', err);
  }
}

module.exports = runSeed;
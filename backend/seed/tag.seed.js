// backend/seed/tag.seed.js
const poolPromise = require('../config/db');

async function seedTag(outfitIds) {
  const pool = await poolPromise;

  await pool.query(
    `INSERT INTO outfit_tag_map (outfit_id, tag)
     VALUES 
       (?, '캐주얼'),
       (?, '데일리'),
       (?, '포멀')`,
    outfitIds
  );
}

module.exports = seedTag; // ⭐ 이게 핵심
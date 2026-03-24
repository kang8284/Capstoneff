// backend/seed/tag.seed.js

async function seedTag(pool, outfitIds) {
  await pool.query(
    `INSERT INTO outfit_tag_map (outfit_id, tag)
     VALUES 
       (?, '캐주얼'),
       (?, '데일리'),
       (?, '포멀')`,
    outfitIds
  );
}

module.exports = seedTag;
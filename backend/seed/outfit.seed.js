// backend/seed/outfit.seed.js

async function seedOutfit(pool, recommendationId) {
  const [o1] = await pool.query(
    `INSERT INTO outfit (recommendation_id, name, image_url, category)
     VALUES (?, '화이트 셔츠', 'shirt.jpg', '상의')`,
    [recommendationId]
  );

  const [o2] = await pool.query(
    `INSERT INTO outfit (recommendation_id, name, image_url, category)
     VALUES (?, '청바지', 'jeans.jpg', '하의')`,
    [recommendationId]
  );

  const [o3] = await pool.query(
    `INSERT INTO outfit (recommendation_id, name, image_url, category)
     VALUES (?, '블랙 자켓', 'jacket.jpg', '아우터')`,
    [recommendationId]
  );

  return [o1.insertId, o2.insertId, o3.insertId];
}

module.exports = seedOutfit;
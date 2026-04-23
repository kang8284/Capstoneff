const mongoose = require('mongoose');
require('dotenv').config();

const Outfit = mongoose.model(
  'Outfit',
  new mongoose.Schema({
    gender: String,
    bodyType: String,
    style: String,
    category: String,
    name: String,
    imageUrl: String
  })
);

const MONGO_URL = process.env.MONGO_URL;

/* =========================
   DB 연결
========================= */
async function connect() {
  await mongoose.connect(MONGO_URL);
  console.log('✅ DB 연결 완료');
}

/* =========================
   전체 조회
========================= */
async function list() {
  const data = await Outfit.find();
  console.log(data);
}

/* =========================
   조건 검색
========================= */
async function search(gender, style, category) {
  const query = {};

  if (gender) query.gender = gender;
  if (style) query.style = style;
  if (category) query.category = category;

  const data = await Outfit.find(query);
  console.log(data);
}

/* =========================
   추가
========================= */
async function add(gender, bodyType, style, category, name, imageUrl) {
  const item = await Outfit.create({
    gender,
    bodyType,
    style,
    category,
    name,
    imageUrl
  });

  console.log('✔ 추가 완료:', item);
}

/* =========================
   수정
========================= */
async function update(id, field, value) {
  const updateObj = {};
  updateObj[field] = value;

  const result = await Outfit.findByIdAndUpdate(id, updateObj, {
    new: true
  });

  console.log('✔ 수정 완료:', result);
}

/* =========================
   삭제
========================= */
async function remove(id) {
  await Outfit.findByIdAndDelete(id);
  console.log('✔ 삭제 완료');
}

/* =========================
   CLI 실행
========================= */
async function run() {
  await connect();

  const cmd = process.argv[2];

  try {
    switch (cmd) {

      /* ===== 전체 조회 ===== */
      case 'list':
        await list();
        break;

      /* ===== 검색 ===== */
      case 'search':
        await search(
          process.argv[3], // gender
          process.argv[4], // style
          process.argv[5]  // category
        );
        break;

      /* ===== 추가 ===== */
      case 'add':
        await add(
          process.argv[3], // gender
          process.argv[4], // bodyType
          process.argv[5], // style
          process.argv[6], // category
          process.argv[7], // name
          process.argv[8]  // imageUrl
        );
        break;

      /* ===== 수정 ===== */
      case 'update':
        await update(
          process.argv[3], // id
          process.argv[4], // field
          process.argv[5]  // value
        );
        break;

      /* ===== 삭제 ===== */
      case 'delete':
        await remove(process.argv[3]);
        break;

      default:
        console.log(`
📌 사용법

👉 전체 조회
node cli.js list

👉 검색
node cli.js search 남자 캐주얼 top

👉 추가
node cli.js add 남자 스트레이트 캐주얼 top "오버핏 셔츠" https://url.com/img.jpg

👉 수정
node cli.js update <id> name "새 이름"

👉 삭제
node cli.js delete <id>
        `);
    }

  } catch (err) {
    console.error('❌ 오류:', err.message);
  }

  await mongoose.disconnect();
}

run();
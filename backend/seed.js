const mongoose = require('mongoose');
require('dotenv').config();

/* =========================
   Schema
========================= */
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
   상품 이름 데이터
========================= */
const names = {
  top: {
    남자: ['오버핏 셔츠', '기본 티셔츠', '스트릿 후드', '니트 스웨터'],
    여자: ['크롭 티셔츠', '오버핏 셔츠', '니트 블라우스', '슬림 티셔츠']
  },
  bottom: {
    남자: ['와이드 슬랙스', '조거 팬츠', '데님 팬츠', '카고 팬츠'],
    여자: ['와이드 팬츠', '미니스커트', '슬랙스', '데님 팬츠']
  },
  jacket: {
    남자: ['데님 자켓', '블레이저', '바람막이', '가죽 자켓'],
    여자: ['크롭 자켓', '트위드 자켓', '가디건', '데님 자켓']
  }
};

async function seed() {
  try {
    await mongoose.connect(MONGO_URL, {
      serverSelectionTimeoutMS: 5000
    });

    console.log('✅ DB 연결 성공');

    await Outfit.deleteMany({});
    console.log('🧹 기존 데이터 삭제');

    const genders = ['남자', '여자'];
    const maleStyles = ['캐주얼', '스트릿', '포멀'];
    const femaleStyles = ['캐주얼', '스트릿', '러블리', '포멀'];
    const bodyTypes = ['스트레이트', '웨이브', '내추럴'];
    const categories = ['top', 'bottom', 'jacket'];

    const data = [];

    for (const gender of genders) {
      const styles = gender === '남자' ? maleStyles : femaleStyles;

      for (const style of styles) {
        for (const bodyType of bodyTypes) {
          for (const category of categories) {

            const nameList = names[category][gender];

            const randomName =
              nameList[Math.floor(Math.random() * nameList.length)];

            data.push({
              gender,
              bodyType,
              style,
              category,
              name: randomName,

              // 🔥 지금은 placeholder (중요)
              imageUrl: ''
            });
          }
        }
      }
    }

    await Outfit.insertMany(data);

    console.log(`🔥 seed 완료: ${data.length}`);

  } catch (err) {
    console.error('❌ seed 실패:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
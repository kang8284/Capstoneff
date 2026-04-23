const express = require('express');
const cors = require('cors');
const multer = require('multer');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// 🔥 이미지 정적 접근
app.use('/uploads', express.static('uploads'));

/* =========================
   MongoDB Atlas 연결
========================= */
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('MongoDB Atlas 연결 성공'))
  .catch(err => console.error('DB 연결 실패:', err));

/* =========================
   Schema (🔥 name 추가)
========================= */
const outfitSchema = new mongoose.Schema({
  gender: String,
  bodyType: String,
  style: String,
  category: String,
  name: String,        // 🔥 추가
  imageUrl: String
});

const Outfit = mongoose.model('Outfit', outfitSchema);

/* =========================
   Multer 설정
========================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

/* =========================
   1. 업로드 API
========================= */
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    const { height, weight, gender, style } = req.body;
    const image = req.file;

    res.json({
      message: '성공',
      data: {
        height,
        weight,
        gender,
        style,
        imageUrl: image
          ? `http://localhost:3000/uploads/${image.filename}`
          : null
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '서버 오류' });
  }
});

/* =========================
   2. 추천 API (최종 안정화)
========================= */
app.post('/api/recommend', async (req, res) => {
  try {
    const { gender, style } = req.body;

    // 🔥 bodyType 랜덤 (임시)
    const bodyTypes = ['스트레이트', '웨이브', '내추럴'];
    const bodyType =
      bodyTypes[Math.floor(Math.random() * bodyTypes.length)];

    console.log('랜덤 bodyType:', bodyType);

    // 🔥 DB 조회
    const results = await Outfit.find({
      gender,
      style,
      bodyType
    });

    // 🔥 카테고리 분리
    const top = results.filter(i => i.category === 'top');
    const bottom = results.filter(i => i.category === 'bottom');
    const jacket = results.filter(i => i.category === 'jacket');

    // 🔥 항상 배열 보장 + name 포함 구조 유지
    res.json({
      bodyType,
      top: top ?? [],
      bottom: bottom ?? [],
      jacket: jacket ?? []
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: '추천 실패',
      bodyType: null,
      top: [],
      bottom: [],
      jacket: []
    });
  }
});

/* =========================
   서버 실행
========================= */
app.listen(3000, () => {
  console.log('서버 실행: http://localhost:3000');
});
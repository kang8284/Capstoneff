// backend/app.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'DELETE'],
  credentials: true
}));

// 🔑 모듈 import
const initDB = require('./config/db');              // DB 초기화
const userModel = require('./models/userModel');   // 모델
const userController = require('./controllers/userController'); // 컨트롤러
const sessionRoutes = require('./routes/sessionRoutes');        // 라우터
const runSeed = require('./seed');                 // Seed 실행

async function startServer() {
  try {
    // 1️⃣ DB 초기화
    const pool = await initDB();
    console.log('✅ DB 준비 완료');

    // 2️⃣ 모델과 컨트롤러에 pool 전달
    userModel.setPool(pool);
    userController.setPool(pool);

    // 3️⃣ Seed 자동 실행 + 중복 방지
    const [rows] = await pool.query('SELECT COUNT(*) AS count FROM recommendation');
    if (rows[0].count === 0 || process.env.SEED === 'true') {
      console.log('🌱 Seed 실행 중...');
      await runSeed(pool);
      console.log('🌱 Seed 완료');
    } else {
      console.log('🌱 Seed 데이터 이미 존재, 실행 생략');
    }

    // 4️⃣ 라우트 등록
    app.use('/api', sessionRoutes);

    // 5️⃣ 서버 시작
    app.listen(PORT, () => console.log(`🚀 Backend running on http://localhost:${PORT}`));

  } catch (err) {
    console.error('❌ 서버 시작 실패:', err);
  }
}

// 서버 시작
startServer();
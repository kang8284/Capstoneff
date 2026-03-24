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

// 🔥 비동기 초기화 구조로 변경
async function startServer() {
  try {
    // 1️⃣ DB 초기화
    const poolPromise = require('./config/db');
    await poolPromise;

    console.log('✅ DB 준비 완료');

    // 2️⃣ Seed 실행 (여기서 실행해야 함 ⭐)
    if (process.env.SEED === 'true') {
      const runSeed = require('./seed/index');
      await runSeed();  // ← 🔥 여기 중요
    }

    // 3️⃣ 라우트 등록
    const sessionRoutes = require('./routes/sessionRoutes');
    app.use('/api', sessionRoutes);

    // 4️⃣ 서버 시작
    app.listen(PORT, () => {
      console.log(`🚀 Backend running on http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error('❌ 서버 시작 실패:', err);
  }
}

startServer();
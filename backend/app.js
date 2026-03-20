const express = require('express');
const cors = require('cors'); // 이미 설치한 상태
const app = express();
require('dotenv').config();
const PORT = 5000;

// body parsing
app.use(express.json());

// CORS 허용
app.use(cors({
  origin: 'http://localhost:3000', // React 앱 주소
  methods: ['GET', 'POST', 'DELETE'],
  credentials: true
}));

// 라우트
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

// 서버 시작
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
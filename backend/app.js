const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());        // 프론트 연결 허용
app.use(express.json());

// 테스트 API
app.get('/api', (req, res) => {
  res.json({ message: '백엔드 연결 성공!' });
});

app.listen(3000, () => {
  console.log('서버 실행: http://localhost:3000');
});
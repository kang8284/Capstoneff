const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();

const PORT = 5000;

app.use(express.json());

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'DELETE'],
  credentials: true
}));

// 🔥 여기 수정
const sessionRoutes = require('./routes/sessionRoutes');
app.use('/api', sessionRoutes);

app.listen(PORT, () => 
  console.log(`Backend running on http://localhost:${PORT}`)
);
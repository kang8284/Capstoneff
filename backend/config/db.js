// backend/config/db.js
const mysql = require('mysql2/promise');
require('dotenv').config(); // 🔥 .env 자동 로드
const fs = require('fs');
const path = require('path');

async function initDB() {
  try {
    // 🔍 환경변수 확인 (디버깅용 - 필요 없으면 삭제 가능)
    console.log('DB_HOST:', process.env.DB_HOST);
    console.log('DB_USER:', process.env.DB_USER);
    console.log('DB_NAME:', process.env.DB_NAME);

    // 1️⃣ DB 연결 (DB 생성용)
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });

    // 2️⃣ DB 생성
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\` 
       CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    console.log(`✅ DB '${process.env.DB_NAME}' 준비 완료`);

    // 3️⃣ Pool 생성 (실제 사용)
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // 4️⃣ schema.sql 읽기
    const schemaPath = path.join(__dirname, '../schema/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // 5️⃣ SQL 문 분리 (주석 제거 포함)
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));

    // 6️⃣ 실행
    for (const stmt of statements) {
      await pool.query(stmt);
    }

    console.log('✅ DB 스키마 적용 완료');

    return pool;

  } catch (err) {
    console.error('❌ DB 초기화 실패:', err);
    process.exit(1);
  }
}

module.exports = initDB();
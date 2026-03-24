// backend/config/db.js
const mysql = require('mysql2/promise');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

async function initDB() {
  try {
    // 🔍 환경변수 확인
    console.log('DB_HOST:', process.env.DB_HOST);
    console.log('DB_USER:', process.env.DB_USER);
    console.log('DB_NAME:', process.env.DB_NAME);

    // 1️⃣ DB 생성용 연결
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });

    // 2️⃣ DB 생성
    await connection.query(`
      CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`
      CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);

    console.log(`✅ DB '${process.env.DB_NAME}' 준비 완료`);

    await connection.end(); // 🔥 중요: 초기 connection 닫기

    // 3️⃣ Pool 생성
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      multipleStatements: true // 🔥 이거 추가
      
    });

    // 4️⃣ schema.sql 읽기
    const schemaPath = path.join(__dirname, '../schema/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // 🔥 핵심: split 제거하고 한 번에 실행
    await pool.query(schema);

    console.log('✅ DB 스키마 적용 완료');

    return pool;

  } catch (err) {
    console.error('❌ DB 초기화 실패:', err);
    process.exit(1);
  }
}

module.exports = initDB();
// backend/config/db.js
const mysql = require('mysql2/promise'); // promise 기반으로
require('dotenv').config();
const fs = require('fs');
const path = require('path');

async function initDB() {
  try {
    // 1️⃣ DB 연결 (database 옵션 제외)
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '1234'
    });

    // 2️⃣ DB 생성
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    console.log(`✅ DB '${process.env.DB_NAME}' 준비 완료`);

    // 3️⃣ DB 지정해서 풀 생성
    const pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '1234',
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10
    });

    // 4️⃣ schema.sql 읽기
    const schemaPath = path.join(__dirname, '../schema/schema.sql');
    let schema = fs.readFileSync(schemaPath, 'utf8');

    // 5️⃣ 주석과 빈 줄 제거, 각 문장 단위로 분리
    const statements = schema
      .split(';')            // 세미콜론으로 구분
      .map(s => s.trim())    // 앞뒤 공백 제거
      .filter(s => s && !s.startsWith('--')); // 빈 줄과 주석 제거

    // 6️⃣ 순차적으로 실행
    for (const stmt of statements) {
      await pool.query(stmt);
    }

    console.log('✅ DB 스키마 적용 완료');

    return pool;
  } catch (err) {
    console.error('DB 초기화 실패:', err);
    process.exit(1);
  }
}

module.exports = initDB();
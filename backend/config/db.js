// backend/config/db.js
const mysql = require('mysql2/promise');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const seedDatabase = require('../seed');

async function initDB() {
  try {
    console.log('DB_HOST:', process.env.DB_HOST);
    console.log('DB_USER:', process.env.DB_USER);
    console.log('DB_NAME:', process.env.DB_NAME);

    // DB 생성용 연결
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });

    await connection.query(`
      CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`
      CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);
    console.log(`✅ DB '${process.env.DB_NAME}' 준비 완료`);
    await connection.end();

    // Pool 생성
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      multipleStatements: true
    });

    // 스키마 적용
    const schemaPath = path.join(__dirname, '../schema/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schema);
    console.log('✅ DB 스키마 적용 완료');

    // Seed 실행 (환경변수 SEED=true 일 때만)
    if (process.env.SEED === 'true') {
      console.log('🌱 Seed 시작');
      await seedDatabase(pool);
      console.log('🌱 Seed 완료');
    }

    return pool;

  } catch (err) {
    console.error('❌ DB 초기화 실패:', err);
    process.exit(1);
  }
}

module.exports = initDB;
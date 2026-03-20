const mysql = require('mysql2');

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'yourpassword',
  database: process.env.DB_NAME || 'testdb'
});

db.connect(err => {
  if (err) console.error('DB 연결 실패:', err);
  else console.log('MySQL 연결 성공');
});

module.exports = db;
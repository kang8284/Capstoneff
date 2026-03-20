const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

exports.getAllItems = (callback) => {
  pool.query('SELECT * FROM items', (err, results) => {
    if (err) {
      console.error('DB select 에러:', err);
      return callback(err);
    }
    callback(null, results);
  });
};

exports.createItem = (title, description, callback) => {
  const sql = 'INSERT INTO items (title, description) VALUES (?, ?)';
  pool.query(sql, [title, description], (err, result) => {
    if (err) {
      console.error('DB insert 에러:', err);
      return callback(err);
    }
    callback(null, result);
  });
};

exports.deleteItem = (id, callback) => {
  pool.query('DELETE FROM items WHERE id = ?', [id], (err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
};
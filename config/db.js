const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  multipleStatements: true, // للسماح بتشغيل عدة أومر SQL معاً
  ssl: {
    rejectUnauthorized: false
  }
});

const promisePool = pool.promise();

// دالة لإنشاء الجداول من ملف schema.sql تلقائياً
async function initDB() {
  try {
    const schemaPath = path.join(__dirname, '../schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, 'utf8');
      await promisePool.query(sql);
      console.log('✅ تم إنشاء الجداول في Aiven بنجاح!');
    }
  } catch (err) {
    console.error('❌ خطأ أثناء إنشاء الجداول:', err.message);
  }
}

initDB();

module.exports = promisePool;
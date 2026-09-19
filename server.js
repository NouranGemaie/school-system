const express = require('express');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
app.use(express.json());

// إعدادات الاتصال بقاعدة بيانات Aiven
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'defaultdb',
    port: process.env.DB_PORT || 3306,
    ssl: { rejectUnauthorized: false },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// التأكد من الاتصال وإنشاء الجداول أوتوماتيك
db.getConnection((err, connection) => {
    if (err) {
        console.error('❌ خطأ في الاتصال بقاعدة بيانات Aiven:', err.message);
        return;
    }
    console.log('✅ تم الاتصال بقاعدة بيانات Aiven بنجاح!');

    const tables = [
        `CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(100) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            role ENUM('admin', 'teacher') NOT NULL
        )`,
        `CREATE TABLE IF NOT EXISTS students (
            id INT AUTO_INCREMENT PRIMARY KEY,
            fingerprint_id VARCHAR(50) NOT NULL UNIQUE,
            name VARCHAR(150) NOT NULL,
            class_name VARCHAR(50) NOT NULL,
            parent_phone VARCHAR(20) NOT NULL,
            fee_status ENUM('paid', 'unpaid') DEFAULT 'unpaid',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS attendance (
            id INT AUTO_INCREMENT PRIMARY KEY,
            student_id INT,
            session_type ENUM('morning', 'after_break') NOT NULL,
            scan_date DATE NOT NULL,
            scan_time TIME NOT NULL,
            FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
        )`,
        `CREATE TABLE IF NOT EXISTS teacher_schedules (
            id INT AUTO_INCREMENT PRIMARY KEY,
            teacher_id INT,
            class_name VARCHAR(50) NOT NULL,
            subject VARCHAR(100) NOT NULL,
            day_of_week VARCHAR(20) NOT NULL,
            time_slot VARCHAR(50) NOT NULL,
            FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
        )`,
        `CREATE TABLE IF NOT EXISTS activity_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            teacher_id INT,
            action_description TEXT NOT NULL,
            logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
        )`
    ];

    let createdCount = 0;
    tables.forEach((sql, index) => {
        connection.query(sql, (tableErr) => {
            if (tableErr) {
                console.error(`❌ خطأ أثناء إنشاء الجدول رقم ${index + 1}:`, tableErr.message);
            } else {
                createdCount++;
                if (createdCount === tables.length) {
                    console.log('🚀 تم إنشاء جميع الجداول بنجاح تام على Aiven!');
                }
            }
            if (index === tables.length - 1) {
                connection.release();
            }
        });
    });
});

app.get('/', (req, res) => {
    res.send('School System API is running successfully with Aiven DB!');
});
const studentRoutes = require('./routes/studentRoutes')(db);
app.use('/api/students', studentRoutes);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

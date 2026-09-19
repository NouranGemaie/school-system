const express = require('express');
const router = express.Router();

// دي دالة الاتصال بقاعدة البيانات اللي عرفناها في server.js (هنخليها تستورد الـ pool)
module.exports = (db) => {

    // 1. مسار تسجيل طالبة جديدة (خاص بالأدمن)
    router.post('/add-student', (req, res) => {
        const { fingerprint_id, name, class_name, parent_phone, fee_status } = req.body;

        if (!fingerprint_id || !name || !class_name || !parent_phone) {
            return res.status(400).json({ success: false, message: 'جميع الحقول الأساسية مطلوبة!' });
        }

        const query = `INSERT INTO students (fingerprint_id, name, class_name, parent_phone, fee_status) VALUES (?, ?, ?, ?, ?)`;
        
        db.query(query, [fingerprint_id, name, class_name, parent_phone, fee_status || 'unpaid'], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ success: false, message: 'رقم البصمة هذا مسجل مسبقاً لطالبة أخرى!' });
                }
                return res.status(500).json({ success: false, message: err.message });
            }
            res.status(201).json({ success: true, message: 'تم تسجيل الطالبة وبصمتها بنجاح!', studentId: result.insertId });
        });
    });

    // 2. مسار تسجيل حضور البصمة (صباحاً أو بعد البريك)
    router.post('/record-attendance', (req, res) => {
        const { fingerprint_id, session_type } = req.body; // session_type: 'morning' or 'after_break'

        if (!fingerprint_id || !session_type) {
            return res.status(400).json({ success: false, message: 'كود البصمة ونوع الجلسة مطلوبان!' });
        }

        // الأول نتاكد إن البصمة دي تخص طالبة مسجلة
        const findStudentQuery = `SELECT id FROM students WHERE fingerprint_id = ?`;
        db.query(findStudentQuery, [fingerprint_id], (err, students) => {
            if (err) return res.status(500).json({ success: false, message: err.message });
            
            if (students.length === 0) {
                return res.status(404).json({ success: false, message: 'البصمة غير مسجلة في النظام!' });
            }

            const studentId = students[0].id;
            const today = new Date().toISOString().slice(0, 10); // تاريخ اليوم YYYY-MM-DD
            const currentTime = new Date().toTimeString().slice(0, 8); // الوقت الحالي HH:MM:SS

            // التأكد هل سجلت حضور لنفس الجلسة النهاردة ولا لأ
            const checkDuplicateQuery = `SELECT * FROM attendance WHERE student_id = ? AND session_type = ? AND scan_date = ?`;
            db.query(checkDuplicateQuery, [studentId, session_type, today], (dupErr, existing) => {
                if (dupErr) return res.status(500).json({ success: false, message: dupErr.message });

                if (existing.length > 0) {
                    return res.status(400).json({ success: false, message: `تم تسجيل حضور هذه الطالبة لجلسة الـ (${session_type}) مسبقاً اليوم!` });
                }

                // تسجيل الحضور الجديد
                const insertAttendance = `INSERT INTO attendance (student_id, session_type, scan_date, scan_time) VALUES (?, ?, ?, ?)`;
                db.query(insertAttendance, [studentId, session_type, today, currentTime], (insErr) => {
                    if (insErr) return res.status(500).json({ success: false, message: insErr.message });
                    res.status(200).json({ success: true, message: `تم تسجيل الحضور (${session_type}) بنجاح للطالبة!` });
                });
            });
        });
    });

    return router;
};
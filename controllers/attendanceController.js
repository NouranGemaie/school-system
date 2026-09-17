const db = require('../config/db');

// 1. تسجيل حضور/غياب/عذر يومي لطالب
exports.markAttendance = async (req, res) => {
    const { student_id, class_id, date, status, excuse_reason, approved_by_teacher_id } = req.body;

    try {
        const query = `
            INSERT INTO attendance_logs (student_id, class_id, date, status, excuse_reason, approved_by_teacher_id)
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                status = VALUES(status), 
                excuse_reason = VALUES(excuse_reason),
                approved_by_teacher_id = VALUES(approved_by_teacher_id);
        `;
        
        await db.query(query, [student_id, class_id, date, status, excuse_reason || null, approved_by_teacher_id || null]);
        
        res.status(200).json({ success: true, message: "تم تسجيل حالة الحضور بنجاح" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 2. تقرير إجمالي غياب الطالب (شهري أو ترم)
exports.getStudentAttendanceReport = async (req, res) => {
    const { student_id } = req.params;
    const { start_date, end_date } = req.query; // نطاق تاريخ الشهر أو الترم

    try {
        const query = `
            SELECT 
                s.student_id,
                CONCAT(s.first_name, ' ', s.last_name) AS student_name,
                COUNT(CASE WHEN a.status = 'present' THEN 1 END) AS days_present,
                COUNT(CASE WHEN a.status = 'absent' THEN 1 END) AS days_unexcused_absent,
                COUNT(CASE WHEN a.status = 'excused' THEN 1 END) AS days_excused_absent,
                COUNT(CASE WHEN a.status = 'late' THEN 1 END) AS days_late
            FROM students s
            LEFT JOIN attendance_logs a ON s.student_id = a.student_id 
                AND a.date BETWEEN ? AND ?
            WHERE s.student_id = ?
            GROUP BY s.student_id;
        `;

        const [rows] = await db.query(query, [start_date, end_date, student_id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "لم يتم العثور على الطالب" });
        }

        res.status(200).json({ success: true, report: rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
const db = require('../config/db');

// 1. إنشاء امتحان جديد
exports.createExam = async (req, res) => {
    const { exam_name, subject_id, class_id, exam_date, max_score } = req.body;
    try {
        const query = `
            INSERT INTO exams (exam_name, subject_id, class_id, exam_date, max_score) 
            VALUES (?, ?, ?, ?, ?)
        `;
        const [result] = await db.query(query, [exam_name, subject_id, class_id, exam_date, max_score]);
        res.status(201).json({ success: true, message: "تم إضافة الامتحان بنجاح", exam_id: result.insertId });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 2. تسجيل أو تعديل درجة طالب
exports.recordGrade = async (req, res) => {
    const { exam_id, student_id, score_obtained, remarks } = req.body;
    try {
        const query = `
            INSERT INTO student_grades (exam_id, student_id, score_obtained, remarks) 
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE score_obtained = VALUES(score_obtained), remarks = VALUES(remarks)
        `;
        await db.query(query, [exam_id, student_id, score_obtained, remarks]);
        res.status(200).json({ success: true, message: "تم تسجيل الدرجة بنجاح" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 3. استخراج النتيجة الشاملة للطالب
exports.getStudentGrades = async (req, res) => {
    const { student_id } = req.params;
    try {
        const query = `
            SELECT 
                e.exam_name,
                sub.subject_name,
                e.exam_date,
                e.max_score,
                g.score_obtained,
                g.remarks
            FROM student_grades g
            JOIN exams e ON g.exam_id = e.exam_id
            JOIN subjects sub ON e.subject_id = sub.subject_id
            WHERE g.student_id = ?
        `;
        const [rows] = await db.query(query, [student_id]);
        res.status(200).json({ success: true, grades: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
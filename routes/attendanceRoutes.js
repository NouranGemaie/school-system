const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

// تسجيل حضور / غياب / عذر
router.post('/mark', attendanceController.markAttendance);

// الحصول على تقرير الغياب والترم للطالب
// مثال Request: GET /api/attendance/report/1?start_date=2026-10-01&end_date=2026-10-31
router.get('/report/:student_id', attendanceController.getStudentAttendanceReport);

module.exports = router;

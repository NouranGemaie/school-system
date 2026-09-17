const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');

router.post('/create', examController.createExam);
router.post('/grade', examController.recordGrade);
router.get('/student/:student_id', examController.getStudentGrades);

module.exports = router;
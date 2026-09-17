const express = require('express');
const cors = require('cors');
const attendanceRoutes = require('./routes/attendanceRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// الموديلز والـ Routes
app.use('/api/attendance', attendanceRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
const examRoutes = require('./routes/examRoutes');
app.use('/api/exams', examRoutes);
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);
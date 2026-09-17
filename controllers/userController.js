const db = require('../config/db');

// 1. إضافة مستخدم جديد (أدمن أو مدرس)
exports.addUser = async (req, res) => {
    const { username, password, full_name, role } = req.body;
    try {
        const query = `INSERT INTO users (username, password, full_name, role) VALUES (?, ?, ?, ?)`;
        const [result] = await db.query(query, [username, password, full_name, role || 'teacher']);
        res.status(201).json({ success: true, message: "تم إضافة المستخدم بنجاح", userId: result.insertId });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 2. عرض كل المستخدمين
exports.getUsers = async (req, res) => {
    try {
        const [users] = await db.query(`SELECT user_id, username, full_name, role, created_at FROM users`);
        res.status(200).json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 3. حذف مستخدم (إخراج شخص)
exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query(`DELETE FROM users WHERE user_id = ?`, [id]);
        res.status(200).json({ success: true, message: "تم حذف المستخدم بنجاح" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
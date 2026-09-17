const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;
// تقديم جميع الملفات الاستاتيكية (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname)); // احتياطاً لو الملفات موجودة في Root المشروع مباشرة

// توجيه المسار الرئيسي (/) لصفحة الدخول تلقائياً
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'), (err) => {
    if (err) {
      // لو ملف login.html برة مجلد public وفي المجلد الرئيسي مباشرة
      res.sendFile(path.join(__dirname, 'login.html'));
    }
  });
});
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
module.exports = app;
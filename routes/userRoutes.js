const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/add', userController.addUser);
router.get('/all', userController.getUsers);
router.delete('/delete/:id', userController.deleteUser);

module.exports = router;
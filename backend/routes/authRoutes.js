const express = require('express');
const { telegramAuth, adminLogin } = require('../controllers/authController');

const router = express.Router();

router.post('/telegram', telegramAuth);
router.post('/admin/login', adminLogin);

module.exports = router;


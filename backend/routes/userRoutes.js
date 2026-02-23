const express = require('express');
const { getMe, checkout } = require('../controllers/userController');
const { authRequired } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/me', authRequired, getMe);
router.post('/checkout', authRequired, checkout);

module.exports = router;


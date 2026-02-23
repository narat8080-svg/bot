const express = require('express');
const { requestPayment, confirmPayment } = require('../controllers/paymentController');
const { authRequired, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/request', authRequired, requestPayment);
router.post('/confirm', authRequired, requireRole('admin'), confirmPayment);

module.exports = router;


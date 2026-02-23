const express = require('express');
const { listUsers, listTransactions } = require('../controllers/adminController');
const { authRequired, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authRequired, requireRole('admin'));

router.get('/users', listUsers);
router.get('/transactions', listTransactions);

module.exports = router;


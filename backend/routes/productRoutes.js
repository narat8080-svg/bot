const express = require('express');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { authRequired, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProduct);

router.post('/', authRequired, requireRole('admin'), createProduct);
router.put('/:id', authRequired, requireRole('admin'), updateProduct);
router.delete('/:id', authRequired, requireRole('admin'), deleteProduct);

module.exports = router;


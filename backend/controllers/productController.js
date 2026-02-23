const { validateProductInput } = require('../utils/validate');
const productService = require('../services/productService');

async function getProducts(req, res, next) {
  try {
    const products = await productService.listProducts();
    res.json(products);
  } catch (err) {
    next(err);
  }
}

async function getProduct(req, res, next) {
  try {
    const product = await productService.getProductById(req.params.id);
    res.json(product);
  } catch (err) {
    err.status = err.status || 404;
    next(err);
  }
}

async function createProduct(req, res, next) {
  try {
    const validated = validateProductInput(req.body);
    const product = await productService.createProduct(validated);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
}

async function updateProduct(req, res, next) {
  try {
    const validated = validateProductInput(req.body);
    const product = await productService.updateProduct(req.params.id, validated);
    res.json(product);
  } catch (err) {
    next(err);
  }
}

async function deleteProduct(req, res, next) {
  try {
    await productService.deleteProduct(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
};


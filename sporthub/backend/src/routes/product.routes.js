const express = require('express');
const {
  listProducts,
  getProduct,
  createProductController,
  updateProductController,
  deleteProductController,
} = require('../controllers/product.controller');
const { auth, isAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

// Public
router.get('/', listProducts);
router.get('/:id', getProduct);

// Admin
router.post('/', auth, isAdmin, createProductController);
router.put('/:id', auth, isAdmin, updateProductController);
router.delete('/:id', auth, isAdmin, deleteProductController);

module.exports = router;

const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth.middleware');
const {
  getMyOrders,
  getAllOrdersAdmin,
  checkoutCart,
  deleteOrder,
} = require('../controllers/order.controller');

// User checkout
router.post('/checkout', auth, checkoutCart);

// User's own orders
router.get('/my', auth, getMyOrders);

// Admin: all orders + delete
router.get('/', auth, isAdmin, getAllOrdersAdmin);
router.delete('/:id', auth, isAdmin, deleteOrder);

module.exports = router;

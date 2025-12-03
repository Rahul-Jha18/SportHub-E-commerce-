const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth.middleware');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
} = require('../controllers/cart.controller');

router.use(auth);

router.get('/', getCart);
router.post('/add', addToCart);
router.patch('/item/:productId', updateCartItem);
router.delete('/:productId', removeFromCart);

module.exports = router;

const express = require("express");
const router = express.Router();

const { auth, isAdmin } = require("../middleware/auth.middleware");
const { checkoutCart, getMyOrders, getAllOrdersAdmin, deleteOrder } =
  require("../controllers/order.controller");

router.post("/checkout", auth, checkoutCart);
router.get("/my", auth, getMyOrders);
router.get("/", auth, isAdmin, getAllOrdersAdmin);
router.delete("/:id", auth, isAdmin, deleteOrder);

module.exports = router;

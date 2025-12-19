const express = require("express");
const router = express.Router();

const { khaltiVerify } = require("../controllers/paymentController");

// ✅ No auth here to avoid 401 after redirect
router.post("/khalti/verify", khaltiVerify);

module.exports = router;

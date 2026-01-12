const express = require("express");
const router = express.Router();
const {
  createRazorpayOrder,
  verifyRazorpayPayment,
} = require("../controllers/paymentController");
const userAuth = require("../middleware/userAuthMiddleware");

router.post("/razorpay/order", userAuth, createRazorpayOrder);

router.post("/razorpay/verify", userAuth, verifyRazorpayPayment);

module.exports = router;

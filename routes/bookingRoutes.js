const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const userAuth = require("../middleware/userAuthMiddleware");
const adminAuth = require("../middleware/authMiddleware");

router.post("/", userAuth, bookingController.createBooking);

router.put("/:id/cancel", userAuth, bookingController.cancelBooking);

module.exports = router;

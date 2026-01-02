const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const userAuth = require("../middleware/userAuthMiddleware");

router.post("/", userAuth, bookingController.createBooking);

router.put("/:id/cancel", userAuth, bookingController.cancelBooking);

module.exports = router;

const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const userAuth = require("../middleware/userAuthMiddleware");

router.post("/", userAuth, bookingController.createBooking);

router.put("/:id/cancel", userAuth, bookingController.cancelBooking);

router.post("/cancel", userAuth, bookingController.cancelMultipleBookings);

router.get("/my", userAuth, bookingController.getMyBookings);

router.get("/my/:id", userAuth, bookingController.getMyBookingById);

module.exports = router;

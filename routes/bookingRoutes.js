const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const userAuth = require("../middleware/userAuthMiddleware");

router.post("/", userAuth, bookingController.createBooking);

module.exports = router;

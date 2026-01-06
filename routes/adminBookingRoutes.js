const express = require("express");
const router = express.Router();
const { getAdminBookings } = require("../controllers/bookingController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, getAdminBookings);

module.exports = router;

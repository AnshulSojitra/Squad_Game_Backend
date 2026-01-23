const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const {
  getPublicGrounds,
  getPublicGroundById,
  getSlotAvailability,
  getGroundReviews,
} = require("../controllers/groundController");

// GET all grounds (public)
router.get("/", getPublicGrounds);

// GET single ground (public)
router.get("/:id", getPublicGroundById);

// SLOT AVAILABILITY
router.get("/:groundId/slots", getSlotAvailability);

router.get("/:groundId/availability", bookingController.getGroundAvailability);

router.get("/:groundId/reviews", getGroundReviews);

module.exports = router;

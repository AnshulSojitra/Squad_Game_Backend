const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const userController = require("../controllers/userController");
const {
  getPublicGrounds,
  getPublicGroundById,
  getSlotAvailability,
  getGroundReviews,
} = require("../controllers/groundController");

// GET all grounds
router.get("/", getPublicGrounds);

// GET single ground
router.get("/:id", getPublicGroundById);

// SLOT AVAILABILITY
router.get("/:groundId/slots", getSlotAvailability);

router.get("/:groundId/availability", bookingController.getGroundAvailability);

router.get("/:groundId/reviews", getGroundReviews);

router.get("/landing-stats", userController.getLandingStats);

module.exports = router;

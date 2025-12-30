const express = require("express");
const router = express.Router();

const {
  getPublicGrounds,
  getPublicGroundById,
  getSlotAvailability,
} = require("../controllers/groundController");

// GET all grounds (public)
router.get("/", getPublicGrounds);

// GET single ground (public)
router.get("/:id", getPublicGroundById);

// SLOT AVAILABILITY
router.get("/:groundId/slots", getSlotAvailability);

module.exports = router;

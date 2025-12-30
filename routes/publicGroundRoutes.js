const express = require("express");
const router = express.Router();

const {
  getPublicGrounds,
  getPublicGroundById,
} = require("../controllers/groundController");

// GET all grounds (public)
router.get("/", getPublicGrounds);

// GET single ground (public)
router.get("/:id", getPublicGroundById);

module.exports = router;

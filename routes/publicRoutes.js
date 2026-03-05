const express = require("express");
const router = express.Router();
const { getLandingStats } = require("../controllers/userController");

router.get("/landing-stats", getLandingStats);

module.exports = router;

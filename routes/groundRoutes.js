const express = require("express");
const router = express.Router();

const upload = require("../middleware/uploadMiddleware");
const adminAuth = require("../middleware/authMiddleware");
const { createGround } = require("../controllers/groundController");

router.post("/", adminAuth, upload.array("images", 5), createGround);

module.exports = router;

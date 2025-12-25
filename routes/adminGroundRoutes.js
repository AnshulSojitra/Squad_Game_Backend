const express = require("express");
const router = express.Router();

const adminAuth = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const {
  createGround,
  updateGround,
  deleteGround,
  getGrounds, // admin list
} = require("../controllers/groundController");

// ADMIN ONLY
router.post("/", adminAuth, upload.single("image"), createGround);
router.get("/", adminAuth, getGrounds);
router.put("/:id", adminAuth, upload.single("image"), updateGround);
router.delete("/:id", adminAuth, deleteGround);

module.exports = router;

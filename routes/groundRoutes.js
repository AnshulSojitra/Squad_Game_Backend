const express = require("express");
const router = express.Router();

const upload = require("../middleware/uploadMiddleware");
const adminAuth = require("../middleware/authMiddleware");
const {
  createGround,
  updateGround,
  getAdminGrounds,
  deleteGround,
  getAdminGroundById,
} = require("../controllers/groundController");

router.post("/", adminAuth, upload.array("images", 5), createGround);
router.get("/", adminAuth, getAdminGrounds); // Get admin's grounds
router.delete("/:id", adminAuth, deleteGround); // Delete ground
router.put("/:id", adminAuth, upload.array("images", 5), updateGround); // Add update route
// router.get("/:id", adminAuth, getAdminGroundById); // Get single ground (admin)

module.exports = router;

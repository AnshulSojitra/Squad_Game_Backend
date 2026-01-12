const express = require("express");
const router = express.Router();

// Middleware
const adminAuth = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Controller
const {
  createGround,
  getAdminGrounds,
  getAdminGroundById,
  updateGround,
  deleteGround,
} = require("../controllers/groundController");

/**
    Create new ground (Admin only)
 */
router.post("/", adminAuth, upload.array("images", 5), createGround);

/**
    Get all grounds of logged-in admin
 */
router.get("/", adminAuth, getAdminGrounds);

/**
   Get single ground by id (Admin only)
 */
router.get("/:id", adminAuth, getAdminGroundById);

/**
   Update ground (Admin only)
 */
router.put("/:id", adminAuth, upload.array("images", 5), updateGround);

/**
   Delete ground (Admin only)
 */
router.delete("/:id", adminAuth, deleteGround);

module.exports = router;

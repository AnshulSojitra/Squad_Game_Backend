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
 * @route   POST /api/admin/grounds
 * @desc    Create new ground (Admin only)
 */
router.post("/", adminAuth, upload.array("images", 5), createGround);

/**
 * @route   GET /api/admin/grounds
 * @desc    Get all grounds of logged-in admin
 */
router.get("/", adminAuth, getAdminGrounds);

/**
 * @route   GET /api/admin/grounds/:id
 * @desc    Get single ground by id (Admin only)
 */
router.get("/:id", adminAuth, getAdminGroundById);

/**
 * @route   PUT /api/admin/grounds/:id
 * @desc    Update ground (Admin only)
 */
router.put("/:id", adminAuth, upload.array("images", 5), updateGround);

/**
 * @route   DELETE /api/admin/grounds/:id
 * @desc    Delete ground (Admin only)
 */
router.delete("/:id", adminAuth, deleteGround);

module.exports = router;

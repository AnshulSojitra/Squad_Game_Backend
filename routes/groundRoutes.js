// const express = require("express");
// const router = express.Router();

// const adminAuth = require("../middleware/authMiddleware");
// const upload = require("../middleware/uploadMiddleware");
// const {
//   createGround,
//   getGrounds,
//   getGroundById,
//   updateGround,
//   deleteGround,
// } = require("../controllers/groundController");

// router.post("/", adminAuth, upload.single("image"), createGround);
// router.get("/", getGrounds);
// router.get("/:id", getGroundById);
// router.put("/:id", adminAuth, upload.single("image"), updateGround);
// router.delete("/:id", adminAuth, deleteGround);

// module.exports = router;

const express = require("express");
const router = express.Router();

const {
  getGrounds,
  getGroundById,
} = require("../controllers/groundController");

// PUBLIC
router.get("/", getGrounds);
router.get("/:id", getGroundById);

module.exports = router;

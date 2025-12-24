// const express = require("express");
// const router = express.Router();
// const gameController = require("../controllers/gameController");

// // Admin only
// router.post("/", gameController.createGame);
// router.get("/", gameController.getGames);
// router.put("/:id", gameController.updateGame);
// router.delete("/:id", gameController.deleteGame);

// module.exports = router;

const express = require("express");
const router = express.Router();

const gameController = require("../controllers/gameController");
const authMiddleware = require("../middleware/authMiddleware");

/**
 * PUBLIC ROUTES
 * Users + Admin
 */

// Get all active games
router.get("/", gameController.getGames);

/**
 * ADMIN ONLY ROUTES
 */

// Create game
router.post("/", authMiddleware, gameController.createGame);

// Update game
router.put("/:id", authMiddleware, gameController.updateGame);

// Delete game
router.delete("/:id", authMiddleware, gameController.deleteGame);

module.exports = router;

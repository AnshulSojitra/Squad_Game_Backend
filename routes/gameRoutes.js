const express = require("express");
const router = express.Router();
const userAuthMiddleware = require("../middleware/userAuthMiddleware");
const gameController = require("../controllers/gameController");

router.post("/games", userAuthMiddleware, gameController.createGame);
router.post("/games/:gameId/join", userAuthMiddleware, gameController.joinGame);
router.post(
  "/games/:gameId/leave",
  userAuthMiddleware,
  gameController.leaveGame,
);
router.get("/games/open", userAuthMiddleware, gameController.getOpenGames);

module.exports = router;

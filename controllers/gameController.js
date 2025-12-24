const Game = require("../models/Game");

// CREATE game
exports.createGame = async (req, res) => {
  try {
    const game = await Game.create(req.body);
    res.status(201).json(game);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET all games
exports.getGames = async (req, res) => {
  try {
    const games = await Game.find({ isActive: true });
    res.json(games);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE game
exports.updateGame = async (req, res) => {
  try {
    const game = await Game.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(game);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE game
exports.deleteGame = async (req, res) => {
  try {
    await Game.findByIdAndDelete(req.params.id);
    res.json({ message: "Game deleted" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

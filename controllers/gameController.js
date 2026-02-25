const {
  Game,
  GameTeam,
  GameParticipant,
  Ground,
  Slot,
  User,
  Booking,
  GameSlot,
} = require("../models");
const razorpay = require("../utils/razorpay");

const { Op } = require("sequelize");

const sequelize = require("../config/db");

exports.createGame = async (req, res) => {
  try {
    const {
      groundId,
      slotIds,
      date,
      sport,
      totalTeams,
      playersPerTeam,
      pricePerPlayer,
    } = req.body;

    if (!groundId || !slotIds?.length || !date) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    // Fetch slots
    const slots = await Slot.findAll({
      where: { id: slotIds },
      include: [{ model: Ground, required: true }],
    });

    if (slots.length !== slotIds.length) {
      return res.status(400).json({ message: "Invalid slots" });
    }

    // Check slots already booked
    const alreadyBooked = await Booking.findAll({
      where: {
        slotId: slotIds,
        date: date,
        status: "confirmed",
      },
    });

    if (alreadyBooked.length > 0) {
      return res.status(400).json({
        message: "One or more selected slots are already booked",
      });
    }

    // Calculate total slot cost (including GST)
    const totalAmount = slots.reduce((sum, slot) => {
      const base = Number(slot.Ground.pricePerSlot);
      const gst = Number(slot.Ground.gstPercentage || 0);
      return sum + base + (base * gst) / 100;
    }, 0);

    const order = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: `game_${Date.now()}`,
      notes: {
        type: "game",
        userId: req.user.id,
        groundId,
        date,
        slots: slotIds.join(","),
        sport,
        totalTeams,
        playersPerTeam,
        pricePerPlayer,
      },
    });

    res.json({
      message: "Razorpay order created",
      order,
    });
  } catch (error) {
    console.error("CREATE GAME ERROR:", error.message);
    res.status(500).json({
      message: "Failed to initiate game creation",
    });
  }
};

exports.joinGame = async (req, res) => {
  try {
    const { gameId } = req.params;

    const game = await Game.findByPk(gameId);

    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    if (game.status !== "open") {
      return res.status(400).json({ message: "Game is not open" });
    }

    if (game.joinedPlayersCount >= game.totalPlayers) {
      return res.status(400).json({ message: "Game is full" });
    }

    // Prevent double join
    const alreadyJoined = await GameParticipant.findOne({
      where: { gameId, userId: req.user.id },
    });

    if (alreadyJoined) {
      return res.status(400).json({ message: "Already joined this game" });
    }

    await GameParticipant.create({
      gameId,
      userId: req.user.id,
    });

    game.joinedPlayersCount += 1;

    if (game.joinedPlayersCount === game.totalPlayers) {
      game.status = "full";
    }

    await game.save();

    res.json({ message: "Joined successfully" });
  } catch (error) {
    console.error("JOIN GAME ERROR:", error);
    res.status(500).json({ message: "Failed to join game" });
  }
};

exports.leaveGame = async (req, res) => {
  try {
    const { gameId } = req.params;

    const participant = await GameParticipant.findOne({
      where: { gameId, userId: req.user.id },
    });

    if (!participant) {
      return res.status(404).json({ message: "Not part of this game" });
    }

    await participant.destroy();

    const game = await Game.findByPk(gameId);

    game.joinedPlayersCount -= 1;
    game.status = "open";

    await game.save();

    res.json({ message: "Left game successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to leave game" });
  }
};

exports.getOpenGames = async (req, res) => {
  try {
    const games = await Game.findAll({
      where: { status: "open" },
      include: [
        {
          model: Ground,
        },
        {
          model: GameSlot,
          include: [
            {
              model: Slot,
              attributes: ["id", "startTime", "endTime"],
            },
          ],
        },
        {
          model: GameParticipant,
          include: [
            {
              model: User,
              attributes: ["id", "name"],
            },
          ],
        },
      ],
    });

    const formattedGames = games.map((game) => {
      const gameJson = game.toJSON();

      return {
        ...gameJson,
        slotIds: gameJson.GameSlots.map((gs) => gs.slotId),
      };
    });

    res.json(formattedGames);
  } catch (error) {
    console.error("GET OPEN GAMES ERROR:", error);
    res.status(500).json({ message: "Failed to fetch games" });
  }
};

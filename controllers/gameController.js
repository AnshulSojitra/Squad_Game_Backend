const {
  Game,
  GameTeam,
  GameParticipant,
  Ground,
  Slot,
  User,
  Booking,
  GameSlot,
  Country,
  State,
  City,
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
      key: process.env.RAZORPAY_KEY_ID,
      order,
    });
  } catch (error) {
    console.error("CREATE GAME ERROR:", error.message);
    res.status(500).json({
      message: "Failed to initiate game creation",
    });
  }
};

exports.deleteGame = async (req, res) => {
  try {
    const gameId = req.params.id;

    const game = await Game.findOne({
      where: {
        id: gameId,
        createdBy: req.user.id,
      },
    });

    if (!game) {
      return res.status(404).json({
        message: "Game not found or you are not authorized",
      });
    }

    // safety check
    if (game.status === "completed") {
      return res.status(400).json({
        message: "Cannot delete a completed game",
      });
    }

    // Prevent delete if players joined
    if (game.joinedPlayersCount > 1) {
      return res.status(400).json({
        message: "Cannot delete game after players have joined",
      });
    }

    await game.destroy();

    res.json({
      message: "Game deleted successfully",
    });
  } catch (error) {
    console.error("DELETE GAME ERROR:", error);
    res.status(500).json({
      message: "Failed to delete game",
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

    /* 🔥 NEW: AUTO TEAM ASSIGNMENT */

    const teams = await GameTeam.findAll({
      where: { gameId },
    });

    if (!teams.length) {
      return res.status(400).json({
        message: "No teams configured for this game",
      });
    }

    let selectedTeam = null;
    let minPlayers = Infinity;

    for (const team of teams) {
      const count = await GameParticipant.count({
        where: { teamId: team.id },
      });

      // Only consider teams that are not full
      if (count < game.playersPerTeam && count < minPlayers) {
        minPlayers = count;
        selectedTeam = team;
      }
    }

    if (!selectedTeam) {
      return res.status(400).json({
        message: "All teams are full",
      });
    }

    // Create participant WITH teamId
    await GameParticipant.create({
      gameId,
      userId: req.user.id,
      teamId: selectedTeam.id,
    });

    /* EXISTING LOGIC (UNCHANGED)   */

    game.joinedPlayersCount += 1;

    if (game.joinedPlayersCount === game.totalPlayers) {
      game.status = "full";
    }

    await game.save();

    res.json({
      message: "Joined successfully",
      assignedTeam: selectedTeam.teamNumber,
    });
  } catch (error) {
    console.error("JOIN GAME ERROR:", error);
    res.status(500).json({ message: "Failed to join game" });
  }
};

exports.leaveGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    const game = await Game.findByPk(gameId);

    // Prevent owner from leaving
    if (game.createdBy === req.user.id) {
      return res.status(400).json({
        message: "Game creator cannot leave the game",
      });
    }

    const participant = await GameParticipant.findOne({
      where: { gameId, userId: req.user.id },
    });

    if (!participant) {
      return res.status(404).json({ message: "Not part of this game" });
    }

    await participant.destroy();

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
      where: {
        status: ["open", "full"],
      },
      include: [
        {
          model: Ground,
          attributes: {
            exclude: [
              "countryId",
              "stateId",
              "cityId",
              "country",
              "state",
              "city",
            ],
          },
          include: [
            { model: Country, attributes: ["id", "name"], as: "Country" },
            { model: City, attributes: ["id", "name"], as: "City" },
            { model: State, attributes: ["id", "name"], as: "State" },
          ],
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
        {
          model: GameTeam,
          include: [
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

exports.getMyGames = async (req, res) => {
  try {
    const games = await Game.findAll({
      where: {
        createdBy: req.user.id,
      },
      include: [
        {
          model: Ground,
          attributes: ["id", "name", "area", "city"],
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
              attributes: ["id", "name", "phoneNumber"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({
      message: "My games fetched successfully",
      games,
    });
  } catch (error) {
    console.error("GET MY GAMES ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch my games",
    });
  }
};

exports.getJoinedGames = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get gameIds where user joined
    const myParticipations = await GameParticipant.findAll({
      where: { userId },
      attributes: ["gameId"],
    });

    const gameIds = myParticipations.map((p) => p.gameId);

    if (!gameIds.length) {
      return res.json({
        message: "Joined games fetched successfully",
        games: [],
      });
    }

    // Fetch games with ALL participants
    const joinedGames = await Game.findAll({
      where: {
        id: {
          [Op.in]: gameIds,
        },
      },
      include: [
        {
          model: GameParticipant,
          include: [
            {
              model: User,
              attributes: ["id", "name"],
            },
          ],
        },
        {
          model: Ground,
          attributes: ["id", "name", "area", "city"],
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
          model: User,
          as: "Creator",
          attributes: ["id", "name", "phoneNumber"],
        },
      ],
      order: [["date", "ASC"]],
    });

    res.json({
      message: "Joined games fetched successfully",
      games: joinedGames,
    });
  } catch (error) {
    console.error("GET JOINED GAMES ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch joined games",
    });
  }
};

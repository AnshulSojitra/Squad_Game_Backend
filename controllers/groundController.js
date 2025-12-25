const { Ground } = require("../models");

//  ADMIN CONTROLLERS

/**
 * CREATE GROUND
 * POST /api/admin/grounds
 */
exports.createGround = async (req, res) => {
  try {
    const {
      name,
      address,
      contactNo,
      startTime,
      endTime,
      pricePerHour,
      games,
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    const ground = await Ground.create({
      name,
      address,
      contactNo,
      startTime,
      endTime,
      pricePerHour,
      games: JSON.stringify(Array.isArray(games) ? games : [games]),
      image: req.file.path,
      adminId: req.admin.id, // admin = ground owner
    });

    res.status(201).json({
      message: "Ground created successfully",
      ground,
    });
  } catch (error) {
    console.error("CREATE GROUND ERROR:", error);
    res.status(500).json({
      message: error.message || "Failed to create ground",
    });
  }
};

/**
 * GET ALL GROUNDS (ADMIN - ONLY THEIR GROUNDS)
 * GET /api/admin/grounds
 */
exports.getAdminGrounds = async (req, res) => {
  try {
    const grounds = await Ground.findAll({
      where: { adminId: req.admin.id },
      order: [["createdAt", "DESC"]],
    });

    const formatted = grounds.map((g) => ({
      ...g.toJSON(),
      games: JSON.parse(g.games),
    }));

    res.json(formatted);
  } catch (error) {
    console.error("GET ADMIN GROUNDS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * UPDATE GROUND (ADMIN - OWN GROUND ONLY)
 * PUT /api/admin/grounds/:id
 */
exports.updateGround = async (req, res) => {
  try {
    const updates = req.body;

    if (updates.games) {
      updates.games = JSON.stringify(
        Array.isArray(updates.games) ? updates.games : [updates.games]
      );
    }

    if (req.file) {
      updates.image = req.file.path;
    }

    const ground = await Ground.findOne({
      where: {
        id: req.params.id,
        adminId: req.admin.id,
      },
    });

    if (!ground) {
      return res
        .status(404)
        .json({ message: "Ground not found or access denied" });
    }

    await ground.update(updates);

    res.json({
      message: "Ground updated successfully",
      ground,
    });
  } catch (error) {
    console.error("UPDATE GROUND ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * DELETE GROUND (ADMIN - OWN GROUND ONLY)
 * DELETE /api/admin/grounds/:id
 */
exports.deleteGround = async (req, res) => {
  try {
    const ground = await Ground.findOne({
      where: {
        id: req.params.id,
        adminId: req.admin.id,
      },
    });

    if (!ground) {
      return res
        .status(404)
        .json({ message: "Ground not found or access denied" });
    }

    await ground.destroy();

    res.json({ message: "Ground deleted successfully" });
  } catch (error) {
    console.error("DELETE GROUND ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

//  PUBLIC CONTROLLERS (USERS)

/**
 * GET ALL GROUNDS (PUBLIC)
 * GET /api/grounds
 */
exports.getGrounds = async (req, res) => {
  try {
    const grounds = await Ground.findAll({
      order: [["createdAt", "DESC"]],
    });

    const formatted = grounds.map((g) => ({
      ...g.toJSON(),
      games: JSON.parse(g.games),
    }));

    res.json(formatted);
  } catch (error) {
    console.error("GET GROUNDS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET SINGLE GROUND (PUBLIC)
 * GET /api/grounds/:id
 */
exports.getGroundById = async (req, res) => {
  try {
    const ground = await Ground.findByPk(req.params.id);

    if (!ground) {
      return res.status(404).json({ message: "Ground not found" });
    }

    res.json({
      ...ground.toJSON(),
      games: JSON.parse(ground.games),
    });
  } catch (error) {
    console.error("GET GROUND BY ID ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

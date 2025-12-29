const { Ground, GroundImage } = require("../models");

//  ADMIN CONTROLLERS

/**
 * CREATE GROUND
 * POST /api/admin/grounds
 */

exports.createGround = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Images are required" });
    }

    const imageUrls = req.files.map((file) => `/uploads/${file.filename}`);

    const slotsParsed =
      typeof req.body.slots === "string"
        ? JSON.parse(req.body.slots)
        : req.body.slots;

    const ground = await Ground.create({
      name: req.body.groundName,
      contactNo: req.body.contact,
      pricePerSlot: req.body.pricePerHour,
      area: req.body.area,
      country: req.body.country,
      state: req.body.state,
      city: req.body.city, // optional string
      cityId: req.body.city, // 🔥 REQUIRED ID
      game: req.body.game,
      openingTime: req.body.openingTime,
      closingTime: req.body.closingTime,
      adminId: req.admin.id,
      isActive: true,
    });

    // STORE IMAGE PATHS
    if (req.files && req.files.length > 0) {
      const images = req.files.map((file) => ({
        groundId: ground.id,
        imageUrl: `/uploads/${file.filename}`,
      }));

      await GroundImage.bulkCreate(images);
    }

    res.status(201).json({
      message: "Ground added successfully",
      ground,
    });
  } catch (error) {
    console.error("CREATE GROUND ERROR:", error);
    res.status(500).json({ message: "Failed to add ground" });
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
      include: {
        model: GroundImage,
        as: "images",
        attributes: ["imageUrl"],
        required: false,
      },
      order: [["createdAt", "DESC"]],
    });

    // ⚠️ Do NOT JSON.parse fields that don't exist
    const formatted = grounds.map((g) => ({
      id: g.id,
      name: g.name,
      contactNo: g.contactNo,
      pricePerSlot: g.pricePerSlot,
      area: g.area,
      country: g.country,
      state: g.state,
      city: g.city,
      game: g.game,
      openingTime: g.openingTime,
      closingTime: g.closingTime,
      isActive: g.isActive,
      createdAt: g.createdAt,
      images: g.images,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("GET ADMIN GROUNDS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch grounds" });
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

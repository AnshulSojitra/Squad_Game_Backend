const Ground = require("../models/Ground");

/**
 * CREATE GROUND (ADMIN)
 * POST /api/grounds
 */
// exports.createGround = async (req, res) => {
//   try {
//     const { name, address, contactNo, timing, pricePerHour, games } = req.body;

//     // if (!req.file) {
//     //   return res.status(400).json({ message: "Image is required" });
//     // }

//     const ground = await Ground.create({
//       name,
//       address,
//       contactNo,
//       timing,
//       pricePerHour,
//       games: Array.isArray(games) ? games : [games],
//       image: req.file.path, // Cloudinary URL
//       createdBy: req.admin.id,
//     });

//     res.status(201).json({
//       message: "Ground created successfully",
//       ground,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
exports.createGround = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

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
      timing: {
        startTime,
        endTime,
      },
      pricePerHour,
      games: Array.isArray(games) ? games : [games],
      image: req.file.path,
      createdBy: req.admin.id,
    });

    res.status(201).json({
      message: "Ground created successfully",
      ground,
    });
  } catch (error) {
    console.error("SAVE ERROR:", error);
    res.status(500).json({
      message: error.message || "Failed to save ground",
    });
  }
};
/**
 * GET ALL GROUNDS (PUBLIC)
 * GET /api/grounds
 * Optional filter: ?game=cricket
 */
exports.getGrounds = async (req, res) => {
  try {
    const { game } = req.query;

    const filter = {};
    if (game) {
      filter.games = game;
    }

    const grounds = await Ground.find(filter).sort({ createdAt: -1 });
    res.json(grounds);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET SINGLE GROUND (PUBLIC)
 * GET /api/grounds/:id
 */
exports.getGroundById = async (req, res) => {
  try {
    const ground = await Ground.findById(req.params.id);

    if (!ground) {
      return res.status(404).json({ message: "Ground not found" });
    }

    res.json(ground);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * UPDATE GROUND (ADMIN)
 * PUT /api/grounds/:id
 */
exports.updateGround = async (req, res) => {
  try {
    const updates = req.body;

    // If new image uploaded, replace old one
    if (req.file) {
      updates.image = req.file.path;
    }

    // Handle games field properly
    if (updates.games && !Array.isArray(updates.games)) {
      updates.games = [updates.games];
    }

    const ground = await Ground.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });

    if (!ground) {
      return res.status(404).json({ message: "Ground not found" });
    }

    res.json({
      message: "Ground updated successfully",
      ground,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * DELETE GROUND (ADMIN)
 * DELETE /api/grounds/:id
 */
exports.deleteGround = async (req, res) => {
  try {
    const ground = await Ground.findByIdAndDelete(req.params.id);

    if (!ground) {
      return res.status(404).json({ message: "Ground not found" });
    }

    res.json({ message: "Ground deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

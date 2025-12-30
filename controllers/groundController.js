const { Ground, GroundImage, Slot } = require("../models");
const fs = require("fs");
const path = require("path");

/* ======================================================
   ADMIN CONTROLLERS
====================================================== */

/**
 * CREATE GROUND
 * POST /api/admin/grounds
 */
exports.createGround = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Images are required" });
    }

    // Parse slots
    const slots =
      typeof req.body.slots === "string"
        ? JSON.parse(req.body.slots)
        : req.body.slots;

    // Create ground
    const ground = await Ground.create({
      name: req.body.groundName,
      contactNo: req.body.contact,
      pricePerSlot: req.body.pricePerHour,
      area: req.body.area,
      country: req.body.country,
      state: req.body.state,
      city: req.body.city,
      cityId: req.body.city, // FK
      game: req.body.game,
      openingTime: req.body.openingTime,
      closingTime: req.body.closingTime,
      adminId: req.admin.id,
      isActive: true,
    });

    // Save images
    const images = req.files.map((file) => ({
      groundId: ground.id,
      imageUrl: `/uploads/${file.filename}`,
    }));
    await GroundImage.bulkCreate(images);

    // Save slots
    if (Array.isArray(slots) && slots.length > 0) {
      const slotRows = slots.map((s) => ({
        groundId: ground.id,
        startTime: s.start,
        endTime: s.end,
        isActive: true,
      }));
      await Slot.bulkCreate(slotRows);
    }

    res.status(201).json({
      message: "Ground added successfully",
      groundId: ground.id,
    });
  } catch (error) {
    console.error("CREATE GROUND ERROR:", error);
    res.status(500).json({ message: "Failed to add ground" });
  }
};

/**
 * GET ALL GROUNDS (ADMIN)
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
 * GET SINGLE GROUND (ADMIN - FOR EDIT)
 * GET /api/admin/grounds/:id
 */
exports.getAdminGroundById = async (req, res) => {
  try {
    const ground = await Ground.findOne({
      where: {
        id: req.params.id,
        adminId: req.admin.id,
      },
      include: [
        {
          model: GroundImage,
          as: "images",
          attributes: ["id", "imageUrl"],
          required: false,
        },
        {
          model: Slot,
          as: "slots",
          attributes: ["id", "startTime", "endTime", "isActive"],
          required: false,
        },
      ],
    });

    if (!ground) {
      return res.status(404).json({ message: "Ground not found" });
    }

    res.json({
      id: ground.id,
      groundName: ground.name,
      contact: ground.contactNo,
      pricePerHour: ground.pricePerSlot,
      game: ground.game,
      addressName: ground.addressName || "",
      area: ground.area,
      country: ground.country,
      state: ground.state,
      city: ground.city,
      openingTime: ground.openingTime,
      closingTime: ground.closingTime,
      images: ground.images || [],
      slots:
        ground.slots?.map((s) => ({
          id: s.id,
          start: s.startTime,
          end: s.endTime,
          isActive: s.isActive,
        })) || [],
    });
  } catch (error) {
    console.error("GET ADMIN GROUND ERROR:", error);
    res.status(500).json({ message: "Failed to fetch ground" });
  }
};

/**
 * UPDATE GROUND (ADMIN)
 * PUT /api/admin/grounds/:id
 */

// exports.updateGround = async (req, res) => {
//   try {
//     const updates = req.body;

//     if (updates.games) {
//       updates.games = JSON.stringify(
//         Array.isArray(updates.games) ? updates.games : [updates.games]
//       );
//     }

//     if (req.file) {
//       updates.image = req.file.path;
//     }

//     const ground = await Ground.findOne({
//       where: {
//         id: req.params.id,
//         adminId: req.admin.id,
//       },
//     });

//     if (!ground) {
//       return res
//         .status(404)
//         .json({ message: "Ground not found or access denied" });
//     }

//     await ground.update(updates);

//     res.json({
//       message: "Ground updated successfully",
//       ground,
//     });
//   } catch (error) {
//     console.error("UPDATE GROUND ERROR:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

exports.updateGround = async (req, res) => {
  try {
    const ground = await Ground.findOne({
      where: {
        id: req.params.id,
        adminId: req.admin.id,
      },
      include: { model: GroundImage, as: "images" },
    });

    if (!ground) {
      return res.status(404).json({ message: "Ground not found" });
    }

    // 1️⃣ Update ground fields
    await ground.update({
      name: req.body.groundName,
      contactNo: req.body.contact,
      pricePerSlot: req.body.pricePerHour,
      area: req.body.area,
      country: req.body.country,
      state: req.body.state,
      city: req.body.city,
      cityId: req.body.city,
      game: req.body.game,
      openingTime: req.body.openingTime,
      closingTime: req.body.closingTime,
    });

    // 2️⃣ If new images uploaded → replace old ones
    if (req.files && req.files.length > 0) {
      // 🔥 Delete old image files (optional but recommended)
      for (const img of ground.images) {
        const filePath = path.join(__dirname, "..", img.imageUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      // 🔥 Delete old DB records
      await GroundImage.destroy({
        where: { groundId: ground.id },
      });

      // 🔥 Insert new images
      const newImages = req.files.map((file) => ({
        groundId: ground.id,
        imageUrl: `/uploads/${file.filename}`,
      }));

      await GroundImage.bulkCreate(newImages);
    }

    res.json({
      message: "Ground updated successfully",
      ground,
    });
  } catch (error) {
    console.error("UPDATE GROUND ERROR:", error);
    res.status(500).json({ message: "Failed to update ground" });
  }
};

/**
 * DELETE GROUND (ADMIN)
 * DELETE /api/admin/grounds/:id
 */
// exports.deleteGround = async (req, res) => {
//   try {
//     const ground = await Ground.findOne({
//       where: {
//         id: req.params.id,
//         adminId: req.admin.id,
//       },
//     });

//     if (!ground) {
//       return res.status(404).json({ message: "Ground not found" });
//     }

//     await ground.destroy();
//     res.json({ message: "Ground deleted successfully" });
//   } catch (error) {
//     console.error("DELETE GROUND ERROR:", error);
//     res.status(500).json({ message: "Failed to delete ground" });
//   }
// };

exports.deleteGround = async (req, res) => {
  try {
    const ground = await Ground.findOne({
      where: {
        id: req.params.id,
        adminId: req.admin.id,
      },
      include: {
        model: GroundImage,
        as: "images",
      },
    });

    if (!ground) {
      return res
        .status(404)
        .json({ message: "Ground not found or access denied" });
    }

    // 🔥 DELETE IMAGE FILES FROM UPLOADS
    if (ground.images && ground.images.length > 0) {
      ground.images.forEach((img) => {
        const filePath = path.join(
          __dirname,
          "..",
          img.imageUrl // example: /uploads/123.jpg
        );

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    // 🔥 DELETE DB RECORD (CASCADE WILL DELETE GroundImages)
    await ground.destroy();

    res.json({ message: "Ground and images deleted successfully" });
  } catch (error) {
    console.error("DELETE GROUND ERROR:", error);
    res.status(500).json({ message: "Failed to delete ground" });
  }
};

// ADD GROUND IMAGES (ADMIN)
exports.addGroundImages = async (req, res) => {
  try {
    const ground = await Ground.findOne({
      where: {
        id: req.params.id,
        adminId: req.admin.id,
      },
    });

    if (!ground) {
      return res.status(404).json({ message: "Ground not found" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    const images = req.files.map((file) => ({
      groundId: ground.id,
      imageUrl: `/uploads/${file.filename}`,
    }));

    await GroundImage.bulkCreate(images);

    res.json({ message: "Images added successfully" });
  } catch (error) {
    console.error("ADD IMAGE ERROR:", error);
    res.status(500).json({ message: "Failed to add images" });
  }
};

// DELETE GROUND IMAGE (ADMIN)
exports.deleteGroundImage = async (req, res) => {
  try {
    const image = await GroundImage.findByPk(req.params.imageId);

    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    await image.destroy();
    res.json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("DELETE IMAGE ERROR:", error);
    res.status(500).json({ message: "Failed to delete image" });
  }
};

/* ======================================================
   PUBLIC CONTROLLERS
====================================================== */

/**
 * GET ALL GROUNDS (PUBLIC)
 * GET /api/grounds
 */
exports.getPublicGrounds = async (req, res) => {
  try {
    const grounds = await Ground.findAll({
      where: { isActive: true },
      include: [
        {
          model: GroundImage,
          as: "images",
          attributes: ["imageUrl"],
          required: false,
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const formatted = grounds.map((g) => ({
      id: g.id,
      name: g.name,
      pricePerSlot: g.pricePerSlot,
      game: g.game,
      area: g.area,
      city: g.city,
      state: g.state,
      country: g.country,
      openingTime: g.openingTime,
      closingTime: g.closingTime,
      images: g.images || [],
    }));

    res.json(formatted);
  } catch (error) {
    console.error("GET PUBLIC GROUNDS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch grounds" });
  }
};

/**
 * GET SINGLE GROUND (PUBLIC)
 * GET /api/grounds/:id
 */
exports.getPublicGroundById = async (req, res) => {
  try {
    const ground = await Ground.findOne({
      where: {
        id: req.params.id,
        isActive: true,
      },
      include: [
        {
          model: GroundImage,
          as: "images",
          attributes: ["imageUrl"],
        },
        {
          model: Slot,
          as: "slots",
          attributes: ["id", "startTime", "endTime"],
          where: { isActive: true },
          required: false,
        },
      ],
    });

    if (!ground) {
      return res.status(404).json({ message: "Ground not found" });
    }

    res.json({
      id: ground.id,
      name: ground.name,
      pricePerSlot: ground.pricePerSlot,
      game: ground.game,
      area: ground.area,
      city: ground.city,
      state: ground.state,
      country: ground.country,
      openingTime: ground.openingTime,
      closingTime: ground.closingTime,
      images: ground.images || [],
      slots: ground.slots || [],
    });
  } catch (error) {
    console.error("GET PUBLIC GROUND ERROR:", error);
    res.status(500).json({ message: "Failed to fetch ground" });
  }
};
exports.getGroundById = async (req, res) => {
  try {
    const ground = await Ground.findByPk(req.params.id, {
      include: [
        {
          model: GroundImage,
          as: "images",
          attributes: ["imageUrl"],
        },
        {
          model: Slot,
          as: "slots",
          attributes: ["startTime", "endTime"],
        },
      ],
    });

    if (!ground) {
      return res.status(404).json({ message: "Ground not found" });
    }

    res.json(ground);
  } catch (error) {
    console.error("GET GROUND ERROR:", error);
    res.status(500).json({ message: "Failed to fetch ground" });
  }
};

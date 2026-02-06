const he = require("he");
const { Booking } = require("../models");
const { Op } = require("sequelize");
const {
  Ground,
  GroundImage,
  Slot,
  Country,
  State,
  City,
  Amenity,
  Review,
  User,
} = require("../models");
const fs = require("fs");
const path = require("path");
const { to12Hour, to24Hours } = require("../utils/time");
const { model } = require("mongoose");

/* ADMIN CONTROLLERS */

//* CREATE GROUND

exports.createGround = async (req, res) => {
  try {
    const adminId = req.admin.id;

    // Count existing grounds of this admin
    const groundCount = await Ground.count({
      where: { adminId },
    });

    // Enforce limit
    if (groundCount >= 10) {
      return res.status(403).json({
        message: "You can add a maximum of 10 grounds only",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Images are required" });
    }

    // Parse slots
    const slots =
      typeof req.body.slots === "string"
        ? JSON.parse(req.body.slots)
        : req.body.slots;

    const amenities =
      typeof req.body.amenities === "string"
        ? JSON.parse(req.body.amenities)
        : req.body.amenities;

    // Create ground
    const ground = await Ground.create({
      name: req.body.groundName,
      contactNo: req.body.contact,
      pricePerSlot: req.body.pricePerHour,
      area: req.body.area,
      country: req.body.country,
      state: req.body.state,
      city: req.body.city,
      locationUrl: req.body.locationUrl,
      advanceBookingDays: req.body.advanceBookingDays,
      cityId: req.body.city,
      stateId: req.body.state,
      countryId: req.body.country,
      game: req.body.game,
      openingTime: req.body.openingTime,
      closingTime: req.body.closingTime,
      adminId: req.admin.id,
    });

    // Save images
    const images = req.files.map((file) => ({
      groundId: ground.id,
      imageUrl: `/uploads/${file.filename}`,
    }));
    await GroundImage.bulkCreate(images);

    // Save amenities

    if (Array.isArray(amenities) && amenities.length > 0) {
      const amenityRows = amenities.map((a) => ({
        groundId: ground.id,
        name: a,
      }));
      await Amenity.bulkCreate(amenityRows);
    }

    // Save slots
    if (Array.isArray(slots) && slots.length > 0) {
      const slotRows = slots.map((s) => ({
        groundId: ground.id,
        startTime: s.start,
        endTime: s.end,
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

// * GET ALL GROUNDS (ADMIN)

exports.getAdminGrounds = async (req, res) => {
  try {
    const grounds = await Ground.findAll({
      where: { adminId: req.admin.id },
      include: [
        {
          model: Country,
          as: "Country",
          attributes: ["id", "name"],
        },
        {
          model: State,
          as: "State",
          attributes: ["id", "name"],
        },
        {
          model: City,
          as: "City",
          attributes: ["id", "name"],
        },
        {
          model: GroundImage,
          as: "images",
          attributes: ["imageUrl"],
          required: false,
        },
        {
          model: Amenity,
          as: "amenities",
          attributes: ["id", "name"],
        },
        {
          model: Slot,
          as: "Slots",
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const formatted = grounds.map((g) => ({
      id: g.id,
      name: g.name,
      contactNo: g.contactNo,
      pricePerSlot: g.pricePerSlot,
      area: g.area,
      country: g.Country.name,
      state: g.State.name,
      city: g.City.name,
      locationUrl: g.locationUrl,
      game: g.game,
      openingTime: to12Hour(g.openingTime),
      closingTime: to12Hour(g.closingTime),
      isBlocked: g.isBlocked,
      images: g.images,
      Slots: g.Slots,
      amenities: g.amenities,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("GET ADMIN GROUNDS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch grounds" });
  }
};

// * GET SINGLE GROUND (ADMIN - FOR EDIT)

exports.getAdminGroundById = async (req, res) => {
  try {
    const ground = await Ground.findOne({
      where: {
        id: req.params.id,
        adminId: req.admin.id,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt", "countryId", "stateId", "cityId"],
      },
      include: [
        {
          model: GroundImage,
          as: "images",
          attributes: ["id", "imageUrl"],
        },
        {
          model: Slot,
          as: "Slots",
        },
        {
          model: Amenity,
          as: "amenities",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!ground) {
      return res.status(404).json({ message: "Ground not found" });
    }

    const groundData = ground.toJSON();
    groundData.Slots = groundData.Slots.map((slot) => ({
      ...slot,
      startTime: slot.startTime,
      endTime: slot.endTime,
    }));

    groundData.amenities = groundData.amenities.map((amenity) => ({
      ...amenity,
      id: amenity.id,
      groundId: amenity.groundId,
      name: amenity.name,
    }));

    res.json(groundData);
  } catch (error) {
    console.error("GET ADMIN GROUND ERROR:", error.message);
    res.status(500).json({ message: error.message });
  }
};

//* UPDATE GROUND (ADMIN)

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

    // Update ground fields
    await ground.update({
      name: req.body.groundName,
      contactNo: req.body.contact,
      pricePerSlot: req.body.pricePerHour,
      area: req.body.area,
      locationUrl: req.body.locationUrl,
      country: req.body.country,
      state: req.body.state,
      city: req.body.city,
      cityId: req.body.city,
      stateId: req.body.state,
      countryId: req.body.country,
      game: req.body.game,
      openingTime: req.body.openingTime,
      closingTime: req.body.closingTime,
      advanceBookingDays: req.body.advanceBookingDays,
    });

    // If new images uploaded → replace old ones
    if (req.files && req.files.length > 0) {
      //  Delete old image files
      for (const img of ground.images) {
        const filePath = path.join(__dirname, "..", img.imageUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      //  Delete old DB records
      await GroundImage.destroy({
        where: { groundId: ground.id },
      });

      //  Insert new images
      const newImages = req.files.map((file) => ({
        groundId: ground.id,
        imageUrl: `/uploads/${file.filename}`,
      }));

      await GroundImage.bulkCreate(newImages);
    }

    //  Update amenities
    let amenities = [];

    if (req.body.amenities) {
      try {
        amenities = JSON.parse(req.body.amenities);
      } catch (err) {
        return res.status(400).json({
          message: "Invalid amenities format",
        });
      }
    }
    if (amenities.length > 0) {
      await Amenity.destroy({
        where: { groundId: ground.id },
      });

      const amenitiesData = amenities.map((amenity) => ({
        groundId: ground.id,
        name: amenity,
      }));

      await Amenity.bulkCreate(amenitiesData);
    }

    // Update slots

    let slots = [];

    if (req.body.slots) {
      try {
        slots = JSON.parse(req.body.slots);
      } catch (err) {
        return res.status(400).json({
          message: "Invalid slots format",
        });
      }
    }

    if (slots.length > 0) {
      await Slot.destroy({
        where: { groundId: ground.id },
      });

      const slotsData = slots.map((slot) => ({
        groundId: ground.id,
        startTime: slot.start || slot.startTime,
        endTime: slot.end || slot.endTime,
      }));

      await Slot.bulkCreate(slotsData);
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

//* DELETE GROUND (ADMIN)

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

    // DELETE IMAGE FILES FROM UPLOADS
    if (ground.images && ground.images.length > 0) {
      ground.images.forEach((img) => {
        const filePath = path.join(__dirname, "..", img.imageUrl);

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    //DELETE DB RECORD
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

// PUBLIC CONTROLLERS

//* GET ALL GROUNDS (PUBLIC)

exports.getPublicGrounds = async (req, res) => {
  try {
    const { search } = req.query;

    const where = {
      isBlocked: false,
    };

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { area: { [Op.like]: `%${search}%` } },
        { "$Country.name$": { [Op.like]: `%${search}%` } },
        { "$State.name$": { [Op.like]: `%${search}%` } },
        { "$City.name$": { [Op.like]: `%${search}%` } },
      ];
    }

    const grounds = await Ground.findAll({
      where,
      include: [
        {
          model: Amenity,
          as: "amenities",
          attributes: ["id", "name"],
        },
        {
          model: GroundImage,
          as: "images",
          attributes: ["imageUrl"],
          required: false,
        },
        {
          model: Slot,
          as: "Slots",
          attributes: ["id", "startTime", "endTime"],
          required: false,
        },
        {
          model: Country,
          as: "Country",
          attributes: ["name"],
          required: false,
        },
        {
          model: State,
          as: "State",
          attributes: ["name"],
          required: false,
        },
        {
          model: City,
          as: "City",
          attributes: ["name"],
          required: false,
        },
      ],
      distinct: true,
      order: [["createdAt", "DESC"]],
    });

    const formatted = grounds.map((g) => ({
      id: g.id,
      name: g.name,
      pricePerSlot: g.pricePerSlot,
      game: g.game,
      area: g.area,
      contactNo: g.contactNo,
      country: g.Country?.name || null,
      state: g.State?.name || null,
      city: g.City?.name || null,
      locationUrl: g.locationUrl,
      openingTime: to12Hour(g.openingTime),
      closingTime: to12Hour(g.closingTime),
      isBlocked: g.isBlocked,
      amenities: g.amenities || [],
      images: g.images || [],
      Slots: g.Slots || [],
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Public grounds search error:", error);
    res.status(500).json({ message: "Failed to fetch grounds" });
  }
};

//* GET SINGLE GROUND (PUBLIC)

exports.getPublicGroundById = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    // Resolve booking date
    const bookingDate = date ? new Date(date) : new Date();

    bookingDate.setHours(0, 0, 0, 0);

    // Fetch ground
    const ground = await Ground.findOne({
      where: {
        id,
        isBlocked: false,
      },
      include: [
        {
          model: GroundImage,
          as: "images",
          attributes: ["imageUrl"],
        },
        {
          model: Amenity,
          as: "amenities",
          attributes: ["id", "name"],
        },
        {
          model: Slot,
          as: "Slots",
          attributes: ["id", "startTime", "endTime"],
          required: false,
        },
        {
          model: Country,
          as: "Country",
          attributes: ["name"],
        },
        {
          model: State,
          as: "State",
          attributes: ["name"],
        },
        {
          model: City,
          as: "City",
          attributes: ["name"],
        },
      ],
    });

    if (!ground) {
      return res.status(404).json({ message: "Ground not found" });
    }

    // Fetch bookings for this ground + date
    const bookings = await Booking.findAll({
      where: {
        groundId: ground.id,
        date: bookingDate,
        status: "confirmed",
      },
      attributes: ["slotId"],
    });

    // Create fast lookup set
    const bookedSlotIds = new Set(bookings.map((b) => b.slotId));

    // Attach availability to slots
    const slotsWithAvailability = ground.Slots.map((slot) => ({
      id: slot.id,
      startTime: slot.startTime,
      endTime: slot.endTime,
      available: !bookedSlotIds.has(slot.id),
    }));

    // Response
    res.json({
      id: ground.id,
      name: ground.name,
      pricePerSlot: ground.pricePerSlot,
      contactNo: ground.contactNo,
      game: ground.game,
      area: ground.area,
      city: ground.City?.name || null,
      state: ground.State?.name || null,
      country: ground.Country?.name || null,
      locationUrl: ground.locationUrl,
      advanceBookingDays: ground.advanceBookingDays,
      openingTime: ground.openingTime,
      closingTime: ground.closingTime,
      images: ground.images || [],
      amenities: ground.amenities || [],
      slots: slotsWithAvailability,
    });
  } catch (error) {
    console.error("GET PUBLIC GROUND ERROR:", error);
    res.status(500).json({ message: "Failed to fetch ground" });
  }
};

// * GET SLOT AVAILABILITY (PUBLIC)

exports.getSlotAvailability = async (req, res) => {
  try {
    const { groundId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    // Get all slots for this ground
    const slots = await Slot.findAll({
      where: { groundId },
      order: [["startTime", "ASC"]],
    });

    if (!slots.length) {
      return res.json([]);
    }

    const slotIds = slots.map((s) => s.id);

    // Get bookings for these slots on the given date
    const bookings = await Booking.findAll({
      where: {
        slotId: { [Op.in]: slotIds },
        date: date,
        status: { [Op.ne]: "cancelled" },
      },
      attributes: ["slotId"],
    });

    const bookedSlotIds = bookings.map((b) => b.slotId);

    //  Build availability response
    const availability = slots.map((slot) => ({
      slotId: slot.id,
      startTime: slot.startTime,
      endTime: slot.endTime,
      available: !bookedSlotIds.includes(slot.id),
    }));

    res.json(availability);
  } catch (error) {
    console.error("SLOT AVAILABILITY ERROR:", error);
    res.status(500).json({ message: "Failed to fetch slot availability" });
  }
};

exports.getGroundReviews = async (req, res) => {
  const { groundId } = req.params;

  const reviews = await Review.findAll({
    where: { groundId },
    attributes: { exclude: ["updatedAt", "createdAt", "userId", "groundId"] },
    include: [
      {
        model: User,
        attributes: ["id", "name"],
      },
      {
        model: Ground,
        attributes: ["id", "name"],
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  const avgRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / (reviews.length || 1);

  res.json({
    avgRating: Number(avgRating.toFixed(1)),
    totalReviews: reviews.length,
    reviews,
  });
};

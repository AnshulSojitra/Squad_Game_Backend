const {
  User,
  Admin,
  Booking,
  Ground,
  Slot,
  SuperAdmin,
  Amenity,
  Country,
  State,
  City,
  GroundImage,
  sequelize,
} = require("../models");
const { to12Hour } = require("../utils/time");
const bcrypt = require("bcryptjs");
const adminRegistration = require("../utils/templates/adminRegistration");
const { sendEmail } = require("../utils/email");
const path = require("path");
const fs = require("fs");
const e = require("express");

exports.getLoggedInSuperAdmin = async (req, res) => {
  try {
    const superAdmin = await SuperAdmin.findByPk(req.superAdmin.id, {
      attributes: ["id", "name", "email"],
    });

    if (!superAdmin) {
      return res.status(404).json({ message: "Super Admin not found" });
    }

    res.status(200).json(superAdmin);
  } catch (error) {
    console.error("Get super admin profile error:", error);
    res.status(500).json({ message: "Failed to fetch super admin profile" });
  }
};
//USER METHODS

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: {
        exclude: ["password"],
      },
      order: [["createdAt", "ASC"]],
    });

    res.status(200).json({
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: {
        exclude: ["password"],
      },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      user,
    });
  } catch (error) {
    console.error("Get user by id error:", error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
};

exports.toggleUserBlock = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.status(200).json({
      message: `User ${user.isBlocked ? "blocked" : "unblocked"} successfully`,
      user,
    });
  } catch (error) {
    console.error("Block/Unblock user error:", error);
    res.status(500).json({ message: "Failed to update user status" });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId, {
      attributes: ["id", "name", "email"],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const bookings = await Booking.findAll({
      where: { userId },
      include: [
        {
          model: Slot,
          attributes: ["startTime", "endTime"],
          include: [
            {
              model: Ground,
              attributes: ["id", "name", "city", "state"],
            },
          ],
        },
      ],
      order: [["date", "DESC"]],
    });

    res.json({
      user,
      totalBookings: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get user bookings error:", error);
    res.status(500).json({ message: "Failed to fetch user bookings" });
  }
};

//ADMIN METHODS

exports.createAdmin = async (req, res) => {
  try {
    const { name, email, phoneNumber, password } = req.body;

    // validation
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      where: { email },
    });

    if (existingAdmin) {
      return res.status(409).json({
        message: "Admin with this email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    //  Create admin
    const admin = await Admin.create({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      isBlocked: false,
    });

    try {
      const admin = await Admin.findOne({ where: { email } });
      await sendEmail({
        to: admin.email,
        subject: "Your Admin Account is Created 🎉",
        html: adminRegistration({
          adminName: admin.name,
          adminEmail: admin.email,
          adminPhone: admin.phoneNumber,
        }),
      });
    } catch (emailError) {
      console.error("BOOKING EMAIL FAILED:", emailError.message);
    }

    res.status(201).json({
      message: "Admin created successfully",
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        phoneNumber: admin.phoneNumber,
      },
    });
  } catch (error) {
    console.error("Create admin error:", error);
    res.status(500).json({
      message: "Failed to create admin",
    });
  }
};

exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.findAll({
      attributes: {
        exclude: ["password"],
      },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      count: admins.length,
      admins,
    });
  } catch (error) {
    console.error("Get all admins error:", error);
    res.status(500).json({ message: "Failed to fetch admins" });
  }
};

exports.getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findByPk(req.params.id, {
      attributes: {
        exclude: ["password"],
      },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      admin,
    });
  } catch (error) {
    console.error("Get admin by id error:", error);
    res.status(500).json({ message: "Failed to fetch admin" });
  }
};

exports.toggleAdminBlock = async (req, res) => {
  const { id } = req.params;

  try {
    await sequelize.transaction(async (t) => {
      const admin = await Admin.findByPk(id, { transaction: t });

      if (!admin) {
        throw new Error("Admin not found");
      }

      // Toggle admin status
      admin.isBlocked = !admin.isBlocked;
      await admin.save({ transaction: t });

      // 🔁 Sync all grounds with admin status
      await Ground.update(
        { isBlocked: admin.isBlocked },
        {
          where: { adminId: admin.id },
          transaction: t,
        },
      );

      res.status(200).json({
        message: `Admin and all associated grounds ${
          admin.isBlocked ? "blocked" : "unblocked"
        } successfully`,
        admin,
      });
    });
  } catch (error) {
    console.error("Block/Unblock admin error:", error.message);
    res.status(500).json({
      message: error.message || "Failed to update admin status",
    });
  }
};

exports.getAdminGrounds = async (req, res) => {
  try {
    const { adminId } = req.params;

    //  Check admin exists
    const admin = await Admin.findByPk(adminId, {
      attributes: ["id", "name", "email"],
    });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    //  Fetch grounds owned by admin
    const grounds = await Ground.findAll({
      where: { adminId },
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
      createdAt: g.createdAt,
      isBlocked: g.isBlocked,
      images: g.images,
      Slots: g.Slots,
      amenities: g.amenities,
    }));

    res.json({
      admin,
      totalGrounds: grounds.length,
      grounds: formatted,
    });
  } catch (error) {
    console.error("Get admin grounds error:", error);
    res.status(500).json({
      message: "Failed to fetch admin grounds",
    });
  }
};

exports.deleteAdmin = async (req, res) => {
  const { id } = req.params;

  try {
    await sequelize.transaction(async (t) => {
      const admin = await Admin.findByPk(id, { transaction: t });

      if (!admin) {
        throw new Error("Admin not found");
      }

      await admin.destroy({ transaction: t });
    });

    res.status(200).json({
      message: "Admin and all associated data deleted successfully",
    });
  } catch (error) {
    console.error("Delete admin error:", error.message);
    res.status(400).json({
      message: error.message || "Failed to delete admin",
    });
  }
};

// BOOKING METHODS

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          attributes: ["id", "name", "email"],
        },
        {
          model: Slot,
          attributes: ["id", "startTime", "endTime"],
          include: [
            {
              model: Ground,
              attributes: ["id", "name", "area", "country", "state", "city"],
              include: [
                {
                  model: Admin,
                  attributes: ["id", "name", "email"],
                },
              ],
            },
          ],
        },
      ],
    });

    res.status(200).json({
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get all bookings error:", error);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findByPk(id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Booking already cancelled" });
    }

    booking.status = "cancelled";
    await booking.save();

    res.status(200).json({
      message: "Booking cancelled successfully",
      bookingId: booking.id,
    });
  } catch (error) {
    console.error("Cancel booking error:", error);
    res.status(500).json({ message: "Failed to cancel booking" });
  }
};

exports.completeBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findByPk(id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({
        message: "Cancelled booking cannot be completed",
      });
    }

    if (booking.status === "completed") {
      return res.status(400).json({
        message: "Booking already completed",
      });
    }

    booking.status = "completed";
    await booking.save();

    res.status(200).json({
      message: "Booking marked as completed",
      bookingId: booking.id,
    });
  } catch (error) {
    console.error("Complete booking error:", error);
    res.status(500).json({ message: "Failed to complete booking" });
  }
};

//GROUND METHODS

exports.getAllGrounds = async (req, res) => {
  try {
    const grounds = await Ground.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Admin,
          attributes: ["id", "name", "phoneNumber", "email"],
        },
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
      createdAt: g.createdAt,
      isBlocked: g.isBlocked,
      images: g.images,
      Slots: g.Slots,
      amenities: g.amenities,
      admin: {
        id: g.Admin.id,
        name: g.Admin.name,
        phoneNumber: g.Admin.phoneNumber,
        email: g.Admin.email,
      },
    }));

    res.status(200).json({
      count: grounds.length,
      grounds: formatted,
    });
  } catch (error) {
    console.error("Get all grounds error:", error);
    res.status(500).json({ message: "Failed to fetch grounds" });
  }
};

exports.toggleGroundBlock = async (req, res) => {
  try {
    const { id } = req.params;

    const ground = await Ground.findByPk(id);

    if (!ground) {
      return res.status(404).json({ message: "Ground not found" });
    }

    ground.isBlocked = !ground.isBlocked;
    await ground.save();

    res.status(200).json({
      message: `Ground ${
        ground.isBlocked ? "blocked" : "unblocked"
      } successfully`,
      groundId: ground.id,
      isBlocked: ground.isBlocked,
    });
  } catch (error) {
    console.error("Toggle ground block error:", error);
    res.status(500).json({ message: "Failed to update ground status" });
  }
};

exports.getGroundBookings = async (req, res) => {
  try {
    const { groundId } = req.params;

    //  Check ground exists
    const ground = await Ground.findByPk(groundId, {
      attributes: ["id", "name"],
    });

    if (!ground) {
      return res.status(404).json({ message: "Ground not found" });
    }

    //  Fetch bookings for this ground
    const bookings = await Booking.findAll({
      include: [
        {
          model: Slot,
          where: { groundId },
          attributes: ["startTime", "endTime"],
        },
        {
          model: User,
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["date", "DESC"]],
    });

    res.json({
      ground,
      totalBookings: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get ground bookings error:", error);
    res.status(500).json({
      message: "Failed to fetch ground bookings",
    });
  }
};

exports.deleteGround = async (req, res) => {
  try {
    const ground = await Ground.findOne({
      where: {
        id: req.params.id,
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

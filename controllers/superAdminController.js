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
  Game,
  GameSlot,
  GameTeam,
  GameParticipant,

  sequelize,
} = require("../models");
const { to12Hour } = require("../utils/time");
const bcrypt = require("bcryptjs");
const adminRegistration = require("../utils/templates/adminRegistration");
const { sendEmail } = require("../utils/email");
const path = require("path");
const fs = require("fs");
const { Op } = require("sequelize");
const { formatDateToDDMMYYYY } = require("../utils/time");

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
      attributes: ["id", "name", "email", "phoneNumber"],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const bookings = await Booking.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
      attributes: [
        "id",
        "groundName",
        "adminId",
        "date",
        "slotStartTime",
        "slotEndTime",
        "pricePerSlotAtBooking",
        "status",
        "createdAt",
      ],
      include: [
        {
          model: Admin,
          attributes: ["id", "name", "email"],
        },
      ],
    });

    const formatted = bookings.map((b) => ({
      bookingId: b.id,
      groundName: b.groundName,
      date: formatDateToDDMMYYYY(b.date),
      slotTime: `${to12Hour(b.slotStartTime)} - ${to12Hour(b.slotEndTime)}`,
      price: b.pricePerSlotAtBooking,
      status: b.status,
      bookedAt: b.createdAt,

      admin: b.Admin
        ? {
            id: b.Admin.id,
            name: b.Admin.name,
            email: b.Admin.email,
          }
        : null,
    }));

    res.json({
      user,
      totalBookings: bookings.length,
      bookings: formatted,
    });
  } catch (error) {
    console.error("SUPER ADMIN GET USER BOOKINGS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch user bookings" });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    await sequelize.transaction(async (t) => {
      const user = await User.findByPk(id, { transaction: t });

      if (!user) {
        throw new Error("User not found");
      }

      // Find games where user participated
      const participants = await GameParticipant.findAll({
        where: { userId: user.id },
        transaction: t,
      });

      for (const p of participants) {
        const game = await Game.findByPk(p.gameId, { transaction: t });

        if (game) {
          game.joinedPlayersCount = Math.max(0, game.joinedPlayersCount - 1);

          if (game.joinedPlayersCount < game.totalPlayers) {
            game.status = "open";
          }

          await game.save({ transaction: t });
        }
      }

      await user.destroy({ transaction: t });
    });

    res.status(200).json({
      message: "User and all associated data deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error.message);
    res.status(400).json({
      message: error.message || "Failed to delete user",
    });
  }
};

//ADMIN METHODS

exports.createAdmin = async (req, res) => {
  try {
    const { name, email, phoneNumber, password, planType } = req.body;

    // validation
    if (!name || !email || !password || !planType) {
      return res.status(400).json({
        message: "Name, email, password and planType are required",
      });
    }

    if (!["subscription", "commission"].includes(planType)) {
      return res.status(400).json({
        message: "Invalid plan type",
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

    // Subscription logic
    let subscriptionStartDate = null;
    let subscriptionEndDate = null;

    if (planType === "subscription") {
      subscriptionStartDate = new Date();

      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);
      subscriptionEndDate = endDate;
    }

    //  Create admin
    const admin = await Admin.create({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      isBlocked: false,
      planType,
      subscriptionStartDate,
      subscriptionEndDate,
    });

    // Send email
    try {
      const createdAdmin = await Admin.findOne({ where: { email } });

      await sendEmail({
        to: createdAdmin.email,
        subject: "Your Admin Account is Created 🎉",
        html: adminRegistration({
          adminName: createdAdmin.name,
          adminEmail: createdAdmin.email,
          adminPhone: createdAdmin.phoneNumber,
          planType: createdAdmin.planType,
          subscriptionEndDate: createdAdmin.subscriptionEndDate,
        }),
      });
    } catch (emailError) {
      console.error("ADMIN EMAIL FAILED:", emailError.message);
    }

    res.status(201).json({
      message: "Admin created successfully",
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        phoneNumber: admin.phoneNumber,
        planType: admin.planType,
        subscriptionEndDate: admin.subscriptionEndDate,
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
      order: [["createdAt", "ASC"]],
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

      //  Sync all grounds with admin status
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
      order: [["id", "DESC"]],
      attributes: [
        "id",
        "groundName",
        "date",
        "slotStartTime",
        "slotEndTime",
        "pricePerSlotAtBooking",
        "status",
        "createdAt",
      ],
      include: [
        {
          model: User,
          attributes: ["id", "name", "email"],
        },
        {
          model: Admin,
          attributes: ["id", "name", "email"],
        },
        {
          model: City,
          attributes: ["id", "name"],
        },
      ],
    });

    const formatted = bookings.map((b) => ({
      bookingId: b.id,
      groundName: b.groundName,
      date: b.date,
      slotStartTime: to12Hour(b.slotStartTime),
      slotEndTime: to12Hour(b.slotEndTime),
      user: b.User
        ? {
            name: b.User.name,
            email: b.User.email,
          }
        : null,

      admin: b.Admin
        ? {
            name: b.Admin.name,
            email: b.Admin.email,
          }
        : null,

      city: b.City ? b.City.name : null,

      price: b.pricePerSlotAtBooking,
      status: b.status,
      createdAt: b.createdAt,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("GET ALL BOOKINGS ERROR:", error);
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

    // Prevent double cancellation
    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Booking already cancelled" });
    }

    // Update status
    booking.status = "cancelled";
    await booking.save();

    //  Fetch user only
    const user = await User.findByPk(booking.userId, {
      attributes: ["name", "email"],
    });

    //  Send cancellation email
    if (user?.email) {
      try {
        await sendEmail({
          to: user.email,
          subject: "Your Booking Has Been Cancelled",
          html: `
            <h2>Booking Cancelled</h2>
            <p><strong>Ground:</strong> ${booking.groundName}</p>
            <p><strong>Date:</strong> ${booking.date}</p>
            <p><strong>Time:</strong> ${booking.slotStartTime} - ${booking.slotEndTime}</p>
            <p><strong>Amount:</strong> ₹${booking.totalPrice}</p>
            <p>If this was a mistake, you can book again anytime.</p>
          `,
        });
      } catch (emailError) {
        console.error("❌ CANCELLATION EMAIL FAILED:", emailError.message);
      }
    }

    res.status(200).json({
      message: "Booking cancelled successfully",
      bookingId: booking.id,
    });
  } catch (error) {
    console.error("❌ Cancel booking error:", error);
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

    // Check ground exists
    const ground = await Ground.findByPk(groundId, {
      attributes: ["id", "name"],
    });

    if (!ground) {
      return res.status(404).json({ message: "Ground not found" });
    }

    // Fetch bookings
    const bookings = await Booking.findAll({
      where: { groundId },
      attributes: [
        "id",
        "date",
        "slotStartTime",
        "slotEndTime",
        "pricePerSlotAtBooking",
        "status",
        "createdAt",
      ],
      include: [
        {
          model: User,
          attributes: ["id", "name", "email"],
          required: false,
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const formatted = bookings.map((b) => ({
      bookingId: b.id,
      date: formatDateToDDMMYYYY(b.date),
      slot: {
        startTime: to12Hour(b.slotStartTime),
        endTime: to12Hour(b.slotEndTime),
      },
      price: b.pricePerSlotAtBooking,
      status: b.status,
      user: b.User
        ? {
            id: b.User.id,
            name: b.User.name,
            email: b.User.email,
          }
        : null,
      createdAt: b.createdAt,
    }));

    res.json({
      ground: {
        id: ground.id,
        name: ground.name,
      },
      totalBookings: formatted.length,
      bookings: formatted,
    });
  } catch (error) {
    console.error("GET GROUND BOOKINGS ERROR:", error);
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

// DASHBOARD METHODS

exports.getSuperAdminDashboard = async (req, res) => {
  try {
    /* DATE RANGES*/

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    /* PLATFORM TOTALS */

    const [
      totalUsers,
      totalAdmins,
      totalGrounds,
      activeGrounds,
      totalBookings,
    ] = await Promise.all([
      User.count(),
      Admin.count(),
      Ground.count(),
      Ground.count({ where: { isBlocked: false } }),
      Booking.count(),
    ]);

    // Fetch all confirmed/completed bookings
    const bookingsForRevenue = await Booking.findAll({
      attributes: ["totalPrice"],
      where: {
        status: { [Op.in]: ["confirmed", "completed"] },
      },
      include: [
        {
          model: Admin,
          attributes: ["planType"],
          required: true,
        },
      ],
      raw: true,
    });

    let totalRevenue = 0;
    let totalCommissionReceived = 0;

    bookingsForRevenue.forEach((b) => {
      const amount = Number(b.totalPrice || 0);
      totalRevenue += amount;

      if (b["Admin.planType"] === "commission") {
        totalCommissionReceived += (amount * 10) / 100;
      }
    });

    /* TODAY STATS */

    const [bookingsToday, newUsersToday, newGroundsToday] = await Promise.all([
      Booking.count({
        where: {
          date: { [Op.between]: [todayStart, todayEnd] },
        },
      }),
      User.count({
        where: {
          createdAt: { [Op.between]: [todayStart, todayEnd] },
        },
      }),
      Ground.count({
        where: {
          createdAt: { [Op.between]: [todayStart, todayEnd] },
        },
      }),
    ]);

    const todayBookings = await Booking.findAll({
      attributes: ["totalPrice"],
      where: {
        status: { [Op.in]: ["confirmed", "completed"] },
        createdAt: { [Op.between]: [todayStart, todayEnd] },
      },
      include: [
        {
          model: Admin,
          attributes: ["planType"],
          required: true,
        },
      ],
      raw: true,
    });

    let revenueToday = 0;
    let commissionToday = 0;

    todayBookings.forEach((b) => {
      const amount = Number(b.totalPrice || 0);
      revenueToday += amount;

      if (b["Admin.planType"] === "commission") {
        commissionToday += (amount * 10) / 100;
      }
    });

    /* TOP GROUNDS */

    const bookingStats = await Booking.findAll({
      attributes: [
        [sequelize.col("Slot.Ground.id"), "groundId"],
        [sequelize.fn("COUNT", sequelize.col("Booking.id")), "bookings"],
        [
          sequelize.fn(
            "COALESCE",
            sequelize.fn("SUM", sequelize.col("Booking.totalPrice")),
            0,
          ),
          "revenue",
        ],
      ],
      where: {
        status: { [Op.in]: ["confirmed", "completed"] },
      },
      include: [
        {
          model: Slot,
          attributes: [],
          required: true,
          include: [
            {
              model: Ground,
              attributes: [],
              required: true,
              include: [
                {
                  model: City,
                  as: "City",
                  attributes: ["name"],
                },
              ],
            },
          ],
        },
      ],
      group: ["Slot.Ground.id"],
      raw: true,
    });

    const allGrounds = await Ground.findAll({
      attributes: ["id", "name"],
      include: [
        {
          model: City,
          as: "City",
          attributes: ["name"],
        },
      ],
      raw: true,
    });

    const statsMap = {};
    bookingStats.forEach((s) => {
      statsMap[s.groundId] = s;
    });

    const groundPerformance = allGrounds.map((g) => ({
      groundId: g.id,
      groundName: g.name,
      city: g["City.name"] || null,
      bookings: Number(statsMap[g.id]?.bookings || 0),
      revenue: Number(statsMap[g.id]?.revenue || 0),
    }));

    groundPerformance.sort((a, b) => b.revenue - a.revenue);
    const topGrounds = groundPerformance.slice(0, 5);

    /* ALERTS */

    const groundsWithZeroBookings = groundPerformance.filter(
      (g) => g.bookings === 0,
    ).length;

    const inactiveAdmins = await Admin.count({
      where: {
        updatedAt: {
          [Op.lt]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    });

    /* RESPONSE */

    res.json({
      platformStats: {
        totalUsers,
        totalAdmins,
        totalGrounds,
        activeGrounds,
        inactiveGrounds: totalGrounds - activeGrounds,
        totalBookings,
        totalRevenue,
        totalCommissionReceived,
      },
      todayStats: {
        bookingsToday,
        revenueToday,
        commissionToday,
        newUsersToday,
        newGroundsToday,
      },
      topGrounds,
      alerts: {
        groundsWithZeroBookings,
        inactiveAdmins,
      },
    });
  } catch (error) {
    console.error("SUPER ADMIN DASHBOARD ERROR:", error);
    res.status(500).json({ message: "Failed to load super admin dashboard" });
  }
};

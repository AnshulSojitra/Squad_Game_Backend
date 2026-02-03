const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Admin, Booking, Slot, Ground, User } = require("../models");
const { Op, fn, col } = require("sequelize");
const adminLogin = require("../utils/templates/adminLogin");
const { sendEmail } = require("../utils/email");
const passwordChange = require("../utils/templates/passwordChange");
const sequelize = require("../config/db");

exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ where: { email } });
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    if (admin.isBlocked) {
      return res.status(403).json({
        message: "Your account has been blocked. Please contact support.",
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin.id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    //Send email
    try {
      const admin = await Admin.findOne({ where: { email } });
      await sendEmail({
        to: admin.email,
        subject: "Your Admin Account has been successfully logged in 🎉",
        html: adminLogin({
          adminName: admin.name,
          adminEmail: admin.email,
        }),
      });
    } catch (emailError) {
      console.error("BOOKING EMAIL FAILED:", emailError.message);
    }

    res.json({
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        phoneNumber: admin.phoneNumber,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLoggedInAdmin = async (req, res) => {
  try {
    const admin = await Admin.findByPk(req.admin.id, {
      attributes: ["id", "name", "email", "phoneNumber", "isBlocked"],
    });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json(admin);
  } catch (error) {
    console.error("Get admin profile error:", error);
    res.status(500).json({ message: "Failed to fetch admin profile" });
  }
};

exports.getAdminDashboard = async (req, res) => {
  try {
    const adminId = req.admin.id;

    // Today range
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Total & Active Grounds
    const totalGrounds = await Ground.count({
      where: { adminId },
    });

    const activeGrounds = await Ground.count({
      where: { adminId, isBlocked: false },
    });

    //  Today Bookings
    const todayBookings = await Booking.findAll({
      where: {
        createdAt: {
          [Op.between]: [startOfDay, endOfDay],
        },
      },
      include: {
        model: Slot,
        required: true,
        include: {
          model: Ground,
          required: true,
          where: { adminId },
        },
      },
    });

    const confirmedBookings = todayBookings.filter(
      (b) => b.status === "confirmed",
    );

    const cancelledBookings = todayBookings.filter(
      (b) => b.status === "cancelled",
    );

    const todayRevenue = confirmedBookings.reduce(
      (sum, b) => sum + Number(b.totalPrice),
      0,
    );

    // Upcoming bookings (next 24 hours)
    const now = new Date();
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const upcomingBookings = await Booking.findAll({
      where: {
        date: {
          [Op.between]: [now, next24Hours],
        },
        status: "confirmed",
      },
      include: [
        {
          model: User,
          attributes: ["name"],
        },
        {
          model: Slot,
          include: {
            model: Ground,
            where: { adminId },
            attributes: ["name"],
          },
        },
      ],
      order: [["date", "ASC"]],
      limit: 5,
    });

    const formattedUpcoming = upcomingBookings.map((b) => ({
      bookingId: b.id,
      date: b.date,
      startTime: b.Slot?.startTime,
      endTime: b.Slot?.endTime,
      groundName: b.Slot?.Ground.name,
      userName: b.User?.name || "User",
    }));

    res.json({
      todayBookings: todayBookings.length,
      confirmedBookings: confirmedBookings.length,
      cancelledBookings: cancelledBookings.length,
      todayRevenue,
      activeGrounds,
      totalGrounds,
      upcomingBookings: formattedUpcoming,
    });
  } catch (error) {
    console.error("ADMIN DASHBOARD ERROR:", error);
    res.status(500).json({ message: "Failed to load dashboard" });
  }
};

exports.getBookingChart = async (req, res) => {
  try {
    const adminId = req.admin.id;
    const days = Number(req.query.days) || 7;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);

    // Fetch actual booking data
    const data = await Booking.findAll({
      attributes: [
        [sequelize.fn("DATE", sequelize.col("Booking.createdAt")), "date"],
        [sequelize.fn("COUNT", sequelize.col("Booking.id")), "count"],
      ],
      where: {
        createdAt: { [Op.gte]: startDate },
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
              where: { adminId },
            },
          ],
        },
      ],
      group: [sequelize.fn("DATE", sequelize.col("Booking.createdAt"))],
      raw: true,
    });

    // Convert DB result → map
    const bookingMap = {};
    data.forEach((row) => {
      bookingMap[row.date] = Number(row.count);
    });

    // Generate all dates & fill missing with 0
    const result = [];
    for (let i = 1; i <= days; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const key = date.toISOString().split("T")[0];

      result.push({
        date: key,
        bookings: bookingMap[key] || 0,
      });
    }

    res.json(result);
  } catch (error) {
    console.error("BOOKING CHART ERROR:", error);
    res.status(500).json({ message: "Failed to load booking chart" });
  }
};

exports.getRevenueChart = async (req, res) => {
  try {
    const adminId = req.admin.id;
    const days = Number(req.query.days) || 7;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);

    // Fetch actual revenue data
    const data = await Booking.findAll({
      attributes: [
        [sequelize.fn("DATE", sequelize.col("Booking.createdAt")), "date"],
        [sequelize.fn("SUM", sequelize.col("Booking.totalPrice")), "revenue"],
      ],
      where: {
        date: { [Op.gte]: startDate },
        status: "confirmed",
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
              where: { adminId },
            },
          ],
        },
      ],
      group: [sequelize.fn("DATE", sequelize.col("Booking.createdAt"))],
      raw: true,
    });

    // Convert DB rows → map
    const revenueMap = {};
    data.forEach((row) => {
      revenueMap[row.date] = Number(row.revenue);
    });

    // Generate full date range with zero revenue fallback
    const result = [];
    for (let i = 1; i <= days; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const key = date.toISOString().split("T")[0];

      result.push({
        date: key,
        revenue: revenueMap[key] || 0,
      });
    }

    res.json(result);
  } catch (error) {
    console.error("REVENUE CHART ERROR:", error);
    res.status(500).json({ message: "Failed to load revenue chart" });
  }
};

exports.getGroundBreakdown = async (req, res) => {
  try {
    const adminId = req.admin.id;
    const days = Number(req.query.days) || 7;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const data = await Ground.findAll({
      attributes: [
        ["id", "groundId"],
        ["name", "groundName"],
        [sequelize.fn("COUNT", sequelize.col("Slots.Bookings.id")), "bookings"],
        [
          sequelize.fn(
            "COALESCE",
            sequelize.fn("SUM", sequelize.col("Slots.Bookings.totalPrice")),
            0,
          ),
          "revenue",
        ],
      ],
      where: { adminId },
      include: [
        {
          model: Slot,
          attributes: [],
          required: false,
          include: [
            {
              model: Booking,
              attributes: [],
              required: false,
              where: {
                status: "confirmed",
                date: { [Op.gte]: startDate },
              },
            },
          ],
        },
      ],
      group: ["Ground.id"],
      order: [[sequelize.literal("revenue"), "DESC"]],
      raw: true,
    });

    const formatted = data.map((d) => ({
      groundId: d.groundId,
      groundName: d.groundName,
      bookings: Number(d.bookings),
      revenue: Number(d.revenue),
    }));

    res.json(formatted);
  } catch (error) {
    console.error("GROUND BREAKDOWN ERROR:", error);
    res.status(500).json({ message: "Failed to load ground breakdown" });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required",
      });
    }

    const admin = await Admin.findByPk(req.admin.id);

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, admin.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Current password is incorrect",
      });
    }

    // Prevent same password reuse
    const isSamePassword = await bcrypt.compare(newPassword, admin.password);
    if (isSamePassword) {
      return res.status(400).json({
        message: "New password cannot be same as current password",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    admin.password = hashedPassword;
    await admin.save();

    try {
      const admin = await Admin.findByPk(req.admin.id);
      await sendEmail({
        to: admin.email,
        subject: "Your Admin Account password has been successfully changed 🎉",
        html: passwordChange({
          name: admin.name,
          email: admin.email,
        }),
      });
    } catch (emailError) {
      console.error("BOOKING EMAIL FAILED:", emailError.message);
    }

    res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      message: "Failed to change password",
    });
  }
};

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const admin = await Admin.findOne({ where: { email } });

    // Do NOT reveal if admin exists
    if (!admin) {
      return res.status(200).json({
        message: "If this email exists, an OTP has been sent",
      });
    }

    const otp = generateOtp();

    admin.resetPasswordOtp = otp;
    admin.resetPasswordOtpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await admin.save();

    await sendEmail({
      to: admin.email,
      subject: "Password Reset OTP",
      html: `
        <h3>Your OTP to reset your password for ${admin.email}</h3>
        <p><strong>${otp}</strong></p>
        <p>This OTP is valid for 10 minutes.</p>
      `,
    });

    res.status(200).json({
      message: "If this email exists, an OTP has been sent",
    });
  } catch (error) {
    console.error("Forgot password OTP error:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        message: "Email, OTP and new password are required",
      });
    }

    const admin = await Admin.findOne({
      where: {
        email,
        resetPasswordOtp: otp,
        resetPasswordOtpExpires: { [Op.gt]: Date.now() },
      },
    });

    if (!admin) {
      return res.status(400).json({
        message: "Invalid or expired OTP",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    admin.password = hashedPassword;
    admin.resetPasswordOtp = null;
    admin.resetPasswordOtpExpires = null;
    await admin.save();

    await sendEmail({
      to: admin.email,
      subject: "Password Reset Successful 🎉",
      html: `
        <h3>Your password has been successfully reset for ${admin.email}</h3>
      
        <p>If you did not initiate this change, please contact our support team immediately.</p>
      `,
    });

    res.status(200).json({
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Reset password OTP error:", error);
    res.status(500).json({ message: "Failed to reset password" });
  }
};

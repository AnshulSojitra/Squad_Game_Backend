const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Admin, Booking, Ground, User } = require("../models");
const { Op } = require("sequelize");
const adminLogin = require("../utils/templates/adminLogin");
const { sendEmail } = require("../utils/email");
const passwordChange = require("../utils/templates/passwordChange");
const sequelize = require("../config/db");
const { formatDateToDDMMYYYY } = require("../utils/time");

exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ where: { email } });
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // subscription check
    if (
      admin.planType === "subscription" &&
      admin.subscriptionEndDate &&
      new Date(admin.subscriptionEndDate) < new Date()
    ) {
      await admin.update({ isBlocked: true });

      return res.status(403).json({
        message: "Subscription expired. Please renew to continue.",
      });
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

    // Grounds stats
    const totalGrounds = await Ground.count({
      where: { adminId },
    });

    const activeGrounds = await Ground.count({
      where: { adminId, isBlocked: false },
    });

    // TODAY BOOKINGS
    const todayBookings = await Booking.findAll({
      where: {
        adminId,
        createdAt: {
          [Op.between]: [startOfDay, endOfDay],
        },
      },
      attributes: ["id", "status", "totalPrice"],
    });

    const confirmedBookings = todayBookings.filter(
      (b) => b.status === "confirmed",
    );

    const cancelledBookings = todayBookings.filter(
      (b) => b.status === "cancelled",
    );

    const todayRevenue = confirmedBookings.reduce(
      (sum, b) => sum + Number(b.totalPrice || 0),
      0,
    );

    // UPCOMING BOOKINGS (next 24 hours)
    const now = new Date();
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const upcomingBookings = await Booking.findAll({
      where: {
        adminId,
        status: "confirmed",
        date: {
          [Op.between]: [
            now.toISOString().split("T")[0],
            next24Hours.toISOString().split("T")[0],
          ],
        },
      },
      include: [
        {
          model: User,
          attributes: ["name"],
        },
      ],
      attributes: ["id", "date", "slotStartTime", "slotEndTime", "groundName"],
      order: [
        ["date", "ASC"],
        ["slotStartTime", "ASC"],
      ],
      limit: 5,
    });

    const formattedUpcoming = upcomingBookings.map((b) => ({
      bookingId: b.id,
      date: b.date,
      startTime: b.slotStartTime,
      endTime: b.slotEndTime,
      groundName: b.groundName,
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

    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    const data = await Booking.findAll({
      attributes: [
        [sequelize.fn("DATE", sequelize.col("createdAt")), "date"],
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      where: {
        adminId,
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
      },
      group: [sequelize.fn("DATE", sequelize.col("createdAt"))],
      raw: true,
    });

    const bookingMap = {};
    data.forEach((row) => {
      bookingMap[row.date] = Number(row.count);
    });

    const result = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);

      const key = d.toLocaleDateString("en-CA");

      result.push({
        date: formatDateToDDMMYYYY(key),
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

    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    //  Fetch revenue
    const data = await Booking.findAll({
      attributes: [
        [sequelize.fn("DATE", sequelize.col("createdAt")), "date"],
        [sequelize.fn("SUM", sequelize.col("totalPrice")), "revenue"],
      ],
      where: {
        adminId,
        status: { [Op.in]: ["confirmed", "completed"] },
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
      },
      group: [sequelize.fn("DATE", sequelize.col("createdAt"))],
      raw: true,
    });

    const revenueMap = {};
    data.forEach((row) => {
      revenueMap[row.date] = Number(row.revenue);
    });

    // Fill missing dates with 0
    const result = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);

      const key = d.toLocaleDateString("en-CA");

      result.push({
        date: formatDateToDDMMYYYY(key),
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
        [sequelize.fn("COUNT", sequelize.col("Bookings.id")), "bookings"],
        [
          sequelize.fn(
            "COALESCE",
            sequelize.fn("SUM", sequelize.col("Bookings.totalPrice")),
            0,
          ),
          "revenue",
        ],
      ],
      where: { adminId },
      include: [
        {
          model: Booking,
          attributes: [],
          required: false,
          where: {
            status: {
              [Op.in]: ["confirmed", "completed"],
            },
            createdAt: {
              [Op.gte]: startDate,
            },
          },
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

exports.renewSubscription = async (req, res) => {
  try {
    const adminId = req.params.adminId;

    const admin = await Admin.findByPk(adminId);

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (admin.planType !== "subscription") {
      return res.status(400).json({
        message: "Only subscription plan admins can renew subscription",
      });
    }

    const today = new Date();
    let newStartDate;
    let newEndDate;

    // If subscription still active → extend from existing end date
    if (admin.subscriptionEndDate && admin.subscriptionEndDate > today) {
      newStartDate = admin.subscriptionStartDate;
      newEndDate = new Date(admin.subscriptionEndDate);
      newEndDate.setMonth(newEndDate.getMonth() + 1);
    } else {
      // If expired → start from today
      newStartDate = today;
      newEndDate = new Date();
      newEndDate.setMonth(today.getMonth() + 1);
    }

    admin.subscriptionStartDate = newStartDate;
    admin.subscriptionEndDate = newEndDate;
    admin.isBlocked = false;

    await admin.save();

    res.status(200).json({
      message: "Subscription renewed successfully",
      subscriptionStartDate: admin.subscriptionStartDate,
      subscriptionEndDate: admin.subscriptionEndDate,
    });
  } catch (error) {
    console.error("RENEW SUBSCRIPTION ERROR:", error);
    res.status(500).json({
      message: "Failed to renew subscription",
    });
  }
};

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Admin, Booking, Slot, Ground } = require("../models");
const { Op, fn, col } = require("sequelize");
const adminLogin = require("../utils/templates/adminLogin");
const { sendEmail } = require("../utils/email");

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

exports.getAdminRevenue = async (req, res) => {
  try {
    const adminId = req.admin.id;

    const rows = await Booking.findAll({
      attributes: [
        [fn("SUM", col("Booking.totalPrice")), "totalRevenue"],
        [col("Slot.Ground.id"), "groundId"],
        [col("Slot.Ground.name"), "groundName"],
      ],
      where: {
        status: "confirmed",
      },
      include: [
        {
          model: Slot,
          attributes: [],
          include: [
            {
              model: Ground,
              attributes: [],
              where: { adminId },
            },
          ],
        },
      ],
      group: ["Slot.Ground.id"],
      raw: true, // 🔥 REQUIRED
    });

    // ❗ DO NOT access Slot or Ground here
    let totalRevenue = 0;

    const revenueByGround = rows.map((row) => {
      const revenue = Number(row.totalRevenue) || 0;
      totalRevenue += revenue;

      return {
        groundId: row.groundId,
        groundName: row.groundName,
        revenue,
      };
    });

    res.json({
      totalRevenue,
      revenueByGround,
    });
  } catch (error) {
    console.error("Admin revenue error:", error);
    res.status(500).json({
      message: "Failed to fetch revenue",
    });
  }
};

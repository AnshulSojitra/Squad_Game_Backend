const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Admin, Booking, Slot, Ground } = require("../models");
const { Op, fn, col } = require("sequelize");
const adminLogin = require("../utils/templates/adminLogin");
const { sendEmail } = require("../utils/email");
const passwordChange = require("../utils/templates/passwordChange");

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

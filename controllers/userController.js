const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
// const { use } = require("react");
const userRegistration = require("../utils/templates/userRegistration");
const passwordChange = require("../utils/templates/passwordChange");
const { sendEmail } = require("../utils/email");
const userLogin = require("../utils/templates/userLogin");
const { Op } = require("sequelize");

exports.registerUser = async (req, res) => {
  try {
    const { name, email, phoneNumber, password } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phoneNumber,
      password: hashedPassword,
    });

    // Send welcome email

    try {
      const user = await User.findOne({ where: { email } });
      await sendEmail({
        to: user.email,
        subject: "Your Account is Created 🎉",
        html: userRegistration({
          userName: user.name,
          userEmail: user.email,
          userPhone: user.phoneNumber,
        }),
      });
    } catch (emailError) {
      console.error("BOOKING EMAIL FAILED:", emailError.message);
    }

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, role: "user" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    //Send login email

    try {
      const user = await User.findOne({ where: { email } });
      await sendEmail({
        to: user.email,
        subject: "Login Successful 🎉",
        html: userLogin({
          userName: user.name,
          userEmail: user.email,
        }),
      });
    } catch (emailError) {
      console.error("BOOKING EMAIL FAILED:", emailError.message);
    }

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLoggedInUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "name", "email", "phoneNumber", "isBlocked"],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({ message: "Failed to fetch user profile" });
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

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Current password is incorrect",
      });
    }

    // Prevent same password reuse
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        message: "New password cannot be same as current password",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    //Send email

    try {
      const user = await User.findByPk(req.user.id);
      await sendEmail({
        to: user.email,
        subject: "Password Changed Successfully 🎉",
        html: passwordChange({
          name: user.name,
          email: user.email,
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

    const user = await User.findOne({ where: { email } });

    // Do NOT reveal if user exists
    if (!user) {
      return res.status(200).json({
        message: "If this email exists, an OTP has been sent",
      });
    }

    const otp = generateOtp();

    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    await sendEmail({
      to: user.email,
      subject: "Password Reset OTP",
      html: `
        <h3>Your OTP to reset your password for ${user.email}</h3>
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

    const user = await User.findOne({
      where: {
        email,
        resetPasswordOtp: otp,
        resetPasswordOtpExpires: { [Op.gt]: Date.now() },
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired OTP",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetPasswordOtp = null;
    user.resetPasswordOtpExpires = null;
    await user.save();

    await sendEmail({
      to: user.email,
      subject: "Password Reset Successful 🎉",
      html: `
        <h3>Your password has been successfully reset for ${user.email}</h3>
      
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

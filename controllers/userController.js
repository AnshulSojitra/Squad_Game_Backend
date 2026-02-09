const jwt = require("jsonwebtoken");
const { User } = require("../models");
const userRegistration = require("../utils/templates/userRegistration");
const { sendEmail } = require("../utils/email");
const userLogin = require("../utils/templates/userLogin");
const { identifyLoginField } = require("../utils/identifyLoginField");
const { sendSms } = require("../utils/sendSms");

exports.registerUser = async (req, res) => {
  try {
    const { name, email, phoneNumber } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      phoneNumber,
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
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
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

exports.sendOtp = async (req, res) => {
  try {
    const { login } = req.body;

    const parsed = identifyLoginField(login);
    if (!parsed) {
      return res.status(400).json({ message: "Invalid email or phone number" });
    }

    const otp = Math.floor(10000 + Math.random() * 90000).toString();
    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    let user;
    let isNewUser = false;

    if (parsed.type === "email") {
      user = await User.findOne({ where: { email: parsed.value } });

      if (!user) {
        user = await User.create({ email: parsed.value });
        isNewUser = true;
      }
    } else {
      user = await User.findOne({ where: { phoneNumber: parsed.value } });

      if (!user) {
        user = await User.create({ phoneNumber: parsed.value });
        isNewUser = true;
      }
    }

    await user.update({
      otp,
      otpExpiresAt: expiry,
    });

    // send OTP (email / sms)
    if (parsed.type === "email") {
      await sendEmail({
        to: parsed.value,
        subject: "Your Box Arena OTP",
        html: `<h2>${otp}</h2><p>Valid for 5 minutes</p>`,
      });
    } else {
      await sendSms({
        to: `+91${parsed.value}`,
        message: `Your Box Arena OTP is ${otp}. Valid for 5 minutes.`,
      });
    }

    res.json({
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("SEND OTP ERROR FULL:", error);
    console.error("PARENT:", error.parent);
    console.error("ORIGINAL:", error.original);
    return res.status(500).json({ message: "Failed to send OTP" });
  }
};

exports.verifyOtp = async (req, res) => {
  const { login, otp } = req.body;

  const parsed = identifyLoginField(login);
  if (!parsed) {
    return res.status(400).json({ message: "Invalid input" });
  }

  const where =
    parsed.type === "email"
      ? { email: parsed.value }
      : { phoneNumber: parsed.value };

  const user = await User.findOne({ where });

  if (
    !user ||
    user.otp !== otp ||
    !user.otpExpiresAt ||
    new Date() > user.otpExpiresAt
  ) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  await user.update({ otp: null, otpExpiresAt: null });

  const isNewUser = !user.name || !user.email || !user.phoneNumber;

  const token = jwt.sign(
    { id: user.id, role: "user" },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

  res.json({
    message: "Login successful",
    token,
    isNewUser,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
    },
  });
};

exports.completeProfile = async (req, res) => {
  const userId = req.user.id;
  const { name, email, phoneNumber } = req.body;

  const user = await User.findByPk(userId);

  isValidIndianPhoneNumber = (phone) => {
    if (!phone) return false;

    const normalized = phone.toString().trim();

    const regex = /^[6-9]\d{9}$/;

    return regex.test(normalized);
  };
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const updateData = {};

  // Name validation
  if (!user.name && name) {
    if (name.trim().length < 2) {
      return res.status(400).json({
        message: "Name must be at least 2 characters long",
      });
    }
    updateData.name = name.trim();
  }

  // Email validation
  if (!user.email && email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }
    updateData.email = email.toLowerCase().trim();
  }

  // Phone number validation
  if (!user.phoneNumber && phoneNumber) {
    if (!isValidIndianPhoneNumber(phoneNumber)) {
      return res.status(400).json({
        message:
          "Invalid phone number. Enter a valid 10-digit Indian mobile number",
      });
    }
    updateData.phoneNumber = phoneNumber.trim();
  }

  if (Object.keys(updateData).length === 0) {
    return res.json({ message: "Profile already complete" });
  }

  try {
    await user.update(updateData);
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        message: "Email or phone number already in use",
      });
    }
    throw error;
  }

  res.json({
    message: "Profile completed successfully",
    user,
  });
};

exports.changeName = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        message: "Name must be at least 2 characters long",
      });
    }

    const user = await User.findByPk(userId);

    if (!user || user.isDeleted) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    await user.update({
      name: name.trim(),
    });

    res.json({
      message: "Name updated successfully",
      name: user.name,
    });
  } catch (error) {
    console.error("CHANGE NAME ERROR:", error);
    res.status(500).json({
      message: "Failed to update name",
    });
  }
};

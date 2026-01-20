const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
// const { use } = require("react");
const userRegistration = require("../utils/templates/userRegistration");
const { sendEmail } = require("../utils/email");
const userLogin = require("../utils/templates/userLogin");

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
      attributes: ["id", "name", "email", "isBlocked"],
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

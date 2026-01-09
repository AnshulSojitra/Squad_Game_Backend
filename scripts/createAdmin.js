require("dotenv").config();
const bcrypt = require("bcryptjs");

const { sequelize, Admin } = require("../models");

const createAdmin = async () => {
  try {
    // Connect to DB
    await sequelize.authenticate();
    console.log("✅ Database connected");

    // Admin (Ground Owner) details
    const adminData = {
      name: "Anshul Official",
      email: "anshul.patel321@gmail.com",
      password: "anshul",
      role: "admin", // admin = ground owner
    };

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      where: { email: adminData.email },
    });

    if (existingAdmin) {
      console.log("⚠️ Admin already exists");
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    // Create admin
    await Admin.create({
      name: adminData.name,
      email: adminData.email,
      password: hashedPassword,
      role: adminData.role,
    });

    console.log("🎉 Admin (Ground Owner) created successfully");
    console.log("📧 Email:", adminData.email);
    console.log("🔑 Password:", adminData.password);

    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to create admin:", error.message);
    process.exit(1);
  }
};

createAdmin();

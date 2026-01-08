require("dotenv").config();
const bcrypt = require("bcryptjs");

const { sequelize, SuperAdmin } = require("../models");

const createAdmin = async () => {
  try {
    // Connect to DB
    await sequelize.authenticate();
    console.log("✅ Database connected");

    // Super Admin details
    const superAdminData = {
      name: "Niraj Soni",
      email: "niraj@superadmin.com",
      password: "niraj",
    };

    // Check if super admin already exists
    const existingSuperAdmin = await SuperAdmin.findOne({
      where: { email: superAdminData.email },
    });

    if (existingSuperAdmin) {
      console.log("⚠️ Super Admin already exists");
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(superAdminData.password, 10);

    // Create super admin
    await SuperAdmin.create({
      name: superAdminData.name,
      email: superAdminData.email,
      password: hashedPassword,
    });

    console.log("🎉 Super Admin created successfully");
    console.log("📧 Email:", superAdminData.email);
    console.log("🔑 Password:", superAdminData.password);

    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to create admin:", error.message);
    process.exit(1);
  }
};

createAdmin();

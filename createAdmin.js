require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("./models/Admin");

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const hashedPassword = await bcrypt.hash("admin123", 10);

  await Admin.create({
    email: "admin@example.com",
    password: hashedPassword,
    role: "admin",
  });

  console.log("Admin created");
  process.exit();
});

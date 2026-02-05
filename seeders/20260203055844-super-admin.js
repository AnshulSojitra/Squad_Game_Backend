"use strict";

const bcrypt = require("bcryptjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    const hashedPassword = await bcrypt.hash("admin123", 10);

    // delete first to avoid UNIQUE constraint issues
    await queryInterface.bulkDelete("super_admins", {
      email: "superadmin@boxarena.com",
    });

    await queryInterface.bulkInsert("super_admins", [
      {
        name: "Super Admin",
        email: "superadmin@boxarena.com",
        password: hashedPassword,
        createdAt: now,
        updatedAt: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("super_admins", {
      email: "superadmin@boxarena.com",
    });
  },
};

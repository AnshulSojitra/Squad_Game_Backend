"use strict";
const bcrypt = require("bcryptjs");

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert("SuperAdmin", [
      {
        name: "Super Admin",
        email: "superadmin@boxarena.com",
        password: await bcrypt.hash("admin123", 10),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("SuperAdmins", {
      email: "superadmin@boxarena.com",
    });
  },
};

//npx sequelize-cli db:seed:all

"use strict";
const bcrypt = require("bcryptjs");

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert("Super_admins", [
      {
        name: "Super Admin",
        email: "superadmin@boxarena.com",
        password: await bcrypt.hash("admin123", 10),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("Super_admins", {
      email: "superadmin@boxarena.com",
    });
  },
};

//npx sequelize-cli db:seed:all

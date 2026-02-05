"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {},

  async down(queryInterface) {
    await queryInterface.removeColumn("Bookings", "area");
    await queryInterface.removeColumn("Bookings", "city");
    await queryInterface.removeColumn("Bookings", "state");
    await queryInterface.removeColumn("Bookings", "country");
  },
};

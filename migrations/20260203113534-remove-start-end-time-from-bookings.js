"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.removeColumn("Bookings", "startTime");
    await queryInterface.removeColumn("Bookings", "endTime");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("Bookings", "startTime", {
      type: Sequelize.TIME,
      allowNull: false,
    });

    await queryInterface.addColumn("Bookings", "endTime", {
      type: Sequelize.TIME,
      allowNull: false,
    });
  },
};

"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Bookings", "area", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("Bookings", "city", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("Bookings", "state", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("Bookings", "country", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("Bookings", "area");
    await queryInterface.removeColumn("Bookings", "city");
    await queryInterface.removeColumn("Bookings", "state");
    await queryInterface.removeColumn("Bookings", "country");
  },
};

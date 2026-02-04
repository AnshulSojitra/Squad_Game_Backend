"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Bookings", "groundId", {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    await queryInterface.addColumn("Bookings", "groundName", {
      type: Sequelize.STRING,
      allowNull: false,
    });

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

    await queryInterface.addColumn("Bookings", "slotStartTime", {
      type: Sequelize.TIME,
      allowNull: false,
    });

    await queryInterface.addColumn("Bookings", "slotEndTime", {
      type: Sequelize.TIME,
      allowNull: false,
    });

    await queryInterface.addColumn("Bookings", "pricePerSlotAtBooking", {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("Bookings", "groundId");
    await queryInterface.removeColumn("Bookings", "groundName");
    await queryInterface.removeColumn("Bookings", "area");
    await queryInterface.removeColumn("Bookings", "city");
    await queryInterface.removeColumn("Bookings", "state");
    await queryInterface.removeColumn("Bookings", "country");
    await queryInterface.removeColumn("Bookings", "slotStartTime");
    await queryInterface.removeColumn("Bookings", "slotEndTime");
    await queryInterface.removeColumn("Bookings", "pricePerSlotAtBooking");
  },
};

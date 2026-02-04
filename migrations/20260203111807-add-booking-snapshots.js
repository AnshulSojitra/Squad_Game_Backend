"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Bookings", "groundId", {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    await queryInterface.addColumn("Bookings", "adminId", {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    await queryInterface.addColumn("Bookings", "groundName", {
      type: Sequelize.STRING,
      allowNull: false,
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
    await queryInterface.removeColumn("Bookings", "adminId");
    await queryInterface.removeColumn("Bookings", "groundName");
    await queryInterface.removeColumn("Bookings", "slotStartTime");
    await queryInterface.removeColumn("Bookings", "slotEndTime");
    await queryInterface.removeColumn("Bookings", "pricePerSlotAtBooking");
  },
};

"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {},

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

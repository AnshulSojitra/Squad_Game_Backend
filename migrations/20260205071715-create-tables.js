"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameTable("Super_admins", "super_admins");
    await queryInterface.renameTable("Admins", "admins");
    await queryInterface.renameTable("Users", "users");
    await queryInterface.renameTable("Bookings", "bookings");
    await queryInterface.renameTable("Countries", "countries");
    await queryInterface.renameTable("States", "states");
    await queryInterface.renameTable("Cities", "cities");
    await queryInterface.renameTable("Amenities", "amenities");
    await queryInterface.renameTable("GroundImages", "groundimages");
    await queryInterface.renameTable("Grounds", "grounds");
    await queryInterface.renameTable("Reviews", "reviews");
    await queryInterface.renameTable("Slots", "slots");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameTable("slots", "Slots");
    await queryInterface.renameTable("reviews", "Reviews");
    await queryInterface.renameTable("grounds", "Grounds");
    await queryInterface.renameTable("groundimages", "GroundImages");
    await queryInterface.renameTable("amenities", "Amenities");
    await queryInterface.renameTable("cities", "Cities");
    await queryInterface.renameTable("states", "States");
    await queryInterface.renameTable("countries", "Countries");
    await queryInterface.renameTable("bookings", "Bookings");
    await queryInterface.renameTable("users", "Users");
    await queryInterface.renameTable("admins", "Admins");
    await queryInterface.renameTable("super_admins", "Super_admins");
  },
};

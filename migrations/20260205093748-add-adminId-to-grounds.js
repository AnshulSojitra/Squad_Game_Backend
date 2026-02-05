"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("grounds", "adminId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "admins", // table name (lowercase)
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("grounds", "adminId");
  },
};

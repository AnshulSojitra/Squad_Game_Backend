"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("slots", "groundId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "grounds", // table name (lowercase)
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("slots", "groundId");
  },
};

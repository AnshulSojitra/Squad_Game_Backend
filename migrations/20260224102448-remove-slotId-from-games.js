"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("games", "slotId");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("games", "slotId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "slots",
        key: "id",
      },
      onDelete: "CASCADE",
    });
  },
};

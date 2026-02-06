"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = [
      "Countries",
      "States",
      "Cities",
      "Grounds",
      "Slots",
      "GroundImages",
      "Amenities",
      "Reviews",
    ];

    for (const table of tables) {
      await queryInterface.addColumn(table, "createdAt", {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      });

      await queryInterface.addColumn(table, "updatedAt", {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      });
    }
  },

  async down(queryInterface) {
    const tables = [
      "Countries",
      "States",
      "Cities",
      "Grounds",
      "Slots",
      "GroundImages",
      "Amenities",
      "Reviews",
    ];

    for (const table of tables) {
      await queryInterface.removeColumn(table, "createdAt");
      await queryInterface.removeColumn(table, "updatedAt");
    }
  },
};

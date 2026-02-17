"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    /* ---------- LOCATION ---------- */

    /* ---------- GROUNDS ---------- */

    /* ---------- SLOT / MEDIA ---------- */

    /* ---------- BOOKINGS ---------- */

    /* ---------- REVIEWS ---------- */

    await queryInterface.addColumn("Reviews", "userId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: "Users", key: "id" },
      onDelete: "CASCADE",
    });

    await queryInterface.addColumn("Reviews", "groundId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: "Grounds", key: "id" },
      onDelete: "CASCADE",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("Reviews", "groundId");
    await queryInterface.removeColumn("Reviews", "userId");
  },
};

"use strict";

const { v4: uuidv4 } = require("uuid");

module.exports = {
  async up(queryInterface, Sequelize) {
    // Step 1: add column nullable
    await queryInterface.addColumn("users", "uuid", {
      type: Sequelize.UUID,
      allowNull: true,
    });

    // Step 2: populate existing rows
    const users = await queryInterface.sequelize.query(`SELECT id FROM users`, {
      type: Sequelize.QueryTypes.SELECT,
    });

    for (const user of users) {
      await queryInterface.sequelize.query(
        `UPDATE users SET uuid='${uuidv4()}' WHERE id=${user.id}`,
      );
    }

    // Step 3: make column NOT NULL + UNIQUE
    await queryInterface.changeColumn("users", "uuid", {
      type: Sequelize.UUID,
      allowNull: false,
      unique: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("users", "uuid");
  },
};

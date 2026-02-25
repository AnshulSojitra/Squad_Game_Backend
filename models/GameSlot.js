const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const GameSlot = sequelize.define(
  "GameSlot",
  {
    gameId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    slotId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "gameslots",
    freezeTableName: true,
    timestamps: true,
  },
);

module.exports = GameSlot;

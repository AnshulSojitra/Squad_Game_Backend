const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const GameTeam = sequelize.define(
  "GameTeam",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    gameId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    teamNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "gameteams",
    timestamps: true,
  },
);

module.exports = GameTeam;

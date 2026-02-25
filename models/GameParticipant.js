const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const GameParticipant = sequelize.define(
  "GameParticipant",
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

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    teamId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "gameparticipants",
    timestamps: true,
  },
);

module.exports = GameParticipant;

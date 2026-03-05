const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Game = sequelize.define(
  "Game",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sport: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    totalTeams: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    playersPerTeam: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    totalPlayers: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    joinedPlayersCount: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    status: {
      type: DataTypes.ENUM("open", "full", "cancelled", "completed"),
      defaultValue: "open",
    },
    pricePerPlayer: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
  },
  {
    tableName: "games",
    timestamps: true,
  },
);

module.exports = Game;

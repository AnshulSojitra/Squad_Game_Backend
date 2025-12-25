const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Ground = sequelize.define(
  "Ground",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    /* BASIC INFO */
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    contactNo: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    pricePerSlot: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    /* LOCATION */
    area: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    /* GAME */
    game: {
      type: DataTypes.STRING,
      allowNull: false, // cricket, football, etc.
    },

    /* OPERATING HOURS */
    openingTime: {
      type: DataTypes.STRING, // "06:00"
      allowNull: false,
    },

    closingTime: {
      type: DataTypes.STRING, // "23:00"
      allowNull: false,
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  { timestamps: true }
);

module.exports = Ground;

const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Slot = sequelize.define(
  "Slot",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    startTime: {
      type: DataTypes.STRING, // "13:00"
      allowNull: false,
    },

    endTime: {
      type: DataTypes.STRING, // auto-calculated
      allowNull: false,
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  { timestamps: true }
);

module.exports = Slot;

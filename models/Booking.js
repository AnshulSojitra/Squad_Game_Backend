const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Booking = sequelize.define(
  "Booking",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    date: {
      type: DataTypes.DATEONLY, // YYYY-MM-DD
      allowNull: false,
    },

    startTime: {
      type: DataTypes.STRING, // "10:00"
      allowNull: false,
    },

    endTime: {
      type: DataTypes.STRING, // "11:00"
      allowNull: false,
    },

    totalPrice: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM("pending", "confirmed", "cancelled"),
      defaultValue: "pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Booking;

// models/Booking.js
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

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    slotId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    totalPrice: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM("confirmed", "cancelled", "completed"),
      defaultValue: "confirmed",
    },

    groundId: {
      type: DataTypes.INTEGER,
    },

    adminId: {
      type: DataTypes.INTEGER,
    },
    groundName: {
      type: DataTypes.STRING,
    },
    slotStartTime: {
      type: DataTypes.TIME,
    },
    slotEndTime: {
      type: DataTypes.TIME,
    },
    pricePerSlotAtBooking: {
      type: DataTypes.INTEGER,
    },
    area: {
      type: DataTypes.STRING,
    },
    city: {
      type: DataTypes.STRING,
    },
    state: {
      type: DataTypes.STRING,
    },
    country: {
      type: DataTypes.STRING,
    },
    razorpayOrderId: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    razorpayPaymentId: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    paymentStatus: {
      type: DataTypes.ENUM("pending", "paid", "failed", "refunded"),
      allowNull: false,
      defaultValue: "pending",
    },

    cityId: { type: DataTypes.INTEGER },
  },
  {
    tableName: "bookings",
    timestamps: true,
  },
);

// sequelize.sync({ alter: true });

module.exports = Booking;

const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Admin = sequelize.define(
  "Admin",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      unique: true,
    },
    password: DataTypes.STRING,
    phoneNumber: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },

    role: {
      type: DataTypes.STRING,
      defaultValue: "admin",
    },
    isBlocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    resetPasswordOtp: {
      type: DataTypes.STRING,
    },
    resetPasswordOtpExpires: {
      type: DataTypes.DATE,
    },
    planType: {
      type: DataTypes.ENUM("subscription", "commission"),
      allowNull: false,
    },

    subscriptionStartDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    subscriptionEndDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "admins",
    timestamps: true,
  },
);

// sequelize.sync({ alter: true });

module.exports = Admin;

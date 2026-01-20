const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },

  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: "user",
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
});

// sequelize.sync({ alter: true });

module.exports = User;

const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
    },

    phoneNumber: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
    },

    role: {
      type: DataTypes.STRING,
      defaultValue: "user",
    },
    isBlocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    otp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    otpExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "users",
    timestamps: true,
  },
);

// sequelize.sync({ alter: true });

module.exports = User;

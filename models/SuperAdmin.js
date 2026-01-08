// models/SuperAdmin.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const SuperAdmin = sequelize.define(
  "SuperAdmin",
  {
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
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "super_admins",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

module.exports = SuperAdmin;

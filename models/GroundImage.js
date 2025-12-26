const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const GroundImage = sequelize.define(
  "GroundImage",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    groundId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { timestamps: true }
);

module.exports = GroundImage;

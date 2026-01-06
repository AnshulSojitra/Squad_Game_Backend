// models/Amenity.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Amenity = sequelize.define("Amenity", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  groundId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Amenity;

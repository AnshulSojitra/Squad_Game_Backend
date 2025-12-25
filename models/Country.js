const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Country = sequelize.define("Country", {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phoneCode: {
    type: DataTypes.STRING,
  },
  shortCode: {
    type: DataTypes.STRING,
  },
});

module.exports = Country;

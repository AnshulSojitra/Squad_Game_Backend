const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const City = sequelize.define("City", {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = City;

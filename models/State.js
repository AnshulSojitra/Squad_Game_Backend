const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const State = sequelize.define("State", {
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

module.exports = State;

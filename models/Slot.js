const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Slot = sequelize.define("Slot", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: false,
  },
});

// sequelize.sync({ alter: true });

module.exports = Slot;

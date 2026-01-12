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
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

// sequelize.sync({ alter: true });

module.exports = Slot;

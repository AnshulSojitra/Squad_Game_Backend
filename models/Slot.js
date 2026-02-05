const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Slot = sequelize.define(
  "Slot",
  {
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
    groundId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "slots",
  },
);

// sequelize.sync({ alter: true });

module.exports = Slot;

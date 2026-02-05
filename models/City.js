const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const City = sequelize.define(
  "City",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    stateId: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
  },
  {
    tableName: "cities",
    freezeTableName: true,
    timestamps: true,
  },
);

module.exports = City;

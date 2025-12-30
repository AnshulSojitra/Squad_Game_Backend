const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Ground = sequelize.define(
  "Ground",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // ground name
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "name",
    },

    contactNo: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "contactNo",
    },

    pricePerSlot: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "pricePerSlot",
    },

    area: {
      type: DataTypes.STRING,
      field: "area",
    },

    country: {
      type: DataTypes.STRING,
      field: "country",
    },

    state: {
      type: DataTypes.STRING,
      field: "state",
    },

    city: {
      type: DataTypes.STRING,
      field: "city",
    },

    game: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "game",
    },

    openingTime: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "openingTime",
    },

    closingTime: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "closingTime",
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: "isActive",
    },

    cityId: {
      type: DataTypes.BIGINT,
      field: "cityId",
    },

    countryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    stateId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "Grounds",
    timestamps: true,
  }
);

module.exports = Ground;

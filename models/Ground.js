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
    locationUrl: {
      type: DataTypes.STRING,
      allowNull: true,
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
    advanceBookingDays: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 7,
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
    isBlocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "Grounds",
    timestamps: true,
  },
);

// sequelize.sync({ alter: true });

module.exports = Ground;

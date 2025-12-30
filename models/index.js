const sequelize = require("../config/db");

/* ================= IMPORT MODELS ================= */

const Admin = require("./Admin");
const User = require("./User");
const Ground = require("./Ground");
const Slot = require("./Slot");
const GroundImage = require("./GroundImage");
const Booking = require("./Booking");
const Country = require("./Country");
const State = require("./State");
const City = require("./City");

/* ================= RELATIONS ================= */

/**
 * Admin (Ground Owner) → Grounds
 * One admin can create many grounds
 */
Admin.hasMany(Ground, {
  foreignKey: {
    name: "adminId",
    allowNull: false,
  },
  onDelete: "CASCADE",
});
Ground.belongsTo(Admin, {
  foreignKey: "adminId",
});

/**
 * Ground → Slots
 * Admin explicitly creates slots for a ground
 */
Ground.hasMany(Slot, {
  foreignKey: {
    name: "groundId",
    as: "Slots",
    allowNull: false,
  },
  onDelete: "CASCADE",
});
Slot.belongsTo(Ground, {
  foreignKey: "groundId",
});

/**
 * Ground → Images
 * Multiple images per ground
 */
Ground.hasMany(GroundImage, {
  foreignKey: "groundId",
  as: "images",
  onDelete: "CASCADE",
});

GroundImage.belongsTo(Ground, {
  foreignKey: "groundId",
});

/**
 * User → Bookings
 * A user can make many bookings
 */
User.hasMany(Booking, {
  foreignKey: {
    name: "userId",
    allowNull: false,
  },
  onDelete: "CASCADE",
});
Booking.belongsTo(User, {
  foreignKey: "userId",
});

/**
 * Slot → Bookings
 * Each booking is for a specific slot
 */
Slot.hasMany(Booking, {
  foreignKey: {
    name: "slotId",
    allowNull: false,
  },
  onDelete: "CASCADE",
});
Booking.belongsTo(Slot, {
  foreignKey: "slotId",
});

/* LOCATION RELATIONS */

Country.hasMany(State, {
  foreignKey: { name: "countryId", allowNull: false },
});
State.belongsTo(Country, { as: "Country", foreignKey: "countryId" });

State.hasMany(City, {
  foreignKey: { name: "stateId", allowNull: false },
});
City.belongsTo(State, { as: "State", foreignKey: "stateId" });

City.hasMany(Ground, {
  foreignKey: { name: "cityId", allowNull: false },
});
Ground.belongsTo(City, { as: "City", foreignKey: "cityId" });

Ground.belongsTo(State, { as: "State", foreignKey: "stateId" });
Ground.belongsTo(Country, { as: "Country", foreignKey: "countryId" });

/* ================= EXPORT ================= */

module.exports = {
  sequelize,
  Admin,
  User,
  Ground,
  Slot,
  GroundImage,
  Booking,
  Country,
  State,
  City,
};

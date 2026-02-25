const sequelize = require("../config/db");

/*  IMPORT MODELS  */

const Admin = require("./Admin");
const User = require("./User");
const Ground = require("./Ground");
const Slot = require("./Slot");
const GroundImage = require("./GroundImage");
const Booking = require("./Booking");
const Country = require("./Country");
const State = require("./State");
const City = require("./City");
const Amenity = require("./Amenity");
const SuperAdmin = require("./SuperAdmin");
const Review = require("./Review");
const Game = require("./Game");
const GameTeam = require("./GameTeam");
const GameParticipant = require("./GameParticipant");
const GameSlot = require("./GameSlot");

/* RELATIONS  */

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

// User → Reviews
User.hasMany(Review, { foreignKey: "userId", onDelete: "CASCADE" });
Review.belongsTo(User, { foreignKey: "userId" });

// Ground → Reviews
Ground.hasMany(Review, { foreignKey: "groundId", onDelete: "CASCADE" });
Review.belongsTo(Ground, { foreignKey: "groundId" });

/**
 * Slot → Bookings
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

Ground.hasMany(Amenity, {
  foreignKey: "groundId",
  as: "amenities",
  onDelete: "CASCADE",
});

Amenity.belongsTo(Ground, {
  foreignKey: "groundId",
});

Booking.belongsTo(User, { foreignKey: "userId" });
Booking.belongsTo(Admin, { foreignKey: "adminId" });
Booking.belongsTo(City, { foreignKey: "cityId" });

// Ground → Bookings
Ground.hasMany(Booking, {
  foreignKey: "groundId",
  onDelete: "CASCADE",
});

Booking.belongsTo(Ground, {
  foreignKey: "groundId",
});

// Game relations
Game.belongsTo(User, { foreignKey: "createdBy" });
User.hasMany(Game, { foreignKey: "createdBy" });

Game.belongsTo(Ground, { foreignKey: "groundId" });
Ground.hasMany(Game, { foreignKey: "groundId" });

// Teams
Game.hasMany(GameTeam, { foreignKey: "gameId", onDelete: "CASCADE" });
GameTeam.belongsTo(Game, { foreignKey: "gameId" });

// Participants
Game.hasMany(GameParticipant, { foreignKey: "gameId", onDelete: "CASCADE" });
GameParticipant.belongsTo(Game, { foreignKey: "gameId" });

GameParticipant.belongsTo(User, { foreignKey: "userId" });
User.hasMany(GameParticipant, { foreignKey: "userId" });

GameParticipant.belongsTo(GameTeam, { foreignKey: "teamId" });
GameTeam.hasMany(GameParticipant, { foreignKey: "teamId" });

Game.hasMany(GameSlot, { foreignKey: "gameId", onDelete: "CASCADE" });
GameSlot.belongsTo(Game, { foreignKey: "gameId" });

Slot.hasMany(GameSlot, { foreignKey: "slotId", onDelete: "CASCADE" });
GameSlot.belongsTo(Slot, { foreignKey: "slotId" });

/* EXPORT  */

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
  Amenity,
  SuperAdmin,
  Review,
  Game,
  GameTeam,
  GameParticipant,
  GameSlot,
};

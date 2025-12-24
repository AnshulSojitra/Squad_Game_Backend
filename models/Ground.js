const mongoose = require("mongoose");

const groundSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    area: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Area",
      required: true,
    },

    games: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Game",
      },
    ],

    pricePerHour: {
      type: Number,
      required: true,
    },

    amenities: [String],

    location: {
      lat: Number,
      lng: Number,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ground", groundSchema);

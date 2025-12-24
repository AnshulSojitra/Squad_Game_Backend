const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
    },

    userPhone: {
      type: String,
      required: true,
    },

    bookingDate: {
      type: Date,
      required: true,
    },

    ground: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ground",
      required: true,
    },

    game: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Game",
      required: true,
    },

    slot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Slot",
      required: true,
    },

    status: {
      type: String,
      enum: ["confirmed", "cancelled"],
      default: "confirmed",
    },
  },
  { timestamps: true }
);

/**
 * Prevent double booking:
 * same ground + game + slot + date
 */
bookingSchema.index(
  { ground: 1, game: 1, slot: 1, bookingDate: 1 },
  { unique: true }
);

module.exports = mongoose.model("Booking", bookingSchema);

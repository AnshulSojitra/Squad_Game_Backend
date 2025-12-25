const mongoose = require("mongoose");

const groundSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    contactNo: {
      type: String,
      required: true,
    },

    timing: {
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
    },

    pricePerHour: {
      type: Number,
      required: true,
    },

    games: [
      {
        type: String,
        enum: ["Cricket", "Badminton", "Football", "Basketball"],
        required: true,
      },
    ],

    image: {
      type: String, // Cloudinary URL
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ground", groundSchema);

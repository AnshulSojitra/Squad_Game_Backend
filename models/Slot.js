const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema(
  {
    startTime: {
      type: String, // e.g. "06:00"
      required: true,
    },
    endTime: {
      type: String, // e.g. "07:00"
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Slot", slotSchema);

const mongoose = require("mongoose");

const areaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    city: {
      type: String,
      default: "Ahmedabad",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Area", areaSchema);

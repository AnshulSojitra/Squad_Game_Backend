const { Booking, Slot, Ground, sequelize } = require("../models");
const { Op } = require("sequelize");

/**
 * CREATE BOOKING
 * POST /api/bookings
 */
exports.createBooking = async (req, res) => {
  const { slotId, date } = req.body;
  const userId = req.user.id;

  if (!slotId || !date) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    await sequelize.transaction(async (t) => {
      // Check if slot exists
      const slot = await Slot.findByPk(slotId, {
        include: {
          model: Ground,
          attributes: ["id", "name", "area", "pricePerSlot"],
        },
      });

      if (!slot) {
        return res.status(404).json({ message: "Slot not found" });
      }

      // Check if already booked for that date
      const alreadyBooked = await Booking.findOne({
        where: {
          slotId,
          date,
          status: "confirmed",
        },
        transaction: t,
      });

      if (alreadyBooked) {
        throw new Error("Slot already booked");
      }

      //  Create booking
      const booking = await Booking.create({
        userId: req.user.id,
        slotId,
        date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        totalPrice: slot.Ground.pricePerSlot, // ✅ FIX
      });
    });

    res.status(201).json({
      message: "Booking confirmed",
    });
  } catch (error) {
    console.error("CREATE BOOKING ERROR:", error.message);
    res.status(400).json({ message: error.message });
  }
};

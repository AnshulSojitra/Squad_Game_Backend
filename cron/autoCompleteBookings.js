const cron = require("node-cron");
const { Op } = require("sequelize");
const { Booking, Slot } = require("../models");
const moment = require("moment");

const autoCompleteBookings = () => {
  // Runs every 10 seconds
  cron.schedule("*/10 * * * * *", async () => {
    try {
      const now = moment();

      const bookings = await Booking.findAll({
        where: {
          status: "confirmed",
          date: {
            [Op.lte]: now.format("YYYY-MM-DD"),
          },
        },
        include: [
          {
            model: Slot,
            attributes: ["endTime"],
          },
        ],
      });

      for (const booking of bookings) {
        const bookingEnd = moment(
          `${booking.date} ${booking.Slot.endTime}`,
          "YYYY-MM-DD HH:mm:ss"
        );

        if (now.isAfter(bookingEnd)) {
          booking.status = "completed";
          await booking.save();
        }
      }

      // if (bookings.length > 0) {
      //   console.log(`✅ Auto-completed ${bookings.length} bookings`);
      // }
    } catch (error) {
      console.error("❌ Auto-complete cron error:", error.message);
    }
  });
};

module.exports = autoCompleteBookings;

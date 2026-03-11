const cron = require("node-cron");
const { Op } = require("sequelize");
const { Booking } = require("../models");
const moment = require("moment");

const autoCompleteBookings = () => {
  // Runs every 10 seconds
  cron.schedule("*/60 * * * * *", async () => {
    try {
      const now = moment();

      const bookings = await Booking.findAll({
        where: {
          status: "confirmed",
          date: {
            [Op.lte]: now.format("YYYY-MM-DD"),
          },
        },
        attributes: ["id", "date", "slotEndTime"],
      });

      for (const booking of bookings) {
        // Safety guard
        if (!booking.date || !booking.slotEndTime) {
          console.warn(`⚠️ Booking ${booking.id} missing date or slotEndTime`);
          continue;
        }

        const bookingEnd = moment(
          `${booking.date} ${booking.slotEndTime}`,
          "YYYY-MM-DD HH:mm:ss",
        );

        if (now.isAfter(bookingEnd)) {
          await booking.update({ status: "completed" });
        }
      }
    } catch (error) {
      console.error("❌ Auto-complete cron error:", error);
    }
  });
};

module.exports = autoCompleteBookings;

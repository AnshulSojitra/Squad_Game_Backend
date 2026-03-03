const { Booking, Slot, Ground, User, City, sequelize } = require("../models");
const { Op } = require("sequelize");
const { sendEmail } = require("../utils/email");
const cancelTemplate = require("../utils/templates/bookingCancellation");
const { to12Hour, formatDateToDDMMYYYY } = require("../utils/time");

exports.cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;

    if (!bookingId) {
      return res.status(400).json({
        message: "bookingId is required",
      });
    }

    // Fetch booking owned by user
    const booking = await Booking.findOne({
      where: {
        id: bookingId,
        userId: req.user.id,
        status: "confirmed",
      },
    });

    const { GameSlot, Game } = require("../models");

    // Find if this slot belongs to any game
    const gameSlot = await GameSlot.findOne({
      where: { slotId: booking.slotId },
    });

    if (gameSlot) {
      const gameId = gameSlot.gameId;

      // Remove slot from game
      await gameSlot.destroy();

      // Check if game still has slots
      const remainingSlots = await GameSlot.count({
        where: { gameId },
      });

      if (remainingSlots === 0) {
        await Game.destroy({ where: { id: gameId } });
      }
    }

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found or already cancelled",
      });
    }

    //  Cancel booking
    booking.status = "cancelled";
    await booking.save();

    //  Fetch user safely
    const user = await User.findByPk(booking.userId, {
      attributes: ["name", "email"],
    });

    //  SEND CANCELLATION EMAIL
    if (user?.email) {
      try {
        const slotTime = `${booking.slotStartTime} - ${booking.slotEndTime}`;

        await sendEmail({
          to: user.email,
          subject: "Your Booking Has Been Cancelled ❌",
          html: cancelTemplate({
            userName: user.name,
            groundName: booking.groundName,
            date: booking.date,
            slots: [slotTime],
            price: booking.totalPrice,
          }),
        });
      } catch (emailError) {
        console.error("❌ CANCELLATION EMAIL FAILED:", emailError.message);
      }
    }

    res.json({
      message: "Booking cancelled successfully",
      bookingId: booking.id,
    });
  } catch (error) {
    console.error("❌ Cancel booking error:", error);
    res.status(500).json({
      message: "Failed to cancel booking",
    });
  }
};

exports.cancelMultipleBookings = async (req, res) => {
  console.log("❌ CANCEL CONTROLLER HIT");

  const { bookingIds } = req.body;

  if (!Array.isArray(bookingIds) || bookingIds.length === 0) {
    return res.status(400).json({
      message: "bookingIds array is required",
    });
  }

  try {
    const result = await Booking.update(
      { status: "CANCELLED" },
      {
        where: {
          id: { [Op.in]: bookingIds },
          userId: req.user.id,
          status: "CONFIRMED",
        },
      },
    );

    if (result[0] === 0) {
      return res.status(404).json({
        message: "No bookings found to cancel",
      });
    }

    res.json({
      message: "Bookings cancelled successfully",
    });
  } catch (error) {
    console.error("CANCEL MULTIPLE BOOKINGS ERROR:", error);
    res.status(500).json({
      message: "Failed to cancel bookings",
    });
  }
};

exports.getAdminBookings = async (req, res) => {
  try {
    const adminId = req.admin.id;

    const bookings = await Booking.findAll({
      where: { adminId },
      order: [["createdAt", "DESC"]],
      attributes: [
        "id",
        "groundName",
        "date",
        "slotStartTime",
        "slotEndTime",
        "pricePerSlotAtBooking",
        "status",
        "createdAt",
        "cityId",
        "userId",
      ],
      include: [
        {
          model: User,
          required: false,
          attributes: ["id", "name", "email", "phoneNumber"],
        },
        {
          model: City,
          required: false,
          attributes: ["id", "name"],
        },
      ],
    });

    const formatted = bookings.map((b) => ({
      bookingId: b.id,
      bookingDate: b.date,
      status: b.status,
      createdAt: b.createdAt,

      user: b.User
        ? {
            id: b.User.id,
            name: b.User.name,
            email: b.User.email,
            phoneNumber: b.User.phoneNumber,
          }
        : null,

      ground: {
        name: b.groundName,
      },

      slot: {
        startTime: to12Hour(b.slotStartTime),
        endTime: to12Hour(b.slotEndTime),
      },

      city: b.City ? b.City.name : null,

      price: b.pricePerSlotAtBooking,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("GET ADMIN BOOKINGS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;

    //  Calculate date 10 days ago
    const now = new Date();
    const past15Days = new Date();
    past15Days.setDate(now.getDate() - 10);

    const todayDate =
      now.getFullYear() +
      "-" +
      String(now.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(now.getDate()).padStart(2, "0");

    const past15Date =
      past15Days.getFullYear() +
      "-" +
      String(past15Days.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(past15Days.getDate()).padStart(2, "0");

    const bookings = await Booking.findAll({
      where: {
        userId,
        [Op.or]: [
          // Non-completed bookings
          {
            status: {
              [Op.ne]: "completed",
            },
          },
          // Completed bookings → only last 10 days
          {
            status: "completed",
            date: {
              [Op.between]: [past15Date, todayDate],
            },
          },
        ],
      },
      attributes: [
        "id",
        "groundId",
        "groundName",
        "area",
        "city",
        "state",
        "country",
        "date",
        "slotStartTime",
        "slotEndTime",
        "pricePerSlotAtBooking",
        "totalPrice",
        "status",
        "createdAt",
      ],
      order: [
        ["status", "ASC"],
        ["date", "ASC"],
        ["slotStartTime", "ASC"],
      ],
    });

    const formatted = bookings.map((b) => ({
      bookingId: b.id,
      date: formatDateToDDMMYYYY(b.date),
      status: b.status,

      slot: {
        startTime: to12Hour(b.slotStartTime),
        endTime: to12Hour(b.slotEndTime),
      },

      totalPrice: b.totalPrice,

      ground: {
        id: b.groundId,
        name: b.groundName,
        area: b.area,
        city: b.city,
        state: b.state,
        country: b.country,
      },

      createdAt: b.createdAt,
    }));

    res.json({
      success: true,
      totalBookings: formatted.length,
      data: formatted,
    });
  } catch (error) {
    console.error("GET USER BOOKINGS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
    });
  }
};

exports.getMyBookingById = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user.id;

    const booking = await Booking.findOne({
      where: {
        id: bookingId,
        userId,
      },
      attributes: { exclude: ["createdAt"] },
      include: [
        {
          model: Slot,
          attributes: ["id", "startTime", "endTime"],
          include: [
            {
              model: Ground,
              attributes: ["id", "name", "area"],
            },
          ],
        },
      ],
    });

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    res.json({
      success: true,
      data: {
        bookingId: booking.id,
        date: booking.date,
        status: booking.status,
        startTime: booking.startTime,
        endTime: booking.endTime,
        totalPrice: booking.totalPrice,
        ground: {
          id: booking.Slot?.Ground?.id,
          name: booking.Slot?.Ground?.name,
          area: booking.Slot?.Ground?.area,
        },
        slot: {
          id: booking.Slot?.id,
          startTime: booking.Slot?.startTime,
          endTime: booking.Slot?.endTime,
        },
        createdAt: booking.createdAt,
      },
    });
  } catch (error) {
    console.error("GET BOOKING BY ID ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch booking",
    });
  }
};

exports.getGroundAvailability = async (req, res) => {
  try {
    const { groundId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required",
      });
    }

    //  Get all active slots for this ground
    const slots = await Slot.findAll({
      where: {
        groundId,
      },
      attributes: ["id", "startTime", "endTime"],
      order: [["startTime", "ASC"]],
    });

    //  Get bookings for that date
    const bookings = await Booking.findAll({
      where: {
        date,
        status: "confirmed",
        slotId: {
          [Op.in]: slots.map((s) => s.id),
        },
      },
      attributes: ["slotId"],
    });

    const bookedSlotIds = new Set(bookings.map((b) => b.slotId));

    //  Build availability response
    const availability = slots.map((slot) => ({
      id: slot.id,
      startTime: slot.startTime,
      endTime: slot.endTime,
      isBooked: bookedSlotIds.has(slot.id),
    }));

    res.json({
      success: true,
      date,
      slots: availability,
    });
  } catch (error) {
    console.error("GET AVAILABILITY ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch availability",
    });
  }
};

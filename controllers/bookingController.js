const {
  Booking,
  Slot,
  Ground,
  User,
  Country,
  State,
  City,
  sequelize,
} = require("../models");
const { Op } = require("sequelize");
const { sendEmail } = require("../utils/email");
const bookingTemplate = require("../utils/templates/bookingConfirmation");
const cancelTemplate = require("../utils/templates/bookingCancellation");

/*** CREATE BOOKING*/

exports.createBooking = async (req, res) => {
  const { slotIds, date } = req.body;

  if (!Array.isArray(slotIds) || slotIds.length === 0 || !date) {
    return res.status(400).json({
      message: "slotIds (array) and date are required",
    });
  }

  try {
    let slots;

    await sequelize.transaction(async (t) => {
      slots = await Slot.findAll({
        where: {
          id: { [Op.in]: slotIds },
        },
        include: {
          model: Ground,
          attributes: [
            "name",
            "pricePerSlot",
            "isBlocked",
            "advanceBookingDays",
          ],
        },
        transaction: t,
      });

      if (slots.length !== slotIds.length) {
        throw new Error("One or more slots are invalid");
      }

      if (slots.some((slot) => slot.Ground.isBlocked)) {
        throw new Error("This ground is currently blocked");
      }

      // All slots belong to the same ground
      const ground = slots[0].Ground;

      // Normalize dates (very important)
      const bookingDate = new Date(date);
      const today = new Date();

      bookingDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      if (
        ground.advanceBookingDays !== null &&
        ground.advanceBookingDays !== undefined
      ) {
        const maxAllowedDate = new Date(today);
        maxAllowedDate.setDate(today.getDate() + ground.advanceBookingDays);

        if (bookingDate > maxAllowedDate) {
          throw new Error(
            `You can book this ground only up to ${ground.advanceBookingDays} days in advance`,
          );
        }
      }

      const alreadyBooked = await Booking.findAll({
        where: {
          slotId: { [Op.in]: slotIds },
          date,
          status: "confirmed",
        },
        transaction: t,
      });

      if (alreadyBooked.length > 0) {
        throw new Error("One or more slots are already booked");
      }

      const bookingsData = slots.map((slot) => ({
        userId: req.user.id,
        slotId: slot.id,
        date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        totalPrice: slot.Ground.pricePerSlot,
        status: "confirmed",
      }));

      await Booking.bulkCreate(bookingsData, { transaction: t });
    });

    // SEND CONFIRMATION EMAIL

    try {
      const user = await User.findByPk(req.user.id);

      slots.sort((a, b) => a.startTime.localeCompare(b.startTime));

      const slotTimes = slots.map(
        (slot) => `${slot.startTime} - ${slot.endTime}`,
      );

      const totalPrice = slots.reduce(
        (sum, slot) => sum + slot.Ground.pricePerSlot,
        0,
      );

      await sendEmail({
        to: user.email,
        subject: "Your Booking is Confirmed 🎉",
        html: bookingTemplate({
          userName: user.name,
          groundName: slots[0].Ground.name,
          date,
          startTime: slots[0].startTime,
          endTime: slots[slots.length - 1].endTime,
          slots: slotTimes,
          price: totalPrice,
        }),
      });
    } catch (emailError) {
      console.error("BOOKING EMAIL FAILED:", emailError.message);
    }

    res.status(201).json({
      message: "Booking confirmed",
    });
  } catch (error) {
    console.error("CREATE BOOKING ERROR:", error.message);
    res.status(400).json({ message: error.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;

    if (!bookingId) {
      return res.status(400).json({
        message: "bookingId is required",
      });
    }

    const booking = await Booking.findOne({
      where: {
        id: bookingId,
        status: "confirmed",
        userId: req.user.id,
      },
      include: [
        {
          model: Slot,
          include: [{ model: Ground }],
        },
        {
          model: User,
        },
      ],
    });

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found or already cancelled",
      });
    }

    // cancel booking
    booking.status = "cancelled";
    await booking.save();

    // SEND CANCELLATION EMAIL
    try {
      const slotTime = `${booking.Slot.startTime} - ${booking.Slot.endTime}`;

      await sendEmail({
        to: booking.User.email,
        subject: "Your Booking Has Been Cancelled ❌",
        html: cancelTemplate({
          userName: booking.User.name,
          groundName: booking.Slot.Ground.name,
          date: booking.date,
          slots: [slotTime],
        }),
      });
    } catch (emailError) {
      console.error("CANCELLATION EMAIL FAILED:", emailError.message);
    }

    res.json({ message: "Booking cancelled successfully" });
  } catch (error) {
    console.error("Cancel booking error:", error);
    res.status(500).json({ message: "Failed to cancel booking" });
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
      where: {
        "$Slot.Ground.adminId$": adminId,
      },
      include: [
        {
          model: User,
          required: false,
          attributes: ["id", "name", "email", "phoneNumber"],
        },
        {
          model: Slot,
          required: true,
          attributes: ["id", "startTime", "endTime"],
          include: {
            model: Ground,
            required: true,
            where: { adminId },
            attributes: ["id", "name"],
          },
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const formatted = bookings.map((b) => ({
      bookingId: b.id,
      bookingDate: b.date,
      status: b.status,

      user: b.User
        ? {
            id: b.User.id,
            name: b.User.name,
            email: b.User.email,
            phoneNumber: b.User.phoneNumber,
          }
        : null,

      ground: b.Slot?.Ground
        ? {
            id: b.Slot.Ground.id,
            name: b.Slot.Ground.name,
          }
        : null,

      slot: b.Slot
        ? {
            id: b.Slot.id,
            startTime: b.Slot.startTime,
            endTime: b.Slot.endTime,
          }
        : null,

      createdAt: b.createdAt,
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

    const bookings = await Booking.findAll({
      where: {
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
              include: [
                {
                  model: Country,
                  as: "Country",
                  attributes: ["id", "name"],
                },
                {
                  model: State,
                  as: "State",
                  attributes: ["id", "name"],
                },
                {
                  model: City,
                  as: "City",
                  attributes: ["id", "name"],
                },
              ],
            },
          ],
        },
      ],
      order: [["status"], ["date", "ASC"], ["startTime", "ASC"]],
    });

    const formatted = bookings.map((b) => ({
      bookingId: b.id,
      date: b.date,
      status: b.status,
      startTime: b.startTime,
      endTime: b.endTime,
      totalPrice: b.totalPrice,

      ground: {
        id: b.Slot?.Ground?.id,
        name: b.Slot?.Ground?.name,
        area: b.Slot?.Ground?.area,
        game: b.Slot?.Ground?.game,
        country: b.Slot?.Ground?.Country?.name,
        state: b.Slot?.Ground?.State?.name,
        city: b.Slot?.Ground?.City?.name,
      },

      slot: {
        id: b.Slot?.id,
        startTime: b.Slot?.startTime,
        endTime: b.Slot?.endTime,
      },

      createdAt: b.createdAt,
    }));

    res.json({
      success: true,
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
        status: "CONFIRMED",
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

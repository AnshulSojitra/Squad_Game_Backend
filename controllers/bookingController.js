const { Booking, Slot, Ground, User, sequelize } = require("../models");
const { Op } = require("sequelize");

/**
 * CREATE BOOKING
 * POST /api/bookings
 */
// exports.createBooking = async (req, res) => {
//   const { slotId, date } = req.body;

//   if (!slotId || !date) {
//     return res.status(400).json({ message: "Missing required fields" });
//   }

//   try {
//     await sequelize.transaction(async (t) => {
//       // Check if slot exists
//       const slot = await Slot.findByPk(slotId, {
//         include: {
//           model: Ground,
//           attributes: ["id", "name", "area", "pricePerSlot"],
//         },
//         transaction: t,
//       });

//       if (!slot) {
//         return res.status(404).json({ message: "Slot not found" });
//       }

//       // Check if already booked for that date
//       const alreadyBooked = await Booking.findOne({
//         where: {
//           slotId,
//           date,
//           status: "CONFIRMED",
//         },
//         transaction: t,
//       });

//       if (alreadyBooked) {
//         throw new Error("Slot already booked");
//       }

//       //  Create booking
//       const booking = await Booking.create(
//         {
//           userId: req.user.id,
//           slotId,
//           date,
//           startTime: slot.startTime,
//           endTime: slot.endTime,
//           totalPrice: slot.Ground.pricePerSlot,
//         },
//         { transaction: t }
//       );
//     });

//     res.status(201).json({
//       message: "Booking confirmed",
//     });
//   } catch (error) {
//     console.error("CREATE BOOKING ERROR:", error.message);
//     res.status(400).json({ message: error.message });
//   }
// };

exports.createBooking = async (req, res) => {
  const { slotIds, date } = req.body;

  if (!Array.isArray(slotIds) || slotIds.length === 0 || !date) {
    return res.status(400).json({
      message: "slotIds (array) and date are required",
    });
  }

  try {
    await sequelize.transaction(async (t) => {
      const slots = await Slot.findAll({
        where: {
          id: { [Op.in]: slotIds },
          isActive: true,
        },
        include: {
          model: Ground,
          attributes: ["pricePerSlot"],
        },
        transaction: t,
      });

      if (slots.length !== slotIds.length) {
        throw new Error("One or more slots are invalid");
      }

      const alreadyBooked = await Booking.findAll({
        where: {
          slotId: { [Op.in]: slotIds },
          date,
          status: "CONFIRMED",
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
        status: "CONFIRMED",
      }));

      await Booking.bulkCreate(bookingsData, { transaction: t });
    });

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
    const userId = req.user.id;

    const booking = await Booking.findOne({
      where: {
        id: bookingId,
        userId,
      },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.status === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "Booking already cancelled",
      });
    }

    booking.status = "CANCELLED";
    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: booking,
    });
  } catch (error) {
    console.error("CANCEL BOOKING ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

exports.cancelMultipleBookings = async (req, res) => {
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
      }
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
          attributes: ["id", "name", "email"],
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

    // const formatted = bookings.map((b) => ({
    //   bookingId: b.id,
    //   bookingDate: b.date,
    //   status: b.status,

    //   user: {
    //     id: b.User.id,
    //     name: b.User.name,
    //     email: b.User.email,
    //   },

    //   ground: {
    //     id: b.Slot.Ground.id,
    //     name: b.Slot.Ground.name,
    //   },

    //   slot: {
    //     id: b.Slot.id,
    //     startTime: b.Slot.startTime,
    //     endTime: b.Slot.endTime,
    //   },

    //   createdAt: b.createdAt,
    // }));

    const formatted = bookings.map((b) => ({
      bookingId: b.id,
      bookingDate: b.date,
      status: b.status,

      user: b.User
        ? {
            id: b.User.id,
            name: b.User.name,
            email: b.User.email,
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
      order: [
        ["date", "DESC"],
        ["startTime", "ASC"],
      ],
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
        isActive: true,
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

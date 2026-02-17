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
const cancelTemplate = require("../utils/templates/bookingCancellation");
const { to12Hour } = require("../utils/time");
const bookingConfirmation = require("../utils/templates/bookingConfirmation");

/*** CREATE BOOKING*/

exports.createBooking = async (req, res) => {
  const { slotIds, date } = req.body;

  if (!Array.isArray(slotIds) || slotIds.length === 0 || !date) {
    return res.status(400).json({
      message: "slotIds (array) and date are required",
    });
  }

  try {
    let slots = [];

    await sequelize.transaction(async (t) => {
      // FETCH SLOTS + FULL GROUND DATA
      slots = await Slot.findAll({
        where: {
          id: { [Op.in]: slotIds },
        },
        include: [
          {
            model: Ground,
            required: true,
            attributes: [
              "id",
              "name",
              "adminId",
              "area",
              "cityId",
              "pricePerSlot",
              "isBlocked",
              "advanceBookingDays",
            ],
            include: [
              { model: City, as: "City", attributes: ["name"] },
              { model: State, as: "State", attributes: ["name"] },
              { model: Country, as: "Country", attributes: ["name"] },
            ],
          },
        ],
        transaction: t,
      });

      //  VALIDATE SLOT IDS
      if (slots.length !== slotIds.length) {
        throw new Error("One or more slots are invalid or removed");
      }

      // CHECK BLOCKED GROUND
      if (slots.some((s) => s.Ground.isBlocked)) {
        throw new Error("This ground is currently blocked");
      }

      //  ENSURE ALL SLOTS BELONG TO SAME GROUND
      const groundId = slots[0].Ground.id;
      if (slots.some((s) => s.Ground.id !== groundId)) {
        throw new Error("All slots must belong to the same ground");
      }

      const ground = slots[0].Ground;

      //  DATE VALIDATION
      const bookingDate = new Date(date);
      const today = new Date();

      bookingDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      // Normalize dates

      // PAST DATE VALIDATION
      if (bookingDate < today) {
        throw new Error("You cannot book a slot for a past date");
      }

      if (ground.advanceBookingDays !== null) {
        const maxAllowedDate = new Date(today);
        maxAllowedDate.setDate(today.getDate() + ground.advanceBookingDays);

        if (bookingDate > maxAllowedDate) {
          throw new Error(
            `You can book this ground only up to ${ground.advanceBookingDays} days in advance`,
          );
        }
      }

      //  CHECK ALREADY BOOKED SLOTS
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

      //  CREATE BOOKING SNAPSHOTS
      const bookingsData = slots.map((slot) => ({
        // RELATIONS
        userId: req.user.id,
        slotId: slot.id,
        groundId: ground.id,
        adminId: ground.adminId,
        cityId: ground.cityId,

        // SNAPSHOT (IMMUTABLE)
        groundName: ground.name,
        area: ground.area,
        city: ground.City?.name || null,
        state: ground.State?.name || null,
        country: ground.Country?.name || null,

        slotStartTime: slot.startTime,
        slotEndTime: slot.endTime,

        pricePerSlotAtBooking: ground.pricePerSlot,
        totalPrice: ground.pricePerSlot,

        date,
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
        html: bookingConfirmation({
          userName: user.name,
          groundName: slots[0].Ground.name,
          date,
          startTime: slots[0].startTime,
          endTime: slots[slots.length - 1].endTime,
          price: totalPrice,
          slots: slotTimes,
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

    // Fetch booking owned by user
    const booking = await Booking.findOne({
      where: {
        id: bookingId,
        userId: req.user.id,
        status: "confirmed",
      },
    });

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

    const bookings = await Booking.findAll({
      where: { userId },
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
      date: b.date,
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

const razorpay = require("../utils/razorpay");
const {
  sequelize,
  Slot,
  Booking,
  Ground,
  City,
  State,
  Country,
  User,
} = require("../models");
const { Op } = require("sequelize");
const crypto = require("crypto");
const { sendEmail } = require("../utils/email");
const bookingConfirmation = require("../utils/templates/bookingConfirmation");

exports.createRazorpayOrder = async (req, res) => {
  try {
    const { slotIds, date } = req.body;

    if (!Array.isArray(slotIds) || slotIds.length === 0) {
      return res.status(400).json({
        message: "slotIds (array) are required",
      });
    }

    if (!date) {
      return res.status(400).json({
        message: "booking date is required",
      });
    }

    // Normalize date
    const bookingDate = new Date(date);
    const today = new Date();

    bookingDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    // past date booking
    if (bookingDate < today) {
      return res.status(400).json({
        message: "You cannot book slots for a past date",
      });
    }

    // Fetch slots + ground
    const slots = await Slot.findAll({
      where: {
        id: { [Op.in]: slotIds },
      },
      include: {
        model: Ground,
        required: true,
        attributes: ["id", "pricePerSlot", "isBlocked", "advanceBookingDays"],
      },
    });

    if (slots.length !== slotIds.length) {
      return res.status(400).json({
        message: "One or more slots are invalid or removed",
      });
    }

    // Blocked ground check
    if (slots.some((s) => s.Ground.isBlocked)) {
      return res.status(400).json({
        message: "This ground is currently blocked",
      });
    }

    const ground = slots[0].Ground;

    // Advance booking validation
    if (ground.advanceBookingDays !== null) {
      const maxDate = new Date(today);
      maxDate.setDate(today.getDate() + ground.advanceBookingDays);

      if (bookingDate > maxDate) {
        return res.status(400).json({
          message: `You can book only up to ${ground.advanceBookingDays} days in advance`,
        });
      }
    }

    // Check already booked slots
    const existingBookings = await Booking.findAll({
      where: {
        slotId: { [Op.in]: slotIds },
        date: bookingDate,
        status: "confirmed",
      },
      attributes: ["slotId"],
    });

    if (existingBookings.length > 0) {
      return res.status(400).json({
        message: "One or more slots are already booked",
      });
    }

    // Calculate total price
    const totalAmount = slots.reduce(
      (sum, slot) => sum + slot.Ground.pricePerSlot,
      0,
    );

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: totalAmount * 100, // paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: {
        userId: req.user.id,
        groundId: ground.id,
        date: req.body.date,
        slots: slotIds.join(","),
      },
    });

    res.status(200).json({
      orderId: order.id,
      amount: totalAmount,
      currency: "INR",
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("CREATE RAZORPAY ORDER ERROR:", error);
    res.status(500).json({
      message: "Payment initialization failed",
    });
  }
};

exports.verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        message: "Invalid payment data",
      });
    }

    /* SIGNATURE VERIFICATION */

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        message: "Payment verification failed",
      });
    }

    /* PREVENT DUPLICATE PAYMENT */

    const existingPayment = await Booking.findOne({
      where: { razorpayPaymentId: razorpay_payment_id },
    });

    if (existingPayment) {
      return res.status(400).json({
        message: "Payment already processed",
      });
    }

    /* FETCH ORDER FROM RAZORPAY */

    const order = await razorpay.orders.fetch(razorpay_order_id);

    if (!order || !order.notes) {
      return res.status(400).json({
        message: "Invalid Razorpay order",
      });
    }

    // TRUST ONLY ORDER NOTES
    const slotIds = order.notes.slots.split(",").map((id) => Number(id));

    const bookingDate = order.notes.date; // "YYYY-MM-DD"

    /* CREATE BOOKING */

    await sequelize.transaction(async (t) => {
      // Fetch slots with ground
      const slots = await Slot.findAll({
        where: {
          id: slotIds,
        },
        include: [
          {
            model: Ground,
            required: true,
            attributes: [
              "id",
              "name",
              "adminId",
              "pricePerSlot",
              "isBlocked",
              "advanceBookingDays",
              "cityId",
              "city",
              "state",
              "country",
              "area",
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

      if (slots.length !== slotIds.length) {
        throw new Error("Invalid slots");
      }

      if (slots.some((s) => s.Ground.isBlocked)) {
        throw new Error("Ground is blocked");
      }

      // Check already booked
      const alreadyBooked = await Booking.findAll({
        where: {
          slotId: slotIds,
          date: bookingDate,
          status: "confirmed",
        },
        transaction: t,
      });

      if (alreadyBooked.length > 0) {
        throw new Error("One or more slots already booked");
      }

      // Create booking snapshots
      const bookingsData = slots.map((slot) => ({
        userId: req.user.id,
        cityId: slot.Ground.cityId,
        area: slot.Ground.area,
        city: slot.Ground.City?.name || null,
        state: slot.Ground.State?.name || null,
        country: slot.Ground.Country?.name || null,

        slotId: slot.id,
        groundId: slot.Ground.id,
        adminId: slot.Ground.adminId,

        groundName: slot.Ground.name,
        pricePerSlotAtBooking: slot.Ground.pricePerSlot,

        slotStartTime: slot.startTime,
        slotEndTime: slot.endTime,

        date: bookingDate,
        totalPrice: slot.Ground.pricePerSlot,
        status: "confirmed",

        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        paymentStatus: "paid",
      }));

      await Booking.bulkCreate(bookingsData, { transaction: t });
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
            date: bookingDate,
            startTime: slots[0].startTime,
            endTime: slots[slots.length - 1].endTime,
            price: totalPrice,
            slots: slotTimes,
          }),
        });
      } catch (emailError) {
        console.error("BOOKING EMAIL FAILED:", emailError.message);
      }
    });

    res.json({
      message: "Payment verified & booking confirmed",
    });
  } catch (error) {
    console.error("VERIFY PAYMENT ERROR:", error.message);
    res.status(500).json({
      message: error.message || "Payment verification failed",
    });
  }
};

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
  Game,
  GameTeam,
  GameParticipant,
  GameSlot,
} = require("../models");
const { Op } = require("sequelize");
const crypto = require("crypto");
const { sendEmail } = require("../utils/email");
const bookingConfirmation = require("../utils/templates/bookingConfirmation");
const generateInvoice = require("../utils/generateInvoice");
const fs = require("fs");
const path = require("path");

exports.createRazorpayOrder = async (req, res) => {
  try {
    const { slotIds, date, type } = req.body;

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

    // Past date booking validation
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
        attributes: [
          "id",
          "pricePerSlot",
          "isBlocked",
          "advanceBookingDays",
          "gstPercentage",
        ],
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

    // Check already booked slots (confirmed only)
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

    /*  GST CALCULATION  */

    let baseAmount = 0;
    let gstAmount = 0;

    const gstPercentage = Number(ground.gstPercentage || 0);

    slots.forEach((slot) => {
      const price = slot.Ground.pricePerSlot;
      baseAmount += price;

      if (gstPercentage > 0) {
        gstAmount += (price * gstPercentage) / 100;
      }
    });

    gstAmount = Math.round(gstAmount); // round to nearest rupee
    const totalAmount = baseAmount + gstAmount;

    /* CREATE RAZORPAY ORDER  */

    const order = await razorpay.orders.create({
      amount: totalAmount * 100, // paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: {
        type: type || "booking",
        userId: req.user.id,
        groundId: ground.id,
        date: req.body.date,
        slots: slotIds.join(","),
        sport: req.body.sport || null,
        totalTeams: req.body.totalTeams || null,
        playersPerTeam: req.body.playersPerTeam || null,
        pricePerPlayer: req.body.pricePerPlayer || null,
        baseAmount,
        gstAmount,
        gstPercentage,
      },
    });

    res.status(200).json({
      orderId: order.id,
      amount: totalAmount,
      currency: "INR",
      key: process.env.RAZORPAY_KEY_ID,

      baseAmount,
      gstAmount,
      gstPercentage,
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

    const type = order.notes.type || "booking";

    const slotIds = order.notes.slots.split(",").map((id) => Number(id));
    const bookingDate = order.notes.date;

    await sequelize.transaction(async (t) => {
      /* FETCH SLOTS */
      const slots = await Slot.findAll({
        where: { id: slotIds },
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
              "gstPercentage",
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

      /* CREATE BOOKING SNAPSHOTS */

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
        pricePerSlotAtBooking:
          slot.Ground.pricePerSlot +
          (slot.Ground.pricePerSlot * Number(slot.Ground.gstPercentage || 0)) /
            100,

        slotStartTime: slot.startTime,
        slotEndTime: slot.endTime,

        date: bookingDate,
        totalPrice:
          slot.Ground.pricePerSlot +
          (slot.Ground.pricePerSlot * Number(slot.Ground.gstPercentage || 0)) /
            100,

        status: "confirmed",
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        paymentStatus: "paid",
      }));

      await Booking.bulkCreate(bookingsData, { transaction: t });

      /* GAME CREATION BLOCK */

      if (type === "game") {
        const game = await Game.create(
          {
            name: order.notes.name,
            sport: order.notes.sport,
            groundId: order.notes.groundId,
            date: bookingDate,
            totalTeams: Number(order.notes.totalTeams),
            playersPerTeam: Number(order.notes.playersPerTeam),
            totalPlayers:
              Number(order.notes.totalTeams) *
              Number(order.notes.playersPerTeam),
            joinedPlayersCount: 1,
            pricePerPlayer: Number(order.notes.pricePerPlayer),
            status: "open",
            createdBy: req.user.id,
          },
          { transaction: t },
        );

        // Create GameSlots
        for (const id of slotIds) {
          await GameSlot.create(
            {
              gameId: game.id,
              slotId: id,
            },
            { transaction: t },
          );
        }

        // Create Teams
        const teams = [];

        for (let i = 1; i <= Number(order.notes.totalTeams); i++) {
          const team = await GameTeam.create(
            {
              gameId: game.id,
              teamNumber: i,
            },
            { transaction: t },
          );

          teams.push(team);
        }

        // Add Creator as Participant
        await GameParticipant.create(
          {
            gameId: game.id,
            userId: req.user.id,
            teamId: teams[0].id,
          },
          { transaction: t },
        );

        // After game created successfully
        try {
          const user = await User.findByPk(req.user.id);

          const slotTimes = slots.map((s) => `${s.startTime} - ${s.endTime}`);

          await sendEmail({
            to: user.email,
            subject: "Game Created Successfully 🎮",
            html: gameCreatedEmail({
              userName: user.name,
              sport,
              groundName: slots[0].Ground.name,
              date,
              slots: slotTimes,
              playersPerTeam,
              totalTeams,
            }),
          });
        } catch (emailError) {
          console.error("GAME CREATED EMAIL FAILED:", emailError.message);
        }
      }

      /* EMAIL */
      try {
        const user = await User.findByPk(req.user.id);

        slots.sort((a, b) => a.startTime.localeCompare(b.startTime));

        const slotDetails = slots.map((slot) => ({
          startTime: slot.startTime,
          endTime: slot.endTime,
        }));

        const slotTimes = slots.map(
          (slot) => `${slot.startTime} - ${slot.endTime}`,
        );

        const totalPrice = slots.reduce((sum, slot) => {
          const basePrice = Number(slot.Ground.pricePerSlot);
          const gstPercent = Number(slot.Ground.gstPercentage || 0);
          const gstAmount = gstPercent > 0 ? (basePrice * gstPercent) / 100 : 0;
          return sum + Math.round(basePrice + gstAmount);
        }, 0);

        if (!fs.existsSync(path.join(__dirname, "../invoices"))) {
          fs.mkdirSync(path.join(__dirname, "../invoices"));
        }

        const invoicePath = await generateInvoice({
          bookingId: Date.now(),
          user,
          groundName: slots[0].Ground.name,
          date: bookingDate,
          slots: slotDetails,
          pricePerSlot: slots[0].Ground.pricePerSlot,
          gstPercentage: slots[0].Ground.gstPercentage,
        });

        await sendEmail({
          to: user.email,
          subject:
            type === "game"
              ? "Your Game is Created 🎉"
              : "Your Booking is Confirmed 🎉",
          html: bookingConfirmation({
            userName: user.name,
            groundName: slots[0].Ground.name,
            date: bookingDate,
            startTime: slots[0].startTime,
            endTime: slots[slots.length - 1].endTime,
            price: totalPrice,
            slots: slotTimes,
          }),
          attachments: [
            {
              filename: "invoice.pdf",
              path: invoicePath,
            },
          ],
        });
      } catch (emailError) {
        console.error("BOOKING EMAIL FAILED:", emailError.message);
      }
    });

    res.json({
      message:
        type === "game"
          ? "Payment verified & game created"
          : "Payment verified & booking confirmed",
    });
  } catch (error) {
    console.error("VERIFY PAYMENT ERROR:", error.message);
    res.status(500).json({
      message: error.message || "Payment verification failed",
    });
  }
};

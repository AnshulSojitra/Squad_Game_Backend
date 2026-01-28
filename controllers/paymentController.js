const razorpay = require("../utils/razorpay");
const { Slot, Ground } = require("../models");
const { Op } = require("sequelize");

exports.createRazorpayOrder = async (req, res) => {
  try {
    console.log("HEADERS:", req.headers["content-type"]);
    console.log("BODY:", req.body);

    const slotIds = req.body && req.body.slotIds;

    if (!Array.isArray(slotIds) || slotIds.length === 0) {
      return res.status(400).json({
        message: "slotIds are required",
      });
    }
    if (!Array.isArray(slotIds) || slotIds.length === 0) {
      return res.status(400).json({ message: "slotIds are required" });
    }

    // Fetch slots with price
    const slots = await Slot.findAll({
      where: {
        id: { [Op.in]: slotIds },
      },
      include: {
        model: Ground,
        attributes: ["pricePerSlot", "isBlocked"],
      },
    });

    if (slots.length !== slotIds.length) {
      return res.status(400).json({ message: "Invalid slots selected" });
    }

    if (slots.some((s) => s.Ground.isBlocked)) {
      return res.status(400).json({ message: "Ground is blocked" });
    }

    // Calculate total amount
    const totalAmount = slots.reduce(
      (sum, slot) => sum + slot.Ground.pricePerSlot,
      0,
    );

    // Razorpay order
    const order = await razorpay.orders.create({
      amount: totalAmount * 100,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: {
        userId: req.user.id,
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
    console.error("Create Razorpay order error:", error);
    res.status(500).json({ message: "Payment initialization failed" });
  }
};

exports.verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      slotIds,
      date,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment data" });
    }

    //  Generate expected signature
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

    //  PAYMENT VERIFIED
    //  create booking now
    await createBookingAfterPayment({
      userId: req.user.id,
      slotIds,
      date,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    });

    res.json({
      message: "Payment verified & booking confirmed",
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({ message: "Payment verification failed" });
  }
};

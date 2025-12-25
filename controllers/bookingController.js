const { Booking, Ground } = require("../models");

exports.createBooking = async (req, res) => {
  try {
    const { groundId, date, startTime, endTime } = req.body;

    const ground = await Ground.findByPk(groundId);
    if (!ground) {
      return res.status(404).json({ message: "Ground not found" });
    }

    const booking = await Booking.create({
      date,
      startTime,
      endTime,
      GroundId: groundId,
      UserId: req.user.id,
    });

    res.status(201).json({
      message: "Booking created",
      booking,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { UserId: req.user.id },
      include: Ground,
    });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

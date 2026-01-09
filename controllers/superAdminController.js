const { User, Admin, Booking, Ground, Slot, SuperAdmin } = require("../models");

exports.getLoggedInSuperAdmin = async (req, res) => {
  try {
    const superAdmin = await SuperAdmin.findByPk(req.superAdmin.id, {
      attributes: ["id", "name", "email"],
    });

    if (!superAdmin) {
      return res.status(404).json({ message: "Super Admin not found" });
    }

    res.status(200).json(superAdmin);
  } catch (error) {
    console.error("Get super admin profile error:", error);
    res.status(500).json({ message: "Failed to fetch super admin profile" });
  }
};
//USER METHODS

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: {
        exclude: ["password"],
      },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: {
        exclude: ["password"],
      },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      user,
    });
  } catch (error) {
    console.error("Get user by id error:", error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
};

exports.toggleUserBlock = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.status(200).json({
      message: `User ${user.isBlocked ? "blocked" : "unblocked"} successfully`,
      user,
    });
  } catch (error) {
    console.error("Block/Unblock user error:", error);
    res.status(500).json({ message: "Failed to update user status" });
  }
};

//ADMIN METHODS

exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.findAll({
      attributes: {
        exclude: ["password"],
      },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      count: admins.length,
      admins,
    });
  } catch (error) {
    console.error("Get all admins error:", error);
    res.status(500).json({ message: "Failed to fetch admins" });
  }
};

exports.getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findByPk(req.params.id, {
      attributes: {
        exclude: ["password"],
      },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      admin,
    });
  } catch (error) {
    console.error("Get admin by id error:", error);
    res.status(500).json({ message: "Failed to fetch admin" });
  }
};

exports.toggleAdminBlock = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await Admin.findByPk(id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    admin.isBlocked = !admin.isBlocked;
    await admin.save();
    res.status(200).json({
      message: `Admin ${
        admin.isBlocked ? "blocked" : "unblocked"
      } successfully`,
      admin,
    });
  } catch (error) {
    console.error("Block/Unblock admin error:", error);
    res.status(500).json({ message: "Failed to update admin status" });
  }
};

// BOOKING METHODS

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          attributes: ["id", "name", "email"],
        },
        {
          model: Slot,
          attributes: ["id", "startTime", "endTime"],
          include: [
            {
              model: Ground,
              attributes: ["id", "name", "area", "country", "state", "city"],
              include: [
                {
                  model: Admin,
                  attributes: ["id", "name", "email"],
                },
              ],
            },
          ],
        },
      ],
    });

    res.status(200).json({
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get all bookings error:", error);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findByPk(id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Booking already cancelled" });
    }

    booking.status = "cancelled";
    await booking.save();

    res.status(200).json({
      message: "Booking cancelled successfully",
      bookingId: booking.id,
    });
  } catch (error) {
    console.error("Cancel booking error:", error);
    res.status(500).json({ message: "Failed to cancel booking" });
  }
};

exports.completeBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findByPk(id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({
        message: "Cancelled booking cannot be completed",
      });
    }

    if (booking.status === "completed") {
      return res.status(400).json({
        message: "Booking already completed",
      });
    }

    booking.status = "completed";
    await booking.save();

    res.status(200).json({
      message: "Booking marked as completed",
      bookingId: booking.id,
    });
  } catch (error) {
    console.error("Complete booking error:", error);
    res.status(500).json({ message: "Failed to complete booking" });
  }
};

//GROUND METHODS

exports.getAllGrounds = async (req, res) => {
  try {
    const grounds = await Ground.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Admin,
          attributes: ["id", "name", "email"],
        },
      ],
    });

    res.status(200).json({
      count: grounds.length,
      grounds,
    });
  } catch (error) {
    console.error("Get all grounds error:", error);
    res.status(500).json({ message: "Failed to fetch grounds" });
  }
};

exports.toggleGroundBlock = async (req, res) => {
  try {
    const { id } = req.params;

    const ground = await Ground.findByPk(id);

    if (!ground) {
      return res.status(404).json({ message: "Ground not found" });
    }

    ground.isBlocked = !ground.isBlocked;
    await ground.save();

    res.status(200).json({
      message: `Ground ${
        ground.isBlocked ? "blocked" : "unblocked"
      } successfully`,
      groundId: ground.id,
      isBlocked: ground.isBlocked,
    });
  } catch (error) {
    console.error("Toggle ground block error:", error);
    res.status(500).json({ message: "Failed to update ground status" });
  }
};

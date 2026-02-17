"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("bookings", "razorpayOrderId", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("bookings", "razorpayPaymentId", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("bookings", "paymentStatus", {
      type: Sequelize.ENUM("pending", "paid", "failed", "refunded"),
      allowNull: false,
      defaultValue: "pending",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("bookings", "razorpayOrderId");
    await queryInterface.removeColumn("bookings", "razorpayPaymentId");
    await queryInterface.removeColumn("bookings", "paymentStatus");

    // MySQL needs ENUM cleanup
    await queryInterface.sequelize.query(
      "DROP TYPE IF EXISTS enum_Bookings_paymentStatus;",
    );
  },
};

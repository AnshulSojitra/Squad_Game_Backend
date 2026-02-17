"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // -------------------------
    // ADMIN → GROUND
    // -------------------------
    await queryInterface.addConstraint("grounds", {
      fields: ["adminId"],
      type: "foreign key",
      name: "fk_ground_admin_cascades111",
      references: {
        table: "admins",
        field: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    // -------------------------
    // GROUND → SLOT
    // -------------------------
    await queryInterface.addConstraint("slots", {
      fields: ["groundId"],
      type: "foreign key",
      name: "fk_slot_ground_cascades111",
      references: {
        table: "grounds",
        field: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    // -------------------------
    // SLOT → BOOKING
    // -------------------------
    await queryInterface.addConstraint("bookings", {
      fields: ["slotId"],
      type: "foreign key",
      name: "fk_booking_slot_cascades111",
      references: {
        table: "slots",
        field: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    // -------------------------
    // USER → BOOKING
    // -------------------------
    await queryInterface.addConstraint("bookings", {
      fields: ["userId"],
      type: "foreign key",
      name: "fk_booking_user_cascades111",
      references: {
        table: "users",
        field: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    // -------------------------
    // ADMIN → BOOKING
    // -------------------------
    await queryInterface.addConstraint("bookings", {
      fields: ["adminId"],
      type: "foreign key",
      name: "fk_booking_admin_cascades111",
      references: {
        table: "admins",
        field: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    // -------------------------
    // GROUND → BOOKING
    // -------------------------
    await queryInterface.addConstraint("bookings", {
      fields: ["groundId"],
      type: "foreign key",
      name: "fk_booking_ground_cascades111",
      references: {
        table: "grounds",
        field: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    // -------------------------
    // USER → REVIEW
    // -------------------------
    await queryInterface.addConstraint("reviews", {
      fields: ["userId"],
      type: "foreign key",
      name: "fk_review_user_cascades111",
      references: {
        table: "users",
        field: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    // -------------------------
    // GROUND → REVIEW
    // -------------------------
    await queryInterface.addConstraint("reviews", {
      fields: ["groundId"],
      type: "foreign key",
      name: "fk_review_ground_cascades111",
      references: {
        table: "grounds",
        field: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    // -------------------------
    // GROUND → IMAGES
    // -------------------------
    await queryInterface.addConstraint("groundimages", {
      fields: ["groundId"],
      type: "foreign key",
      name: "fk_image_ground_cascades111",
      references: {
        table: "grounds",
        field: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    // -------------------------
    // GROUND → AMENITY
    // -------------------------
    await queryInterface.addConstraint("amenities", {
      fields: ["groundId"],
      type: "foreign key",
      name: "fk_amenity_ground_cascades111",
      references: {
        table: "grounds",
        field: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      "grounds",
      "fk_ground_admin_cascades111",
    );
    await queryInterface.removeConstraint(
      "slots",
      "fk_slot_ground_cascades111",
    );
    await queryInterface.removeConstraint(
      "bookings",
      "fk_booking_slot_cascades111",
    );
    await queryInterface.removeConstraint(
      "bookings",
      "fk_booking_user_cascades111",
    );
    await queryInterface.removeConstraint(
      "bookings",
      "fk_booking_admin_cascades111",
    );
    await queryInterface.removeConstraint(
      "bookings",
      "fk_booking_ground_cascades111",
    );
    await queryInterface.removeConstraint(
      "reviews",
      "fk_review_user_cascades111",
    );
    await queryInterface.removeConstraint(
      "reviews",
      "fk_review_ground_cascades111",
    );
    await queryInterface.removeConstraint(
      "groundimages",
      "fk_image_ground_cascades111",
    );
    await queryInterface.removeConstraint(
      "amenities",
      "fk_amenity_ground_cascades111",
    );
  },
};

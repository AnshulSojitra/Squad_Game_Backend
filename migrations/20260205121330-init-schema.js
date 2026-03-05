"use strict";

const { sequelize } = require("../models");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "super_admins",
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        email: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        password: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      },
      {
        tableName: "super_admins",
        timestamps: true,
      },
    );
    await queryInterface.createTable(
      "admins",
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        name: Sequelize.STRING,
        email: {
          type: Sequelize.STRING,
          unique: true,
        },
        password: Sequelize.STRING,
        phoneNumber: {
          type: Sequelize.STRING(15),
          allowNull: true,
        },

        role: {
          type: Sequelize.STRING,
          defaultValue: "admin",
        },
        isBlocked: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        resetPasswordOtp: {
          type: Sequelize.STRING,
        },
        resetPasswordOtpExpires: {
          type: Sequelize.DATE,
        },
        planType: {
          type: Sequelize.ENUM("subscription", "commission"),
          allowNull: false,
        },

        subscriptionStartDate: {
          type: Sequelize.DATE,
          allowNull: true,
        },

        subscriptionEndDate: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      },
      {
        tableName: "admins",
        timestamps: true,
      },
    );
    await queryInterface.createTable(
      "users",
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        email: {
          type: Sequelize.STRING,
          unique: true,
          allowNull: true,
        },

        phoneNumber: {
          type: Sequelize.STRING,
          unique: true,
          allowNull: true,
        },

        role: {
          type: Sequelize.STRING,
          defaultValue: "user",
        },
        isBlocked: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },

        otp: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        otpExpiresAt: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      },
      {
        tableName: "users",
        timestamps: true,
      },
    );
    await queryInterface.createTable(
      "countries",
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        phoneCode: {
          type: Sequelize.STRING,
        },
        shortCode: {
          type: Sequelize.STRING,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      },
      {
        tableName: "countries",
        timestamps: true,
      },
    );
    await queryInterface.createTable(
      "states",
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },

        name: {
          type: Sequelize.STRING,
          allowNull: false,
        },

        countryId: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      },
      {
        tableName: "states",
        freezeTableName: true,
        timestamps: true,
      },
    );
    await queryInterface.createTable(
      "cities",
      {
        id: {
          type: Sequelize.BIGINT,
          autoIncrement: true,
          primaryKey: true,
        },

        name: {
          type: Sequelize.STRING,
          allowNull: false,
        },

        stateId: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      },
      {
        tableName: "cities",
        freezeTableName: true,
        timestamps: true,
      },
    );
    await queryInterface.createTable(
      "grounds",
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },

        name: {
          type: Sequelize.STRING,
          allowNull: false,
          field: "name",
        },

        contactNo: {
          type: Sequelize.STRING,
          allowNull: false,
          field: "contactNo",
        },

        pricePerSlot: {
          type: Sequelize.INTEGER,
          allowNull: false,
          field: "pricePerSlot",
        },

        area: {
          type: Sequelize.STRING,
          field: "area",
        },

        country: {
          type: Sequelize.STRING,
          field: "country",
        },

        state: {
          type: Sequelize.STRING,
          field: "state",
        },

        city: {
          type: Sequelize.STRING,
          field: "city",
        },

        locationUrl: {
          type: Sequelize.TEXT,
          allowNull: true,
        },

        game: {
          type: Sequelize.STRING,
          allowNull: false,
          field: "game",
        },

        openingTime: {
          type: Sequelize.STRING,
          allowNull: false,
          field: "openingTime",
        },

        closingTime: {
          type: Sequelize.STRING,
          allowNull: false,
          field: "closingTime",
        },
        advanceBookingDays: {
          type: Sequelize.INTEGER,
          allowNull: true,
          defaultValue: 7,
        },
        cityId: {
          type: Sequelize.BIGINT,
          field: "cityId",
        },

        countryId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        stateId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        isBlocked: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        adminId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },

        gstPercentage: {
          type: DataTypes.DECIMAL(5, 2),
          defaultValue: 0,
        },

        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      },
      {
        tableName: "grounds",
        timestamps: true,
      },
    );
    await queryInterface.createTable(
      "slots",
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        startTime: {
          type: Sequelize.TIME,
          allowNull: false,
        },
        endTime: {
          type: Sequelize.TIME,
          allowNull: false,
        },
        groundId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      },
      {
        tableName: "slots",
        timestamps: true,
      },
    );
    await queryInterface.createTable(
      "groundimages",
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },

        groundId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },

        imageUrl: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      },
      {
        tableName: "groundimages",
        timestamps: true,
      },
    );
    await queryInterface.createTable(
      "amenities",
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },

        groundId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },

        name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      },
      {
        tableName: "amenities",
        timestamps: true,
      },
    );

    await queryInterface.createTable(
      "bookings",
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },

        userId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },

        slotId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },

        date: {
          type: Sequelize.DATEONLY,
          allowNull: false,
        },

        totalPrice: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },

        status: {
          type: Sequelize.ENUM("confirmed", "cancelled", "completed"),
          defaultValue: "confirmed",
        },

        groundId: {
          type: Sequelize.INTEGER,
        },

        adminId: {
          type: Sequelize.INTEGER,
        },
        groundName: {
          type: Sequelize.STRING,
        },
        slotStartTime: {
          type: Sequelize.TIME,
        },
        slotEndTime: {
          type: Sequelize.TIME,
        },
        pricePerSlotAtBooking: {
          type: Sequelize.INTEGER,
        },
        area: {
          type: Sequelize.STRING,
        },
        city: {
          type: Sequelize.STRING,
        },
        state: {
          type: Sequelize.STRING,
        },
        country: {
          type: Sequelize.STRING,
        },

        cityId: { type: Sequelize.INTEGER },
        razorpayOrderId: {
          type: Sequelize.STRING,
          allowNull: true,
        },

        razorpayPaymentId: {
          type: Sequelize.STRING,
          allowNull: true,
        },

        paymentStatus: {
          type: Sequelize.ENUM("pending", "paid", "failed", "refunded"),
          allowNull: false,
          defaultValue: "pending",
        },

        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      },
      {
        tableName: "bookings",
        timestamps: true,
      },
    );

    await queryInterface.createTable(
      "reviews",
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },

        rating: {
          type: Sequelize.INTEGER,
          allowNull: false,
          validate: {
            min: 1,
            max: 5,
          },
        },

        comment: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        userId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        groundId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },

        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      },
      {
        tableName: "reviews",
        timestamps: true,
      },
    );

    await queryInterface.createTable("games", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING, allowNull: false },
      sport: { type: Sequelize.STRING, allowNull: false },
      date: { type: Sequelize.DATEONLY, allowNull: false },
      totalTeams: { type: Sequelize.INTEGER, allowNull: false },
      playersPerTeam: { type: Sequelize.INTEGER, allowNull: false },
      totalPlayers: { type: Sequelize.INTEGER, allowNull: false },
      joinedPlayersCount: { type: Sequelize.INTEGER, allowNull: false },
      pricePerPlayer: { type: Sequelize.FLOAT, allowNull: false },
      status: { type: Sequelize.STRING, allowNull: false },
      createdBy: {
        type: Sequelize.INTEGER,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      groundId: {
        type: Sequelize.INTEGER,
        references: { model: "grounds", key: "id" },
        onDelete: "CASCADE",
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });

    await queryInterface.createTable("gameslots", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      gameId: {
        type: Sequelize.INTEGER,
        references: { model: "games", key: "id" },
        onDelete: "CASCADE",
      },
      slotId: {
        type: Sequelize.INTEGER,
        references: { model: "slots", key: "id" },
        onDelete: "CASCADE",
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });

    /* GAME TEAMS */
    await queryInterface.createTable("gameteams", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      gameId: {
        type: Sequelize.INTEGER,
        references: { model: "games", key: "id" },
        onDelete: "CASCADE",
      },
      teamNumber: Sequelize.INTEGER,
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });

    /* GAME PARTICIPANTS */
    await queryInterface.createTable("gameparticipants", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      gameId: {
        type: Sequelize.INTEGER,
        references: { model: "games", key: "id" },
        onDelete: "CASCADE",
      },
      userId: {
        type: Sequelize.INTEGER,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      teamId: {
        type: Sequelize.INTEGER,
        references: { model: "gameteams", key: "id" },
        onDelete: "SET NULL",
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("gameparticipants");
    await queryInterface.dropTable("gameteams");
    await queryInterface.dropTable("gameslots");
    await queryInterface.dropTable("games");
    await queryInterface.dropTable("reviews");
    await queryInterface.dropTable("bookings");
    await queryInterface.dropTable("amenities");
    await queryInterface.dropTable("groundimages");
    await queryInterface.dropTable("slots");
    await queryInterface.dropTable("grounds");
    await queryInterface.dropTable("cities");
    await queryInterface.dropTable("states");
    await queryInterface.dropTable("countries");
    await queryInterface.dropTable("users");
    await queryInterface.dropTable("admins");
    await queryInterface.dropTable("super_admins");
  },
};

//npx sequelize-cli db:migrate

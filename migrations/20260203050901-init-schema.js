"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "SuperAdmin",
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
      },
      {
        tableName: "super_admins",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: false,
      },
    );
    await queryInterface.createTable("Admin", {
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
    });
    await queryInterface.createTable("User", {
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
    });
    await queryInterface.createTable("Country", {
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
    });
    await queryInterface.createTable("State", {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    });
    await queryInterface.createTable("City", {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    });
    await queryInterface.createTable(
      "Ground",
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
      },
      {
        tableName: "Grounds",
        timestamps: true,
      },
    );
    await queryInterface.createTable("Slot", {
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
    });
    await queryInterface.createTable(
      "GroundImage",
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
      },
      { timestamps: true },
    );
    await queryInterface.createTable("Amenity", {
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
    });
    await queryInterface.createTable("Booking", {
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

      startTime: {
        type: Sequelize.TIME,
        allowNull: false,
      },

      endTime: {
        type: Sequelize.TIME,
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
    });
    await queryInterface.createTable("Review", {
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
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Review");
    await queryInterface.dropTable("Booking");
    await queryInterface.dropTable("Amenity");
    await queryInterface.dropTable("GroundImage");
    await queryInterface.dropTable("Slot");
    await queryInterface.dropTable("Ground");
    await queryInterface.dropTable("City");
    await queryInterface.dropTable("State");
    await queryInterface.dropTable("Country");
    await queryInterface.dropTable("User");
    await queryInterface.dropTable("Admin");
    await queryInterface.dropTable("SuperAdmin");
  },
};

//npx sequelize-cli db:migrate

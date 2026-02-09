"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "Super_admins",
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
        freezeTableName: true,
      },
    );
    await queryInterface.createTable("Admins", {
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
    await queryInterface.createTable("Users", {
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
    await queryInterface.createTable("Countries", {
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
    await queryInterface.createTable("States", {
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
    await queryInterface.createTable("Cities", {
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
      "Grounds",
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
    await queryInterface.createTable("Slots", {
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
      "GroundImages",
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
    await queryInterface.createTable("Amenities", {
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

    await queryInterface.createTable("Bookings", {
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

    await queryInterface.createTable("Reviews", {
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
    await queryInterface.dropTable("Reviews");
    await queryInterface.dropTable("Bookings");
    await queryInterface.dropTable("Amenities");
    await queryInterface.dropTable("GroundImages");
    await queryInterface.dropTable("Slots");
    await queryInterface.dropTable("Grounds");
    await queryInterface.dropTable("Cities");
    await queryInterface.dropTable("States");
    await queryInterface.dropTable("Countries");
    await queryInterface.dropTable("Users");
    await queryInterface.dropTable("Admins");
    await queryInterface.dropTable("Super_admins");
  },
};

//npx sequelize-cli db:migrate

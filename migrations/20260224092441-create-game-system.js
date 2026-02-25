"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // ------------------ Games Table ------------------
    await queryInterface.createTable("games", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      sport: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },

      totalTeams: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      playersPerTeam: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      totalPlayers: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      joinedPlayersCount: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },

      status: {
        type: Sequelize.ENUM("open", "full", "cancelled", "completed"),
        defaultValue: "open",
      },

      pricePerPlayer: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },

      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
      },

      groundId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "grounds",
          key: "id",
        },
        onDelete: "CASCADE",
      },

      slotId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "slots",
          key: "id",
        },
        onDelete: "CASCADE",
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // ------------------ GameTeams Table ------------------
    await queryInterface.createTable("gameteams", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      gameId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "games",
          key: "id",
        },
        onDelete: "CASCADE",
      },

      teamNumber: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // ------------------ GameParticipants Table ------------------
    await queryInterface.createTable("gameparticipants", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      gameId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "games",
          key: "id",
        },
        onDelete: "CASCADE",
      },

      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
      },

      teamId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "gameteams",
          key: "id",
        },
        onDelete: "SET NULL",
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("gameparticipants");
    await queryInterface.dropTable("gameteams");
    await queryInterface.dropTable("games");
  },
};

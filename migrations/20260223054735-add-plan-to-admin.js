module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("admins", "planType", {
      type: Sequelize.ENUM("subscription", "commission"),
      allowNull: false,
      defaultValue: "commission",
    });

    await queryInterface.addColumn("admins", "subscriptionStartDate", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("admins", "subscriptionEndDate", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("admins", "planType");
    await queryInterface.removeColumn("admins", "subscriptionStartDate");
    await queryInterface.removeColumn("admins", "subscriptionEndDate");
  },
};

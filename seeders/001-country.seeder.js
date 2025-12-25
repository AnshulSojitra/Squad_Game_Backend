module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert("Countries", [
      {
        name: "India",
        phoneCode: "+91",
        shortCode: "IN",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("Countries", null, {});
  },
};

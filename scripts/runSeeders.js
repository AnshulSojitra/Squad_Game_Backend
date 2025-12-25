const { sequelize } = require("../models");

(async () => {
  try {
    const queryInterface = sequelize.getQueryInterface();

    await require("../seeders/001-country.seeder").up(queryInterface);
    await require("../seeders/002-state.seeder").up(queryInterface);
    await require("../seeders/003-city.seeder").up(queryInterface);

    console.log("✅ Seeders executed successfully");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();

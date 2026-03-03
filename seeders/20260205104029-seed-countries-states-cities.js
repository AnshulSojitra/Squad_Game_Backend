"use strict";

/**
 * Seeder for countries, states, cities
 */

const data = require("../countries+states+cities.json");

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // Loop through countries
    for (const country of data) {
      // Insert country
      await queryInterface.bulkInsert("countries", [
        {
          name: country.name,
          phoneCode: country.phonecode || null,
          shortCode: country.iso3 || null,
          createdAt: now,
          updatedAt: now,
        },
      ]);

      // Fetch countryId
      const [dbCountry] = await queryInterface.sequelize.query(
        `SELECT id FROM countries WHERE name = ? LIMIT 1`,
        {
          replacements: [country.name],
          type: Sequelize.QueryTypes.SELECT,
        },
      );

      const countryId = dbCountry.id;

      // Loop through states
      for (const state of country.states) {
        await queryInterface.bulkInsert("states", [
          {
            name: state.name,
            countryId,
            createdAt: now,
            updatedAt: now,
          },
        ]);

        // Fetch stateId
        const [dbState] = await queryInterface.sequelize.query(
          `SELECT id FROM states WHERE name = ? AND countryId = ? LIMIT 1`,
          {
            replacements: [state.name, countryId],
            type: Sequelize.QueryTypes.SELECT,
          },
        );

        const stateId = dbState.id;

        // Insert cities
        if (state.cities && state.cities.length > 0) {
          const cities = state.cities.map((city) => ({
            name: city.name,
            stateId,
            createdAt: now,
            updatedAt: now,
          }));

          await queryInterface.bulkInsert("cities", cities);
        }
      }
    }
  },

  async down(queryInterface) {
    // Delete in reverse order
    await queryInterface.bulkDelete("cities", null, {});
    await queryInterface.bulkDelete("states", null, {});
    await queryInterface.bulkDelete("countries", null, {});
  },
};

require("dotenv").config();
const { sequelize, Country, State, City } = require("../models");
const countriesData = require("../countries+states+cities.json");

const run = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    for (const country of countriesData) {
      const createdCountry = await Country.create({
        name: country.name,
        phoneCode: country.phonecode || null,
        shortCode: country.iso3 || null,
      });

      for (const state of country.states) {
        const createdState = await State.create({
          name: state.name,
          countryId: createdCountry.id,
        });

        for (const city of state.cities) {
          await City.create({
            name: typeof city === "string" ? city : city.name,
            stateId: createdState.id,
          });
        }
      }
    }

    console.log("🎉 Countries, states & cities inserted successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Script failed:", error);
    process.exit(1);
  }
};

run();

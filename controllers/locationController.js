const { Country, State, City } = require("../models");

/* GET ALL COUNTRIES */
exports.getCountries = async (req, res) => {
  try {
    const countries = await Country.findAll({
      attributes: ["id", "name", "phoneCode", "shortCode"],
      order: [["name", "ASC"]],
    });
    res.json(countries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* GET STATES BY COUNTRY */
exports.getStatesByCountry = async (req, res) => {
  try {
    const states = await State.findAll({
      where: { countryId: req.params.countryId },
      attributes: ["id", "name"],
      order: [["name", "ASC"]],
    });
    res.json(states);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* GET CITIES BY STATE */
exports.getCitiesByState = async (req, res) => {
  try {
    const cities = await City.findAll({
      where: { stateId: req.params.stateId },
      attributes: ["id", "name"],
      order: [["name", "ASC"]],
    });
    res.json(cities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

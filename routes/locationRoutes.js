const express = require("express");
const router = express.Router();
const locationController = require("../controllers/locationController");

router.get("/countries", locationController.getCountries);
router.get("/states/:countryId", locationController.getStatesByCountry);
router.get("/cities/:stateId", locationController.getCitiesByState);

module.exports = router;

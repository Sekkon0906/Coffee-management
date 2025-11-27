// backend/src/routes/adminConfig.routes.js
const express = require("express");
const router = express.Router();

const {
  getDestinations,
  createDestination,
  updateDestination,
  deleteDestination,
  getCoffeeLines,
  createCoffeeLine,
  updateCoffeeLine,
  deleteCoffeeLine,
  getServices,
  createService,
  updateService,
  deleteService,
} = require("../controllers/adminConfig.controller");

// Destinations
router.get("/destinations", getDestinations);
router.post("/destinations", createDestination);
router.put("/destinations/:id", updateDestination);
router.delete("/destinations/:id", deleteDestination);

// Coffee lines
router.get("/coffee-lines", getCoffeeLines);
router.post("/coffee-lines", createCoffeeLine);
router.put("/coffee-lines/:id", updateCoffeeLine);
router.delete("/coffee-lines/:id", deleteCoffeeLine);

// Services
router.get("/services", getServices);
router.post("/services", createService);
router.put("/services/:id", updateService);
router.delete("/services/:id", deleteService);

module.exports = router;

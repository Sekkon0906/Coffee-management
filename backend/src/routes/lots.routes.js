// backend/src/routes/lots.routes.js
const express = require("express");
const router = express.Router();

const {
  getLots,
  createLot,
} = require("../controllers/lots.controller");

router.get("/", getLots);
router.post("/", createLot);

module.exports = router;

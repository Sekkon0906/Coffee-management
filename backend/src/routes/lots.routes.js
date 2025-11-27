// backend/src/routes/lots.routes.js
const express = require("express");
const router = express.Router();

const {
  getLots,
  createLot,
} = require("../controllers/lots.controller");
const { getLotsMaster } = require("../controllers/lotsMaster.controller");

router.get("/", getLots);
router.get("/master", getLotsMaster);
router.post("/", createLot);

module.exports = router;

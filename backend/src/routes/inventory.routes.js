const express = require("express");
const router = express.Router();

const {
  getInventorySummary,
  getInventoryMovements,
} = require("../controllers/inventory.controller");

router.get("/summary", getInventorySummary);
router.get("/movements", getInventoryMovements);

module.exports = router;

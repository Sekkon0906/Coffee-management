// backend/src/routes/providers.routes.js
const express = require("express");
const router = express.Router();

const {
  getProviders,
  createProvider,
  updateProvider,
  deleteProvider,
} = require("../controllers/providers.controller");

// Base real: /api/providers

router.get("/", getProviders);
router.post("/", createProvider);
router.put("/:id", updateProvider);
router.delete("/:id", deleteProvider);

module.exports = router;

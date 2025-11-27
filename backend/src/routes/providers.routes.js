// backend/src/routes/providers.routes.js
const express = require("express");
const router = express.Router();

const {
  getProviders,
  createProvider,
} = require("../controllers/providers.controller");

router.get("/", getProviders);
router.post("/", createProvider);

module.exports = router;

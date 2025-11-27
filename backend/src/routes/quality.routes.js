const express = require("express");
const router = express.Router();

const {
  getTopLots,
  getTopProviders,
  getProviderHistory,
  getCuppingDetail,
  saveCupping,
} = require("../controllers/quality.controller");

router.get("/top-lots", getTopLots);
router.get("/top-providers", getTopProviders);
router.get("/provider-history/:providerId", getProviderHistory);
router.get("/cupping/:cuppingId", getCuppingDetail);
router.post("/cupping", saveCupping);
router.put("/cupping", saveCupping);

module.exports = router;

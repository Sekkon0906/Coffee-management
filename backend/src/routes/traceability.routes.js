// backend/src/routes/traceability.routes.js
const express = require("express");
const router = express.Router();

const traceCtrl = require("../controllers/traceability.controller");

// GUARDAR FORMULARIOS
router.post("/:lotId/intake", traceCtrl.saveIntake);
router.post("/:lotId/trilla", traceCtrl.saveTrilla);
router.post("/:lotId/tueste", traceCtrl.saveTueste);
router.post("/:lotId/cata", traceCtrl.saveCata);
router.post("/:lotId/empaque", traceCtrl.saveEmpaque);
router.post("/:lotId/despacho", traceCtrl.saveDespacho);
router.post("/:lotId/inspeccion", traceCtrl.saveInspeccion);

// PDFS
router.get("/:lotId/pdf/intake", traceCtrl.pdfIntake);
router.get("/:lotId/pdf/trilla", traceCtrl.pdfTrilla);
router.get("/:lotId/pdf/tueste", traceCtrl.pdfTueste);
router.get("/:lotId/pdf/cata", traceCtrl.pdfCata);
router.get("/:lotId/pdf/empaque", traceCtrl.pdfEmpaque);
router.get("/:lotId/pdf/despacho", traceCtrl.pdfDespacho);
router.get("/:lotId/pdf/inspeccion", traceCtrl.pdfInspeccion);
router.get("/:lotId/pdf/full", traceCtrl.pdfFullTraceability);

module.exports = router;

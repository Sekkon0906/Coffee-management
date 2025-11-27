// backend/src/routes/dbTest.routes.js
const express = require("express");
const router = express.Router();

// 👇 Import directo del pool (tal cual lo exportamos)
const pool = require("../config/db");

router.get("/db-test", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 + 1 AS result");
    res.json({ ok: true, result: rows[0].result });
  } catch (err) {
    console.error("DB test error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;

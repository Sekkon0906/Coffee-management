// src/controllers/lots.controller.js
const { pool } = require("../config/db");

// GET /api/lots
const getLots = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM lots");
    res.json(rows);
  } catch (error) {
    console.error("Error getting lots:", error);
    res.status(500).json({ message: "Error fetching lots" });
  }
};

// POST /api/lots
const createLot = async (req, res) => {
  try {
    const { provider_id, name, origin, quantity_kg, price_per_kg } = req.body;

    const [result] = await pool.query(
      "INSERT INTO lots (provider_id, name, origin, quantity_kg, price_per_kg) VALUES (?, ?, ?, ?, ?)",
      [provider_id, name, origin, quantity_kg, price_per_kg]
    );

    res.status(201).json({
      id: result.insertId,
      provider_id,
      name,
      origin,
      quantity_kg,
      price_per_kg,
    });
  } catch (error) {
    console.error("Error creating lot:", error);
    res.status(500).json({ message: "Error creating lot" });
  }
};

module.exports = {
  getLots,
  createLot,
};

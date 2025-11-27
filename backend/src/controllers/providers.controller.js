// backend/src/controllers/providers.controller.js
const pool = require("../config/db");

// Por ahora, empresa demo = 1
const DEFAULT_COMPANY_ID = 1;

// GET /api/providers
const getProviders = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         id,
         name,
         contact_name,
         phone,
         email,
         region,
         municipality,
         is_active,
         created_at
       FROM providers
       WHERE company_id = ?
       ORDER BY created_at DESC`,
      [DEFAULT_COMPANY_ID]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error getProviders:", err);
    res.status(500).json({ message: "Error obteniendo proveedores" });
  }
};

// POST /api/providers
const createProvider = async (req, res) => {
  try {
    const { name, contact_name, phone, email, region, municipality } = req.body;

    if (!name) {
      return res.status(400).json({ message: "El nombre es obligatorio" });
    }

    const [result] = await pool.query(
      `INSERT INTO providers
       (company_id, name, contact_name, phone, email, region, municipality)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        DEFAULT_COMPANY_ID,
        name,
        contact_name || null,
        phone || null,
        email || null,
        region || null,
        municipality || null,
      ]
    );

    const [rows] = await pool.query(
      `SELECT
         id,
         name,
         contact_name,
         phone,
         email,
         region,
         municipality,
         is_active,
         created_at
       FROM providers
       WHERE id = ?`,
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Error createProvider:", err);
    res.status(500).json({ message: "Error creando proveedor" });
  }
};

module.exports = {
  getProviders,
  createProvider,
};

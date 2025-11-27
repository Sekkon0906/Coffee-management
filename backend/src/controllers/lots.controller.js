// backend/src/controllers/lots.controller.js
const pool = require("../config/db");

// GET /api/lots  → lista todos los lotes
const getLots = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT 
        l.id,
        l.name,
        -- construimos "origin" a partir de las nuevas columnas
        CONCAT_WS(' - ', l.origin_region, l.origin_place) AS origin,
        l.process,
        l.quality_score,
        l.quantity_kg,
        l.price_per_kg,
        l.status,
        l.created_at,
        p.name AS provider_name
      FROM lots l
      LEFT JOIN providers p ON p.id = l.provider_id
      WHERE l.company_id = ?
      ORDER BY l.created_at DESC
      `,
      [1] // por ahora compañía demo fija
    );

    res.json(rows);
  } catch (err) {
    console.error("Error getLots:", err);
    res.status(500).json({ message: "Error obteniendo lotes" });
  }
};

// POST /api/lots  → crear lote nuevo
const createLot = async (req, res) => {
  try {
    const {
      // si no mandas company_id, asumimos 1 (empresa demo)
      company_id = 1,
      provider_id,
      name,
      // lo que venga del front
      origin,          // string completo (ej: "Tolima - Ibagué")
      origin_region,   // opcional
      origin_place,    // opcional
      process,
      quality_score,
      quantity_kg,
      price_per_kg,
      status,
    } = req.body;

    // resolvemos región y lugar para la nueva estructura
    const regionValue = origin_region || null;
    const placeValue = origin_place || origin || null;

    if (!provider_id || !name || !placeValue || !quantity_kg || !price_per_kg) {
      return res
        .status(400)
        .json({ message: "Faltan campos obligatorios del lote" });
    }

    const [result] = await pool.query(
      `
      INSERT INTO lots
      (company_id, provider_id, name, origin_region, origin_place, process,
       quality_score, quantity_kg, price_per_kg, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        company_id,
        provider_id,
        name,
        regionValue,
        placeValue,
        process || null,
        quality_score || null,
        quantity_kg,
        price_per_kg,
        status || "ingresado",
      ]
    );

    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error("Error createLot:", err);
    res.status(500).json({ message: "Error creando lote" });
  }
};

module.exports = { getLots, createLot };

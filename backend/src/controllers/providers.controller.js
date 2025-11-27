// backend/src/controllers/providers.controller.js
const pool = require("../config/db");

// Por ahora, empresa demo = 1
const DEFAULT_COMPANY_ID = 1;

async function buildProviderKPIs() {
  const [[activeRow]] = await pool.query(
    `SELECT COUNT(*) AS total FROM providers WHERE company_id = ? AND (is_active = 1 OR is_active IS NULL)`,
    [DEFAULT_COMPANY_ID]
  );

  const [[kgRow]] = await pool.query(
    `SELECT COALESCE(SUM(quantity_kg), 0) AS kg_recent
     FROM lots
     WHERE company_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)`,
    [DEFAULT_COMPANY_ID]
  );

  const [[scoreRow]] = await pool.query(
    `SELECT AVG(lc.total_score) AS avg_score
     FROM lot_cuppings lc
     JOIN lots l ON l.id = lc.lot_id
     WHERE l.company_id = ?`,
    [DEFAULT_COMPANY_ID]
  );

  return {
    activos: activeRow?.total || 0,
    kg_ultimos_90: Number(kgRow?.kg_recent || 0),
    puntaje_promedio: Number(scoreRow?.avg_score || 0).toFixed(1),
  };
}

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
    const kpis = await buildProviderKPIs();
    res.json({ providers: rows, kpis });
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

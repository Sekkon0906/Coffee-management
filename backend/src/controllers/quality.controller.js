// backend/src/controllers/quality.controller.js
const pool = require("../config/db");

const DEFAULT_COMPANY_ID = 1;

async function getTopLots(req, res) {
  try {
    const limit = Number(req.query.limit || 5);
    const [rows] = await pool.query(
      `SELECT lc.id AS cupping_id, lc.lot_id, l.code AS lot_code, p.name AS provider_name,
              lc.total_score, lc.is_accepted, lc.evaluated_at
       FROM lot_cuppings lc
       JOIN lots l ON l.id = lc.lot_id
       LEFT JOIN providers p ON p.id = l.provider_id
       WHERE lc.company_id = ?
       ORDER BY lc.evaluated_at DESC, lc.total_score DESC
       LIMIT ?`,
      [DEFAULT_COMPANY_ID, limit]
    );

    res.json(rows);
  } catch (err) {
    console.error("Error getTopLots:", err);
    res.status(500).json({ message: "Error obteniendo ranking de lotes" });
  }
}

async function getTopProviders(req, res) {
  try {
    const limit = Number(req.query.limit || 5);
    const [rows] = await pool.query(
      `SELECT p.id, p.name, COUNT(lc.id) AS lotes_evaluados, AVG(lc.total_score) AS puntaje_promedio
       FROM lot_cuppings lc
       JOIN lots l ON l.id = lc.lot_id
       LEFT JOIN providers p ON p.id = l.provider_id
       WHERE lc.company_id = ?
       GROUP BY p.id, p.name
       ORDER BY puntaje_promedio DESC
       LIMIT ?`,
      [DEFAULT_COMPANY_ID, limit]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error getTopProviders:", err);
    res.status(500).json({ message: "Error obteniendo ranking de proveedores" });
  }
}

async function getProviderHistory(req, res) {
  try {
    const providerId = req.params.providerId;
    const [rows] = await pool.query(
      `SELECT lc.id, lc.total_score, lc.evaluated_at, l.code AS lot_code
       FROM lot_cuppings lc
       JOIN lots l ON l.id = lc.lot_id
       WHERE lc.company_id = ? AND l.provider_id = ?
       ORDER BY lc.evaluated_at ASC`,
      [DEFAULT_COMPANY_ID, providerId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error getProviderHistory:", err);
    res.status(500).json({ message: "Error obteniendo histórico de proveedor" });
  }
}

async function getCuppingDetail(req, res) {
  try {
    const cuppingId = req.params.cuppingId;
    const [[row]] = await pool.query(
      `SELECT lc.*, l.code AS lot_code, p.name AS provider_name
       FROM lot_cuppings lc
       JOIN lots l ON l.id = lc.lot_id
       LEFT JOIN providers p ON p.id = l.provider_id
       WHERE lc.id = ? AND lc.company_id = ?`,
      [cuppingId, DEFAULT_COMPANY_ID]
    );

    if (!row) return res.status(404).json({ message: "Cata no encontrada" });
    res.json(row);
  } catch (err) {
    console.error("Error getCuppingDetail:", err);
    res.status(500).json({ message: "Error obteniendo detalle de cata" });
  }
}

async function saveCupping(req, res) {
  try {
    const {
      id,
      lot_id,
      total_score,
      is_accepted,
      notes,
      evaluated_by,
      attributes,
    } = req.body;

    const attributesJson = JSON.stringify(attributes || {});

    if (id) {
      await pool.query(
        `UPDATE lot_cuppings
         SET lot_id = ?, total_score = ?, is_accepted = ?, notes = ?, evaluated_by = ?, attributes_json = ?, evaluated_at = NOW()
         WHERE id = ? AND company_id = ?`,
        [lot_id, total_score, is_accepted ? 1 : 0, notes || null, evaluated_by || null, attributesJson, id, DEFAULT_COMPANY_ID]
      );
      res.json({ id });
    } else {
      const [insert] = await pool.query(
        `INSERT INTO lot_cuppings
         (company_id, lot_id, total_score, is_accepted, notes, evaluated_by, attributes_json, evaluated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [DEFAULT_COMPANY_ID, lot_id, total_score, is_accepted ? 1 : 0, notes || null, evaluated_by || null, attributesJson]
      );
      res.status(201).json({ id: insert.insertId });
    }
  } catch (err) {
    console.error("Error saveCupping:", err);
    res.status(500).json({ message: "Error guardando evaluación" });
  }
}

module.exports = {
  getTopLots,
  getTopProviders,
  getProviderHistory,
  getCuppingDetail,
  saveCupping,
};

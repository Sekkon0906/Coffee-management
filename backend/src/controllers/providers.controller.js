// backend/src/controllers/providers.controller.js
const pool = require("../config/db");

// Por ahora, empresa demo = 1 (lo dejamos por si luego filtras)
const DEFAULT_COMPANY_ID = 1;

// ===================================================================
// GET /api/providers  → lista todos los proveedores
// ===================================================================
const getProviders = async (req, res) => {
  try {
    // Versión ultra simple: sin WHERE, sin columnas raras
    const [rows] = await pool.query("SELECT * FROM providers ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error("Error getProviders:", err.code, err.sqlMessage || err);
    res.status(500).json({ message: "Error obteniendo proveedores" });
  }
};

// ===================================================================
// POST /api/providers  → crear proveedor
// ===================================================================
const createProvider = async (req, res) => {
  try {
    const {
      name,
      contact_name,
      phone,
      email,
      region,
      municipality,
    } = req.body;

    if (!name || !name.trim()) {
      return res
        .status(400)
        .json({ message: "El nombre del proveedor es obligatorio" });
    }

    const [result] = await pool.query(
      `INSERT INTO providers
       (name, contact_name, phone, email, region, municipality)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        contact_name || null,
        phone || null,
        email || null,
        region || null,
        municipality || null,
      ]
    );

    const [rows] = await pool.query(
      "SELECT * FROM providers WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Error createProvider:", err.code, err.sqlMessage || err);
    res.status(500).json({ message: "Error creando proveedor" });
  }
};

// ===================================================================
// PUT /api/providers/:id  → actualizar proveedor
// ===================================================================
const updateProvider = async (req, res) => {
  try {
    const providerId = parseInt(req.params.id, 10);
    if (Number.isNaN(providerId)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const {
      name,
      contact_name,
      phone,
      email,
      region,
      municipality,
    } = req.body;

    const [result] = await pool.query(
      `UPDATE providers
       SET
         name = ?,
         contact_name = ?,
         phone = ?,
         email = ?,
         region = ?,
         municipality = ?
       WHERE id = ?`,
      [
        name || null,
        contact_name || null,
        phone || null,
        email || null,
        region || null,
        municipality || null,
        providerId,
      ]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Proveedor no encontrado para actualizar" });
    }

    const [rows] = await pool.query(
      "SELECT * FROM providers WHERE id = ?",
      [providerId]
    );

    res.json(rows[0]);
  } catch (err) {
    console.error("Error updateProvider:", err.code, err.sqlMessage || err);
    res.status(500).json({ message: "Error actualizando proveedor" });
  }
};

// ===================================================================
// DELETE /api/providers/:id  → eliminar proveedor (borrado físico simple)
// ===================================================================
const deleteProvider = async (req, res) => {
  try {
    const providerId = parseInt(req.params.id, 10);
    if (Number.isNaN(providerId)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const [result] = await pool.query(
      "DELETE FROM providers WHERE id = ?",
      [providerId]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Proveedor no encontrado para eliminar" });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("Error deleteProvider:", err.code, err.sqlMessage || err);
    res.status(500).json({ message: "Error eliminando proveedor" });
  }
};

module.exports = {
  getProviders,
  createProvider,
  updateProvider,
  deleteProvider,
};

// backend/src/controllers/adminConfig.controller.js
const pool = require("../config/db");

// De momento fijamos la empresa demo en 1
const DEFAULT_COMPANY_ID = 1;

/* ============================
 * DESTINATIONS (DESTINACIONES)
 * ============================ */

const getDestinations = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, code, description, is_active, created_at
       FROM destinations
       WHERE company_id = ?
       ORDER BY created_at DESC`,
      [DEFAULT_COMPANY_ID]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error getDestinations:", err);
    res.status(500).json({ message: "Error obteniendo destinaciones" });
  }
};

const createDestination = async (req, res) => {
  try {
    const { name, code, description } = req.body;
    if (!name) {
      return res.status(400).json({ message: "El nombre es obligatorio" });
    }

    const [result] = await pool.query(
      `INSERT INTO destinations
       (company_id, name, code, description)
       VALUES (?, ?, ?, ?)`,
      [DEFAULT_COMPANY_ID, name, code || null, description || null]
    );

    const [rows] = await pool.query(
      `SELECT id, name, code, description, is_active, created_at
       FROM destinations
       WHERE id = ?`,
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Error createDestination:", err);
    res.status(500).json({ message: "Error creando destinación" });
  }
};

const updateDestination = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description, is_active } = req.body;

    await pool.query(
      `UPDATE destinations
       SET name = ?, code = ?, description = ?, is_active = ?
       WHERE id = ? AND company_id = ?`,
      [
        name,
        code || null,
        description || null,
        is_active !== undefined ? is_active : 1,
        id,
        DEFAULT_COMPANY_ID,
      ]
    );

    const [rows] = await pool.query(
      `SELECT id, name, code, description, is_active, created_at
       FROM destinations
       WHERE id = ?`,
      [id]
    );

    res.json(rows[0]);
  } catch (err) {
    console.error("Error updateDestination:", err);
    res.status(500).json({ message: "Error actualizando destinación" });
  }
};

const deleteDestination = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      `DELETE FROM destinations
       WHERE id = ? AND company_id = ?`,
      [id, DEFAULT_COMPANY_ID]
    );

    res.json({ ok: true });
  } catch (err) {
    console.error("Error deleteDestination:", err);
    res.status(500).json({ message: "Error eliminando destinación" });
  }
};

/* ============================
 * COFFEE LINES (LÍNEAS DE CAFÉ)
 * ============================ */

const getCoffeeLines = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, code, description, color_hex, is_active, created_at
       FROM coffee_lines
       WHERE company_id = ?
       ORDER BY created_at DESC`,
      [DEFAULT_COMPANY_ID]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error getCoffeeLines:", err);
    res.status(500).json({ message: "Error obteniendo líneas de café" });
  }
};

const createCoffeeLine = async (req, res) => {
  try {
    const { name, code, description, color_hex } = req.body;
    if (!name) {
      return res.status(400).json({ message: "El nombre es obligatorio" });
    }

    const [result] = await pool.query(
      `INSERT INTO coffee_lines
       (company_id, name, code, description, color_hex)
       VALUES (?, ?, ?, ?, ?)`,
      [
        DEFAULT_COMPANY_ID,
        name,
        code || null,
        description || null,
        color_hex || null,
      ]
    );

    const [rows] = await pool.query(
      `SELECT id, name, code, description, color_hex, is_active, created_at
       FROM coffee_lines
       WHERE id = ?`,
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Error createCoffeeLine:", err);
    res.status(500).json({ message: "Error creando línea de café" });
  }
};

const updateCoffeeLine = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description, color_hex, is_active } = req.body;

    await pool.query(
      `UPDATE coffee_lines
       SET name = ?, code = ?, description = ?, color_hex = ?, is_active = ?
       WHERE id = ? AND company_id = ?`,
      [
        name,
        code || null,
        description || null,
        color_hex || null,
        is_active !== undefined ? is_active : 1,
        id,
        DEFAULT_COMPANY_ID,
      ]
    );

    const [rows] = await pool.query(
      `SELECT id, name, code, description, color_hex, is_active, created_at
       FROM coffee_lines
       WHERE id = ?`,
      [id]
    );

    res.json(rows[0]);
  } catch (err) {
    console.error("Error updateCoffeeLine:", err);
    res.status(500).json({ message: "Error actualizando línea de café" });
  }
};

const deleteCoffeeLine = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      `DELETE FROM coffee_lines
       WHERE id = ? AND company_id = ?`,
      [id, DEFAULT_COMPANY_ID]
    );

    res.json({ ok: true });
  } catch (err) {
    console.error("Error deleteCoffeeLine:", err);
    res.status(500).json({ message: "Error eliminando línea de café" });
  }
};

/* ============================
 * SERVICES (SERVICIOS)
 * ============================ */

const getServices = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, code, description, base_price, is_active, created_at
       FROM services
       WHERE company_id = ?
       ORDER BY created_at DESC`,
      [DEFAULT_COMPANY_ID]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error getServices:", err);
    res.status(500).json({ message: "Error obteniendo servicios" });
  }
};

const createService = async (req, res) => {
  try {
    const { name, code, description, base_price } = req.body;
    if (!name) {
      return res.status(400).json({ message: "El nombre es obligatorio" });
    }

    const price =
      base_price !== undefined && base_price !== null && base_price !== ""
        ? Number(base_price)
        : null;

    const [result] = await pool.query(
      `INSERT INTO services
       (company_id, name, code, description, base_price)
       VALUES (?, ?, ?, ?, ?)`,
      [DEFAULT_COMPANY_ID, name, code || null, description || null, price]
    );

    const [rows] = await pool.query(
      `SELECT id, name, code, description, base_price, is_active, created_at
       FROM services
       WHERE id = ?`,
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Error createService:", err);
    res.status(500).json({ message: "Error creando servicio" });
  }
};

const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description, base_price, is_active } = req.body;

    const price =
      base_price !== undefined && base_price !== null && base_price !== ""
        ? Number(base_price)
        : null;

    await pool.query(
      `UPDATE services
       SET name = ?, code = ?, description = ?, base_price = ?, is_active = ?
       WHERE id = ? AND company_id = ?`,
      [
        name,
        code || null,
        description || null,
        price,
        is_active !== undefined ? is_active : 1,
        id,
        DEFAULT_COMPANY_ID,
      ]
    );

    const [rows] = await pool.query(
      `SELECT id, name, code, description, base_price, is_active, created_at
       FROM services
       WHERE id = ?`,
      [id]
    );

    res.json(rows[0]);
  } catch (err) {
    console.error("Error updateService:", err);
    res.status(500).json({ message: "Error actualizando servicio" });
  }
};

const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      `DELETE FROM services
       WHERE id = ? AND company_id = ?`,
      [id, DEFAULT_COMPANY_ID]
    );

    res.json({ ok: true });
  } catch (err) {
    console.error("Error deleteService:", err);
    res.status(500).json({ message: "Error eliminando servicio" });
  }
};

module.exports = {
  // destinations
  getDestinations,
  createDestination,
  updateDestination,
  deleteDestination,
  // coffee lines
  getCoffeeLines,
  createCoffeeLine,
  updateCoffeeLine,
  deleteCoffeeLine,
  // services
  getServices,
  createService,
  updateService,
  deleteService,
};

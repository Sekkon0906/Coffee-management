// backend/src/controllers/lots.controller.js
const pool = require("../config/db");

const DEFAULT_COMPANY_ID = 1;

// ======================================================
// GET /api/lots → lista todos los lotes
// ======================================================
const getLots = async (req, res) => {
  try {
    const companyId = DEFAULT_COMPANY_ID;

    const [rows] = await pool.query(
      `
      SELECT 
        l.id,
        l.code,
        l.name,
        CONCAT_WS(' - ', l.origin_region, l.origin_place) AS origin,
        l.variety,
        l.process,
        l.quality_score,
        l.quantity_kg,
        l.initial_kg,
        l.price_per_kg,
        l.status,
        l.created_at,
        p.name AS provider_name
      FROM lots l
      LEFT JOIN providers p ON p.id = l.provider_id
      WHERE l.company_id = ?
      ORDER BY l.created_at DESC
      `,
      [companyId]
    );

    res.json(rows);
  } catch (err) {
    console.error("Error getLots:", err);
    res.status(500).json({ message: "Error obteniendo lotes" });
  }
};

// ======================================================
// POST /api/lots → crear lote (versión sencilla, sin ficha)
// (la puedes seguir usando si quieres algo rápido)
// ======================================================
const createLot = async (req, res) => {
  try {
    const {
      company_id = DEFAULT_COMPANY_ID,
      provider_id,
      name,
      origin,
      origin_region,
      origin_place,
      process,
      quality_score,
      quantity_kg,
      price_per_kg,
      status,
    } = req.body;

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
       quality_score, quantity_kg, initial_kg, price_per_kg, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        quantity_kg,              // initial_kg = cantidad inicial
        price_per_kg,
        status || "pergamino",
      ]
    );

    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error("Error createLot:", err);
    res.status(500).json({ message: "Error creando lote" });
  }
};

// ======================================================
// POST /api/lots/intake → registrar ingreso de lote
//   • crea lote
//   • crea registro en lot_intakes
//   • crea movimiento en inventory_movements
// ======================================================
const createLotIntake = async (req, res) => {
  const {
    company_id,
    provider_id,
    code,
    name,
    origin_region,
    origin_place,
    variety,
    process,
    quantity_kg,
    price_per_kg,
    destination_id,
    line_id,
    humidity_pct,
    package_type,
    package_detail,
    services,      // objeto o array (opcional)
    observations,
  } = req.body;

  const companyId = company_id || DEFAULT_COMPANY_ID;
  const userId = req.user?.id || null; // si aún no tienes auth, quedará null

  try {
    if (!quantity_kg || Number(quantity_kg) <= 0) {
      return res
        .status(400)
        .json({ message: "La cantidad (kg) es obligatoria y debe ser mayor a 0." });
    }

    // puedes hacer más validaciones si quieres (provider_id, name, etc.)

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // 1) Crear el lote
      const [lotResult] = await conn.query(
        `
        INSERT INTO lots (
          company_id, provider_id, code, name,
          origin_region, origin_place, variety, process,
          quality_score, quantity_kg, initial_kg, price_per_kg,
          status, destination_id, line_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          companyId,
          provider_id || null,
          code || null,
          name || null,
          origin_region || null,
          origin_place || null,
          variety || null,
          process || null,
          null,                        // quality_score
          quantity_kg,                 // quantity_kg actual
          quantity_kg,                 // initial_kg
          price_per_kg || null,
          "pergamino",                 // estado inicial
          destination_id || null,
          line_id || null,
        ]
      );

      const lotId = lotResult.insertId;

      // 2) Registrar ficha de ingreso (lot_intakes)
      let servicesJson = null;
      if (services) {
        // si ya viene como string JSON lo dejamos, si es objeto lo convertimos
        servicesJson =
          typeof services === "string" ? services : JSON.stringify(services);
      }

      await conn.query(
        `
        INSERT INTO lot_intakes (
          company_id, lot_id, destination_id, line_id,
          services_json, humidity_pct, package_type,
          package_detail, observations, received_by
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          companyId,
          lotId,
          destination_id || null,
          line_id || null,
          servicesJson,
          humidity_pct || null,
          package_type || null,
          package_detail || null,
          observations || null,
          userId,
        ]
      );

      // 3) Movimiento de inventario (ingreso de lote)
      await conn.query(
        `
        INSERT INTO inventory_movements (
          company_id, lot_id, movement_type, quantity_kg,
          from_state, to_state, created_by, notes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          companyId,
          lotId,
          "INGRESO_LOTE",
          quantity_kg,
          null,               // from_state
          "pergamino",        // to_state
          userId,
          "Ingreso inicial de lote",
        ]
      );

      await conn.commit();

      res.status(201).json({
        message: "Lote registrado correctamente",
        lot: {
          id: lotId,
          code,
          name,
          quantity_kg,
          status: "pergamino",
        },
      });
    } catch (err) {
      await conn.rollback();
      console.error("Error createLotIntake tx:", err);
      res
        .status(500)
        .json({ message: "Error registrando el ingreso de lote" });
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error("Error createLotIntake:", err);
    res.status(500).json({ message: "Error interno" });
  }
};

module.exports = {
  getLots,
  createLot,
  createLotIntake,
};

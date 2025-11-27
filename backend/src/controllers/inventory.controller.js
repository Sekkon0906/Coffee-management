// backend/src/controllers/inventory.controller.js
const pool = require("../config/db");
const { getCurrentStockForLot } = require("../utils/stockMovements");

const DEFAULT_COMPANY_ID = 1;

async function resolveLotState(companyId, lotId) {
  const [[stateRow]] = await pool.query(
    `SELECT
        (SELECT packed_at FROM lot_packagings lp WHERE lp.company_id = ? AND lp.lot_id = ? ORDER BY packed_at DESC, id DESC LIMIT 1) AS packed_at,
        (SELECT performed_at FROM lot_roastings lr WHERE lr.company_id = ? AND lr.lot_id = ? ORDER BY performed_at DESC, id DESC LIMIT 1) AS roasted_at,
        (SELECT performed_at FROM lot_trillings lt WHERE lt.company_id = ? AND lt.lot_id = ? ORDER BY performed_at DESC, id DESC LIMIT 1) AS trilled_at`,
    [companyId, lotId, companyId, lotId, companyId, lotId]
  );

  if (stateRow?.packed_at) return "empacado";
  if (stateRow?.roasted_at) return "tostado";
  if (stateRow?.trilled_at) return "trillado";
  return "pergamino";
}

// GET /api/inventory/summary
async function getInventorySummary(req, res) {
  try {
    const companyId = DEFAULT_COMPANY_ID;
    const [lots] = await pool.query(
      `SELECT l.id, l.code, l.provider_id FROM lots l WHERE l.company_id = ?`,
      [companyId]
    );

    const totals = {
      pergamino: 0,
      trillado: 0,
      tostado: 0,
      empacado: 0,
    };

    const packagingByType = {};

    for (const lot of lots) {
      const state = await resolveLotState(companyId, lot.id);
      const stock = await getCurrentStockForLot(companyId, lot.id);
      totals[state] += stock;

      const [packs] = await pool.query(
        `SELECT total_kg, observations FROM lot_packagings WHERE lot_id = ? AND company_id = ?`,
        [lot.id, companyId]
      );
      packs.forEach((p) => {
        try {
          const parsed = JSON.parse(p.observations || "{} ");
          Object.entries(parsed).forEach(([key, value]) => {
            if (!value) return;
            packagingByType[key] = (packagingByType[key] || 0) + Number(value);
          });
        } catch (err) {
          // ignore
        }
      });
    }

    // Rotación promedio: diferencia entre primera entrada y último despacho
    const [[rotationRow]] = await pool.query(
      `SELECT AVG(DATEDIFF(last_dispatch, first_intake)) AS avg_days
       FROM (
        SELECT
          l.id,
          (SELECT MIN(received_at) FROM lot_intakes li WHERE li.lot_id = l.id) AS first_intake,
          (SELECT MAX(dispatched_at) FROM lot_dispatches ld WHERE ld.lot_id = l.id) AS last_dispatch
        FROM lots l
        WHERE l.company_id = ?
       ) t
       WHERE first_intake IS NOT NULL AND last_dispatch IS NOT NULL`,
      [companyId]
    );

    res.json({
      kg_pergamino_total: Number(totals.pergamino.toFixed(3)),
      kg_trillado_total: Number(totals.trillado.toFixed(3)),
      kg_tostado_total: Number(totals.tostado.toFixed(3)),
      kg_empacado_total: Number(totals.empacado.toFixed(3)),
      empacado_por_tipo_bolsa: packagingByType,
      rotacion_promedio_dias: rotationRow?.avg_days || 0,
    });
  } catch (err) {
    console.error("Error getInventorySummary:", err);
    res.status(500).json({ message: "Error obteniendo resumen de inventario" });
  }
}

// GET /api/inventory/movements
async function getInventoryMovements(req, res) {
  try {
    const companyId = DEFAULT_COMPANY_ID;
    const { providerId, lineId, state, from, to } = req.query;

    let where = "sm.company_id = ?";
    const params = [companyId];

    if (from) {
      where += " AND sm.created_at >= ?";
      params.push(from);
    }
    if (to) {
      where += " AND sm.created_at <= ?";
      params.push(to);
    }
    if (providerId) {
      where += " AND p.id = ?";
      params.push(providerId);
    }
    if (lineId) {
      where += " AND cl.id = ?";
      params.push(lineId);
    }

    const [rows] = await pool.query(
      `SELECT
         sm.id,
         sm.lot_id,
         sm.created_at,
         sm.movement_type,
         sm.quantity_kg,
         sm.direction,
         sm.resulting_stock_kg,
         sm.notes,
         l.code AS lot_code,
         p.name AS provider_name,
         cl.name AS line_name
       FROM stock_movements sm
       JOIN lots l ON l.id = sm.lot_id
       LEFT JOIN providers p ON p.id = l.provider_id
       LEFT JOIN coffee_lines cl ON cl.id = l.line_id
       WHERE ${where}
       ORDER BY sm.created_at DESC, sm.id DESC
       LIMIT 500`,
      params
    );

    // client side filter for state using resolver to avoid extra joins
    const filtered = [];
    for (const r of rows) {
      if (state) {
        const lotState = await resolveLotState(companyId, r.lot_id);
        if (lotState !== state) continue;
      }
      filtered.push(r);
    }

    res.json(filtered);
  } catch (err) {
    console.error("Error getInventoryMovements:", err);
    res.status(500).json({ message: "Error obteniendo movimientos" });
  }
}

module.exports = {
  getInventorySummary,
  getInventoryMovements,
};

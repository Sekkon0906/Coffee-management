// backend/src/controllers/lotsMaster.controller.js
const pool = require("../config/db");
const { getCurrentStockForLot } = require("../utils/stockMovements");

const DEFAULT_COMPANY_ID = 1;

async function computeLotState(companyId, lotId) {
  const [[row]] = await pool.query(
    `SELECT
        (SELECT packed_at FROM lot_packagings lp WHERE lp.company_id = ? AND lp.lot_id = ? ORDER BY packed_at DESC, id DESC LIMIT 1) AS packed_at,
        (SELECT performed_at FROM lot_roastings lr WHERE lr.company_id = ? AND lr.lot_id = ? ORDER BY performed_at DESC, id DESC LIMIT 1) AS roasted_at,
        (SELECT performed_at FROM lot_trillings lt WHERE lt.company_id = ? AND lt.lot_id = ? ORDER BY performed_at DESC, id DESC LIMIT 1) AS trilled_at`,
    [companyId, lotId, companyId, lotId, companyId, lotId]
  );

  if (row?.packed_at) return "empacado";
  if (row?.roasted_at) return "tostado";
  if (row?.trilled_at) return "trillado";
  return "pergamino";
}

// GET /api/lots/master
async function getLotsMaster(req, res) {
  try {
    const companyId = DEFAULT_COMPANY_ID;
    const search = req.query.search ? `%${req.query.search}%` : null;
    const providerId = req.query.providerId || null;
    const stateFilter = req.query.state || null;
    const lineId = req.query.lineId || null;

    let where = "l.company_id = ?";
    const params = [companyId];

    if (search) {
      where += " AND (l.code LIKE ? OR l.name LIKE ? OR p.name LIKE ? OR l.origin_place LIKE ?)";
      params.push(search, search, search, search);
    }
    if (providerId) {
      where += " AND l.provider_id = ?";
      params.push(providerId);
    }
    if (lineId) {
      where += " AND l.line_id = ?";
      params.push(lineId);
    }

    const [rows] = await pool.query(
      `SELECT
        l.id,
        l.code,
        l.name,
        l.origin_region,
        l.origin_place,
        l.variety,
        l.process,
        l.quantity_kg,
        p.name AS provider_name,
        cl.name AS line_name,
        (SELECT li.destination_id FROM lot_intakes li WHERE li.lot_id = l.id ORDER BY li.received_at DESC, li.id DESC LIMIT 1) AS destination_id,
        (SELECT d.name FROM destinations d WHERE d.id = (SELECT li.destination_id FROM lot_intakes li WHERE li.lot_id = l.id ORDER BY li.received_at DESC, li.id DESC LIMIT 1)) AS destination_name,
        (SELECT lc.total_score FROM lot_cuppings lc WHERE lc.lot_id = l.id ORDER BY lc.evaluated_at DESC, lc.id DESC LIMIT 1) AS last_cupping_score,
        (SELECT lc.is_accepted FROM lot_cuppings lc WHERE lc.lot_id = l.id ORDER BY lc.evaluated_at DESC, lc.id DESC LIMIT 1) AS last_cupping_acceptance
       FROM lots l
       LEFT JOIN providers p ON p.id = l.provider_id
       LEFT JOIN coffee_lines cl ON cl.id = l.line_id
       WHERE ${where}
       ORDER BY l.created_at DESC
      `,
      params
    );

    const result = [];
    for (const lot of rows) {
      const currentState = await computeLotState(companyId, lot.id);
      if (stateFilter && currentState !== stateFilter) continue;
      const currentStock = await getCurrentStockForLot(companyId, lot.id);
      result.push({
        ...lot,
        origin: [lot.origin_region, lot.origin_place].filter(Boolean).join(" - "),
        current_state: currentState,
        current_stock_kg: currentStock,
        quality_status: lot.last_cupping_acceptance ? "Aceptado" : "En revisión",
      });
    }

    res.json(result);
  } catch (err) {
    console.error("Error getLotsMaster:", err);
    res.status(500).json({ message: "Error obteniendo lotes" });
  }
}

module.exports = { getLotsMaster };

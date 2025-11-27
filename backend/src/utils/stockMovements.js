// backend/src/utils/stockMovements.js
// Helper utilities to manage stock movements and current inventory per lot
const pool = require("../config/db");

const MOVEMENT_DIRECTIONS = {
  IN: "IN",
  OUT: "OUT",
};

/**
 * Recalculate resulting_stock_kg for all movements of a lot in chronological order.
 * Returns the final stock after applying all movements.
 */
async function recalculateStockForLot(companyId, lotId) {
  const [movements] = await pool.query(
    `SELECT id, quantity_kg, direction
     FROM stock_movements
     WHERE company_id = ? AND lot_id = ?
     ORDER BY created_at ASC, id ASC`,
    [companyId, lotId]
  );

  let running = 0;

  for (const movement of movements) {
    const qty = Number(movement.quantity_kg || 0);
    if (movement.direction === MOVEMENT_DIRECTIONS.IN) {
      running += qty;
    } else {
      running -= qty;
    }

    await pool.query(
      `UPDATE stock_movements SET resulting_stock_kg = ? WHERE id = ?`,
      [running, movement.id]
    );
  }

  return running;
}

/**
 * Insert a new stock movement and recalculate the resulting stock for the lot.
 */
async function recordMovement({
  companyId,
  lotId,
  movementType,
  relatedEntityType = null,
  relatedEntityId = null,
  quantityKg,
  direction,
  notes = null,
}) {
  if (!lotId || !movementType || !quantityKg || !direction) return null;

  await pool.query(
    `INSERT INTO stock_movements
       (company_id, lot_id, movement_type, related_entity_type, related_entity_id,
        quantity_kg, direction, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      ,
    [
      companyId,
      lotId,
      movementType,
      relatedEntityType,
      relatedEntityId,
      quantityKg,
      direction,
      notes,
    ]
  );

  return recalculateStockForLot(companyId, lotId);
}

async function getCurrentStockForLot(companyId, lotId) {
  const [[row]] = await pool.query(
    `SELECT resulting_stock_kg
     FROM stock_movements
     WHERE company_id = ? AND lot_id = ?
     ORDER BY created_at DESC, id DESC
     LIMIT 1`,
    [companyId, lotId]
  );

  return row ? Number(row.resulting_stock_kg || 0) : 0;
}

module.exports = {
  MOVEMENT_DIRECTIONS,
  recalculateStockForLot,
  recordMovement,
  getCurrentStockForLot,
};

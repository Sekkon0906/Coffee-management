CREATE TABLE IF NOT EXISTS stock_movements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  lot_id INT NOT NULL,
  movement_type ENUM(
    'ingreso_materia_prima',
    'ajuste',
    'salida_a_proceso',
    'entrada_de_proceso',
    'despacho_cliente'
  ) NOT NULL,
  related_entity_type ENUM(
    'lot_intake',
    'lot_trilling',
    'lot_roasting',
    'lot_packaging',
    'lot_dispatch',
    'manual'
  ) NULL,
  related_entity_id INT NULL,
  quantity_kg DECIMAL(10,3) NOT NULL,
  direction ENUM('IN','OUT') NOT NULL,
  resulting_stock_kg DECIMAL(10,3) NULL,
  notes TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_company_lot (company_id, lot_id),
  CONSTRAINT fk_sm_lot FOREIGN KEY (lot_id) REFERENCES lots(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

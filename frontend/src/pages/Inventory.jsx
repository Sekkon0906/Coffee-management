import { useEffect, useState } from "react";
import { getInventoryMovements, getInventorySummary } from "../api/inventory";

export default function Inventory() {
  const [summary, setSummary] = useState(null);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    getInventorySummary().then(setSummary).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    getInventoryMovements(filters)
      .then((data) => setMovements(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters]);

  const formatKg = (value) => Number(value || 0).toFixed(2) + " kg";

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Inventario</h1>
          <p className="text-muted">Kardex operativo de movimientos por lote.</p>
        </div>
      </div>

      <div className="cards-row">
        <div className="card metric-card">
          <span className="card-label">Café pergamino</span>
          <span className="card-value">{summary ? formatKg(summary.kg_pergamino_total) : "-"}</span>
        </div>
        <div className="card metric-card">
          <span className="card-label">Café trillado</span>
          <span className="card-value">{summary ? formatKg(summary.kg_trillado_total) : "-"}</span>
        </div>
        <div className="card metric-card">
          <span className="card-label">Café tostado</span>
          <span className="card-value">{summary ? formatKg(summary.kg_tostado_total) : "-"}</span>
        </div>
        <div className="card metric-card">
          <span className="card-label">Café empacado</span>
          <span className="card-value">{summary ? formatKg(summary.kg_empacado_total) : "-"}</span>
        </div>
        <div className="card metric-card">
          <span className="card-label">Rotación promedio</span>
          <span className="card-value">{summary ? Number(summary.rotacion_promedio_dias || 0).toFixed(1) + " días" : "-"}</span>
        </div>
      </div>

      {summary?.empacado_por_tipo_bolsa && (
        <div className="card">
          <h3>Empacado por tipo de bolsa</h3>
          <div className="table-responsive">
            <table className="table-simple">
              <tbody>
                {Object.entries(summary.empacado_por_tipo_bolsa).map(([bag, kg]) => (
                  <tr key={bag}>
                    <td>{bag}</td>
                    <td>{formatKg(kg)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-title-row">
          <h3>Movimientos</h3>
          <div className="filters-row">
            <select className="input" onChange={(e) => setFilters((p) => ({ ...p, state: e.target.value || undefined }))}>
              <option value="">Estado</option>
              <option value="pergamino">Pergamino</option>
              <option value="trillado">Trillado</option>
              <option value="tostado">Tostado</option>
              <option value="empacado">Empacado</option>
            </select>
          </div>
        </div>
        {loading && <p>Cargando movimientos...</p>}
        <div className="table-responsive">
          <table className="table-simple">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Lote</th>
                <th>Tipo</th>
                <th>Cantidad</th>
                <th>Stock resultante</th>
                <th>Nota</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((m) => (
                <tr key={m.id}>
                  <td>{new Date(m.created_at).toLocaleString()}</td>
                  <td>{m.lot_code}</td>
                  <td>{m.movement_type}</td>
                  <td className={m.direction === "OUT" ? "text-danger" : "text-success"}>
                    {m.direction === "OUT" ? "-" : "+"}
                    {Number(m.quantity_kg || 0).toFixed(2)} kg
                  </td>
                  <td>{Number(m.resulting_stock_kg || 0).toFixed(2)} kg</td>
                  <td>{m.notes || ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

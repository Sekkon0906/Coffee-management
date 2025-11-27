import { useEffect, useMemo, useState } from "react";
import { getInventoryMovements, getInventorySummary } from "../api/inventory";
import { getCoffeeLines } from "../api/adminConfig";
import { getProviders } from "../api/providers";

export default function Inventory() {
  const [summary, setSummary] = useState(null);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const [providers, setProviders] = useState([]);
  const [lines, setLines] = useState([]);

  useEffect(() => {
    getInventorySummary().then(setSummary).catch(console.error);
    getProviders()
      .then((data) => setProviders(Array.isArray(data?.providers) ? data.providers : []))
      .catch(() => {});
    getCoffeeLines().then((data) => setLines(Array.isArray(data) ? data : [])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    getInventoryMovements(filters)
      .then((data) => setMovements(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters]);

  const formatKg = (value) => Number(value || 0).toFixed(2) + " kg";

  const highlightedBagTypes = useMemo(() => {
    if (!summary?.empacado_por_tipo_bolsa) return [];
    return Object.entries(summary.empacado_por_tipo_bolsa)
      .sort((a, b) => Number(b[1] || 0) - Number(a[1] || 0))
      .slice(0, 4);
  }, [summary]);

  return (
    <div className="page inventory-page">
      <div className="page-hero">
        <div>
          <p className="eyebrow">Inventario operativo</p>
          <h1>Inventario</h1>
          <p className="text-muted">Kardex operativo de movimientos por lote.</p>
        </div>
        <div className="pill-row filters-row">
          <select className="input" onChange={(e) => setFilters((p) => ({ ...p, state: e.target.value || undefined }))}>
            <option value="">Estado</option>
            <option value="pergamino">Pergamino</option>
            <option value="trillado">Trillado</option>
            <option value="tostado">Tostado</option>
            <option value="empacado">Empacado</option>
          </select>
          <select className="input" onChange={(e) => setFilters((p) => ({ ...p, providerId: e.target.value || undefined }))}>
            <option value="">Proveedor</option>
            {providers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <select className="input" onChange={(e) => setFilters((p) => ({ ...p, lineId: e.target.value || undefined }))}>
            <option value="">Línea</option>
            {lines.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
          <input
            className="input"
            type="date"
            onChange={(e) => setFilters((p) => ({ ...p, from: e.target.value || undefined }))}
          />
          <input
            className="input"
            type="date"
            onChange={(e) => setFilters((p) => ({ ...p, to: e.target.value || undefined }))}
          />
        </div>
      </div>

      <section className="cards-row responsive-four">
        <div className="card metric-card primary">
          <span className="card-label">Café pergamino</span>
          <span className="card-value">{summary ? formatKg(summary.kg_pergamino_total) : "-"}</span>
          <span className="card-extra">Materia prima en verde</span>
        </div>
        <div className="card metric-card">
          <span className="card-label">Café trillado</span>
          <span className="card-value">{summary ? formatKg(summary.kg_trillado_total) : "-"}</span>
          <span className="card-extra">Listo para tostar</span>
        </div>
        <div className="card metric-card">
          <span className="card-label">Café tostado</span>
          <span className="card-value">{summary ? formatKg(summary.kg_tostado_total) : "-"}</span>
          <span className="card-extra">Inventario tostado</span>
        </div>
        <div className="card metric-card">
          <span className="card-label">Café empacado</span>
          <span className="card-value">{summary ? formatKg(summary.kg_empacado_total) : "-"}</span>
          <span className="card-extra">Listo para despacho</span>
        </div>
        <div className="card metric-card">
          <span className="card-label">Rotación promedio</span>
          <span className="card-value">{summary ? Number(summary.rotacion_promedio_dias || 0).toFixed(1) + " días" : "-"}</span>
          <span className="card-extra">Tiempo desde ingreso a salida</span>
        </div>
      </section>

      {summary?.empacado_por_tipo_bolsa && (
        <div className="card">
          <div className="card-title-row">
            <h3>Empacado por tipo de bolsa</h3>
            <span className="card-subtitle">Top presentaciones recientes</span>
          </div>
          <div className="pill-row">
            {highlightedBagTypes.map(([bag, kg]) => (
              <span key={bag} className="chip chip-soft">
                {bag}: {formatKg(kg)}
              </span>
            ))}
          </div>
          <div className="table-responsive">
            <table className="table-simple compact">
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
          <span className="card-subtitle">Kardex consolidado</span>
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
                  <td>
                    <span className="chip chip-soft">{m.movement_type}</span>
                  </td>
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

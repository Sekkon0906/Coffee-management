import { useEffect, useMemo, useState } from "react";
import { getLotsMaster } from "../api/lotsMaster";
import { openPdf } from "../api/traceability";

export default function LotsMaster() {
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ search: "", state: "", providerId: "", lineId: "" });

  useEffect(() => {
    setLoading(true);
    getLotsMaster({
      search: filters.search || undefined,
      state: filters.state || undefined,
      providerId: filters.providerId || undefined,
      lineId: filters.lineId || undefined,
    })
      .then((data) => setLots(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [filters.search, filters.state, filters.providerId, filters.lineId]);

  const handleSearch = (evt) => {
    setFilters((prev) => ({ ...prev, search: evt.target.value }));
  };

  const filteredLots = useMemo(() => lots, [lots]);

  const renderActions = (lot) => (
    <div className="actions">
      <button className="btn btn-secondary" onClick={() => (window.location.href = `/traceability?lotId=${lot.id}`)}>
        Ver trazabilidad
      </button>
      <button className="btn" onClick={() => openPdf(lot.id, "full")}>PDF</button>
    </div>
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Lotes de café</h1>
          <p className="text-muted">Vista maestra de todos los lotes y su estado actual.</p>
        </div>
        <div className="filters-row">
          <input
            className="input"
            placeholder="Buscar por código, nombre, proveedor u origen"
            value={filters.search}
            onChange={handleSearch}
          />
          <select
            className="input"
            value={filters.state}
            onChange={(e) => setFilters((p) => ({ ...p, state: e.target.value }))}
          >
            <option value="">Estado</option>
            <option value="pergamino">Pergamino</option>
            <option value="trillado">Trillado</option>
            <option value="tostado">Tostado</option>
            <option value="empacado">Empacado</option>
          </select>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <p>Cargando lotes...</p>}

      <div className="card">
        <div className="table-responsive">
          <table className="table-simple">
            <thead>
              <tr>
                <th>Código</th>
                <th>Proveedor</th>
                <th>Origen</th>
                <th>Variedad</th>
                <th>Proceso</th>
                <th>Kg iniciales</th>
                <th>Kg actuales</th>
                <th>Estado</th>
                <th>Puntaje taza</th>
                <th>Línea / Destino</th>
                <th>Calidad</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredLots.map((lot) => (
                <tr key={lot.id}>
                  <td>{lot.code}</td>
                  <td>{lot.provider_name || "-"}</td>
                  <td>{lot.origin || "-"}</td>
                  <td>{lot.variety || "-"}</td>
                  <td>{lot.process || "-"}</td>
                  <td>{Number(lot.quantity_kg || 0).toFixed(2)}</td>
                  <td>{Number(lot.current_stock_kg || 0).toFixed(2)}</td>
                  <td>
                    <span className="badge">{lot.current_state}</span>
                  </td>
                  <td>{lot.last_cupping_score ? Number(lot.last_cupping_score).toFixed(1) : "-"}</td>
                  <td>
                    <div className="stacked">
                      <span>{lot.line_name || "-"}</span>
                      <small className="text-muted">{lot.destination_name || "Sin destino"}</small>
                    </div>
                  </td>
                  <td>{lot.quality_status}</td>
                  <td>{renderActions(lot)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

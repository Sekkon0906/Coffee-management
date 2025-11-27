import { useEffect, useMemo, useState } from "react";
import { getLotsMaster } from "../api/lotsMaster";
import { openPdf } from "../api/traceability";
import { getCoffeeLines } from "../api/adminConfig";
import { getProviders } from "../api/providers";

export default function LotsMaster() {
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ search: "", state: "", providerId: "", lineId: "" });
  const [providers, setProviders] = useState([]);
  const [lines, setLines] = useState([]);
  const [selectedLot, setSelectedLot] = useState(null);

  useEffect(() => {
    setLoading(true);
    getLotsMaster({
      search: filters.search || undefined,
      state: filters.state || undefined,
      providerId: filters.providerId || undefined,
      lineId: filters.lineId || undefined,
    })
      .then((data) => {
        const safeData = Array.isArray(data) ? data : [];
        setLots(safeData);
        if (!selectedLot && safeData.length > 0) setSelectedLot(safeData[0]);
      })
      .then((data) => setLots(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [filters.search, filters.state, filters.providerId, filters.lineId]);

  useEffect(() => {
    getCoffeeLines().then((data) => setLines(Array.isArray(data) ? data : [])).catch(() => {});
    getProviders()
      .then((data) => setProviders(Array.isArray(data?.providers) ? data.providers : []))
      .catch(() => {});
  }, []);

  const handleSearch = (evt) => {
    setFilters((prev) => ({ ...prev, search: evt.target.value }));
  };

  const filteredLots = useMemo(() => lots, [lots]);

  const totals = useMemo(() => {
    const totalStock = filteredLots.reduce((sum, lot) => sum + Number(lot.current_stock_kg || 0), 0);
    const avgScore =
      filteredLots.length > 0
        ? filteredLots.reduce((sum, lot) => sum + Number(lot.last_cupping_score || 0), 0) / filteredLots.length
        : 0;
    const stateCount = filteredLots.reduce((acc, lot) => {
      acc[lot.current_state] = (acc[lot.current_state] || 0) + 1;
      return acc;
    }, {});
    return { totalStock, avgScore, stateCount };
  }, [filteredLots]);

  const renderActions = (lot) => (
    <div className="actions inline-actions">
      <button className="btn btn-secondary" onClick={() => (window.location.href = `/traceability?lotId=${lot.id}`)}>
        Ver trazabilidad
      </button>
      <button className="btn btn-ghost" onClick={() => openPdf(lot.id, "full")}>PDF</button>
  const renderActions = (lot) => (
    <div className="actions">
      <button className="btn btn-secondary" onClick={() => (window.location.href = `/traceability?lotId=${lot.id}`)}>
        Ver trazabilidad
      </button>
      <button className="btn" onClick={() => openPdf(lot.id, "full")}>PDF</button>
    </div>
  );

  return (
    <div className="page lots-page">
      <div className="page-hero">
        <div>
          <p className="eyebrow">Centro de lotes</p>
          <h1>Lotes de café</h1>
          <p className="text-muted">Vista maestra de todos los lotes y su estado actual.</p>
        </div>
        <div className="filters-row pill-row">
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
          <select
            className="input"
            value={filters.providerId}
            onChange={(e) => setFilters((p) => ({ ...p, providerId: e.target.value }))}
          >
            <option value="">Proveedor</option>
            {providers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <select
            className="input"
            value={filters.lineId}
            onChange={(e) => setFilters((p) => ({ ...p, lineId: e.target.value }))}
          >
            <option value="">Línea</option>
            {lines.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <section className="cards-row responsive-four">
        <div className="card metric-card primary">
          <span className="card-label">Kg actuales en bodega</span>
          <span className="card-value">{totals.totalStock.toFixed(2)} kg</span>
          <span className="card-extra">Basado en movimientos</span>
        </div>
        <div className="card metric-card">
          <span className="card-label">Lotes activos</span>
          <span className="card-value">{filteredLots.length}</span>
          <span className="card-extra">Filtrados por criterios</span>
        </div>
        <div className="card metric-card">
          <span className="card-label">Puntaje promedio</span>
          <span className="card-value">{totals.avgScore.toFixed(1)}</span>
          <span className="card-extra">Última cata registrada</span>
        </div>
        <div className="card metric-card">
          <span className="card-label">Estados</span>
          <div className="chips-row">
            {Object.entries(totals.stateCount).map(([state, count]) => (
              <span key={state} className={`chip state-${state}`}>
                {state} · {count}
              </span>
            ))}
          </div>
        </div>
      </section>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <p>Cargando lotes...</p>}

      <div className="grid-2-columns">
        <div className="card">
          <div className="table-responsive">
            <table className="table-simple">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Proveedor</th>
                  <th>Origen</th>
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
                  <tr
                    key={lot.id}
                    className={selectedLot?.id === lot.id ? "row-active" : ""}
                    onClick={() => setSelectedLot(lot)}
                  >
                    <td>
                      <div className="stacked">
                        <strong>{lot.code}</strong>
                        <small className="text-muted">{lot.variety || "-"}</small>
                      </div>
                    </td>
                    <td>{lot.provider_name || "-"}</td>
                    <td>{lot.origin || "-"}</td>
                    <td>{Number(lot.quantity_kg || 0).toFixed(2)}</td>
                    <td>{Number(lot.current_stock_kg || 0).toFixed(2)}</td>
                    <td>
                      <span className={`badge state-${lot.current_state}`}>{lot.current_state}</span>
                    </td>
                    <td>{lot.last_cupping_score ? Number(lot.last_cupping_score).toFixed(1) : "-"}</td>
                    <td>
                      <div className="stacked">
                        <span>{lot.line_name || "-"}</span>
                        <small className="text-muted">{lot.destination_name || "Sin destino"}</small>
                      </div>
                    </td>
                    <td>
                      <span className={`chip ${lot.quality_status === "Aceptado" ? "chip-success" : "chip-warning"}`}>
                        {lot.quality_status}
                      </span>
                    </td>
                    <td>{renderActions(lot)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card sticky">
          <h3>Detalle del lote</h3>
          {selectedLot ? (
            <div className="detail-grid">
              <div className="detail-block">
                <p className="eyebrow">Identidad</p>
                <h4>{selectedLot.code}</h4>
                <p className="text-muted">{selectedLot.name || "Sin nombre"}</p>
                <p>
                  Proveedor: <strong>{selectedLot.provider_name || "-"}</strong>
                </p>
                <p>
                  Origen: <strong>{selectedLot.origin || "-"}</strong>
                </p>
              </div>
              <div className="detail-block">
                <p className="eyebrow">Proceso</p>
                <p>Variedad: {selectedLot.variety || "-"}</p>
                <p>Beneficio: {selectedLot.process || "-"}</p>
                <p>Estado actual: {selectedLot.current_state}</p>
                <p>Línea: {selectedLot.line_name || "-"}</p>
                <p>Destino: {selectedLot.destination_name || "Sin destino"}</p>
              </div>
              <div className="detail-block">
                <p className="eyebrow">Inventario</p>
                <p>Kg iniciales: {Number(selectedLot.quantity_kg || 0).toFixed(2)}</p>
                <p>Kg actuales: {Number(selectedLot.current_stock_kg || 0).toFixed(2)}</p>
                <p>Puntaje taza: {selectedLot.last_cupping_score ? Number(selectedLot.last_cupping_score).toFixed(1) : "-"}</p>
              </div>
              <div className="detail-block">
                <p className="eyebrow">Acciones</p>
                {renderActions(selectedLot)}
              </div>
            </div>
          ) : (
            <p className="text-muted">Selecciona un lote para ver su ficha.</p>
          )}
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

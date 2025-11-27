import { useEffect, useState } from "react";
import {
  getTopLots,
  getTopProviders,
  getProviderHistory,
  getCuppingDetail,
} from "../api/quality";

export default function QualityDashboard() {
  const [topLots, setTopLots] = useState([]);
  const [topProviders, setTopProviders] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [selectedCupping, setSelectedCupping] = useState(null);
  const [metrics, setMetrics] = useState({});

  useEffect(() => {
    getTopLots(5)
      .then((data) => {
        setTopLots(data);
        const bestScore = data.length > 0 ? Number(data[0].total_score || 0) : 0;
        const accepted = data.filter((d) => d.is_accepted).length;
        setMetrics((prev) => ({ ...prev, bestScore, accepted }));
      })
      .catch(console.error);
    getTopProviders(5)
      .then((data) => {
        setTopProviders(data);
        const avgProviders =
          data.length > 0 ? data.reduce((sum, p) => sum + Number(p.puntaje_promedio || 0), 0) / data.length : 0;
        setMetrics((prev) => ({ ...prev, avgProviders }));
      })
      .catch(console.error);
  }, []);

  const handleProviderSelect = (provider) => {
    setSelectedProvider(provider);
    if (provider?.id) {
      getProviderHistory(provider.id).then(setHistory).catch(console.error);
    }
  };

  const handleCuppingClick = (cuppingId) => {
    getCuppingDetail(cuppingId).then(setSelectedCupping).catch(console.error);
  };

  const parsedAttributes = (() => {
    if (!selectedCupping?.attributes_json) return {};
    try {
      return typeof selectedCupping.attributes_json === "string"
        ? JSON.parse(selectedCupping.attributes_json)
        : selectedCupping.attributes_json;
    } catch (e) {
      return {};
    }
  })();

  return (
    <div className="page quality-page">
      <div className="page-hero">
        <div>
          <p className="eyebrow">Sensorial</p>
          <h1>Calidad de taza</h1>
          <p className="text-muted">Ranking y seguimiento de evaluaciones sensoriales.</p>
        </div>
      </div>

      <section className="cards-row responsive-four">
        <div className="card metric-card primary">
          <span className="card-label">Mejor puntaje</span>
          <span className="card-value">{metrics.bestScore?.toFixed?.(1) || "-"}</span>
          <span className="card-extra">Lote top reciente</span>
        </div>
        <div className="card metric-card">
          <span className="card-label">Catas aceptadas</span>
          <span className="card-value">{metrics.accepted ?? 0}</span>
          <span className="card-extra">Últimos registros</span>
        </div>
        <div className="card metric-card">
          <span className="card-label">Promedio proveedores</span>
          <span className="card-value">{metrics.avgProviders?.toFixed?.(1) || "-"}</span>
          <span className="card-extra">Puntaje promedio</span>
        </div>
        <div className="card metric-card">
          <span className="card-label">Proveedores evaluados</span>
          <span className="card-value">{topProviders.length}</span>
          <span className="card-extra">Top ranking</span>
        </div>
      </section>

      <div className="grid-2">
        <div className="card">
          <div className="card-title-row">
            <h3>Top lotes recientes</h3>
            <span className="card-subtitle">Haz clic para ver detalle</span>
          </div>
          <div className="table-responsive">
            <table className="table-simple">
              <thead>
                <tr>
                  <th>Lote</th>
                  <th>Proveedor</th>
                  <th>Puntaje</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {topLots.map((lot) => (
                  <tr key={lot.cupping_id} onClick={() => handleCuppingClick(lot.cupping_id)}>
                    <td>{lot.lot_code}</td>
                    <td>{lot.provider_name || "-"}</td>
                    <td>{Number(lot.total_score || 0).toFixed(1)}</td>
                    <td>
                      <span className={`chip ${lot.is_accepted ? "chip-success" : "chip-warning"}`}>
                        {lot.is_accepted ? "Aceptado" : "En revisión"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-title-row">
            <h3>Top proveedores</h3>
            <span className="card-subtitle">Selecciona para ver histórico</span>
          </div>
          <div className="table-responsive">
            <table className="table-simple">
              <thead>
                <tr>
                  <th>Proveedor</th>
                  <th>Lotes evaluados</th>
                  <th>Puntaje promedio</th>
                </tr>
              </thead>
              <tbody>
                {topProviders.map((p) => (
                  <tr key={p.id} onClick={() => handleProviderSelect(p)}>
                    <td>{p.name}</td>
                    <td>{p.lotes_evaluados}</td>
                    <td>{Number(p.puntaje_promedio || 0).toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedProvider && (
        <div className="card">
          <div className="card-title-row">
            <h3>Histórico de {selectedProvider.name}</h3>
            <span className="card-subtitle">Resultados cronológicos</span>
          </div>
          <div className="table-responsive">
            <table className="table-simple">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Lote</th>
                  <th>Puntaje</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id}>
                    <td>{new Date(h.evaluated_at).toLocaleDateString()}</td>
                    <td>{h.lot_code}</td>
                    <td>{Number(h.total_score || 0).toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedCupping && (
        <div className="card">
          <div className="card-title-row">
            <h3>Detalle de cata: lote {selectedCupping.lot_code}</h3>
            <span className="card-subtitle">Evaluado por {selectedCupping.evaluated_by || "no registrado"}</span>
          </div>
          <div className="detail-grid">
            <div className="detail-block">
              <p>Puntaje total: {selectedCupping.total_score}</p>
              <p>Evaluado el: {new Date(selectedCupping.evaluated_at).toLocaleDateString()}</p>
              <p>Notas: {selectedCupping.notes || "Sin notas"}</p>
            </div>
            <div className="detail-block">
              <p className="eyebrow">Criterios sensoriales</p>
              <div className="pill-row">
                {Object.entries(parsedAttributes).map(([key, value]) => (
                  <span key={key} className="chip chip-soft">
                    {key}: {value}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

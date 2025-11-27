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

  useEffect(() => {
    getTopLots(5).then(setTopLots).catch(console.error);
    getTopProviders(5).then(setTopProviders).catch(console.error);
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

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Calidad de taza</h1>
          <p className="text-muted">Ranking y seguimiento de evaluaciones sensoriales.</p>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3>Top lotes recientes</h3>
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
                    <td>{lot.is_accepted ? "Aceptado" : "En revisión"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3>Top proveedores</h3>
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
          </div>
          <div className="detail-grid">
            <div className="detail-block">
              <p>Puntaje total: {selectedCupping.total_score}</p>
              <p>Evaluado el: {new Date(selectedCupping.evaluated_at).toLocaleDateString()}</p>
              <p>Notas: {selectedCupping.notes || "Sin notas"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

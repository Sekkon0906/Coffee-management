import { useEffect, useState } from "react";
import { getProviders } from "../api/providers";
import ProviderFormPanel from "../components/ProviderFormPanel";

export default function Providers() {
  const [providers, setProviders] = useState([]);
  const [kpis, setKpis] = useState({});
  const [loading, setLoading] = useState(false);
  const [openForm, setOpenForm] = useState(false);

  useEffect(() => {
    setLoading(true);
    getProviders()
      .then((data) => {
        setProviders(Array.isArray(data.providers) ? data.providers : []);
        setKpis(data.kpis || {});
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Proveedores</h1>
          <p className="text-muted">Gestión de fincas y contactos.</p>
        </div>
        <div className="actions">
          <button className="btn btn-primary" onClick={() => setOpenForm(true)}>
            Agregar proveedor
          </button>
        </div>
      </div>

      <div className="cards-row">
        <div className="card metric-card">
          <span className="card-label">Proveedores activos</span>
          <span className="card-value">{kpis.activos ?? "-"}</span>
        </div>
        <div className="card metric-card">
          <span className="card-label">Kg comprados 90d</span>
          <span className="card-value">{kpis.kg_ultimos_90 ?? "-"}</span>
        </div>
        <div className="card metric-card">
          <span className="card-label">Puntaje promedio</span>
          <span className="card-value">{kpis.puntaje_promedio ?? "-"}</span>
        </div>
      </div>

      {loading && <p>Cargando proveedores...</p>}

      <div className="card">
        <div className="table-responsive">
          <table className="table-simple">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Contacto</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th>Región</th>
                <th>Municipio</th>
              </tr>
            </thead>
            <tbody>
              {providers.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.contact_name || "-"}</td>
                  <td>{p.phone || "-"}</td>
                  <td>{p.email || "-"}</td>
                  <td>{p.region || "-"}</td>
                  <td>{p.municipality || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {openForm && <ProviderFormPanel open={openForm} onClose={() => setOpenForm(false)} onSaved={() => window.location.reload()} />}
    </div>
  );
}

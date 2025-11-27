import { useEffect, useState } from "react";
import { getProviders } from "../api/providers";
import ProviderFormPanel from "../components/ProviderFormPanel";

export default function Providers() {
  const [providers, setProviders] = useState([]);
  const [kpis, setKpis] = useState({});
  const [loading, setLoading] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [search, setSearch] = useState("");

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

  const filteredProviders = providers.filter((p) => {
    if (!search) return true;
    const text = `${p.name} ${p.region} ${p.municipality} ${p.contact_name || ""}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <div className="page providers-page">
      <div className="page-hero">
        <div>
          <p className="eyebrow">Red de abastecimiento</p>
          <h1>Proveedores</h1>
          <p className="text-muted">Gestión de fincas y contactos.</p>
        </div>
        <div className="actions">
          <button className="btn btn-primary" onClick={() => setOpenForm(true)}>
            Agregar proveedor
          </button>
        </div>
      </div>

      <div className="cards-row responsive-four">
        <div className="card metric-card primary">
          <span className="card-label">Proveedores activos</span>
          <span className="card-value">{kpis.activos ?? "-"}</span>
          <span className="card-extra">Con registros recientes</span>
        </div>
        <div className="card metric-card">
          <span className="card-label">Kg comprados 90d</span>
          <span className="card-value">{kpis.kg_ultimos_90 ?? "-"}</span>
          <span className="card-extra">Ingreso de materia prima</span>
        </div>
        <div className="card metric-card">
          <span className="card-label">Puntaje promedio</span>
          <span className="card-value">{kpis.puntaje_promedio ?? "-"}</span>
          <span className="card-extra">Calidad histórica</span>
        </div>
        <div className="card metric-card">
          <span className="card-label">Total de registros</span>
          <span className="card-value">{providers.length}</span>
          <span className="card-extra">Incluye inactivos</span>
        </div>
      </div>

      <div className="card">
        <div className="card-title-row">
          <h3>Directorio de proveedores</h3>
          <div className="filters-row">
            <input
              className="input"
              placeholder="Buscar por nombre, región o contacto"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading && <p>Cargando proveedores...</p>}

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
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filteredProviders.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="stacked">
                      <strong>{p.name}</strong>
                      <small className="text-muted">{p.contact_name || "Sin contacto"}</small>
                    </div>
                  </td>
                  <td>{p.contact_name || "-"}</td>
                  <td>{p.phone || "-"}</td>
                  <td>{p.email || "-"}</td>
                  <td>{p.region || "-"}</td>
                  <td>{p.municipality || "-"}</td>
                  <td>
                    <span className={`chip ${p.is_active === 0 ? "chip-warning" : "chip-success"}`}>
                      {p.is_active === 0 ? "Inactivo" : "Activo"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {openForm && (
        <ProviderFormPanel open={openForm} onClose={() => setOpenForm(false)} onSaved={() => window.location.reload()} />
      )}
    </div>
  );
}

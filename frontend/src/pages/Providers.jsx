// frontend/src/pages/Providers.jsx
import { useEffect, useMemo, useState } from "react";
import { getProviders, saveProvider } from "../api/providers";

// ============================================
// Modal genérico simple
// ============================================
function ProvidersModal({ title, onClose, children }) {
  return (
    <div className="modal-backdrop">
      <div className="modal-panel">
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="btn btn-xs btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

// ============================================
// Formulario proveedor (crear / editar)
// ============================================
function ProviderForm({ initialData, onSubmit, submitting }) {
  const [form, setForm] = useState(
    initialData || {
      name: "",
      contact_name: "",
      phone: "",
      email: "",
      region: "",
      municipality: "",
      active: true,
    }
  );

  const handleChange = (field) => (e) => {
    const value =
      field === "active" ? e.target.value === "1" : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="form-grid">
      <div className="form-row">
        <label>Nombre proveedor / finca</label>
        <input
          className="input"
          required
          value={form.name}
          onChange={handleChange("name")}
        />
      </div>

      <div className="form-row">
        <label>Contacto</label>
        <input
          className="input"
          value={form.contact_name || ""}
          onChange={handleChange("contact_name")}
        />
      </div>

      <div className="form-row">
        <label>Teléfono</label>
        <input
          className="input"
          value={form.phone || ""}
          onChange={handleChange("phone")}
        />
      </div>

      <div className="form-row">
        <label>Email</label>
        <input
          className="input"
          type="email"
          value={form.email || ""}
          onChange={handleChange("email")}
        />
      </div>

      <div className="form-row">
        <label>Región</label>
        <input
          className="input"
          value={form.region || ""}
          onChange={handleChange("region")}
        />
      </div>

      <div className="form-row">
        <label>Municipio</label>
        <input
          className="input"
          value={form.municipality || ""}
          onChange={handleChange("municipality")}
        />
      </div>

      <div className="form-row">
        <label>Estado</label>
        <select
          className="input"
          value={form.active ? "1" : "0"}
          onChange={handleChange("active")}
        >
          <option value="1">Activo</option>
          <option value="0">Inactivo</option>
        </select>
      </div>

      <div className="form-actions">
        <button
          className="btn btn-primary"
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Guardando..." : "Guardar proveedor"}
        </button>
      </div>
    </form>
  );
}

// ============================================
// Página principal de Proveedores
// ============================================
export default function ProvidersPage() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    search: "",
    region: "",
    activeOnly: false,
  });

  const [modalState, setModalState] = useState({
    open: false,
    mode: "create", // "create" | "edit"
    provider: null,
  });

  // ================================
  // Carga inicial
  // ================================
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getProviders();
        setProviders(Array.isArray(data) ? data : data?.rows || []);
      } catch (err) {
        console.error("Error cargando proveedores:", err);
        setError("Error cargando proveedores");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // ================================
  // KPIs
  // ================================
  const kpis = useMemo(() => {
    if (!providers.length) {
      return {
        activeCount: 0,
        totalKgLast90d: 0,
        avgScoreGlobal: null,
      };
    }

    let activeCount = 0;
    let totalKg = 0;
    let scoreSum = 0;
    let scoreCount = 0;

    providers.forEach((p) => {
      if (p.active || p.active === 1) activeCount += 1;
      if (p.total_kg_last_90d) {
        totalKg += Number(p.total_kg_last_90d);
      }
      if (p.avg_cupping_score != null) {
        scoreSum += Number(p.avg_cupping_score);
        scoreCount += 1;
      }
    });

    const avgScoreGlobal =
      scoreCount > 0 ? scoreSum / scoreCount : null;

    return {
      activeCount,
      totalKgLast90d: totalKg,
      avgScoreGlobal,
    };
  }, [providers]);

  // ================================
  // Filtros + búsqueda
  // ================================
  const filteredProviders = useMemo(() => {
    const text = filters.search.toLowerCase();

    return providers.filter((p) => {
      if (filters.activeOnly && !(p.active || p.active === 1)) {
        return false;
      }

      if (filters.region && p.region !== filters.region) {
        return false;
      }

      if (text) {
        const blob = [
          p.name,
          p.contact_name,
          p.phone,
          p.email,
          p.region,
          p.municipality,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!blob.includes(text)) return false;
      }

      return true;
    });
  }, [providers, filters]);

  // Para el filtro de región sacamos las distintas regiones
  const availableRegions = useMemo(() => {
    const set = new Set();
    providers.forEach((p) => {
      if (p.region) set.add(p.region);
    });
    return Array.from(set);
  }, [providers]);

  // ================================
  // Handlers acciones
  // ================================
  const openCreateModal = () => {
    setModalState({
      open: true,
      mode: "create",
      provider: null,
    });
  };

  const openEditModal = (provider) => {
    setModalState({
      open: true,
      mode: "edit",
      provider,
    });
  };

  const closeModal = () => {
    setModalState({
      open: false,
      mode: "create",
      provider: null,
    });
  };

  const handleSaveProvider = async (formData) => {
    try {
      setSaving(true);
      setError(null);

      const payload = {
        ...formData,
      };

      if (modalState.mode === "edit" && modalState.provider?.id) {
        payload.id = modalState.provider.id;
      }

      const resp = await saveProvider(payload);

      // Si el backend devuelve el proveedor actualizado, úsalo;
      // si no, recarga la lista completa.
      const updated = resp?.data || resp;

      if (updated && updated.id) {
        setProviders((prev) => {
          const exists = prev.some((p) => p.id === updated.id);
          if (!exists) return [...prev, updated];
          return prev.map((p) => (p.id === updated.id ? updated : p));
        });
      } else {
        // fallback: recargar todo
        try {
          const data = await getProviders();
          setProviders(Array.isArray(data) ? data : data?.rows || []);
        } catch (err) {
          console.error("Error recargando proveedores:", err);
        }
      }

      closeModal();
    } catch (err) {
      console.error("Error guardando proveedor:", err);
      setError("Error guardando proveedor");
    } finally {
      setSaving(false);
    }
  };

  const handleGlobalAddLot = () => {
    // Navegación genérica a pantalla de creación de lote
    // Ajusta la ruta según tu router.
    window.location.href = "/lots/new";
  };

  const handleAddLotForProvider = (provider) => {
    // Misma idea, pero enviando el providerId como query param
    window.location.href = `/lots/new?providerId=${provider.id}`;
  };

  // ================================
  // Render
  // ================================
  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div>
          <h1>Proveedores</h1>
          <p>
            Gestión de proveedores / fincas, compras de materia prima y
            desempeño en calidad de taza.
          </p>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn btn-secondary"
            onClick={handleGlobalAddLot}
          >
            Agregar materia prima
          </button>
          <button
            className="btn btn-primary"
            onClick={openCreateModal}
          >
            Agregar proveedor
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-grid">
          {/* ======================== */}
          {/* KPIs */}
          {/* ======================== */}
          <section className="card">
            <h2>Resumen de proveedores</h2>

            {loading ? (
              <p>Cargando...</p>
            ) : (
              <div className="kpi-grid">
                <div className="kpi-card">
                  <p className="kpi-label">Proveedores activos</p>
                  <p className="kpi-value">{kpis.activeCount}</p>
                </div>

                <div className="kpi-card">
                  <p className="kpi-label">
                    Kg comprados últimos 90 días
                  </p>
                  <p className="kpi-value">
                    {kpis.totalKgLast90d.toLocaleString("es-CO", {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1,
                    })}
                  </p>
                </div>

                <div className="kpi-card">
                  <p className="kpi-label">
                    Puntaje promedio histórico
                  </p>
                  <p className="kpi-value">
                    {kpis.avgScoreGlobal != null
                      ? kpis.avgScoreGlobal.toFixed(2)
                      : "-"}
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* ======================== */}
          {/* Filtros + lista */}
          {/* ======================== */}
          <section className="card">
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
                marginBottom: 12,
                alignItems: "flex-end",
              }}
            >
              <div style={{ flex: 1, minWidth: 220 }}>
                <label className="label-small">Buscar</label>
                <input
                  className="input"
                  placeholder="Nombre, contacto, región..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((f) => ({
                      ...f,
                      search: e.target.value,
                    }))
                  }
                />
              </div>

              <div style={{ width: 200 }}>
                <label className="label-small">Región</label>
                <select
                  className="input"
                  value={filters.region}
                  onChange={(e) =>
                    setFilters((f) => ({
                      ...f,
                      region: e.target.value,
                    }))
                  }
                >
                  <option value="">Todas</option>
                  {availableRegions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", alignItems: "center" }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: "0.85rem",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={filters.activeOnly}
                    onChange={(e) =>
                      setFilters((f) => ({
                        ...f,
                        activeOnly: e.target.checked,
                      }))
                    }
                  />
                  Solo activos
                </label>
              </div>
            </div>

            {error && (
              <p style={{ color: "red", marginBottom: 8 }}>{error}</p>
            )}

            {loading ? (
              <p>Cargando proveedores...</p>
            ) : filteredProviders.length === 0 ? (
              <p>No se encontraron proveedores con los filtros actuales.</p>
            ) : (
              <table className="table-simple">
                <thead>
                  <tr>
                    <th>Proveedor / finca</th>
                    <th>Contacto</th>
                    <th>Teléfono</th>
                    <th>Email</th>
                    <th>Región</th>
                    <th>Municipio</th>
                    <th>Kg últimos 90 días</th>
                    <th>Puntaje promedio</th>
                    <th>Estado</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProviders.map((p) => (
                    <tr key={p.id}>
                      <td>{p.name || "-"}</td>
                      <td>{p.contact_name || "-"}</td>
                      <td>{p.phone || "-"}</td>
                      <td>{p.email || "-"}</td>
                      <td>{p.region || "-"}</td>
                      <td>{p.municipality || "-"}</td>
                      <td>
                        {p.total_kg_last_90d != null
                          ? Number(
                              p.total_kg_last_90d
                            ).toLocaleString("es-CO", {
                              minimumFractionDigits: 1,
                              maximumFractionDigits: 1,
                            })
                          : "-"}
                      </td>
                      <td>
                        {p.avg_cupping_score != null
                          ? Number(p.avg_cupping_score).toFixed(2)
                          : "-"}
                      </td>
                      <td>
                        {p.active || p.active === 1 ? (
                          <span className="badge badge-done">Activo</span>
                        ) : (
                          <span className="badge badge-pending">
                            Inactivo
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div
                          style={{
                            display: "flex",
                            gap: 6,
                            justifyContent: "flex-end",
                          }}
                        >
                          <button
                            className="btn btn-secondary btn-xs"
                            onClick={() => openEditModal(p)}
                          >
                            Editar
                          </button>
                          <button
                            className="btn btn-primary btn-xs"
                            onClick={() => handleAddLotForProvider(p)}
                          >
                            Agregar materia prima
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </div>

        {/* Modal crear / editar proveedor */}
        {modalState.open && (
          <ProvidersModal
            title={
              modalState.mode === "create"
                ? "Agregar proveedor"
                : `Editar proveedor – ${modalState.provider?.name || ""}`
            }
            onClose={closeModal}
          >
            <ProviderForm
              initialData={modalState.provider}
              onSubmit={handleSaveProvider}
              submitting={saving}
            />
          </ProvidersModal>
        )}
      </main>
    </div>
  );
}

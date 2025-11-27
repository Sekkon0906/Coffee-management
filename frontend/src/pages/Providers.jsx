// src/pages/Providers.jsx
import { useEffect, useMemo, useState } from "react";
import {
  getProviders,
  createProvider,
  updateProvider,
  deleteProvider,
} from "../api/providers";

export default function Providers() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // Panel lateral
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const emptyForm = {
    name: "",
    contact_name: "",
    phone: "",
    email: "",
    region: "",
    municipality: "",
  };

  const [form, setForm] = useState(emptyForm);

  // ======================= DATA LOAD =======================
  const loadProviders = async () => {
    try {
      setLoading(true);
      const data = await getProviders();
      setProviders(data);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los proveedores.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProviders();
  }, []);

  // ======================= SEARCH FILTER =======================
  const filteredProviders = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return providers;

    return providers.filter((p) =>
      [
        p.name,
        p.contact_name,
        p.phone,
        p.email,
        p.region,
        p.municipality,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [search, providers]);

  // ======================= PANEL LATERAL =======================
  const openCreatePanel = () => {
    setEditingProvider(null);
    setForm(emptyForm);
    setPanelOpen(true);
  };

  const openEditPanel = (provider) => {
    setEditingProvider(provider);
    setForm({ ...provider });
    setPanelOpen(true);
  };

  const closePanel = () => {
    if (saving) return;
    setPanelOpen(false);
    setEditingProvider(null);
    setForm(emptyForm);
    setFormError("");
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");

    const payload = {
      ...form,
      name: form.name.trim(),
    };

    if (!payload.name) {
      setFormError("El nombre del proveedor es obligatorio.");
      setSaving(false);
      return;
    }

    try {
      if (editingProvider) {
        await updateProvider(editingProvider.id, payload);
      } else {
        await createProvider(payload);
      }
      await loadProviders();
      closePanel();
    } catch (err) {
      console.error(err);
      setFormError("Error guardando proveedor.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (provider) => {
    const ok = window.confirm(
      `¿Eliminar el proveedor "${provider.name}"? Esta acción no se puede deshacer.`
    );
    if (!ok) return;

    try {
      await deleteProvider(provider.id);
      await loadProviders();
    } catch (err) {
      console.error(err);
      alert("No se pudo eliminar el proveedor.");
    }
  };

  // ============================================================
  // =======================   RENDER   ==========================
  // ============================================================

  return (
    <div className="providers-page">
      {/* HEADER / KPI */}
      <section className="providers-header">
        <h1>Proveedores registrados</h1>
        <p>Total de caficultores y distribuidores activos en el sistema.</p>

        <div className="kpi">{providers.length}</div>

        <button className="btn-add-provider" onClick={openCreatePanel}>
          Agregar proveedor
        </button>
      </section>

      {/* LISTADO */}
      <section className="providers-table-container">
        <h2>Listado de proveedores</h2>
        <p>Origen, contacto y región de cada proveedor.</p>

        <p>Total: {providers.length}</p>

        <div className="providers-search">
          <input
            placeholder="Buscar por nombre, correo, región..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <p>Cargando...</p>
        ) : filteredProviders.length === 0 ? (
          <p>No hay proveedores registrados todavía.</p>
        ) : (
          <table className="providers-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Contacto</th>
                <th>Teléfono</th>
                <th>Correo</th>
                <th>Región</th>
                <th>Municipio</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProviders.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.contact_name || "-"}</td>
                  <td>{p.phone || "-"}</td>
                  <td>{p.email || "-"}</td>
                  <td>{p.region || "-"}</td>
                  <td>{p.municipality || "-"}</td>
                  <td>
                    <div className="table-actions">
                      <button className="btn-edit" onClick={() => openEditPanel(p)}>
                        Editar
                      </button>
                      <button className="btn-delete" onClick={() => handleDelete(p)}>
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* PANEL LATERAL */}
      {panelOpen && (
        <div className="side-panel-backdrop">
          <div className="side-panel">
            <h3>{editingProvider ? "Editar proveedor" : "Registrar proveedor"}</h3>

            <form onSubmit={handleSubmit}>
              {/* Identificación */}
              <label>Nombre del proveedor</label>
              <input
                value={form.name}
                onChange={(e) => handleFormChange("name", e.target.value)}
              />

              <label>Persona de contacto</label>
              <input
                value={form.contact_name}
                onChange={(e) => handleFormChange("contact_name", e.target.value)}
              />

              {/* Contacto */}
              <label>Email</label>
              <input
                value={form.email}
                onChange={(e) => handleFormChange("email", e.target.value)}
              />

              <label>Teléfono</label>
              <input
                value={form.phone}
                onChange={(e) => handleFormChange("phone", e.target.value)}
              />

              {/* Ubicación */}
              <label>Región</label>
              <input
                value={form.region}
                onChange={(e) => handleFormChange("region", e.target.value)}
              />

              <label>Municipio</label>
              <input
                value={form.municipality}
                onChange={(e) => handleFormChange("municipality", e.target.value)}
              />

              {formError && (
                <p style={{ color: "#f87171", marginTop: "-10px" }}>{formError}</p>
              )}

              <div className="side-panel-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={closePanel}
                >
                  Cancelar
                </button>

                <button type="submit" className="btn-primary">
                  {saving
                    ? "Guardando..."
                    : editingProvider
                    ? "Guardar cambios"
                    : "Registrar proveedor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

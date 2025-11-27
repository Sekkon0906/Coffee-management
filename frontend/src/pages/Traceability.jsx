// ============================================
// src/pages/Traceability.jsx
// ============================================
import { useEffect, useMemo, useState } from "react";

// Configuración del sistema (destinaciones, líneas, servicios)
import {
  getDestinations,
  getCoffeeLines,
  getServices,
} from "../api/adminConfig";

// Lotes
import { getLots } from "../api/lots";

// API real de trazabilidad (conexión backend real)
import {
  saveIntake,
  saveTrilla,
  saveTueste,
  saveCata,
  saveEmpaque,
  saveDespacho,
  saveInspeccion,
  openPdf,
} from "../api/traceability";

// ============================================
// PASOS DEL TIMELINE
// ============================================
const TRACE_STEPS = [
  { id: "intake", label: "Ingreso materia prima" },
  { id: "trilla", label: "Trilla" },
  { id: "tueste", label: "Tueste" },
  { id: "cata", label: "Evaluación en taza" },
  { id: "empaque", label: "Empaque" },
  { id: "despacho", label: "Despacho" },
  { id: "inspeccion", label: "Inspección" },
];

// ============================================
// COMPONENTE DE MODAL
// ============================================
function TraceModal({ title, onClose, children }) {
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
// FORMULARIO INGRESO MP
// ============================================
function IntakeForm({
  lot,
  destinations,
  coffeeLines,
  services,
  initialData,
  onSave,
}) {
  const [form, setForm] = useState(
    initialData || {
      destination_id: "",
      coffee_line_id: "",
      service_ids: [],
      humidity_pct: "",
      package_type: "",
      package_detail: "",
      observations: "",
    }
  );

  const toggleService = (id) => {
    setForm((prev) => ({
      ...prev,
      service_ids: prev.service_ids.includes(id)
        ? prev.service_ids.filter((s) => s !== id)
        : [...prev.service_ids, id],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="form-grid">
      <div className="form-row">
        <label>Destinación</label>
        <select
          required
          className="input"
          value={form.destination_id}
          onChange={(e) =>
            setForm((f) => ({ ...f, destination_id: e.target.value }))
          }
        >
          <option value="">Selecciona...</option>
          {destinations.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <label>Línea de café</label>
        <select
          required
          className="input"
          value={form.coffee_line_id}
          onChange={(e) =>
            setForm((f) => ({ ...f, coffee_line_id: e.target.value }))
          }
        >
          <option value="">Selecciona...</option>
          {coffeeLines.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <label>Servicios solicitados</label>
        <div className="chips-wrap">
          {services.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => toggleService(s.id)}
              className={
                form.service_ids.includes(s.id)
                  ? "chip chip-active"
                  : "chip"
              }
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      <div className="form-row">
        <label>Humedad (%)</label>
        <input
          type="number"
          step="0.1"
          className="input"
          value={form.humidity_pct}
          onChange={(e) =>
            setForm((f) => ({ ...f, humidity_pct: e.target.value }))
          }
        />
      </div>

      <div className="form-row">
        <label>Tipo de empaque</label>
        <input
          className="input"
          value={form.package_type}
          onChange={(e) =>
            setForm((f) => ({ ...f, package_type: e.target.value }))
          }
        />
      </div>

      <div className="form-row">
        <label>Detalle empaque</label>
        <input
          className="input"
          value={form.package_detail}
          onChange={(e) =>
            setForm((f) => ({ ...f, package_detail: e.target.value }))
          }
        />
      </div>

      <div className="form-row">
        <label>Observaciones</label>
        <textarea
          className="input"
          rows={3}
          value={form.observations}
          onChange={(e) =>
            setForm((f) => ({ ...f, observations: e.target.value }))
          }
        />
      </div>

      <div className="form-actions">
        <button className="btn btn-primary">Guardar</button>
      </div>
    </form>
  );
}

// ============================================
// FORMULARIOS RESUMIDOS DE LOS DEMÁS PASOS
// ============================================

function TrillaForm({ initialData, onSave }) {
  const [form, setForm] = useState(
    initialData || {
      input_kg: "",
      output_kg: "",
      humidity_before: "",
      humidity_after: "",
      observations: "",
    }
  );
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form);
      }}
      className="form-grid"
    >
      <div className="form-row">
        <label>Entrada (kg)</label>
        <input
          className="input"
          type="number"
          step="0.01"
          value={form.input_kg}
          onChange={(e) =>
            setForm((f) => ({ ...f, input_kg: e.target.value }))
          }
        />
      </div>

      <div className="form-row">
        <label>Salida (kg)</label>
        <input
          className="input"
          type="number"
          step="0.01"
          value={form.output_kg}
          onChange={(e) =>
            setForm((f) => ({ ...f, output_kg: e.target.value }))
          }
        />
      </div>

      <div className="form-row">
        <label>Humedad antes</label>
        <input
          className="input"
          type="number"
          step="0.1"
          value={form.humidity_before}
          onChange={(e) =>
            setForm((f) => ({ ...f, humidity_before: e.target.value }))
          }
        />
      </div>

      <div className="form-row">
        <label>Humedad después</label>
        <input
          className="input"
          type="number"
          step="0.1"
          value={form.humidity_after}
          onChange={(e) =>
            setForm((f) => ({ ...f, humidity_after: e.target.value }))
          }
        />
      </div>

      <div className="form-row">
        <label>Observaciones</label>
        <textarea
          className="input"
          value={form.observations}
          onChange={(e) =>
            setForm((f) => ({ ...f, observations: e.target.value }))
          }
        />
      </div>

      <div className="form-actions">
        <button className="btn btn-primary">Guardar</button>
      </div>
    </form>
  );
}

// --- FORMULARIOS TUERSTE, CATA, EMPAQUE, DESPACHO, INSPECCIÓN ---
function TuesteForm({ initialData, onSave }) {
  const [form, setForm] = useState(
    initialData || {
      profile_code: "",
      roast_level: "",
      batches: "",
      input_kg: "",
      output_kg: "",
      humidity_after: "",
      density: "",
      observations: "",
    }
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form);
      }}
      className="form-grid"
    >
      <div className="form-row">
        <label>Perfil</label>
        <input
          className="input"
          value={form.profile_code}
          onChange={(e) =>
            setForm((f) => ({ ...f, profile_code: e.target.value }))
          }
        />
      </div>

      <div className="form-row">
        <label>Nivel tueste</label>
        <input
          className="input"
          value={form.roast_level}
          onChange={(e) =>
            setForm((f) => ({ ...f, roast_level: e.target.value }))
          }
        />
      </div>

      <div className="form-row">
        <label>Baches</label>
        <input
          type="number"
          className="input"
          value={form.batches}
          onChange={(e) =>
            setForm((f) => ({ ...f, batches: e.target.value }))
          }
        />
      </div>

      <div className="form-row">
        <label>Entrada (kg)</label>
        <input
          type="number"
          className="input"
          value={form.input_kg}
          onChange={(e) =>
            setForm((f) => ({ ...f, input_kg: e.target.value }))
          }
        />
      </div>

      <div className="form-row">
        <label>Salida (kg)</label>
        <input
          type="number"
          className="input"
          value={form.output_kg}
          onChange={(e) =>
            setForm((f) => ({ ...f, output_kg: e.target.value }))
          }
        />
      </div>

      <div className="form-row">
        <label>Humedad final</label>
        <input
          type="number"
          className="input"
          value={form.humidity_after}
          onChange={(e) =>
            setForm((f) => ({ ...f, humidity_after: e.target.value }))
          }
        />
      </div>

      <div className="form-row">
        <label>Densidad</label>
        <input
          className="input"
          value={form.density}
          onChange={(e) =>
            setForm((f) => ({ ...f, density: e.target.value }))
          }
        />
      </div>

      <div className="form-row">
        <label>Observaciones</label>
        <textarea
          className="input"
          value={form.observations}
          onChange={(e) =>
            setForm((f) => ({ ...f, observations: e.target.value }))
          }
        />
      </div>

      <div className="form-actions">
        <button className="btn btn-primary">Guardar</button>
      </div>
    </form>
  );
}

function CataForm({ initialData, onSave }) {
  const [form, setForm] = useState(
    initialData || {
      total_score: "",
      decision: "",
      notes: "",
    }
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form);
      }}
      className="form-grid"
    >
      <div className="form-row">
        <label>Puntaje total</label>
        <input
          type="number"
          className="input"
          value={form.total_score}
          onChange={(e) =>
            setForm((f) => ({ ...f, total_score: e.target.value }))
          }
        />
      </div>

      <div className="form-row">
        <label>Decisión</label>
        <input
          className="input"
          value={form.decision}
          onChange={(e) =>
            setForm((f) => ({ ...f, decision: e.target.value }))
          }
        />
      </div>

      <div className="form-row">
        <label>Observaciones</label>
        <textarea
          className="input"
          value={form.notes}
          onChange={(e) =>
            setForm((f) => ({ ...f, notes: e.target.value }))
          }
        />
      </div>

      <div className="form-actions">
        <button className="btn btn-primary">Guardar</button>
      </div>
    </form>
  );
}

function EmpaqueForm({ initialData, onSave }) {
  const [form, setForm] = useState(
    initialData || {
      total_kg: "",
      bags_340: "",
      bags_500: "",
      bags_1000: "",
      observations: "",
    }
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form);
      }}
      className="form-grid"
    >
      <div className="form-row">
        <label>Total kg</label>
        <input
          type="number"
          className="input"
          value={form.total_kg}
          onChange={(e) =>
            setForm((f) => ({ ...f, total_kg: e.target.value }))
          }
        />
      </div>

      <div className="form-row">
        <label>Bolsas 340g</label>
        <input
          type="number"
          className="input"
          value={form.bags_340}
          onChange={(e) =>
            setForm((f) => ({ ...f, bags_340: e.target.value }))
          }
        />
      </div>

      <div className="form-row">
        <label>Bolsas 500g</label>
        <input
          type="number"
          className="input"
          value={form.bags_500}
          onChange={(e) =>
            setForm((f) => ({ ...f, bags_500: e.target.value }))
          }
        />
      </div>

      <div className="form-row">
        <label>Bolsas 1kg</label>
        <input
          type="number"
          className="input"
          value={form.bags_1000}
          onChange={(e) =>
            setForm((f) => ({ ...f, bags_1000: e.target.value }))
          }
        />
      </div>

      <div className="form-row">
        <label>Observaciones</label>
        <textarea
          className="input"
          value={form.observations}
          onChange={(e) =>
            setForm((f) => ({ ...f, observations: e.target.value }))
          }
        />
      </div>

      <div className="form-actions">
        <button className="btn btn-primary">Guardar</button>
      </div>
    </form>
  );
}

function DespachoForm({ initialData, onSave }) {
  const [form, setForm] = useState(
    initialData || {
      client_name: "",
      city: "",
      document_number: "",
      dispatched_kg: "",
      observations: "",
    }
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form);
      }}
      className="form-grid"
    >
      <div className="form-row">
        <label>Cliente</label>
        <input
          className="input"
          value={form.client_name}
          onChange={(e) =>
            setForm((f) => ({ ...f, client_name: e.target.value }))
          }
        />
      </div>

      <div className="form-row">
        <label>Ciudad</label>
        <input
          className="input"
          value={form.city}
          onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
        />
      </div>

      <div className="form-row">
        <label>Documento</label>
        <input
          className="input"
          value={form.document_number}
          onChange={(e) =>
            setForm((f) => ({ ...f, document_number: e.target.value }))
          }
        />
      </div>

      <div className="form-row">
        <label>Kilos</label>
        <input
          type="number"
          className="input"
          value={form.dispatched_kg}
          onChange={(e) =>
            setForm((f) => ({ ...f, dispatched_kg: e.target.value }))
          }
        />
      </div>

      <div className="form-row">
        <label>Observaciones</label>
        <textarea
          className="input"
          value={form.observations}
          onChange={(e) =>
            setForm((f) => ({ ...f, observations: e.target.value }))
          }
        />
      </div>

      <div className="form-actions">
        <button className="btn btn-primary">Guardar</button>
      </div>
    </form>
  );
}

function InspeccionForm({ initialData, onSave }) {
  const [form, setForm] = useState(
    initialData || {
      packaging_ok: true,
      labels_ok: true,
      moisture_ok: true,
      foreign_material_ok: true,
      observations: "",
    }
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form);
      }}
      className="form-grid"
    >
      <div className="form-row">
        <label>Empaque</label>
        <select
          className="input"
          value={form.packaging_ok ? "1" : "0"}
          onChange={(e) =>
            setForm((f) => ({ ...f, packaging_ok: e.target.value === "1" }))
          }
        >
          <option value="1">Óptimo</option>
          <option value="0">No óptimo</option>
        </select>
      </div>

      <div className="form-row">
        <label>Etiquetas</label>
        <select
          className="input"
          value={form.labels_ok ? "1" : "0"}
          onChange={(e) =>
            setForm((f) => ({ ...f, labels_ok: e.target.value === "1" }))
          }
        >
          <option value="1">Óptimo</option>
          <option value="0">No óptimo</option>
        </select>
      </div>

      <div className="form-row">
        <label>Humedad ok</label>
        <select
          className="input"
          value={form.moisture_ok ? "1" : "0"}
          onChange={(e) =>
            setForm((f) => ({ ...f, moisture_ok: e.target.value === "1" }))
          }
        >
          <option value="1">Sí</option>
          <option value="0">No</option>
        </select>
      </div>

      <div className="form-row">
        <label>Impurezas</label>
        <select
          className="input"
          value={form.foreign_material_ok ? "1" : "0"}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              foreign_material_ok: e.target.value === "1",
            }))
          }
        >
          <option value="1">Ausente</option>
          <option value="0">Presente</option>
        </select>
      </div>

      <div className="form-row">
        <label>Observaciones</label>
        <textarea
          className="input"
          value={form.observations}
          onChange={(e) =>
            setForm((f) => ({ ...f, observations: e.target.value }))
          }
        />
      </div>

      <div className="form-actions">
        <button className="btn btn-primary">Guardar</button>
      </div>
    </form>
  );
}

// ============================================
// MAPEO step → componente de formulario
// ============================================
const STEP_FORM_COMPONENT = {
  intake: IntakeForm,
  trilla: TrillaForm,
  tueste: TuesteForm,
  cata: CataForm,
  empaque: EmpaqueForm,
  despacho: DespachoForm,
  inspeccion: InspeccionForm,
};

// ============================================
// PAGINA PRINCIPAL DE TRAZABILIDAD
// ============================================
export default function Traceability() {
  const [lots, setLots] = useState([]);
  const [filters, setFilters] = useState({ search: "" });
  const [selectedLot, setSelectedLot] = useState(null);

  const [destinations, setDestinations] = useState([]);
  const [coffeeLines, setCoffeeLines] = useState([]);
  const [services, setServices] = useState([]);

  const [traceByLot, setTraceByLot] = useState({});
  const [activeStepModal, setActiveStepModal] = useState(null);

  const [loading, setLoading] = useState(true);

  // ============================================
  // CARGA INICIAL
  // ============================================
  useEffect(() => {
    const loadAll = async () => {
      try {
        setLoading(true);

        const [lotsResp, dests, lines, servs] = await Promise.all([
          getLots(),
          getDestinations(),
          getCoffeeLines(),
          getServices(),
        ]);

        const arr = Array.isArray(lotsResp)
          ? lotsResp
          : lotsResp?.rows || [];

        setLots(arr);
        setDestinations(dests || []);
        setCoffeeLines(lines || []);
        setServices(servs || []);
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, []);

  // ============================================
  // BUSQUEDA DE LOTES
  // ============================================
  const filteredLots = useMemo(() => {
    const t = filters.search.toLowerCase();
    if (!t) return lots;
    return lots.filter((lot) =>
      [
        lot.name,
        lot.code,
        lot.provider_name,
        lot.origin_region,
        lot.origin_place,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(t)
    );
  }, [filters.search, lots]);

  const openStepModal = (stepId) => setActiveStepModal(stepId);
  const closeStepModal = () => setActiveStepModal(null);

  // ============================================
  // GUARDAR PASO – CONEXIÓN REAL AL BACKEND
  // ============================================
  const handleSaveStep = async (stepId, data) => {
    if (!selectedLot) return;

    try {
      let resp;

      switch (stepId) {
        case "intake":
          resp = await saveIntake(selectedLot.id, data);
          break;
        case "trilla":
          resp = await saveTrilla(selectedLot.id, data);
          break;
        case "tueste":
          resp = await saveTueste(selectedLot.id, data);
          break;
        case "cata":
          resp = await saveCata(selectedLot.id, data);
          break;
        case "empaque":
          resp = await saveEmpaque(selectedLot.id, data);
          break;
        case "despacho":
          resp = await saveDespacho(selectedLot.id, data);
          break;
        case "inspeccion":
          resp = await saveInspeccion(selectedLot.id, data);
          break;
      }

      const savedAt = new Date().toISOString();

      setTraceByLot((prev) => ({
        ...prev,
        [selectedLot.id]: {
          ...(prev[selectedLot.id] || {}),
          [stepId]: { ...(resp?.data || {}), savedAt },
        },
      }));

      closeStepModal();
    } catch (err) {
      console.error("Error guardando:", err);
      alert("Error guardando formulario");
    }
  };

  const currentTrace =
    selectedLot && traceByLot[selectedLot.id]
      ? traceByLot[selectedLot.id]
      : {};

  const getStepStatus = (stepId) =>
    currentTrace[stepId]
      ? { label: "Registrado", className: "badge badge-done" }
      : { label: "Pendiente", className: "badge badge-pending" };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>Trazabilidad</h1>
          <p>
            Línea de tiempo completa del lote, con todos los formularios de
            trazabilidad.
          </p>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-grid">
          {/* ======================================== */}
          {/* PANEL IZQUIERDO - LISTA DE LOTES */}
          {/* ======================================== */}
          <section className="card">
            <h2>Lotes de café</h2>

            <input
              className="input"
              placeholder="Buscar lote..."
              value={filters.search}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  search: e.target.value,
                }))
              }
              style={{ marginTop: 10, marginBottom: 12 }}
            />

            {loading ? (
              <p>Cargando...</p>
            ) : filteredLots.length === 0 ? (
              <p>No hay lotes encontrados.</p>
            ) : (
              <table className="table-simple">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Lote</th>
                    <th>Proveedor</th>
                    <th>Origen</th>
                    <th>Línea</th>
                    <th>Puntaje</th>
                    <th>Kilos</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {filteredLots.map((lot) => (
                    <tr key={lot.id}>
                      <td>{lot.code || "-"}</td>
                      <td>{lot.name || "-"}</td>
                      <td>{lot.provider_name || "-"}</td>
                      <td>
                        {(lot.origin_region || "") +
                          " " +
                          (lot.origin_place || "")}
                      </td>
                      <td>{lot.line_name || "-"}</td>
                      <td>
                        {lot.quality_score
                          ? Number(lot.quality_score).toFixed(1)
                          : "-"}
                      </td>
                      <td>
                        {lot.quantity_kg != null
                          ? Number(lot.quantity_kg).toLocaleString("es-CO")
                          : "-"}
                      </td>

                      <td style={{ textAlign: "right" }}>
                        <button
                          className="btn btn-secondary btn-xs"
                          onClick={() => setSelectedLot(lot)}
                        >
                          Ver trazabilidad
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          {/* ======================================== */}
          {/* PANEL DERECHO - TIMELINE DEL LOTE */}
          {/* ======================================== */}
          <section className="card detail-card">
            {!selectedLot ? (
              <div className="detail-content">
                <h3>Selecciona un lote</h3>
              </div>
            ) : (
              <>
                <div className="detail-content">
                  <h3>
                    Lote {selectedLot.code} — {selectedLot.name}
                  </h3>
                  <p className="detail-tag">
                    Proveedor: {selectedLot.provider_name} · Línea:{" "}
                    {selectedLot.line_name || "-"}
                  </p>

                  <div className="step-status-bar">
                    {TRACE_STEPS.map((step) => {
                      const st = getStepStatus(step.id);
                      return (
                        <div key={step.id} className="step-status-item">
                          <span className={st.className} />
                          <span>{step.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="detail-grid">
                  {TRACE_STEPS.map((step) => {
                    const record = currentTrace[step.id];
                    const st = getStepStatus(step.id);

                    return (
                      <div key={step.id} className="detail-block">
                        <h4>{step.label}</h4>

                        <span className={st.className}>{st.label}</span>

                        {record && (
                          <p style={{ marginTop: 6, fontSize: "0.75rem" }}>
                            Última actualización:{" "}
                            {new Date(record.savedAt).toLocaleString("es-CO")}
                          </p>
                        )}

                        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                          {/* Edit / Registrar */}
                          <button
                            className="btn btn-primary btn-xs"
                            onClick={() => openStepModal(step.id)}
                          >
                            {record ? "Editar" : "Registrar"}
                          </button>

                          {/* PDF */}
                          <button
                            className="btn btn-secondary btn-xs"
                            disabled={!record}
                            onClick={() =>
                              openPdf(selectedLot.id, step.id)
                            }
                          >
                            Ver PDF
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </section>
        </div>

        {/* MODAL */}
        {activeStepModal && selectedLot && (
          <TraceModal
            title={
              TRACE_STEPS.find((s) => s.id === activeStepModal)?.label +
              " – Lote " +
              (selectedLot.code || selectedLot.id)
            }
            onClose={closeStepModal}
          >
            {(() => {
              const StepForm = STEP_FORM_COMPONENT[activeStepModal];
              const initial = currentTrace[activeStepModal] || null;

              if (activeStepModal === "intake") {
                return (
                  <StepForm
                    lot={selectedLot}
                    destinations={destinations}
                    coffeeLines={coffeeLines}
                    services={services}
                    initialData={initial}
                    onSave={(data) => handleSaveStep("intake", data)}
                  />
                );
              }

              return (
                <StepForm
                  initialData={initial}
                  onSave={(data) => handleSaveStep(activeStepModal, data)}
                />
              );
            })()}
          </TraceModal>
        )}
      </main>
    </div>
  );
}

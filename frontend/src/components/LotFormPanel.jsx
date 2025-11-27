// src/components/LotFormPanel.jsx
import { useState } from "react";

const initialForm = {
  codigoLote: "",
  destinacion: "jusso",
  linea: "oso",
  caficultor: "",
  origen: "",
  variedad: "",
  beneficio: "",
  pesoKg: "",
  estadoCafe: "pergamino",
  humedad: "",
  tipoEmpaque: "fique",
  empaqueOtro: "",
  servicios: {
    trilla: false,
    tueste: false,
    empaque: false,
    molido: false,
    laboratorio: false,
  },
  observaciones: "",
};

export default function LotFormPanel({ open, onClose, onCreated }) {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleServicioChange = (e) => {
    const { name, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      servicios: { ...prev.servicios, [name]: checked },
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      // Mapeo al payload que espera tu backend
      const payload = {
        name: form.codigoLote || `Lote ${form.origen || ""}`.trim(),
        provider_name: form.caficultor,
        origin: form.origen,
        process: form.beneficio,
        quantity_kg: Number(form.pesoKg) || 0,
        status: form.estadoCafe, // "pergamino" | "trillado"
        humidity: Number(form.humedad) || null,
        package_type:
          form.tipoEmpaque === "otro" ? form.empaqueOtro : form.tipoEmpaque,
        destinacion: form.destinacion,
        linea: form.linea,
        servicios: form.servicios,
        observaciones: form.observaciones,
      };

      const res = await fetch("http://localhost:4000/api/lots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("No se pudo guardar el lote");
      }

      const saved = await res.json();
      onCreated?.(saved);
      resetForm();
      onClose?.();
    } catch (err) {
      console.error(err);
      setError(err.message || "Error guardando el lote");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`lot-panel-backdrop ${open ? "is-open" : ""}`}>
      <aside className={`lot-panel ${open ? "lot-panel--open" : ""}`}>
        <header className="lot-panel__header">
          <div>
            <h2>Nuevo lote de café</h2>
            <p>Registro basado en la ficha de ingreso de Jus&apos;so.</p>
          </div>
          <button
            type="button"
            className="lot-panel__close"
            onClick={() => {
              resetForm();
              onClose?.();
            }}
          >
            ×
          </button>
        </header>

        <form className="lot-form" onSubmit={handleSubmit}>
          <section className="lot-form__section">
            <h3>Identificación</h3>
            <div className="lot-form__grid">
              <div className="lot-form__field">
                <label>Código / nombre del lote</label>
                <input
                  name="codigoLote"
                  value={form.codigoLote}
                  onChange={handleChange}
                  placeholder="Ej. 2025.03.12.01"
                />
              </div>

              <div className="lot-form__field">
                <label>Destinación</label>
                <select
                  name="destinacion"
                  value={form.destinacion}
                  onChange={handleChange}
                >
                  <option value="jusso">Jus&apos;so</option>
                  <option value="maquila">Maquila</option>
                </select>
              </div>

              <div className="lot-form__field">
                <label>Línea Jus&apos;so</label>
                <select
                  name="linea"
                  value={form.linea}
                  onChange={handleChange}
                >
                  <option value="oso">Oso</option>
                  <option value="puma">Puma</option>
                  <option value="condor">Cóndor</option>
                </select>
              </div>
            </div>
          </section>

          <section className="lot-form__section">
            <h3>Datos del caficultor</h3>
            <div className="lot-form__grid">
              <div className="lot-form__field">
                <label>Caficultor / propietario</label>
                <input
                  name="caficultor"
                  value={form.caficultor}
                  onChange={handleChange}
                  placeholder="Nombre o finca"
                  required
                />
              </div>

              <div className="lot-form__field">
                <label>Origen</label>
                <input
                  name="origen"
                  value={form.origen}
                  onChange={handleChange}
                  placeholder="Municipio / vereda"
                  required
                />
              </div>

              <div className="lot-form__field">
                <label>Variedad</label>
                <input
                  name="variedad"
                  value={form.variedad}
                  onChange={handleChange}
                  placeholder="Caturra, Castillo..."
                />
              </div>

              <div className="lot-form__field">
                <label>Beneficio / proceso</label>
                <input
                  name="beneficio"
                  value={form.beneficio}
                  onChange={handleChange}
                  placeholder="Lavado, honey, natural..."
                />
              </div>
            </div>
          </section>

          <section className="lot-form__section">
            <h3>Características físicas</h3>
            <div className="lot-form__grid">
              <div className="lot-form__field">
                <label>Peso (kg)</label>
                <input
                  name="pesoKg"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.pesoKg}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="lot-form__field">
                <label>Estado del café</label>
                <select
                  name="estadoCafe"
                  value={form.estadoCafe}
                  onChange={handleChange}
                >
                  <option value="pergamino">Pergamino</option>
                  <option value="trillado">Trillado</option>
                </select>
              </div>

              <div className="lot-form__field">
                <label>Humedad (%)</label>
                <input
                  name="humedad"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={form.humedad}
                  onChange={handleChange}
                  placeholder="Ej. 11.5"
                />
              </div>

              <div className="lot-form__field">
                <label>Tipo de empaque</label>
                <select
                  name="tipoEmpaque"
                  value={form.tipoEmpaque}
                  onChange={handleChange}
                >
                  <option value="fique">Fique</option>
                  <option value="grainpro">GrainPro</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              {form.tipoEmpaque === "otro" && (
                <div className="lot-form__field">
                  <label>Describa el empaque</label>
                  <input
                    name="empaqueOtro"
                    value={form.empaqueOtro}
                    onChange={handleChange}
                  />
                </div>
              )}
            </div>
          </section>

          <section className="lot-form__section">
            <h3>Servicios solicitados</h3>
            <div className="lot-form__services">
              {[
                { id: "trilla", label: "Trilla" },
                { id: "tueste", label: "Tueste" },
                { id: "empaque", label: "Empaque" },
                { id: "molido", label: "Molido" },
                { id: "laboratorio", label: "Laboratorio" },
              ].map((srv) => (
                <label key={srv.id} className="lot-form__service-pill">
                  <input
                    type="checkbox"
                    name={srv.id}
                    checked={form.servicios[srv.id]}
                    onChange={handleServicioChange}
                  />
                  <span>{srv.label}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="lot-form__section">
            <h3>Observaciones</h3>
            <div className="lot-form__field">
              <textarea
                name="observaciones"
                rows={3}
                value={form.observaciones}
                onChange={handleChange}
                placeholder="Material extraño, olores, notas adicionales..."
              />
            </div>
          </section>

          {error && <p className="lot-form__error">{error}</p>}

          <footer className="lot-form__footer">
            <button
              type="button"
              className="btn-outline lot-form__btn-cancel"
              onClick={() => {
                resetForm();
                onClose?.();
              }}
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary lot-form__btn-submit"
              disabled={submitting}
            >
              {submitting ? "Guardando..." : "Guardar lote"}
            </button>
          </footer>
        </form>
      </aside>
    </div>
  );
}

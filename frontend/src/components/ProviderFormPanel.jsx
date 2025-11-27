import { useState } from "react";

const initialForm = {
  name: "",
  contact_name: "",
  email: "",
  phone: "",
  region: "",
  municipality: "",
  address: "",
  notes: "",
};

export default function ProviderFormPanel({ open, onClose, onCreated }) {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const reset = () => {
    setForm(initialForm);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("http://localhost:4000/api/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("No se pudo registrar el proveedor");

      const saved = await res.json();
      onCreated?.(saved);
      reset();
      onClose?.();
    } catch (err) {
      setError(err.message || "Error al registrar proveedor");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`lot-panel-backdrop ${open ? "is-open" : ""}`}>
      <aside className={`lot-panel ${open ? "lot-panel--open" : ""}`}>
        <header className="lot-panel__header">
          <div>
            <h2>Registrar proveedor</h2>
            <p>Información del caficultor / distribuidor</p>
          </div>
          <button
            type="button"
            className="lot-panel__close"
            onClick={() => {
              reset();
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
                <label>Nombre del proveedor</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="lot-form__field">
                <label>Persona de contacto</label>
                <input
                  name="contact_name"
                  value={form.contact_name}
                  onChange={handleChange}
                />
              </div>
            </div>
          </section>

          <section className="lot-form__section">
            <h3>Contacto</h3>
            <div className="lot-form__grid">
              <div className="lot-form__field">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
              <div className="lot-form__field">
                <label>Teléfono</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>
            </div>
          </section>

          <section className="lot-form__section">
            <h3>Ubicación</h3>
            <div className="lot-form__grid">
              <div className="lot-form__field">
                <label>Región</label>
                <input
                  name="region"
                  value={form.region}
                  onChange={handleChange}
                />
              </div>
              <div className="lot-form__field">
                <label>Municipio</label>
                <input
                  name="municipality"
                  value={form.municipality}
                  onChange={handleChange}
                />
              </div>
              <div className="lot-form__field">
                <label>Dirección</label>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                />
              </div>
            </div>
          </section>

          <section className="lot-form__section">
            <h3>Notas internas</h3>
            <textarea
              name="notes"
              rows="3"
              value={form.notes}
              onChange={handleChange}
            />
          </section>

          {error && <p className="lot-form__error">{error}</p>}

          <footer className="lot-form__footer">
            <button
              type="button"
              className="btn-outline"
              onClick={() => {
                reset();
                onClose?.();
              }}
              disabled={submitting}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
            >
              {submitting ? "Guardando..." : "Guardar proveedor"}
            </button>
          </footer>
        </form>
      </aside>
    </div>
  );
}

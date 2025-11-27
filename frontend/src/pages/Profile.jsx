// frontend/src/pages/Profile.jsx
import { useEffect, useState } from "react";
import {
  getDestinations,
  createDestination,
  updateDestination,
  deleteDestination,
  getCoffeeLines,
  createCoffeeLine,
  updateCoffeeLine,
  deleteCoffeeLine,
  getServices,
  createService,
  updateService,
  deleteService,
} from "../api/adminConfig";

function Profile() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // listas
  const [destinations, setDestinations] = useState([]);
  const [coffeeLines, setCoffeeLines] = useState([]);
  const [services, setServicesState] = useState([]);

  // formularios de creación
  const [destForm, setDestForm] = useState({
    name: "",
    code: "",
    description: "",
  });

  const [lineForm, setLineForm] = useState({
    name: "",
    code: "",
    description: "",
    color_hex: "",
  });

  const [servForm, setServForm] = useState({
    name: "",
    code: "",
    description: "",
    base_price: "",
  });

  // ======== formularios de EDICIÓN (viñetas internas) ========
  const [editDest, setEditDest] = useState(null);
  const [editDestForm, setEditDestForm] = useState({
    name: "",
    code: "",
    description: "",
  });

  const [editLine, setEditLine] = useState(null);
  const [editLineForm, setEditLineForm] = useState({
    name: "",
    code: "",
    description: "",
    color_hex: "",
  });

  const [editServ, setEditServ] = useState(null);
  const [editServForm, setEditServForm] = useState({
    name: "",
    code: "",
    description: "",
    base_price: "",
  });

  // ================= CARGA INICIAL =================
  useEffect(() => {
    const loadAll = async () => {
      try {
        setLoading(true);
        setError("");

        const [dests, lines, servs] = await Promise.all([
          getDestinations(),
          getCoffeeLines(),
          getServices(),
        ]);

        setDestinations(dests);
        setCoffeeLines(lines);
        setServicesState(servs);
      } catch (e) {
        console.error(e);
        setError("Error cargando configuración");
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, []);

  const yesNo = (val) => (val ? "Sí" : "No");

  /* ============ CREAR ============ */

  const handleCreateDestination = async (e) => {
    e.preventDefault();
    if (!destForm.name.trim()) return;

    const created = await createDestination(destForm);
    setDestinations((prev) => [created, ...prev]);
    setDestForm({ name: "", code: "", description: "" });
  };

  const handleCreateLine = async (e) => {
    e.preventDefault();
    if (!lineForm.name.trim()) return;

    const created = await createCoffeeLine(lineForm);
    setCoffeeLines((prev) => [created, ...prev]);
    setLineForm({ name: "", code: "", description: "", color_hex: "" });
  };

  const handleCreateService = async (e) => {
    e.preventDefault();
    if (!servForm.name.trim()) return;

    const created = await createService(servForm);
    setServicesState((prev) => [created, ...prev]);
    setServForm({ name: "", code: "", description: "", base_price: "" });
  };

  /* ============ EDICIÓN EN PÁGINA ============ */
  // ----- Destinaciones -----
  const startEditDestination = (dest) => {
    setEditDest(dest);
    setEditDestForm({
      name: dest.name || "",
      code: dest.code || "",
      description: dest.description || "",
    });
  };

  const cancelEditDestination = () => {
    setEditDest(null);
    setEditDestForm({ name: "", code: "", description: "" });
  };

  const handleUpdateDestination = async (e) => {
    e.preventDefault();
    if (!editDest) return;

    const updated = await updateDestination(editDest.id, {
      name: editDestForm.name,
      code: editDestForm.code,
      description: editDestForm.description,
      is_active: editDest.is_active,
    });

    setDestinations((prev) =>
      prev.map((d) => (d.id === editDest.id ? updated : d))
    );
    cancelEditDestination();
  };

  // ----- Líneas de café -----
  const startEditLine = (line) => {
    setEditLine(line);
    setEditLineForm({
      name: line.name || "",
      code: line.code || "",
      description: line.description || "",
      color_hex: line.color_hex || "",
    });
  };

  const cancelEditLine = () => {
    setEditLine(null);
    setEditLineForm({
      name: "",
      code: "",
      description: "",
      color_hex: "",
    });
  };

  const handleUpdateLine = async (e) => {
    e.preventDefault();
    if (!editLine) return;

    const updated = await updateCoffeeLine(editLine.id, {
      name: editLineForm.name,
      code: editLineForm.code,
      description: editLineForm.description,
      color_hex: editLineForm.color_hex,
      is_active: editLine.is_active,
    });

    setCoffeeLines((prev) =>
      prev.map((l) => (l.id === editLine.id ? updated : l))
    );
    cancelEditLine();
  };

  // ----- Servicios -----
  const startEditService = (serv) => {
    setEditServ(serv);
    setEditServForm({
      name: serv.name || "",
      code: serv.code || "",
      description: serv.description || "",
      base_price: serv.base_price != null ? String(serv.base_price) : "",
    });
  };

  const cancelEditService = () => {
    setEditServ(null);
    setEditServForm({
      name: "",
      code: "",
      description: "",
      base_price: "",
    });
  };

  const handleUpdateService = async (e) => {
    e.preventDefault();
    if (!editServ) return;

    const updated = await updateService(editServ.id, {
      name: editServForm.name,
      code: editServForm.code,
      description: editServForm.description,
      base_price: editServForm.base_price || null,
      is_active: editServ.is_active,
    });

    setServicesState((prev) =>
      prev.map((s) => (s.id === editServ.id ? updated : s))
    );
    cancelEditService();
  };

  /* ============ ELIMINAR ============ */

  const handleDeleteDestination = async (dest) => {
    if (!window.confirm(`¿Eliminar destinación "${dest.name}"?`)) return;
    await deleteDestination(dest.id);
    setDestinations((prev) => prev.filter((d) => d.id !== dest.id));
  };

  const handleDeleteLine = async (line) => {
    if (!window.confirm(`¿Eliminar línea "${line.name}"?`)) return;
    await deleteCoffeeLine(line.id);
    setCoffeeLines((prev) => prev.filter((l) => l.id !== line.id));
  };

  const handleDeleteService = async (serv) => {
    if (!window.confirm(`¿Eliminar servicio "${serv.name}"?`)) return;
    await deleteService(serv.id);
    setServicesState((prev) => prev.filter((s) => s.id !== serv.id));
  };

  /* ============ RENDER ============ */

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>Mi perfil / Configuración</h1>
          <p>
            Configura destinaciones, líneas de café y servicios ofrecidos
            por la empresa.
          </p>
        </div>
      </header>

      <main className="dashboard-main">
        {error && (
          <p style={{ color: "#ef4444", marginBottom: 16 }}>{error}</p>
        )}

        {/* DESTINACIONES */}
        <section className="card">
          <h2>Destinaciones</h2>
          <p className="card-subtitle">
            A dónde se destina el café: marca propia, maquila, exportación,
            consumo interno, etc.
          </p>

          {/* formulario crear */}
          <form
            onSubmit={handleCreateDestination}
            style={{
              display: "grid",
              gap: 8,
              gridTemplateColumns: "1fr 0.4fr 1.4fr auto",
              marginTop: 12,
              marginBottom: 12,
            }}
          >
            <input
              className="input"
              placeholder="Ej. Marca propia"
              value={destForm.name}
              onChange={(e) =>
                setDestForm((f) => ({ ...f, name: e.target.value }))
              }
            />
            <input
              className="input"
              placeholder="Código (opcional)"
              value={destForm.code}
              onChange={(e) =>
                setDestForm((f) => ({ ...f, code: e.target.value }))
              }
            />
            <input
              className="input"
              placeholder="Notas internas de la destinación"
              value={destForm.description}
              onChange={(e) =>
                setDestForm((f) => ({ ...f, description: e.target.value }))
              }
            />
            <button type="submit" className="btn btn-primary">
              Agregar
            </button>
          </form>

          {/* tabla */}
          <table className="table-simple">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Código</th>
                <th>Descripción</th>
                <th>Activo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {destinations.map((d) => (
                <tr key={d.id}>
                  <td>{d.name}</td>
                  <td>{d.code}</td>
                  <td>{d.description}</td>
                  <td>{yesNo(d.is_active)}</td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-xs"
                      onClick={() => startEditDestination(d)}
                    >
                      Editar
                    </button>{" "}
                    <button
                      type="button"
                      className="btn btn-danger btn-xs"
                      onClick={() => handleDeleteDestination(d)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {destinations.length === 0 && !loading && (
                <tr>
                  <td colSpan={5}>No hay destinaciones registradas todavía.</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* viñeta de edición destinaciones */}
          {editDest && (
            <div
              className="card"
              style={{
                marginTop: 16,
                background: "#0f172a",
              }}
            >
              <h3>Editar destinación: {editDest.name}</h3>
              <form
                onSubmit={handleUpdateDestination}
                style={{
                  display: "grid",
                  gap: 8,
                  gridTemplateColumns: "1fr 0.4fr 1.4fr auto auto",
                  marginTop: 12,
                }}
              >
                <input
                  className="input"
                  placeholder="Nombre"
                  value={editDestForm.name}
                  onChange={(e) =>
                    setEditDestForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
                <input
                  className="input"
                  placeholder="Código"
                  value={editDestForm.code}
                  onChange={(e) =>
                    setEditDestForm((f) => ({ ...f, code: e.target.value }))
                  }
                />
                <input
                  className="input"
                  placeholder="Descripción"
                  value={editDestForm.description}
                  onChange={(e) =>
                    setEditDestForm((f) => ({
                      ...f,
                      description: e.target.value,
                    }))
                  }
                />
                <button type="submit" className="btn btn-primary btn-xs">
                  Guardar
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-xs"
                  onClick={cancelEditDestination}
                >
                  Cancelar
                </button>
              </form>
            </div>
          )}
        </section>

        {/* LÍNEAS DE CAFÉ */}
        <section className="card">
          <h2>Líneas de café</h2>
          <p className="card-subtitle">
            Segmenta tus cafés por línea comercial (Oso, Puma, Cóndor…).
          </p>

          <form
            onSubmit={handleCreateLine}
            style={{
              display: "grid",
              gap: 8,
              gridTemplateColumns: "1fr 0.4fr 1.2fr 0.4fr auto",
              marginTop: 12,
              marginBottom: 12,
            }}
          >
            <input
              className="input"
              placeholder="Ej. Oso"
              value={lineForm.name}
              onChange={(e) =>
                setLineForm((f) => ({ ...f, name: e.target.value }))
              }
            />
            <input
              className="input"
              placeholder="Código"
              value={lineForm.code}
              onChange={(e) =>
                setLineForm((f) => ({ ...f, code: e.target.value }))
              }
            />
            <input
              className="input"
              placeholder="Descripción"
              value={lineForm.description}
              onChange={(e) =>
                setLineForm((f) => ({
                  ...f,
                  description: e.target.value,
                }))
              }
            />
            <input
              className="input"
              placeholder="#1D4ED8"
              value={lineForm.color_hex}
              onChange={(e) =>
                setLineForm((f) => ({ ...f, color_hex: e.target.value }))
              }
            />
            <button type="submit" className="btn btn-primary">
              Agregar
            </button>
          </form>

          <table className="table-simple">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Código</th>
                <th>Descripción</th>
                <th>Color</th>
                <th>Activo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {coffeeLines.map((l) => (
                <tr key={l.id}>
                  <td>{l.name}</td>
                  <td>{l.code}</td>
                  <td>{l.description}</td>
                  <td>{l.color_hex}</td>
                  <td>{yesNo(l.is_active)}</td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-xs"
                      onClick={() => startEditLine(l)}
                    >
                      Editar
                    </button>{" "}
                    <button
                      type="button"
                      className="btn btn-danger btn-xs"
                      onClick={() => handleDeleteLine(l)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {coffeeLines.length === 0 && !loading && (
                <tr>
                  <td colSpan={6}>
                    No hay líneas de café registradas todavía.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* viñeta de edición líneas */}
          {editLine && (
            <div
              className="card"
              style={{
                marginTop: 16,
                background: "#0f172a",
              }}
            >
              <h3>Editar línea: {editLine.name}</h3>
              <form
                onSubmit={handleUpdateLine}
                style={{
                  display: "grid",
                  gap: 8,
                  gridTemplateColumns: "1fr 0.3fr 1.2fr 0.4fr auto auto",
                  marginTop: 12,
                }}
              >
                <input
                  className="input"
                  placeholder="Nombre"
                  value={editLineForm.name}
                  onChange={(e) =>
                    setEditLineForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
                <input
                  className="input"
                  placeholder="Código"
                  value={editLineForm.code}
                  onChange={(e) =>
                    setEditLineForm((f) => ({ ...f, code: e.target.value }))
                  }
                />
                <input
                  className="input"
                  placeholder="Descripción"
                  value={editLineForm.description}
                  onChange={(e) =>
                    setEditLineForm((f) => ({
                      ...f,
                      description: e.target.value,
                    }))
                  }
                />
                <input
                  className="input"
                  placeholder="#1D4ED8"
                  value={editLineForm.color_hex}
                  onChange={(e) =>
                    setEditLineForm((f) => ({
                      ...f,
                      color_hex: e.target.value,
                    }))
                  }
                />
                <button type="submit" className="btn btn-primary btn-xs">
                  Guardar
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-xs"
                  onClick={cancelEditLine}
                >
                  Cancelar
                </button>
              </form>
            </div>
          )}
        </section>

        {/* SERVICIOS */}
        <section className="card">
          <h2>Servicios ofrecidos</h2>
          <p className="card-subtitle">
            Configura los servicios que puedes aplicar a cada lote
            (trilla, tueste, empaque, etc.).
          </p>

          <form
            onSubmit={handleCreateService}
            style={{
              display: "grid",
              gap: 8,
              gridTemplateColumns: "1fr 0.4fr 1.4fr 0.4fr auto",
              marginTop: 12,
              marginBottom: 12,
            }}
          >
            <input
              className="input"
              placeholder="Ej. Trilla"
              value={servForm.name}
              onChange={(e) =>
                setServForm((f) => ({ ...f, name: e.target.value }))
              }
            />
            <input
              className="input"
              placeholder="Código"
              value={servForm.code}
              onChange={(e) =>
                setServForm((f) => ({ ...f, code: e.target.value }))
              }
            />
            <input
              className="input"
              placeholder="Notas internas del servicio"
              value={servForm.description}
              onChange={(e) =>
                setServForm((f) => ({
                  ...f,
                  description: e.target.value,
                }))
              }
            />
            <input
              className="input"
              placeholder="Ej. 1500"
              value={servForm.base_price}
              onChange={(e) =>
                setServForm((f) => ({
                  ...f,
                  base_price: e.target.value,
                }))
              }
            />
            <button type="submit" className="btn btn-primary">
              Agregar
            </button>
          </form>

          <table className="table-simple">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Código</th>
                <th>Descripción</th>
                <th>Precio base</th>
                <th>Activo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.code}</td>
                  <td>{s.description}</td>
                  <td>
                    {s.base_price != null
                      ? Number(s.base_price).toLocaleString("es-CO")
                      : "-"}
                  </td>
                  <td>{yesNo(s.is_active)}</td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-xs"
                      onClick={() => startEditService(s)}
                    >
                      Editar
                    </button>{" "}
                    <button
                      type="button"
                      className="btn btn-danger btn-xs"
                      onClick={() => handleDeleteService(s)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {services.length === 0 && !loading && (
                <tr>
                  <td colSpan={6}>
                    No hay servicios registrados todavía.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* viñeta de edición servicios */}
          {editServ && (
            <div
              className="card"
              style={{
                marginTop: 16,
                background: "#0f172a",
              }}
            >
              <h3>Editar servicio: {editServ.name}</h3>
              <form
                onSubmit={handleUpdateService}
                style={{
                  display: "grid",
                  gap: 8,
                  gridTemplateColumns: "1fr 0.4fr 1.4fr 0.4fr auto auto",
                  marginTop: 12,
                }}
              >
                <input
                  className="input"
                  placeholder="Nombre"
                  value={editServForm.name}
                  onChange={(e) =>
                    setEditServForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
                <input
                  className="input"
                  placeholder="Código"
                  value={editServForm.code}
                  onChange={(e) =>
                    setEditServForm((f) => ({ ...f, code: e.target.value }))
                  }
                />
                <input
                  className="input"
                  placeholder="Descripción"
                  value={editServForm.description}
                  onChange={(e) =>
                    setEditServForm((f) => ({
                      ...f,
                      description: e.target.value,
                    }))
                  }
                />
                <input
                  className="input"
                  placeholder="Ej. 1500"
                  value={editServForm.base_price}
                  onChange={(e) =>
                    setEditServForm((f) => ({
                      ...f,
                      base_price: e.target.value,
                    }))
                  }
                />
                <button type="submit" className="btn btn-primary btn-xs">
                  Guardar
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-xs"
                  onClick={cancelEditService}
                >
                  Cancelar
                </button>
              </form>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Profile;

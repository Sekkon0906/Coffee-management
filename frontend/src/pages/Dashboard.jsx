// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { getLots } from "../api/lots";
import { getProviders } from "../api/providers";
import ProviderFormPanel from "../components/ProviderFormPanel";

function Dashboard({ activeSection = "resumen" }) {
  const [lots, setLots] = useState([]);
  const [selectedLot, setSelectedLot] = useState(null);

  const [providers, setProviders] = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [openProviderPanel, setOpenProviderPanel] = useState(false);

  // Lotes: se cargan una vez (para resumen/trazabilidad)
  useEffect(() => {
    getLots().then((data) => {
      const safeData = Array.isArray(data) ? data : [];
      setLots(safeData);
      if (safeData.length > 0) setSelectedLot(safeData[0]);
    });
  }, []);

  // Proveedores: se cargan cuando entras a la sección proveedores
  useEffect(() => {
    if (activeSection !== "proveedores") return;

    (async () => {
      try {
        setLoadingProviders(true);
        const data = await getProviders();
        setProviders(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingProviders(false);
      }
    })();
  }, [activeSection]);

  // métricas
  const totalLots = lots.length;
  const totalKg = lots.reduce(
    (sum, lot) => sum + Number(lot.quantity_kg || 0),
    0
  );
  const totalValue = lots.reduce(
    (sum, lot) =>
      sum +
      Number(lot.quantity_kg || 0) * Number(lot.price_per_kg || 0),
    0
  );
  const avgScore =
    lots.length > 0
      ? (
          lots.reduce(
            (sum, lot) => sum + Number(lot.quality_score || 0),
            0
          ) / lots.length
        ).toFixed(1)
      : 0;

  // ===== RESUMEN =====
  const renderResumen = () => {
    const maxKg =
      lots.length > 0
        ? Math.max(...lots.map((l) => Number(l.quantity_kg || 0)), 1)
        : 1;

    return (
      <>
        <section className="cards-row">
          <div className="card metric-card primary">
            <span className="card-label">Valor estimado inventario</span>
            <span className="card-value">
              ${totalValue.toLocaleString("es-CO")}
            </span>
            <span className="card-extra">Basado en kg × precio/kg</span>
          </div>

          <div className="card metric-card">
            <span className="card-label">Lotes activos</span>
            <span className="card-value">{totalLots}</span>
          </div>

          <div className="card metric-card">
            <span className="card-label">Kg totales</span>
            <span className="card-value">{totalKg.toFixed(2)} kg</span>
          </div>

          <div className="card metric-card">
            <span className="card-label">Puntaje promedio</span>
            <span className="card-value">{avgScore}</span>
          </div>
        </section>

        <section className="dashboard-grid">
          {/* GRÁFICA POR LOTE */}
          <div className="card chart-card">
            <div className="card-title-row">
              <h2>Distribución por lote (kg)</h2>
              <span className="card-subtitle">
                Cantidad vs nombre del lote
              </span>
            </div>

            <div className="bars-wrapper">
              {lots.length === 0 && (
                <p style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                  Aún no hay lotes registrados.
                </p>
              )}

              {lots.map((lot) => {
                const height =
                  (Number(lot.quantity_kg || 0) / maxKg) * 100;

                return (
                  <div
                    key={lot.id}
                    className={`bar-item ${
                      selectedLot && selectedLot.id === lot.id
                        ? "bar-item-active"
                        : ""
                    }`}
                    onClick={() => setSelectedLot(lot)}
                  >
                    <div
                      className="bar"
                      style={{ height: `${height}%` }}
                    />
                    <span className="bar-label">
                      {lot.name.length > 12
                        ? lot.name.slice(0, 12) + "…"
                        : lot.name}
                    </span>
                    <span className="bar-value">
                      {Number(lot.quantity_kg || 0).toFixed(0)} kg
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* DETALLE DE LOTE */}
          <div className="card detail-card">
            <div className="card-title-row">
              <h2>Detalle de lote</h2>
              <span className="card-subtitle">
                Información clave de trazabilidad
              </span>
            </div>

            {selectedLot ? (
              <div className="detail-content">
                <h3>{selectedLot.name}</h3>
                <p className="detail-tag">
                  Origen: <strong>{selectedLot.origin}</strong> · Proceso:{" "}
                  <strong>{selectedLot.process}</strong> · Proveedor:{" "}
                  <strong>{selectedLot.provider_name}</strong>
                </p>

                <div className="detail-grid">
                  <div className="detail-block">
                    <h4>Ficha de ingreso</h4>
                    <ul>
                      <li>
                        Peso recibido:{" "}
                        <strong>
                          {Number(
                            selectedLot.quantity_kg || 0
                          ).toFixed(2)}{" "}
                          kg
                        </strong>
                      </li>
                      <li>
                        Estado: <strong>{selectedLot.status}</strong>
                      </li>
                      <li>
                        Precio/kg:{" "}
                        <strong>
                          $
                          {Number(
                            selectedLot.price_per_kg || 0
                          ).toLocaleString("es-CO")}
                        </strong>
                      </li>
                    </ul>
                  </div>

                  <div className="detail-block">
                    <h4>Proceso de beneficio</h4>
                    <ul>
                      <li>
                        Beneficio / proceso:
                        <strong> {selectedLot.process}</strong>
                      </li>
                      <li>
                        Línea / destino:{" "}
                        <strong>Maquila / tostión</strong>
                      </li>
                      <li>
                        Servicios: <strong>Trilla, tueste, empaque</strong>
                      </li>
                    </ul>
                  </div>

                  <div className="detail-block">
                    <h4>Calidad sensorial</h4>
                    <ul>
                      <li>
                        Puntaje SCA:
                        <strong> {selectedLot.quality_score}</strong>
                      </li>
                      <li>
                        Aceptado para clientes:
                        <strong> Sí</strong>
                      </li>
                      <li>
                        Curva de tueste:
                        <strong> TU-0000.00.00.00</strong>
                      </li>
                    </ul>
                  </div>

                  <div className="detail-block">
                    <h4>Empaque y despacho</h4>
                    <ul>
                      <li>
                        Código de lote bolsas:
                        <strong> L-0000.00.00.00</strong>
                      </li>
                      <li>
                        Tipo de empaque:
                        <strong> Bolsa 340g / GrainPro</strong>
                      </li>
                      <li>
                        Estado empaque:
                        <strong> Óptimo</strong>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                No hay lotes seleccionados.
              </p>
            )}
          </div>
        </section>
      </>
    );
  };

  // ===== PROVEEDORES =====
  const handleProviderCreated = (prov) => {
    setProviders((prev) => [prov, ...prev]);
  };

  const renderProveedores = () => (
    <>
      <section className="cards-row">
        <div className="card metric-card primary">
          <span className="card-label">Proveedores registrados</span>
          <span className="card-value">{providers.length}</span>
          <span className="card-extra">
            Caficultores / distribuidores activos
          </span>
        </div>
      </section>

      <section className="card">
        <div className="card-title-row" style={{ marginBottom: 12 }}>
          <h2>Proveedores</h2>
          <span className="card-subtitle">
            Origen, contacto y región de cada proveedor.
          </span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 12,
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>
            {loadingProviders
              ? "Cargando proveedores..."
              : `Total: ${providers.length}`}
          </span>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setOpenProviderPanel(true)}
          >
            Agregar proveedor
          </button>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.85rem",
            }}
          >
            <thead>
              <tr style={{ textAlign: "left", color: "#6b7280" }}>
                <th>Nombre</th>
                <th>Contacto</th>
                <th>Teléfono</th>
                <th>Correo</th>
                <th>Región</th>
                <th>Municipio</th>
              </tr>
            </thead>
            <tbody>
              {providers.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.contact_name}</td>
                  <td>{p.phone}</td>
                  <td>{p.email}</td>
                  <td>{p.region}</td>
                  <td>{p.municipality}</td>
                </tr>
              ))}
              {providers.length === 0 && !loadingProviders && (
                <tr>
                  <td colSpan={6} style={{ paddingTop: 8 }}>
                    No hay proveedores registrados todavía.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <ProviderFormPanel
        open={openProviderPanel}
        onClose={() => setOpenProviderPanel(false)}
        onCreated={handleProviderCreated}
      />
    </>
  );

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Resumen operativo de lotes de café</p>
        </div>
      </header>

      <main className="dashboard-main">
        {activeSection === "proveedores" ? renderProveedores() : renderResumen()}
      </main>
    </div>
  );
}

export default Dashboard;

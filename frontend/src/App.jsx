// src/App.jsx
import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Traceability from "./pages/Traceability";
import "./index.css";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // secciones que vienen del Sidebar:
  // resumen, lotes, inventario, proveedores, trazabilidad, calidadTaza, perfil
  const [activeSection, setActiveSection] = useState("resumen");

  const renderContent = () => {
    switch (activeSection) {
      // Todo esto vive dentro del Dashboard principal (con sus tabs internas)
      case "resumen":
      case "lotes":
      case "inventario":
      case "proveedores":
      case "calidadTaza":
        return <Dashboard activeSection={activeSection} />;

      // Página de trazabilidad con timeline + formularios
      case "trazabilidad":
        return <Traceability />;

      // Mi perfil / panel admin
      case "perfil":
        return <Profile />;

      // fallback
      default:
        return <Dashboard activeSection="resumen" />;
    }
  };

  return (
    <div className="app-shell">
      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen((prev) => !prev)}
        activeSection={activeSection}
        onChangeSection={setActiveSection}
      />
      <main className="app-main">{renderContent()}</main>
    </div>
  );
}

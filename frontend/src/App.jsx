// src/App.jsx
import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Documents from "./pages/Documents";
import Profile from "./pages/Profile";
import Team from "./pages/Team";
import "./index.css";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // secciones que vienen del Sidebar: resumen, lotes, inventario,
  // proveedores, trazabilidad, calidadTaza, documentos, equipo, perfil
  const [activeSection, setActiveSection] = useState("resumen");

  const renderContent = () => {
    switch (activeSection) {
      // Todo esto vive dentro del Dashboard principal (con sus tabs internas)
      case "resumen":
      case "lotes":
      case "inventario":
      case "proveedores":
      case "trazabilidad":
      case "calidadTaza":
        return <Dashboard activeSection={activeSection} />;

      // Documentos PDF
      case "documentos":
        return <Documents />;

      // Equipo y roles
      case "equipo":
        return <Team />;

      // Mi perfil / panel admin
      case "perfil":
        return <Profile />;

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

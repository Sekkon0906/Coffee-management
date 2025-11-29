// src/App.jsx
import { useState } from "react";
import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import LotsMaster from "./pages/LotsMaster";
import Inventory from "./pages/Inventory";
import QualityDashboard from "./pages/QualityDashboard";

import Profile from "./pages/Profile";
import Traceability from "./pages/Traceability";
import ProvidersPage from "./pages/Providers";

import "./index.css";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // secciones que vienen del Sidebar:
  // resumen, lotes, inventario, proveedores, trazabilidad, calidadTaza, perfil
  const [activeSection, setActiveSection] = useState("resumen");

  const renderContent = () => {
    switch (activeSection) {
      case "resumen":
        return <Dashboard activeSection="resumen" />;

      case "lotes":
        return <LotsMaster />;

      case "inventario":
        return <Inventory />;

      case "calidadTaza":
        return <QualityDashboard />;

      case "proveedores":
        return <ProvidersPage />;

      case "trazabilidad":
        return <Traceability />;

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

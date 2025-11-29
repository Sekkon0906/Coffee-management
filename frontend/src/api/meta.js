// src/App.jsx
import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";

// Páginas que ya tienes creadas
import Analytics from "./pages/Analytics";
import Calendar from "./pages/Calendar";
import Documents from "./pages/Documents";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import Team from "./pages/Team";

import "./index.css";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("resumen");

  let content;

  switch (activeSection) {
    // ===== GENERAL =====
    case "resumen":
      // Dashboard en modo resumen global
      content = <Dashboard activeSection="resumen" />;
      break;

    // ===== OPERACIÓN =====
    case "lotes":
      // Por ahora puedes usar Analytics.jsx como página de LOTES
      // luego la cambiamos por una Lots.jsx dedicada
      content = <Analytics />;
      break;

    case "inventario":
      // Placeholder: usa Calendar.jsx como vista de inventario
      // luego la renombramos a Inventory.jsx si quieres
      content = <Calendar />;
      break;

    case "proveedores":
      // Reutilizamos Dashboard pero en modo "proveedores"
      content = <Dashboard activeSection="proveedores" />;
      break;

    // ===== CALIDAD Y TRAZABILIDAD =====
    case "trazabilidad":
      // Puedes usar Notifications.jsx como placeholder
      content = <Notifications />;
      break;

    case "calidadTaza":
      // Otra vista, por ahora Documents o la que prefieras
      content = <Documents />;
      break;

    case "documentos":
      content = <Documents />;
      break;

    // ===== CONFIGURACIÓN =====
    case "equipo":
      content = <Team />;
      break;

    case "perfil":
      content = <Profile />;
      break;

    // Fallback: si algo raro llega, volvemos al resumen
    default:
      content = <Dashboard activeSection="resumen" />;
      break;
  }

  return (
    <div className="app-shell">
      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen((prev) => !prev)}
        activeSection={activeSection}
        onChangeSection={setActiveSection}
      />

      <main className="app-main">{content}</main>
    </div>
  );
}

// src/layouts/AppLayout.jsx
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("resumen");

  const handleChangeSection = (id) => {
    setActiveSection(id);
  };

  let content;

  switch (activeSection) {
    // aquí envías a la página de perfil / admin
    case "perfil":
    case "equipo": // si quieres que "Equipo y roles" también use esta vista
      content = <Profile />;
      break;

    // el resto lo maneja el Dashboard internamente
    default:
      content = <Dashboard activeSection={activeSection} />;
      break;
  }

  return (
    <div className="app-shell">
      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen((o) => !o)}
        activeSection={activeSection}
        onChangeSection={handleChangeSection}
      />
      <div className="app-main">{content}</div>
    </div>
  );
}

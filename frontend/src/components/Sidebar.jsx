import { NavLink, useLocation } from "react-router-dom";
import { useMemo, useState } from "react";

const navItems = [
  { path: "/app/dashboard", label: "Dashboard", icon: "📊" },
  { path: "/app/analytics", label: "Analytics", icon: "📈" },
  { path: "/app/team", label: "Team", icon: "👥" },
  { path: "/app/calendar", label: "Calendario", icon: "📅" },
  { path: "/app/notifications", label: "Notificaciones", icon: "🔔" },
  { path: "/app/documents", label: "Documentos", icon: "📄" },
  { path: "/app/profile", label: "Perfil", icon: "👤" },
];

function Sidebar() {
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(false);

  const activeIndex = useMemo(
    () => navItems.findIndex((item) => location.pathname.startsWith(item.path)),
    [location.pathname]
  );

  const indicatorStyle = {
    transform: `translateY(${activeIndex * 64}px)`,
  };

  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
    document.documentElement.setAttribute(
      "data-theme",
      !darkMode ? "dark" : "light"
    );
  };

  return (
    <aside className="sidebar">
      <div className="sidebar__inner">
        {activeIndex >= 0 && (
          <div className="sidebar__indicator" style={indicatorStyle} />
        )}

        <nav className="sidebar__menu">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                "sidebar__item" + (isActive ? " sidebar__item--active" : "")
              }
            >
              <span className="sidebar__icon">{item.icon}</span>
            </NavLink>
          ))}
        </nav>

        <button
          className="sidebar__item sidebar__item--mode"
          onClick={toggleTheme}
        >
          <span className="sidebar__icon">{darkMode ? "🌙" : "☀️"}</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;

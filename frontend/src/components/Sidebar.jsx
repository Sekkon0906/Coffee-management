// src/components/Sidebar.jsx
import { useEffect, useState } from "react";

const MENU_SECTIONS = [
  {
    id: "general",
    label: "General",
    items: [{ id: "resumen", label: "Resumen" }],
  },
  {
    id: "operacion",
    label: "Operación",
    items: [
      { id: "lotes", label: "Lotes de café" },
      { id: "inventario", label: "Inventario" },
      { id: "proveedores", label: "Proveedores" },
    ],
  },
  {
    id: "calidad",
    label: "Calidad y trazabilidad",
    items: [
      { id: "trazabilidad", label: "Trazabilidad" },
      { id: "calidadTaza", label: "Calidad de taza" },
    ],
  },
  {
    id: "config",
    label: "Configuración",
    items: [
      { id: "perfil", label: "Mi perfil" },
    ],
  },
];

export default function Sidebar({
  open,
  onToggle,
  activeSection = "resumen",
  onChangeSection,
}) {
  const [active, setActive] = useState(activeSection);

  useEffect(() => {
    setActive(activeSection);
  }, [activeSection]);

  const user = {
    nombre: "Cafetería Demo",
    email: "contacto@cafedemo.com",
  };

  const inicial = user.nombre?.charAt(0)?.toUpperCase() ?? "C";

  const handleClick = (id) => {
    setActive(id);
    onChangeSection?.(id);
  };

  return (
    <aside
      className={`sidebar-v2 ${
        open ? "sidebar-v2--open" : "sidebar-v2--collapsed"
      }`}
    >
      <button
        className="sidebar-v2__toggle"
        onClick={onToggle}
        aria-label="Alternar menú"
        type="button"
      >
        <span />
        <span />
        <span />
      </button>

      <div className="sidebar-v2__profile">
        <div className="sidebar-v2__avatar">{inicial}</div>
        <div className="sidebar-v2__user-info">
          <div className="sidebar-v2__user-name">{user.nombre}</div>
          <div className="sidebar-v2__user-email">{user.email}</div>
        </div>
      </div>

      <nav className="sidebar-v2__menu">
        {MENU_SECTIONS.map((section) => {
          const sectionIsActive = section.items.some(
            (item) => item.id === active
          );

          return (
            <div
              key={section.id}
              className={`sidebar-v2__section ${
                sectionIsActive ? "active" : ""
              }`}
            >
              <div className="sidebar-v2__section-label">
                {section.label}
              </div>

              {section.items.map((item) => (
                <button
                  key={item.id}
                  className={`sidebar-v2__item ${
                    active === item.id ? "is-active" : ""
                  }`}
                  onClick={() => handleClick(item.id)}
                  type="button"
                >
                  <span className="sidebar-v2__item-dot" />
                  <span className="sidebar-v2__item-label">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

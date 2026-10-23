# CoffeeOps (Coffee-management)

Aplicación web para gestionar la operación de un beneficio o tostadora de café: lotes, proveedores, trazabilidad por etapas del proceso, inventario por movimientos y calidad de taza. Genera fichas PDF de cada etapa.

> **Estado:** propuesta de desarrollo que quedó en fase beta. No se siguió desarrollando; el código muestra hasta dónde llegó la propuesta.

## Qué es

Un monorepo con dos partes:

- **`backend/`:** API REST en Node.js/Express sobre MySQL.
- **`frontend/`:** SPA en React (Vite) con un menú lateral de secciones.

Los datos se guardan con un `company_id`, pero por ahora el backend usa una empresa fija (`DEFAULT_COMPANY_ID = 1`) y no tiene inicio de sesión activo.

## Arquitectura

```
  Navegador
     │
     ▼
  React 19 + Vite (frontend/, :5173)
     │  fetch / axios ── proxy /api → :4000
     ▼
  Express (backend/src/index.js, :4000)
     ├─ /api/lots            lotes y maestro de lotes
     ├─ /api/providers       proveedores (CRUD)
     ├─ /api/traceability    etapas del lote + PDFs (pdfkit)
     └─ /api/admin           destinos, líneas de café, servicios
     │
     ▼
  MySQL (mysql2/promise, pool)
```

## Herramientas e infraestructura

| Capa | Herramienta |
|------|-------------|
| Frontend | React 19, Vite (rolldown-vite 7), axios, ESLint |
| Backend | Node.js, Express 4, cors, dotenv, nodemon |
| Base de datos | MySQL, con el driver `mysql2` |
| Documentos | pdfkit para generar las fichas de trazabilidad |
| Configuración | `backend/.env` (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`, `PORT`, `JWT_SECRET`) y `frontend/.env` (`VITE_API_URL`) |

## Funcionalidades

Estas son las secciones del menú lateral:

- **Resumen:** panel con datos de lotes y proveedores.
- **Lotes de café:** maestro de lotes con filtros por texto, proveedor, estado y línea de café. Permite registrar un lote nuevo (ingreso de materia prima) y abrir su PDF.
- **Inventario:** resumen de existencias y movimientos (kg) con filtros por proveedor, línea, estado y fechas.
- **Proveedores:** listado, alta, edición y baja.
- **Trazabilidad:** formulario por etapa para cada lote: ingreso, trilla, tueste, cata, empaque, despacho e inspección. Cada etapa tiene su PDF, y también hay un PDF con la trazabilidad completa.
- **Calidad de taza:** ranking de lotes y de proveedores por puntaje de cata, historial por proveedor y registro de catas (puntaje total, aceptado o no, atributos en JSON).
- **Mi perfil:** configuración de catálogos: destinos, líneas de café y servicios.

## Cómo correrlo

Requisitos: Node.js 18 o superior y un servidor MySQL con la base ya creada.

> El repositorio no incluye el esquema completo. Solo trae `backend/sql/stock_movements.sql`. Las tablas que usa el código son `lots`, `lot_intakes`, `lot_trillings`, `lot_roastings`, `lot_cuppings`, `lot_packagings`, `lot_dispatches`, `lot_inspections`, `providers`, `coffee_lines`, `destinations`, `services`, `stock_movements`, `inventory_movements`, `companies` y `users`. Hay que crearlas a mano.

```bash
# Backend
cd backend
npm ci
# definir las variables de backend/.env
npm run dev          # o npm start → http://localhost:4000

# Frontend (otra terminal)
cd frontend
npm ci
npm run dev          # http://localhost:5173
npm run build        # build de producción en dist/
```

Comprobado: `npm run build` del frontend compila sin errores, y el backend arranca y responde `GET /api/db-test`. Las rutas que consultan la base de datos necesitan MySQL con el esquema creado.

## Estructura

```
Coffee-management/
├── backend/
│   ├── sql/stock_movements.sql
│   └── src/
│       ├── index.js          # Punto de entrada (monta las rutas activas)
│       ├── app.js            # Variante alternativa, no se usa
│       ├── config/db.js      # Pool MySQL
│       ├── controllers/      # lots, lotsMaster, providers, traceability, inventory, quality, adminConfig, auth
│       ├── routes/
│       ├── middleware/auth.js# Middleware JWT (no está montado)
│       └── utils/stockMovements.js
├── frontend/
│   └── src/
│       ├── App.jsx           # Navegación por secciones (sin router)
│       ├── api/              # Clientes HTTP por módulo
│       ├── components/       # Sidebar, LotFormPanel, ProviderFormPanel
│       ├── layouts/
│       └── pages/            # Dashboard, LotsMaster, Inventory, Providers, Traceability, QualityDashboard, Profile
└── package.json              # Dependencias sueltas en la raíz (no las usa ningún script)
```

## Estado

Propuesta de desarrollo en fase beta, sin continuar. Lo que habría faltado para cerrarla:

- `backend/src/index.js` no monta `/api/inventory` ni `/api/quality`, aunque las rutas y los controladores existen. Por eso las pantallas de Inventario y Calidad de taza reciben 404 hasta que se registren.
- La autenticación (registro y login con JWT y bcrypt) está escrita pero no se monta. Además, `bcryptjs` y `jsonwebtoken` no están en `backend/package.json`.
- Falta el script SQL completo del esquema.
- La sección Analytics es un placeholder y no está en el menú. No existen todavía módulos de documentos ni de equipo.
- Algunas llamadas del frontend usan `http://localhost:4000` fijo en lugar de `VITE_API_URL` o del proxy.
- `backend/.env` y `frontend/.env` están versionados. Conviene sacarlos del repositorio y usar un `.env.example`.

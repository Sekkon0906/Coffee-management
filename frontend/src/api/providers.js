// frontend/src/api/providers.js

// Si ya usas VITE_API_URL en otros módulos, respétalo.
// Si no, por defecto usa http://localhost:4000
const BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:4000";

const PROVIDERS_URL = `${BASE_URL}/api/providers`;

// ----------------------------------------------------
// GET /api/providers  -> devuelve array de proveedores
// ----------------------------------------------------
export async function getProviders() {
  const res = await fetch(PROVIDERS_URL);

  if (!res.ok) {
    console.error("Error HTTP getProviders:", res.status);
    throw new Error("Error cargando proveedores");
  }

  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

// ----------------------------------------------------
// POST /api/providers  -> crea proveedor
// body: { name, contact_name, phone, email, region, municipality }
// ----------------------------------------------------
export async function createProvider(payload) {
  const res = await fetch(PROVIDERS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // si el backend no responde JSON, dejamos data = null
  }

  if (!res.ok) {
    const msg =
      data?.message ||
      data?.error ||
      `Error creando proveedor (status ${res.status})`;
    console.error("createProvider error:", msg);
    throw new Error(msg);
  }

  return data;
}

// ----------------------------------------------------
// PUT /api/providers/:id  -> actualiza proveedor
// ----------------------------------------------------
export async function updateProvider(id, payload) {
  const res = await fetch(`${PROVIDERS_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const msg =
      data?.message ||
      data?.error ||
      `Error actualizando proveedor (status ${res.status})`;
    console.error("updateProvider error:", msg);
    throw new Error(msg);
  }

  return data;
}

// ----------------------------------------------------
// DELETE /api/providers/:id  -> elimina proveedor
// ----------------------------------------------------
export async function deleteProvider(id) {
  const res = await fetch(`${PROVIDERS_URL}/${id}`, {
    method: "DELETE",
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const msg =
      data?.message ||
      data?.error ||
      `Error eliminando proveedor (status ${res.status})`;
    console.error("deleteProvider error:", msg);
    throw new Error(msg);
  }

  return data;
}

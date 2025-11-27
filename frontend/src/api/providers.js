// src/api/providers.js
export async function getProviders() {
  const res = await fetch("/api/providers");
  if (!res.ok) throw new Error("Error cargando proveedores");
  return res.json();
}

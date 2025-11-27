async function request(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Error HTTP" + res.status);
  return res.json();
}

export function getInventorySummary() {
  return request("/api/inventory/summary");
}

export function getInventoryMovements(filters = {}) {
  const query = new URLSearchParams(filters).toString();
  const url = query ? `/api/inventory/movements?${query}` : "/api/inventory/movements";
  return request(url);
}

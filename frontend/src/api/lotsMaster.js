async function request(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Error cargando lotes");
  return res.json();
}

export function getLotsMaster(params = {}) {
  const query = new URLSearchParams(params).toString();
  const url = query ? `/api/lots/master?${query}` : "/api/lots/master";
  return request(url);
}

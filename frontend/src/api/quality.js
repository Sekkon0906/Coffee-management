async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error("Error de servidor");
  return res.json();
}

export function getTopLots(limit = 5) {
  return request(`/api/quality/top-lots?limit=${limit}`);
}

export function getTopProviders(limit = 5) {
  return request(`/api/quality/top-providers?limit=${limit}`);
}

export function getProviderHistory(providerId) {
  return request(`/api/quality/provider-history/${providerId}`);
}

export function getCuppingDetail(cuppingId) {
  return request(`/api/quality/cupping/${cuppingId}`);
}

export function saveCupping(payload) {
  return request(`/api/quality/cupping`, {
    method: payload.id ? "PUT" : "POST",
    body: JSON.stringify(payload),
  });
}

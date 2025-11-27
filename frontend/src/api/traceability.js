// src/api/traceability.js

// Pequeño helper para no repetir código
async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || `Error HTTP ${res.status}`);
  }

  return res.json();
}

// ================== SAVE ENDPOINTS ==================

export function saveIntake(lotId, payload) {
  return request(`/api/traceability/${lotId}/intake`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function saveTrilla(lotId, payload) {
  return request(`/api/traceability/${lotId}/trilla`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function saveTueste(lotId, payload) {
  return request(`/api/traceability/${lotId}/tueste`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function saveCata(lotId, payload) {
  return request(`/api/traceability/${lotId}/cata`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function saveEmpaque(lotId, payload) {
  return request(`/api/traceability/${lotId}/empaque`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function saveDespacho(lotId, payload) {
  return request(`/api/traceability/${lotId}/despacho`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function saveInspeccion(lotId, payload) {
  return request(`/api/traceability/${lotId}/inspeccion`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ================== OPEN PDF ==================

/**
 * step:
 *  - "intake"
 *  - "trilla"
 *  - "tueste"
 *  - "cata"
 *  - "empaque"
 *  - "despacho"
 *  - "inspeccion"
 *  - "full" (ficha completa)
 */
export function openPdf(lotId, step) {
  if (!lotId) return;

  let pdfSlug = step;

  // por si algún día quieres aliasar nombres
  if (step === "fullTrace" || step === "full") {
    pdfSlug = "full";
  }

  const url = `/api/traceability/${lotId}/pdf/${pdfSlug}`;

  // abre en nueva pestaña
  window.open(url, "_blank", "noopener,noreferrer");
}

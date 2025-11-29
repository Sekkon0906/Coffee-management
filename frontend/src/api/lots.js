// src/api/lots.js

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

// Lista de lotes (la que ya tenías)
export async function getLots() {
  try {
    const res = await fetch(`${API_URL}/lots`);
    return await res.json();
  } catch (error) {
    console.error("Error fetching lots:", error);
    return [];
  }
}

/**
 * Crea un registro de ingreso (intake) para un lote.
 * Ajusta la URL si tu backend usa otra ruta.
 */
export async function createLotIntake(lotId, payload) {
  const res = await fetch(`${API_URL}/lots/${lotId}/intakes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Error creando ingreso de lote: ${res.status} ${res.statusText} - ${text}`
    );
  }

  return res.json();
}

import { apiFetch } from "./client";
import { state } from "../state";
import { getAccessToken } from "./client";

export async function loadRecomendaciones() {
  if (!getAccessToken()) return;

  try {
    const response = await apiFetch("/api/recommendations");
    if (!response.ok) return;

    const data = await response.json();
    if (Array.isArray(data)) {
      // Mapea respuesta del backend como se hace con loadMovimientos
      state.finanzas.recomendaciones = data.map((rec) => ({
        id: rec.id,
        title: rec.title || "",
        body: rec.body || "",
        severity: rec.severity || "info",
        source: rec.source || "ia",
        date: rec.date || "",
        category: rec.category || "",
        wasRead: rec.wasRead || false,
      }));
    } else {
      state.finanzas.recomendaciones = [];
    }
  } catch (error) {
    console.warn("Error cargando recomendaciones:", error);
    state.finanzas.recomendaciones = [];
  }
}

export async function loadHistoricalRecommendations() {
  if (!getAccessToken()) return;

  try {
    const response = await apiFetch("/api/recommendations/historia");
    if (!response.ok) return;

    const data = await response.json();
    if (Array.isArray(data)) {
      state.finanzas.recomendaciones = data;
    }
  } catch (error) {
    console.warn("Error cargando historial de recomendaciones:", error);
  }
}

export async function generateAiRecommendations() {
  const response = await apiFetch("/api/recommendations/generate-ai", {
    method: "POST",
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || "No se pudieron generar recomendaciones");
  }
  const newRecs = await response.json();
  if (Array.isArray(newRecs)) {
    state.finanzas.recomendaciones = [
      ...newRecs,
      ...(state.finanzas.recomendaciones || []),
    ];
  }
  return newRecs;
}

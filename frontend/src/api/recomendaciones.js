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
      state.finanzas.recomendaciones = data;
    }
  } catch (error) {
    console.warn("Error cargando recomendaciones:", error);
  }
}

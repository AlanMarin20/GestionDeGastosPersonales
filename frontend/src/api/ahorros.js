import { state } from "../state";
import { getAccessToken, apiFetch } from "./client";

export async function loadAhorros() {
  if (!getAccessToken()) return;

  try {
    const response = await apiFetch("/api/savings-goals");
    if (!response.ok) {
      console.warn("No se pudieron cargar los ahorros");
      return;
    }
    const ahorros = await response.json();
    if (Array.isArray(ahorros)) {
      state.dashboard.ahorros = ahorros.map((g) => ({
        id: g.id,
        nombre: g.nombre,
        monto: Number(g.currentAmount),
        meta: Number(g.targetAmount) > 0 ? Number(g.targetAmount) : undefined,
      }));
    }
  } catch (error) {
    console.warn("Error cargando ahorros:", error);
  }
}

export async function createAhorro({ nombre, montoInicial, meta }) {
  const response = await apiFetch("/api/savings-goals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: nombre,
      currentAmount: montoInicial || 0,
      targetAmount: meta || 0,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const msg = Array.isArray(err.message)
      ? err.message.join(", ")
      : err.message || "Error al crear el ahorro";
    throw new Error(msg);
  }

  return response.json();
}

export async function updateAhorro(id, { nombre, montoInicial, meta }) {
  const body = {};
  if (nombre !== undefined) body.name = nombre;
  if (montoInicial !== undefined) body.currentAmount = montoInicial;
  if (meta !== undefined) body.targetAmount = meta;

  const response = await apiFetch(`/api/savings-goals/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const msg = Array.isArray(err.message)
      ? err.message.join(", ")
      : err.message || "Error al actualizar el ahorro";
    throw new Error(msg);
  }

  return response.json();
}

export async function deleteAhorro(id) {
  const response = await apiFetch(`/api/savings-goals/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Error al eliminar el ahorro");
  }
}

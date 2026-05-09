import { ACCESS_TOKEN_KEY } from "../config";
import { state } from "../state";
import { getAccessToken, apiFetch } from "./client";

export function syncProfileFromUser(user) {
  if (!user) return;

  state.currentUser = user;
  state.profileLoaded = true;
  state.perfil = {
    ...state.perfil,
    id: user.id ?? state.perfil.id,
    nombre: user.name ?? state.perfil.nombre,
    email: user.email ?? state.perfil.email,
  };
}

export async function loadCurrentUser() {
  const accessToken = getAccessToken();

  if (!accessToken) {
    state.currentUser = null;
    state.profileLoaded = true;
    return null;
  }

  try {
    const response = await apiFetch("/api/auth/me");

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
      }
      state.currentUser = null;
      state.profileLoaded = true;
      return null;
    }

    const user = await response.json();
    syncProfileFromUser(user);
    return user;
  } catch {
    state.currentUser = null;
    state.profileLoaded = true;
    return null;
  }
}

export async function loadDashboardBalances() {
  const accessToken = getAccessToken();

  if (!accessToken) return;

  try {
    const response = await apiFetch("/api/balances/current");

    if (!response.ok) {
      console.warn("No se pudieron cargar los balances desde la API");
      return;
    }

    const balances = await response.json();

    if (balances && typeof balances === "object") {
      state.finanzas.balancesData = {
        ingreso: Number(balances.ingreso ?? 0),
        egreso: Number(balances.egreso ?? 0),
        ahorro: Number(balances.ahorro ?? 0),
      };
    }
  } catch (error) {
    console.warn("Error cargando balances:", error);
  }
}

export async function loadMovimientos() {
  if (!getAccessToken()) return;

  try {
    const response = await apiFetch("/api/movimientos");

    if (!response.ok) {
      console.warn("No se pudieron cargar los movimientos desde la API");
      return;
    }

    const movimientos = await response.json();

    if (Array.isArray(movimientos)) {
      state.finanzas.gastos = movimientos.map((m) => ({
        id: m.id,
        comercio: m.comercio ?? "-",
        categoria: m.categoria ?? "Sin categoría",
        descripcion: m.descripcion ?? "",
        fecha: m.fecha,
        monto: Number(m.monto),
        tipo: m.tipo,
      }));
    }
  } catch (error) {
    console.warn("Error cargando movimientos:", error);
  }
}

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
    const response = await apiFetch("/api/balances/dashboard");

    if (!response.ok) {
      console.warn("No se pudieron cargar los balances desde la API");
      return;
    }

    const balances = await response.json();

    if (balances && typeof balances === "object") {
      state.finanzas.balancesData = {
        ingreso: Number(balances.ingreso ?? 0),
        egreso: Number(balances.gastoMensual ?? balances.egreso ?? 0),
        ahorro: Number(balances.ahorroAcumulado ?? balances.ahorro ?? 0),
        disponible: Number(balances.dineroDisponible ?? 0),
      };
    }
  } catch (error) {
    console.warn("Error cargando balances:", error);
  }
}

function getCurrentMonthKey() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${now.getFullYear()}-${month}`;
}

export async function loadMovimientos() {
  if (!getAccessToken()) return;

  const currentMonthKey = getCurrentMonthKey();
  state.finanzas.currentPeriod = currentMonthKey;
  state.finanzas.filtros.periodo = currentMonthKey;

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
        fecha: typeof m.fecha === "string" ? m.fecha.slice(0, 10) : m.fecha,
        monto: Number(m.monto),
        tipo: m.tipo,
        esTransferenciaInterna: m.esTransferenciaInterna ?? false,
        etiquetas: Array.isArray(m.etiquetas) ? m.etiquetas : [],
      }));
    }
  } catch (error) {
    console.warn("Error cargando movimientos:", error);
  }
}

export async function requestPasswordReset(email) {
  const response = await apiFetch("/api/auth/request-password-reset", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || "No se pudo enviar el código");
  }
}

export async function verifyResetCode(email, code) {
  const response = await apiFetch("/api/auth/verify-reset-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || "Código inválido o expirado");
  }
}

export async function resetPassword(email, code, newPassword) {
  const response = await apiFetch("/api/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code, newPassword }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || "No se pudo actualizar la contraseña");
  }
}

export async function registerUser(name, email, password) {
  const response = await apiFetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message = Array.isArray(body.message) ? body.message[0] : body.message;
    throw new Error(message || "No se pudo crear la cuenta");
  }
}

export async function verifyRegistrationEmail(email, code) {
  const response = await apiFetch("/api/auth/verify-registration-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || "Código inválido o expirado");
  }
}

export async function resendRegistrationCode(email) {
  const response = await apiFetch("/api/auth/resend-registration-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || "No se pudo reenviar el código");
  }
}

export async function changePassword(currentPassword, newPassword) {
  const response = await apiFetch("/api/auth/change-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || "No se pudo cambiar la contraseña");
  }
}

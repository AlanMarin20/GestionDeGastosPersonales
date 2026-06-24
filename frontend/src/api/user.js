import { ACCESS_TOKEN_KEY } from "../config";
import { state } from "../state";
import { getAccessToken, apiFetch } from "./client";

function getCurrentMonthKey() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${now.getFullYear()}-${month}`;
}

export function isUserAsesor() {
  return (
    Array.isArray(state.currentUser?.roles) &&
    state.currentUser.roles.includes('asesor')
  );
}

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
      const ingreso = Number(balances.ingreso ?? 0);
      const egreso = Number(balances.egreso ?? 0);
      const ahorro = Number(balances.ahorro ?? 0);
      state.finanzas.balancesData = {
        ingreso,
        egreso,
        ahorro,
        disponible: ingreso - egreso - ahorro,
      };
    }

    const chartResponse = await apiFetch("/api/balances/grafico-gastos");
    if (chartResponse.ok) {
      const chartData = await chartResponse.json();
      state.finanzas.dashboardGastosPorMes = Array.isArray(chartData?.meses)
        ? chartData.meses
            .slice()
            .reverse()
            .map((item) => ({
              label: item.label ?? String(item.mes ?? ""),
              total: Number(item.total ?? 0),
            }))
        : [];
    } else {
      state.finanzas.dashboardGastosPorMes = [];
    }

    const currentMonthKey = getCurrentMonthKey();
    const catResponse = await apiFetch(`/api/movimientos/grafico-categorias?periodo=${currentMonthKey}`);
    if (catResponse.ok) {
      const catData = await catResponse.json();
      state.finanzas.dashboardGraficoCategorias = Array.isArray(catData?.categorias)
        ? catData.categorias.map((item) => ({
            label: item.categoria,
            total: Number(item.total),
            porcentaje: Number(item.porcentaje),
          }))
        : [];
    } else {
      state.finanzas.dashboardGraficoCategorias = [];
    }

  } catch (error) {
    console.warn("Error cargando balances:", error);
  }
}

// Nota: la carga específica de movimientos para el widget de "Transacciones Recientes" fue removida.

export async function loadMovimientos(options = {}) {
  if (!getAccessToken()) return;

  const currentMonthKey = getCurrentMonthKey();
  state.finanzas.currentPeriod = currentMonthKey;
  if (!state.finanzas.filtros.periodo) {
    state.finanzas.filtros.periodo = "todos";
  }

  const { search, tipo, fechaDesde, fechaHasta, periodo } = state.finanzas.filtros;

  const params = new URLSearchParams();
  if (search && search.trim()) params.append("search", search.trim());
  if (tipo && tipo !== "Todos") params.append("tipo", tipo);
  if (fechaDesde) params.append("fechaDesde", fechaDesde);
  if (fechaHasta) params.append("fechaHasta", fechaHasta);
  if (periodo && periodo !== "todos" && periodo !== "Todos") params.append("periodo", periodo);

  if (options.all) {
    params.append("all", "true");
  }

  const queryString = params.toString() ? `?${params.toString()}` : "";

  try {
    const response = await apiFetch(`/api/movimientos${queryString}`);

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

export async function apiGenerateLinkCode() {
  const response = await apiFetch('/api/auth/generate-link-code', {
    method: 'POST',
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || 'No se pudo generar el código');
  }
  return response.json();
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

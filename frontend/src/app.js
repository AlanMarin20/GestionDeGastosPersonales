import { attachGlobalNavigation } from "./handlers/navigation";
import { installGlobalImageErrorHandler } from "./ui/imageErrors";
import {
  applyTheme,
  loadAppPreferences,
  applyAccessibilityPreferences,
  resolveThemeForPath,
} from "./ui/theme";
import { initCharts } from "./ui/charts";
import { attachFormHandlers } from "./handlers/forms/index.js";
import { closeLandingMobileMenu } from "./handlers/mobileMenu";
import { closeDashboardDropdowns } from "./handlers/dropdowns";
// NOTA: closeLandingMobileMenu y closeDashboardDropdowns son usados dentro de navigate()
import { getAccessToken } from "./api/client";
import {
  loadCurrentUser,
  loadDashboardBalances,
  loadMovimientos,
} from "./api/user";
import { loadAhorros } from "./api/ahorros";
import { loadRecomendaciones } from "./api/recomendaciones";
import { loadBudgets } from "./api/budgets";
import { loadCategories } from "./api/categories";
import { loadTags } from "./api/tags";
import {
  loadAsesorClientes,
  loadClienteDetalle,
  loadClienteMovimientos,
  loadClienteRecomendaciones,
  loadClienteGastosPorMes,
  loadClienteGraficoCategorias,
  loadAllAsesorRecomendaciones,
} from "./api/asesor";
import { state } from "./state";
import { DEFAULT_PROFILE_IMAGE } from "./config";
import { normalizeThemeMode } from "./utils/format";
import { buildRouteView, isProtectedRoute, hasAuthenticatedSession } from "./router";

const appRoot = document.getElementById("root");

export function navigate(path, replace = false) {
  closeLandingMobileMenu();
  closeDashboardDropdowns();

  if (!String(path).startsWith("/cliente/")) {
    state.asesor.clienteSeleccionadoId = null;
  }

  if (replace) {
    history.replaceState({}, "", path);
  } else {
    history.pushState({}, "", path);
  }
  render();

  if (String(path).startsWith("/cliente/")) {
    const match = String(path).match(/^\/cliente\/([^/?#]+)/);
    if (match) {
      const clienteId = decodeURIComponent(match[1]);
      state.detalleCliente.gastos = [];
      state.detalleCliente.recomendaciones = [];
      state.detalleCliente.gastosPorMes = [];
      state.detalleCliente.graficoCategorias = { porcentaje: 0, categorias: [] };
      Promise.all([
        loadClienteDetalle(clienteId),
        loadClienteMovimientos(clienteId),
        loadClienteRecomendaciones(clienteId),
        loadClienteGastosPorMes(clienteId),
        loadClienteGraficoCategorias(clienteId),
      ]).then(() => render());
    }
  }
}

let lastPathname = null;

export function render() {
  const pathname = window.location.pathname;

  if (isProtectedRoute(pathname) && !hasAuthenticatedSession()) {
    navigate("/login", true);
    return;
  }

  const isDarkTheme = resolveThemeForPath(pathname);
  state.configuracion.temaOscuro = isDarkTheme;
  applyTheme(isDarkTheme);
  applyAccessibilityPreferences();

  // Limpiar backdrops de Bootstrap en caso de navegación rápida desde menús desplegables
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';

  // Guardar el estado del elemento enfocado y la posición del scroll (si seguimos en la misma ruta)
  const focusedElementId = document.activeElement?.id;
  const cursorPosition = document.activeElement?.selectionStart;

  const scrollContainer = document.getElementById("main-content-wrapper");
  const scrollTop = (scrollContainer && lastPathname === pathname) ? scrollContainer.scrollTop : 0;
  const scrollLeft = (scrollContainer && lastPathname === pathname) ? scrollContainer.scrollLeft : 0;

  lastPathname = pathname;

  const view = buildRouteView(pathname);

  if (!view) {
    navigate("/", true);
    return;
  }

  appRoot.innerHTML = view;
  attachFormHandlers(pathname, { navigate, render });
  initCharts(pathname);

  // Restaurar el focus y la posición del cursor
  if (focusedElementId) {
    const element = document.getElementById(focusedElementId);
    if (element) {
      element.focus();
      if (typeof cursorPosition === 'number' && element.setSelectionRange) {
        element.setSelectionRange(cursorPosition, cursorPosition);
      }
    }
  }

  // Restaurar posición de scroll del wrapper principal
  if (scrollTop || scrollLeft) {
    const newScrollContainer = document.getElementById("main-content-wrapper");
    if (newScrollContainer) {
      newScrollContainer.scrollTop = scrollTop;
      newScrollContainer.scrollLeft = scrollLeft;
    }
  }
}

export function init() {
  attachGlobalNavigation({ navigate, render });
  installGlobalImageErrorHandler();

  const persistedPreferences = loadAppPreferences();
  Object.assign(state.configuracion, persistedPreferences);
  state.perfil.imagePreview =
    persistedPreferences.imagePreview ||
    state.perfil.imagePreview ||
    DEFAULT_PROFILE_IMAGE;
  state.configuracion.temaOscuro = resolveThemeForPath(window.location.pathname);
  applyTheme(state.configuracion.temaOscuro);
  applyAccessibilityPreferences();

  const systemThemeMedia = window.matchMedia("(prefers-color-scheme: dark)");
  const handleSystemThemeChange = () => {
    if (normalizeThemeMode(state.configuracion.tema) === "system") {
      render();
    }
  };
  if (typeof systemThemeMedia.addEventListener === "function") {
    systemThemeMedia.addEventListener("change", handleSystemThemeChange);
  } else if (typeof systemThemeMedia.addListener === "function") {
    systemThemeMedia.addListener(handleSystemThemeChange);
  }

  loadCurrentUser().finally(() => {
    if (getAccessToken()) {
      const initialPath = window.location.pathname;
      const clienteMatch = initialPath.match(/^\/cliente\/([^/?#]+)/);
      const initialLoads = [
        loadDashboardBalances(),
        loadMovimientos(),
        loadAhorros(),
        loadRecomendaciones(),
        loadAsesorClientes(),
        loadAllAsesorRecomendaciones(),
        loadBudgets(),
        loadCategories(),
        loadTags(),
      ];
      if (clienteMatch) {
        const clienteId = decodeURIComponent(clienteMatch[1]);
        initialLoads.push(
          loadClienteDetalle(clienteId),
          loadClienteMovimientos(clienteId),
          loadClienteRecomendaciones(clienteId),
          loadClienteGastosPorMes(clienteId),
          loadClienteGraficoCategorias(clienteId),
        );
      }
      Promise.all(initialLoads).finally(() => render());
      return;
    }
    render();
  });
}

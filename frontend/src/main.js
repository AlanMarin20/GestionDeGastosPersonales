import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import Chart from "chart.js/auto";
import {
  encabezadoAuthPublico,
  encabezadoExterno,
  encabezadoInterno,
  botonIniciarCrearCuenta,
  campoAuthInput,
  botonScrollTop,
  descripcionLanding,
  fondoDecorativoAuth,
  imagenesLanding,
  renderAuthPublicPage,
  tarjetaLandingPage,
  tarjetaPublicaBase,
  tarjetaPublicaConTitulo,
} from "./components/common/reusablePageComponents";
import { renderConfiguracionCuentaPage as renderConfiguracionCuentaPageView } from "./pages/ConfiguracionCuentaPage";
import {
  renderDetalleClientePage as renderDetalleClientePageView,
  resolveDetalleCliente as resolveDetalleClienteView,
} from "./pages/DetalleClientePage";
import { renderDashboardAsesorPage as renderDashboardAsesorPageView } from "./pages/DashboardAsesorPage";
import { renderDashboardPage as renderDashboardPageView } from "./pages/DashboardPage";
import { renderDetalleAhorrosPage as renderDetalleAhorrosPageView } from "./pages/DetalleAhorrosPage";
import { renderCargarGastoPage as renderCargarGastoPageView } from "./pages/CargarGastoPage";
import { renderMisGastosPage as renderMisGastosPageView } from "./pages/MisGastosPage";
import { renderRecomendacionesPage as renderRecomendacionesPageView } from "./pages/RecomendacionesPage";
import { renderRecomendacionesHistoricasPage as renderRecomendacionesHistoricasPageView } from "./pages/RecomendacionesHistoricasPage";
import { renderRecHistoricasClientePage as renderRecHistoricasClientePageView } from "./pages/RecHistoricasClientePage";
import { renderEditarPerfilPage as renderEditarPerfilPageView } from "./pages/EditarPerfilPage";
import { renderPreferenciaNotificacionesPageView } from "./pages/PreferenciaNotificacionesPage";
import { renderLandingPage as renderLandingPageView } from "./pages/LandingPage";
import { renderFaqPage as renderFaqPageView } from "./pages/FaqPage";
import { renderSobreNosotrosPage as renderSobreNosotrosPageView } from "./pages/SobreNosotrosPage";
import {
  renderFaqDetailPage as renderFaqDetailPageView,
  resolveFaqArticle,
} from "./pages/FaqDetailPage";
import { renderLoginPage as renderLoginPageView } from "./pages/LoginPage";
import { renderRegistroPage as renderRegistroPageView } from "./pages/RegistroPage";
import { renderRecuperarContrasenaPage as renderRecuperarContrasenaPageView } from "./pages/RecuperarContrasenaPage";
import { renderVerificarCodigoRecuperacionPage as renderVerificarCodigoRecuperacionPageView } from "./pages/VerificarCodigoRecuperacionPage";
import { renderNuevaContrasenaPage as renderNuevaContrasenaPageView } from "./pages/NuevaContrasenaPage";
import { renderRegistroExitosoPage as renderRegistroExitosoPageView } from "./pages/RegistroExitosoPage";
import { escapeHtml } from "./utils/sanitize";
import {
  API_BASE_URL,
  ACCESS_TOKEN_KEY,
  THEME_STORAGE_KEY,
  APP_PREFERENCES_STORAGE_KEY,
  DEFAULT_PROFILE_IMAGE,
  PASSWORD_POLICY_MESSAGE,
  REGISTRO_EXITOSO_REDIRECT_SECONDS,
  APP_NOTIFICATION_CONTAINER_ID,
  APP_CONFIRM_DIALOG_ID,
  THEME_MODES,
  FONT_SIZE_MODES,
  DENSITY_MODES,
  CURRENCY_CONFIG,
} from "./config";
import {
  MONTH_LABELS_SHORT,
  MONTH_LABELS_LONG,
  getCurrentDateShort,
  getMonthKeyFromDate,
  parseMonthKey,
  compareMonthKeys,
  formatMonthLabelShort,
  formatMonthLabelLong,
  formatIsoDateShort,
} from "./utils/date";
import {
  formatCurrency,
  isStrongPassword,
  normalizeThemeMode,
  normalizeFontSizeMode,
  normalizeDensityMode,
  normalizeCurrency,
} from "./utils/format";
import { state } from "./state";
import { monthlyExpensesDetalle } from "./data/mockData";
import {
  getFinanzasCurrentPeriod,
  getFinanzasAllMonthKeys,
  getFinanzasMonthTotal,
  getFinanzasExpensesForPeriod,
  getDashboardMonthlySeries,
  getDashboardCategorySummary,
  getDashboardBalanceData,
  getDashboardMetrics,
  getDashboardRecentExpenses,
  getMisGastosCategoryOptions,
  getMisGastosPeriodOptions,
  getFilteredExpenses,
} from "./data/finanzas";
import {
  addExpenseRecord,
  addSavingsGoalRecord,
  updateExpenseRecord,
  deleteExpenseRecord,
} from "./data/expenses";
import {
  getReportEvolutionRows,
  getMerchantRankingRows,
  getUnusualSpendingMessages,
  getReportMetrics,
} from "./data/reports";
import {
  getInitials,
  generateAdvisorVerificationCode,
  buildAdvisorUsers,
  resetAdvisorNewClientForm,
  openAdvisorNewClientModal,
  closeAdvisorNewClientModal,
  updateAdvisorNewClientField,
  addAdvisorClientRecord,
  getAdvisorPanelMetrics,
  extractClientIdFromPath,
  findAdvisorClientById,
  registerAdvisorClientSelection,
  isAdvisorClientDetailAuthorized,
} from "./data/advisor";
import {
  csvEscape,
  exportFilteredExpensesAsCsv,
  applyHistoricalRecommendationFilters,
  exportVisibleHistoricalRecommendationsAsCsv,
} from "./data/csv";
import { getAccessToken, apiFetch } from "./api/client";
import {
  syncProfileFromUser,
  loadCurrentUser,
  loadDashboardBalances,
  loadMovimientos,
} from "./api/user";
import {
  showAppNotification,
  showAppConfirm,
} from "./ui/notifications";
import {
  applyTheme,
  loadThemePreference,
  saveThemePreference,
  loadAppPreferences,
  saveAppPreferences,
  applyAccessibilityPreferences,
  isFixedDarkRoute,
  resolveThemeForPath,
} from "./ui/theme";
import { buildPieChart, buildBarChart, initCharts } from "./ui/charts";
import { installGlobalImageErrorHandler } from "./ui/imageErrors";
import {
  closeDashboardDropdowns,
  toggleDashboardDropdown,
  toggleDashboardNotificationsMenu,
  toggleDashboardUserChipMenu,
} from "./handlers/dropdowns";
import { closeLandingMobileMenu, toggleLandingMobileMenu } from "./handlers/mobileMenu";
import { attachGlobalNavigation } from "./handlers/navigation";
import { attachFormHandlers, clearRegistroExitosoAutoRedirect } from "./handlers/forms";
import "./index.css";
import "./App.css";
import "./components/dashboard/dashboard-widgets.css";
import "./components/dashboard/gestion-dashboard.css";

const appRoot = document.getElementById("root");

function navigate(path, replace = false) {
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
}

function cambioRol(pathname) {
  return pathname.startsWith("/dashboard/asesor") ||
    pathname.startsWith("/cliente/")
    ? "Asesor"
    : "Usuario";
}

function getCurrentRoleLabel(pathname = window.location.pathname) {
  return cambioRol(pathname);
}

function getAdvisorClientHref() {
  return "/dashboard/asesor";
}

function getBrandTarget(pathname) {
  if (pathname === "/dashboard") {
    return "scroll-top";
  }

  if (pathname.startsWith("/cliente/")) {
    return "/dashboard/asesor";
  }

  if (pathname.startsWith("/dashboard/asesor")) {
    return "/dashboard";
  }

  return "/dashboard";
}

function renderDashboardLayout(content, { showScrollTop = true } = {}) {
  return `
    <div class="d-flex min-vh-100 overflow-hidden" style="background-color: var(--app-surface-bg);">
      <div class="flex-grow-1 d-flex flex-column h-100 overflow-y-auto w-100">
        <main class="container-fluid py-4 px-3 px-md-4 flex-grow-1">
          ${content}
        </main>

        ${showScrollTop ? botonScrollTop() : ""}
        
      </div>
    </div>
  `;
}

function renderLandingPage() {
  return renderLandingPageView({ encabezadoExterno, encabezadoAuthPublico, tarjetaLandingPage, descripcionLanding, imagenesLanding, botonScrollTop });
}

function renderFaqPage() {
  return renderFaqPageView({
    encabezadoExterno,
    encabezadoAuthPublico,
    tarjetaPublicaConTitulo,
    botonScrollTop,
  });
}

function renderSobreNosotrosPage() {
  return renderSobreNosotrosPageView({
    encabezadoExterno,
    encabezadoAuthPublico,
    tarjetaPublicaBase,
    botonScrollTop,
  });
}

function renderFaqDetail(pathname) {
  const article = resolveFaqArticle(pathname);

  if (!article) {
    return null;
  }

  return renderFaqDetailPageView({
    encabezadoExterno,
    encabezadoAuthPublico,
    tarjetaPublicaBase,
    tarjetaPublicaConTitulo,
    botonScrollTop,
    article,
  });
}

function renderLoginPage() {
  return renderLoginPageView({
    encabezadoExterno,
    botonIniciarCrearCuenta,
    campoAuthInput,
    fondoDecorativoAuth,
    renderAuthPublicPage,
  });
}

function renderRegistroPage() {
  return renderRegistroPageView({
    encabezadoExterno,
    botonIniciarCrearCuenta,
    campoAuthInput,
    fondoDecorativoAuth,
    renderAuthPublicPage,
  });
}

function renderRecuperarContrasenaPage() {
  return renderRecuperarContrasenaPageView({
    encabezadoExterno,
    botonIniciarCrearCuenta,
    campoAuthInput,
    fondoDecorativoAuth,
    renderAuthPublicPage,
  });
}

function renderVerificarCodigoRecuperacionPage() {
  return renderVerificarCodigoRecuperacionPageView({
    encabezadoExterno,
    botonIniciarCrearCuenta,
    campoAuthInput,
    fondoDecorativoAuth,
    renderAuthPublicPage,
  });
}

function renderNuevaContrasenaPage() {
  return renderNuevaContrasenaPageView({
    encabezadoExterno,
    botonIniciarCrearCuenta,
    campoAuthInput,
    fondoDecorativoAuth,
    renderAuthPublicPage,
  });
}

function renderRegistroExitosoPage() {
  return renderRegistroExitosoPageView({
    encabezadoExterno,
    fondoDecorativoAuth,
  });
}

function renderDashboardPage() {
  const currentPeriod = getFinanzasCurrentPeriod();

  return renderDashboardPageView({
    profileImage: state.perfil.imagePreview || DEFAULT_PROFILE_IMAGE,
    profileName: state.perfil.nombre || "Usuario",
    activePath: "/dashboard",
    pageTitle: "Dashboard",
    pageSubtitle: `Resumen financiero · ${formatMonthLabelLong(currentPeriod)}`,
    metrics: getDashboardMetrics(),
    categories: getDashboardCategorySummary(currentPeriod),
    recentExpenses: getDashboardRecentExpenses(5),
    currentCurrency: normalizeCurrency(state.configuracion.moneda),
  });
}

function renderDetalleAhorrosPage() {
  return renderDetalleAhorrosPageView({
    profileImage: state.perfil.imagePreview || DEFAULT_PROFILE_IMAGE,
    profileName: state.perfil.nombre || "Usuario",
    activePath: "/dashboard/ahorros",
    pageTitle: "Detalle de ahorros",
    pageSubtitle: "Resumen completo de objetivos y fondos acumulados",
    ahorros: state.dashboard.ahorros,
  });
}

function renderCargarGastoPage() {
  return renderCargarGastoPageView({
    profileImage: state.perfil.imagePreview || DEFAULT_PROFILE_IMAGE,
    profileName: state.perfil.nombre || "Usuario",
    activePath: "/dashboard/cargar",
    pageTitle: "Cargar gasto",
    pageSubtitle: "Registra un gasto manual o mediante ticket con IA",
    ticketFileName: state.finanzas.cargar.ticketFileName,
    ocrLoading: state.finanzas.cargar.ocrLoading,
    expenseForm: state.finanzas.cargar.form,
    categoryOptions: getMisGastosCategoryOptions(),
  });
}

function renderMisGastosPage() {
  const editingExpense = state.finanzas.gastos.find(
    (expense) => expense.id === state.finanzas.ui.editingExpenseId,
  ) || null;
  const deletingExpense = state.finanzas.gastos.find(
    (expense) => expense.id === state.finanzas.ui.deletingExpenseId,
  ) || null;

  return renderMisGastosPageView({
    profileImage: state.perfil.imagePreview || DEFAULT_PROFILE_IMAGE,
    profileName: state.perfil.nombre || "Usuario",
    activePath: "/dashboard/gastos",
    pageTitle: "Mis movimientos",
    pageSubtitle: "Listado completo con filtros y exportacion a CSV",
    filters: state.finanzas.filtros,
    categoryOptions: getMisGastosCategoryOptions(),
    periodOptions: getMisGastosPeriodOptions(),
    gastos: getFilteredExpenses(),
    editingExpense,
    deletingExpense,
  });
}

function renderRecomendacionesPage({
  activePath = "/dashboard/recomendaciones",
  pageTitle = "Recomendaciones",
  pageSubtitle = "Inbox financiero con alertas y sugerencias priorizadas",
  isAsesor = false,
} = {}) {
  return renderRecomendacionesPageView({
    profileImage: state.perfil.imagePreview || DEFAULT_PROFILE_IMAGE,
    profileName: state.perfil.nombre || "Usuario",
    activePath,
    pageTitle,
    pageSubtitle,
    recomendaciones: state.finanzas.recomendaciones,
    isAsesor,
  });
}

function renderRecomendacionesHistoricasPage(pathname) {
  const recomendaciones = state.finanzas.recomendaciones || [];
  const recommendationsByMonth = recomendaciones.reduce((acc, r) => {
    const d = r.date || "Sin fecha";
    let month = d;
    const isoMatch = d.match(/(\d{4}-\d{2})/);
    if (isoMatch) month = isoMatch[1];
    else {
      const parts = d.split(" ");
      if (parts.length >= 2) month = parts.slice(-2).join(" ");
    }
    acc[month] = acc[month] || [];
    acc[month].push(r);
    return acc;
  }, {});

  return renderRecomendacionesHistoricasPageView({
    pathname,
    recomendaciones: recomendaciones,
    recommendationsByMonth,
    profileImage: state.perfil.imagePreview || DEFAULT_PROFILE_IMAGE,
    profileName: state.perfil.nombre || "Usuario",
  });
}

function renderRecHistoricasClientePage(pathname) {
  const detalleCliente = resolveDetalleCliente(pathname);

  if (!detalleCliente || !isAdvisorClientDetailAuthorized(pathname)) {
    return "";
  }

  return renderRecHistoricasClientePageView({
    clienteId: detalleCliente.id,
    clienteNombre: detalleCliente.nombre,
    recomendaciones: state.detalleCliente.recomendaciones || [],
    profileImage: state.perfil.imagePreview || DEFAULT_PROFILE_IMAGE,
    profileName: state.perfil.nombre || "Usuario",
    activePath: pathname,
  });
}


function renderDashboardAsesorPage({
  activePath = "/dashboard/asesor",
  pageTitle = "Dashboard asesor",
  pageSubtitle = "Vista global de clientes con indicadores de riesgo",
} = {}) {
  return renderDashboardAsesorPageView({
    profileImage: state.perfil.imagePreview || DEFAULT_PROFILE_IMAGE,
    profileName: state.perfil.nombre || "Usuario",
    activePath,
    pageTitle,
    pageSubtitle,
    metrics: getAdvisorPanelMetrics(),
    users: buildAdvisorUsers(),
    search: state.asesor.busqueda,
    sortOrder: state.asesor.orden,
    showAddClientModal: Boolean(state.asesor.modals.nuevoCliente),
    newClientName: state.asesor.nuevoCliente.nombre,
    newClientCode: state.asesor.nuevoCliente.codigo,
  });
}

// RecomendacionesHistoricasPage removed: function omitted intentionally.

function resolveDetalleCliente(pathname) {
  return resolveDetalleClienteView(pathname, state);
}

function renderDetalleClientePage(pathname) {
  return renderDetalleClientePageView({
    pathname,
    state,
    escapeHtml,
    formatCurrency,
    encabezadoInterno,
    profileImage: state.perfil.imagePreview || DEFAULT_PROFILE_IMAGE,
    profileName: state.perfil.nombre || "Usuario",
    currentRole: getCurrentRoleLabel(pathname),
    brandTarget: getBrandTarget(pathname),
    advisorClientHref: getAdvisorClientHref(pathname),
    showAdvisorClientLink: true,
  });
}

function renderEditarPerfilPage() {
  return renderEditarPerfilPageView({
    state,
    profileImage: state.perfil.imagePreview || DEFAULT_PROFILE_IMAGE,
    profileName: state.perfil.nombre || "Usuario",
  });
}

function renderConfiguracionCuentaPage() {
  return renderConfiguracionCuentaPageView({
    state,
    profileImage: state.perfil.imagePreview || DEFAULT_PROFILE_IMAGE,
    profileName: state.perfil.nombre || "Usuario",
  });
}

function renderPreferenciaNotificacionesPage() {
  return renderPreferenciaNotificacionesPageView({
    state,
    profileImage: state.perfil.imagePreview || DEFAULT_PROFILE_IMAGE,
    profileName: state.perfil.nombre || "Usuario",
  });
}

function buildRouteView(pathname) {
  if (pathname === "/") {
    return renderLandingPage();
  }

  if (pathname === "/login") {
    return renderLoginPage();
  }

  if (pathname === "/recuperar-contrasena") {
    return renderRecuperarContrasenaPage();
  }

  if (pathname === "/recuperar-contrasena/verificar") {
    return renderVerificarCodigoRecuperacionPage();
  }

  if (pathname === "/recuperar-contrasena/nueva") {
    return renderNuevaContrasenaPage();
  }

  if (pathname === "/faqs") {
    return renderFaqPage();
  }

  if (pathname === "/sobre-nosotros") {
    return renderSobreNosotrosPage();
  }

  if (pathname.startsWith("/faqs/")) {
    return renderFaqDetail(pathname);
  }

  if (pathname === "/registro") {
    return renderRegistroPage();
  }

  if (pathname === "/registro/exitoso") {
    return renderRegistroExitosoPage();
  }

  if (pathname === "/dashboard") {
    return renderDashboardLayout(renderDashboardPage());
  }

  if (pathname === "/dashboard/cargar") {
    return renderDashboardLayout(renderCargarGastoPage());
  }

  if (pathname === "/dashboard/gastos") {
    return renderDashboardLayout(renderMisGastosPage());
  }

  if (pathname === "/dashboard/recomendaciones") {
    return renderDashboardLayout(renderRecomendacionesPage());
  }

  if (pathname === "/dashboard/recomendaciones/historicas") {
    return renderDashboardLayout(renderRecomendacionesHistoricasPage(pathname));
  }

  if (pathname.match(/^\/cliente\/[^/]+\/recomendaciones\/historicas$/)) {
    return renderDashboardLayout(renderRecHistoricasClientePage(pathname));
  }

  if (pathname === "/dashboard/ahorros") {
    return renderDashboardLayout(renderDetalleAhorrosPage());
  }

  if (pathname === "/dashboard/asesor") {
    return renderDashboardLayout(renderDashboardAsesorPage(), {
      showScrollTop: false,
    });
  }

  if (pathname === "/dashboard/asesor/recomendaciones") {
    return renderDashboardLayout(renderDashboardAsesorPage(), {
      showScrollTop: false,
    });
  }

  if (pathname === "/dashboard/asesor/panel") {
    return renderDashboardLayout(renderDashboardAsesorPage(), {
      showScrollTop: false,
    });
  }

  // Historical recommendations page removed; routes no longer available.

  if (pathname.startsWith("/cliente/")) {
    if (!resolveDetalleCliente(pathname) || !isAdvisorClientDetailAuthorized(pathname)) {
      history.replaceState({}, "", "/dashboard/asesor");
      state.asesor.clienteSeleccionadoId = null;
      return renderDashboardLayout(renderDashboardAsesorPage(), {
        showScrollTop: false,
      });
    }
    return renderDashboardLayout(renderDetalleClientePage(pathname));
  }

  if (pathname === "/perfil/editar") {
    return renderDashboardLayout(renderEditarPerfilPage());
  }

  if (pathname === "/perfil/configuracion") {
    return renderDashboardLayout(renderConfiguracionCuentaPage());
  }

  if (pathname === "/perfil/notificaciones") {
    return renderDashboardLayout(renderPreferenciaNotificacionesPage());
  }

  return null;
}

function isProtectedRoute(pathname) {
  return pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname.startsWith("/cliente/") ||
    pathname.startsWith("/perfil/");
}

function hasAuthenticatedSession() {
  return Boolean(getAccessToken() && state.currentUser?.id);
}


function render() {
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

  // Guardar el estado del elemento enfocado
  const focusedElementId = document.activeElement?.id;
  const cursorPosition = document.activeElement?.selectionStart;

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
}

attachGlobalNavigation({ navigate, render });
installGlobalImageErrorHandler();
const persistedPreferences = loadAppPreferences();
Object.assign(state.configuracion, persistedPreferences);
state.perfil.imagePreview = persistedPreferences.imagePreview || state.perfil.imagePreview || DEFAULT_PROFILE_IMAGE;
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
    Promise.all([loadDashboardBalances(), loadMovimientos()]).finally(() => render());
    return;
  }

  render();
});

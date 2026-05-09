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
import { formatMoney, createMoneyFormatter } from "./utils/money";
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
import "./index.css";
import "./App.css";
import "./components/dashboard/dashboard-widgets.css";
import "./components/dashboard/gestion-dashboard.css";

const appRoot = document.getElementById("root");

let registroExitosoRedirectTimeoutId = null;
let registroExitosoCountdownIntervalId = null;

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

function navigateBack() {
  history.back();
}

function clearRegistroExitosoAutoRedirect() {
  if (registroExitosoRedirectTimeoutId !== null) {
    window.clearTimeout(registroExitosoRedirectTimeoutId);
    registroExitosoRedirectTimeoutId = null;
  }

  if (registroExitosoCountdownIntervalId !== null) {
    window.clearInterval(registroExitosoCountdownIntervalId);
    registroExitosoCountdownIntervalId = null;
  }
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
    recentExpenses: getDashboardRecentExpenses(5, currentPeriod),
    formatMoney,
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
    formatMoney,
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
    formatMoney,
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
    formatMoney,
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


function clearSessionAndRedirectToLogin() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  state.currentUser = null;
  state.profileLoaded = true;
  closeDashboardDropdowns();
  navigate("/login", true);
}

function attachGlobalNavigation() {
  const actionHandlers = {
    "toggle-landing-mobile-menu": ({ event }) => {
      event.preventDefault();
      toggleLandingMobileMenu();
    },
    "toggle-notifications-menu": ({ event, actionButton }) => {
      event.preventDefault();
      toggleDashboardNotificationsMenu(actionButton);
    },
    "toggle-user-chip-menu": ({ event, actionButton }) => {
      event.preventDefault();
      toggleDashboardUserChipMenu(actionButton);
    },
    "toggle-income-entry-menu": ({ event, actionButton }) => {
      event.preventDefault();
      toggleDashboardDropdown(actionButton, "toggle-income-entry-menu");
    },
    "close-landing-mobile-menu": ({ event }) => {
      event.preventDefault();
      closeLandingMobileMenu({ restoreFocus: true });
    },
    back: ({ event }) => {
      event.preventDefault();
      navigateBack();
    },
    "back-to-asesor": ({ event }) => {
      event.preventDefault();
      state.asesor.clienteSeleccionadoId = null;
      navigate("/dashboard/asesor");
    },
    "scroll-top-page": ({ event }) => {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    "brand-scroll-top": ({ event }) => {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    "brand-navigation": ({ event, actionButton }) => {
      event.preventDefault();
      const target = actionButton.getAttribute("data-target");

      if (target) {
        navigate(target);
      }
    },
    logout: ({ event }) => {
      event.preventDefault();
      clearSessionAndRedirectToLogin();
    },
    "save-new-category": ({ event, actionButton }) => {
      event.preventDefault();

      const formKey = actionButton.getAttribute("data-form");
      if (formKey !== "unified") {
        return;
      }

      const inputId = "expenseNuevaCategoria";
      const selectId = "expenseCategoria";
      const input = document.getElementById(inputId);
      const select = document.getElementById(selectId);
      const newCategory = (input?.value || "").trim();

      if (!newCategory) {
        showAppNotification("Escribe el nombre de la nueva categoria", "warning");
        return;
      }

      if (!Array.isArray(state.finanzas.categories)) {
        state.finanzas.categories = [];
      }

      const exists = state.finanzas.categories.some(
        (category) => category.toLowerCase() === newCategory.toLowerCase(),
      );

      if (!exists) {
        state.finanzas.categories = [...state.finanzas.categories, newCategory].sort((a, b) => a.localeCompare(b));
      }

      state.finanzas.cargar.form.categoria = newCategory;

      if (select) {
        select.value = newCategory;
      }

      if (input) {
        input.value = "";
      }

      showAppNotification("Categoria guardada correctamente", "success");
      render();
    },
    "export-expenses-csv": ({ event }) => {
      event.preventDefault();
      exportFilteredExpensesAsCsv();
    },
    "export-recommendations-csv": ({ event }) => {
      event.preventDefault();
      exportVisibleHistoricalRecommendationsAsCsv();
    },
    "open-edit-expense": ({ event, actionButton }) => {
      event.preventDefault();
      const expenseId = actionButton.getAttribute("data-expense-id");
      if (!expenseId) {
        return;
      }

      state.finanzas.ui.editingExpenseId = expenseId;
      state.finanzas.ui.deletingExpenseId = null;
      render();
    },
    "close-edit-expense-modal": ({ event }) => {
      event.preventDefault();
      state.finanzas.ui.editingExpenseId = null;
      render();
    },
    "save-edit-expense": ({ event, actionButton }) => {
      event.preventDefault();
      const expenseId = actionButton.getAttribute("data-expense-id");
      if (!expenseId) {
        return;
      }

      const comercio =
        document.getElementById("editExpenseComercio")?.value?.trim() || "";
      const categoria =
        document.getElementById("editExpenseCategoria")?.value || "";
      const fecha = document.getElementById("editExpenseFecha")?.value || "";
      const monto = document.getElementById("editExpenseMonto")?.value || "";
      const descripcion =
        document.getElementById("editExpenseDescripcion")?.value?.trim() || "";

      const updated = updateExpenseRecord(expenseId, {
        comercio,
        categoria,
        fecha,
        monto,
        descripcion,
      });

      if (!updated) {
        showAppNotification(
          "No se pudo actualizar el gasto. Revisa los campos.",
          "error",
        );
        return;
      }

      state.finanzas.ui.editingExpenseId = null;
      render();
    },
    "open-delete-expense": ({ event, actionButton }) => {
      event.preventDefault();
      const expenseId = actionButton.getAttribute("data-expense-id");
      if (!expenseId) {
        return;
      }

      state.finanzas.ui.deletingExpenseId = expenseId;
      state.finanzas.ui.editingExpenseId = null;
      render();
    },
    "close-delete-expense-modal": ({ event }) => {
      event.preventDefault();
      state.finanzas.ui.deletingExpenseId = null;
      render();
    },
    "confirm-delete-expense": ({ event, actionButton }) => {
      event.preventDefault();
      const expenseId = actionButton.getAttribute("data-expense-id");
      if (!expenseId) {
        return;
      }

      if (deleteExpenseRecord(expenseId)) {
        state.finanzas.ui.deletingExpenseId = null;
        state.finanzas.ui.editingExpenseId = null;
        render();
      }
    },
    "toggle-dashboard-expenses": ({ actionButton }) => {
      state.dashboard.showAllRecentExpenses =
        actionButton.getAttribute("data-value") === "show";
      render();
    },
    "toggle-detalle-expenses": ({ actionButton }) => {
      state.detalleCliente.showAllRecentExpenses =
        actionButton.getAttribute("data-value") === "show";
      render();
    },
    "open-ingreso-modal": () => {
      state.dashboard.modals.ingreso = true;
      render();
    },
    "close-ingreso-modal": () => {
      state.dashboard.modals.ingreso = false;
      render();
    },
    "open-ahorro-modal": () => {
      state.dashboard.modals.ahorro = true;
      render();
    },
    "close-ahorro-modal": () => {
      state.dashboard.modals.ahorro = false;
      render();
    },
    "open-destino-modal": ({ actionButton }) => {
      const ahorroId = actionButton.getAttribute("data-ahorro-id");
      if (!ahorroId) {
        return;
      }
      state.dashboard.ahorroDestinoId = ahorroId;
      state.dashboard.destinoForm.monto = "";
      state.dashboard.modals.destino = true;
      render();
    },
    "close-destino-modal": () => {
      state.dashboard.modals.destino = false;
      state.dashboard.ahorroDestinoId = null;
      render();
    },
    "open-add-client-modal": ({ event }) => {
      event.preventDefault();
      openAdvisorNewClientModal();
      render();
    },
    "close-add-client-modal": ({ event }) => {
      event.preventDefault();
      closeAdvisorNewClientModal();
      render();
    },
    "submit-income-entry": async ({ event, actionButton }) => {
      event.preventDefault();

      const menu = actionButton.closest(".gd-income-entry-menu");
      if (!menu) {
        return;
      }

      const currencySelect = menu.querySelector("[data-income-field='currency']");
      const amountInput = menu.querySelector("[data-income-field='amount']");
      const detailInput = menu.querySelector("[data-income-field='detail']");

      const amount = Number.parseFloat(amountInput?.value || "");
      const detail = (detailInput?.value || "").trim();

      if (Number.isNaN(amount) || amount <= 0 || !detail) {
        showAppNotification("Completa moneda, monto y detalle para registrar el ingreso", "warning");
        return;
      }

      try {
        const response = await apiFetch("/api/incomes", {
          method: "POST",
          body: JSON.stringify({ amount, source: detail }),
        });

        if (!response.ok) {
          showAppNotification("Error al registrar el ingreso", "error");
          return;
        }

        await Promise.all([loadDashboardBalances(), loadMovimientos()]);
        showAppNotification("Ingreso registrado correctamente", "success");
        closeDashboardDropdowns();
        render();
      } catch {
        showAppNotification("Error al registrar el ingreso", "error");
      }
    },
    "desvincular-cliente": async ({ event, actionButton }) => {
      event.preventDefault();
      const clienteId = actionButton.getAttribute("data-cliente-id");
      if (!clienteId) {
        return;
      }

      const shouldUnlink = await showAppConfirm({
        title: "Desvincular cliente",
        message: "Esta accion quitara al cliente de tu panel de asesor.",
        confirmText: "Desvincular",
        cancelText: "Cancelar",
        danger: true,
      });

      if (!shouldUnlink) {
        return;
      }

      state.asesor.clientes = state.asesor.clientes.filter(
        (cliente) => cliente.id !== clienteId,
      );
      showAppNotification("Cliente desvinculado", "success");
      render();
    },
    "desvincular-asesor": async ({ event }) => {
      event.preventDefault();

      const shouldUnlink = await showAppConfirm({
        title: "Desvincular asesor",
        message: "Esta accion eliminara el asesor vinculado y su codigo de verificacion.",
        confirmText: "Desvincular",
        cancelText: "Cancelar",
        danger: true,
      });

      if (!shouldUnlink) {
        return;
      }

      state.configuracion.asesoria = {
        asesor: null,
        solicitud: {
          nombre: "",
          email: "",
          especialidad: "",
        },
      };
      saveAppPreferences();
      showAppNotification("Asesor desvinculado", "success");
      render();
    },
    "cerrar-sesion": ({ actionButton }) => {
      const sesionId = Number(actionButton.getAttribute("data-sesion-id"));
      if (!Number.isNaN(sesionId)) {
        state.configuracion.sesiones = state.configuracion.sesiones.filter(
          (sesion) => sesion.id !== sesionId,
        );
        showAppNotification("Sesion cerrada", "success");
        render();
      }
    },
  };

  document.addEventListener("click", async (event) => {
    const link = event.target.closest("a[data-link]");
    if (link) {
      const href = link.getAttribute("href");
      if (!href) {
        return;
      }

      if (href.startsWith("/cliente/") && !registerAdvisorClientSelection(href)) {
        event.preventDefault();
        showAppNotification("No tienes permiso para abrir ese cliente", "warning");
        return;
      }

      closeDashboardDropdowns();
      closeLandingMobileMenu();
      event.preventDefault();
      navigate(href);
      return;
    }

    const navButton = event.target.closest("[data-nav]");
    if (navButton) {
      const path = navButton.getAttribute("data-nav");
      if (path) {
        if (path.startsWith("/cliente/") && !registerAdvisorClientSelection(path)) {
          event.preventDefault();
          showAppNotification("No tienes permiso para abrir ese cliente", "warning");
          return;
        }

        event.preventDefault();
        closeDashboardDropdowns();
        navigate(path);
      }
      return;
    }

    const actionButton = event.target.closest("[data-action]");
    if (!actionButton) {
      const { menu, menuContainer } = getLandingMobileMenuElements();
      const clickedInsideTriggerGroup = menuContainer
        ? menuContainer.contains(event.target)
        : false;
      const clickedInsideMenu = menu
        ? menu.contains(event.target)
        : false;

      if (menu && !menu.hidden && !clickedInsideTriggerGroup && !clickedInsideMenu) {
        closeLandingMobileMenu();
      }

      DASHBOARD_DROPDOWN_CONFIG.forEach((config) => {
        if (!event.target.closest(config.containerSelector)) {
          closeDashboardDropdown(config);
        }
      });
      return;
    }

    const action = actionButton.getAttribute("data-action") || "";
    const actionHandler = actionHandlers[action];

    if (actionHandler) {
      await actionHandler({ event, actionButton });
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (state.asesor.modals.nuevoCliente) {
        closeAdvisorNewClientModal();
        render();
        return;
      }

      closeLandingMobileMenu({ restoreFocus: true });
      closeDashboardDropdowns();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 992) {
      closeLandingMobileMenu();
    }

    closeDashboardDropdowns();
  });

  window.addEventListener("popstate", () => {
    closeLandingMobileMenu();
    closeDashboardDropdowns();
    render();
  });
}

function attachFormHandlers(pathname) {
  if (pathname !== "/registro/exitoso") {
    clearRegistroExitosoAutoRedirect();
  }

  if (pathname === "/login") {
    const loginForm = document.getElementById("loginForm");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("contrasena");
    const errorDiv = document.getElementById("loginError");

    const removeFieldErrorState = () => {
      [emailInput, passwordInput].forEach((field) => {
        field?.classList.remove("auth-input-error");
      });
    };

    const setAuthError = (
      message,
      fieldsToHighlight = [],
      variant = "default",
    ) => {
      if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.remove("auth-error-alert-email-format");
        if (variant === "email-format") {
          errorDiv.classList.add("auth-error-alert-email-format");
        }
        errorDiv.classList.remove("d-none");
      }

      removeFieldErrorState();
      fieldsToHighlight.forEach((field) => {
        field?.classList.add("auth-input-error");
      });
    };

    const clearAuthError = () => {
      if (errorDiv) {
        errorDiv.classList.add("d-none");
        errorDiv.classList.remove("auth-error-alert-email-format");
      }
      removeFieldErrorState();
    };

    [emailInput, passwordInput].forEach((field) => {
      field?.addEventListener("input", () => {
        field.classList.remove("auth-input-error");
      });
    });

    loginForm?.addEventListener("submit", async (event) => {
      event.preventDefault();

      const email = emailInput?.value?.trim() ?? "";
      const password = passwordInput?.value ?? "";
      const submitBtn = loginForm.querySelector('button[type="submit"]');

      clearAuthError();

      if (!email || !password) {
        setAuthError("Completa correo y contraseña", [emailInput, passwordInput]);
        return;
      }

      if (!email.includes("@")) {
        setAuthError(
          "El correo debe incluir '@' para ser válido",
          [emailInput],
          "email-format",
        );
        return;
      }

      if (submitBtn) submitBtn.disabled = true;

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.message || "Correo o contraseña incorrectos");
        }

        const data = await response.json();
        localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
        syncProfileFromUser(data.user);
        navigate("/dashboard");
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "No se pudo iniciar sesión";
        setAuthError(message, [emailInput, passwordInput]);
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  if (pathname === "/recuperar-contrasena") {
    const recoveryForm = document.getElementById("recuperarContrasenaForm");
    const emailInput = document.getElementById("email");
    const errorDiv = document.getElementById("recuperarContrasenaError");

    state.authRecovery.codeVerified = false;

    if (emailInput && state.authRecovery.email) {
      emailInput.value = state.authRecovery.email;
    }

    const removeFieldErrorState = () => {
      [emailInput].forEach((field) => {
        field?.classList.remove("auth-input-error");
      });
    };

    const setAuthError = (
      message,
      fieldsToHighlight = [],
      variant = "default",
    ) => {
      if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.remove("auth-error-alert-email-format");
        if (variant === "email-format") {
          errorDiv.classList.add("auth-error-alert-email-format");
        }
        errorDiv.classList.remove("d-none");
      }

      removeFieldErrorState();
      fieldsToHighlight.forEach((field) => {
        field?.classList.add("auth-input-error");
      });
    };

    const clearAuthError = () => {
      if (errorDiv) {
        errorDiv.classList.add("d-none");
        errorDiv.classList.remove("auth-error-alert-email-format");
      }
      removeFieldErrorState();
    };

    emailInput?.addEventListener("input", () => {
      emailInput.classList.remove("auth-input-error");
    });

    recoveryForm?.addEventListener("submit", (event) => {
      event.preventDefault();

      const email = emailInput?.value?.trim() ?? "";

      clearAuthError();

      if (!email) {
        setAuthError("Completa el correo para continuar", [emailInput]);
        return;
      }

      if (!email.includes("@")) {
        setAuthError(
          "El correo debe incluir '@' para ser valido",
          [emailInput],
          "email-format",
        );
        return;
      }

      state.authRecovery.email = email;
      state.authRecovery.codeVerified = false;
      showAppNotification(
        "Si el correo pertenece a una cuenta, enviaremos un codigo de verificacion.",
        "info",
      );
      navigate("/recuperar-contrasena/verificar");
    });
  }

  if (pathname === "/recuperar-contrasena/verificar") {
    const verifyForm = document.getElementById("verificarCodigoForm");
    const codeInput = document.getElementById("codigoRecuperacion");
    const errorDiv = document.getElementById("verificarCodigoError");

    const removeFieldErrorState = () => {
      [codeInput].forEach((field) => {
        field?.classList.remove("auth-input-error");
      });
    };

    const setAuthError = (message, fieldsToHighlight = []) => {
      if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.remove("d-none");
      }

      removeFieldErrorState();
      fieldsToHighlight.forEach((field) => {
        field?.classList.add("auth-input-error");
      });
    };

    const clearAuthError = () => {
      if (errorDiv) {
        errorDiv.classList.add("d-none");
      }
      removeFieldErrorState();
    };

    codeInput?.addEventListener("input", () => {
      const sanitized = (codeInput.value || "").replace(/\D/g, "").slice(0, 6);
      if (sanitized !== codeInput.value) {
        codeInput.value = sanitized;
      }
      codeInput.classList.remove("auth-input-error");
    });

    verifyForm?.addEventListener("submit", (event) => {
      event.preventDefault();

      const code = (codeInput?.value || "").trim();
      const normalizedCode = code.replace(/\s+/g, "");

      clearAuthError();

      if (!normalizedCode) {
        setAuthError("Ingresa el codigo de verificacion", [codeInput]);
        return;
      }

      if (!/^\d{6}$/.test(normalizedCode)) {
        setAuthError("El codigo debe tener 6 digitos", [codeInput]);
        return;
      }

      state.authRecovery.codeVerified = true;
      navigate("/recuperar-contrasena/nueva");
    });
  }

  if (pathname === "/recuperar-contrasena/nueva") {
    if (!state.authRecovery.codeVerified) {
      showAppNotification("Primero verifica tu codigo para continuar", "warning");
      navigate("/recuperar-contrasena/verificar", true);
      return;
    }

    const updateForm = document.getElementById("actualizarContrasenaForm");
    const passwordInput = document.getElementById("nuevaContrasena");
    const confirmPasswordInput = document.getElementById("confirmarContrasena");
    const errorDiv = document.getElementById("actualizarContrasenaError");

    const removeFieldErrorState = () => {
      [passwordInput, confirmPasswordInput].forEach((field) => {
        field?.classList.remove("auth-input-error");
      });
    };

    const setAuthError = (message, fieldsToHighlight = []) => {
      if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.remove("d-none");
      }

      removeFieldErrorState();
      fieldsToHighlight.forEach((field) => {
        field?.classList.add("auth-input-error");
      });
    };

    const clearAuthError = () => {
      if (errorDiv) {
        errorDiv.classList.add("d-none");
      }
      removeFieldErrorState();
    };

    [passwordInput, confirmPasswordInput].forEach((field) => {
      field?.addEventListener("input", () => {
        field.classList.remove("auth-input-error");
      });
    });

    updateForm?.addEventListener("submit", (event) => {
      event.preventDefault();

      const password = passwordInput?.value ?? "";
      const confirmPassword = confirmPasswordInput?.value ?? "";

      clearAuthError();

      if (!password || !confirmPassword) {
        setAuthError("Completa los campos para continuar", [
          passwordInput,
          confirmPasswordInput,
        ]);
        return;
      }

      if (!isStrongPassword(password)) {
        setAuthError(PASSWORD_POLICY_MESSAGE, [passwordInput]);
        return;
      }

      if (password !== confirmPassword) {
        setAuthError("Las contrasenas no coinciden", [
          passwordInput,
          confirmPasswordInput,
        ]);
        return;
      }

      state.authRecovery.email = "";
      state.authRecovery.codeVerified = false;
      showAppNotification("Contrasena actualizada. Inicia sesion.", "success");
      navigate("/login", true);
    });
  }

  if (pathname === "/registro") {
    const registroForm = document.getElementById("registroForm");
    const nombreInput = document.getElementById("nombre");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("contrasena");
    const confirmPasswordInput = document.getElementById("confirmarContrasena");
    const errorDiv = document.getElementById("registroError");

    const removeFieldErrorState = () => {
      [nombreInput, emailInput, passwordInput, confirmPasswordInput].forEach((field) => {
        field?.classList.remove("auth-input-error");
      });
    };

    const setAuthError = (
      message,
      fieldsToHighlight = [],
      variant = "default",
    ) => {
      if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.remove("auth-error-alert-email-format");
        if (variant === "email-format") {
          errorDiv.classList.add("auth-error-alert-email-format");
        }
        errorDiv.classList.remove("d-none");
      }

      removeFieldErrorState();
      fieldsToHighlight.forEach((field) => {
        field?.classList.add("auth-input-error");
      });
    };

    const clearAuthError = () => {
      if (errorDiv) {
        errorDiv.classList.add("d-none");
        errorDiv.classList.remove("auth-error-alert-email-format");
      }
      removeFieldErrorState();
    };

    [nombreInput, emailInput, passwordInput, confirmPasswordInput].forEach(
      (field) => {
        field?.addEventListener("input", () => {
          field.classList.remove("auth-input-error");
        });
      },
    );

    registroForm?.addEventListener("submit", async (event) => {
      event.preventDefault();

      const nombre = nombreInput?.value?.trim() ?? "";
      const email = emailInput?.value?.trim() ?? "";
      const password = passwordInput?.value ?? "";
      const confirmPassword = confirmPasswordInput?.value ?? "";
      const submitBtn = registroForm.querySelector('button[type="submit"]');

      clearAuthError();

      if (!nombre || !email || !password || !confirmPassword) {
        setAuthError("Completa todos los campos obligatorios", [
          nombreInput,
          emailInput,
          passwordInput,
          confirmPasswordInput,
        ]);
        return;
      }

      if (!email.includes("@")) {
        setAuthError(
          "El correo debe incluir '@' para ser válido",
          [emailInput],
          "email-format",
        );
        return;
      }

      if (!isStrongPassword(password)) {
        setAuthError(PASSWORD_POLICY_MESSAGE, [passwordInput]);
        return;
      }

      if (password !== confirmPassword) {
        setAuthError("Las contraseñas no coinciden", [
          passwordInput,
          confirmPasswordInput,
        ]);
        return;
      }

      if (submitBtn) submitBtn.disabled = true;

      try {
        const response = await fetch(`${API_BASE_URL}/api/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: nombre, email, password }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          const message = Array.isArray(errData.message)
            ? errData.message[0]
            : errData.message;
          const fallbackMessage = response.status === 409
            ? "El email ya está en uso"
            : "Error al registrar el usuario";
          throw new Error(message || fallbackMessage);
        }

        navigate("/registro/exitoso", true);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "No se pudo registrar el usuario";
        setAuthError(message, [emailInput, passwordInput, confirmPasswordInput]);
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  if (pathname === "/registro/exitoso") {
    clearRegistroExitosoAutoRedirect();

    const countdownElement = document.getElementById("registroExitosoCountdown");
    let secondsLeft = REGISTRO_EXITOSO_REDIRECT_SECONDS;

    if (countdownElement) {
      countdownElement.textContent = String(secondsLeft);
    }

    registroExitosoCountdownIntervalId = window.setInterval(() => {
      secondsLeft = Math.max(secondsLeft - 1, 0);
      if (countdownElement) {
        countdownElement.textContent = String(secondsLeft);
      }

      if (secondsLeft === 0) {
        if (registroExitosoCountdownIntervalId !== null) {
          window.clearInterval(registroExitosoCountdownIntervalId);
          registroExitosoCountdownIntervalId = null;
        }
      }
    }, 1000);

    registroExitosoRedirectTimeoutId = window.setTimeout(() => {
      clearRegistroExitosoAutoRedirect();
      navigate("/login", true);
    }, REGISTRO_EXITOSO_REDIRECT_SECONDS * 1000);
  }

  if (pathname === "/dashboard/cargar") {
    const ticketUploadInput = document.getElementById("ticketUploadInput");
    const expenseForm = document.getElementById("expenseForm");
    const categorySelect = document.getElementById("expenseCategoria");

    const syncNewCategoryVisibility = (value) => {
      const wrap = document.querySelector("[data-new-category-wrap='unified']");
      if (!wrap) {
        return;
      }

      const shouldShow = value === "__new_category__";
      wrap.classList.toggle("d-none", !shouldShow);
    };

    syncNewCategoryVisibility(categorySelect?.value || "");

    categorySelect?.addEventListener("change", (event) => {
      const value = event.target.value || "";
      state.finanzas.cargar.form.categoria = value;
      syncNewCategoryVisibility(value);
    });

    ticketUploadInput?.addEventListener("change", (event) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      state.finanzas.cargar.ticketFileName = file.name;
      state.finanzas.cargar.form = {
        comercio: "Disco Supermaxi",
        fecha: "2026-04-18",
        monto: "42480",
        categoria: "Supermercado",
        descripcion: "Compras semanales",
      };
      render();
    });

    expenseForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(expenseForm);

      const payload = {
        comercio: (formData.get("comercio") || "").toString().trim(),
        fecha: (formData.get("fecha") || "").toString(),
        monto: (formData.get("monto") || "").toString(),
        categoria: (formData.get("categoria") || "").toString(),
        descripcion: (formData.get("descripcion") || "").toString().trim(),
      };

      state.finanzas.cargar.form = payload;

      if (!addExpenseRecord(payload)) {
        showAppNotification(
          "No se pudo guardar el gasto. Revisa los datos.",
          "error",
        );
        return;
      }

      const periodKey = getMonthKeyFromDate(payload.fecha);
      state.finanzas.filtros.periodo = periodKey || "todos";
      state.finanzas.filtros.search = "";
      state.finanzas.filtros.categoria = "Todas";
      state.finanzas.cargar.form = {
        comercio: "",
        fecha: payload.fecha,
        monto: "",
        categoria: "",
        descripcion: "",
      };
      navigate("/dashboard/gastos");
    });
  }

  if (pathname === "/dashboard/gastos") {
    const searchInput = document.getElementById("expenseSearchInput");
    const categoryFilter = document.getElementById("expenseCategoryFilter");
    const periodFilter = document.getElementById("expensePeriodFilter");

    searchInput?.addEventListener("input", (event) => {
      state.finanzas.filtros.search = event.target.value;
      render();
    });

    categoryFilter?.addEventListener("change", (event) => {
      state.finanzas.filtros.categoria = event.target.value;
      render();
    });

    periodFilter?.addEventListener("change", (event) => {
      state.finanzas.filtros.periodo = event.target.value;
      render();
    });
  }

  if (
    pathname === "/dashboard/recomendaciones/historicas" ||
    pathname.match(/^\/cliente\/[^/]+\/recomendaciones\/historicas$/)
  ) {
    const searchInput = document.getElementById("recSearchInput");
    const monthFilter = document.getElementById("recMonthFilter");
    const yearFilter = document.getElementById("recYearFilter");
    const emitterFilter = document.getElementById("recEmitterFilter");

    const handleFilterChange = () => {
      applyHistoricalRecommendationFilters();
    };

    searchInput?.addEventListener("input", handleFilterChange);
    monthFilter?.addEventListener("change", handleFilterChange);
    yearFilter?.addEventListener("change", handleFilterChange);
    emitterFilter?.addEventListener("change", handleFilterChange);

    applyHistoricalRecommendationFilters();
  }

  if (pathname === "/dashboard") {
    const dashboard = state.dashboard;

    const nuevoGastoForm = document.getElementById("nuevoGastoForm");
    nuevoGastoForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      const descripcionInput = document.getElementById("descripcion");
      const montoInput = document.getElementById("monto");
      const categoriaSelect = document.getElementById("categoria");

      const descripcion = descripcionInput?.value?.trim() ?? "";
      const montoStr = montoInput?.value ?? "";
      const categoria = categoriaSelect?.value ?? "Comida";

      if (!descripcion || !montoStr) {
        return;
      }

      dashboard.gastos = [
        {
          id: Date.now().toString(),
          descripcion,
          monto: Number.parseFloat(montoStr),
          categoria,
          fecha: getCurrentDateShort(),
        },
        ...dashboard.gastos,
      ];

      dashboard.formData = { descripcion: "", monto: "", categoria: "Comida" };
      render();
    });

    ["descripcion", "monto", "categoria"].forEach((field) => {
      const input = document.getElementById(field);
      input?.addEventListener("input", (event) => {
        dashboard.formData[field] = event.target.value;
      });
      input?.addEventListener("change", (event) => {
        dashboard.formData[field] = event.target.value;
      });
    });

    const ingresoForm = document.getElementById("ingresoForm");
    ingresoForm?.addEventListener("submit", (event) => {
      event.preventDefault();

      const monto = Number.parseFloat(
        document.getElementById("ingresoMonto")?.value ?? "",
      );
      const concepto = (
        document.getElementById("ingresoConcepto")?.value ?? ""
      ).trim();
      const origen =
        document.getElementById("ingresoOrigen")?.value ?? "Sueldo";

      dashboard.ingresoForm = {
        monto: Number.isNaN(monto) ? "" : String(monto),
        concepto,
        origen,
      };

      if (!concepto || Number.isNaN(monto) || monto <= 0) {
        return;
      }

      dashboard.saldoActual += monto;
      dashboard.ingresoForm = { monto: "", concepto: "", origen: "Sueldo" };
      dashboard.modals.ingreso = false;
      render();
    });

    ["ingresoMonto", "ingresoConcepto", "ingresoOrigen"].forEach((id) => {
      const input = document.getElementById(id);
      input?.addEventListener("input", () => {
        dashboard.ingresoForm = {
          monto: document.getElementById("ingresoMonto")?.value ?? "",
          concepto: document.getElementById("ingresoConcepto")?.value ?? "",
          origen: document.getElementById("ingresoOrigen")?.value ?? "Sueldo",
        };
      });
      input?.addEventListener("change", () => {
        dashboard.ingresoForm = {
          monto: document.getElementById("ingresoMonto")?.value ?? "",
          concepto: document.getElementById("ingresoConcepto")?.value ?? "",
          origen: document.getElementById("ingresoOrigen")?.value ?? "Sueldo",
        };
      });
    });

    const nuevoAhorroForm = document.getElementById("nuevoAhorroForm");
    nuevoAhorroForm?.addEventListener("submit", (event) => {
      event.preventDefault();

      const nombre = (
        document.getElementById("nuevoAhorroNombre")?.value ?? ""
      ).trim();
      const montoInicial = Number.parseFloat(
        document.getElementById("nuevoAhorroMonto")?.value ?? "",
      );
      const meta = Number.parseFloat(
        document.getElementById("nuevoAhorroMeta")?.value ?? "",
      );

      dashboard.nuevoAhorroForm = {
        nombre,
        montoInicial: Number.isNaN(montoInicial) ? "" : String(montoInicial),
        meta: Number.isNaN(meta) ? "" : String(meta),
      };

      const wasAdded = addSavingsGoalRecord({ nombre, montoInicial, meta });
      if (!wasAdded) {
        showAppNotification("Completa al menos el nombre del ahorro", "warning");
        return;
      }

      dashboard.nuevoAhorroForm = { nombre: "", montoInicial: "", meta: "" };
      dashboard.modals.ahorro = false;
      showAppNotification("Ahorro creado correctamente", "success");
      render();
    });

    ["nuevoAhorroNombre", "nuevoAhorroMonto", "nuevoAhorroMeta"].forEach(
      (id) => {
        const input = document.getElementById(id);
        input?.addEventListener("input", () => {
          dashboard.nuevoAhorroForm = {
            nombre: document.getElementById("nuevoAhorroNombre")?.value ?? "",
            montoInicial:
              document.getElementById("nuevoAhorroMonto")?.value ?? "",
            meta: document.getElementById("nuevoAhorroMeta")?.value ?? "",
          };
        });
      },
    );

    const destinoForm = document.getElementById("destinoForm");
    destinoForm?.addEventListener("submit", (event) => {
      event.preventDefault();

      const ahorroDestino = dashboard.ahorros.find(
        (ahorro) => ahorro.id === dashboard.ahorroDestinoId,
      );
      if (!ahorroDestino) {
        return;
      }

      const monto = Number.parseFloat(
        document.getElementById("destinoMonto")?.value ?? "",
      );
      dashboard.destinoForm.monto = Number.isNaN(monto) ? "" : String(monto);

      if (Number.isNaN(monto) || monto <= 0 || monto > dashboard.saldoActual) {
        return;
      }

      dashboard.saldoActual -= monto;
      dashboard.ahorros = dashboard.ahorros.map((ahorro) =>
        ahorro.id === ahorroDestino.id
          ? { ...ahorro, monto: ahorro.monto + monto }
          : ahorro,
      );
      dashboard.modals.destino = false;
      dashboard.ahorroDestinoId = null;
      dashboard.destinoForm.monto = "";
      render();
    });

    const destinoInput = document.getElementById("destinoMonto");
    destinoInput?.addEventListener("input", (event) => {
      dashboard.destinoForm.monto = event.target.value;
    });
  }

  if (pathname === "/dashboard/ahorros") {
    const ahorroForm = document.getElementById("detalleAhorroForm");
    ahorroForm?.addEventListener("submit", (event) => {
      event.preventDefault();

      const nombreInput = document.getElementById("detalleAhorroNombre");
      const montoInput = document.getElementById("detalleAhorroMonto");
      const metaInput = document.getElementById("detalleAhorroMeta");

      const nombre = (nombreInput?.value || "").trim();
      const montoInicial = Number.parseFloat(montoInput?.value || "");
      const meta = Number.parseFloat(metaInput?.value || "");

      const wasAdded = addSavingsGoalRecord({ nombre, montoInicial, meta });
      if (!wasAdded) {
        showAppNotification("Completa al menos el nombre del ahorro", "warning");
        return;
      }

      state.dashboard.nuevoAhorroForm = {
        nombre: "",
        montoInicial: "",
        meta: "",
      };

      showAppNotification("Nuevo ahorro agregado", "success");
      render();
    });
  }

  if (
    pathname === "/dashboard/asesor" ||
    pathname === "/dashboard/asesor/panel" ||
    pathname === "/dashboard/asesor/recomendaciones"
  ) {
    const addClientForm = document.getElementById("addClientForm");
    addClientForm?.addEventListener("submit", (event) => {
      event.preventDefault();

      const nombre = (document.getElementById("nuevoClienteNombre")?.value ?? "").trim();
      const codigo = (document.getElementById("nuevoClienteCodigo")?.value ?? "").trim();

      updateAdvisorNewClientField("nombre", nombre);
      updateAdvisorNewClientField("codigo", codigo);

      const result = addAdvisorClientRecord({ nombre, codigo });
      if (!result.ok) {
        showAppNotification(result.message, "warning");
        return;
      }

      closeAdvisorNewClientModal();
      showAppNotification("Cliente agregado correctamente", "success");
      render();
    });

    const busquedaInput = document.getElementById("advisorSearchInput");
    busquedaInput?.addEventListener("input", (event) => {
      state.asesor.busqueda = event.target.value;
      render();
    });

    const ordenInput = document.getElementById("advisorSortSelect");
    ordenInput?.addEventListener("change", (event) => {
      state.asesor.orden = event.target.value;
      render();
    });

    ["nuevoClienteNombre", "nuevoClienteCodigo"].forEach((id) => {
      const input = document.getElementById(id);
      input?.addEventListener("input", () => {
        updateAdvisorNewClientField("nombre", document.getElementById("nuevoClienteNombre")?.value ?? "");
        updateAdvisorNewClientField("codigo", document.getElementById("nuevoClienteCodigo")?.value ?? "");
      });
    });
  }

  if (pathname.startsWith("/cliente/")) {
    const formRecomendacion = document.getElementById(
      "agregarRecomendacionForm",
    );
    formRecomendacion?.addEventListener("submit", (event) => {
      event.preventDefault();

      const titulo = (
        document.getElementById("recomendacionTitulo")?.value ?? ""
      ).trim();
      const texto = (
        document.getElementById("recomendacionTexto")?.value ?? ""
      ).trim();
      state.detalleCliente.nuevaRecomendacionTitulo = titulo;
      state.detalleCliente.nuevaRecomendacionTexto = texto;

      if (!titulo || !texto) {
        return;
      }

      state.detalleCliente.recomendaciones = [
        {
          id: Date.now().toString(),
          titulo,
          texto,
          fecha: getCurrentDateShort(),
        },
        ...state.detalleCliente.recomendaciones,
      ];
      state.detalleCliente.nuevaRecomendacionTitulo = "";
      state.detalleCliente.nuevaRecomendacionTexto = "";
      render();
    });

    const recomendacionTituloInput = document.getElementById("recomendacionTitulo");
    recomendacionTituloInput?.addEventListener("input", (event) => {
      state.detalleCliente.nuevaRecomendacionTitulo = event.target.value;
    });

    const recomendacionTextoInput = document.getElementById("recomendacionTexto");
    recomendacionTextoInput?.addEventListener("input", (event) => {
      state.detalleCliente.nuevaRecomendacionTexto = event.target.value;
    });
  }

  if (pathname === "/perfil/editar") {
    const perfilForm = document.getElementById("perfilForm");
    perfilForm?.addEventListener("submit", async (event) => {
      event.preventDefault();

      const nombre = document.getElementById("nombre")?.value?.trim() ?? "";
      const email = document.getElementById("email")?.value?.trim() ?? "";
      const submitBtn = perfilForm.querySelector('button[type="submit"]');

      if (!state.currentUser?.id) {
        showAppNotification(
          "No se pudo identificar el usuario autenticado",
          "error",
        );
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
      }

      try {
        const response = await apiFetch(`/api/users/${state.currentUser.id}`, {
          method: "PATCH",
          body: JSON.stringify({ name: nombre, email }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.message || "No se pudo actualizar el perfil");
        }

        const updatedUser = await response.json();
        syncProfileFromUser(updatedUser);
        showAppNotification("Perfil actualizado correctamente", "success");
        render();
      } catch (error) {
        showAppNotification(
          error?.message || "No se pudo actualizar el perfil",
          "error",
        );
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
        }
      }
    });

    const nombreInput = document.getElementById("nombre");
    const emailInput = document.getElementById("email");

    nombreInput?.addEventListener("input", (event) => {
      state.perfil.nombre = event.target.value;
    });

    emailInput?.addEventListener("input", (event) => {
      state.perfil.email = event.target.value;
    });

    const imageInput = document.getElementById("imageInput");
    imageInput?.addEventListener("change", (event) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        state.perfil.imagePreview = String(reader.result || "");
        saveAppPreferences();
        render();
      };
      reader.readAsDataURL(file);
    });

    const passwordForm = document.getElementById("passwordForm");
    passwordForm?.addEventListener("submit", (event) => {
      event.preventDefault();

      const actual = document.getElementById("actual")?.value ?? "";
      const nueva = document.getElementById("nueva")?.value ?? "";
      const confirmar = document.getElementById("confirmar")?.value ?? "";

      state.perfil.passwordData = { actual, nueva, confirmar };

      if (nueva !== confirmar) {
        showAppNotification("Las contrasenas no coinciden", "error");
        return;
      }

      showAppNotification("Contrasena actualizada correctamente", "success");
      state.perfil.passwordData = { actual: "", nueva: "", confirmar: "" };
      render();
    });

    ["actual", "nueva", "confirmar"].forEach((id) => {
      const input = document.getElementById(id);
      input?.addEventListener("input", () => {
        state.perfil.passwordData = {
          actual: document.getElementById("actual")?.value ?? "",
          nueva: document.getElementById("nueva")?.value ?? "",
          confirmar: document.getElementById("confirmar")?.value ?? "",
        };
      });
    });
  }

  if (pathname === "/perfil/configuracion") {
    const sectionButtons = Array.from(
      document.querySelectorAll("[data-config-section-target]"),
    );
    const sectionPanels = Array.from(
      document.querySelectorAll("[data-config-section]"),
    );
    const availableSections = new Set(
      sectionPanels
        .map((panel) => panel.getAttribute("data-config-section"))
        .filter(Boolean),
    );

    const readSectionFromHash = () => {
      const hashValue = String(window.location.hash || "");
      if (!hashValue.startsWith("#config-")) {
        return "perfil";
      }

      const target = hashValue.slice("#config-".length);
      return availableSections.has(target) ? target : "perfil";
    };

    const setConfigSection = (sectionId, { syncHash = true } = {}) => {
      const targetSection = availableSections.has(sectionId)
        ? sectionId
        : "perfil";

      sectionButtons.forEach((button) => {
        const buttonTarget = button.getAttribute("data-config-section-target");
        const isActive = buttonTarget === targetSection;
        button.classList.toggle("active", isActive);
        button.setAttribute("aria-selected", isActive ? "true" : "false");
      });

      sectionPanels.forEach((panel) => {
        const panelSection = panel.getAttribute("data-config-section");
        const isActive = panelSection === targetSection;
        panel.classList.toggle("active", isActive);
        panel.hidden = !isActive;
      });

      if (syncHash) {
        const hash = `#config-${targetSection}`;
        window.history.replaceState(
          window.history.state,
          "",
          `${window.location.pathname}${window.location.search}${hash}`,
        );
      }
    };

    if (sectionButtons.length > 0 && sectionPanels.length > 0) {
      setConfigSection(readSectionFromHash(), { syncHash: false });

      sectionButtons.forEach((button) => {
        button.addEventListener("click", () => {
          const targetSection = button.getAttribute("data-config-section-target");
          if (targetSection) {
            setConfigSection(targetSection);
          }
        });
      });
    }

    const monedaSelect = document.getElementById("moneda");
    monedaSelect?.addEventListener("change", (event) => {
      state.configuracion.moneda = normalizeCurrency(event.target.value);
      saveAppPreferences();
      render();
    });

    const asesorNombreInput = document.getElementById("asesorNombre");
    asesorNombreInput?.addEventListener("input", (event) => {
      state.configuracion.asesoria.solicitud.nombre = event.target.value;
    });

    const asesorEmailInput = document.getElementById("asesorEmail");
    asesorEmailInput?.addEventListener("input", (event) => {
      state.configuracion.asesoria.solicitud.email = event.target.value;
    });

    const asesorEspecialidadInput = document.getElementById("asesorEspecialidad");
    asesorEspecialidadInput?.addEventListener("input", (event) => {
      state.configuracion.asesoria.solicitud.especialidad = event.target.value;
    });

    const asesorForm = document.getElementById("agregarAsesorForm");
    asesorForm?.addEventListener("submit", (event) => {
      event.preventDefault();

      const nombre = (document.getElementById("asesorNombre")?.value ?? "").trim();
      const email = (document.getElementById("asesorEmail")?.value ?? "").trim();
      const especialidad = (document.getElementById("asesorEspecialidad")?.value ?? "").trim();

      if (!nombre || !email) {
        showAppNotification("Completa el nombre y el email del asesor", "warning");
        return;
      }

      const codigoVerificacion = generateAdvisorVerificationCode();

      state.configuracion.asesoria = {
        asesor: {
          nombre,
          email,
          especialidad,
          codigoVerificacion,
          estado: "Pendiente de verificacion",
          vinculadoEn: new Date().toISOString(),
        },
        solicitud: {
          nombre,
          email,
          especialidad,
        },
      };

      saveAppPreferences();
      showAppNotification("Asesor agregado y codigo generado", "success");
      render();
    });

    const configProfileImageInput = document.getElementById("configProfileImageInput");
    configProfileImageInput?.addEventListener("change", (event) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      if (file.type && !file.type.startsWith("image/")) {
        showAppNotification("Selecciona un archivo de imagen valido", "warning");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const preview = String(reader.result || "");
        if (!preview) {
          return;
        }

        state.perfil.imagePreview = preview;
        state.perfil.imagen = preview;
        saveAppPreferences();
        showAppNotification("Foto de perfil actualizada", "success");
        render();
      };
      reader.readAsDataURL(file);
    });

    const idiomaSelect = document.getElementById("idioma");
    idiomaSelect?.addEventListener("change", (event) => {
      state.configuracion.idioma = ["es", "en", "pt"].includes(event.target.value)
        ? event.target.value
        : "es";
      saveAppPreferences();
      render();
    });

    const temaModoSelect = document.getElementById("temaModo");
    temaModoSelect?.addEventListener("change", (event) => {
      state.configuracion.tema = normalizeThemeMode(event.target.value);
      saveAppPreferences();
      render();
    });

    const tamanioFuenteSelect = document.getElementById("tamanioFuente");
    tamanioFuenteSelect?.addEventListener("change", (event) => {
      state.configuracion.tamanioFuente = normalizeFontSizeMode(event.target.value);
      saveAppPreferences();
      render();
    });

    const densidadSelect = document.getElementById("densidad");
    densidadSelect?.addEventListener("change", (event) => {
      state.configuracion.densidad = normalizeDensityMode(event.target.value);
      saveAppPreferences();
      render();
    });

    const reducirAnimacionesInput = document.getElementById("reducirAnimaciones");
    reducirAnimacionesInput?.addEventListener("change", (event) => {
      state.configuracion.reducirAnimaciones = event.target.checked;
      saveAppPreferences();
      render();
    });

    const mostrarCentavosInput = document.getElementById("mostrarCentavos");
    mostrarCentavosInput?.addEventListener("change", (event) => {
      state.configuracion.mostrarCentavos = event.target.checked;
      saveAppPreferences();
      render();
    });

    const autenticacionInput = document.getElementById("autenticacionDos");
    autenticacionInput?.addEventListener("change", (event) => {
      state.configuracion.autenticacionDos = event.target.checked;
      saveAppPreferences();
      render();
    });

    const guardarBtn = document.getElementById("guardarConfiguracionBtn");
    guardarBtn?.addEventListener("click", () => {
      saveAppPreferences();
      showAppNotification("Preferencias guardadas", "success");
    });

    const cerrarTodasBtn = document.getElementById("cerrarTodasSesionesBtn");
    cerrarTodasBtn?.addEventListener("click", () => {
      if (state.configuracion.sesiones.length > 0) {
        state.configuracion.sesiones = [state.configuracion.sesiones[0]];
      }
      showAppNotification(
        "Todas las sesiones excepto esta han sido cerradas",
        "success",
      );
      render();
    });
  }

  if (pathname === "/perfil/notificaciones") {
    const toggleKeys = [
      "resumenSemanal",
      "alertaPago",
      "alertaPresupuesto",
      "movimientosGrandes",
      "recomendacionesIA",
    ];

    toggleKeys.forEach((key) => {
      const input = document.getElementById(key);
      input?.addEventListener("change", (event) => {
        state.notificaciones[key] = event.target.checked;
        render();
      });
    });

    const guardarBtn = document.getElementById("guardarPreferenciasBtn");
    guardarBtn?.addEventListener("click", () => {
      showAppNotification("Preferencias actualizadas correctamente", "success");
    });
  }
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
  attachFormHandlers(pathname);
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

attachGlobalNavigation();
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

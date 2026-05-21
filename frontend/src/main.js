import { buildRouteView, isProtectedRoute, hasAuthenticatedSession, renderDashboardLayout } from "./router";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import "flatpickr/dist/flatpickr.min.css";
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
import { renderAsesorOnboardingPage } from "./pages/AsesorOnboardingPage";
import { renderAsesorRecomendacionesPage as renderAsesorRecomendacionesPageView } from "./pages/AsesorRecomendacionesPage";
import { renderDashboardPage as renderDashboardPageView } from "./pages/DashboardPage";
import { renderDetalleAhorrosPage as renderDetalleAhorrosPageView } from "./pages/DetalleAhorrosPage";
import { renderCargarGastoPage as renderCargarGastoPageView } from "./pages/CargarGastoPage";
import { renderMisGastosPage as renderMisGastosPageView } from "./pages/MisGastosPage";
import { renderRecomendacionesPage as renderRecomendacionesPageView } from "./pages/RecomendacionesPage";
import { renderRecomendacionesHistoricasPage as renderRecomendacionesHistoricasPageView } from "./pages/RecomendacionesHistoricasPage";
import { renderPatronesPage as renderPatronesPageView } from "./pages/PatronesPage";
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
import { renderRegistroVerificarEmailPage as renderRegistroVerificarEmailPageView } from "./pages/RegistroVerificarEmailPage";
import { escapeHtml } from "./utils/sanitize";
import { t } from "./i18n";
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
  getDashboardInsight,
  getDashboardInsights,
  getMisGastosCategoryOptions,
  getMisGastosPeriodOptions,
  getFilteredExpenses,
  getFinancialScore,
  getBudgetAlertsForPeriod,
} from "./data/finanzas";
import {
  addExpenseRecord,
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
  isUserAsesor,
} from "./api/user";
import { loadTags } from "./api/tags";
import { loadAhorros } from "./api/ahorros";
import { loadRecomendaciones, loadHistoricalRecommendations } from "./api/recomendaciones";
import { loadBudgets } from "./api/budgets";
import { loadCategories } from "./api/categories";
import {
  loadAsesorClientes,
  loadClienteDetalle,
  loadClienteMovimientos,
  loadClienteRecomendaciones,
  loadClienteGastosPorMes,
  loadClienteGraficoCategorias,
  loadAllAsesorRecomendaciones,
} from "./api/asesor";
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
import { attachFormHandlers, clearRegistroExitosoAutoRedirect } from "./handlers/forms/index.js";
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

// NOTE: cambioRol, getCurrentRoleLabel, getAdvisorClientHref, getBrandTarget,
// renderDashboardLayout, all render* wrappers, resolveDetalleCliente,
// buildRouteView, isProtectedRoute, and hasAuthenticatedSession have been
// moved to router.js. The imports at the top of this file bring them back.


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

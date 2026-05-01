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
import { renderRegistroExitosoPage as renderRegistroExitosoPageView } from "./pages/RegistroExitosoPage";
import { escapeHtml } from "./utils/sanitize";
import "./index.css";
import "./App.css";
import "./components/dashboard/dashboard-widgets.css";
import "./components/dashboard/gestion-dashboard.css";

const appRoot = document.getElementById("root");

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const ACCESS_TOKEN_KEY = "access_token";
const THEME_STORAGE_KEY = "theme_preference";
const APP_PREFERENCES_STORAGE_KEY = "app_preferences";
// OAuth de terceros deshabilitado temporalmente.
const DEFAULT_PROFILE_IMAGE = "/assets/img/user-avatar-default.svg";
const PASSWORD_POLICY_MESSAGE =
  "La contraseña debe tener al menos 8 caracteres e incluir mayúscula, minúscula, número y carácter especial";
const REGISTRO_EXITOSO_REDIRECT_SECONDS = 5;
const APP_NOTIFICATION_CONTAINER_ID = "app-notification-stack";
const APP_CONFIRM_DIALOG_ID = "app-confirm-dialog";
const THEME_MODES = new Set(["light", "dark", "system"]);
const FONT_SIZE_MODES = new Set(["sm", "md", "lg"]);
const DENSITY_MODES = new Set(["comfortable", "compact"]);
let hasGlobalImageErrorHandler = false;

const CURRENCY_CONFIG = {
  USD: {
    currency: "USD",
    fallbackLocale: "en-US",
    localeByLanguage: {
      es: "es-AR",
      en: "en-US",
      pt: "pt-BR",
    },
  },
  ARS: {
    currency: "ARS",
    fallbackLocale: "es-AR",
    localeByLanguage: {
      es: "es-AR",
      en: "en-US",
      pt: "pt-BR",
    },
  },
  EUR: {
    currency: "EUR",
    fallbackLocale: "es-ES",
    localeByLanguage: {
      es: "es-ES",
      en: "en-IE",
      pt: "pt-PT",
    },
  },
};

let registroExitosoRedirectTimeoutId = null;
let registroExitosoCountdownIntervalId = null;

const state = {
  dashboard: {
    saldoActual: 6149.25,
    gastos: [
      {
        id: "1",
        descripcion: "Almuerzo",
        monto: 25.5,
        categoria: "Comida",
        fecha: "24 mar",
      },
      {
        id: "2",
        descripcion: "Gasolina",
        monto: 45,
        categoria: "Transporte",
        fecha: "23 mar",
      },
      {
        id: "3",
        descripcion: "Alquiler",
        monto: 1200,
        categoria: "Vivienda",
        fecha: "20 mar",
      },
    ],
    ahorros: [
      { id: "1", nombre: "Vacaciones", monto: 1500, meta: 3000 },
      { id: "2", nombre: "Auto Nuevo", monto: 850, meta: 2500 },
      { id: "3", nombre: "Emergencias", monto: 2000 },
    ],
    formData: {
      descripcion: "",
      monto: "",
      categoria: "Comida",
    },
    ingresoForm: {
      monto: "",
      concepto: "",
      origen: "Sueldo",
    },
    nuevoAhorroForm: {
      nombre: "",
      montoInicial: "",
      meta: "",
    },
    destinoForm: {
      monto: "",
    },
    ahorroDestinoId: null,
    showAllRecentExpenses: false,
    modals: {
      ingreso: false,
      ahorro: false,
      destino: false,
    },
  },
  finanzas: {
    currentPeriod: "2026-04",
    monthlyIncome: 320000,
    monthlySavingsGoal: 172800,
    categories: [
      "Supermercado",
      "Transporte",
      "Entretenimiento",
      "Salud",
      "Restaurantes",
      "Servicios",
      "Otros",
    ],
    ticketGoalByPeriod: {
      "2026-04": 34,
    },
    gastos: [
      {
        id: "g-1",
        comercio: "Disco Supermaxi",
        categoria: "Supermercado",
        descripcion: "Compras semanales",
        fecha: "2026-04-18",
        monto: 42480,
      },
      {
        id: "g-2",
        comercio: "SUBE recarga",
        categoria: "Transporte",
        descripcion: "Recarga semanal",
        fecha: "2026-04-17",
        monto: 6200,
      },
      {
        id: "g-3",
        comercio: "Netflix",
        categoria: "Entretenimiento",
        descripcion: "Suscripcion mensual",
        fecha: "2026-04-16",
        monto: 8999,
      },
      {
        id: "g-4",
        comercio: "YPF",
        categoria: "Transporte",
        descripcion: "Combustible",
        fecha: "2026-04-15",
        monto: 38750,
      },
      {
        id: "g-5",
        comercio: "Farmacity",
        categoria: "Salud",
        descripcion: "Medicamentos",
        fecha: "2026-04-14",
        monto: 10340,
      },
      {
        id: "g-6",
        comercio: "McDonalds",
        categoria: "Restaurantes",
        descripcion: "Almuerzo",
        fecha: "2026-04-13",
        monto: 7800,
      },
      {
        id: "g-7",
        comercio: "Alquiler temporal",
        categoria: "Servicios",
        descripcion: "Ajuste mensual",
        fecha: "2026-04-03",
        monto: 33000,
      },
      {
        id: "g-8",
        comercio: "Carrefour",
        categoria: "Supermercado",
        descripcion: "Compra quincenal",
        fecha: "2026-03-25",
        monto: 63240,
      },
      {
        id: "g-9",
        comercio: "YPF",
        categoria: "Transporte",
        descripcion: "Combustible",
        fecha: "2026-03-12",
        monto: 9800,
      },
      {
        id: "g-10",
        comercio: "Cablevision",
        categoria: "Servicios",
        descripcion: "Internet y cable",
        fecha: "2026-03-08",
        monto: 16200,
      },
      {
        id: "g-11",
        comercio: "Cinepolis",
        categoria: "Entretenimiento",
        descripcion: "Entradas",
        fecha: "2026-03-05",
        monto: 8600,
      },
      {
        id: "g-12",
        comercio: "Sushi Club",
        categoria: "Restaurantes",
        descripcion: "Cena fin de semana",
        fecha: "2026-03-02",
        monto: 10900,
      },
      {
        id: "g-13",
        comercio: "Coto",
        categoria: "Supermercado",
        descripcion: "Compra mensual",
        fecha: "2026-02-20",
        monto: 54800,
      },
      {
        id: "g-14",
        comercio: "SUBE recarga",
        categoria: "Transporte",
        descripcion: "Recarga mensual",
        fecha: "2026-02-11",
        monto: 4500,
      },
      {
        id: "g-15",
        comercio: "YPF",
        categoria: "Transporte",
        descripcion: "Combustible",
        fecha: "2026-02-04",
        monto: 6200,
      },
      {
        id: "g-16",
        comercio: "Spotify",
        categoria: "Entretenimiento",
        descripcion: "Plan familiar",
        fecha: "2026-02-03",
        monto: 3200,
      },
      {
        id: "g-17",
        comercio: "AySA",
        categoria: "Servicios",
        descripcion: "Factura de agua",
        fecha: "2026-02-01",
        monto: 8700,
      },
      {
        id: "g-18",
        comercio: "Coto",
        categoria: "Supermercado",
        descripcion: "Compra mensual",
        fecha: "2026-01-21",
        monto: 51200,
      },
      {
        id: "g-19",
        comercio: "Personal",
        categoria: "Servicios",
        descripcion: "Plan movil",
        fecha: "2026-01-11",
        monto: 11800,
      },
      {
        id: "g-20",
        comercio: "YPF",
        categoria: "Transporte",
        descripcion: "Combustible",
        fecha: "2026-01-08",
        monto: 6300,
      },
      {
        id: "g-21",
        comercio: "Burger House",
        categoria: "Restaurantes",
        descripcion: "Cena",
        fecha: "2026-01-05",
        monto: 9800,
      },
      {
        id: "g-22",
        comercio: "Cinepolis",
        categoria: "Entretenimiento",
        descripcion: "Estreno",
        fecha: "2026-01-03",
        monto: 7400,
      },
      {
        id: "g-23",
        comercio: "Coto",
        categoria: "Supermercado",
        descripcion: "Compra mensual",
        fecha: "2025-12-18",
        monto: 46800,
      },
      {
        id: "g-24",
        comercio: "SUBE recarga",
        categoria: "Transporte",
        descripcion: "Recarga mensual",
        fecha: "2025-12-17",
        monto: 4200,
      },
      {
        id: "g-25",
        comercio: "YPF",
        categoria: "Transporte",
        descripcion: "Combustible",
        fecha: "2025-12-10",
        monto: 6100,
      },
      {
        id: "g-26",
        comercio: "Medifarma",
        categoria: "Salud",
        descripcion: "Consulta y medicamentos",
        fecha: "2025-12-06",
        monto: 8300,
      },
      {
        id: "g-27",
        comercio: "Fibertel",
        categoria: "Servicios",
        descripcion: "Internet",
        fecha: "2025-12-04",
        monto: 9800,
      },
      {
        id: "g-28",
        comercio: "Coto",
        categoria: "Supermercado",
        descripcion: "Compra mensual",
        fecha: "2025-11-18",
        monto: 42000,
      },
      {
        id: "g-29",
        comercio: "Spotify",
        categoria: "Entretenimiento",
        descripcion: "Plan premium",
        fecha: "2025-11-11",
        monto: 1999,
      },
      {
        id: "g-30",
        comercio: "YPF",
        categoria: "Transporte",
        descripcion: "Combustible",
        fecha: "2025-11-07",
        monto: 5800,
      },
      {
        id: "g-31",
        comercio: "Edenor",
        categoria: "Servicios",
        descripcion: "Factura de luz",
        fecha: "2025-11-03",
        monto: 12200,
      },
      {
        id: "g-32",
        comercio: "Cinepolis",
        categoria: "Entretenimiento",
        descripcion: "Entradas",
        fecha: "2025-11-01",
        monto: 6100,
      },
    ],
    cargar: {
      ticketFileName: "",
      form: {
        comercio: "Disco Supermaxi",
        fecha: "2026-04-18",
        monto: "42480",
        categoria: "Supermercado",
        descripcion: "Compras semanales",
      },
    },
    filtros: {
      search: "",
      categoria: "Todas",
      periodo: "2026-04",
    },
    ui: {
      editingExpenseId: null,
      deletingExpenseId: null,
    },
    recomendaciones: [
      {
        id: "r-1",
        severity: "danger",
        title: "Gasto excesivo en combustible",
        type: "ALERTA",
        body: "Tu gasto en combustible este mes fue 3.2x mayor que tu promedio historico. Revisa si hubo un viaje extraordinario o una ineficiencia de consumo.",
        date: "18 abr 2026",
        category: "Transporte",
      },
      {
        id: "r-2",
        severity: "warning",
        title: "Entretenimiento cerca del limite",
        type: "ADVERTENCIA",
        body: "Ya consumiste el 82% del presupuesto mensual de entretenimiento en la primera quincena.",
        date: "17 abr 2026",
        category: "Entretenimiento",
      },
      {
        id: "r-3",
        severity: "good",
        title: "Excelente control en salud",
        type: "POSITIVO",
        body: "Tus gastos de salud se mantienen estables por tercer mes consecutivo y dentro del presupuesto estimado.",
        date: "General",
        category: "Salud",
      },
      {
        id: "r-4",
        severity: "info",
        title: "Sugerencia de ahorro",
        type: "IA",
        body: "Si reduces un 10% tus gastos en restaurantes, podrias ahorrar alrededor de 4800 por mes adicional.",
        date: "Generado por IA",
        category: "Habitos",
      },
    ],
  },
  asesor: {
    clientes: [
      {
        id: "1",
        nombre: "Martin Garcia",
        gastosMes: 180200,
        ahorros: 2500,
        presupuesto: 200000,
        estado: "normal",
        tickets: 34,
      },
      {
        id: "2",
        nombre: "Ana Lopez",
        gastosMes: 89400,
        ahorros: 5200,
        presupuesto: 180000,
        estado: "bueno",
        tickets: 21,
      },
      {
        id: "3",
        nombre: "Carlos Perez",
        gastosMes: 312800,
        ahorros: 1800,
        presupuesto: 260000,
        estado: "alerta",
        tickets: 58,
      },
      {
        id: "4",
        nombre: "Lucia Ramirez",
        gastosMes: 104100,
        ahorros: 4100,
        presupuesto: 190000,
        estado: "bueno",
        tickets: 29,
      },
    ],
    busqueda: "",
    orden: "a-z",
    clienteSeleccionadoId: null,
    nuevoCliente: {
      nombre: "",
      codigo: "",
    },
    modals: {
      nuevoCliente: false,
    },
  },
  detalleCliente: {
    gastos: [
      {
        id: "1",
        descripcion: "Almuerzo",
        monto: 25.5,
        categoria: "Comida",
        fecha: "24 mar",
      },
      {
        id: "2",
        descripcion: "Gasolina",
        monto: 45,
        categoria: "Transporte",
        fecha: "23 mar",
      },
      {
        id: "3",
        descripcion: "Alquiler",
        monto: 1200,
        categoria: "Vivienda",
        fecha: "20 mar",
      },
      {
        id: "4",
        descripcion: "Internet",
        monto: 50,
        categoria: "Servicios",
        fecha: "18 mar",
      },
      {
        id: "5",
        descripcion: "Supermercado",
        monto: 150,
        categoria: "Comida",
        fecha: "17 mar",
      },
      {
        id: "6",
        descripcion: "Cine",
        monto: 30,
        categoria: "Ocio",
        fecha: "15 mar",
      },
      {
        id: "7",
        descripcion: "Farmacia",
        monto: 85,
        categoria: "Salud",
        fecha: "14 mar",
      },
      {
        id: "8",
        descripcion: "Restaurante",
        monto: 95,
        categoria: "Comida",
        fecha: "12 mar",
      },
      {
        id: "9",
        descripcion: "Taxi",
        monto: 35,
        categoria: "Transporte",
        fecha: "10 mar",
      },
      {
        id: "10",
        descripcion: "Cafeteria",
        monto: 12,
        categoria: "Comida",
        fecha: "08 mar",
      },
    ],
    recomendaciones: [
      {
        id: "1",
        titulo: "Reducir gasto en comida",
        texto: "Considera reducir gastos de comida un 15%",
        fecha: "22 mar",
      },
      {
        id: "2",
        titulo: "Presupuesto de vivienda estable",
        texto: "Tu presupuesto de vivienda esta dentro del limite",
        fecha: "20 mar",
      },
    ],
    nuevaRecomendacionTitulo: "",
    nuevaRecomendacionTexto: "",
    showAllRecentExpenses: false,
  },
  perfil: {
    id: null,
    nombre: "",
    email: "",
    imagen: DEFAULT_PROFILE_IMAGE,
    passwordData: {
      actual: "",
      nueva: "",
      confirmar: "",
    },
    imagePreview: DEFAULT_PROFILE_IMAGE,
  },
  currentUser: null,
  profileLoaded: false,
  configuracion: {
    moneda: "USD",
    idioma: "es",
    tema: "system",
    temaOscuro: false,
    tamanioFuente: "md",
    densidad: "comfortable",
    reducirAnimaciones: false,
    mostrarCentavos: false,
    autenticacionDos: false,
    sesionesActivas: true,
    sesiones: [
      {
        id: 1,
        dispositivo: "Chrome - Windows",
        ubicacion: "Buenos Aires",
        fecha: "Hoy",
      },
      {
        id: 2,
        dispositivo: "Safari - iPhone",
        ubicacion: "Buenos Aires",
        fecha: "Hace 2 dias",
      },
      {
        id: 3,
        dispositivo: "Chrome - Mac",
        ubicacion: "Buenos Aires",
        fecha: "Hace 5 dias",
      },
    ],
    asesoria: {
      asesor: null,
      solicitud: {
        nombre: "",
        email: "",
        especialidad: "",
      },
    },
  },
  notificaciones: {
    resumenSemanal: true,
    alertaPago: true,
    alertaPresupuesto: true,
    movimientosGrandes: true,
    recomendacionesIA: true,
  },
};

const MONTH_LABELS_SHORT = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

const MONTH_LABELS_LONG = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const CATEGORY_COLORS = {
  Supermercado: "#38bdf8",
  Transporte: "#0ea5e9",
  Entretenimiento: "#2563eb",
  Salud: "#ef4444",
  Restaurantes: "#0284c7",
  Servicios: "#1d4ed8",
  Otros: "#64748b",
};

const ADVISOR_AVATAR_COLORS = ["#2563eb", "#0ea5e9", "#1d4ed8", "#0284c7"];

const monthlyExpensesDetalle = [
  { label: "Abr", total: 9800 },
  { label: "May", total: 10150 },
  { label: "Jun", total: 10600 },
  { label: "Jul", total: 11000 },
  { label: "Ago", total: 10850 },
  { label: "Sep", total: 11250 },
  { label: "Oct", total: 12000 },
  { label: "Nov", total: 13500 },
  { label: "Dic", total: 14350 },
  { label: "Ene", total: 11200 },
  { label: "Feb", total: 12800 },
  { label: "Mar", total: 13000 },
];

let chartInstances = [];

function formatCurrency(value) {
  return `$${Number(value).toFixed(2)}`;
}

function isStrongPassword(password) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(
    password,
  );
}

function getCurrentDateShort() {
  return new Date().toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
}

function normalizeThemeMode(value) {
  return THEME_MODES.has(value) ? value : "system";
}

function normalizeFontSizeMode(value) {
  return FONT_SIZE_MODES.has(value) ? value : "md";
}

function normalizeDensityMode(value) {
  return DENSITY_MODES.has(value) ? value : "comfortable";
}

function normalizeCurrency(value) {
  return CURRENCY_CONFIG[value] ? value : "USD";
}

function createMoneyFormatter() {
  const currencyCode = normalizeCurrency(state.configuracion.moneda);
  const currencyConfig = CURRENCY_CONFIG[currencyCode] || CURRENCY_CONFIG.USD;
  const language = String(state.configuracion.idioma || "es");
  const locale = currencyConfig.localeByLanguage?.[language] ||
    currencyConfig.fallbackLocale;
  const shouldShowDecimals = Boolean(state.configuracion.mostrarCentavos);

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyConfig.currency,
    maximumFractionDigits: shouldShowDecimals ? 2 : 0,
    minimumFractionDigits: shouldShowDecimals ? 2 : 0,
  });
}

function formatMoney(value) {
  const normalizedValue = Number(value);
  const amount = Number.isFinite(normalizedValue) ? normalizedValue : 0;
  return createMoneyFormatter().format(amount);
}

function getMonthKeyFromDate(dateIso) {
  if (!dateIso || typeof dateIso !== "string") {
    return "";
  }

  const [year = "", month = ""] = dateIso.split("-");
  if (year.length !== 4 || month.length !== 2) {
    return "";
  }

  return `${year}-${month}`;
}

function parseMonthKey(monthKey) {
  const [yearString = "0", monthString = "0"] = String(monthKey).split("-");
  const year = Number.parseInt(yearString, 10);
  const month = Number.parseInt(monthString, 10);

  return {
    year: Number.isNaN(year) ? 0 : year,
    month: Number.isNaN(month) ? 0 : month,
  };
}

function compareMonthKeys(a, b) {
  const left = parseMonthKey(a);
  const right = parseMonthKey(b);

  if (left.year !== right.year) {
    return left.year - right.year;
  }

  return left.month - right.month;
}

function formatMonthLabelShort(monthKey) {
  const { month } = parseMonthKey(monthKey);
  if (month < 1 || month > 12) {
    return monthKey;
  }

  return MONTH_LABELS_SHORT[month - 1];
}

function formatMonthLabelLong(monthKey) {
  const { year, month } = parseMonthKey(monthKey);
  if (month < 1 || month > 12) {
    return monthKey;
  }

  return `${MONTH_LABELS_LONG[month - 1]} ${year}`;
}

function formatIsoDateShort(dateIso) {
  if (!dateIso) {
    return "-";
  }

  const date = new Date(`${dateIso}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return dateIso;
  }

  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
}

function getFinanzasCurrentPeriod() {
  return state.finanzas.currentPeriod;
}

function getFinanzasAllMonthKeys() {
  const monthSet = new Set();

  state.finanzas.gastos.forEach((expense) => {
    const monthKey = getMonthKeyFromDate(expense.fecha);
    if (monthKey) {
      monthSet.add(monthKey);
    }
  });

  if (!monthSet.has(state.finanzas.currentPeriod)) {
    monthSet.add(state.finanzas.currentPeriod);
  }

  return [...monthSet].sort(compareMonthKeys);
}

function getFinanzasMonthTotal(periodKey) {
  return state.finanzas.gastos
    .filter((expense) => getMonthKeyFromDate(expense.fecha) === periodKey)
    .reduce((sum, expense) => sum + Number(expense.monto || 0), 0);
}

function getFinanzasExpensesForPeriod(periodKey) {
  return state.finanzas.gastos.filter(
    (expense) => getMonthKeyFromDate(expense.fecha) === periodKey,
  );
}

function getDashboardMonthlySeries() {
  const monthKeys = getFinanzasAllMonthKeys();
  const recentMonthKeys = monthKeys.slice(-6);

  return recentMonthKeys.map((monthKey) => ({
    key: monthKey,
    label: formatMonthLabelShort(monthKey),
    total: getFinanzasMonthTotal(monthKey),
  }));
}

function getDashboardCategorySummary(periodKey = getFinanzasCurrentPeriod()) {
  const totals = new Map();
  const expenses = getFinanzasExpensesForPeriod(periodKey);

  expenses.forEach((expense) => {
    const category = expense.categoria || "Otros";
    totals.set(category, (totals.get(category) || 0) + Number(expense.monto || 0));
  });

  const overall = [...totals.values()].reduce((sum, value) => sum + value, 0);
  const ranked = [...totals.entries()]
    .map(([label, total]) => ({ label, total }))
    .sort((a, b) => b.total - a.total);

  const top = ranked.slice(0, 4);
  const restTotal = ranked.slice(4).reduce((sum, item) => sum + item.total, 0);

  if (restTotal > 0) {
    top.push({ label: "Otros", total: restTotal });
  }

  if (top.length === 0) {
    top.push({ label: "Otros", total: 1 });
  }

  return top.map((item) => {
    const shareNumber = overall > 0 ? Math.round((item.total / overall) * 100) : 0;
    return {
      label: item.label,
      total: item.total,
      share: `${shareNumber}%`,
      color: CATEGORY_COLORS[item.label] || CATEGORY_COLORS.Otros,
    };
  });
}

function getDashboardMetrics() {
  const currentPeriod = getFinanzasCurrentPeriod();
  const monthlyExpense = getFinanzasMonthTotal(currentPeriod);
  const income = state.finanzas.monthlyIncome;
  const savings = income - monthlyExpense;

  const monthKeys = getFinanzasAllMonthKeys();
  const currentIndex = monthKeys.indexOf(currentPeriod);
  const previousPeriod = currentIndex > 0 ? monthKeys[currentIndex - 1] : "";
  const previousMonthExpense = previousPeriod
    ? getFinanzasMonthTotal(previousPeriod)
    : 0;

  const expenseDelta = previousMonthExpense > 0
    ? ((monthlyExpense - previousMonthExpense) / previousMonthExpense) * 100
    : 0;

  const savingsDelta = state.finanzas.monthlySavingsGoal > 0
    ? ((savings - state.finanzas.monthlySavingsGoal) / state.finanzas.monthlySavingsGoal) * 100
    : 0;

  const expenseCount = getFinanzasExpensesForPeriod(currentPeriod).length;
  const ticketCount =
    state.finanzas.ticketGoalByPeriod[currentPeriod] ?? expenseCount;

  const metricsSource = {
    monthlyExpense,
    income,
    savings,
    expenseDelta,
    savingsDelta,
    expenseCount,
    ticketCount,
    currentPeriod,
  };

  const metricDefinitions = [
    {
      key: "monthly-expense",
      label: "Gasto mensual",
      resolveValue: (source) => formatMoney(source.monthlyExpense),
      resolveDelta: (source) =>
        `${source.expenseDelta >= 0 ? "subio" : "bajo"} ${Math.abs(source.expenseDelta).toFixed(1)}% vs mes anterior`,
      resolveTrend: (source) => (source.expenseDelta <= 0 ? "up" : "down"),
    },
    {
      key: "net-income",
      label: "Ingreso",
      resolveValue: (source) => formatMoney(source.income),
      resolveDelta: () => "subio 3.0% este mes",
      resolveTrend: () => "up",
    },
    {
      key: "accumulated-savings",
      label: "Ahorro acumulado",
      resolveValue: (source) => formatMoney(Math.max(source.savings, 0)),
      resolveDelta: (source) =>
        `${source.savingsDelta >= 0 ? "sobre" : "bajo"} objetivo ${Math.abs(source.savingsDelta).toFixed(1)}%`,
      resolveTrend: (source) => (source.savingsDelta >= 0 ? "up" : "down"),
    },
    {
      key: "tickets-loaded",
      label: "Tickets cargados",
      resolveValue: (source) => String(source.ticketCount),
      resolveDelta: (source) =>
        `registrados ${source.expenseCount} en ${formatMonthLabelShort(source.currentPeriod)}`,
      resolveTrend: () => "up",
    },
  ];

  return metricDefinitions.map((definition) => ({
    id: definition.key,
    label: definition.label,
    value: definition.resolveValue(metricsSource),
    delta: definition.resolveDelta(metricsSource),
    trend: definition.resolveTrend(metricsSource),
  }));
}

function getDashboardRecentExpenses(limit = 5, periodKey = getFinanzasCurrentPeriod()) {
  return getFinanzasExpensesForPeriod(periodKey)
    .slice()
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, limit)
    .map((expense) => ({
      ...expense,
      fechaCorta: formatIsoDateShort(expense.fecha),
    }));
}

function getMisGastosCategoryOptions() {
  const categorySet = new Set(Array.isArray(state.finanzas.categories) ? state.finanzas.categories : []);

  state.finanzas.gastos.forEach((expense) => {
    if (expense.categoria) {
      categorySet.add(expense.categoria);
    }
  });

  return [...categorySet].sort((a, b) => a.localeCompare(b));
}

function getMisGastosPeriodOptions() {
  return getFinanzasAllMonthKeys()
    .slice()
    .sort((a, b) => compareMonthKeys(b, a))
    .map((monthKey) => ({
      value: monthKey,
      label: formatMonthLabelLong(monthKey),
    }));
}

function getFilteredExpenses() {
  const { search, categoria, periodo } = state.finanzas.filtros;
  const normalizedSearch = search.trim().toLowerCase();

  return state.finanzas.gastos
    .filter((expense) => {
      if (periodo !== "todos" && getMonthKeyFromDate(expense.fecha) !== periodo) {
        return false;
      }

      if (categoria !== "Todas" && expense.categoria !== categoria) {
        return false;
      }

      if (normalizedSearch && !expense.comercio.toLowerCase().includes(normalizedSearch)) {
        return false;
      }

      return true;
    })
    .slice()
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .map((expense) => ({
      ...expense,
      fechaCorta: formatIsoDateShort(expense.fecha),
    }));
}

function getReportEvolutionRows() {
  const series = getDashboardMonthlySeries();
  const maxValue = series.reduce((max, item) => Math.max(max, item.total), 0);

  return series.map((item) => ({
    label: item.label,
    amount: formatMoney(item.total),
    width: maxValue > 0 ? Math.max((item.total / maxValue) * 100, 8) : 8,
  }));
}

function getMerchantRankingRows(limit = 5) {
  const totals = new Map();
  const currentPeriod = getFinanzasCurrentPeriod();

  getFinanzasExpensesForPeriod(currentPeriod).forEach((expense) => {
    totals.set(expense.comercio, (totals.get(expense.comercio) || 0) + Number(expense.monto || 0));
  });

  const ranking = [...totals.entries()]
    .map(([label, total]) => ({ label, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);

  const maxValue = ranking.reduce((max, item) => Math.max(max, item.total), 0);

  return ranking.map((item) => ({
    label: item.label,
    amount: formatMoney(item.total),
    width: maxValue > 0 ? Math.max((item.total / maxValue) * 100, 8) : 8,
  }));
}

function getUnusualSpendingMessages() {
  const currentPeriod = getFinanzasCurrentPeriod();
  const currentExpenses = getFinanzasExpensesForPeriod(currentPeriod);
  const previousExpenses = state.finanzas.gastos.filter(
    (expense) => getMonthKeyFromDate(expense.fecha) !== currentPeriod,
  );

  const unusual = [];

  currentExpenses.forEach((expense) => {
    const historical = previousExpenses.filter(
      (item) => item.categoria === expense.categoria,
    );

    if (historical.length === 0) {
      return;
    }

    const historicalAverage =
      historical.reduce((sum, item) => sum + Number(item.monto || 0), 0) /
      historical.length;

    if (historicalAverage <= 0) {
      return;
    }

    const ratio = Number(expense.monto || 0) / historicalAverage;
    if (ratio >= 1.8) {
      unusual.push({
        commerce: expense.comercio,
        amount: Number(expense.monto || 0),
        ratio,
        average: historicalAverage,
        date: formatIsoDateShort(expense.fecha),
      });
    }
  });

  unusual.sort((a, b) => b.ratio - a.ratio);

  return unusual.slice(0, 2).map((item) =>
    `${item.commerce} · ${formatMoney(item.amount)} el ${item.date} — ${item.ratio.toFixed(1)}x mayor a tu promedio de ${formatMoney(item.average)}`,
  );
}

function getReportMetrics({ averageMonthlyExpense, categories, merchantRanking }) {
  return [
    {
      label: "Promedio mensual",
      value: formatMoney(averageMonthlyExpense),
      delta: "ultimos 6 meses",
      trend: "up",
    },
    {
      label: "Categoria principal",
      value: categories[0]?.label || "Sin datos",
      delta: categories[0] ? `${categories[0].share} del total` : "sin movimiento",
      trend: "up",
    },
    {
      label: "Comercio top",
      value: merchantRanking[0]?.label || "Sin datos",
      delta: merchantRanking[0]?.amount || "sin consumo",
      trend: "up",
    },
  ];
}

function getInitials(name) {
  const words = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "US";
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function generateAdvisorVerificationCode() {
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
  const timePart = Date.now().toString(36).slice(-4).toUpperCase();
  return `ADV-${randomPart}-${timePart}`;
}

function buildAdvisorUsers() {
  const search = state.asesor.busqueda.trim().toLowerCase();
  const sortOrder = state.asesor.orden;
  const riskPriority = {
    low: 1,
    medium: 2,
    high: 3,
  };

  return state.asesor.clientes
    .filter((client) => client.nombre.toLowerCase().includes(search))
    .map((client, index) => {
      const ratio = client.presupuesto > 0
        ? (client.gastosMes / client.presupuesto) * 100
        : 0;
      const risk = ratio >= 95 ? "high" : ratio > 90 ? "medium" : "low";

      return {
        id: client.id,
        name: client.nombre,
        monthlySpend: client.gastosMes,
        tickets: client.tickets || 0,
        progress: Math.min(ratio, 100),
        spentPercent: Math.min(Math.max(ratio, 0), 100),
        risk,
        initials: getInitials(client.nombre),
        avatarColor: ADVISOR_AVATAR_COLORS[index % ADVISOR_AVATAR_COLORS.length],
      };
    })
    .sort((left, right) => {
      const byNameAsc = left.name.localeCompare(right.name, "es", { sensitivity: "base" });
      const byNameDesc = right.name.localeCompare(left.name, "es", { sensitivity: "base" });
      const leftRisk = riskPriority[left.risk] || 0;
      const rightRisk = riskPriority[right.risk] || 0;

      if (sortOrder === "z-a") {
        return byNameDesc;
      }

      if (sortOrder === "riesgo-alto") {
        if (rightRisk !== leftRisk) {
          return rightRisk - leftRisk;
        }
        if (right.spentPercent !== left.spentPercent) {
          return right.spentPercent - left.spentPercent;
        }
        return byNameAsc;
      }

      if (sortOrder === "riesgo-bajo") {
        if (leftRisk !== rightRisk) {
          return leftRisk - rightRisk;
        }
        if (left.spentPercent !== right.spentPercent) {
          return left.spentPercent - right.spentPercent;
        }
        return byNameAsc;
      }

      return byNameAsc;
    });
}

function resetAdvisorNewClientForm() {
  state.asesor.nuevoCliente = {
    nombre: "",
    codigo: "",
  };
}

function openAdvisorNewClientModal() {
  state.asesor.modals.nuevoCliente = true;
}

function closeAdvisorNewClientModal() {
  state.asesor.modals.nuevoCliente = false;
  resetAdvisorNewClientForm();
}

function updateAdvisorNewClientField(field, value) {
  state.asesor.nuevoCliente = {
    ...state.asesor.nuevoCliente,
    [field]: value,
  };
}

function addAdvisorClientRecord({ nombre, codigo }) {
  if (!nombre || !codigo) {
    return { ok: false, message: "Completa el nombre y el codigo del cliente" };
  }

  if (state.asesor.clientes.some((client) => String(client.id) === codigo)) {
    return { ok: false, message: "Ya existe un cliente con ese codigo" };
  }

  state.asesor.clientes = [
    {
      id: codigo,
      codigo,
      nombre,
      gastosMes: 0,
      ahorros: 0,
      presupuesto: 0,
      estado: "normal",
      tickets: 0,
    },
    ...state.asesor.clientes,
  ];

  return { ok: true };
}

function getAdvisorPanelMetrics() {
  const clients = state.asesor.clientes;
  const mediumRiskClients = clients.filter(
    (client) =>
      client.presupuesto > 0 &&
      (client.gastosMes / client.presupuesto) * 100 > 90 &&
      (client.gastosMes / client.presupuesto) * 100 <= 95,
  ).length;
  const highRiskClients = clients.filter(
    (client) => client.presupuesto > 0 && (client.gastosMes / client.presupuesto) * 100 >= 95,
  ).length;

  return [
    {
      label: "Clientes Asignados",
      value: String(clients.length),
      delta: `${clients.length} en cartera`,
      trend: "up",
    },
    {
      label: "Clientes en Riesgo Medio",
      value: String(mediumRiskClients),
      delta: "+ 90% del presupuesto",
      trend: "warn",
    },
    {
      label: "Clientes en Riesgo Alto",
      value: String(highRiskClients),
      delta: "+ 95% del presupuesto",
      trend: highRiskClients > 0 ? "down" : "up",
    },
  ];
}

function extractClientIdFromPath(pathname) {
  const match = String(pathname || "").match(/^\/cliente\/([^/?#]+)/);
  if (!match) {
    return null;
  }

  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

function findAdvisorClientById(clientId) {
  if (!clientId) {
    return null;
  }

  return state.asesor.clientes.find((client) => {
    const normalizedId = String(client?.id ?? client?.userId ?? client?.usuarioId ?? "");
    return normalizedId === String(clientId);
  }) || null;
}

function registerAdvisorClientSelection(pathname) {
  const clientId = extractClientIdFromPath(pathname);
  const client = findAdvisorClientById(clientId);
  if (!client) {
    return false;
  }

  state.asesor.clienteSeleccionadoId = String(clientId);
  return true;
}

function isAdvisorClientDetailAuthorized(pathname) {
  const clientId = extractClientIdFromPath(pathname);
  if (!clientId || !findAdvisorClientById(clientId)) {
    return false;
  }

  const selectedClientId = String(state.asesor.clienteSeleccionadoId || "");
  return selectedClientId.length > 0 && selectedClientId === String(clientId);
}

function csvEscape(value) {
  const stringValue = String(value ?? "");

  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replaceAll('"', '""')}"`;
  }

  return stringValue;
}

function exportFilteredExpensesAsCsv() {
  const filteredExpenses = getFilteredExpenses();
  const rows = [
    ["Comercio", "Categoria", "Descripcion", "Fecha", "Monto"],
    ...filteredExpenses.map((expense) => [
      expense.comercio,
      expense.categoria,
      expense.descripcion || "",
      expense.fecha,
      Number(expense.monto || 0),
    ]),
  ];

  const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `gastos_${getFinanzasCurrentPeriod()}.csv`;
  document.body.append(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(url);
}

function addExpenseRecord({ comercio, fecha, monto, categoria, descripcion }) {
  const numericAmount = Number.parseFloat(String(monto));

  if (!comercio || !fecha || Number.isNaN(numericAmount) || numericAmount <= 0 || !categoria) {
    return false;
  }

  const monthKey = getMonthKeyFromDate(fecha);
  const id = `g-${Date.now()}`;

  state.finanzas.gastos = [
    {
      id,
      comercio,
      fecha,
      monto: numericAmount,
      categoria,
      descripcion,
    },
    ...state.finanzas.gastos,
  ];

  if (monthKey) {
    state.finanzas.currentPeriod = monthKey;

    if (state.finanzas.ticketGoalByPeriod[monthKey] !== undefined) {
      state.finanzas.ticketGoalByPeriod[monthKey] += 1;
    }
  }

  return true;
}

function addSavingsGoalRecord({ nombre, montoInicial, meta }) {
  const trimmedName = String(nombre || "").trim();
  const parsedInitialAmount = Number.parseFloat(String(montoInicial));
  const parsedGoal = Number.parseFloat(String(meta));

  if (!trimmedName) {
    return false;
  }

  const safeInitialAmount = Number.isNaN(parsedInitialAmount)
    ? 0
    : Math.max(parsedInitialAmount, 0);
  const safeGoal = Number.isNaN(parsedGoal) || parsedGoal <= 0
    ? undefined
    : parsedGoal;

  state.dashboard.ahorros = [
    {
      id: Date.now().toString(),
      nombre: trimmedName,
      monto: safeInitialAmount,
      meta: safeGoal,
    },
    ...state.dashboard.ahorros,
  ];

  return true;
}

function updateExpenseRecord(expenseId, updates) {
  const previousExpense = state.finanzas.gastos.find((item) => item.id === expenseId);
  if (!previousExpense) {
    return false;
  }

  const nextAmount = Number.parseFloat(String(updates.monto));
  if (
    !updates.comercio ||
    !updates.fecha ||
    Number.isNaN(nextAmount) ||
    nextAmount <= 0 ||
    !updates.categoria
  ) {
    return false;
  }

  state.finanzas.gastos = state.finanzas.gastos.map((expense) =>
    expense.id === expenseId
      ? {
          ...expense,
          comercio: updates.comercio,
          fecha: updates.fecha,
          monto: nextAmount,
          categoria: updates.categoria,
          descripcion: updates.descripcion || "",
        }
      : expense,
  );

  return true;
}

function deleteExpenseRecord(expenseId) {
  const previousLength = state.finanzas.gastos.length;
  state.finanzas.gastos = state.finanzas.gastos.filter(
    (expense) => expense.id !== expenseId,
  );

  return state.finanzas.gastos.length !== previousLength;
}

function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

async function apiFetch(path, options = {}) {
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  const accessToken = getAccessToken();
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
}

function syncProfileFromUser(user) {
  if (!user) {
    return;
  }

  state.currentUser = user;
  state.profileLoaded = true;
  state.perfil = {
    ...state.perfil,
    id: user.id ?? state.perfil.id,
    nombre: user.name ?? state.perfil.nombre,
    email: user.email ?? state.perfil.email,
  };
}

async function loadCurrentUser() {
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

function getLandingMobileMenuElements() {
  const menu = document.querySelector("[data-landing-mobile-menu]");
  const backdrop = document.querySelector("[data-landing-mobile-backdrop]");
  const toggleButton = document.querySelector(
    "[data-action='toggle-landing-mobile-menu']",
  );
  const menuContainer = menu?.closest(".landing-auth-group") ||
    toggleButton?.closest(".landing-auth-group") || null;

  return {
    menu,
    backdrop,
    toggleButton,
    menuContainer,
  };
}

function closeLandingMobileMenu({ restoreFocus = false } = {}) {
  const { menu, backdrop, toggleButton } = getLandingMobileMenuElements();

  document.body.classList.remove("landing-mobile-menu-open");

  if (!menu || !toggleButton) {
    if (backdrop) {
      backdrop.classList.remove("is-open");
      backdrop.hidden = true;
    }
    return;
  }

  const wasOpen = !menu.hidden;
  menu.classList.remove("is-open");
  menu.hidden = true;

  if (backdrop) {
    backdrop.classList.remove("is-open");
    backdrop.hidden = true;
  }

  toggleButton.setAttribute("aria-expanded", "false");

  if (restoreFocus && wasOpen) {
    toggleButton.focus();
  }
}

function toggleLandingMobileMenu() {
  const { menu, backdrop, toggleButton } = getLandingMobileMenuElements();

  if (!menu || !toggleButton) {
    return;
  }

  if (menu.hidden) {
    menu.hidden = false;
    if (backdrop) {
      backdrop.hidden = false;
    }

    menu.classList.remove("is-open");
    backdrop?.classList.remove("is-open");

    window.requestAnimationFrame(() => {
      menu.classList.add("is-open");
      backdrop?.classList.add("is-open");
    });

    document.body.classList.add("landing-mobile-menu-open");
    toggleButton.setAttribute("aria-expanded", "true");
    return;
  }

  closeLandingMobileMenu();
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

function renderRecomendacionesHistoricasPage(pathname) {
  return renderRecomendacionesHistoricasPageView({
    pathname,
    state,
    profileImage: state.perfil.imagePreview || DEFAULT_PROFILE_IMAGE,
    profileName: state.perfil.nombre || "Usuario",
    formatCurrency: formatMoney,
  });
}

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

  if (pathname === "/dashboard/recomendaciones/historicas") {
    return renderDashboardLayout(renderRecomendacionesHistoricasPage(pathname));
  }

  if (pathname.match(/^\/cliente\/[^/]+\/recomendaciones\/historicas$/)) {
    return renderDashboardLayout(renderRecomendacionesHistoricasPage(pathname));
  }

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

function ensureAppNotificationContainer() {
  let container = document.getElementById(APP_NOTIFICATION_CONTAINER_ID);

  if (!container) {
    container = document.createElement("div");
    container.id = APP_NOTIFICATION_CONTAINER_ID;
    container.className = "app-notification-stack";
    container.setAttribute("aria-live", "polite");
    container.setAttribute("aria-atomic", "true");
    document.body.append(container);
  }

  return container;
}

function showAppNotification(message, type = "info", durationMs = 3400) {
  const text = String(message || "").trim();
  if (!text) {
    return;
  }

  const variant = ["info", "success", "error", "warning"].includes(type)
    ? type
    : "info";
  const container = ensureAppNotificationContainer();

  while (container.childElementCount >= 4) {
    container.firstElementChild?.remove();
  }

  const toast = document.createElement("div");
  toast.className = `app-notification app-notification-${variant}`;
  toast.setAttribute("role", variant === "error" ? "alert" : "status");
  toast.textContent = text;
  container.append(toast);

  window.requestAnimationFrame(() => {
    toast.classList.add("is-visible");
  });

  let dismissed = false;
  const dismiss = () => {
    if (dismissed) {
      return;
    }

    dismissed = true;
    toast.classList.remove("is-visible");
    toast.classList.add("is-leaving");

    window.setTimeout(() => {
      toast.remove();
    }, 220);
  };

  const timeoutId = window.setTimeout(dismiss, durationMs);

  toast.addEventListener("click", () => {
    window.clearTimeout(timeoutId);
    dismiss();
  });
}

function showAppConfirm({
  title = "Confirmar accion",
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  danger = false,
} = {}) {
  return new Promise((resolve) => {
    const existing = document.getElementById(APP_CONFIRM_DIALOG_ID);
    existing?.remove();

    const root = document.createElement("div");
    root.id = APP_CONFIRM_DIALOG_ID;
    root.className = "app-confirm-root";

    const backdrop = document.createElement("button");
    backdrop.type = "button";
    backdrop.className = "app-confirm-backdrop";
    backdrop.setAttribute("aria-label", "Cerrar confirmacion");

    const dialog = document.createElement("section");
    dialog.className = `app-confirm-dialog${danger ? " app-confirm-danger" : ""}`;
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-label", title);

    const heading = document.createElement("h3");
    heading.className = "app-confirm-title";
    heading.textContent = title;

    const body = document.createElement("p");
    body.className = "app-confirm-message";
    body.textContent = message || "Confirma para continuar.";

    const actions = document.createElement("div");
    actions.className = "app-confirm-actions";

    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.className = "app-confirm-btn app-confirm-btn-secondary";
    cancelBtn.textContent = cancelText;

    const confirmBtn = document.createElement("button");
    confirmBtn.type = "button";
    confirmBtn.className = danger
      ? "app-confirm-btn app-confirm-btn-danger"
      : "app-confirm-btn app-confirm-btn-primary";
    confirmBtn.textContent = confirmText;

    actions.append(cancelBtn, confirmBtn);
    dialog.append(heading, body, actions);
    root.append(backdrop, dialog);
    document.body.append(root);

    window.requestAnimationFrame(() => {
      root.classList.add("is-open");
      cancelBtn.focus();
    });

    let settled = false;
    const finalize = (result) => {
      if (settled) {
        return;
      }

      settled = true;
      root.classList.remove("is-open");
      document.removeEventListener("keydown", onKeyDown);

      window.setTimeout(() => {
        root.remove();
        resolve(result);
      }, 180);
    };

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        finalize(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    backdrop.addEventListener("click", () => finalize(false));
    cancelBtn.addEventListener("click", () => finalize(false));
    confirmBtn.addEventListener("click", () => finalize(true));
  });
}

const DASHBOARD_DROPDOWN_CONFIG = Object.freeze([
  Object.freeze({
    containerSelector: ".gd-top-notifications",
    triggerAction: "toggle-notifications-menu",
  }),
  Object.freeze({
    containerSelector: ".gd-user-chip-menu",
    triggerAction: "toggle-user-chip-menu",
  }),
  Object.freeze({
    containerSelector: ".gd-income-entry-menu",
    triggerAction: "toggle-income-entry-menu",
  }),
]);

const DASHBOARD_DROPDOWN_CONFIG_BY_ACTION = Object.freeze(
  DASHBOARD_DROPDOWN_CONFIG.reduce((configByAction, config) => {
    configByAction[config.triggerAction] = config;
    return configByAction;
  }, {}),
);

function closeDashboardDropdown(config) {
  if (!config) {
    return;
  }

  document
    .querySelectorAll(`${config.containerSelector}.is-open`)
    .forEach((menu) => {
      menu.classList.remove("is-open");
      const trigger = menu.querySelector(
        `[data-action='${config.triggerAction}']`,
      );
      trigger?.setAttribute("aria-expanded", "false");
    });
}

function closeDashboardDropdowns() {
  DASHBOARD_DROPDOWN_CONFIG.forEach((config) => {
    closeDashboardDropdown(config);
  });
}

function toggleDashboardDropdown(trigger, action) {
  const config = DASHBOARD_DROPDOWN_CONFIG_BY_ACTION[action];
  if (!config) {
    return;
  }

  const menu = trigger?.closest(config.containerSelector);
  if (!menu) {
    return;
  }

  const shouldOpen = !menu.classList.contains("is-open");
  closeDashboardDropdowns();

  if (shouldOpen) {
    menu.classList.add("is-open");
    trigger.setAttribute("aria-expanded", "true");
  }
}

function toggleDashboardNotificationsMenu(trigger) {
  toggleDashboardDropdown(trigger, "toggle-notifications-menu");
}

function toggleDashboardUserChipMenu(trigger) {
  toggleDashboardDropdown(trigger, "toggle-user-chip-menu");
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
    "switch-account": ({ event }) => {
      event.preventDefault();
      closeDashboardDropdowns();
      navigate("/perfil/configuracion");
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
    "submit-income-entry": ({ event, actionButton }) => {
      event.preventDefault();

      const menu = actionButton.closest(".gd-income-entry-menu");
      if (!menu) {
        return;
      }

      const currencySelect = menu.querySelector("[data-income-field='currency']");
      const amountInput = menu.querySelector("[data-income-field='amount']");
      const detailInput = menu.querySelector("[data-income-field='detail']");

      const currency = normalizeCurrency(currencySelect?.value || state.configuracion.moneda);
      const amount = Number.parseFloat(amountInput?.value || "");
      const detail = (detailInput?.value || "").trim();

      if (Number.isNaN(amount) || amount <= 0 || !detail) {
        showAppNotification("Completa moneda, monto y detalle para registrar el ingreso", "warning");
        return;
      }

      state.finanzas.monthlyIncome += amount;
      if (!Array.isArray(state.finanzas.incomeEntries)) {
        state.finanzas.incomeEntries = [];
      }

      state.finanzas.incomeEntries = [
        {
          id: `inc-${Date.now()}`,
          currency,
          amount,
          detail,
          createdAt: new Date().toISOString(),
        },
        ...state.finanzas.incomeEntries,
      ];

      showAppNotification("Ingreso registrado correctamente", "success");
      closeDashboardDropdowns();
      render();
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

function buildPieChart(
  canvasId,
  labels,
  values,
  centerPercentage = 0,
  colors = [],
) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) {
    return;
  }

  const isDark = state.configuracion.temaOscuro;
  const tooltipBackground = isDark
    ? "rgba(15, 23, 42, 0.95)"
    : "rgba(255, 255, 255, 0.9)";
  const tooltipTitle = isDark ? "#f8fafc" : "#333";
  const tooltipBody = isDark ? "#cbd5e1" : "#666";
  const tooltipBorder = isDark ? "#334155" : "#e2e8f0";
  const datasetBorder = isDark ? "#0f172a" : "#ffffff";
  const centerTextColor = isDark ? "#f8fafc" : "#0f172a";
  const centerSubTextColor = isDark ? "#94a3b8" : "#64748b";

  const normalizedCenter = Math.max(0, Math.min(100, centerPercentage));
  const centerText = `${normalizedCenter.toFixed(1)}%`;

  const centerTextPlugin = {
    id: `centerText-${canvasId}`,
    afterDraw(chart) {
      const { ctx, chartArea } = chart;
      if (!chartArea) {
        return;
      }

      const centerX = (chartArea.left + chartArea.right) / 2;
      const centerY = (chartArea.top + chartArea.bottom) / 2;

      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.fillStyle = centerTextColor;
      ctx.font = "700 24px Inter, sans-serif";
      ctx.fillText(centerText, centerX, centerY - 8);

      ctx.fillStyle = centerSubTextColor;
      ctx.font = "500 12px Inter, sans-serif";
      ctx.fillText("Gastado", centerX, centerY + 14);
      ctx.restore();
    },
  };

  const instance = new Chart(canvas, {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: colors.length > 0
            ? colors
            : [
                "rgba(13, 110, 253, 0.85)",
                "rgba(25, 135, 84, 0.85)",
                "rgba(220, 53, 69, 0.85)",
                "rgba(255, 193, 7, 0.85)",
                "rgba(13, 202, 240, 0.85)",
              ],
          borderColor: datasetBorder,
          borderWidth: 3,
          hoverOffset: 8,
        },
      ],
    },
    plugins: [centerTextPlugin],
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '80%',
      layout: { padding: 10 },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: tooltipBackground,
          titleColor: tooltipTitle,
          bodyColor: tooltipBody,
          borderColor: tooltipBorder,
          borderWidth: 1,
          padding: 12,
          boxPadding: 6,
          usePointStyle: true,
          callbacks: {
            label(context) {
              const data = context.dataset.data || [];
              const total = data.reduce((acc, val) => acc + Number(val || 0), 0);
              const current = Number(context.raw || 0);
              const percentage = total > 0 ? (current / total) * 100 : 0;
              return `${context.label}: ${percentage.toFixed(1)}%`;
            },
          },
        }
      },
    },
  });

  chartInstances.push(instance);
}

function buildBarChart(canvasId, dataPoints) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) {
    return;
  }

  const isDark = state.configuracion.temaOscuro;
  const axisTextColor = isDark ? "#cbd5e1" : "#334155";
  const gridColor = isDark ? "rgba(148, 163, 184, 0.08)" : "#e2e8f0";
  const tooltipBackground = isDark
    ? "rgba(15, 23, 42, 0.95)"
    : "rgba(255, 255, 255, 0.95)";
  const tooltipTitle = isDark ? "#f8fafc" : "#1e293b";
  const tooltipBody = isDark ? "#cbd5e1" : "#334155";
  const tooltipBorder = isDark ? "#334155" : "#e2e8f0";

  const highlightIndex = dataPoints.length - 1;

  const instance = new Chart(canvas, {
    type: "bar",
    data: {
      labels: dataPoints.map((item) => item.label),
      datasets: [
        {
          data: dataPoints.map((item) => item.total),
          borderRadius: 10,
          borderSkipped: false,
          backgroundColor: dataPoints.map((_, index) =>
            index === highlightIndex
              ? "rgba(37, 99, 235, 0.95)"
              : "rgba(56, 189, 248, 0.38)",
          ),
          hoverBackgroundColor: dataPoints.map((_, index) =>
            index === highlightIndex
              ? "rgba(30, 64, 175, 1)"
              : "rgba(56, 189, 248, 0.55)",
          ),
          maxBarThickness: 42,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: tooltipBackground,
          titleColor: tooltipTitle,
          bodyColor: tooltipBody,
          borderColor: tooltipBorder,
          borderWidth: 1,
          callbacks: {
            label(context) {
              return ` ${formatMoney(context.raw)}`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: axisTextColor,
            font: { family: "'Inter', sans-serif", size: 11 },
          },
        },
        y: {
          beginAtZero: true,
          grid: { color: gridColor },
          ticks: {
            color: axisTextColor,
            callback(value) {
              return formatMoney(value);
            },
          },
        },
      },
    },
  });

  chartInstances.push(instance);
}

function initCharts(pathname) {
  chartInstances.forEach((chart) => chart.destroy());
  chartInstances = [];

  if (pathname === "/dashboard") {
    const currentPeriod = getFinanzasCurrentPeriod();
    const monthlySeries = getDashboardMonthlySeries();
    const categorySeries = getDashboardCategorySummary(currentPeriod);
    const monthlyExpense = getFinanzasMonthTotal(currentPeriod);
    const income = state.finanzas.monthlyIncome;
    const spentPercentage = income > 0 ? (monthlyExpense / income) * 100 : 0;

    buildBarChart("dashboardMonthlyBarChart", monthlySeries);
    buildPieChart(
      "dashboardCategoryDonutChart",
      categorySeries.map((item) => item.label),
      categorySeries.map((item) => item.total),
      spentPercentage,
      categorySeries.map((item) => item.color),
    );
  }

  if (pathname.startsWith("/cliente/") && !pathname.endsWith("/gastos")) {
    const detalleCliente = resolveDetalleCliente(pathname);
    const presupuesto = Number(detalleCliente?.presupuesto || 0);
    const gastadoMes = Number(detalleCliente?.gastadoMes || 0);
    const porcentajeGastado = presupuesto > 0 ? (gastadoMes / presupuesto) * 100 : 0;

    buildBarChart("detalleMonthlyBarChart", monthlyExpensesDetalle);
    buildPieChart(
      "detallePieChart",
      ["Comida", "Vivienda", "Transporte", "Salud", "Otros"],
      [35, 25, 15, 10, 15],
      porcentajeGastado,
    );
  }
}

function applyTheme(isDark) {
  const nextTheme = isDark ? "dark" : "light";
  document.documentElement.setAttribute("data-bs-theme", nextTheme);
  document.documentElement.setAttribute("data-theme", nextTheme);
  document.body.classList.toggle("theme-dark", isDark);
  document.body.classList.toggle("theme-light", !isDark);
}

function loadThemePreference() {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  if (storedTheme === "dark") {
    return true;
  }

  if (storedTheme === "light") {
    return false;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function saveThemePreference(isDark) {
  localStorage.setItem(THEME_STORAGE_KEY, isDark ? "dark" : "light");
}

function loadAppPreferences() {
  const fallbackThemeMode = loadThemePreference() ? "dark" : "light";
  const rawPreferences = localStorage.getItem(APP_PREFERENCES_STORAGE_KEY);

  const fallback = {
    moneda: normalizeCurrency(state.configuracion.moneda),
    idioma: String(state.configuracion.idioma || "es"),
    tema: fallbackThemeMode,
    tamanioFuente: normalizeFontSizeMode(state.configuracion.tamanioFuente),
    densidad: normalizeDensityMode(state.configuracion.densidad),
    reducirAnimaciones: Boolean(state.configuracion.reducirAnimaciones),
    mostrarCentavos: Boolean(state.configuracion.mostrarCentavos),
    autenticacionDos: Boolean(state.configuracion.autenticacionDos),
    imagePreview: String(state.perfil?.imagePreview || DEFAULT_PROFILE_IMAGE),
    asesoria: {
      asesor: state.configuracion?.asesoria?.asesor || null,
      solicitud: {
        nombre: String(state.configuracion?.asesoria?.solicitud?.nombre || ""),
        email: String(state.configuracion?.asesoria?.solicitud?.email || ""),
        especialidad: String(state.configuracion?.asesoria?.solicitud?.especialidad || ""),
      },
    },
  };

  if (!rawPreferences) {
    return fallback;
  }

  try {
    const parsedPreferences = JSON.parse(rawPreferences);

    return {
      moneda: normalizeCurrency(parsedPreferences.moneda || fallback.moneda),
      idioma: ["es", "en", "pt"].includes(parsedPreferences.idioma)
        ? parsedPreferences.idioma
        : fallback.idioma,
      tema: normalizeThemeMode(parsedPreferences.tema || fallback.tema),
      tamanioFuente: normalizeFontSizeMode(
        parsedPreferences.tamanioFuente || fallback.tamanioFuente,
      ),
      densidad: normalizeDensityMode(parsedPreferences.densidad || fallback.densidad),
      reducirAnimaciones: Boolean(parsedPreferences.reducirAnimaciones),
      mostrarCentavos: Boolean(parsedPreferences.mostrarCentavos),
      autenticacionDos: Boolean(parsedPreferences.autenticacionDos),
      imagePreview: String(parsedPreferences.imagePreview || fallback.imagePreview),
      asesoria: {
        asesor: parsedPreferences.asesoria?.asesor || fallback.asesoria.asesor,
        solicitud: {
          nombre: String(parsedPreferences.asesoria?.solicitud?.nombre || fallback.asesoria.solicitud.nombre),
          email: String(parsedPreferences.asesoria?.solicitud?.email || fallback.asesoria.solicitud.email),
          especialidad: String(parsedPreferences.asesoria?.solicitud?.especialidad || fallback.asesoria.solicitud.especialidad),
        },
      },
    };
  } catch {
    return fallback;
  }
}

function saveAppPreferences() {
  const themeMode = normalizeThemeMode(state.configuracion.tema);

  localStorage.setItem(
    APP_PREFERENCES_STORAGE_KEY,
    JSON.stringify({
      moneda: normalizeCurrency(state.configuracion.moneda),
      idioma: state.configuracion.idioma,
      tema: themeMode,
      tamanioFuente: normalizeFontSizeMode(state.configuracion.tamanioFuente),
      densidad: normalizeDensityMode(state.configuracion.densidad),
      reducirAnimaciones: Boolean(state.configuracion.reducirAnimaciones),
      mostrarCentavos: Boolean(state.configuracion.mostrarCentavos),
      autenticacionDos: Boolean(state.configuracion.autenticacionDos),
      imagePreview: String(state.perfil?.imagePreview || DEFAULT_PROFILE_IMAGE),
      asesoria: {
        asesor: state.configuracion?.asesoria?.asesor || null,
        solicitud: {
          nombre: String(state.configuracion?.asesoria?.solicitud?.nombre || ""),
          email: String(state.configuracion?.asesoria?.solicitud?.email || ""),
          especialidad: String(state.configuracion?.asesoria?.solicitud?.especialidad || ""),
        },
      },
    }),
  );

  if (themeMode === "dark" || themeMode === "light") {
    saveThemePreference(themeMode === "dark");
  }
}

function applyAccessibilityPreferences() {
  const fontSizeMode = normalizeFontSizeMode(state.configuracion.tamanioFuente);
  const densityMode = normalizeDensityMode(state.configuracion.densidad);

  document.body.classList.remove("app-font-sm", "app-font-md", "app-font-lg");
  document.body.classList.add(`app-font-${fontSizeMode}`);
  document.body.classList.toggle("app-density-compact", densityMode === "compact");
  document.body.classList.toggle(
    "app-reduced-motion",
    Boolean(state.configuracion.reducirAnimaciones),
  );
}

function isFixedDarkRoute(pathname) {
  return pathname === "/" ||
    pathname === "/faqs" ||
    pathname.startsWith("/faqs/") ||
    pathname === "/sobre-nosotros" ||
    pathname === "/login" ||
    pathname === "/registro" ||
    pathname === "/registro/exitoso";
}

function resolveThemeForPath(pathname) {
  if (isFixedDarkRoute(pathname)) {
    return true;
  }

  const themeMode = normalizeThemeMode(state.configuracion.tema);

  if (themeMode === "dark") {
    return true;
  }

  if (themeMode === "light") {
    return false;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function handleGlobalImageError(event) {
  const target = event.target;
  if (!(target instanceof HTMLImageElement)) {
    return;
  }

  const fallbackSrc = target.getAttribute("data-fallback-src");
  if (fallbackSrc && target.dataset.fallbackApplied !== "true") {
    const currentSrc = target.getAttribute("src") || "";
    if (currentSrc !== fallbackSrc) {
      target.dataset.fallbackApplied = "true";
      target.src = fallbackSrc;
      return;
    }
  }

  if (target.getAttribute("data-image-error-mode") === "toggle-next") {
    target.classList.add("d-none");
    const nextElement = target.nextElementSibling;
    if (nextElement instanceof HTMLElement) {
      nextElement.classList.remove("d-none");
    }
  }
}

function installGlobalImageErrorHandler() {
  if (hasGlobalImageErrorHandler) {
    return;
  }

  document.addEventListener("error", handleGlobalImageError, true);
  hasGlobalImageErrorHandler = true;
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
  render();
});

import "bootstrap/dist/css/bootstrap.min.css";
import * as bootstrap from "bootstrap";
import Chart from "chart.js/auto";
import {
  encabezadoExterno,
  encabezadoInterno,
  botonEncabezadoExterno,
  botonIniciarCrearCuenta,
  botonScrollTop,
  descripcionLanding,
  imagenesLanding,
  tarjetaValor,
  tarjetaLandingPage,
} from "./components/common/reusablePageComponents";
import { renderConfiguracionCuentaPage as renderConfiguracionCuentaPageView } from "./pages/ConfiguracionCuentaPage";
import {
  renderDetalleClientePage as renderDetalleClientePageView,
  resolveDetalleCliente as resolveDetalleClienteView,
} from "./pages/DetalleClientePage";
import { renderDashboardAsesorPage as renderDashboardAsesorPageView } from "./pages/DashboardAsesorPage";
import { renderDashboardPage as renderDashboardPageView } from "./pages/DashboardPage";
import { renderEditarPerfilPage as renderEditarPerfilPageView } from "./pages/EditarPerfilPage";
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
import "./index.css";
import "./App.css";
import "./components/dashboard/dashboard-widgets.css";

const appRoot = document.getElementById("root");

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const ACCESS_TOKEN_KEY = "access_token";
const THEME_STORAGE_KEY = "theme_preference";
// OAuth de terceros deshabilitado temporalmente.
// const OAUTH_CALLBACK_PATH = "/auth/callback";
const DEFAULT_PROFILE_IMAGE = "/assets/img/user-avatar-default.svg";
const PASSWORD_POLICY_MESSAGE =
  "La contraseña debe tener al menos 8 caracteres e incluir mayúscula, minúscula, número y carácter especial";
const REGISTRO_EXITOSO_REDIRECT_SECONDS = 5;

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
  asesor: {
    clientes: [
      {
        id: "1",
        nombre: "Juan Perez",
        gastosMes: 14350.75,
        ahorros: 2500,
        presupuesto: 15000,
        estado: "alerta",
      },
      {
        id: "2",
        nombre: "Maria Garcia",
        gastosMes: 8920.5,
        ahorros: 5200,
        presupuesto: 10000,
        estado: "bueno",
      },
      {
        id: "3",
        nombre: "Carlos Lopez",
        gastosMes: 12000,
        ahorros: 1800,
        presupuesto: 12500,
        estado: "normal",
      },
    ],
    busqueda: "",
    nuevoCliente: {
      nombre: "",
      presupuesto: "",
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
        texto: "Considera reducir gastos de comida un 15%",
        fecha: "22 mar",
      },
      {
        id: "2",
        texto: "Tu presupuesto de vivienda esta dentro del limite",
        fecha: "20 mar",
      },
    ],
    nuevaRecomendacion: "",
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
    temaOscuro: false,
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
  },
  notificaciones: {
    gastosAltos: true,
    presupuestoExcedido: true,
    recordatorioAhorros: true,
    ofertasEspeciales: false,
    reporteMensual: true,
    alertasSeguridad: true,
    email: true,
    push: true,
    sms: false,
  },
};

const monthlyExpensesDashboard = [
  { mes: "Abr", monto: 8700 },
  { mes: "May", monto: 9050 },
  { mes: "Jun", monto: 9800 },
  { mes: "Jul", monto: 10200 },
  { mes: "Ago", monto: 10850 },
  { mes: "Sep", monto: 11100 },
  { mes: "Oct", monto: 9200 },
  { mes: "Nov", monto: 10150 },
  { mes: "Dic", monto: 11300 },
  { mes: "Ene", monto: 12850 },
  { mes: "Feb", monto: 11900 },
  { mes: "Mar", monto: 14350.75 },
];

const monthlyExpensesDetalle = [
  { mes: "Abril", monto: 9800 },
  { mes: "Mayo", monto: 10150 },
  { mes: "Junio", monto: 10600 },
  { mes: "Julio", monto: 11000 },
  { mes: "Agosto", monto: 10850 },
  { mes: "Septiembre", monto: 11250 },
  { mes: "Octubre", monto: 12000 },
  { mes: "Noviembre", monto: 13500 },
  { mes: "Diciembre", monto: 14350 },
  { mes: "Enero", monto: 11200 },
  { mes: "Febrero", monto: 12800 },
  { mes: "Marzo", monto: 13000 },
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

/*
function startSocialAuth(provider) {
  window.location.assign(`${API_BASE_URL}/api/auth/${provider}`);
}

function processOAuthCallback() {
  const params = new URLSearchParams(window.location.search);
  const accessToken = params.get("access_token");
  const errorMessage = params.get("error");

  if (accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    navigate("/dashboard", true);
    return;
  }

  const nextError =
    errorMessage || "No se pudo completar la autenticación social";
  navigate(`/login?authError=${encodeURIComponent(nextError)}`, true);
}
*/

function getCurrentDateShort() {
  return new Date().toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
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
  } catch (error) {
    state.currentUser = null;
    state.profileLoaded = true;
    return null;
  }
}

function navigate(path, replace = false) {
  closeLandingMobileMenu();

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

function getAdvisorClientHref(pathname) {
  return "/dashboard/asesor";
}

function getBrandTarget(pathname) {
  if (pathname === "/dashboard") {
    return "scroll-top";
  }

  if (pathname.startsWith("/cliente/")) {
    return "/dashboard";
  }

  if (pathname === "/dashboard/asesor") {
    return "/dashboard";
  }

  return "/dashboard";
}

function renderDashboardLayout(content, { showScrollTop = true } = {}) {
  return `
    <div class="d-flex min-vh-100 overflow-hidden" style="background-color: var(--app-surface-bg);">
      <!-- ======== Main Content Wrapper ======== -->
      <div class="flex-grow-1 d-flex flex-column h-100 overflow-y-auto w-100">

        <!-- ======== Page Content ======== -->
        <main class="container-fluid py-4 px-3 px-md-4 flex-grow-1">
          ${content}
        </main>

        ${showScrollTop ? botonScrollTop() : ""}
        
      </div>
    </div>
  `;
}

function renderLandingPage() {
  return renderLandingPageView({ encabezadoExterno, botonEncabezadoExterno, tarjetaLandingPage, descripcionLanding, imagenesLanding, botonScrollTop });
}

function renderFaqPage() {
  return renderFaqPageView({ encabezadoExterno, botonEncabezadoExterno, botonScrollTop });
}

function renderSobreNosotrosPage() {
  return renderSobreNosotrosPageView({ encabezadoExterno, botonEncabezadoExterno, botonScrollTop });
}

function renderFaqDetail(pathname) {
  const article = resolveFaqArticle(pathname);

  if (!article) {
    return null;
  }

  return renderFaqDetailPageView({
    encabezadoExterno,
    botonEncabezadoExterno,
    botonScrollTop,
    article,
  });
}

function renderLoginPage() {
  return renderLoginPageView({ encabezadoExterno, botonIniciarCrearCuenta });
}

function renderRegistroPage() {
  return renderRegistroPageView({ encabezadoExterno, botonIniciarCrearCuenta });
}

function renderRegistroExitosoPage() {
  return renderRegistroExitosoPageView({ encabezadoExterno });
}

function renderDashboardPage() {
  const currentRole = getCurrentRoleLabel();
  const brandTarget = getBrandTarget("/dashboard");

  return renderDashboardPageView({
    state,
    formatCurrency,
    escapeHtml,
    encabezadoInterno,
    profileImage: state.perfil.imagePreview || DEFAULT_PROFILE_IMAGE,
    profileName: state.perfil.nombre || "Usuario",
    currentRole,
    isAsesor: false,
    brandTarget,
  });
}

function renderDashboardAsesorPage() {
  const pathname = window.location.pathname;
  return renderDashboardAsesorPageView({
    state,
    escapeHtml,
    formatCurrency,
    encabezadoInterno,
    tarjetaValor,
    profileImage: state.perfil.imagePreview || DEFAULT_PROFILE_IMAGE,
    profileName: state.perfil.nombre || "Usuario",
    currentRole: getCurrentRoleLabel(),
    brandTarget: getBrandTarget(pathname),
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
    escapeHtml,
    encabezadoInterno,
    profileImage: state.perfil.imagePreview || DEFAULT_PROFILE_IMAGE,
    profileName: state.perfil.nombre || "Usuario",
    currentRole: getCurrentRoleLabel(),
    brandTarget: getBrandTarget(window.location.pathname),
  });
}

function renderConfiguracionCuentaPage() {
  return renderConfiguracionCuentaPageView({
    state,
    escapeHtml,
    encabezadoInterno,
    profileImage: state.perfil.imagePreview || DEFAULT_PROFILE_IMAGE,
    profileName: state.perfil.nombre || "Usuario",
    currentRole: getCurrentRoleLabel(),
    brandTarget: getBrandTarget(window.location.pathname),
  });
}

function renderNotificationToggleItem({
  id,
  checked,
  title,
  description = "",
  disabled = false,
  className = "mb-3",
}) {
  return `
    <div class="form-check form-switch ${className}">
      <input class="form-check-input" type="checkbox" id="${id}" ${checked ? "checked" : ""} ${disabled ? "disabled" : ""}>
      <label class="form-check-label" for="${id}">
        <strong>${escapeHtml(title)}</strong>
        ${description ? `<br><small class="text-muted">${escapeHtml(description)}</small>` : ""}
      </label>
    </div>
  `;
}

function renderPreferenciaNotificacionesPage() {
  const pref = state.notificaciones;

  return `
    <div class="container py-4">
      ${encabezadoInterno({
        pageTitle: "Notificaciones",
        profileImage: state.perfil.imagePreview || DEFAULT_PROFILE_IMAGE,
        profileName: state.perfil.nombre || "Usuario",
        currentRole: getCurrentRoleLabel(),
        isAsesor: false,
        brandTarget: getBrandTarget(window.location.pathname),
      })}

      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body">
          <h5 class="card-title mb-3">Notificaciones de Gastos</h5>

          <div class="alert alert-info small mb-4" role="alert">Recibe alertas sobre tus gastos y presupuesto</div>

          ${renderNotificationToggleItem({
            id: "gastosAltos",
            checked: pref.gastosAltos,
            title: "Gastos Inusualmente Altos",
            description:
              "Notificacion cuando registres un gasto mayor a tu promedio",
          })}

          <hr>

          ${renderNotificationToggleItem({
            id: "presupuestoExcedido",
            checked: pref.presupuestoExcedido,
            title: "Presupuesto Excedido",
            description:
              "Alerta cuando te acerques o excedas tu presupuesto mensual",
          })}

          <hr>

          ${renderNotificationToggleItem({
            id: "recordatorioAhorros",
            checked: pref.recordatorioAhorros,
            title: "Recordatorio de Ahorros",
            description: "Recordatorios semanales para cumplir metas de ahorro",
          })}
        </div>
      </div>

      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body">
          <h5 class="card-title mb-3">Otras Notificaciones</h5>

          ${renderNotificationToggleItem({
            id: "ofertasEspeciales",
            checked: pref.ofertasEspeciales,
            title: "Ofertas y Promociones",
            description:
              "Recibe informacion sobre nuevas funciones y ofertas especiales",
          })}

          <hr>

          ${renderNotificationToggleItem({
            id: "reporteMensual",
            checked: pref.reporteMensual,
            title: "Reporte Mensual",
            description: "Resumen de tus gastos e ingresos al final de mes",
          })}

          <hr>

          ${renderNotificationToggleItem({
            id: "alertasSeguridad",
            checked: pref.alertasSeguridad,
            title: "Alertas de Seguridad",
            description:
              "Notificaciones sobre cambios en tu cuenta (siempre activas)",
            disabled: true,
            className: "",
          })}
        </div>
      </div>

      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body">
          <h5 class="card-title mb-3">Canales de Notificacion</h5>
          <p class="text-muted small mb-3">Elige como prefieres recibir notificaciones</p>

          ${renderNotificationToggleItem({
            id: "email",
            checked: pref.email,
            title: "Correo Electronico",
            className: "mb-3",
          })}

          ${renderNotificationToggleItem({
            id: "push",
            checked: pref.push,
            title: "Notificaciones Push",
            className: "mb-3",
          })}

          ${renderNotificationToggleItem({
            id: "sms",
            checked: pref.sms,
            title: "SMS",
            description: "Puede aplicarse costo adicional segun tu plan",
            className: "",
          })}
        </div>
      </div>

      <div class="d-flex gap-2">
        <button class="btn btn-primary" id="guardarPreferenciasBtn">Guardar Preferencias</button>
        <button class="btn btn-outline-secondary" data-action="back">Cancelar</button>
      </div>
    </div>
  `;
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

  if (pathname === "/dashboard/asesor") {
    return renderDashboardLayout(renderDashboardAsesorPage(), {
      showScrollTop: false,
    });
  }

  if (pathname.startsWith("/cliente/")) {
    if (!resolveDetalleCliente(pathname)) {
      return null;
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
    pathname === "/dashboard/asesor" ||
    pathname.startsWith("/cliente/") ||
    pathname.startsWith("/perfil/");
}

function hasAuthenticatedSession() {
  return Boolean(getAccessToken() && state.currentUser?.id);
}

function attachGlobalNavigation() {
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[data-link]");
    if (link) {
      const href = link.getAttribute("href");
      if (!href) {
        return;
      }
      closeLandingMobileMenu();
      event.preventDefault();
      navigate(href);
      return;
    }

    const navButton = event.target.closest("[data-nav]");
    if (navButton) {
      const path = navButton.getAttribute("data-nav");
      if (path) {
        event.preventDefault();
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
      return;
    }

    const action = actionButton.getAttribute("data-action");

    if (action === "toggle-landing-mobile-menu") {
      event.preventDefault();
      toggleLandingMobileMenu();
      return;
    }

    if (action === "close-landing-mobile-menu") {
      event.preventDefault();
      closeLandingMobileMenu({ restoreFocus: true });
      return;
    }

    if (action === "back") {
      event.preventDefault();
      navigateBack();
      return;
    }

    if (action === "back-to-asesor") {
      event.preventDefault();
      navigate("/dashboard/asesor");
      return;
    }

    if (action === "scroll-top-page") {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (action === "brand-scroll-top") {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (action === "brand-navigation") {
      event.preventDefault();
      const target = actionButton.getAttribute("data-target");

      if (target) {
        navigate(target);
      }
      return;
    }

    if (action === "logout") {
      event.preventDefault();
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      state.currentUser = null;
      state.profileLoaded = true;
      navigate("/login", true);
      return;
    }

    if (action === "toggle-dashboard-expenses") {
      state.dashboard.showAllRecentExpenses =
        actionButton.getAttribute("data-value") === "show";
      render();
      return;
    }

    if (action === "toggle-detalle-expenses") {
      state.detalleCliente.showAllRecentExpenses =
        actionButton.getAttribute("data-value") === "show";
      render();
      return;
    }

    if (action === "open-ingreso-modal") {
      state.dashboard.modals.ingreso = true;
      render();
      return;
    }

    if (action === "close-ingreso-modal") {
      state.dashboard.modals.ingreso = false;
      render();
      return;
    }

    if (action === "open-ahorro-modal") {
      state.dashboard.modals.ahorro = true;
      render();
      return;
    }

    if (action === "close-ahorro-modal") {
      state.dashboard.modals.ahorro = false;
      render();
      return;
    }

    if (action === "open-destino-modal") {
      const ahorroId = actionButton.getAttribute("data-ahorro-id");
      if (!ahorroId) {
        return;
      }
      state.dashboard.ahorroDestinoId = ahorroId;
      state.dashboard.destinoForm.monto = "";
      state.dashboard.modals.destino = true;
      render();
      return;
    }

    if (action === "close-destino-modal") {
      state.dashboard.modals.destino = false;
      state.dashboard.ahorroDestinoId = null;
      render();
      return;
    }

    if (action === "desvincular-cliente") {
      const clienteId = actionButton.getAttribute("data-cliente-id");
      if (
        clienteId &&
        window.confirm("Estas seguro de desvincular a este cliente?")
      ) {
        state.asesor.clientes = state.asesor.clientes.filter(
          (cliente) => cliente.id !== clienteId,
        );
        render();
      }
      return;
    }

    if (action === "cerrar-sesion") {
      const sesionId = Number(actionButton.getAttribute("data-sesion-id"));
      if (!Number.isNaN(sesionId)) {
        state.configuracion.sesiones = state.configuracion.sesiones.filter(
          (sesion) => sesion.id !== sesionId,
        );
        window.alert("Sesion cerrada");
        render();
      }
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeLandingMobileMenu({ restoreFocus: true });
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 992) {
      closeLandingMobileMenu();
    }
  });

  window.addEventListener("popstate", () => {
    closeLandingMobileMenu();
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
    // OAuth social temporalmente deshabilitado.
    // const googleButton = document.getElementById("loginGoogleBtn");
    // const appleButton = document.getElementById("loginAppleBtn");

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

    /*
    const authErrorFromQuery = new URLSearchParams(window.location.search).get(
      "authError",
    );
    if (authErrorFromQuery) {
      setAuthError(authErrorFromQuery, [emailInput, passwordInput]);
      history.replaceState({}, "", "/login");
    }

    googleButton?.addEventListener("click", () => {
      startSocialAuth("google");
    });

    appleButton?.addEventListener("click", () => {
      startSocialAuth("apple");
    });
    */

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
    // OAuth social temporalmente deshabilitado.
    // const googleButton = document.getElementById("registerGoogleBtn");
    // const appleButton = document.getElementById("registerAppleBtn");

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

    /*
    googleButton?.addEventListener("click", () => {
      startSocialAuth("google");
    });

    appleButton?.addEventListener("click", () => {
      startSocialAuth("apple");
    });
    */

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

      if (!nombre) {
        return;
      }

      dashboard.ahorros = [
        {
          id: Date.now().toString(),
          nombre,
          monto: Number.isNaN(montoInicial) ? 0 : montoInicial,
          meta: Number.isNaN(meta) || meta <= 0 ? undefined : meta,
        },
        ...dashboard.ahorros,
      ];

      dashboard.nuevoAhorroForm = { nombre: "", montoInicial: "", meta: "" };
      dashboard.modals.ahorro = false;
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

  if (pathname === "/dashboard/asesor") {
    const busquedaInput = document.getElementById("busquedaCliente");
    busquedaInput?.addEventListener("input", (event) => {
      state.asesor.busqueda = event.target.value;
      render();
    });

    const agregarClienteForm = document.getElementById("agregarClienteForm");
    agregarClienteForm?.addEventListener("submit", (event) => {
      event.preventDefault();

      const nombre = (
        document.getElementById("nombreCliente")?.value ?? ""
      ).trim();
      const presupuestoStr =
        document.getElementById("presupuestoCliente")?.value ?? "";
      const presupuesto = Number.parseFloat(presupuestoStr);

      state.asesor.nuevoCliente = {
        nombre,
        presupuesto: presupuestoStr,
      };

      if (!nombre || Number.isNaN(presupuesto)) {
        return;
      }

      state.asesor.clientes = [
        ...state.asesor.clientes,
        {
          id: Date.now().toString(),
          nombre,
          gastosMes: 0,
          ahorros: 0,
          presupuesto,
          estado: "normal",
        },
      ];

      state.asesor.nuevoCliente = { nombre: "", presupuesto: "" };

      const modalElement = document.getElementById("agregarClienteModal");
      const modalInstance =
        bootstrap.Modal.getInstance(modalElement) ??
        new bootstrap.Modal(modalElement);
      modalInstance.hide();

      render();
    });

    const nombreClienteInput = document.getElementById("nombreCliente");
    const presupuestoClienteInput =
      document.getElementById("presupuestoCliente");

    nombreClienteInput?.addEventListener("input", (event) => {
      state.asesor.nuevoCliente.nombre = event.target.value;
    });

    presupuestoClienteInput?.addEventListener("input", (event) => {
      state.asesor.nuevoCliente.presupuesto = event.target.value;
    });
  }

  if (pathname.startsWith("/cliente/")) {
    const formRecomendacion = document.getElementById(
      "agregarRecomendacionForm",
    );
    formRecomendacion?.addEventListener("submit", (event) => {
      event.preventDefault();

      const texto = (
        document.getElementById("recomendacion")?.value ?? ""
      ).trim();
      state.detalleCliente.nuevaRecomendacion = texto;

      if (!texto) {
        return;
      }

      state.detalleCliente.recomendaciones = [
        {
          id: Date.now().toString(),
          texto,
          fecha: getCurrentDateShort(),
        },
        ...state.detalleCliente.recomendaciones,
      ];
      state.detalleCliente.nuevaRecomendacion = "";
      render();
    });

    const recomendacionInput = document.getElementById("recomendacion");
    recomendacionInput?.addEventListener("input", (event) => {
      state.detalleCliente.nuevaRecomendacion = event.target.value;
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
        window.alert("No se pudo identificar el usuario autenticado");
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
        window.alert("Perfil actualizado correctamente");
        render();
      } catch (error) {
        window.alert(error.message);
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
        window.alert("Las contrasenas no coinciden");
        return;
      }

      window.alert("Contrasena actualizada correctamente");
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
    const monedaSelect = document.getElementById("moneda");
    monedaSelect?.addEventListener("change", (event) => {
      state.configuracion.moneda = event.target.value;
    });

    const idiomaSelect = document.getElementById("idioma");
    idiomaSelect?.addEventListener("change", (event) => {
      state.configuracion.idioma = event.target.value;
    });

    const temaOscuroInput = document.getElementById("temaOscuro");
    temaOscuroInput?.addEventListener("change", (event) => {
      state.configuracion.temaOscuro = event.target.checked;
      saveThemePreference(state.configuracion.temaOscuro);
      applyTheme(state.configuracion.temaOscuro);
      render();
    });

    const autenticacionInput = document.getElementById("autenticacionDos");
    autenticacionInput?.addEventListener("change", () => {
      state.configuracion.autenticacionDos =
        !state.configuracion.autenticacionDos;
      render();
    });

    const guardarBtn = document.getElementById("guardarConfiguracionBtn");
    guardarBtn?.addEventListener("click", () => {
      window.alert("Cambios guardados");
    });

    const cerrarTodasBtn = document.getElementById("cerrarTodasSesionesBtn");
    cerrarTodasBtn?.addEventListener("click", () => {
      if (state.configuracion.sesiones.length > 0) {
        state.configuracion.sesiones = [state.configuracion.sesiones[0]];
      }
      window.alert("Todas las sesiones excepto esta han sido cerradas");
      render();
    });
  }

  if (pathname === "/perfil/notificaciones") {
    const toggleKeys = [
      "gastosAltos",
      "presupuestoExcedido",
      "recordatorioAhorros",
      "ofertasEspeciales",
      "reporteMensual",
      "email",
      "push",
      "sms",
    ];

    toggleKeys.forEach((key) => {
      const input = document.getElementById(key);
      input?.addEventListener("change", () => {
        state.notificaciones[key] = !state.notificaciones[key];
        render();
      });
    });

    const guardarBtn = document.getElementById("guardarPreferenciasBtn");
    guardarBtn?.addEventListener("click", () => {
      window.alert("Preferencias actualizadas correctamente");
    });
  }
}

function buildPieChart(canvasId, labels, values, centerPercentage = 0) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) {
    return;
  }

  const isDark = state.configuracion.temaOscuro;
  const legendColor = isDark ? "#cbd5e1" : "#334155";
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
          backgroundColor: [
            "rgba(13, 110, 253, 0.85)", // Azul
            "rgba(25, 135, 84, 0.85)",  // Verde
            "rgba(220, 53, 69, 0.85)",  // Rojo
            "rgba(255, 193, 7, 0.85)",  // Amarillo
            "rgba(13, 202, 240, 0.85)", // Celeste
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
        legend: { 
          position: "right", 
          labels: {
            usePointStyle: true,
            padding: 15,
            color: legendColor,
            font: { family: "'Inter', sans-serif", size: 13 },
          },
        },
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

function buildLineChart(canvasId, months) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) {
    return;
  }

  const isDark = state.configuracion.temaOscuro;
  const axisTextColor = isDark ? "#cbd5e1" : "#334155";
  const gridColor = isDark ? "#334155" : "#e2e8f0";
  const tooltipBackground = isDark
    ? "rgba(15, 23, 42, 0.95)"
    : "rgba(255, 255, 255, 0.9)";
  const tooltipTitle = isDark ? "#f8fafc" : "#333";
  const tooltipBody = isDark ? "#cbd5e1" : "#666";
  const tooltipBorder = isDark ? "#334155" : "#e2e8f0";
  const pointBackgroundColor = isDark ? "#0f172a" : "#fff";

  const instance = new Chart(canvas, {
    type: "line",
    data: {
      labels: months.map((item) => item.mes),
      datasets: [
        {
          label: "Gasto Mensual",
          data: months.map((item) => item.monto),
          borderColor: "#0d6efd",
          backgroundColor: "rgba(13, 110, 253, 0.15)",
          borderWidth: 3,
          pointBackgroundColor,
          pointBorderColor: "#0d6efd",
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.4,
          fill: true,
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
          padding: 10,
          boxPadding: 4,
          usePointStyle: true,
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: axisTextColor,
            font: { family: "'Inter', sans-serif" },
          }
        },
        y: {
          beginAtZero: true,
          border: { display: false },
          grid: { color: gridColor, borderDash: [5, 5] },
          ticks: {
            color: axisTextColor,
            font: { family: "'Inter', sans-serif" },
            padding: 10,
          }
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
    const gastosMensuales = 14350.75;
    const pozoAhorrado = state.dashboard.ahorros.reduce(
      (sum, ahorro) => sum + ahorro.monto,
      0,
    );
    const referenciaTotal = gastosMensuales + pozoAhorrado;
    const porcentajeGastado =
      referenciaTotal > 0 ? (gastosMensuales / referenciaTotal) * 100 : 0;

    buildPieChart(
      "dashboardPieChart",
      ["Comida", "Vivienda", "Transporte", "Ocio", "Otros"],
      [35, 25, 15, 10, 15],
      porcentajeGastado,
    );
    buildLineChart("dashboardLineChart", monthlyExpensesDashboard);
  }

  if (pathname.startsWith("/cliente/")) {
    const detalleCliente = resolveDetalleCliente(pathname);
    const presupuesto = Number(detalleCliente?.presupuesto || 0);
    const gastadoMes = Number(detalleCliente?.gastadoMes || 0);
    const porcentajeGastado = presupuesto > 0 ? (gastadoMes / presupuesto) * 100 : 0;

    buildPieChart(
      "detallePieChart",
      ["Comida", "Vivienda", "Transporte", "Salud", "Otros"],
      [35, 25, 15, 10, 15],
      porcentajeGastado,
    );
    buildLineChart("detalleLineChart", monthlyExpensesDetalle);
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

  return state.configuracion.temaOscuro;
}

function render() {
  const pathname = window.location.pathname;

  if (isProtectedRoute(pathname) && !hasAuthenticatedSession()) {
    navigate("/login", true);
    return;
  }

  // OAuth de terceros deshabilitado temporalmente.
  // if (pathname === OAUTH_CALLBACK_PATH) {
  //   processOAuthCallback();
  //   return;
  // }

  applyTheme(resolveThemeForPath(pathname));

  // Limpiar backdrops de Bootstrap en caso de navegación rápida desde menús desplegables
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';

  const view = buildRouteView(pathname);

  if (!view) {
    navigate("/", true);
    return;
  }

  appRoot.innerHTML = view;
  attachFormHandlers(pathname);
  initCharts(pathname);
}

attachGlobalNavigation();
state.configuracion.temaOscuro = loadThemePreference();
applyTheme(resolveThemeForPath(window.location.pathname));
loadCurrentUser().finally(() => {
  render();
});

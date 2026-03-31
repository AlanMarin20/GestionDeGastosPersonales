import 'bootstrap/dist/css/bootstrap.min.css';
import * as bootstrap from 'bootstrap';
import Chart from 'chart.js/auto';
import { encabezado } from './components/common/reusablePageComponents';
import { renderConfiguracionCuentaPage as renderConfiguracionCuentaPageView } from './pages/ConfiguracionCuentaPage';
import {
  renderDetalleClientePage as renderDetalleClientePageView,
  resolveDetalleCliente as resolveDetalleClienteView,
} from './pages/DetalleClientePage';
import { renderDashboardAsesorPage as renderDashboardAsesorPageView } from './pages/DashboardAsesorPage';
import { renderDashboardPage as renderDashboardPageView } from './pages/DashboardPage';
import { renderEditarPerfilPage as renderEditarPerfilPageView } from './pages/EditarPerfilPage';
import { renderLandingPage as renderLandingPageView } from './pages/LandingPage';
import { renderLoginPage as renderLoginPageView } from './pages/LoginPage';
import './index.css';
import './App.css';
import './components/dashboard/dashboard-widgets.css';

const appRoot = document.getElementById('root');

const state = {
  dashboard: {
    saldoActual: 6149.25,
    gastos: [
      { id: '1', descripcion: 'Almuerzo', monto: 25.5, categoria: 'Comida', fecha: '24 mar' },
      { id: '2', descripcion: 'Gasolina', monto: 45, categoria: 'Transporte', fecha: '23 mar' },
      { id: '3', descripcion: 'Alquiler', monto: 1200, categoria: 'Vivienda', fecha: '20 mar' },
    ],
    ahorros: [
      { id: '1', nombre: 'Vacaciones', monto: 1500, meta: 3000 },
      { id: '2', nombre: 'Auto Nuevo', monto: 850, meta: 2500 },
      { id: '3', nombre: 'Emergencias', monto: 2000 },
    ],
    formData: {
      descripcion: '',
      monto: '',
      categoria: 'Comida',
    },
    ingresoForm: {
      monto: '',
      concepto: '',
      origen: 'Sueldo',
    },
    nuevoAhorroForm: {
      nombre: '',
      montoInicial: '',
      meta: '',
    },
    destinoForm: {
      monto: '',
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
        id: '1',
        nombre: 'Juan Perez',
        gastosMes: 14350.75,
        ahorros: 2500,
        presupuesto: 15000,
        estado: 'alerta',
      },
      {
        id: '2',
        nombre: 'Maria Garcia',
        gastosMes: 8920.5,
        ahorros: 5200,
        presupuesto: 10000,
        estado: 'bueno',
      },
      {
        id: '3',
        nombre: 'Carlos Lopez',
        gastosMes: 12000,
        ahorros: 1800,
        presupuesto: 12500,
        estado: 'normal',
      },
    ],
    busqueda: '',
    nuevoCliente: {
      nombre: '',
      presupuesto: '',
    },
  },
  detalleCliente: {
    gastos: [
      { id: '1', descripcion: 'Almuerzo', monto: 25.5, categoria: 'Comida', fecha: '24 mar' },
      { id: '2', descripcion: 'Gasolina', monto: 45, categoria: 'Transporte', fecha: '23 mar' },
      { id: '3', descripcion: 'Alquiler', monto: 1200, categoria: 'Vivienda', fecha: '20 mar' },
      { id: '4', descripcion: 'Internet', monto: 50, categoria: 'Servicios', fecha: '18 mar' },
      { id: '5', descripcion: 'Supermercado', monto: 150, categoria: 'Comida', fecha: '17 mar' },
      { id: '6', descripcion: 'Cine', monto: 30, categoria: 'Ocio', fecha: '15 mar' },
      { id: '7', descripcion: 'Farmacia', monto: 85, categoria: 'Salud', fecha: '14 mar' },
      { id: '8', descripcion: 'Restaurante', monto: 95, categoria: 'Comida', fecha: '12 mar' },
      { id: '9', descripcion: 'Taxi', monto: 35, categoria: 'Transporte', fecha: '10 mar' },
      { id: '10', descripcion: 'Cafeteria', monto: 12, categoria: 'Comida', fecha: '08 mar' },
    ],
    recomendaciones: [
      { id: '1', texto: 'Considera reducir gastos de comida un 15%', fecha: '22 mar' },
      { id: '2', texto: 'Tu presupuesto de vivienda esta dentro del limite', fecha: '20 mar' },
    ],
    nuevaRecomendacion: '',
    showAllRecentExpenses: false,
  },
  perfil: {
    nombre: 'Juan Perez',
    email: 'juan.perez@example.com',
    imagen: 'https://via.placeholder.com/150',
    passwordData: {
      actual: '',
      nueva: '',
      confirmar: '',
    },
    imagePreview: 'https://via.placeholder.com/150',
  },
  configuracion: {
    moneda: 'USD',
    idioma: 'es',
    temaOscuro: false,
    autenticacionDos: false,
    sesionesActivas: true,
    sesiones: [
      { id: 1, dispositivo: 'Chrome - Windows', ubicacion: 'Buenos Aires', fecha: 'Hoy' },
      { id: 2, dispositivo: 'Safari - iPhone', ubicacion: 'Buenos Aires', fecha: 'Hace 2 dias' },
      { id: 3, dispositivo: 'Chrome - Mac', ubicacion: 'Buenos Aires', fecha: 'Hace 5 dias' },
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
  { mes: 'Abr', monto: 8700 },
  { mes: 'May', monto: 9050 },
  { mes: 'Jun', monto: 9800 },
  { mes: 'Jul', monto: 10200 },
  { mes: 'Ago', monto: 10850 },
  { mes: 'Sep', monto: 11100 },
  { mes: 'Oct', monto: 9200 },
  { mes: 'Nov', monto: 10150 },
  { mes: 'Dic', monto: 11300 },
  { mes: 'Ene', monto: 12850 },
  { mes: 'Feb', monto: 11900 },
  { mes: 'Mar', monto: 14350.75 },
];

const monthlyExpensesDetalle = [
  { mes: 'Abril', monto: 9800 },
  { mes: 'Mayo', monto: 10150 },
  { mes: 'Junio', monto: 10600 },
  { mes: 'Julio', monto: 11000 },
  { mes: 'Agosto', monto: 10850 },
  { mes: 'Septiembre', monto: 11250 },
  { mes: 'Octubre', monto: 12000 },
  { mes: 'Noviembre', monto: 13500 },
  { mes: 'Diciembre', monto: 14350 },
  { mes: 'Enero', monto: 11200 },
  { mes: 'Febrero', monto: 12800 },
  { mes: 'Marzo', monto: 13000 },
];

let chartInstances = [];

function formatCurrency(value) {
  return `$${Number(value).toFixed(2)}`;
}

function getCurrentDateShort() {
  return new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function navigate(path, replace = false) {
  if (replace) {
    history.replaceState({}, '', path);
  } else {
    history.pushState({}, '', path);
  }
  render();
}

function navigateBack() {
  history.back();
}

function cambioRol(pathname) {
  return pathname.startsWith('/dashboard/asesor') || pathname.startsWith('/cliente/')
    ? 'Asesor'
    : 'Usuario';
}

function renderAppHeader({ rightContent = '', brandAction = '' } = {}) {
  return `
    <header class="border-bottom bg-primary">
      <nav class="container-fluid px-3 px-md-4 navbar navbar-expand-lg py-3">
        <button
          type="button"
          class="navbar-brand fw-semibold mb-0 text-white bg-transparent border-0 p-0"
          ${brandAction ? `data-nav="${brandAction}" style="cursor:pointer"` : ''}
        >
          Gestion de Gastos Personales
        </button>
        ${
          rightContent
            ? `<div class="ms-auto d-flex align-items-center gap-2">${rightContent}</div>`
            : ''
        }
      </nav>
    </header>
  `;
}

function renderTopNavbar(pathname) {
  const currentRole = cambioRol(pathname);
  const brandAction = pathname.startsWith('/cliente/') ? '/dashboard/asesor' : '/dashboard';

  return renderAppHeader({
    brandAction,
    rightContent: `
      <div class="dropdown">
        <button
          class="btn btn-light btn-sm dropdown-toggle"
          type="button"
          id="roleDropdown"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          ${currentRole}
        </button>
        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="roleDropdown">
          <li><a class="dropdown-item ${currentRole === 'Usuario' ? 'active' : ''}" href="/dashboard" data-link>Usuario</a></li>
          <li><a class="dropdown-item ${currentRole === 'Asesor' ? 'active' : ''}" href="/dashboard/asesor" data-link>Asesor</a></li>
        </ul>
      </div>
      <div class="dropdown">
        <button
          class="btn btn-light btn-sm dropdown-toggle"
          type="button"
          id="profileDropdown"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          Perfil
        </button>
        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="profileDropdown">
          <li><a class="dropdown-item" href="/perfil/editar" data-link>Editar Perfil</a></li>
          <li><a class="dropdown-item" href="/perfil/configuracion" data-link>Configuracion de Cuenta</a></li>
          <li><a class="dropdown-item" href="/perfil/notificaciones" data-link>Preferencias de Notificacion</a></li>
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item" href="/" data-link>Cerrar Sesion</a></li>
        </ul>
      </div>
    `,
  });
}

function renderDashboardLayout(content, pathname) {
  return `
    <div class="app-shell bg-body-tertiary min-vh-100 d-flex flex-column">
      ${renderTopNavbar(pathname)}
      <main class="app-main container-fluid py-4 px-3 px-md-4 flex-grow-1">
        ${content}
      </main>
    </div>
  `;
}

function renderMetricCard({ title, value, color = 'primary' }) {
  const colorClasses = {
    success: 'border-start border-success',
    danger: 'border-start border-danger',
    info: 'border-start border-info',
    warning: 'border-start border-warning',
    primary: 'border-start border-primary',
  };

  return `
    <article class="card border-0 shadow-sm h-100 ${colorClasses[color] ?? colorClasses.primary}" style="border-left-width:4px">
      <div class="card-body">
        <p class="text-secondary mb-1 small">${escapeHtml(title)}</p>
        <h2 class="h4 mb-0">${escapeHtml(value)}</h2>
      </div>
    </article>
  `;
}

function renderLandingPage() {
  return renderLandingPageView({ renderAppHeader });
}

function renderLoginPage() {
  return renderLoginPageView({ renderAppHeader });
}

function renderDashboardPage() {
  return renderDashboardPageView({
    state,
    formatCurrency,
    escapeHtml,
    renderMetricCard,
  });
}

function renderDashboardAsesorPage() {
  return renderDashboardAsesorPageView({
    state,
    escapeHtml,
    formatCurrency,
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
    encabezado,
  });
}

function renderEditarPerfilPage() {
  return renderEditarPerfilPageView({ state, escapeHtml, encabezado });
}

function renderConfiguracionCuentaPage() {
  return renderConfiguracionCuentaPageView({ state, escapeHtml, encabezado });
}

function renderNotificationToggleItem({ id, checked, title, description = '', disabled = false, className = 'mb-3' }) {
  return `
    <div class="form-check form-switch ${className}">
      <input class="form-check-input" type="checkbox" id="${id}" ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''}>
      <label class="form-check-label" for="${id}">
        <strong>${escapeHtml(title)}</strong>
        ${description ? `<br><small class="text-muted">${escapeHtml(description)}</small>` : ''}
      </label>
    </div>
  `;
}

function renderPreferenciaNotificacionesPage() {
  const pref = state.notificaciones;

  return `
    <div class="container py-4">
      ${
        encabezado({
          title: 'Preferencias de Notificacion',
          subtitle: 'Controla como y cuando recibiras notificaciones',
          backAction: 'back',
        })
      }

      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body">
          <h5 class="card-title mb-3">Notificaciones de Gastos</h5>

          <div class="alert alert-info small mb-4" role="alert">Recibe alertas sobre tus gastos y presupuesto</div>

          ${
            renderNotificationToggleItem({
              id: 'gastosAltos',
              checked: pref.gastosAltos,
              title: 'Gastos Inusualmente Altos',
              description: 'Notificacion cuando registres un gasto mayor a tu promedio',
            })
          }

          <hr>

          ${
            renderNotificationToggleItem({
              id: 'presupuestoExcedido',
              checked: pref.presupuestoExcedido,
              title: 'Presupuesto Excedido',
              description: 'Alerta cuando te acerques o excedas tu presupuesto mensual',
            })
          }

          <hr>

          ${
            renderNotificationToggleItem({
              id: 'recordatorioAhorros',
              checked: pref.recordatorioAhorros,
              title: 'Recordatorio de Ahorros',
              description: 'Recordatorios semanales para cumplir metas de ahorro',
            })
          }
        </div>
      </div>

      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body">
          <h5 class="card-title mb-3">Otras Notificaciones</h5>

          ${
            renderNotificationToggleItem({
              id: 'ofertasEspeciales',
              checked: pref.ofertasEspeciales,
              title: 'Ofertas y Promociones',
              description: 'Recibe informacion sobre nuevas funciones y ofertas especiales',
            })
          }

          <hr>

          ${
            renderNotificationToggleItem({
              id: 'reporteMensual',
              checked: pref.reporteMensual,
              title: 'Reporte Mensual',
              description: 'Resumen de tus gastos e ingresos al final de mes',
            })
          }

          <hr>

          ${
            renderNotificationToggleItem({
              id: 'alertasSeguridad',
              checked: pref.alertasSeguridad,
              title: 'Alertas de Seguridad',
              description: 'Notificaciones sobre cambios en tu cuenta (siempre activas)',
              disabled: true,
              className: '',
            })
          }
        </div>
      </div>

      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body">
          <h5 class="card-title mb-3">Canales de Notificacion</h5>
          <p class="text-muted small mb-3">Elige como prefieres recibir notificaciones</p>

          ${
            renderNotificationToggleItem({
              id: 'email',
              checked: pref.email,
              title: 'Correo Electronico',
              className: 'mb-3',
            })
          }

          ${
            renderNotificationToggleItem({
              id: 'push',
              checked: pref.push,
              title: 'Notificaciones Push',
              className: 'mb-3',
            })
          }

          ${
            renderNotificationToggleItem({
              id: 'sms',
              checked: pref.sms,
              title: 'SMS',
              description: 'Puede aplicarse costo adicional segun tu plan',
              className: '',
            })
          }
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
  if (pathname === '/') {
    return renderLandingPage();
  }

  if (pathname === '/login') {
    return renderLoginPage();
  }

  if (pathname === '/dashboard') {
    return renderDashboardLayout(renderDashboardPage(), pathname);
  }

  if (pathname === '/dashboard/asesor') {
    return renderDashboardLayout(renderDashboardAsesorPage(), pathname);
  }

  if (pathname.startsWith('/cliente/')) {
    if (!resolveDetalleCliente(pathname)) {
      return null;
    }
    return renderDashboardLayout(renderDetalleClientePage(pathname), pathname);
  }

  if (pathname === '/perfil/editar') {
    return renderDashboardLayout(renderEditarPerfilPage(), pathname);
  }

  if (pathname === '/perfil/configuracion') {
    return renderDashboardLayout(renderConfiguracionCuentaPage(), pathname);
  }

  if (pathname === '/perfil/notificaciones') {
    return renderDashboardLayout(renderPreferenciaNotificacionesPage(), pathname);
  }

  return null;
}

function attachGlobalNavigation() {
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[data-link]');
    if (link) {
      const href = link.getAttribute('href');
      if (!href) {
        return;
      }
      event.preventDefault();
      navigate(href);
      return;
    }

    const navButton = event.target.closest('[data-nav]');
    if (navButton) {
      const path = navButton.getAttribute('data-nav');
      if (path) {
        event.preventDefault();
        navigate(path);
      }
      return;
    }

    const actionButton = event.target.closest('[data-action]');
    if (!actionButton) {
      return;
    }

    const action = actionButton.getAttribute('data-action');

    if (action === 'back') {
      event.preventDefault();
      navigateBack();
      return;
    }

    if (action === 'back-to-asesor') {
      event.preventDefault();
      navigate('/dashboard/asesor');
      return;
    }

    if (action === 'toggle-dashboard-expenses') {
      state.dashboard.showAllRecentExpenses = actionButton.getAttribute('data-value') === 'show';
      render();
      return;
    }

    if (action === 'toggle-detalle-expenses') {
      state.detalleCliente.showAllRecentExpenses = actionButton.getAttribute('data-value') === 'show';
      render();
      return;
    }

    if (action === 'open-ingreso-modal') {
      state.dashboard.modals.ingreso = true;
      render();
      return;
    }

    if (action === 'close-ingreso-modal') {
      state.dashboard.modals.ingreso = false;
      render();
      return;
    }

    if (action === 'open-ahorro-modal') {
      state.dashboard.modals.ahorro = true;
      render();
      return;
    }

    if (action === 'close-ahorro-modal') {
      state.dashboard.modals.ahorro = false;
      render();
      return;
    }

    if (action === 'open-destino-modal') {
      const ahorroId = actionButton.getAttribute('data-ahorro-id');
      if (!ahorroId) {
        return;
      }
      state.dashboard.ahorroDestinoId = ahorroId;
      state.dashboard.destinoForm.monto = '';
      state.dashboard.modals.destino = true;
      render();
      return;
    }

    if (action === 'close-destino-modal') {
      state.dashboard.modals.destino = false;
      state.dashboard.ahorroDestinoId = null;
      render();
      return;
    }

    if (action === 'desvincular-cliente') {
      const clienteId = actionButton.getAttribute('data-cliente-id');
      if (clienteId && window.confirm('Estas seguro de desvincular a este cliente?')) {
        state.asesor.clientes = state.asesor.clientes.filter((cliente) => cliente.id !== clienteId);
        render();
      }
      return;
    }

    if (action === 'cerrar-sesion') {
      const sesionId = Number(actionButton.getAttribute('data-sesion-id'));
      if (!Number.isNaN(sesionId)) {
        state.configuracion.sesiones = state.configuracion.sesiones.filter((sesion) => sesion.id !== sesionId);
        window.alert('Sesion cerrada');
        render();
      }
    }
  });

  window.addEventListener('popstate', render);
}

function attachFormHandlers(pathname) {
  if (pathname === '/login') {
    const loginForm = document.getElementById('loginForm');
    loginForm?.addEventListener('submit', (event) => {
      event.preventDefault();
      navigate('/dashboard');
    });
  }

  if (pathname === '/dashboard') {
    const dashboard = state.dashboard;

    const nuevoGastoForm = document.getElementById('nuevoGastoForm');
    nuevoGastoForm?.addEventListener('submit', (event) => {
      event.preventDefault();
      const descripcionInput = document.getElementById('descripcion');
      const montoInput = document.getElementById('monto');
      const categoriaSelect = document.getElementById('categoria');

      const descripcion = descripcionInput?.value?.trim() ?? '';
      const montoStr = montoInput?.value ?? '';
      const categoria = categoriaSelect?.value ?? 'Comida';

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

      dashboard.formData = { descripcion: '', monto: '', categoria: 'Comida' };
      render();
    });

    ['descripcion', 'monto', 'categoria'].forEach((field) => {
      const input = document.getElementById(field);
      input?.addEventListener('input', (event) => {
        dashboard.formData[field] = event.target.value;
      });
      input?.addEventListener('change', (event) => {
        dashboard.formData[field] = event.target.value;
      });
    });

    const ingresoForm = document.getElementById('ingresoForm');
    ingresoForm?.addEventListener('submit', (event) => {
      event.preventDefault();

      const monto = Number.parseFloat(document.getElementById('ingresoMonto')?.value ?? '');
      const concepto = (document.getElementById('ingresoConcepto')?.value ?? '').trim();
      const origen = document.getElementById('ingresoOrigen')?.value ?? 'Sueldo';

      dashboard.ingresoForm = {
        monto: Number.isNaN(monto) ? '' : String(monto),
        concepto,
        origen,
      };

      if (!concepto || Number.isNaN(monto) || monto <= 0) {
        return;
      }

      dashboard.saldoActual += monto;
      dashboard.ingresoForm = { monto: '', concepto: '', origen: 'Sueldo' };
      dashboard.modals.ingreso = false;
      render();
    });

    ['ingresoMonto', 'ingresoConcepto', 'ingresoOrigen'].forEach((id) => {
      const input = document.getElementById(id);
      input?.addEventListener('input', () => {
        dashboard.ingresoForm = {
          monto: document.getElementById('ingresoMonto')?.value ?? '',
          concepto: document.getElementById('ingresoConcepto')?.value ?? '',
          origen: document.getElementById('ingresoOrigen')?.value ?? 'Sueldo',
        };
      });
      input?.addEventListener('change', () => {
        dashboard.ingresoForm = {
          monto: document.getElementById('ingresoMonto')?.value ?? '',
          concepto: document.getElementById('ingresoConcepto')?.value ?? '',
          origen: document.getElementById('ingresoOrigen')?.value ?? 'Sueldo',
        };
      });
    });

    const nuevoAhorroForm = document.getElementById('nuevoAhorroForm');
    nuevoAhorroForm?.addEventListener('submit', (event) => {
      event.preventDefault();

      const nombre = (document.getElementById('nuevoAhorroNombre')?.value ?? '').trim();
      const montoInicial = Number.parseFloat(document.getElementById('nuevoAhorroMonto')?.value ?? '');
      const meta = Number.parseFloat(document.getElementById('nuevoAhorroMeta')?.value ?? '');

      dashboard.nuevoAhorroForm = {
        nombre,
        montoInicial: Number.isNaN(montoInicial) ? '' : String(montoInicial),
        meta: Number.isNaN(meta) ? '' : String(meta),
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

      dashboard.nuevoAhorroForm = { nombre: '', montoInicial: '', meta: '' };
      dashboard.modals.ahorro = false;
      render();
    });

    ['nuevoAhorroNombre', 'nuevoAhorroMonto', 'nuevoAhorroMeta'].forEach((id) => {
      const input = document.getElementById(id);
      input?.addEventListener('input', () => {
        dashboard.nuevoAhorroForm = {
          nombre: document.getElementById('nuevoAhorroNombre')?.value ?? '',
          montoInicial: document.getElementById('nuevoAhorroMonto')?.value ?? '',
          meta: document.getElementById('nuevoAhorroMeta')?.value ?? '',
        };
      });
    });

    const destinoForm = document.getElementById('destinoForm');
    destinoForm?.addEventListener('submit', (event) => {
      event.preventDefault();

      const ahorroDestino = dashboard.ahorros.find((ahorro) => ahorro.id === dashboard.ahorroDestinoId);
      if (!ahorroDestino) {
        return;
      }

      const monto = Number.parseFloat(document.getElementById('destinoMonto')?.value ?? '');
      dashboard.destinoForm.monto = Number.isNaN(monto) ? '' : String(monto);

      if (Number.isNaN(monto) || monto <= 0 || monto > dashboard.saldoActual) {
        return;
      }

      dashboard.saldoActual -= monto;
      dashboard.ahorros = dashboard.ahorros.map((ahorro) =>
        ahorro.id === ahorroDestino.id ? { ...ahorro, monto: ahorro.monto + monto } : ahorro,
      );
      dashboard.modals.destino = false;
      dashboard.ahorroDestinoId = null;
      dashboard.destinoForm.monto = '';
      render();
    });

    const destinoInput = document.getElementById('destinoMonto');
    destinoInput?.addEventListener('input', (event) => {
      dashboard.destinoForm.monto = event.target.value;
    });
  }

  if (pathname === '/dashboard/asesor') {
    const busquedaInput = document.getElementById('busquedaCliente');
    busquedaInput?.addEventListener('input', (event) => {
      state.asesor.busqueda = event.target.value;
      render();
    });

    const agregarClienteForm = document.getElementById('agregarClienteForm');
    agregarClienteForm?.addEventListener('submit', (event) => {
      event.preventDefault();

      const nombre = (document.getElementById('nombreCliente')?.value ?? '').trim();
      const presupuestoStr = document.getElementById('presupuestoCliente')?.value ?? '';
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
          estado: 'normal',
        },
      ];

      state.asesor.nuevoCliente = { nombre: '', presupuesto: '' };

      const modalElement = document.getElementById('agregarClienteModal');
      const modalInstance = bootstrap.Modal.getInstance(modalElement) ?? new bootstrap.Modal(modalElement);
      modalInstance.hide();

      render();
    });

    const nombreClienteInput = document.getElementById('nombreCliente');
    const presupuestoClienteInput = document.getElementById('presupuestoCliente');

    nombreClienteInput?.addEventListener('input', (event) => {
      state.asesor.nuevoCliente.nombre = event.target.value;
    });

    presupuestoClienteInput?.addEventListener('input', (event) => {
      state.asesor.nuevoCliente.presupuesto = event.target.value;
    });
  }

  if (pathname.startsWith('/cliente/')) {
    const formRecomendacion = document.getElementById('agregarRecomendacionForm');
    formRecomendacion?.addEventListener('submit', (event) => {
      event.preventDefault();

      const texto = (document.getElementById('recomendacion')?.value ?? '').trim();
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
      state.detalleCliente.nuevaRecomendacion = '';
      render();
    });

    const recomendacionInput = document.getElementById('recomendacion');
    recomendacionInput?.addEventListener('input', (event) => {
      state.detalleCliente.nuevaRecomendacion = event.target.value;
    });
  }

  if (pathname === '/perfil/editar') {
    const perfilForm = document.getElementById('perfilForm');
    perfilForm?.addEventListener('submit', (event) => {
      event.preventDefault();

      state.perfil.nombre = document.getElementById('nombre')?.value ?? state.perfil.nombre;
      state.perfil.email = document.getElementById('email')?.value ?? state.perfil.email;

      window.alert('Perfil actualizado correctamente');
      render();
    });

    const nombreInput = document.getElementById('nombre');
    const emailInput = document.getElementById('email');

    nombreInput?.addEventListener('input', (event) => {
      state.perfil.nombre = event.target.value;
    });

    emailInput?.addEventListener('input', (event) => {
      state.perfil.email = event.target.value;
    });

    const imageInput = document.getElementById('imageInput');
    imageInput?.addEventListener('change', (event) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        state.perfil.imagePreview = String(reader.result || '');
        render();
      };
      reader.readAsDataURL(file);
    });

    const passwordForm = document.getElementById('passwordForm');
    passwordForm?.addEventListener('submit', (event) => {
      event.preventDefault();

      const actual = document.getElementById('actual')?.value ?? '';
      const nueva = document.getElementById('nueva')?.value ?? '';
      const confirmar = document.getElementById('confirmar')?.value ?? '';

      state.perfil.passwordData = { actual, nueva, confirmar };

      if (nueva !== confirmar) {
        window.alert('Las contrasenas no coinciden');
        return;
      }

      window.alert('Contrasena actualizada correctamente');
      state.perfil.passwordData = { actual: '', nueva: '', confirmar: '' };
      render();
    });

    ['actual', 'nueva', 'confirmar'].forEach((id) => {
      const input = document.getElementById(id);
      input?.addEventListener('input', () => {
        state.perfil.passwordData = {
          actual: document.getElementById('actual')?.value ?? '',
          nueva: document.getElementById('nueva')?.value ?? '',
          confirmar: document.getElementById('confirmar')?.value ?? '',
        };
      });
    });
  }

  if (pathname === '/perfil/configuracion') {
    const monedaSelect = document.getElementById('moneda');
    monedaSelect?.addEventListener('change', (event) => {
      state.configuracion.moneda = event.target.value;
    });

    const idiomaSelect = document.getElementById('idioma');
    idiomaSelect?.addEventListener('change', (event) => {
      state.configuracion.idioma = event.target.value;
    });

    const temaOscuroInput = document.getElementById('temaOscuro');
    temaOscuroInput?.addEventListener('change', () => {
      state.configuracion.temaOscuro = !state.configuracion.temaOscuro;
      render();
    });

    const autenticacionInput = document.getElementById('autenticacionDos');
    autenticacionInput?.addEventListener('change', () => {
      state.configuracion.autenticacionDos = !state.configuracion.autenticacionDos;
      render();
    });

    const guardarBtn = document.getElementById('guardarConfiguracionBtn');
    guardarBtn?.addEventListener('click', () => {
      window.alert('Cambios guardados');
    });

    const cerrarTodasBtn = document.getElementById('cerrarTodasSesionesBtn');
    cerrarTodasBtn?.addEventListener('click', () => {
      if (state.configuracion.sesiones.length > 0) {
        state.configuracion.sesiones = [state.configuracion.sesiones[0]];
      }
      window.alert('Todas las sesiones excepto esta han sido cerradas');
      render();
    });
  }

  if (pathname === '/perfil/notificaciones') {
    const toggleKeys = [
      'gastosAltos',
      'presupuestoExcedido',
      'recordatorioAhorros',
      'ofertasEspeciales',
      'reporteMensual',
      'email',
      'push',
      'sms',
    ];

    toggleKeys.forEach((key) => {
      const input = document.getElementById(key);
      input?.addEventListener('change', () => {
        state.notificaciones[key] = !state.notificaciones[key];
        render();
      });
    });

    const guardarBtn = document.getElementById('guardarPreferenciasBtn');
    guardarBtn?.addEventListener('click', () => {
      window.alert('Preferencias actualizadas correctamente');
    });
  }
}

function buildPieChart(canvasId, labels, values) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) {
    return;
  }

  const instance = new Chart(canvas, {
    type: 'pie',
    data: {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: ['#4CAF50', '#FFA500', '#2196F3', '#9C27B0', '#FFEB3B'],
          borderColor: ['#45a049', '#FB8500', '#1976D2', '#7B1FA2', '#FBC02D'],
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { position: 'bottom' },
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

  const instance = new Chart(canvas, {
    type: 'line',
    data: {
      labels: months.map((item) => item.mes),
      datasets: [
        {
          label: 'Gasto Mensual',
          data: months.map((item) => item.monto),
          borderColor: '#0d6efd',
          backgroundColor: 'rgba(13, 110, 253, 0.1)',
          tension: 0.4,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });

  chartInstances.push(instance);
}

function initCharts(pathname) {
  chartInstances.forEach((chart) => chart.destroy());
  chartInstances = [];

  if (pathname === '/dashboard') {
    buildPieChart('dashboardPieChart', ['Comida', 'Vivienda', 'Transporte', 'Ocio', 'Otros'], [35, 25, 15, 10, 15]);
    buildLineChart('dashboardLineChart', monthlyExpensesDashboard);
  }

  if (pathname.startsWith('/cliente/')) {
    buildPieChart('detallePieChart', ['Comida', 'Vivienda', 'Transporte', 'Salud', 'Otros'], [35, 25, 15, 10, 15]);
    buildLineChart('detalleLineChart', monthlyExpensesDetalle);
  }
}

function render() {
  const pathname = window.location.pathname;
  const view = buildRouteView(pathname);

  if (!view) {
    navigate('/', true);
    return;
  }

  appRoot.innerHTML = view;
  attachFormHandlers(pathname);
  initCharts(pathname);
}

attachGlobalNavigation();
render();

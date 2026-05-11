import { renderDashboardAppLayout } from "../components/dashboard/dashboardAppLayout";
import { escapeHtml } from "../utils/sanitize";
import { formatMoney } from "../utils/money";
import { getFinancialScore, getBudgetAlertsForPeriod, getFinanzasCurrentPeriod } from "../data/finanzas";

const SETTINGS_NAV_GROUPS = [
  {
    label: "Cuenta",
    items: [
      { id: "perfil", label: "Mi perfil", icon: "lni lni-user" },
      { id: "seguridad", label: "Seguridad", icon: "lni lni-lock-alt" },
      { id: "sesiones", label: "Sesiones", icon: "lni lni-tab" },
    ],
  },
  {
    label: "Finanzas",
    items: [
      { id: "presupuestos", label: "Presupuestos", icon: "lni lni-wallet" },
      { id: "categorias", label: "Categorias", icon: "lni lni-tag" },
    ],
  },
  {
    label: "Asesoria",
    items: [
      { id: "asesoria", label: "Asesor", icon: "lni lni-user" },
    ],
  },
  {
    label: "Preferencias",
    items: [
      { id: "notificaciones", label: "Notificaciones", icon: "lni lni-alarm" },
      { id: "apariencia", label: "Apariencia", icon: "lni lni-night" },
      { id: "datos", label: "Mis datos", icon: "lni lni-database" },
    ],
  },
  {
    label: "Plan",
    items: [
      { id: "plan", label: "Plan actual", icon: "lni lni-rocket" },
      { id: "danger", label: "Zona peligrosa", icon: "lni lni-warning" },
    ],
  },
];

const SETTINGS_SECTION_IDS = SETTINGS_NAV_GROUPS.reduce((ids, group) => {
  group.items.forEach((item) => ids.push(item.id));
  return ids;
}, []);

const DEFAULT_SETTINGS_SECTION = "perfil";

function getAdvisorInitials(name) {
  const words = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "AS";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function resolveActiveSettingsSection() {
  if (typeof window === "undefined") return DEFAULT_SETTINGS_SECTION;
  const hashValue = String(window.location.hash || "");
  const parsed = hashValue.startsWith("#config-") ? hashValue.slice("#config-".length) : "";
  return SETTINGS_SECTION_IDS.includes(parsed) ? parsed : DEFAULT_SETTINGS_SECTION;
}

function scoreLabel(score) {
  if (score >= 80) return "Excelente";
  if (score >= 60) return "Bueno";
  if (score >= 40) return "Regular";
  return "Bajo";
}

function scoreTier(score) {
  if (score >= 80) return "excellent";
  if (score >= 60) return "good";
  if (score >= 40) return "fair";
  return "low";
}

function renderSettingsNav(activeSection, alertsCount = 0) {
  return SETTINGS_NAV_GROUPS.map((group) => {
    const items = group.items.map((item) => {
      const isActive = item.id === activeSection;
      const badge = item.id === "notificaciones" && alertsCount > 0
        ? `<span class="gd-settings-nav-badge">${escapeHtml(String(alertsCount))}</span>`
        : "";

      return `
        <button
          type="button"
          class="gd-settings-nav-item ${isActive ? "active" : ""}"
          data-config-section-target="${escapeHtml(item.id)}"
          aria-controls="config-section-${escapeHtml(item.id)}"
          aria-selected="${isActive ? "true" : "false"}"
        >
          <i class="${escapeHtml(item.icon)}" aria-hidden="true"></i>
          <span>${escapeHtml(item.label)}</span>
          ${badge}
        </button>
      `;
    }).join("");

    return `
      <div class="gd-settings-nav-group">
        <p class="gd-settings-nav-label">${escapeHtml(group.label)}</p>
        ${items}
      </div>
    `;
  }).join("");
}

function renderProxBadge() {
  return `<span class="gd-settings-prox-badge">Próximamente</span>`;
}

function renderScoreRing(score) {
  const tier = scoreTier(score);
  const label = scoreLabel(score);
  const circumference = 2 * Math.PI * 28;
  const dashOffset = circumference - (score / 100) * circumference;

  return `
    <div class="gd-score-ring-wrap">
      <svg class="gd-score-ring gd-score-ring--${escapeHtml(tier)}" viewBox="0 0 64 64" aria-label="Score financiero: ${score}">
        <circle class="gd-score-ring-track" cx="32" cy="32" r="28" fill="none" stroke-width="6"/>
        <circle
          class="gd-score-ring-fill"
          cx="32" cy="32" r="28"
          fill="none" stroke-width="6"
          stroke-dasharray="${circumference.toFixed(2)}"
          stroke-dashoffset="${dashOffset.toFixed(2)}"
          transform="rotate(-90 32 32)"
        />
      </svg>
      <div class="gd-score-ring-inner">
        <span class="gd-score-ring-value">${score}</span>
        <span class="gd-score-ring-label">${escapeHtml(label)}</span>
      </div>
    </div>
  `;
}

function renderBudgetRow(budget, spentAmount, notifEnabled) {
  const spent = Number(spentAmount || 0);
  const limit = Number(budget.amountLimit || 0);
  const pct = limit > 0 ? Math.min(Math.round((spent / limit) * 100), 100) : 0;
  const rawPct = limit > 0 ? Math.round((spent / limit) * 100) : 0;
  const exceeded = rawPct > 100;
  const nearLimit = rawPct >= 80;
  const alertClass = exceeded ? "danger" : nearLimit ? "warning" : "";

  return `
    <div class="gd-settings-budget-row ${alertClass ? `gd-settings-budget-row--${alertClass}` : ""}">
      <span class="gd-settings-budget-cat">${escapeHtml(budget.categoryName)}</span>
      <div class="gd-settings-budget-bar">
        <span class="gd-settings-budget-fill ${exceeded ? "gd-settings-budget-fill--danger" : nearLimit ? "gd-settings-budget-fill--warn" : ""}"
          style="--gd-budget-fill: ${pct}%;"></span>
      </div>
      <span class="gd-settings-budget-pct ${exceeded ? "text-danger" : nearLimit && notifEnabled ? "text-warning" : ""}">${rawPct}%</span>
      <span class="gd-settings-budget-limit">${formatMoney(limit)}</span>
      <button type="button" class="gd-ahorro-ctrl-btn gd-ahorro-ctrl-btn--danger" data-action="delete-budget" data-budget-id="${escapeHtml(budget.id)}" aria-label="Eliminar presupuesto">
        <i class="lni lni-close" aria-hidden="true"></i>
      </button>
    </div>
  `;
}

function renderCategoryRow(cat) {
  const label = cat.icon ? `${cat.icon} ${cat.name}` : cat.name;
  const kindLabel = cat.isDefault ? "Sistema" : "Personal";
  const canDelete = !cat.isDefault;

  return `
    <div class="gd-settings-category-row">
      <span class="gd-settings-budget-cat">${escapeHtml(label)}</span>
      <span class="gd-settings-category-pill ${cat.isDefault ? "" : "gd-settings-category-pill--personal"}">${escapeHtml(kindLabel)}</span>
      ${canDelete
        ? `<button type="button" class="gd-ahorro-ctrl-btn gd-ahorro-ctrl-btn--danger" data-action="delete-category" data-category-id="${escapeHtml(String(cat.id))}" aria-label="Eliminar categoria">
             <i class="lni lni-close" aria-hidden="true"></i>
           </button>`
        : `<span></span>`}
    </div>
  `;
}

export function renderConfiguracionCuentaPage({ state, profileImage, profileName }) {
  const config = state.configuracion;
  const recomendacionesPendientes = state.finanzas?.recomendaciones?.length || 0;
  const activeSection = resolveActiveSettingsSection();
  const safeName = String(profileName || "Usuario").trim() || "Usuario";
  const nameParts = safeName.split(/\s+/).filter(Boolean);
  const firstName = nameParts[0] || "Usuario";
  const lastName = nameParts.slice(1).join(" ");
  const profileEmail = String(state.perfil?.email || "");
  const roleValue = String(state.currentUser?.role || state.currentUser?.rol || "").toLowerCase();
  const roleLabel = roleValue === "asesor" ? "asesor" : "usuario";
  const initials = nameParts.length > 1
    ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
    : firstName.slice(0, 2).toUpperCase();

  // Score financiero
  const score = getFinancialScore();
  const scoreDescriptions = {
    excellent: "Tus hábitos financieros son excelentes. Mantenés un buen nivel de ahorro y diversificación.",
    good: "Buen control financiero. Hay margen para mejorar tu tasa de ahorro mensual.",
    fair: "Podés mejorar. Revisá tus gastos y considerá crear objetivos de ahorro.",
    low: "Requiere atención. Tus gastos superan o igualan tus ingresos registrados.",
  };
  const scoreDesc = scoreDescriptions[scoreTier(score)];

  // Presupuestos con gasto real
  const currentPeriod = getFinanzasCurrentPeriod();
  const [cpYear, cpMonth] = currentPeriod ? currentPeriod.split("-").map(Number) : [0, 0];
  const budgets = (state.finanzas.budgets || []).filter((b) => b.month === cpMonth && b.year === cpYear);
  const budgetAlerts = getBudgetAlertsForPeriod();
  const notifEnabled = state.notificaciones?.alertaPresupuesto !== false;

  const spentByCategory = {};
  (state.finanzas.gastos || [])
    .filter((e) => {
      const [y, m] = (e.fecha || "").slice(0, 7).split("-").map(Number);
      return e.tipo === "egreso" && y === cpYear && m === cpMonth;
    })
    .forEach((e) => {
      spentByCategory[e.categoria] = (spentByCategory[e.categoria] || 0) + Number(e.monto || 0);
    });

  // Categorías
  const customCategories = state.finanzas.customCategories || [];
  const systemCategories = customCategories.filter((c) => c.isDefault);
  const personalCategories = customCategories.filter((c) => !c.isDefault);

  // Apariencia
  const themeLabel = { light: "Claro", dark: "Oscuro", system: "Sistema" }[config.tema] || "Sistema";
  const fontSizeLabel = { sm: "Pequeño", md: "Normal", lg: "Grande" }[config.tamanioFuente] || "Normal";
  const densityLabel = { comfortable: "Cómoda", compact: "Compacta" }[config.densidad] || "Cómoda";

  // Asesor
  const advisorLink = config.asesoria?.asesor || null;
  const advisorRequest = config.asesoria?.solicitud || {};
  const advisorName = String(advisorLink?.nombre || "").trim();
  const advisorEmail = String(advisorLink?.email || "").trim();
  const advisorSpecialty = String(advisorLink?.especialidad || "").trim();
  const advisorCode = String(advisorLink?.codigoVerificacion || "").trim();
  const advisorInitials = getAdvisorInitials(advisorName);
  const advisorHasProfile = Boolean(advisorLink);

  // Perfil financiero persistido
  const perfilFin = config.perfilFinanciero || {};
  const ingresoEstimado = String(perfilFin.ingresoEstimado || "");
  const objetivoAhorro = String(perfilFin.objetivoAhorro || "");

  // Plan: uso real
  const ticketCount = state.finanzas.gastos?.length || 0;
  const ticketLimit = 50;
  const ticketPct = Math.min(Math.round((ticketCount / ticketLimit) * 100), 100);

  // Categorías para el select de presupuestos
  const allCategoryOptions = customCategories.length > 0
    ? customCategories
    : (state.finanzas.categories || []).map((name) => ({ id: null, name }));

  const content = `
    <section class="gd-settings-shell">
      <aside class="gd-settings-nav" aria-label="Subsecciones de configuracion">
        ${renderSettingsNav(activeSection, recomendacionesPendientes)}
      </aside>

      <div class="gd-settings-content">

        <!-- PERFIL -->
        <section id="config-section-perfil" class="gd-settings-panel ${activeSection === "perfil" ? "active" : ""}" data-config-section="perfil" ${activeSection === "perfil" ? "" : "hidden"}>

          <article class="gd-card">
            <div class="gd-settings-profile-head">
              <div class="gd-settings-avatar-wrap">
                <label for="configProfileImageInput" class="gd-settings-avatar-image-trigger" aria-label="Cambiar foto de perfil">
                  <img src="${escapeHtml(profileImage || "/assets/img/user-avatar-default.svg")}" alt="Avatar" class="gd-settings-avatar-image" data-image-error-mode="toggle-next">
                  <span class="gd-settings-avatar-fallback d-none" aria-hidden="true">${escapeHtml(initials)}</span>
                </label>
              </div>
              <div class="gd-settings-profile-copy">
                <p class="gd-card-title">Mi perfil</p>
                <p class="gd-settings-profile-name">${escapeHtml(safeName)}</p>
                <p class="gd-muted mb-0">${escapeHtml(profileEmail)}</p>
              </div>
              <div class="gd-settings-profile-right">
                ${renderScoreRing(score)}
                <div class="gd-settings-avatar-actions">
                  <label for="configProfileImageInput" class="gd-action-btn">Cambiar foto</label>
                  <input id="configProfileImageInput" type="file" class="d-none" accept="image/*">
                </div>
              </div>
            </div>

            <div class="gd-settings-score-desc">
              <p class="gd-muted mb-0"><strong>Score ${score}/100 · ${escapeHtml(scoreLabel(score))}</strong> — ${escapeHtml(scoreDesc)}</p>
              <p class="gd-muted mb-0 mt-1" style="font-size: 0.78rem;">Se calcula en base a tu tasa de ahorro, objetivos activos, diversificación de gastos e historial disponible.</p>
            </div>

            <div class="gd-form-grid mt-3">
              <div>
                <label class="gd-form-label" for="configNombre">Nombre</label>
                <input id="configNombre" class="gd-form-input" value="${escapeHtml(firstName)}">
              </div>
              <div>
                <label class="gd-form-label" for="configApellido">Apellido</label>
                <input id="configApellido" class="gd-form-input" value="${escapeHtml(lastName)}">
              </div>
              <div class="gd-form-full">
                <label class="gd-form-label" for="configEmail">Email</label>
                <input id="configEmail" class="gd-form-input" value="${escapeHtml(profileEmail)}">
              </div>
              <div>
                <label class="gd-form-label" for="configMoneda">Moneda</label>
                <select id="moneda" name="moneda" class="gd-form-select">
                  <option value="ARS" ${config.moneda === "ARS" ? "selected" : ""}>Peso argentino (ARS)</option>
                  <option value="USD" disabled>Dolar USD (próximamente)</option>
                  <option value="EUR" disabled>Euro (próximamente)</option>
                </select>
              </div>
              <div>
                <label class="gd-form-label" for="configTelefono">
                  Telefono ${renderProxBadge()}
                </label>
                <input id="configTelefono" class="gd-form-input" placeholder="Sin verificación disponible" disabled style="opacity:0.5;cursor:not-allowed;">
              </div>
            </div>

            <div class="d-flex justify-content-end gap-2 mt-3">
              <button type="button" class="gd-btn-secondary">Cancelar</button>
              <button type="button" class="gd-btn-primary" id="guardarPerfilConfigBtn">Guardar cambios</button>
            </div>
          </article>

          <article class="gd-card">
            <h2 class="gd-card-title mb-1">Perfil financiero</h2>
            <p class="gd-muted mb-3">Información usada para recomendaciones personalizadas. Se guarda localmente.</p>
            <div class="gd-form-grid">
              <div>
                <label class="gd-form-label" for="configIngreso">Ingreso mensual estimado</label>
                <input id="configIngreso" type="number" min="0" class="gd-form-input" value="${escapeHtml(ingresoEstimado)}" placeholder="Ej: 350000">
              </div>
              <div>
                <label class="gd-form-label" for="configAhorro">Objetivo de ahorro mensual</label>
                <input id="configAhorro" type="number" min="0" class="gd-form-input" value="${escapeHtml(objetivoAhorro)}" placeholder="Ej: 80000">
              </div>
              <div class="gd-form-full">
                <label class="gd-form-label" for="configPerfilGasto">Perfil de gasto IA</label>
                <input id="configPerfilGasto" class="gd-form-input" value="Basado en tus registros del mes" disabled style="opacity:0.6;">
              </div>
            </div>
            <div class="d-flex justify-content-end mt-3">
              <button type="button" class="gd-btn-primary" id="guardarPerfilFinancieroBtn">Guardar perfil financiero</button>
            </div>
          </article>
        </section>

        <!-- SEGURIDAD -->
        <section id="config-section-seguridad" class="gd-settings-panel ${activeSection === "seguridad" ? "active" : ""}" data-config-section="seguridad" ${activeSection === "seguridad" ? "" : "hidden"}>
          <article class="gd-card">
            <h2 class="gd-card-title mb-1">Contraseña y acceso</h2>
            <p class="gd-muted mb-3">Actualizá tus credenciales y fortalecé la seguridad de tu cuenta.</p>

            <div class="gd-form-grid">
              <div class="gd-form-full">
                <label class="gd-form-label" for="passwordActual">Contraseña actual</label>
                <input id="passwordActual" type="password" class="gd-form-input" placeholder="••••••••">
              </div>
              <div>
                <label class="gd-form-label" for="passwordNueva">Nueva contraseña</label>
                <input id="passwordNueva" type="password" class="gd-form-input" placeholder="••••••••">
              </div>
              <div>
                <label class="gd-form-label" for="passwordConfirmar">Confirmar contraseña</label>
                <input id="passwordConfirmar" type="password" class="gd-form-input" placeholder="••••••••">
              </div>
            </div>

            <div class="gd-settings-toggle-row mt-3" style="opacity:0.55;" title="No disponible en esta versión">
              <div>
                <p class="gd-card-title gd-card-title-xs mb-0">
                  Autenticación en dos pasos ${renderProxBadge()}
                </p>
                <small class="gd-muted">Agrega un segundo factor al iniciar sesión.</small>
              </div>
              <input class="form-check-input mt-0" type="checkbox" id="autenticacionDos" disabled>
            </div>

            <div class="d-flex justify-content-end gap-2 mt-3">
              <button type="button" class="gd-btn-secondary">Cancelar</button>
              <button type="button" class="gd-btn-primary" id="guardarSeguridadBtn">Actualizar seguridad</button>
            </div>
          </article>

          <article class="gd-card">
            <h2 class="gd-card-title mb-1">Buenas prácticas recomendadas</h2>
            <ul class="gd-policy-list mb-0">
              <li>Usá contraseñas únicas para cada servicio. No reutilices claves de otras plataformas.</li>
              <li>Una contraseña fuerte tiene al menos 8 caracteres, incluye mayúsculas, números y símbolos.</li>
              <li>Activá autenticación en dos pasos (disponible próximamente) para mayor protección.</li>
              <li>Nunca compartas tu contraseña por chat, correo ni con terceros.</li>
              <li>Revisá periódicamente las sesiones activas para detectar accesos no autorizados.</li>
            </ul>
          </article>
        </section>

        <!-- SESIONES -->
        <section id="config-section-sesiones" class="gd-settings-panel ${activeSection === "sesiones" ? "active" : ""}" data-config-section="sesiones" ${activeSection === "sesiones" ? "" : "hidden"}>
          <article class="gd-card">
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mb-3">
              <div>
                <h2 class="gd-card-title mb-1">Sesiones activas ${renderProxBadge()}</h2>
                <p class="gd-muted mb-0">La gestión avanzada de sesiones no está disponible en esta versión.</p>
              </div>
            </div>
            <div class="gd-settings-prox-block">
              <i class="lni lni-tab" aria-hidden="true"></i>
              <p class="mb-1 fw-semibold">Gestión de dispositivos</p>
              <p class="gd-muted mb-0">Próximamente podrás ver y cerrar sesiones en dispositivos remotos desde aquí.</p>
            </div>
          </article>
        </section>

        <!-- PRESUPUESTOS -->
        <section id="config-section-presupuestos" class="gd-settings-panel ${activeSection === "presupuestos" ? "active" : ""}" data-config-section="presupuestos" ${activeSection === "presupuestos" ? "" : "hidden"}>
          <article class="gd-card">
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mb-3">
              <div>
                <h2 class="gd-card-title mb-1">Presupuestos mensuales</h2>
                <p class="gd-muted mb-0">Definí límites por categoría. Recibís alertas en el dashboard al alcanzar el 80%.</p>
              </div>
              ${budgetAlerts.length > 0
                ? `<span class="gd-settings-alert-chip">${budgetAlerts.length} ${budgetAlerts.length === 1 ? "alerta activa" : "alertas activas"}</span>`
                : ""}
            </div>

            ${budgets.length === 0
              ? `<div class="gd-settings-prox-block mb-3">
                   <i class="lni lni-wallet" aria-hidden="true"></i>
                   <p class="mb-1 fw-semibold">Sin presupuestos para este mes</p>
                   <p class="gd-muted mb-0">Agregá un presupuesto para monitorear el gasto por categoría.</p>
                 </div>`
              : `<div class="gd-settings-budget-list mb-3">
                   ${budgets.map((b) => renderBudgetRow(b, spentByCategory[b.categoryName] || 0, notifEnabled)).join("")}
                 </div>`
            }

            <form id="nuevoBudgetForm" class="gd-form-grid gd-settings-budget-form">
              <div>
                <label class="gd-form-label" for="budgetCategoria">Categoría</label>
                <select id="budgetCategoria" class="gd-form-select">
                  <option value="">Seleccionar categoría</option>
                  ${allCategoryOptions.map((c) => `<option value="${escapeHtml(String(c.id ?? c.name))}" data-name="${escapeHtml(c.name)}">${escapeHtml(c.name)}</option>`).join("")}
                </select>
              </div>
              <div>
                <label class="gd-form-label" for="budgetLimite">Límite mensual</label>
                <input id="budgetLimite" type="number" min="1" class="gd-form-input" placeholder="Ej: 30000">
              </div>
              <div class="d-flex align-items-end">
                <button type="submit" class="gd-btn-primary w-100">Agregar presupuesto</button>
              </div>
            </form>
          </article>
        </section>

        <!-- CATEGORÍAS -->
        <section id="config-section-categorias" class="gd-settings-panel ${activeSection === "categorias" ? "active" : ""}" data-config-section="categorias" ${activeSection === "categorias" ? "" : "hidden"}>
          <article class="gd-card">
            <h2 class="gd-card-title mb-1">Categorías personalizadas</h2>
            <p class="gd-muted mb-3">Creá etiquetas para clasificar mejor tus gastos. Las categorías personales se pueden eliminar.</p>

            ${customCategories.length === 0
              ? `<div class="gd-settings-prox-block mb-3">
                   <i class="lni lni-tag" aria-hidden="true"></i>
                   <p class="mb-1 fw-semibold">Sin categorías cargadas</p>
                   <p class="gd-muted mb-0">Las categorías se cargan desde el servidor al iniciar la app.</p>
                 </div>`
              : `<div class="gd-settings-category-list mb-3">
                   ${systemCategories.length > 0
                     ? `<p class="gd-settings-category-section-label">Sistema</p>${systemCategories.map(renderCategoryRow).join("")}`
                     : ""}
                   ${personalCategories.length > 0
                     ? `<p class="gd-settings-category-section-label mt-3">Personales</p>${personalCategories.map(renderCategoryRow).join("")}`
                     : ""}
                 </div>`
            }

            <form id="nuevaCategoriaForm" class="gd-form-grid gd-settings-budget-form">
              <div>
                <label class="gd-form-label" for="nuevaCategoria">Nombre de categoría</label>
                <input id="nuevaCategoria" class="gd-form-input" placeholder="Ej: Mascotas">
              </div>
              <div>
                <label class="gd-form-label" for="nuevoCategoriaEmoji">Emoji <span class="gd-form-optional">(opcional)</span></label>
                <input id="nuevoCategoriaEmoji" class="gd-form-input" placeholder="🐾" maxlength="8">
              </div>
              <div class="d-flex align-items-end">
                <button type="submit" class="gd-btn-primary w-100">Agregar categoría</button>
              </div>
            </form>
          </article>
        </section>

        <!-- ASESORIA -->
        <section id="config-section-asesoria" class="gd-settings-panel ${activeSection === "asesoria" ? "active" : ""}" data-config-section="asesoria" ${activeSection === "asesoria" ? "" : "hidden"}>
          <div class="row g-3 align-items-stretch">
            <div class="col-12 col-xl-6">
              <article class="gd-card h-100">
                <h2 class="gd-card-title mb-1">Agregar asesor</h2>
                <p class="gd-muted mb-3">Generá un código único de verificación para que el asesor lo ingrese y quede vinculado a tu cuenta.</p>

                <form id="agregarAsesorForm">
                  <div class="gd-form-grid">
                    <div>
                      <label class="gd-form-label" for="asesorNombre">Nombre del asesor</label>
                      <input id="asesorNombre" class="gd-form-input" value="${escapeHtml(String(advisorRequest.nombre || ""))}" placeholder="Ej: Laura Gómez" required>
                    </div>
                    <div>
                      <label class="gd-form-label" for="asesorEmail">Email del asesor</label>
                      <input id="asesorEmail" type="email" class="gd-form-input" value="${escapeHtml(String(advisorRequest.email || ""))}" placeholder="asesor@correo.com" required>
                    </div>
                    <div class="gd-form-full">
                      <label class="gd-form-label" for="asesorEspecialidad">Especialidad <span class="gd-form-optional">(opcional)</span></label>
                      <input id="asesorEspecialidad" class="gd-form-input" value="${escapeHtml(String(advisorRequest.especialidad || ""))}" placeholder="Ej: Ahorro, presupuesto, inversiones">
                    </div>
                  </div>
                  <div class="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-2 mt-3">
                    <small class="gd-muted">Al guardar se crea automáticamente el código de verificación.</small>
                    <button type="submit" class="gd-btn-primary">Generar código y vincular</button>
                  </div>
                </form>
              </article>
            </div>

            <div class="col-12 col-xl-6">
              <article class="gd-card h-100">
                <div class="d-flex align-items-start justify-content-between gap-2 mb-3">
                  <div>
                    <h2 class="gd-card-title mb-1">Perfil del asesor</h2>
                    <p class="gd-muted mb-0">${advisorHasProfile ? "Revisá los datos vinculados y compartí el código de verificación." : "Aún no tenés un asesor vinculado."}</p>
                  </div>
                  ${advisorHasProfile
                    ? `<button type="button" class="gd-ahorro-ctrl-btn gd-ahorro-ctrl-btn--danger" data-action="desvincular-asesor" aria-label="Desvincular asesor">
                         <i class="lni lni-close" aria-hidden="true"></i>
                       </button>`
                    : ""}
                </div>

                ${advisorHasProfile
                  ? `<div class="gd-settings-advisor-profile">
                       <div class="gd-settings-advisor-avatar">${escapeHtml(advisorInitials)}</div>
                       <div class="gd-settings-advisor-copy">
                         <p class="gd-settings-session-title mb-1">${escapeHtml(advisorName)}</p>
                         <p class="gd-settings-session-sub mb-1">${escapeHtml(advisorEmail)}</p>
                         <p class="gd-settings-session-sub mb-0">${escapeHtml(advisorSpecialty || "Sin especialidad definida")}</p>
                       </div>
                     </div>
                     <div class="gd-settings-advisor-code-box mt-3">
                       <span class="gd-muted d-block mb-1">Código de verificación</span>
                       <strong class="gd-settings-advisor-code">${escapeHtml(advisorCode || "Pendiente de generar")}</strong>
                       <p class="gd-muted mb-0 mt-2">El asesor debe ingresar este código para completar la vinculación.</p>
                     </div>
                     <div class="gd-settings-advisor-meta mt-3">
                       <span class="gd-settings-category-pill">Vinculado</span>
                       <span class="gd-settings-advisor-meta-text">Vínculo activo en la sección de Asesoría.</span>
                     </div>`
                  : `<div class="gd-settings-advisor-empty">
                       <i class="lni lni-user fs-1"></i>
                       <p class="mb-1 fw-semibold">Sin asesor vinculado</p>
                       <p class="gd-muted mb-0">Completá el formulario para generar el código y activar el perfil del asesor.</p>
                     </div>`
                }
              </article>
            </div>
          </div>
        </section>

        <!-- NOTIFICACIONES -->
        <section id="config-section-notificaciones" class="gd-settings-panel ${activeSection === "notificaciones" ? "active" : ""}" data-config-section="notificaciones" ${activeSection === "notificaciones" ? "" : "hidden"}>
          <article class="gd-card">
            <h2 class="gd-card-title mb-1">Alertas de gastos</h2>
            <p class="gd-muted mb-3">Controlá cuándo y cómo querés recibir avisos en el dashboard.</p>

            <label class="gd-settings-toggle-row">
              <div>
                <p class="gd-card-title gd-card-title-xs mb-0">Gasto inusual detectado</p>
                <small class="gd-muted">Cuando un gasto supere tu patrón habitual histórico.</small>
              </div>
              <input class="form-check-input mt-0" type="checkbox" id="resumenSemanal" ${state.notificaciones?.resumenSemanal !== false ? "checked" : ""}>
            </label>

            <label class="gd-settings-toggle-row">
              <div>
                <p class="gd-card-title gd-card-title-xs mb-0">Presupuesto al 80%</p>
                <small class="gd-muted">Aviso al acercarte al límite mensual de presupuesto.</small>
              </div>
              <input class="form-check-input mt-0" type="checkbox" id="alertaPresupuesto" ${state.notificaciones?.alertaPresupuesto !== false ? "checked" : ""}>
            </label>

            <label class="gd-settings-toggle-row">
              <div>
                <p class="gd-card-title gd-card-title-xs mb-0">Recomendaciones del asesor</p>
                <small class="gd-muted">Notifica cada nuevo análisis publicado.</small>
              </div>
              <input class="form-check-input mt-0" type="checkbox" id="recomendacionesIA" ${state.notificaciones?.recomendacionesIA !== false ? "checked" : ""}>
            </label>

            <label class="gd-settings-toggle-row">
              <div>
                <p class="gd-card-title gd-card-title-xs mb-0">Movimientos grandes</p>
                <small class="gd-muted">Cuando se registre un gasto mayor al habitual del mes.</small>
              </div>
              <input class="form-check-input mt-0" type="checkbox" id="movimientosGrandes" ${state.notificaciones?.movimientosGrandes !== false ? "checked" : ""}>
            </label>

            <div class="d-flex justify-content-end mt-3">
              <button type="button" class="gd-btn-primary" id="guardarPreferenciasNotifBtn">Guardar preferencias</button>
            </div>
          </article>
        </section>

        <!-- APARIENCIA -->
        <section id="config-section-apariencia" class="gd-settings-panel ${activeSection === "apariencia" ? "active" : ""}" data-config-section="apariencia" ${activeSection === "apariencia" ? "" : "hidden"}>
          <article class="gd-card">
            <h2 class="gd-card-title mb-1">Apariencia y accesibilidad</h2>
            <p class="gd-muted mb-3">Controlá idioma, tema y densidad visual del dashboard.</p>

            <div class="gd-form-grid">
              <div>
                <label class="gd-form-label" for="idioma">Idioma</label>
                <select id="idioma" name="idioma" class="gd-form-select">
                  <option value="es" ${config.idioma === "es" ? "selected" : ""}>Español</option>
                  <option value="en" ${config.idioma === "en" ? "selected" : ""}>English</option>
                  <option value="pt" ${config.idioma === "pt" ? "selected" : ""}>Português</option>
                </select>
              </div>
              <div>
                <label class="gd-form-label" for="temaModo">Tema</label>
                <select id="temaModo" name="temaModo" class="gd-form-select">
                  <option value="system" ${config.tema === "system" ? "selected" : ""}>Sistema</option>
                  <option value="light" ${config.tema === "light" ? "selected" : ""}>Claro</option>
                  <option value="dark" ${config.tema === "dark" ? "selected" : ""}>Oscuro</option>
                </select>
              </div>
              <div>
                <label class="gd-form-label" for="tamanioFuente">Tamaño de fuente</label>
                <select id="tamanioFuente" name="tamanioFuente" class="gd-form-select">
                  <option value="sm" ${config.tamanioFuente === "sm" ? "selected" : ""}>Pequeño</option>
                  <option value="md" ${config.tamanioFuente === "md" ? "selected" : ""}>Normal</option>
                  <option value="lg" ${config.tamanioFuente === "lg" ? "selected" : ""}>Grande</option>
                </select>
              </div>
              <div>
                <label class="gd-form-label" for="densidad">Densidad</label>
                <select id="densidad" name="densidad" class="gd-form-select">
                  <option value="comfortable" ${config.densidad === "comfortable" ? "selected" : ""}>Cómoda</option>
                  <option value="compact" ${config.densidad === "compact" ? "selected" : ""}>Compacta</option>
                </select>
              </div>

              <label class="gd-form-full gd-setting-row" for="mostrarCentavos">
                <div>
                  <p class="gd-card-title gd-card-title-xs mb-0">Mostrar centavos</p>
                  <small class="gd-muted">Visualizá montos con dos decimales en tablas y métricas.</small>
                </div>
                <input class="form-check-input mt-0" type="checkbox" id="mostrarCentavos" ${config.mostrarCentavos ? "checked" : ""}>
              </label>

              <label class="gd-form-full gd-setting-row" for="reducirAnimaciones">
                <div>
                  <p class="gd-card-title gd-card-title-xs mb-0">Reducir animaciones</p>
                  <small class="gd-muted">Desactivá transiciones para una experiencia más estable.</small>
                </div>
                <input class="form-check-input mt-0" type="checkbox" id="reducirAnimaciones" ${config.reducirAnimaciones ? "checked" : ""}>
              </label>

              <div class="gd-form-full gd-settings-preview">
                <p class="gd-card-title gd-card-title-xs mb-2">Vista previa</p>
                <div class="gd-settings-preview-list">
                  <div class="gd-settings-preview-item"><span>Tema</span><strong>${escapeHtml(themeLabel)}</strong></div>
                  <div class="gd-settings-preview-item"><span>Fuente</span><strong>${escapeHtml(fontSizeLabel)}</strong></div>
                  <div class="gd-settings-preview-item"><span>Densidad</span><strong>${escapeHtml(densityLabel)}</strong></div>
                </div>
              </div>
            </div>

            <div class="d-flex justify-content-end mt-3">
              <button type="button" class="gd-btn-primary" id="guardarConfiguracionBtn">Guardar configuración</button>
            </div>
          </article>
        </section>

        <!-- MIS DATOS -->
        <section id="config-section-datos" class="gd-settings-panel ${activeSection === "datos" ? "active" : ""}" data-config-section="datos" ${activeSection === "datos" ? "" : "hidden"}>
          <article class="gd-card">
            <h2 class="gd-card-title mb-1">Exportar mis datos</h2>
            <p class="gd-muted mb-3">Descargá información financiera y reportes de tu cuenta.</p>

            <div class="gd-settings-export-list">
              <div class="gd-settings-export-row">
                <div>
                  <p class="gd-settings-session-title">Historial de movimientos</p>
                  <p class="gd-settings-session-sub">Incluye monto, fecha, categoría, tipo y descripción. (${ticketCount} registros)</p>
                </div>
                <div class="d-flex gap-2">
                  <button type="button" class="gd-btn-secondary" data-action="export-gastos-csv">CSV</button>
                  <button type="button" class="gd-btn-secondary" disabled title="Próximamente" style="opacity:0.5;">Excel</button>
                </div>
              </div>

              <div class="gd-settings-export-row">
                <div>
                  <p class="gd-settings-session-title">Reportes mensuales ${renderProxBadge()}</p>
                  <p class="gd-settings-session-sub">Resumen de los últimos seis meses en PDF.</p>
                </div>
                <button type="button" class="gd-btn-secondary" disabled style="opacity:0.5;">PDF</button>
              </div>
            </div>
          </article>
        </section>

        <!-- PLAN -->
        <section id="config-section-plan" class="gd-settings-panel ${activeSection === "plan" ? "active" : ""}" data-config-section="plan" ${activeSection === "plan" ? "" : "hidden"}>
          <article class="gd-card">
            <h2 class="gd-card-title mb-1">Plan actual</h2>
            <p class="gd-muted mb-3">Gestioná tu suscripción y revisá el consumo del período.</p>

            <div class="gd-settings-plan-card current">
              <div>
                <p class="gd-settings-session-title">Plan gratuito</p>
                <p class="gd-settings-session-sub">Hasta ${ticketLimit} movimientos por mes y reportes básicos.</p>
              </div>
              <span class="gd-settings-category-pill">Actual</span>
            </div>

            <div class="gd-settings-plan-card">
              <div>
                <p class="gd-settings-session-title">Plan Pro ${renderProxBadge()}</p>
                <p class="gd-settings-session-sub">Movimientos ilimitados, análisis IA avanzado y panel asesor ampliado.</p>
              </div>
              <button type="button" class="gd-btn-primary" disabled style="opacity:0.5;">Próximamente</button>
            </div>

            <div class="gd-settings-usage-list mt-3">
              <div class="gd-settings-budget-row">
                <span class="gd-settings-budget-cat">Movimientos subidos</span>
                <div class="gd-settings-budget-bar">
                  <span class="gd-settings-budget-fill${ticketPct >= 100 ? " gd-settings-budget-fill--danger" : ticketPct >= 80 ? " gd-settings-budget-fill--warn" : ""}"
                    style="--gd-budget-fill: ${ticketPct}%;"></span>
                </div>
                <span class="gd-settings-budget-pct ${ticketPct >= 80 ? "text-warning" : ""}">${ticketCount} / ${ticketLimit}</span>
              </div>
            </div>
          </article>
        </section>

        <!-- ZONA PELIGROSA -->
        <section id="config-section-danger" class="gd-settings-panel ${activeSection === "danger" ? "active" : ""}" data-config-section="danger" ${activeSection === "danger" ? "" : "hidden"}>
          <article class="gd-card gd-settings-danger-card">
            <h2 class="gd-card-title mb-1">Zona peligrosa</h2>
            <p class="gd-muted mb-3">Estas acciones son irreversibles. Procedé con precaución.</p>

            <div class="gd-settings-danger-row">
              <div>
                <p class="gd-settings-session-title">Borrar historial de movimientos</p>
                <p class="gd-settings-session-sub">Elimina todos los registros de tu cuenta en el servidor. No se puede deshacer.</p>
              </div>
              <button type="button" class="gd-btn-danger" data-action="borrar-historial">Borrar historial</button>
            </div>

            <div class="gd-settings-danger-row">
              <div>
                <p class="gd-settings-session-title">Eliminar cuenta</p>
                <p class="gd-settings-session-sub">Borra permanentemente tu cuenta y todos tus datos del servidor.</p>
              </div>
              <button type="button" class="gd-btn-danger" data-action="eliminar-cuenta">Eliminar cuenta</button>
            </div>
          </article>
        </section>

      </div>
    </section>
  `;

  return renderDashboardAppLayout({
    activePath: "/perfil/configuracion",
    pageTitle: "Configuración",
    pageSubtitle: "Administrá tu perfil, finanzas y preferencias",
    content,
    profileImage,
    profileName,
  });
}

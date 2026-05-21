import { renderDashboardAppLayout } from "../components/dashboard/dashboardAppLayout";
import { escapeHtml } from "../utils/sanitize";
import { formatMoney } from "../utils/money";
import { getFinancialScore, getBudgetAlertsForPeriod, getFinanzasCurrentPeriod } from "../data/finanzas";
import { parseMonthKey, formatMonthLabelLong, compareMonthKeys } from "../utils/date";
import { t } from "../i18n";

const SETTINGS_NAV_GROUPS = [
  {
    labelKey: "config.nav.account",
    items: [
      { id: "perfil", labelKey: "config.nav.profile", icon: "lni lni-user" },
      { id: "seguridad", labelKey: "config.nav.security", icon: "lni lni-lock-alt" },
      { id: "sesiones", labelKey: "config.nav.sessions", icon: "lni lni-tab" },
    ],
  },
  {
    labelKey: "config.nav.finances",
    items: [
      { id: "presupuestos", labelKey: "config.nav.budgets", icon: "lni lni-wallet" },
      { id: "categorias", labelKey: "config.nav.categories", icon: "lni lni-tag" },
    ],
  },
  {
    labelKey: "config.nav.advisory",
    items: [
      { id: "asesoria", labelKey: "config.nav.advisor", icon: "lni lni-user" },
    ],
  },
  {
    labelKey: "config.nav.preferences",
    items: [
      { id: "notificaciones", labelKey: "config.nav.notifications", icon: "lni lni-alarm" },
      { id: "apariencia", labelKey: "config.nav.appearance", icon: "lni lni-night" },
      { id: "datos", labelKey: "config.nav.myData", icon: "lni lni-database" },
    ],
  },
  {
    labelKey: "config.nav.plan",
    items: [
      { id: "plan", labelKey: "config.nav.currentPlan", icon: "lni lni-rocket" },
      { id: "danger", labelKey: "config.nav.dangerZone", icon: "lni lni-warning" },
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
  if (score >= 80) return t('config.scoreExcellent');
  if (score >= 60) return t('config.scoreGood');
  if (score >= 40) return t('config.scoreFair');
  return t('config.scoreLow');
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
          <span>${t(item.labelKey)}</span>
          ${badge}
        </button>
      `;
    }).join("");

    return `
      <div class="gd-settings-nav-group">
        <p class="gd-settings-nav-label">${t(group.labelKey)}</p>
        ${items}
      </div>
    `;
  }).join("");
}

function renderProxBadge() {
  return `<span class="gd-settings-prox-badge">${t('config.comingSoon')}</span>`;
}

function renderScoreRing(score) {
  const tier = scoreTier(score);
  const label = scoreLabel(score);
  const circumference = 2 * Math.PI * 28;
  const dashOffset = circumference - (score / 100) * circumference;

  return `
    <div class="gd-score-ring-wrap">
      <svg class="gd-score-ring gd-score-ring--${escapeHtml(tier)}" viewBox="0 0 64 64" aria-label="${t('config.scoreFinancialAria', { score })}">
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

function renderBudgetMonthPicker(viewPeriod, currentPeriod) {
  const isAtMax = compareMonthKeys(viewPeriod, currentPeriod) >= 0;
  return `
    <div class="gd-settings-budget-monthpicker">
      <button type="button" class="gd-ahorro-ctrl-btn" data-action="budget-prev-month" aria-label="${t('config.prevMonth')}">
        <i class="lni lni-chevron-left" aria-hidden="true"></i>
      </button>
      <span class="gd-settings-budget-monthpicker-label">${escapeHtml(formatMonthLabelLong(viewPeriod))}</span>
      <button type="button" class="gd-ahorro-ctrl-btn" data-action="budget-next-month"
        ${isAtMax ? "disabled" : ""} aria-label="${t('config.nextMonth')}">
        <i class="lni lni-chevron-right" aria-hidden="true"></i>
      </button>
    </div>
  `;
}

function renderBudgetSummary(budgets, spentByCategory) {
  if (budgets.length === 0) return "";
  const totalLimit = budgets.reduce((s, b) => s + Number(b.amountLimit || 0), 0);
  const totalSpent = budgets.reduce((s, b) => s + Number(spentByCategory[b.categoryName] || 0), 0);
  const pct = totalLimit > 0 ? Math.min(Math.round((totalSpent / totalLimit) * 100), 100) : 0;
  const rawPct = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;
  const exceeded = rawPct > 100;
  const nearLimit = rawPct >= 80;
  const n = budgets.length;

  return `
    <div class="gd-settings-budget-summary mb-3">
      <span class="gd-settings-budget-summary-stat"><strong>${n}</strong> ${n === 1 ? t('config.activeBudget') : t('config.activeBudgets')}</span>
      <span class="gd-settings-budget-summary-stat">${t('config.budgeted')}: <strong>${formatMoney(totalLimit)}</strong></span>
      <span class="gd-settings-budget-summary-stat">${t('config.spent')}: <strong>${formatMoney(totalSpent)}</strong></span>
      <div class="gd-settings-budget-summary-bar">
        <span class="gd-settings-budget-fill ${exceeded ? "gd-settings-budget-fill--danger" : nearLimit ? "gd-settings-budget-fill--warn" : ""}"
          style="--gd-budget-fill: ${pct}%;"></span>
      </div>
    </div>
  `;
}

function renderBudgetRow(budget, spentAmount, notifEnabled, isEditing, isReadOnly) {
  const spent = Number(spentAmount || 0);
  const limit = Number(budget.amountLimit || 0);
  const pct = limit > 0 ? Math.min(Math.round((spent / limit) * 100), 100) : 0;
  const rawPct = limit > 0 ? Math.round((spent / limit) * 100) : 0;
  const exceeded = rawPct > 100;
  const nearLimit = rawPct >= 80;
  const alertClass = exceeded ? "danger" : nearLimit ? "warning" : "";

  if (isEditing) {
    return `
      <div class="gd-settings-budget-row ${alertClass ? `gd-settings-budget-row--${alertClass}` : ""}">
        <span class="gd-settings-budget-cat">${escapeHtml(budget.categoryName)}</span>
        <div class="gd-settings-budget-bar">
          <span class="gd-settings-budget-fill ${exceeded ? "gd-settings-budget-fill--danger" : nearLimit ? "gd-settings-budget-fill--warn" : ""}"
            style="--gd-budget-fill: ${pct}%;"></span>
        </div>
        <div class="gd-settings-budget-inline-edit">
          <input type="number" class="gd-settings-budget-input gd-form-input"
            id="editBudgetInput-${escapeHtml(budget.id)}" value="${limit}" min="1">
        </div>
        <div class="gd-settings-budget-actions">
          <button type="button" class="gd-ahorro-ctrl-btn gd-ahorro-ctrl-btn--edit"
            data-action="save-budget-edit" data-budget-id="${escapeHtml(budget.id)}" aria-label="${t('config.saveChanges')}">
            <i class="lni lni-checkmark" aria-hidden="true"></i>
          </button>
          <button type="button" class="gd-ahorro-ctrl-btn"
            data-action="cancel-budget-edit" aria-label="${t('config.cancelEdit')}">
            <i class="lni lni-close" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    `;
  }

  return `
    <div class="gd-settings-budget-row ${alertClass ? `gd-settings-budget-row--${alertClass}` : ""}">
      <span class="gd-settings-budget-cat">${escapeHtml(budget.categoryName)}</span>
      <div class="gd-settings-budget-bar">
        <span class="gd-settings-budget-fill ${exceeded ? "gd-settings-budget-fill--danger" : nearLimit ? "gd-settings-budget-fill--warn" : ""}"
          style="--gd-budget-fill: ${pct}%;"></span>
      </div>
      <div class="gd-settings-budget-pct-wrap">
        <span class="gd-settings-budget-pct ${exceeded ? "text-danger" : nearLimit && notifEnabled ? "text-warning" : ""}">${rawPct}%</span>
        <span class="gd-settings-budget-spent">${formatMoney(spent)} / ${formatMoney(limit)}</span>
      </div>
      ${!isReadOnly ? `
      <div class="gd-settings-budget-actions">
        <button type="button" class="gd-ahorro-ctrl-btn gd-ahorro-ctrl-btn--edit"
          data-action="edit-budget" data-budget-id="${escapeHtml(budget.id)}" aria-label="${t('config.editBudget')}">
          <i class="lni lni-pencil-alt" aria-hidden="true"></i>
        </button>
        <button type="button" class="gd-ahorro-ctrl-btn gd-ahorro-ctrl-btn--danger"
          data-action="delete-budget" data-budget-id="${escapeHtml(budget.id)}" aria-label="${t('config.deleteBudget')}">
          <i class="lni lni-close" aria-hidden="true"></i>
        </button>
      </div>` : ""}
    </div>
  `;
}

function renderCategoryRow(cat) {
  const label = cat.icon ? `${cat.icon} ${cat.name}` : cat.name;
  const kindLabel = cat.isDefault ? t('config.system') : t('config.personal');
  const canDelete = !cat.isDefault;

  return `
    <div class="gd-settings-category-row">
      <span class="gd-settings-budget-cat">${escapeHtml(label)}</span>
      <span class="gd-settings-category-pill ${cat.isDefault ? "" : "gd-settings-category-pill--personal"}">${escapeHtml(kindLabel)}</span>
      ${canDelete
        ? `<button type="button" class="gd-ahorro-ctrl-btn gd-ahorro-ctrl-btn--danger" data-action="delete-category" data-category-id="${escapeHtml(String(cat.id))}" aria-label="${t('config.deleteCategory')}">
             <i class="lni lni-close" aria-hidden="true"></i>
           </button>`
        : `<span></span>`}
    </div>
  `;
}

export function renderConfiguracionCuentaPage({ state, profileImage, profileName, isAsesor = false }) {
  const config = state.configuracion;
  const recomendacionesPendientes = state.finanzas?.recomendaciones?.length || 0;
  const activeSection = resolveActiveSettingsSection();
  const safeName = String(profileName || t('config.defaultUser')).trim() || t('config.defaultUser');
  const nameParts = safeName.split(/\s+/).filter(Boolean);
  const firstName = nameParts[0] || t('config.defaultUser');
  const lastName = nameParts.slice(1).join(" ");
  const profileEmail = String(state.perfil?.email || "");
  const roleValue = String(state.currentUser?.role || state.currentUser?.rol || "").toLowerCase();
  const roleLabel = roleValue === "asesor" ? "asesor" : "usuario";
  const initials = nameParts.length > 1
    ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
    : firstName.slice(0, 2).toUpperCase();

  // Score financiero
  const score = getFinancialScore();
  const tier = scoreTier(score);
  const scoreDescriptions = {
    excellent: t('config.scoreDescExcellent'),
    good: t('config.scoreDescGood'),
    fair: t('config.scoreDescFair'),
    low: t('config.scoreDescLow'),
  };
  const scoreDesc = scoreDescriptions[tier];

  // Presupuestos con gasto real
  const currentPeriod = getFinanzasCurrentPeriod();
  const viewPeriod = state.finanzas.ui.budgetViewPeriod || currentPeriod;
  const [vpYear, vpMonth] = viewPeriod ? viewPeriod.split("-").map(Number) : [0, 0];
  const budgets = (state.finanzas.budgets || []).filter((b) => b.month === vpMonth && b.year === vpYear);
  const budgetAlerts = getBudgetAlertsForPeriod();
  const notifEnabled = state.notificaciones?.alertaPresupuesto !== false;

  const spentByCategory = {};
  (state.finanzas.gastos || [])
    .filter((e) => {
      const [y, m] = (e.fecha || "").slice(0, 7).split("-").map(Number);
      return e.tipo === "egreso" && y === vpYear && m === vpMonth;
    })
    .forEach((e) => {
      spentByCategory[e.categoria] = (spentByCategory[e.categoria] || 0) + Number(e.monto || 0);
    });

  const isCurrentOrFuture = !currentPeriod || compareMonthKeys(viewPeriod || currentPeriod, currentPeriod) >= 0;

  // Mes anterior para botón "copiar"
  const { year: vpY, month: vpM } = parseMonthKey(viewPeriod);
  const prevM = vpM === 1 ? 12 : vpM - 1;
  const prevY = vpM === 1 ? vpY - 1 : vpY;
  const prevPeriodKey = `${prevY}-${String(prevM).padStart(2, "0")}`;
  const prevBudgets = (state.finanzas.budgets || []).filter((b) => b.month === prevM && b.year === prevY);
  const showCopyBtn = isCurrentOrFuture && budgets.length === 0 && prevBudgets.length > 0;

  // Categorías
  const customCategories = state.finanzas.customCategories || [];
  const systemCategories = customCategories.filter((c) => c.isDefault);
  const personalCategories = customCategories.filter((c) => !c.isDefault);

  // Apariencia
  const idiomaLabel = { es: t('config.langEs'), en: t('config.langEn') }[config.idioma] || t('config.langEs');
  const themeLabel = { light: t('config.themeLight'), dark: t('config.themeDark'), system: t('config.themeSystem') }[config.tema] || t('config.themeSystem');
  const fontSizeLabel = { sm: t('config.fontSm'), md: t('config.fontMd'), lg: t('config.fontLg') }[config.tamanioFuente] || t('config.fontMd');
  const densityLabel = { comfortable: t('config.densityComfortable'), compact: t('config.densityCompact') }[config.densidad] || t('config.densityComfortable');

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
  const ingresoNum = parseFloat(ingresoEstimado) || 0;
  const objetivoNum = parseFloat(objetivoAhorro) || 0;
  const impliedRate = ingresoNum > 0 && objetivoNum > 0 ? Math.round((objetivoNum / ingresoNum) * 100) : null;

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
      <aside class="gd-settings-nav" aria-label="${t('config.subsectionsAria')}">
        ${renderSettingsNav(activeSection, recomendacionesPendientes)}
      </aside>

      <div class="gd-settings-content">

        <!-- PERFIL -->
        <section id="config-section-perfil" class="gd-settings-panel ${activeSection === "perfil" ? "active" : ""}" data-config-section="perfil" ${activeSection === "perfil" ? "" : "hidden"}>

          <article class="gd-card">
            <div class="gd-settings-profile-head">
              <div class="gd-settings-avatar-wrap">
                <label for="configProfileImageInput" class="gd-settings-avatar-image-trigger" aria-label="${t('config.changePhoto')}">
                  <img src="${escapeHtml(profileImage || "/assets/img/user-avatar-default.svg")}" alt="${t('config.avatarAlt')}" class="gd-settings-avatar-image" data-image-error-mode="toggle-next">
                  <span class="gd-settings-avatar-fallback d-none" aria-hidden="true">${escapeHtml(initials)}</span>
                </label>
              </div>
              <div class="gd-settings-profile-copy">
                <p class="gd-card-title">${t('config.myProfile')}</p>
                <p class="gd-settings-profile-name">${escapeHtml(safeName)}</p>
                <p class="gd-muted mb-0">${escapeHtml(profileEmail)}</p>
              </div>
              <div class="gd-settings-profile-right">
                ${renderScoreRing(score)}
                <div class="gd-settings-avatar-actions">
                  <label for="configProfileImageInput" class="gd-action-btn">${t('config.changePhotoBtn')}</label>
                  <input id="configProfileImageInput" type="file" class="d-none" accept="image/*">
                </div>
              </div>
            </div>

            <div class="gd-settings-score-desc">
              <p class="gd-muted mb-0"><strong>${t('config.scoreSummary', { score, label: scoreLabel(score) })}</strong> — ${escapeHtml(scoreDesc)}</p>
              <p class="gd-muted mb-0 mt-1" style="font-size: 0.78rem;">${t('config.scoreCalc')}</p>
            </div>

            <div class="gd-form-grid mt-3">
              <div>
                <label class="gd-form-label" for="configNombre">${t('config.firstName')}</label>
                <input id="configNombre" class="gd-form-input" value="${escapeHtml(firstName)}">
              </div>
              <div>
                <label class="gd-form-label" for="configApellido">${t('config.lastName')}</label>
                <input id="configApellido" class="gd-form-input" value="${escapeHtml(lastName)}">
              </div>
              <div class="gd-form-full">
                <label class="gd-form-label" for="configEmail">${t('config.email')}</label>
                <input id="configEmail" class="gd-form-input" value="${escapeHtml(profileEmail)}">
              </div>
              <div>
                <label class="gd-form-label" for="configMoneda">${t('config.currency')}</label>
                <select id="moneda" name="moneda" class="gd-form-select">
                  <option value="ARS" ${config.moneda === "ARS" ? "selected" : ""}>${t('config.currencyArs')}</option>
                  <option value="USD" disabled>${t('config.currencyUsd')}</option>
                  <option value="EUR" disabled>${t('config.currencyEur')}</option>
                </select>
              </div>
              <div>
                <label class="gd-form-label" for="configTelefono">
                  ${t('config.phone')} ${renderProxBadge()}
                </label>
                <input id="configTelefono" class="gd-form-input" placeholder="${t('config.phonePlaceholder')}" disabled style="opacity:0.5;cursor:not-allowed;">
              </div>
            </div>

            <div class="d-flex justify-content-end gap-2 mt-3">
              <button type="button" class="gd-btn-secondary">${t('config.cancel')}</button>
              <button type="button" class="gd-btn-primary" id="guardarPerfilConfigBtn">${t('config.saveChanges')}</button>
            </div>
          </article>

          <article class="gd-card">
            <h2 class="gd-card-title mb-1">${t('config.financialProfile')}</h2>
            <p class="gd-muted mb-3">${t('config.financialProfileSub')}</p>
            <div class="gd-form-grid">
              <div>
                <label class="gd-form-label" for="configIngreso">${t('config.estimatedIncome')}</label>
                <input id="configIngreso" type="number" min="0" class="gd-form-input" value="${escapeHtml(ingresoEstimado)}" placeholder="${t('config.placeholderIncome')}">
              </div>
              <div>
                <label class="gd-form-label" for="configAhorro">${t('config.savingGoal')}</label>
                <input id="configAhorro" type="number" min="0" class="gd-form-input" value="${escapeHtml(objetivoAhorro)}" placeholder="${t('config.placeholderSavingGoal')}">
              </div>
              <div class="gd-form-full">
                <label class="gd-form-label" for="configPerfilGasto">${t('config.aiSpendProfile')}</label>
                <input id="configPerfilGasto" class="gd-form-input" value="${t('config.aiSpendProfileValue')}" disabled style="opacity:0.6;">
              </div>
            </div>
            <div class="d-flex justify-content-end mt-3">
              <button type="button" class="gd-btn-primary" id="guardarPerfilFinancieroBtn">${t('config.saveFinancialProfile')}</button>
            </div>
          </article>
        </section>

        <!-- SEGURIDAD -->
        <section id="config-section-seguridad" class="gd-settings-panel ${activeSection === "seguridad" ? "active" : ""}" data-config-section="seguridad" ${activeSection === "seguridad" ? "" : "hidden"}>
          <article class="gd-card">
            <h2 class="gd-card-title mb-1">${t('config.passwordAccess')}</h2>
            <p class="gd-muted mb-3">${t('config.passwordAccessSub')}</p>

            <div class="gd-form-grid">
              <div class="gd-form-full">
                <label class="gd-form-label" for="passwordActual">${t('config.currentPassword')}</label>
                <input id="passwordActual" type="password" class="gd-form-input" placeholder="••••••••">
              </div>
              <div>
                <label class="gd-form-label" for="passwordNueva">${t('config.newPassword')}</label>
                <input id="passwordNueva" type="password" class="gd-form-input" placeholder="••••••••">
              </div>
              <div>
                <label class="gd-form-label" for="passwordConfirmar">${t('config.confirmPassword')}</label>
                <input id="passwordConfirmar" type="password" class="gd-form-input" placeholder="••••••••">
              </div>
            </div>

            <div class="gd-settings-toggle-row mt-3" style="opacity:0.55;" title="${t('config.twoFactorUnavailable')}">
              <div>
                <p class="gd-card-title gd-card-title-xs mb-0">
                  ${t('config.twoFactor')} ${renderProxBadge()}
                </p>
                <small class="gd-muted">${t('config.twoFactorSub')}</small>
              </div>
              <input class="form-check-input mt-0" type="checkbox" id="autenticacionDos" disabled>
            </div>

            <div class="d-flex justify-content-end gap-2 mt-3">
              <button type="button" class="gd-btn-secondary">${t('config.cancel')}</button>
              <button type="button" class="gd-btn-primary" id="guardarSeguridadBtn">${t('config.updateSecurity')}</button>
            </div>
          </article>

          <article class="gd-card">
            <h2 class="gd-card-title mb-1">${t('config.bestPractices')}</h2>
            <ul class="gd-policy-list mb-0">
              <li>${t('config.practice1')}</li>
              <li>${t('config.practice2')}</li>
              <li>${t('config.practice3')}</li>
              <li>${t('config.practice4')}</li>
              <li>${t('config.practice5')}</li>
            </ul>
          </article>
        </section>

        <!-- SESIONES -->
        <section id="config-section-sesiones" class="gd-settings-panel ${activeSection === "sesiones" ? "active" : ""}" data-config-section="sesiones" ${activeSection === "sesiones" ? "" : "hidden"}>
          <article class="gd-card">
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mb-3">
              <div>
                <h2 class="gd-card-title mb-1">${t('config.activeSessions')} ${renderProxBadge()}</h2>
                <p class="gd-muted mb-0">${t('config.sessionsSub')}</p>
              </div>
            </div>
            <div class="gd-settings-prox-block">
              <i class="lni lni-tab" aria-hidden="true"></i>
              <p class="mb-1 fw-semibold">${t('config.deviceManagement')}</p>
              <p class="gd-muted mb-0">${t('config.deviceManagementSub')}</p>
            </div>
          </article>
        </section>

        <!-- PRESUPUESTOS -->
        <section id="config-section-presupuestos" class="gd-settings-panel ${activeSection === "presupuestos" ? "active" : ""}" data-config-section="presupuestos" ${activeSection === "presupuestos" ? "" : "hidden"}>
          <article class="gd-card">
            ${renderBudgetMonthPicker(viewPeriod, currentPeriod)}

            <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mb-3">
              <div>
                <h2 class="gd-card-title mb-1">${t('config.monthlyBudgets')}</h2>
                <p class="gd-muted mb-0">${t('config.monthlyBudgetsSub')}</p>
              </div>
              ${budgetAlerts.length > 0
                ? `<span class="gd-settings-alert-chip">${budgetAlerts.length} ${budgetAlerts.length === 1 ? t('config.activeAlert') : t('config.activeAlerts')}</span>`
                : ""}
            </div>

            ${renderBudgetSummary(budgets, spentByCategory)}

            ${budgets.length === 0
              ? `<div class="gd-settings-prox-block mb-3">
                   <i class="lni lni-wallet" aria-hidden="true"></i>
                   <p class="mb-1 fw-semibold">${isCurrentOrFuture ? t('config.noBudgetsMonth') : t('config.noBudgetsPeriod')}</p>
                   <p class="gd-muted mb-0">${isCurrentOrFuture ? t('config.noBudgetsMonthSub') : t('config.noBudgetsPeriodSub')}</p>
                 </div>`
              : `<div class="gd-settings-budget-list mb-3">
                   ${budgets.map((b) => renderBudgetRow(b, spentByCategory[b.categoryName] || 0, notifEnabled, b.id === state.finanzas.ui.editingBudgetId, !isCurrentOrFuture)).join("")}
                 </div>`
            }

            ${showCopyBtn
              ? `<div class="mb-3">
                   <button type="button" class="gd-btn-secondary w-100"
                     data-action="copy-budgets-from-prev"
                     data-prev-period="${escapeHtml(prevPeriodKey)}">
                     <i class="lni lni-copy" aria-hidden="true"></i>
                     ${t('config.copyBudgets', { month: formatMonthLabelLong(prevPeriodKey) })}
                   </button>
                 </div>`
              : ""}

            ${isCurrentOrFuture
              ? `<form id="nuevoBudgetForm" class="gd-form-grid gd-settings-budget-form">
                   <div>
                     <label class="gd-form-label" for="budgetCategoria">${t('config.category')}</label>
                     <select id="budgetCategoria" class="gd-form-select">
                       <option value="">${t('config.selectCategory')}</option>
                       ${allCategoryOptions.map((c) => `<option value="${escapeHtml(String(c.id ?? c.name))}" data-name="${escapeHtml(c.name)}">${escapeHtml(c.name)}</option>`).join("")}
                     </select>
                   </div>
                   <div>
                     <label class="gd-form-label" for="budgetLimite">${t('config.monthlyLimit')}</label>
                     <input id="budgetLimite" type="number" min="1" class="gd-form-input" placeholder="${t('config.placeholderLimit')}">
                   </div>
                   <div class="d-flex align-items-end">
                     <button type="submit" class="gd-btn-primary w-100">${t('config.addBudget')}</button>
                   </div>
                 </form>`
              : `<p class="gd-muted small text-center mt-2">${t('config.readOnlyHint')}</p>`
            }
          </article>
        </section>

        <!-- CATEGORÍAS -->
        <section id="config-section-categorias" class="gd-settings-panel ${activeSection === "categorias" ? "active" : ""}" data-config-section="categorias" ${activeSection === "categorias" ? "" : "hidden"}>
          <article class="gd-card">
            <h2 class="gd-card-title mb-1">${t('config.customCategories')}</h2>
            <p class="gd-muted mb-3">${t('config.customCategoriesSub')}</p>

            ${customCategories.length === 0
              ? `<div class="gd-settings-prox-block mb-3">
                   <i class="lni lni-tag" aria-hidden="true"></i>
                   <p class="mb-1 fw-semibold">${t('config.noCategoriesLoaded')}</p>
                   <p class="gd-muted mb-0">${t('config.noCategoriesLoadedSub')}</p>
                 </div>`
              : `<div class="gd-settings-category-list mb-3">
                   ${systemCategories.length > 0
                     ? `<p class="gd-settings-category-section-label">${t('config.systemSection')}</p>${systemCategories.map(renderCategoryRow).join("")}`
                     : ""}
                   ${personalCategories.length > 0
                     ? `<p class="gd-settings-category-section-label mt-3">${t('config.personalSection')}</p>${personalCategories.map(renderCategoryRow).join("")}`
                     : ""}
                 </div>`
            }

            <form id="nuevaCategoriaForm" class="gd-form-grid gd-settings-budget-form">
              <div>
                <label class="gd-form-label" for="nuevaCategoria">${t('config.categoryName')}</label>
                <input id="nuevaCategoria" class="gd-form-input" placeholder="${t('config.placeholderPets')}">
              </div>
              <div>
                <label class="gd-form-label" for="nuevoCategoriaEmoji">${t('config.emoji')} <span class="gd-form-optional">${t('common.optional')}</span></label>
                <input id="nuevoCategoriaEmoji" class="gd-form-input" placeholder="🐾" maxlength="8">
              </div>
              <div class="d-flex align-items-end">
                <button type="submit" class="gd-btn-primary w-100">${t('config.addCategory')}</button>
              </div>
            </form>
          </article>
        </section>

        <!-- ASESORIA -->
        <section id="config-section-asesoria" class="gd-settings-panel ${activeSection === "asesoria" ? "active" : ""}" data-config-section="asesoria" ${activeSection === "asesoria" ? "" : "hidden"}>
          <div class="row g-3 align-items-stretch">
            <div class="col-12 col-xl-6">
              <article class="gd-card h-100">
                <h2 class="gd-card-title mb-1">${t('config.addAdvisor')}</h2>
                <p class="gd-muted mb-3">${t('config.addAdvisorSub')}</p>

                <form id="agregarAsesorForm">
                  <div class="gd-form-grid">
                    <div>
                      <label class="gd-form-label" for="asesorNombre">${t('config.advisorName')}</label>
                      <input id="asesorNombre" class="gd-form-input" value="${escapeHtml(String(advisorRequest.nombre || ""))}" placeholder="${t('config.placeholderAdvisorName')}" required>
                    </div>
                    <div>
                      <label class="gd-form-label" for="asesorEmail">${t('config.advisorEmail')}</label>
                      <input id="asesorEmail" type="email" class="gd-form-input" value="${escapeHtml(String(advisorRequest.email || ""))}" placeholder="${t('config.placeholderAdvisorEmail')}" required>
                    </div>
                    <div class="gd-form-full">
                      <label class="gd-form-label" for="asesorEspecialidad">${t('config.specialty')} <span class="gd-form-optional">${t('common.optional')}</span></label>
                      <input id="asesorEspecialidad" class="gd-form-input" value="${escapeHtml(String(advisorRequest.especialidad || ""))}" placeholder="${t('config.placeholderSpecialty')}">
                    </div>
                  </div>
                  <div class="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-2 mt-3">
                    <small class="gd-muted">${t('config.advisorCodeHint')}</small>
                    <button type="submit" class="gd-btn-primary">${t('config.generateCode')}</button>
                  </div>
                </form>
              </article>
            </div>

            <div class="col-12 col-xl-6">
              <article class="gd-card h-100">
                <div class="d-flex align-items-start justify-content-between gap-2 mb-3">
                  <div>
                    <h2 class="gd-card-title mb-1">${t('config.advisorProfile')}</h2>
                    <p class="gd-muted mb-0">${advisorHasProfile ? t('config.advisorProfileLinked') : t('config.advisorProfileEmpty')}</p>
                  </div>
                  ${advisorHasProfile
                    ? `<button type="button" class="gd-ahorro-ctrl-btn gd-ahorro-ctrl-btn--danger" data-action="desvincular-asesor" aria-label="${t('config.unlinkAdvisor')}">
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
                         <p class="gd-settings-session-sub mb-0">${escapeHtml(advisorSpecialty || t('config.noSpecialty'))}</p>
                       </div>
                     </div>
                     <div class="gd-settings-advisor-code-box mt-3">
                       <span class="gd-muted d-block mb-1">${t('config.verificationCode')}</span>
                       <strong class="gd-settings-advisor-code">${escapeHtml(advisorCode || t('config.codePending'))}</strong>
                       <p class="gd-muted mb-0 mt-2">${t('config.advisorMustEnterCode')}</p>
                     </div>
                     <div class="gd-settings-advisor-meta mt-3">
                       <span class="gd-settings-category-pill">${t('config.linked')}</span>
                       <span class="gd-settings-advisor-meta-text">${t('config.linkActive')}</span>
                     </div>`
                  : `<div class="gd-settings-advisor-empty">
                       <i class="lni lni-user fs-1"></i>
                       <p class="mb-1 fw-semibold">${t('config.noAdvisorLinked')}</p>
                       <p class="gd-muted mb-0">${t('config.noAdvisorLinkedSub')}</p>
                     </div>`
                }
              </article>
            </div>
          </div>
        </section>

        <!-- NOTIFICACIONES -->
        <section id="config-section-notificaciones" class="gd-settings-panel ${activeSection === "notificaciones" ? "active" : ""}" data-config-section="notificaciones" ${activeSection === "notificaciones" ? "" : "hidden"}>
          <article class="gd-card">
            <h2 class="gd-card-title mb-1">${t('config.expenseAlerts')}</h2>
            <p class="gd-muted mb-3">${t('config.expenseAlertsSub')}</p>

            <label class="gd-settings-toggle-row">
              <div>
                <p class="gd-card-title gd-card-title-xs mb-0">${t('config.unusualExpense')}</p>
                <small class="gd-muted">${t('config.unusualExpenseSub')}</small>
              </div>
              <input class="form-check-input mt-0" type="checkbox" id="resumenSemanal" ${state.notificaciones?.resumenSemanal !== false ? "checked" : ""}>
            </label>

            <label class="gd-settings-toggle-row">
              <div>
                <p class="gd-card-title gd-card-title-xs mb-0">${t('config.budget80')}</p>
                <small class="gd-muted">${t('config.budget80Sub')}</small>
              </div>
              <input class="form-check-input mt-0" type="checkbox" id="alertaPresupuesto" ${state.notificaciones?.alertaPresupuesto !== false ? "checked" : ""}>
            </label>

            <label class="gd-settings-toggle-row">
              <div>
                <p class="gd-card-title gd-card-title-xs mb-0">${t('config.advisorRecommendations')}</p>
                <small class="gd-muted">${t('config.advisorRecommendationsSub')}</small>
              </div>
              <input class="form-check-input mt-0" type="checkbox" id="recomendacionesIA" ${state.notificaciones?.recomendacionesIA !== false ? "checked" : ""}>
            </label>

            <label class="gd-settings-toggle-row">
              <div>
                <p class="gd-card-title gd-card-title-xs mb-0">${t('config.largeMovements')}</p>
                <small class="gd-muted">${t('config.largeMovementsSub')}</small>
              </div>
              <input class="form-check-input mt-0" type="checkbox" id="movimientosGrandes" ${state.notificaciones?.movimientosGrandes !== false ? "checked" : ""}>
            </label>

            <div class="d-flex justify-content-end mt-3">
              <button type="button" class="gd-btn-primary" id="guardarPreferenciasNotifBtn">${t('config.savePreferences')}</button>
            </div>
          </article>
        </section>

        <!-- APARIENCIA -->
        <section id="config-section-apariencia" class="gd-settings-panel ${activeSection === "apariencia" ? "active" : ""}" data-config-section="apariencia" ${activeSection === "apariencia" ? "" : "hidden"}>
          <article class="gd-card">
            <h2 class="gd-card-title mb-1">${t('config.appearanceTitle')}</h2>
            <p class="gd-muted mb-3">${t('config.appearanceSub')}</p>

            <div class="gd-form-grid">
              <div>
                <label class="gd-form-label" for="idioma">${t('config.language')}</label>
                <select id="idioma" name="idioma" class="gd-form-select">
                  <option value="es" ${config.idioma === "es" ? "selected" : ""}>${t('config.langEs')}</option>
                  <option value="en" ${config.idioma === "en" ? "selected" : ""}>${t('config.langEn')}</option>
                </select>
              </div>
              <div>
                <label class="gd-form-label" for="temaModo">${t('config.theme')}</label>
                <select id="temaModo" name="temaModo" class="gd-form-select">
                  <option value="system" ${config.tema === "system" ? "selected" : ""}>${t('config.themeSystem')}</option>
                  <option value="light" ${config.tema === "light" ? "selected" : ""}>${t('config.themeLight')}</option>
                  <option value="dark" ${config.tema === "dark" ? "selected" : ""}>${t('config.themeDark')}</option>
                </select>
              </div>
              <div>
                <label class="gd-form-label" for="tamanioFuente">${t('config.fontSize')}</label>
                <select id="tamanioFuente" name="tamanioFuente" class="gd-form-select">
                  <option value="sm" ${config.tamanioFuente === "sm" ? "selected" : ""}>${t('config.fontSm')}</option>
                  <option value="md" ${config.tamanioFuente === "md" ? "selected" : ""}>${t('config.fontMd')}</option>
                  <option value="lg" ${config.tamanioFuente === "lg" ? "selected" : ""}>${t('config.fontLg')}</option>
                </select>
              </div>
              <div>
                <label class="gd-form-label" for="densidad">${t('config.density')}</label>
                <select id="densidad" name="densidad" class="gd-form-select">
                  <option value="comfortable" ${config.densidad === "comfortable" ? "selected" : ""}>${t('config.densityComfortable')}</option>
                  <option value="compact" ${config.densidad === "compact" ? "selected" : ""}>${t('config.densityCompact')}</option>
                </select>
              </div>

              <label class="gd-form-full gd-setting-row" for="mostrarCentavos">
                <div>
                  <p class="gd-card-title gd-card-title-xs mb-0">${t('config.showCents')}</p>
                  <small class="gd-muted">${t('config.showCentsSub')}</small>
                </div>
                <input class="form-check-input mt-0" type="checkbox" id="mostrarCentavos" ${config.mostrarCentavos ? "checked" : ""}>
              </label>

              <div class="gd-form-full gd-settings-preview">
                <p class="gd-card-title gd-card-title-xs mb-2">${t('config.preview')}</p>
                <div class="gd-settings-preview-list">
                  <div class="gd-settings-preview-item"><span>${t('config.previewLanguage')}</span><strong>${escapeHtml(idiomaLabel)}</strong></div>
                  <div class="gd-settings-preview-item"><span>${t('config.previewTheme')}</span><strong>${escapeHtml(themeLabel)}</strong></div>
                  <div class="gd-settings-preview-item"><span>${t('config.previewFont')}</span><strong>${escapeHtml(fontSizeLabel)}</strong></div>
                  <div class="gd-settings-preview-item"><span>${t('config.previewDensity')}</span><strong>${escapeHtml(densityLabel)}</strong></div>
                </div>
              </div>
            </div>

            <div class="d-flex justify-content-end mt-3">
              <button type="button" class="gd-btn-primary" id="guardarConfiguracionBtn">${t('config.saveConfiguration')}</button>
            </div>
          </article>
        </section>

        <!-- MIS DATOS -->
        <section id="config-section-datos" class="gd-settings-panel ${activeSection === "datos" ? "active" : ""}" data-config-section="datos" ${activeSection === "datos" ? "" : "hidden"}>
          <article class="gd-card">
            <h2 class="gd-card-title mb-1">${t('config.exportMyData')}</h2>
            <p class="gd-muted mb-3">${t('config.exportMyDataSub')}</p>

            <div class="gd-settings-export-list">
              <div class="gd-settings-export-row">
                <div>
                  <p class="gd-settings-session-title">${t('config.movementHistory')}</p>
                  <p class="gd-settings-session-sub">${t('config.movementHistorySub', { count: ticketCount })}</p>
                </div>
                <div class="d-flex gap-2">
                  <button type="button" class="gd-btn-secondary" data-action="export-gastos-csv">${t('config.csv')}</button>
                  <button type="button" class="gd-btn-secondary" disabled title="${t('config.comingSoon')}" style="opacity:0.5;">${t('config.excel')}</button>
                </div>
              </div>

              <div class="gd-settings-export-row">
                <div>
                  <p class="gd-settings-session-title">${t('config.monthlyReports')} ${renderProxBadge()}</p>
                  <p class="gd-settings-session-sub">${t('config.monthlyReportsSub')}</p>
                </div>
                <button type="button" class="gd-btn-secondary" disabled style="opacity:0.5;">${t('config.pdf')}</button>
              </div>
            </div>
          </article>
        </section>

        <!-- PLAN -->
        <section id="config-section-plan" class="gd-settings-panel ${activeSection === "plan" ? "active" : ""}" data-config-section="plan" ${activeSection === "plan" ? "" : "hidden"}>
          <article class="gd-card">
            <h2 class="gd-card-title mb-1">${t('config.currentPlanTitle')}</h2>
            <p class="gd-muted mb-3">${t('config.currentPlanSub')}</p>

            <div class="gd-settings-plan-card current">
              <div>
                <p class="gd-settings-session-title">${t('config.freePlan')}</p>
                <p class="gd-settings-session-sub">${t('config.freePlanSub', { limit: ticketLimit })}</p>
              </div>
              <span class="gd-settings-category-pill">${t('config.current')}</span>
            </div>

            <div class="gd-settings-plan-card">
              <div>
                <p class="gd-settings-session-title">${t('config.proPlan')} ${renderProxBadge()}</p>
                <p class="gd-settings-session-sub">${t('config.proPlanSub')}</p>
              </div>
              <button type="button" class="gd-btn-primary" disabled style="opacity:0.5;">${t('config.comingSoon')}</button>
            </div>

            <div class="gd-settings-usage-list mt-3">
              <div class="gd-settings-budget-row">
                <span class="gd-settings-budget-cat">${t('config.uploadedMovements')}</span>
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
            <h2 class="gd-card-title mb-1">${t('config.dangerZoneTitle')}</h2>
            <p class="gd-muted mb-3">${t('config.dangerZoneSub')}</p>

            <div class="gd-settings-danger-row">
              <div>
                <p class="gd-settings-session-title">${t('config.deleteHistory')}</p>
                <p class="gd-settings-session-sub">${t('config.deleteHistorySub')}</p>
              </div>
              <button type="button" class="gd-btn-danger" data-action="borrar-historial">${t('config.deleteHistoryBtn')}</button>
            </div>

            <div class="gd-settings-danger-row">
              <div>
                <p class="gd-settings-session-title">${t('config.deleteAccount')}</p>
                <p class="gd-settings-session-sub">${t('config.deleteAccountSub')}</p>
              </div>
              <button type="button" class="gd-btn-danger" data-action="eliminar-cuenta">${t('config.deleteAccountBtn')}</button>
            </div>
          </article>
        </section>

      </div>
    </section>
  `;

  return renderDashboardAppLayout({
    activePath: "/perfil/configuracion",
    pageTitle: t('config.pageTitle'),
    pageSubtitle: t('config.pageSubtitle'),
    content,
    profileImage,
    profileName,
    isAsesor,
  });
}

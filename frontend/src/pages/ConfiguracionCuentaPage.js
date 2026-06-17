import { renderDashboardAppLayout } from "../components/dashboard/dashboardAppLayout";
import { escapeHtml } from "../utils/sanitize";
import { t } from "../i18n";
import { renderAccountSections } from "../components/configuracion/AccountSections";
import { renderFinancesSections } from "../components/configuracion/FinancesSections";
import { renderAsesoriaSection } from "../components/configuracion/AsesoriaSection";
import { renderPreferencesSections } from "../components/configuracion/PreferencesSections";
import { renderPlanSections } from "../components/configuracion/PlanSections";

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

function resolveActiveSettingsSection() {
  if (typeof window === "undefined") return DEFAULT_SETTINGS_SECTION;
  const hashValue = String(window.location.hash || "");
  const parsed = hashValue.startsWith("#config-") ? hashValue.slice("#config-".length) : "";
  return SETTINGS_SECTION_IDS.includes(parsed) ? parsed : DEFAULT_SETTINGS_SECTION;
}

function renderSettingsNav(activeSection) {
  return SETTINGS_NAV_GROUPS.map((group) => {
    const items = group.items.map((item) => {
      const isActive = item.id === activeSection;

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

export function renderConfiguracionCuentaPage({ state, profileImage, profileName, isAsesor = false }) {
  const activeSection = resolveActiveSettingsSection();

  const content = `
    <section class="gd-settings-shell">
      <aside class="gd-settings-nav" aria-label="${t('config.subsectionsAria')}">
        ${renderSettingsNav(activeSection)}
      </aside>
      <div class="gd-settings-content">
        ${renderAccountSections({ activeSection, profileImage, profileName, state, config: state.configuracion })}
        ${renderFinancesSections({ activeSection, state })}
        ${renderAsesoriaSection({ activeSection, config: state.configuracion })}
        ${renderPreferencesSections({ activeSection, config: state.configuracion, state })}
        ${renderPlanSections({ activeSection, state })}
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

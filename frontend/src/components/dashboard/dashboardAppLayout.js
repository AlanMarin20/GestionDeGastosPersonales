import { escapeHtml } from "../../utils/sanitize";
import { getUnreadNotifications } from "../../data/finanzas";
import { t } from "../../i18n";

function getNavItems() {
  return [
    {
      section: t('nav.section.main'),
      items: [
        { href: "/dashboard",                 label: t('nav.dashboard'),    icon: "lni lni-grid-alt"   },
        { href: "/dashboard/cargar",          label: t('nav.newMovement'),  icon: "lni lni-upload"     },
        { href: "/dashboard/gastos",          label: t('nav.myMovements'),  icon: "lni lni-list"       },
        { href: "/dashboard/ahorros",         label: t('nav.savings'),      icon: "lni lni-investment" },
      ],
    },
    {
      section: t('nav.section.analysis'),
      items: [
        { href: "/dashboard/recomendaciones", label: t('nav.recommendations'), icon: "lni lni-bulb"      },
        { href: "/dashboard/patrones",        label: t('nav.patterns'),        icon: "lni lni-bar-chart" },
      ],
    },
    {
      section: t('nav.section.account'),
      items: [
        { href: "/perfil/configuracion", label: t('nav.configuration'), icon: "lni lni-cog" },
      ],
    },
    {
      section: t('nav.section.advisor'),
      items: [
        { href: "/dashboard/asesor", label: t('nav.advisorDashboard'), icon: "lni lni-grid-alt" },
      ],
    },
  ];
}

function getAdvisorNavItems() {
  return [
    {
      section: t('nav.section.advisor'),
      items: [
        { href: "/dashboard/asesor",          label: t('nav.advisorPortfolio'), icon: "lni lni-users"      },
        { href: "/dashboard/asesor/recomendaciones", label: t('nav.recommendations'),  icon: "lni lni-bulb"       },
        { href: "/perfil/configuracion",      label: t('nav.configuration'),    icon: "lni lni-cog"        },
      ],
    },
    {
      section: "",
      items: [
        { href: "/dashboard", label: t('nav.backToMyDashboard'), icon: "lni lni-arrow-left" },
      ],
    },
  ];
}

function buildInitials(name) {
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

function renderNavGroups({ activePath, navItems }) {
  const allHrefs = navItems.flatMap((g) => g.items.map((i) => i.href));
  const hasExactMatch = allHrefs.includes(activePath);

  return navItems
    .map(
      (group) => `
        <div class="gd-nav-section">
          <div class="gd-nav-label">${escapeHtml(group.section)}</div>
          ${group.items
            .map((item) => {
              const isActive = activePath === item.href ||
                (!hasExactMatch && item.href !== "/dashboard" && activePath.startsWith(item.href + "/"));
              return `
                <a href="${escapeHtml(item.href)}" data-link class="gd-nav-item ${isActive ? "active" : ""}">
                  <i class="${escapeHtml(item.icon)} gd-nav-icon" aria-hidden="true"></i>
                  <span>${escapeHtml(item.label)}</span>
                </a>
              `;
            })
            .join("")}
        </div>
      `,
    )
    .join("");
}

function renderCustomNavGroups({ activePath, sidebarSections }) {
  const allHrefs = sidebarSections.flatMap((g) => (g.items || []).map((i) => i.href));
  const hasExactMatch = allHrefs.includes(activePath);

  return sidebarSections
    .map(
      (group) => `
        <div class="gd-nav-section">
          <div class="gd-nav-label">${escapeHtml(group.section)}</div>
          ${(group.items || [])
            .map((item) => {
              const isActive = activePath === item.href ||
                (!hasExactMatch && item.href !== "/dashboard" && activePath.startsWith(item.href + "/"));
              return `
                <a href="${escapeHtml(item.href)}" data-link class="gd-nav-item ${isActive ? "active" : ""}">
                  <i class="${escapeHtml(item.icon)} gd-nav-icon" aria-hidden="true"></i>
                  <span>${escapeHtml(item.label)}</span>
                </a>
              `;
            })
            .join("")}
        </div>
      `,
    )
    .join("");
}

function resolveNavMarkup({ activePath, isAsesor, sidebarSections }) {
  const hasCustomSections = Array.isArray(sidebarSections) && sidebarSections.length > 0;
  if (hasCustomSections) {
    return renderCustomNavGroups({ activePath, sidebarSections });
  }
  if (isAsesor) {
    return renderNavGroups({ activePath, navItems: getAdvisorNavItems() });
  }
  return renderNavGroups({ activePath, navItems: getNavItems() });
}

export function renderDashboardAppLayout({
  activePath,
  pageTitle,
  pageSubtitle,
  content,
  profileImage,
  profileName,
  isAsesor = false,
  notificationCount = 0,
  sidebarSections = null,
}) {
  const initials = buildInitials(profileName);
  const roleLabel = isAsesor ? t('header.role.advisor') : t('header.role.user');
  const notificationsRoute = isAsesor
    ? "/dashboard/asesor"
    : "/dashboard/recomendaciones";

  const notifData = isAsesor ? { count: notificationCount, items: [] } : getUnreadNotifications();
  const resolvedCount = notifData.count;
  const resolvedItems = notifData.items;
  const primaryAction = isAsesor
    ? null
    : {
        label: t('nav.newMovement'),
        path: "/dashboard/cargar",
        icon: "lni lni-plus",
      };

  return `
    <div class="gd-shell">
      <aside class="gd-sidebar">
        <div class="gd-logo-wrap">
          <a href="/dashboard" data-link class="gd-logo-link" aria-label="${t('layout.goToDashboard')}">
            <span class="gd-logo-icon" aria-hidden="true">
              <img src="/assets/img/logo/iconoSfondo.webp" alt="">
            </span>
            <span class="gd-logo-text">FinanzasPro<span>${t('layout.brandTagline')}</span></span>
          </a>
        </div>

        <nav class="gd-nav" aria-label="${t('layout.dashboardNav')}">
          ${resolveNavMarkup({ activePath, isAsesor, sidebarSections })}
        </nav>

        <div class="gd-user-chip-wrap">
          <div class="gd-user-chip-menu">
            <button
              type="button"
              class="gd-user-chip"
              data-action="toggle-user-chip-menu"
              aria-label="${t('layout.openAccountMenu')}"
              aria-expanded="false"
              aria-haspopup="true"
              aria-controls="gd-user-chip-dropdown"
            >
              <img
                src="${escapeHtml(profileImage || "/assets/img/user-avatar-default.svg")}"
                alt="${escapeHtml(t('layout.avatarOf', { name: profileName }))}"
                class="gd-avatar-image"
                data-image-error-mode="toggle-next"
              >
              <span class="gd-avatar d-none" aria-hidden="true">${escapeHtml(initials)}</span>
              <span class="gd-user-copy">
                <span class="gd-user-name">${escapeHtml(profileName)}</span>
                <span class="gd-user-role">${escapeHtml(roleLabel)}</span>
              </span>
              <i class="lni lni-chevron-down gd-user-chip-caret" aria-hidden="true"></i>
            </button>

            <div id="gd-user-chip-dropdown" class="gd-user-chip-dropdown" role="menu" aria-label="${t('layout.accountOptions')}">
              <button type="button" class="gd-user-chip-dropdown-item gd-user-chip-dropdown-item-danger" data-action="logout" role="menuitem">
                <i class="lni lni-exit" aria-hidden="true"></i>
                <span>${t('layout.logout')}</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      <section class="gd-main">
        <header class="gd-topbar">
          <div class="gd-topbar-copy">
            <h1 class="gd-page-title">${escapeHtml(pageTitle)}</h1>
            <p class="gd-page-subtitle">${escapeHtml(pageSubtitle)}</p>
          </div>

          <div class="gd-topbar-actions">
            <div class="gd-top-notifications">
              <button type="button" class="gd-top-btn gd-top-notifications-trigger" data-action="toggle-notifications-menu" aria-expanded="false" aria-haspopup="true" aria-label="${t('layout.openNotifications')}">
                <i class="lni lni-alarm" aria-hidden="true"></i>
                <span>${t('layout.notifications')}</span>
                ${resolvedCount > 0 ? `<span class="gd-alert-dot" aria-label="${escapeHtml(t('layout.pendingAlerts', { count: resolvedCount }))}"></span>` : ""}
              </button>

              <section class="gd-notifications-menu" aria-label="${t('layout.notifications')}">
                <header class="gd-notifications-head">
                  <h2 class="gd-notifications-title">${t('layout.notifications')}</h2>
                  ${resolvedCount > 0 ? `<span class="gd-notifications-count">${escapeHtml(String(resolvedCount))}</span>` : ""}
                </header>

                <div class="gd-notifications-body">
                  ${resolvedItems.length > 0
                    ? resolvedItems.map((item) => `
                        <a href="${escapeHtml(notificationsRoute)}" data-link class="gd-notification-item gd-notification-item--${escapeHtml(item.severity)}">
                          <span class="gd-notification-item-title">${escapeHtml(item.title)}</span>
                          ${item.body ? `<span class="gd-notification-item-sub">${escapeHtml(item.body.length > 80 ? item.body.slice(0, 80) + "…" : item.body)}</span>` : ""}
                        </a>
                      `).join("")
                    : `<p class="gd-notifications-empty">${t('layout.noActiveAlerts')}</p>`
                  }
                  ${resolvedCount > 4 ? `
                    <a href="${escapeHtml(notificationsRoute)}" data-link class="gd-notification-item">
                      <span class="gd-notification-item-title">${t('layout.viewMoreAlerts', { count: resolvedCount - 4 })}</span>
                    </a>` : ""}
                  <a href="/perfil/notificaciones" data-link class="gd-notification-item">
                    <span class="gd-notification-item-title">${t('layout.notificationPreferences')}</span>
                    <span class="gd-notification-item-sub">${t('layout.notificationPreferencesSub')}</span>
                  </a>
                </div>
              </section>
            </div>
            ${primaryAction ? `<button type="button" class="gd-top-btn gd-top-btn-primary" data-nav="${escapeHtml(primaryAction.path)}">
              <i class="${escapeHtml(primaryAction.icon)}" aria-hidden="true"></i>
              <span>${escapeHtml(primaryAction.label)}</span>
            </button>` : ""}
          </div>
        </header>

        <div class="gd-content">${content}</div>
      </section>
    </div>
  `;
}

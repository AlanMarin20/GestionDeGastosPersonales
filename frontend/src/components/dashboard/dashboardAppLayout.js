import { escapeHtml } from "../../utils/sanitize";

const ASESOR_NAV_SECTION = {
  section: "Asesor",
  items: [
    {
      href: "/dashboard/asesor",
      label: "Dashboard asesor",
      icon: "lni lni-grid-alt",
    },
    {
      href: "/dashboard/asesor/recomendaciones",
      label: "Generar recomendaciones",
      icon: "lni lni-bulb",
    },
  ],
};

const USER_NAV_ITEMS = [
  {
    section: "Principal",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: "lni lni-grid-alt" },
      {
        href: "/dashboard/cargar",
        label: "Cargar gasto",
        icon: "lni lni-upload",
      },
      {
        href: "/dashboard/gastos",
        label: "Mis gastos",
        icon: "lni lni-list",
      },
      {
        href: "/dashboard/reportes",
        label: "Reportes",
        icon: "lni lni-bar-chart",
      },
    ],
  },
  {
    section: "Analisis",
    items: [
      {
        href: "/dashboard/recomendaciones",
        label: "Recomendaciones",
        icon: "lni lni-bulb",
      },
    ],
  },
  {
    section: "Cuenta",
    items: [
      {
        href: "/perfil/configuracion",
        label: "Configuracion",
        icon: "lni lni-cog",
      },
    ],
  },
  ASESOR_NAV_SECTION,
];

const ADVISOR_NAV_ITEMS = [
  ...USER_NAV_ITEMS,
];

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

function renderNavGroups({ activePath, isAsesor }) {
  const navConfig = isAsesor ? ADVISOR_NAV_ITEMS : USER_NAV_ITEMS;

  return navConfig
    .map(
      (group) => `
        <div class="gd-nav-section">
          <div class="gd-nav-label">${escapeHtml(group.section)}</div>
          ${group.items
            .map((item) => {
              const isActive = activePath === item.href;
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

export function renderDashboardAppLayout({
  activePath,
  pageTitle,
  pageSubtitle,
  content,
  profileImage,
  profileName,
  isAsesor = false,
  notificationCount = 0,
}) {
  const initials = buildInitials(profileName);
  const roleLabel = isAsesor ? "asesor" : "usuario";
  const notificationsRoute = isAsesor
    ? "/dashboard/asesor/recomendaciones"
    : "/dashboard/recomendaciones";
  const primaryAction = isAsesor
    ? {
        label: "Vista usuario",
        path: "/dashboard",
        icon: "lni lni-user",
      }
    : {
        label: "Nuevo gasto",
        path: "/dashboard/cargar",
        icon: "lni lni-plus",
      };

  return `
    <div class="gd-shell">
      <aside class="gd-sidebar">
        <div class="gd-logo-wrap">
          <a href="/dashboard" data-link class="gd-logo-link" aria-label="Ir al dashboard">
            <span class="gd-logo-icon" aria-hidden="true">
              <img src="/assets/img/logo/iconoSfondo.png" alt="">
            </span>
            <span class="gd-logo-text">FinanzasPro<span>gestion de gastos</span></span>
          </a>
        </div>

        <nav class="gd-nav" aria-label="Navegacion del dashboard">
          ${renderNavGroups({ activePath, isAsesor })}
        </nav>

        <div class="gd-user-chip-wrap">
          <div class="gd-user-chip-menu">
            <button
              type="button"
              class="gd-user-chip"
              data-action="toggle-user-chip-menu"
              aria-label="Abrir menu de cuenta"
              aria-expanded="false"
              aria-haspopup="true"
              aria-controls="gd-user-chip-dropdown"
            >
              <img
                src="${escapeHtml(profileImage || "/assets/img/user-avatar-default.svg")}" 
                alt="Avatar de ${escapeHtml(profileName)}"
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

            <div id="gd-user-chip-dropdown" class="gd-user-chip-dropdown" role="menu" aria-label="Opciones de cuenta">
              <button type="button" class="gd-user-chip-dropdown-item" data-action="switch-account" role="menuitem">
                <i class="lni lni-users" aria-hidden="true"></i>
                <span>Cambiar de cuenta</span>
              </button>
              <button type="button" class="gd-user-chip-dropdown-item gd-user-chip-dropdown-item-danger" data-action="logout" role="menuitem">
                <i class="lni lni-exit" aria-hidden="true"></i>
                <span>Cerrar sesion</span>
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
              <button type="button" class="gd-top-btn gd-top-notifications-trigger" data-action="toggle-notifications-menu" aria-expanded="false" aria-haspopup="true" aria-label="Abrir notificaciones">
                <i class="lni lni-alarm" aria-hidden="true"></i>
                <span>Notificaciones</span>
                ${
                  notificationCount > 0
                    ? `<span class="gd-alert-dot" aria-label="${notificationCount} alertas pendientes"></span>`
                    : ""
                }
              </button>

              <section class="gd-notifications-menu" aria-label="Notificaciones">
                <header class="gd-notifications-head">
                  <h2 class="gd-notifications-title">Notificaciones</h2>
                  <span class="gd-notifications-count">${escapeHtml(String(notificationCount))}</span>
                </header>

                <div class="gd-notifications-body">
                  ${
                    notificationCount > 0
                      ? `<a href="${escapeHtml(notificationsRoute)}" data-link class="gd-notification-item">
                          <span class="gd-notification-item-title">Ver alertas pendientes</span>
                          <span class="gd-notification-item-sub">${escapeHtml(String(notificationCount))} elementos por revisar</span>
                        </a>`
                      : `<p class="gd-notifications-empty">No tienes notificaciones nuevas.</p>`
                  }

                  <a href="/perfil/notificaciones" data-link class="gd-notification-item">
                    <span class="gd-notification-item-title">Preferencias de notificacion</span>
                    <span class="gd-notification-item-sub">Configura alertas y recordatorios</span>
                  </a>
                </div>
              </section>
            </div>
            <button type="button" class="gd-top-btn gd-top-btn-primary" data-nav="${escapeHtml(primaryAction.path)}">
              <i class="${escapeHtml(primaryAction.icon)}" aria-hidden="true"></i>
              <span>${escapeHtml(primaryAction.label)}</span>
            </button>
          </div>
        </header>

        <div class="gd-content">${content}</div>
      </section>
    </div>
  `;
}

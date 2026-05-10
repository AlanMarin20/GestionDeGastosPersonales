import { renderDashboardAppLayout } from "../components/dashboard/dashboardAppLayout";
import { escapeHtml } from "../utils/sanitize";

const SEVERITY_CONFIG = {
  danger: {
    groupLabel: "Alertas criticas",
    className: "gd-notif-danger",
    iconClass: "lni lni-alarm",
    badgeLabel: "Alerta",
  },
  warning: {
    groupLabel: "Avisos",
    className: "gd-notif-warning",
    iconClass: "lni lni-warning",
    badgeLabel: "Aviso",
  },
  good: {
    groupLabel: "Logros",
    className: "gd-notif-good",
    iconClass: "lni lni-checkmark-circle",
    badgeLabel: "Logro",
  },
  info: {
    groupLabel: "Informacion",
    className: "gd-notif-info",
    iconClass: "lni lni-information",
    badgeLabel: "Info",
  },
};

const SEVERITY_ORDER = ["danger", "warning", "good", "info"];

function renderNotifItem(notif) {
  const severityKey = String(notif.severity || "info").toLowerCase();
  const cfg = SEVERITY_CONFIG[severityKey] || SEVERITY_CONFIG.info;

  return `
    <div class="gd-notif-item ${escapeHtml(cfg.className)}">
      <span class="gd-notif-icon-wrap" aria-hidden="true">
        <i class="${escapeHtml(cfg.iconClass)}"></i>
      </span>
      <div class="gd-notif-body">
        <p class="gd-notif-title">${escapeHtml(notif.title || "")}</p>
        <p class="gd-notif-text">${escapeHtml(notif.body || "")}</p>
        <div class="gd-notif-meta">
          ${notif.date ? `<span class="gd-rec-tag">${escapeHtml(notif.date)}</span>` : ""}
          ${notif.category ? `<span class="gd-rec-tag">${escapeHtml(notif.category)}</span>` : ""}
          <span class="gd-notif-source-tag">${escapeHtml(String(notif.source || "sistema").toUpperCase())}</span>
        </div>
      </div>
      ${notif.actionHref ? `
        <a href="${escapeHtml(notif.actionHref)}" data-link class="gd-notif-action">Ver</a>
      ` : ""}
    </div>
  `;
}

export function renderNotificacionesPage({
  profileImage,
  profileName,
  activePath,
  pageTitle,
  pageSubtitle,
  notifications = [],
}) {
  const grouped = SEVERITY_ORDER.map((severity) => ({
    severity,
    cfg: SEVERITY_CONFIG[severity],
    items: notifications.filter((n) => String(n.severity || "info").toLowerCase() === severity),
  })).filter((g) => g.items.length > 0);

  const totalCount = notifications.length;

  const content = `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div class="d-flex align-items-center gap-2">
        ${totalCount > 0 ? `<span class="gd-notif-total-badge">${escapeHtml(String(totalCount))} notificaciones</span>` : ""}
      </div>
      <a href="/dashboard/recomendaciones" data-link class="gd-top-btn">
        <i class="lni lni-bulb" aria-hidden="true"></i>
        Ver recomendaciones
      </a>
    </div>

    ${grouped.length > 0
      ? grouped.map((group) => `
          <div class="gd-notif-group">
            <h3 class="gd-notif-group-label">${escapeHtml(group.cfg.groupLabel)}</h3>
            ${group.items.map(renderNotifItem).join("")}
          </div>
        `).join("")
      : `
        <div class="gd-card">
          <div class="gd-card-body" style="padding: 2rem; text-align: center;">
            <i class="lni lni-checkmark-circle" style="font-size: 2rem; color: #16a34a; display: block; margin-bottom: 0.5rem;"></i>
            <p class="gd-muted mb-0">Todo en orden. No hay notificaciones pendientes.</p>
          </div>
        </div>
      `
    }
  `;

  return renderDashboardAppLayout({
    activePath,
    pageTitle,
    pageSubtitle,
    content,
    profileImage,
    profileName,
    notificationCount: totalCount,
  });
}

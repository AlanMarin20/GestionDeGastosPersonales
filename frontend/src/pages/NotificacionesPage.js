import { renderDashboardAppLayout } from "../components/dashboard/dashboardAppLayout";
import { escapeHtml } from "../utils/sanitize";
import { t } from "../i18n";

const SEVERITY_CONFIG = {
  danger: {
    groupLabelKey: 'notif.criticalAlerts',
    className: "gd-notif-danger",
    iconClass: "lni lni-alarm",
    badgeLabelKey: 'notif.badgeAlert',
  },
  warning: {
    groupLabelKey: 'notif.warnings',
    className: "gd-notif-warning",
    iconClass: "lni lni-warning",
    badgeLabelKey: 'notif.badgeWarning',
  },
  good: {
    groupLabelKey: 'notif.achievements',
    className: "gd-notif-good",
    iconClass: "lni lni-checkmark-circle",
    badgeLabelKey: 'notif.badgeAchievement',
  },
  info: {
    groupLabelKey: 'notif.information',
    className: "gd-notif-info",
    iconClass: "lni lni-information",
    badgeLabelKey: 'notif.badgeInfo',
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
        <a href="${escapeHtml(notif.actionHref)}" data-link class="gd-notif-action">${t('common.view')}</a>
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
        ${totalCount > 0 ? `<span class="gd-notif-total-badge">${t('notif.totalCount', { count: totalCount })}</span>` : ""}
      </div>
      <a href="/dashboard/recomendaciones" data-link class="gd-top-btn">
        <i class="lni lni-bulb" aria-hidden="true"></i>
        ${t('notif.viewRecommendations')}
      </a>
    </div>

    ${grouped.length > 0
      ? grouped.map((group) => `
          <div class="gd-notif-group">
            <h3 class="gd-notif-group-label">${t(group.cfg.groupLabelKey)}</h3>
            ${group.items.map(renderNotifItem).join("")}
          </div>
        `).join("")
      : `
        <div class="gd-card">
          <div class="gd-card-body" style="padding: 2rem; text-align: center;">
            <i class="lni lni-checkmark-circle" style="font-size: 2rem; color: #16a34a; display: block; margin-bottom: 0.5rem;"></i>
            <p class="gd-muted mb-0">${t('notif.allClear')}</p>
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

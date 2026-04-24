import { renderDashboardAppLayout } from "../components/dashboard/dashboardAppLayout";
import { tarjetaValor } from "../components/common/reusablePageComponents";
import { escapeHtml } from "../utils/sanitize";

const RISK_CONFIG = {
  low: {
    label: "Riesgo bajo",
    className: "gd-risk-low",
    barColor: "#65a30d",
  },
  medium: {
    label: "Riesgo medio",
    className: "gd-risk-medium",
    barColor: "#f59e0b",
  },
  high: {
    label: "Riesgo alto",
    className: "gd-risk-high",
    barColor: "#ef4444",
  },
};

export function renderDashboardAsesorPage({
  profileImage,
  profileName,
  activePath,
  pageTitle,
  pageSubtitle,
  metrics,
  users,
  search,
  formatMoney,
}) {
  const content = `
    <section class="gd-metrics gd-metrics-3">
      ${metrics
        .map(
          (metric) => tarjetaValor({
            title: metric.label,
            value: metric.value,
            delta: metric.delta,
            trend: metric.trend,
            layout: "dashboard-metric",
            dashboardValueClass: "gd-metric-value-compact",
          }),
        )
        .join("")}
    </section>

    <section class="gd-card">
      <header class="gd-card-header">
        <h2 class="gd-card-title">Usuarios registrados</h2>
        <input
          id="advisorSearchInput"
          class="gd-form-input gd-inline-search"
          type="search"
          placeholder="Buscar usuario"
          value="${escapeHtml(search)}"
        >
      </header>

      <div class="gd-user-list">
        ${
          users.length === 0
            ? `<div class="gd-empty">No hay usuarios que coincidan con la busqueda.</div>`
            : users
                .map((user) => {
                  const risk = RISK_CONFIG[user.risk] || RISK_CONFIG.medium;

                  return `
                    <article class="gd-user-row">
                      <span class="gd-user-avatar gd-user-avatar-dynamic" style="--gd-avatar-color: ${escapeHtml(user.avatarColor)};">${escapeHtml(user.initials)}</span>
                      <div class="gd-user-copy-main">
                        <div class="d-flex align-items-center justify-content-between gap-2">
                          <span class="gd-user-name">${escapeHtml(user.name)}</span>
                          <button type="button" class="gd-action-btn" data-nav="/cliente/${escapeHtml(encodeURIComponent(String(user.id)))}" aria-label="Ver detalle del cliente">Ver detalle</button>
                        </div>
                        <div class="gd-user-sub">${escapeHtml(formatMoney(user.monthlySpend))} este mes · ${escapeHtml(String(user.tickets))} tickets</div>
                        <div class="gd-mini-bar">
                          <div class="gd-mini-bar-fill gd-mini-bar-fill-dynamic" style="--gd-progress-width: ${Math.min(user.progress, 100)}%; --gd-progress-color: ${escapeHtml(risk.barColor)};"></div>
                        </div>
                      </div>
                      <span class="gd-risk-pill ${escapeHtml(risk.className)}">${escapeHtml(risk.label)}</span>
                    </article>
                  `;
                })
                .join("")
        }
      </div>
    </section>
  `;

  return renderDashboardAppLayout({
    activePath,
    pageTitle,
    pageSubtitle,
    content,
    profileImage,
    profileName,
    isAsesor: true,
    notificationCount: 3,
  });
}

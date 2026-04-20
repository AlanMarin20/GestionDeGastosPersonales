import { renderDashboardAppLayout } from "../components/dashboard/dashboardAppLayout";
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
    <section class="gd-metrics" style="grid-template-columns: repeat(3, minmax(0, 1fr));">
      ${metrics
        .map(
          (metric) => `
            <article class="gd-metric-card">
              <p class="gd-metric-label">${escapeHtml(metric.label)}</p>
              <p class="gd-metric-value" style="font-size: 1rem;">${escapeHtml(metric.value)}</p>
              <span class="gd-metric-delta ${metric.trend === "down" ? "gd-delta-down" : "gd-delta-up"}">${escapeHtml(metric.delta)}</span>
            </article>
          `,
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
                      <span class="gd-user-avatar" style="background: ${escapeHtml(user.avatarColor)};">${escapeHtml(user.initials)}</span>
                      <div class="gd-user-copy-main">
                        <div class="d-flex align-items-center justify-content-between gap-2">
                          <span class="gd-user-name">${escapeHtml(user.name)}</span>
                          <button type="button" class="gd-icon-btn" data-nav="/cliente/${escapeHtml(user.id)}" aria-label="Ver detalle del cliente">
                            <i class="lni lni-arrow-right"></i>
                          </button>
                        </div>
                        <div class="gd-user-sub">${escapeHtml(formatMoney(user.monthlySpend))} este mes · ${escapeHtml(String(user.tickets))} tickets</div>
                        <div class="gd-mini-bar">
                          <div class="gd-mini-bar-fill" style="width: ${Math.min(user.progress, 100)}%; background: ${escapeHtml(risk.barColor)};"></div>
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

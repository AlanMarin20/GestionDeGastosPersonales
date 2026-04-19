import { renderDashboardAppLayout } from "../components/dashboard/dashboardAppLayout";

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

const ICON_BY_SEVERITY = {
  danger: "lni lni-warning",
  warning: "lni lni-bolt-alt",
  good: "lni lni-checkmark-circle",
  info: "lni lni-bulb",
};

export function renderRecomendacionesPage({
  profileImage,
  profileName,
  activePath,
  pageTitle,
  pageSubtitle,
  recomendaciones,
}) {
  const content = `
    ${recomendaciones
      .map((item) => {
        const severity = item.severity || "info";
        const iconClass = ICON_BY_SEVERITY[severity] || ICON_BY_SEVERITY.info;

        return `
          <article class="gd-rec-card ${escapeHtml(severity)}">
            <header class="gd-rec-head">
              <i class="${escapeHtml(iconClass)}"></i>
              <h2 class="gd-rec-title">${escapeHtml(item.title)}</h2>
              <span class="gd-rec-type">${escapeHtml(item.type)}</span>
            </header>
            <p class="gd-rec-body">${escapeHtml(item.body)}</p>
            <div class="gd-rec-meta">
              <span class="gd-rec-tag">${escapeHtml(item.date)}</span>
              <span class="gd-rec-tag">${escapeHtml(item.category)}</span>
            </div>
          </article>
        `;
      })
      .join("")}
  `;

  return renderDashboardAppLayout({
    activePath,
    pageTitle,
    pageSubtitle,
    content,
    profileImage,
    profileName,
    notificationCount: recomendaciones.length,
  });
}

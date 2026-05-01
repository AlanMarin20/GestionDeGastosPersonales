import { renderDashboardAppLayout } from "../components/dashboard/dashboardAppLayout";
import { escapeHtml } from "../utils/sanitize";

const SOURCE_CONFIG = {
  asesor: {
    label: "Asesor",
    className: "gd-rec-source-asesor",
    iconClass: "lni lni-user",
  },
  ia: {
    label: "IA",
    className: "gd-rec-source-ia",
    iconClass: "lni lni-bolt-alt",
  },
};

export function renderRecomendacionesPage({
  profileImage,
  profileName,
  activePath,
  pageTitle,
  pageSubtitle,
  recomendaciones,
  isAsesor = false,
}) {
  const content = `
    <div class="d-flex justify-content-end mb-2">
      <a href="/dashboard/recomendaciones/historicas" data-link class="btn btn-outline-secondary btn-sm">Ver historial de recomendaciones</a>
    </div>

    ${recomendaciones
      .map((item) => {
        const sourceRaw = String(item.source || item.type || "").trim().toLowerCase();
        const source = sourceRaw === "ia" ? SOURCE_CONFIG.ia : SOURCE_CONFIG.asesor;

        return `
          <article class="gd-rec-card ${escapeHtml(source.className)}">
            <header class="gd-rec-head">
              <i class="${escapeHtml(source.iconClass)}"></i>
              <h2 class="gd-rec-title">${escapeHtml(item.title)}</h2>
              <span class="gd-rec-type">${escapeHtml(source.label)}</span>
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
    isAsesor,
    notificationCount: recomendaciones.length,
  });
}

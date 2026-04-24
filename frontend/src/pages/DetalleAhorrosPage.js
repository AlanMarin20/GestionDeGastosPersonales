import { renderDashboardAppLayout } from "../components/dashboard/dashboardAppLayout";
import { escapeHtml } from "../utils/sanitize";

function resolveProgress(ahorro) {
  const meta = Number(ahorro.meta || 0);
  const monto = Number(ahorro.monto || 0);

  if (meta <= 0) {
    return null;
  }

  return Math.min((monto / meta) * 100, 100);
}

export function renderDetalleAhorrosPage({
  profileImage,
  profileName,
  activePath,
  pageTitle,
  pageSubtitle,
  ahorros,
  formatMoney,
}) {
  const content = `
    <article class="gd-card">
      <header class="gd-card-header">
        <h2 class="gd-card-title">Todos los ahorros</h2>
      </header>

      <div class="gd-list">
        ${ahorros
          .map((ahorro) => {
            const progress = resolveProgress(ahorro);
            const hasGoal = progress !== null;

            return `
              <div class="gd-list-item">
                <div class="gd-list-item-main">
                  <p class="gd-list-item-title">${escapeHtml(ahorro.nombre)}</p>
                  <p class="gd-list-item-sub">${hasGoal ? `Meta: ${escapeHtml(formatMoney(ahorro.meta))}` : "Sin meta configurada"}</p>
                </div>
                <div class="gd-list-item-aside">
                  <p class="gd-list-item-amount">${escapeHtml(formatMoney(ahorro.monto))}</p>
                  <p class="gd-list-item-sub">${hasGoal ? `${escapeHtml(progress.toFixed(1))}%` : ""}</p>
                </div>
              </div>
            `;
          })
          .join("")}
      </div>
    </article>
  `;

  return renderDashboardAppLayout({
    activePath,
    pageTitle,
    pageSubtitle,
    content,
    profileImage,
    profileName,
    notificationCount: 3,
  });
}

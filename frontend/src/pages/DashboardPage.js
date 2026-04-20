import { renderDashboardAppLayout } from "../components/dashboard/dashboardAppLayout";
import { normalizeCategoryClass } from "../utils/category";
import { escapeHtml } from "../utils/sanitize";

export function renderDashboardPage({
  profileImage,
  profileName,
  activePath,
  pageTitle,
  pageSubtitle,
  metrics,
  categories,
  recentExpenses,
  formatMoney,
}) {
  const content = `
    <section class="gd-metrics">
      ${metrics
        .map(
          (metric) => `
            <article class="gd-metric-card">
              <p class="gd-metric-label">${escapeHtml(metric.label)}</p>
              <p class="gd-metric-value">${escapeHtml(metric.value)}</p>
              <span class="gd-metric-delta ${metric.trend === "down" ? "gd-delta-down" : "gd-delta-up"}">
                ${escapeHtml(metric.delta)}
              </span>
            </article>
          `,
        )
        .join("")}
    </section>

    <section class="gd-grid-3">
      <article class="gd-card">
        <header class="gd-card-header">
          <h2 class="gd-card-title">Gastos por mes</h2>
          <button type="button" class="gd-card-action" data-nav="/dashboard/reportes">ver reportes</button>
        </header>
        <div class="gd-chart-wrap gd-chart-wrap-monthly">
          <canvas id="dashboardMonthlyBarChart" aria-label="Gastos por mes" role="img"></canvas>
        </div>
      </article>

      <article class="gd-card">
        <header class="gd-card-header">
          <h2 class="gd-card-title">Por categoria</h2>
        </header>
        <div class="gd-chart-wrap gd-chart-wrap-donut">
          <canvas id="dashboardCategoryDonutChart" aria-label="Distribucion por categoria" role="img"></canvas>
        </div>
        <div class="gd-donut-legend">
          ${categories
            .map(
              (category) => `
                <div class="gd-donut-row">
                  <span class="gd-donut-dot" style="background: ${escapeHtml(category.color)}"></span>
                  <span class="gd-donut-label">${escapeHtml(category.label)}</span>
                  <span class="gd-donut-value">${escapeHtml(category.share)}</span>
                </div>
              `,
            )
            .join("")}
        </div>
      </article>
    </section>

    <article class="gd-card">
      <header class="gd-card-header">
        <h2 class="gd-card-title">Ultimos gastos</h2>
        <button type="button" class="gd-card-action" data-nav="/dashboard/gastos">ver todo</button>
      </header>

      <div class="gd-table-wrap">
        <table class="gd-table">
          <thead>
            <tr>
              <th>Comercio</th>
              <th>Categoria</th>
              <th>Fecha</th>
              <th class="gd-right">Monto</th>
            </tr>
          </thead>
          <tbody>
            ${recentExpenses
              .map(
                (expense) => `
                  <tr>
                    <td>${escapeHtml(expense.comercio)}</td>
                    <td>
                      <span class="gd-pill gd-pill-${normalizeCategoryClass(expense.categoria)}">${escapeHtml(expense.categoria)}</span>
                    </td>
                    <td class="gd-muted">${escapeHtml(expense.fechaCorta)}</td>
                    <td class="gd-right">${escapeHtml(formatMoney(expense.monto))}</td>
                  </tr>
                `,
              )
              .join("")}
          </tbody>
        </table>
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

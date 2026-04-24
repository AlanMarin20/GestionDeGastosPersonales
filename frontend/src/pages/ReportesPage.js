import { renderDashboardAppLayout } from "../components/dashboard/dashboardAppLayout";
import { tarjetaValor } from "../components/common/reusablePageComponents";
import { escapeHtml } from "../utils/sanitize";

export function renderReportesPage({
  profileImage,
  profileName,
  activePath,
  pageTitle,
  pageSubtitle,
  metrics,
  evolutionRows,
  merchantRows,
  unusualSpending,
}) {
  const content = `
    <div class="gd-metrics gd-metrics-3">
      ${metrics
        .map(
          (metric) => tarjetaValor({
            title: metric.label,
            value: metric.value,
            delta: metric.delta,
            trend: metric.trend,
            layout: "dashboard-metric",
          }),
        )
        .join("")}
    </div>

    <div class="gd-grid-2">
      <article class="gd-card">
        <div class="gd-card-header">
          <h2 class="gd-card-title">Evolucion de gastos (ultimos 6 meses)</h2>
        </div>
        ${evolutionRows
          .map(
            (row) => `
              <div class="gd-sparkline-row gd-sparkline-row-evolution">
                <span class="gd-spark-label">${escapeHtml(row.label)}</span>
                <span class="gd-spark-bar-wrap gd-spark-bar-wrap-evolution">
                  <span class="gd-spark-bar gd-spark-bar-dynamic gd-spark-bar-evolution" style="--gd-spark-width: ${row.width}%;"></span>
                </span>
                <span class="gd-spark-val">${escapeHtml(row.amount)}</span>
              </div>
            `,
          )
          .join("")}
      </article>

      <article class="gd-card">
        <div class="gd-card-header">
          <h2 class="gd-card-title">Ranking de comercios</h2>
        </div>
        ${merchantRows
          .map(
            (row) => `
              <div class="gd-sparkline-row">
                <span class="gd-spark-label">${escapeHtml(row.label)}</span>
                <span class="gd-spark-bar-wrap">
                  <span class="gd-spark-bar gd-spark-bar-dynamic" style="--gd-spark-width: ${row.width}%;"></span>
                </span>
                <span class="gd-spark-val">${escapeHtml(row.amount)}</span>
              </div>
            `,
          )
          .join("")}
      </article>
    </div>

    <article class="gd-card">
      <div class="gd-card-header">
        <h2 class="gd-card-title">Gastos inusuales detectados por IA</h2>
      </div>

      ${
        unusualSpending.length === 0
          ? `<div class="gd-empty">No se detectaron gastos fuera de patron en este periodo.</div>`
          : unusualSpending
              .map(
                (item, index) => `
                  <div class="gd-alert-strip ${index === 0 ? "err" : "warn"}">
                    <i class="lni ${index === 0 ? "lni-warning" : "lni-bolt-alt"}"></i>
                    <span>${escapeHtml(item)}</span>
                  </div>
                `,
              )
              .join("")
      }
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

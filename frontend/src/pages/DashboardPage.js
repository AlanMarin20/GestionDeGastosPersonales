import { renderDashboardAppLayout } from "../components/dashboard/dashboardAppLayout";
import {
  graficoGastos,
  graficoTorta,
  tarjetaValor,
} from "../components/common/reusablePageComponents";
import { escapeHtml } from "../utils/sanitize";
import { formatMoney } from "../utils/money";

export function renderDashboardPage({
  profileImage,
  profileName,
  activePath,
  pageTitle,
  pageSubtitle,
  metrics,
  recentExpenses,
  insight = "",
}) {
  const recentList = recentExpenses.length === 0
    ? `<p class="gd-muted gd-muted-sm" style="margin:0">Sin movimientos recientes.</p>`
    : `<div class="gd-list">
        ${recentExpenses.map((expense) => {
          const esIngreso = expense.tipo === "ingreso";
          const initials = escapeHtml((expense.comercio || "?").slice(0, 2).toUpperCase());
          return `
            <div class="gd-list-item">
              <div style="display:flex;align-items:center;gap:0.5rem;min-width:0">
                <span class="gd-avatar" style="font-size:0.6rem;flex-shrink:0" aria-hidden="true">${initials}</span>
                <div style="min-width:0">
                  <p class="gd-list-item-title" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(expense.comercio)}</p>
                  <p class="gd-list-item-sub">${escapeHtml(expense.fechaCorta)}</p>
                </div>
              </div>
              <div class="gd-list-item-aside">
                <p class="gd-list-item-amount ${escapeHtml(esIngreso ? "gd-monto-ingreso" : "gd-monto-egreso")}" style="margin:0">${esIngreso ? "+" : "-"}${escapeHtml(formatMoney(expense.monto))}</p>
              </div>
            </div>
          `;
        }).join("")}
      </div>`;

  const content = `
    <section class="gd-metrics gd-metrics-3">
      ${metrics.map((metric) => tarjetaValor({
        title: metric.label,
        value: metric.value,
        delta: metric.delta,
        trend: metric.trend,
        layout: "dashboard-metric",
        dashboardActionMarkup: "",
      })).join("")}
    </section>

    <div class="gd-grid-3">
      <div class="gd-dashboard-charts">
        ${graficoGastos({
          title: "Tendencias de gasto",
          canvasId: "dashboardMonthlyBarChart",
          ariaLabel: "Gastos mensuales",
          height: "200px",
          dashboardStyle: true,
        })}

        ${graficoTorta({
          title: "Por categoría",
          canvasId: "dashboardCategoryDonutChart",
          ariaLabel: "Distribución por categoría",
          height: "180px",
          dashboardStyle: true,
          legendContainerId: "dashboardCategoryLegend",
        })}
      </div>

      <div class="gd-dashboard-aside">
        <article class="gd-card">
          <div class="gd-card-header">
            <h2 class="gd-card-title">Transacciones Recientes</h2>
            <a href="/dashboard/gastos" data-link class="gd-top-btn">Ver todo <i class="lni lni-chevron-right" aria-hidden="true"></i></a>
          </div>
          ${recentList}
        </article>

        ${insight ? `
        <article class="gd-card gd-insight-card">
          <div class="gd-card-header">
            <h2 class="gd-card-title gd-insight-title"><i class="lni lni-bulb" aria-hidden="true"></i> Análisis</h2>
          </div>
          <p class="gd-insight-text">${escapeHtml(insight)}</p>
        </article>` : ""}
      </div>
    </div>
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

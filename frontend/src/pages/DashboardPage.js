import { renderDashboardAppLayout } from "../components/dashboard/dashboardAppLayout";
import { renderExpenseTable } from "../components/dashboard/dashboardExpenseTable";
import { tarjetaValor } from "../components/common/reusablePageComponents";
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
  currentCurrency,
}) {
  const resolveMetricActionMarkup = (metric) => {
    if (metric.id === "monthly-expense") {
      return `
        <button
          type="button"
          class="gd-metric-plus-btn"
          data-nav="/dashboard/cargar"
          aria-label="Ir a cargar gasto"
          title="Cargar gasto"
        >+</button>
      `;
    }

    if (metric.id === "accumulated-savings") {
      return `<button type="button" class="gd-metric-link-btn" data-nav="/dashboard/ahorros">Ver mas...</button>`;
    }

    if (metric.id === "net-income") {
      return `
        <div class="gd-income-entry-menu">
          <button
            type="button"
            class="gd-metric-plus-btn"
            data-action="toggle-income-entry-menu"
            aria-expanded="false"
            aria-label="Agregar ingreso"
          >+</button>
          <section class="gd-income-entry-dropdown" aria-label="Nuevo ingreso">
            <label class="gd-income-entry-label" for="incomeCurrencySelect">Moneda</label>
            <select id="incomeCurrencySelect" class="gd-income-entry-input" data-income-field="currency">
              <option value="USD" ${currentCurrency === "USD" ? "selected" : ""}>USD</option>
              <option value="ARS" ${currentCurrency === "ARS" ? "selected" : ""}>ARS</option>
              <option value="EUR" ${currentCurrency === "EUR" ? "selected" : ""}>EUR</option>
            </select>

            <label class="gd-income-entry-label" for="incomeAmountInput">Monto</label>
            <input id="incomeAmountInput" type="number" min="0" step="0.01" class="gd-income-entry-input" data-income-field="amount" placeholder="0.00">

            <label class="gd-income-entry-label" for="incomeDetailInput">Detalle</label>
            <input id="incomeDetailInput" type="text" class="gd-income-entry-input" data-income-field="detail" placeholder="Ej: prestamo, bono, ajuste">

            <button type="button" class="gd-income-entry-submit" data-action="submit-income-entry">Aceptar</button>
          </section>
        </div>
      `;
    }

    return "";
  };

  const content = `
    <section class="gd-metrics">
      ${metrics
        .map(
          (metric) => tarjetaValor({
            title: metric.label,
            value: metric.value,
            delta: metric.delta,
            trend: metric.trend,
            layout: "dashboard-metric",
            dashboardActionMarkup: resolveMetricActionMarkup(metric),
          }),
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
                  <span class="gd-donut-dot gd-donut-dot-dynamic" style="--gd-dot-color: ${escapeHtml(category.color)}"></span>
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

      ${renderExpenseTable({
        expenses: recentExpenses,
        formatMoney,
      })}
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

import { renderDashboardAppLayout } from "../components/dashboard/dashboardAppLayout";
import {
  graficoGastos,
  graficoTorta,
  renderDashboardExpenseCard,
  tarjetaValor,
} from "../components/common/reusablePageComponents";

export function renderDashboardPage({
  profileImage,
  profileName,
  activePath,
  pageTitle,
  pageSubtitle,
  metrics,
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
      return `<button type="button" class="gd-metric-link-btn" data-nav="/dashboard/ahorros">Ver detalle</button>`;
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
      ${graficoGastos({
        title: "Gastos por mes",
        canvasId: "dashboardMonthlyBarChart",
        ariaLabel: "Gastos por mes",
        height: "220px",
        dashboardStyle: true,
        headerActionMarkup: `<button type="button" class="gd-card-action" data-nav="/dashboard/reportes">ver reportes</button>`,
      })}

      ${graficoTorta({
        title: "Por categoria",
        canvasId: "dashboardCategoryDonutChart",
        ariaLabel: "Distribucion por categoria",
        height: "220px",
        dashboardStyle: true,
      })}
    </section>

    ${renderDashboardExpenseCard({
      title: "Ultimos gastos",
      actionHref: "/dashboard/gastos",
      actionText: "ver todo",
      expenses: recentExpenses,
      formatMoney,
    })}
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

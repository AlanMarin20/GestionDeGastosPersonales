import { renderDashboardAppLayout } from "../components/dashboard/dashboardAppLayout";
import { tarjetaValor, graficoGastos, graficoTorta } from "../components/common/reusablePageComponents";
import { escapeHtml } from "../utils/sanitize";

const INSIGHT_ICONS = {
  up: "lni lni-arrow-up",
  down: "lni lni-arrow-down",
  neutral: "lni lni-minus",
};

function renderMerchantRanking(merchantRanking) {
  if (!merchantRanking.length) {
    return `<p class="gd-muted" style="font-size:0.75rem;">Sin datos de comercios este mes.</p>`;
  }

  return merchantRanking.map((item) => `
    <div class="gd-rank-row">
      <span class="gd-rank-label" title="${escapeHtml(item.label)}">${escapeHtml(item.label)}</span>
      <div class="gd-rank-bar-wrap" aria-hidden="true">
        <div class="gd-rank-bar" style="width: ${escapeHtml(String(item.width))}%"></div>
      </div>
      <span class="gd-rank-amount">${escapeHtml(item.amount)}</span>
    </div>
  `).join("");
}

function renderUnusualSpending(unusualMessages) {
  if (!unusualMessages.length) {
    return `
      <div class="gd-unusual-empty">
        <i class="lni lni-checkmark-circle gd-unusual-empty-icon" aria-hidden="true"></i>
        <p>Sin gastos inusuales este periodo</p>
      </div>
    `;
  }

  return unusualMessages.map((msg) => `
    <div class="gd-unusual-item">
      <i class="lni lni-warning gd-unusual-icon" aria-hidden="true"></i>
      <p class="gd-unusual-text">${escapeHtml(msg)}</p>
    </div>
  `).join("");
}


function renderEvolutionRows(evolutionRows) {
  if (!evolutionRows.length) {
    return `<p class="gd-muted" style="font-size:0.75rem;">Sin historial de gastos.</p>`;
  }

  const maxWidth = Math.max(...evolutionRows.map((r) => r.width));

  return evolutionRows.map((row, index) => {
    const isLatest = index === evolutionRows.length - 1;
    return `
      <div class="gd-evol-row ${isLatest ? "gd-evol-row-current" : ""}">
        <span class="gd-evol-label">${escapeHtml(row.label)}</span>
        <div class="gd-evol-bar-wrap" aria-hidden="true">
          <div class="gd-evol-bar ${isLatest ? "gd-evol-bar-current" : ""}"
               style="width: ${escapeHtml(String(maxWidth > 0 ? (row.width / maxWidth) * 100 : 8))}%">
          </div>
        </div>
        <span class="gd-evol-amount ${isLatest ? "gd-evol-amount-current" : ""}">${escapeHtml(row.amount)}</span>
      </div>
    `;
  }).join("");
}

export function renderPatronesPage({
  profileImage,
  profileName,
  activePath,
  pageTitle,
  pageSubtitle,
  metrics,
  categorySummary,
  merchantRanking,
  unusualMessages,
  evolutionRows,
}) {
  const content = `
    <section class="gd-metrics" aria-label="Metricas de patrones">
      ${metrics.map((metric) => tarjetaValor({
        title: metric.label,
        value: metric.value,
        delta: metric.delta,
        trend: metric.trend,
        layout: "dashboard-metric",
      })).join("")}
    </section>

    <section class="gd-grid-3" aria-label="Graficos de analisis">
      ${graficoGastos({
        title: "Evolucion mensual",
        canvasId: "patronesBarChart",
        ariaLabel: "Evolucion mensual del gasto",
        height: "220px",
        dashboardStyle: true,
      })}

      ${graficoTorta({
        title: "Por categoria",
        canvasId: "patronesCategoryDonut",
        ariaLabel: "Distribucion de gastos por categoria",
        height: "220px",
        dashboardStyle: true,
        legendContainerId: "patronesCategoryLegend",
      })}
    </section>

    <section class="gd-grid-2" aria-label="Detalle de patrones">
      <div class="gd-card">
        <div class="gd-card-header">
          <h3 class="gd-card-title">Evolucion historica</h3>
          <span class="gd-rec-tag">ultimos meses</span>
        </div>
        ${renderEvolutionRows(evolutionRows)}
      </div>

      <div class="gd-card">
        <div class="gd-card-header">
          <h3 class="gd-card-title">Comercios principales</h3>
          <span class="gd-rec-tag">este mes</span>
        </div>
        ${renderMerchantRanking(merchantRanking)}
      </div>
    </section>

    <div class="gd-card">
      <div class="gd-card-header">
        <h3 class="gd-card-title">Gastos inusuales detectados</h3>
        <span class="gd-rec-tag gd-unusual-count-tag">
          <i class="lni lni-warning" aria-hidden="true"></i>
          ${escapeHtml(String(unusualMessages.length))} detectado${unusualMessages.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div class="gd-unusual-list">
        ${renderUnusualSpending(unusualMessages)}
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
  });
}

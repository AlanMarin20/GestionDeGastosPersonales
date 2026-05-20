import { renderDashboardAppLayout } from "../components/dashboard/dashboardAppLayout";
import { tarjetaValor, graficoGastos, graficoTorta } from "../components/common/reusablePageComponents";
import { escapeHtml } from "../utils/sanitize";
import { formatMoney } from "../utils/money";
import { t } from '../i18n';

function renderMerchantRanking(merchantRanking) {
  if (!merchantRanking.length) {
    return `
      <div class="gd-patron-empty">
        <i class="lni lni-store" aria-hidden="true"></i>
        <p>${t('patrones.noMerchantSpending')}</p>
      </div>
    `;
  }

  const posClass = (i) => i === 0 ? "first" : i < 3 ? "top" : "rest";

  return merchantRanking.map((item, index) => `
    <div class="gd-rank-row">
      <span class="gd-rank-pos gd-rank-pos--${posClass(index)}" aria-hidden="true">${index + 1}</span>
      <span class="gd-rank-label" title="${escapeHtml(item.label)}">${escapeHtml(item.label)}</span>
      <div class="gd-rank-bar-wrap" aria-hidden="true">
        <div class="gd-rank-bar${index === 0 ? " gd-rank-bar--top" : ""}" style="width:${escapeHtml(String(item.width))}%"></div>
      </div>
      <span class="gd-rank-amount">${escapeHtml(item.amount)}</span>
      ${item.pct ? `<span class="gd-rank-pct">${item.pct}%</span>` : ""}
    </div>
  `).join("");
}

function renderUnusualSpending(unusualItems) {
  if (!unusualItems.length) {
    return `
      <div class="gd-unusual-empty">
        <i class="lni lni-checkmark-circle gd-unusual-empty-icon" aria-hidden="true"></i>
        <p>${t('patrones.noUnusualSpending')}</p>
      </div>
    `;
  }

  return unusualItems.map((item) => {
    const isCritical = item.ratio >= 2.5;
    const severity = isCritical ? "critical" : "warning";
    const ratioLabel = `${item.ratio.toFixed(1)}x`;
    const excess = item.amount - item.historicalAvg;
    return `
      <div class="gd-unusual-card gd-unusual-card--${severity}">
        <div class="gd-unusual-card-head">
          <span class="gd-unusual-category">${escapeHtml(item.category)}</span>
          <span class="gd-unusual-ratio gd-unusual-ratio--${severity}">${t('patrones.ratioOverAverage', { ratio: ratioLabel })}</span>
        </div>
        <div class="gd-unusual-compare">
          <span class="gd-unusual-amount">${escapeHtml(formatMoney(item.amount))}</span>
          <span class="gd-unusual-vs">${t('patrones.vsAverage', { amount: escapeHtml(formatMoney(item.historicalAvg)), excess: escapeHtml(formatMoney(excess)) })}</span>
        </div>
        ${item.comercio ? `<p class="gd-unusual-merchant"><i class="lni lni-map-marker" aria-hidden="true"></i> ${escapeHtml(item.comercio)}</p>` : ""}
      </div>
    `;
  }).join("");
}

function renderEvolutionRows(evolutionRows) {
  if (!evolutionRows.length) {
    return `
      <div class="gd-patron-empty">
        <i class="lni lni-calendar" aria-hidden="true"></i>
        <p>${t('patrones.noExpenseHistory')}</p>
      </div>
    `;
  }

  const maxWidth = Math.max(...evolutionRows.map((r) => r.width));

  return evolutionRows.map((row, index) => {
    const isLatest = index === evolutionRows.length - 1;
    return `
      <div class="gd-evol-row ${isLatest ? "gd-evol-row-current" : ""}">
        <span class="gd-evol-label">${escapeHtml(row.label)}</span>
        <div class="gd-evol-bar-wrap" aria-hidden="true">
          <div class="gd-evol-bar ${isLatest ? "gd-evol-bar-current" : ""}"
               style="width:${escapeHtml(String(maxWidth > 0 ? (row.width / maxWidth) * 100 : 8))}%">
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
  const unusualCount = unusualMessages.length;
  const unusualCountLabel = unusualCount !== 1
    ? t('patrones.detectedCount', { count: unusualCount })
    : t('patrones.detectedCountOne', { count: unusualCount });

  const content = `
    <section class="gd-metrics gd-metrics-3" aria-label="${t('patrones.metricsLabel')}">
      ${metrics.map((metric) => tarjetaValor({
        title: metric.label,
        value: metric.value,
        delta: metric.delta,
        trend: metric.trend,
        layout: "dashboard-metric",
        metricId: metric.id || "",
      })).join("")}
    </section>

    <section class="gd-grid-3" aria-label="${t('patrones.chartsLabel')}">
      ${graficoGastos({
        title: t('patrones.monthlyEvolution'),
        canvasId: "patronesBarChart",
        ariaLabel: t('patrones.monthlyEvolutionAria'),
        height: "220px",
        dashboardStyle: true,
      })}

      ${graficoTorta({
        title: t('patrones.byCategory'),
        canvasId: "patronesCategoryDonut",
        ariaLabel: t('patrones.categoryDistributionAria'),
        height: "220px",
        dashboardStyle: true,
        legendContainerId: "patronesCategoryLegend",
      })}
    </section>

    <section class="gd-grid-2" aria-label="${t('patrones.detailLabel')}">
      <div class="gd-card">
        <div class="gd-card-header">
          <h3 class="gd-card-title">
            <i class="lni lni-calendar gd-card-title-icon" aria-hidden="true"></i>
            ${t('patrones.historicalEvolution')}
          </h3>
          <span class="gd-rec-tag">${t('patrones.lastMonths')}</span>
        </div>
        ${renderEvolutionRows(evolutionRows)}
      </div>

      <div class="gd-card">
        <div class="gd-card-header">
          <h3 class="gd-card-title">
            <i class="lni lni-store gd-card-title-icon" aria-hidden="true"></i>
            ${t('patrones.topMerchants')}
          </h3>
          <span class="gd-rec-tag">${t('patrones.expensesThisMonth')}</span>
        </div>
        ${renderMerchantRanking(merchantRanking)}
      </div>
    </section>

    <div class="gd-card">
      <div class="gd-card-header">
        <h3 class="gd-card-title">
          <i class="lni lni-warning gd-card-title-icon${unusualCount > 0 ? " gd-card-title-icon--warn" : ""}" aria-hidden="true"></i>
          ${t('patrones.unusualExpensesDetected')}
        </h3>
        <span class="gd-rec-tag${unusualCount > 0 ? " gd-unusual-count-tag" : ""}">
          ${unusualCount > 0 ? `<i class="lni lni-warning" aria-hidden="true"></i> ` : ""}${escapeHtml(unusualCountLabel)}
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

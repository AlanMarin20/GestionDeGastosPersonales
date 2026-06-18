import { renderDashboardAppLayout } from "../components/dashboard/dashboardAppLayout";
import {
  graficoGastos,
  graficoTorta,
  enlaceVerTodo,
  tarjetaValor,
} from "../components/common/reusablePageComponents";
import { escapeHtml } from "../utils/sanitize";
import { formatMoney } from "../utils/money";
import { t } from "../i18n";
import { getDashboardBalanceData } from "../data/finanzas";

function formatRecommendationDate(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";

  const date = new Date(`${raw}T00:00:00`);
  if (Number.isNaN(date.getTime())) return raw;

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatTruncatedPercentage(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return "0";

  const truncatedValue = Math.trunc(numericValue * 100) / 100;
  return truncatedValue.toFixed(2).replace(/\.00$/, "").replace(/(\.\d*[1-9])0$/, "$1");
}
function mapMovimientoToRow(movimiento) {
  return {
    comercio: movimiento.comercio ?? "-",
    categoria: movimiento.categoria ?? "Otros",
    fechaCorta: movimiento.fecha ?? "-",
    monto: movimiento.monto ?? 0,
    descripcion: movimiento.descripcion ?? "",
    tipo: movimiento.tipo ?? "egreso",
  };
}
const NOTIF_ICON = {
  info: "lni-bulb",
  warning: "lni-warning",
  danger: "lni-shield",
  success: "lni-checkmark-circle",
};

function renderNotifItem(item) {
  const type = item.type || "info";
  const icon = item.icon || NOTIF_ICON[type] || "lni-bulb";
  return `
    <div class="gd-notif-item">
      <span class="gd-notif-icon gd-notif-icon--${escapeHtml(type)}" aria-hidden="true">
        <i class="lni ${escapeHtml(icon)}"></i>
      </span>
      <div class="gd-notif-body-wrap">
        <p class="gd-notif-title">${escapeHtml(item.title || "")}</p>
        <p class="gd-notif-body">${escapeHtml(item.body || "")}</p>
      </div>
    </div>
  `;
}

function renderRecentItem(expense) {
  const esIngreso = expense.tipo === "ingreso";
  const esAhorro = expense.esTransferenciaInterna === true;
  const displayName = expense.comercio || "-";
  const initials = escapeHtml((displayName || "?").slice(0, 2).toUpperCase());
  const amountClass = esAhorro ? "" : (esIngreso ? "gd-monto-ingreso" : "gd-monto-egreso");
  const amountSign = esIngreso ? "+" : "-";
  const tipoBadge = esAhorro
    ? `<span class="gd-tipo-badge gd-tipo-badge--ahorro">${t('common.saving')}</span>`
    : esIngreso
      ? `<span class="gd-tipo-badge gd-tipo-badge--in">${t('common.income')}</span>`
      : `<span class="gd-tipo-badge gd-tipo-badge--out">${t('common.expense')}</span>`;

  return `
    <div class="gd-list-item gd-list-item--compact">
      <div style="display:flex;align-items:center;gap:0.5rem;min-width:0">
        <span class="gd-avatar gd-avatar--${escapeHtml(esIngreso ? "in" : "out")}" style="font-size:0.6rem;flex-shrink:0" aria-hidden="true">${initials}</span>
        <div style="min-width:0">
          <p class="gd-list-item-title" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(displayName)}</p>
          <p class="gd-list-item-sub">${escapeHtml(expense.fechaCorta)} · ${escapeHtml(expense.categoria || t('common.noCategory'))}</p>
        </div>
      </div>
      <div class="gd-list-item-aside">
        <p class="gd-list-item-amount ${amountClass}" style="margin:0">${amountSign}${escapeHtml(formatMoney(expense.monto))}</p>
        ${tipoBadge}
      </div>
    </div>
  `;
}

export function renderDashboardPage({
  profileImage,
  profileName,
  activePath,
  pageTitle,
  pageSubtitle,
  metrics,
  recentExpenses,
  insights = [],
  latestRecommendation = null,
}) {
  const { ingreso, egreso } = getDashboardBalanceData();
  const porcentajeGastado = ingreso > 0 ? Math.min((egreso / ingreso) * 100, 100) : 0;

  const recentList = recentExpenses.length === 0
    ? `<p class="gd-muted gd-muted-sm" style="margin:0">${t('dashboard.noRecentMovements')}</p>`
    : `<div class="gd-list" style="${recentExpenses.length > 4 ? 'max-height: 360px; overflow-y: auto; padding-right: 6px;' : ''}">${recentExpenses.map(renderRecentItem).join("")}</div>`;

  const notifList = insights.length === 0
    ? `<p class="gd-muted gd-muted-sm" style="margin:0">${t('dashboard.noSuggestions')}</p>`
    : `<div class="gd-notif-list">${insights.map(renderNotifItem).join("")}</div>`;

  const latestRecommendationBlock = latestRecommendation
    ? `
      <div class="gd-notif-item" style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid rgba(148, 163, 184, 0.18);">
        <span class="gd-notif-icon gd-notif-icon--info" aria-hidden="true">
          <i class="lni lni-envelope"></i>
        </span>
        <div class="gd-notif-body-wrap">
          <p class="gd-notif-title" style="margin-bottom: 0.35rem;">${escapeHtml(latestRecommendation.title || "Sin título")}${latestRecommendation.date ? ` | ${escapeHtml(formatRecommendationDate(latestRecommendation.date))}` : ""}</p>
          <p class="gd-notif-body" style="margin:0;">${escapeHtml(latestRecommendation.body || "")}</p>
        </div>
      </div>
    `
    : "";

  const content = `
    <section class="gd-metrics gd-metrics-3">
      ${metrics.map((metric) => tarjetaValor({
        title: metric.label,
        value: metric.value,
        delta: metric.delta,
        trend: metric.trend,
        layout: "dashboard-metric",
        metricId: metric.id,
        dashboardActionMarkup: "",
      })).join("")}
    </section>

    <div class="gd-grid-3">
      <div class="gd-dashboard-charts">
        ${graficoGastos({
          title: t('cliente.expensesByMonth'),
          canvasId: "dashboardMonthlyBarChart",
          ariaLabel: t('cliente.expensesByMonthAria'),
          height: "200px",
          dashboardStyle: true,
        })}

        ${graficoTorta({
          title: "",
          canvasId: "dashboardCategoryDonutChart",
          ariaLabel: t('dashboard.categoryDistribution'),
          height: "180px",
          dashboardStyle: true,
          cardClass: "gd-dashboard-pie-card",
          legendContainerId: "dashboardCategoryLegend",
          centerValue: `${formatTruncatedPercentage(porcentajeGastado)}%`,
          centerLabel: t('cliente.spent'),
        })}
      </div>

      <div class="gd-dashboard-aside">
        <article class="gd-card">
          <div class="gd-card-header">
            <h2 class="gd-card-title">${t('dashboard.recentTransactions')}</h2>
            ${enlaceVerTodo({ href: '/dashboard/gastos' })}
          </div>
          ${recentList}
        </article>

        <article class="gd-card gd-notif-card">
          <div class="gd-card-header">
            <h2 class="gd-card-title gd-notif-card-title">
              <i class="lni lni-bolt-alt" aria-hidden="true"></i>
              ${t('dashboard.analysisTitle')}
            </h2>
            ${enlaceVerTodo({ href: '/dashboard/recomendaciones' })}
          </div>
          ${notifList}
          ${latestRecommendationBlock}
        </article>
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

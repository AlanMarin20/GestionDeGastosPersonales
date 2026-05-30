import { renderDashboardAppLayout } from "../components/dashboard/dashboardAppLayout";
import {
  contenedorRecomendaciones,
  graficoGastos,
  graficoTorta,
  enlaceVerTodo,
  renderClientBanner,
  renderDashboardExpenseCard,
  tarjetaValor,
} from "../components/common/reusablePageComponents";
import { escapeHtml } from "../utils/sanitize";
import { t } from '../i18n';

const RISK_CONFIG = {
  low: {
    labelKey: 'asesor.riskLow',
    className: 'gd-risk-low',
    bannerStart: 'rgba(22, 163, 74, 0.34)',
    bannerEnd: 'rgba(21, 128, 61, 0.92)',
    bannerBorder: '#16a34a',
    bannerAccent: '#16a34a',
    bannerLabel: '#bbf7d0',
  },
  medium: {
    labelKey: 'asesor.riskMedium',
    className: 'gd-risk-medium',
    bannerStart: 'rgba(202, 138, 4, 0.34)',
    bannerEnd: 'rgba(146, 64, 14, 0.92)',
    bannerBorder: '#ca8a04',
    bannerAccent: '#ca8a04',
    bannerLabel: '#fde68a',
  },
  high: {
    labelKey: 'asesor.riskHigh',
    className: 'gd-risk-high',
    bannerStart: 'rgba(220, 38, 38, 0.34)',
    bannerEnd: 'rgba(127, 29, 29, 0.92)',
    bannerBorder: '#dc2626',
    bannerAccent: '#dc2626',
    bannerLabel: '#fecaca',
  },
};

function getClientRisk(cliente) {
  const presupuesto = Number(cliente.presupuesto ?? 0);
  const gastadoMes = Number(cliente.gastadoMes ?? 0);
  const ratio = presupuesto > 0 ? (gastadoMes / presupuesto) * 100 : 0;

  if (ratio >= 95) return RISK_CONFIG.high;
  if (ratio > 90) return RISK_CONFIG.medium;
  return RISK_CONFIG.low;
}

function formatTruncatedPercentage(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return '0';

  const truncatedValue = Math.trunc(numericValue * 100) / 100;
  return truncatedValue.toFixed(2).replace(/\.00$/, '').replace(/(\.\d*[1-9])0$/, '$1');
}

export function resolveDetalleCliente(pathname, state) {
  const match = pathname.match(/^\/cliente\/([^/]+)(?:\/(?:gastos|recomendaciones\/historicas))?$/);
  if (!match) {
    return null;
  }

  const encodedClienteId = match[1];
  let clienteId = encodedClienteId;

  try {
    clienteId = decodeURIComponent(encodedClienteId);
  } catch {
    clienteId = encodedClienteId;
  }

  const clienteAsesor = state.asesor.clientes.find((item) => {
    const itemId = item?.id ?? item?.userId ?? item?.usuarioId;
    return String(itemId) === clienteId;
  });

  if (!clienteAsesor) {
    return null;
  }

  const presupuestoValue = Number(clienteAsesor.presupuesto ?? clienteAsesor.budget ?? 0);
  const gastadoMesValue = Number(clienteAsesor.gastosMes ?? clienteAsesor.monthlySpend ?? 0);
  const ahorrosValue = Number(clienteAsesor.ahorros ?? clienteAsesor.totalAhorro ?? clienteAsesor.savings ?? 0);
  const saldoActualValue = Number(clienteAsesor.saldoActualMes ?? clienteAsesor.saldoActual ?? 0);

  const presupuesto = Number.isFinite(presupuestoValue) && presupuestoValue >= 0
    ? presupuestoValue
    : 0;
  const gastadoMes = Number.isFinite(gastadoMesValue) && gastadoMesValue >= 0
    ? gastadoMesValue
    : 0;
  const ahorros = Number.isFinite(ahorrosValue) && ahorrosValue >= 0
    ? ahorrosValue
    : 0;
  const saldoActual = Number.isFinite(saldoActualValue)
    ? saldoActualValue
    : Math.max(presupuesto - gastadoMes, 0);

  return {
    id: clienteId,
    nombre: String(clienteAsesor.nombre ?? clienteAsesor.name ?? t('cliente.defaultName')),
    presupuesto,
    saldoActual,
    gastadoMes,
    ahorros,
  };
}

function mapGastoClienteToRow(gasto) {
  return {
    comercio: gasto.comercio ?? "-",
    categoria: gasto.categoria ?? "Otros",
    fechaCorta: gasto.fecha ?? "-",
    monto: gasto.monto ?? 0,
    descripcion: gasto.descripcion ?? "",
    tipo: gasto.tipo ?? "egreso",
  };
}

function renderDetalleClienteGastosPage({ cliente, detalle, formatCurrency, profileImage, profileName, risk }) {
  const detalleHref = `/cliente/${encodeURIComponent(String(cliente.id))}`;
  const gastosHref = `${detalleHref}/gastos`;
  const porcentajeGastado = cliente.presupuesto > 0
    ? Math.min((cliente.gastadoMes / cliente.presupuesto) * 100, 100)
    : 0;

  return renderDashboardAppLayout({
    activePath: gastosHref,
    pageTitle: t('cliente.movementsOf', { name: cliente.nombre }),
    pageSubtitle: t('cliente.movementsSubtitle'),
    content: `
      ${renderClientBanner({
        clienteName: cliente.nombre,
        risk,
        backHref: detalleHref,
        backLabel: 'Volver',
      })}
      <section class="gd-metrics gd-metrics-2 mb-4">
        ${[
          {
            title: t('cliente.quickSummary'),
            value: "",
            delta: "",
            dashboardActionMarkup: `<a href="/cliente/${escapeHtml(encodeURIComponent(String(cliente.id)))}" data-link class="gd-metric-link-btn">${t('cliente.backToDetail')}</a>`,
            dashboardExtraMarkup: `
              <div class="d-flex flex-column gap-1 mt-2">
                <div class="d-flex justify-content-between gap-2"><span class="gd-muted">${t('cliente.income')}</span><strong>${escapeHtml(formatCurrency(cliente.presupuesto))}</strong></div>
                <div class="d-flex justify-content-between gap-2"><span class="gd-muted">${t('cliente.expenses')}</span><strong>${escapeHtml(formatCurrency(cliente.gastadoMes))}</strong></div>
                <div class="d-flex justify-content-between gap-2"><span class="gd-muted">${t('cliente.savings')}</span><strong>${escapeHtml(formatCurrency(cliente.ahorros))}</strong></div>
              </div>
            `,
          },
          {
            title: t('cliente.spent'),
            value: `${Math.round(porcentajeGastado)}%`,
            delta: t('cliente.spentOf', { spent: formatCurrency(cliente.gastadoMes), budget: formatCurrency(cliente.presupuesto) }),
            dashboardExtraMarkup: `
              <div class="mt-2">
                <div class="progress" style="height: 8px; border-radius: 999px; background: rgba(148, 163, 184, 0.18);">
                  <div class="progress-bar bg-warning" role="progressbar" style="width: ${Math.min(porcentajeGastado, 100)}%; border-radius: 999px;" aria-valuenow="${Math.round(porcentajeGastado)}" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
              </div>
            `,
            trend: porcentajeGastado >= 95 ? "down" : porcentajeGastado >= 65 ? "warn" : "up",
          },
        ]
          .map((metric) => tarjetaValor({
            title: metric.title,
            value: metric.value,
            delta: metric.delta,
            trend: metric.trend,
            layout: "dashboard-metric",
            dashboardActionMarkup: metric.dashboardActionMarkup,
            dashboardExtraMarkup: metric.dashboardExtraMarkup,
          }))
          .join("")}
      </section>

      ${renderDashboardExpenseCard({
        title: t('cliente.allMovements'),
        expenses: detalle.gastos,
        formatMoney: formatCurrency,
        emptyMessage: t('cliente.noClientMovements'),
        rowMapper: mapGastoClienteToRow,
      })}
    `,
    profileImage,
    profileName,
    isAsesor: true,
  });
}

export function renderDetalleClientePage({
  pathname,
  state,
  formatCurrency,
  profileImage,
  profileName,
}) {
  const cliente = resolveDetalleCliente(pathname, state);
  if (!cliente) {
    return "";
  }

  const detalle = state.detalleCliente;
  const presupuestoDisponible = cliente.presupuesto;
  const risk = getClientRisk(cliente);
  const porcentajeGastado = cliente.presupuesto > 0
    ? Math.min((cliente.gastadoMes / cliente.presupuesto) * 100, 100)
    : 0;

  if (pathname.endsWith("/gastos")) {
    return renderDetalleClienteGastosPage({
      cliente,
      detalle,
      formatCurrency,
      profileImage,
      profileName,
      risk,
    });
  }

  const detalleHref = `/cliente/${encodeURIComponent(String(cliente.id))}`;
  const gastosHref = `${detalleHref}/gastos`;

  return renderDashboardAppLayout({
    activePath: detalleHref,
    pageTitle: t('cliente.pageTitle', { name: cliente.nombre }),
    pageSubtitle: t('cliente.pageSubtitle'),
    content: `
      ${renderClientBanner({
        clienteName: cliente.nombre,
        risk,
        backHref: '/dashboard/asesor',
      })}
      <section class="gd-metrics">
        ${[
          {
            title: t('cliente.currentBalance'),
            value: formatCurrency(cliente.saldoActual),
            delta: t('cliente.availableToday'),
            color: "primary",
            icon: "lni-wallet",
          },
          {
            title: t('cliente.monthExpenses'),
            value: formatCurrency(cliente.gastadoMes),
            delta: t('cliente.accumulatedPeriod'),
            color: "danger",
            icon: "lni-stats-down",
          },
          {
            title: t('cliente.totalBudget'),
            value: formatCurrency(presupuestoDisponible),
            delta: t('cliente.monthlyCap'),
            color: "success",
            icon: "lni-coin",
          },
          {
            title: t('cliente.totalSaved'),
            value: formatCurrency(cliente.ahorros),
            delta: t('cliente.accumulatedSaving'),
            color: "info",
            icon: "lni-wallet",
          },
        ]
          .map((metric) => tarjetaValor({
            title: metric.title,
            value: metric.value,
            delta: metric.delta,
            color: metric.color,
            icon: metric.icon,
            layout: "dashboard-metric",
          }))
          .join("")}
      </section>

      <section class="gd-grid-3">
        ${graficoGastos({
          title: t('cliente.expensesByMonth'),
          canvasId: "detalleMonthlyBarChart",
          ariaLabel: t('cliente.expensesByMonthAria'),
          height: "220px",
          dashboardStyle: true,
        })}

        ${graficoTorta({
          title: t('cliente.byCategory'),
          canvasId: "detallePieChart",
          ariaLabel: t('cliente.categoryDistributionAria'),
          height: "220px",
          dashboardStyle: true,
          centerValue: `${formatTruncatedPercentage(porcentajeGastado)}%`,
          centerLabel: t('cliente.spent'),
        })}
      </section>

      <section class="w-100">
        ${renderDashboardExpenseCard({
          title: t('cliente.lastMovements'),
          actionHref: gastosHref,
          actionText: t('cliente.viewAll'),
          expenses: detalle.gastos,
          formatMoney: formatCurrency,
          rowMapper: mapGastoClienteToRow,
          emptyMessage: t('cliente.noRecentExpenses'),
          showTipo: true,
          showDescription: true,
          columnLayout: 'client-detail',
        })}
      </section>

      <section id="recomendaciones-historicas" class="row g-2 g-md-2 mt-2 mb-2">
        <div class="col-12 col-lg-6">
          <div class="gd-card gd-client-detail-fixed-card">
            <div class="card-body p-0 gd-client-recommend-form-body">
              <h5 class="card-title mb-2">${t('cliente.addRecommendationFor', { name: escapeHtml(cliente.nombre) })}</h5>
              <form id="agregarRecomendacionForm" class="gd-client-recommend-form">
                <div class="mb-2">
                  <input
                    class="form-control"
                    id="recomendacionTitulo"
                    type="text"
                    maxlength="60"
                    placeholder="${t('cliente.recommendationTitle')}"
                    value="${escapeHtml(detalle.nuevaRecomendacionTitulo || "")}"
                    required
                  >
                </div>
                <div class="mb-2 gd-client-recommend-input-wrap">
                  <textarea class="form-control" id="recomendacionTexto" rows="3" placeholder="${t('cliente.recommendationPlaceholder')}" required>${escapeHtml(detalle.nuevaRecomendacionTexto || "")}</textarea>
                </div>
                <button type="submit" class="btn btn-primary w-100 btn-sm">${t('cliente.sendRecommendation')}</button>
              </form>
            </div>
          </div>
        </div>

        <div class="col-12 col-lg-6">
          ${contenedorRecomendaciones({
            title: t('cliente.sentRecommendations'),
            recommendations: detalle.recomendaciones,
            emptyText: t('cliente.noRecommendationsYet'),
            cardClass: "gd-client-detail-fixed-card",
            itemClassName: "gd-rec-advisory-item--client",
            maxHeight: "100%",
            bodyStyle: "height: 100%; padding: 0;",
            headerActionMarkup: enlaceVerTodo({ href: "/dashboard/asesor/recomendaciones" }),
          })}
        </div>
      </section>
    `,
    profileImage,
    profileName,
    isAsesor: true,
  });
}

import { renderDashboardAppLayout } from "../components/dashboard/dashboardAppLayout";
import {
  contenedorRecomendaciones,
  graficoGastos,
  graficoTorta,
  renderDashboardExpenseCard,
  tarjetaValor,
} from "../components/common/reusablePageComponents";
import { escapeHtml } from "../utils/sanitize";

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

  const presupuesto = Number.isFinite(presupuestoValue) && presupuestoValue >= 0
    ? presupuestoValue
    : 0;
  const gastadoMes = Number.isFinite(gastadoMesValue) && gastadoMesValue >= 0
    ? gastadoMesValue
    : 0;
  const ahorros = Number.isFinite(ahorrosValue) && ahorrosValue >= 0
    ? ahorrosValue
    : 0;
  const saldoActual = Math.max(presupuesto - gastadoMes, 0);

  return {
    id: clienteId,
    nombre: String(clienteAsesor.nombre ?? clienteAsesor.name ?? "Cliente"),
    presupuesto,
    saldoActual,
    gastadoMes,
    ahorros,
  };
}

function mapGastoClienteToRow(gasto) {
  return {
    comercio: gasto.descripcion ?? "-",
    categoria: gasto.categoria ?? "Otros",
    fechaCorta: gasto.fecha ?? "-",
    monto: gasto.monto ?? 0,
    descripcion: gasto.descripcion ?? "",
  };
}

function buildDetalleClienteSidebarSections({ clienteId }) {
  const detalleHref = `/cliente/${encodeURIComponent(String(clienteId))}`;
  const recomendacionesHref = `${detalleHref}/recomendaciones/historicas`;
  const gastosHref = `${detalleHref}/gastos`;

  return [
    {
      section: "Principal",
      items: [
        {
          href: "/dashboard",
          label: "Mi Dashboard",
          icon: "lni lni-grid-alt",
        },
        {
          href: detalleHref,
          label: "Dashboard Cliente",
          icon: "lni lni-user",
        },
      ],
    },
    {
      section: "Analisis",
      items: [
        {
          href: recomendacionesHref,
          label: "Recomendaciones historicas",
          icon: "lni lni-bulb",
        },
      ],
    },
    {
      section: "Asesor",
      items: [
        {
          href: "/dashboard/asesor",
          label: "Dashboard asesor",
          icon: "lni lni-grid-alt",
        },
        {
          href: gastosHref,
          label: "Movimientos cliente",
          icon: "lni lni-list",
        },
      ],
    },
  ];
}

function renderDetalleClienteGastosPage({ cliente, detalle, formatCurrency, profileImage, profileName }) {
  const detalleHref = `/cliente/${encodeURIComponent(String(cliente.id))}`;
  const gastosHref = `${detalleHref}/gastos`;
  const porcentajeGastado = cliente.presupuesto > 0
    ? Math.min((cliente.gastadoMes / cliente.presupuesto) * 100, 100)
    : 0;

  return renderDashboardAppLayout({
    activePath: gastosHref,
    pageTitle: `Movimientos de ${cliente.nombre}`,
    pageSubtitle: "Listado completo de movimientos del cliente",
    content: `
      <section class="gd-metrics gd-metrics-2 mb-4">
        ${[
          {
            title: "Resumen rapido",
            value: "",
            delta: "",
            dashboardActionMarkup: `<a href="/cliente/${escapeHtml(encodeURIComponent(String(cliente.id)))}" data-link class="gd-metric-link-btn">Volver al detalle</a>`,
            dashboardExtraMarkup: `
              <div class="d-flex flex-column gap-1 mt-2">
                <div class="d-flex justify-content-between gap-2"><span class="gd-muted">Ingreso</span><strong>${escapeHtml(formatCurrency(cliente.presupuesto))}</strong></div>
                <div class="d-flex justify-content-between gap-2"><span class="gd-muted">Egresos</span><strong>${escapeHtml(formatCurrency(cliente.gastadoMes))}</strong></div>
                <div class="d-flex justify-content-between gap-2"><span class="gd-muted">Ahorros</span><strong>${escapeHtml(formatCurrency(cliente.ahorros))}</strong></div>
              </div>
            `,
          },
          {
            title: "Gastado",
            value: `${Math.round(porcentajeGastado)}%`,
            delta: `Gastado ${formatCurrency(cliente.gastadoMes)} de ${formatCurrency(cliente.presupuesto)}`,
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
        title: "Todos los movimientos",
        expenses: detalle.gastos,
        formatMoney: formatCurrency,
        emptyMessage: "Todavia no hay movimientos registrados para este cliente.",
        rowMapper: mapGastoClienteToRow,
      })}
    `,
    profileImage,
    profileName,
    isAsesor: true,
    notificationCount: 3,
    sidebarSections: buildDetalleClienteSidebarSections({ clienteId: cliente.id }),
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

  if (pathname.endsWith("/gastos")) {
    return renderDetalleClienteGastosPage({
      cliente,
      detalle,
      formatCurrency,
      profileImage,
      profileName,
    });
  }

  const detalleHref = `/cliente/${encodeURIComponent(String(cliente.id))}`;
  const gastosHref = `${detalleHref}/gastos`;

  return renderDashboardAppLayout({
    activePath: detalleHref,
    pageTitle: `Cliente: ${cliente.nombre}`,
    pageSubtitle: "Resumen financiero y seguimiento personalizado",
    content: `
      <section class="gd-metrics">
        ${[
          {
            title: "Saldo Actual",
            value: formatCurrency(cliente.saldoActual),
            delta: "Disponible hoy",
            color: "primary",
            icon: "lni-wallet",
          },
          {
            title: "Gastos del Mes",
            value: formatCurrency(cliente.gastadoMes),
            delta: "Acumulado en el periodo",
            color: "danger",
            icon: "lni-stats-down",
          },
          {
            title: "Presupuesto Total",
            value: formatCurrency(presupuestoDisponible),
            delta: "Tope mensual asignado",
            color: "success",
            icon: "lni-coin",
          },
          {
            title: "Total Ahorrado",
            value: formatCurrency(cliente.ahorros),
            delta: "Ahorro acumulado",
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
          title: "Gastos por mes",
          canvasId: "detalleMonthlyBarChart",
          ariaLabel: "Gastos por mes del cliente",
          height: "220px",
          dashboardStyle: true,
        })}

        ${graficoTorta({
          title: "Por categoria",
          canvasId: "detallePieChart",
          ariaLabel: "Distribucion por categoria del cliente",
          height: "220px",
          dashboardStyle: true,
        })}
      </section>

      <section class="w-100">
        ${renderDashboardExpenseCard({
          title: "Ultimos movimientos",
          actionHref: gastosHref,
          actionText: "ver todo",
          expenses: detalle.gastos,
          formatMoney: formatCurrency,
          rowMapper: mapGastoClienteToRow,
          emptyMessage: "No hay gastos recientes",
        })}
      </section>

      <section id="recomendaciones-historicas" class="row g-2 g-md-2 mt-2 mb-2">
        <div class="col-12 col-lg-6">
          <div class="gd-card gd-client-detail-fixed-card">
            <div class="card-body p-0 gd-client-recommend-form-body">
              <h5 class="card-title mb-2">Agregar recomendacion para ${escapeHtml(cliente.nombre)}</h5>
              <form id="agregarRecomendacionForm" class="gd-client-recommend-form">
                <div class="mb-2">
                  <input
                    class="form-control"
                    id="recomendacionTitulo"
                    type="text"
                    maxlength="60"
                    placeholder="Titulo de la recomendacion"
                    value="${escapeHtml(detalle.nuevaRecomendacionTitulo || "")}"
                    required
                  >
                </div>
                <div class="mb-2 gd-client-recommend-input-wrap">
                  <textarea class="form-control" id="recomendacionTexto" rows="3" placeholder="Escribe una recomendacion personalizada para este cliente..." required>${escapeHtml(detalle.nuevaRecomendacionTexto || "")}</textarea>
                </div>
                <button type="submit" class="btn btn-primary w-100 btn-sm">Enviar Recomendacion</button>
              </form>
            </div>
          </div>
        </div>

        <div class="col-12 col-lg-6">
          ${contenedorRecomendaciones({
            title: "Recomendaciones Enviadas",
            recommendations: detalle.recomendaciones,
            emptyText: "No hay recomendaciones aun",
            cardClass: "gd-client-detail-fixed-card",
            maxHeight: "100%",
            bodyStyle: "height: 100%; padding: 0;",
          })}
        </div>
      </section>
    `,
    profileImage,
    profileName,
    isAsesor: true,
    notificationCount: 3,
    sidebarSections: buildDetalleClienteSidebarSections({ clienteId: cliente.id }),
  });
}

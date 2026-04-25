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
  const match = pathname.match(/^\/cliente\/([^/]+)(?:\/gastos)?$/);
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

  const presupuesto = Number.isFinite(presupuestoValue) && presupuestoValue >= 0
    ? presupuestoValue
    : 0;
  const gastadoMes = Number.isFinite(gastadoMesValue) && gastadoMesValue >= 0
    ? gastadoMesValue
    : 0;
  const saldoActual = Math.max(presupuesto - gastadoMes, 0);

  return {
    id: clienteId,
    nombre: String(clienteAsesor.nombre ?? clienteAsesor.name ?? "Cliente"),
    presupuesto,
    saldoActual,
    gastadoMes,
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
  const recomendacionesHref = `${detalleHref}#recomendaciones-historicas`;
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
          label: "Gastos cliente",
          icon: "lni lni-list",
        },
      ],
    },
  ];
}

function renderDetalleClienteGastosPage({ cliente, detalle, formatCurrency, profileImage, profileName }) {
  const detalleHref = `/cliente/${encodeURIComponent(String(cliente.id))}`;
  const gastosHref = `${detalleHref}/gastos`;

  return renderDashboardAppLayout({
    activePath: gastosHref,
    pageTitle: `Gastos de ${cliente.nombre}`,
    pageSubtitle: "Listado completo de gastos del cliente",
    content: `
      <section class="gd-grid-2 mb-4">
        <article class="gd-card">
          <div class="gd-card-header">
            <h2 class="gd-card-title">Resumen rapido</h2>
            <a href="/cliente/${escapeHtml(encodeURIComponent(String(cliente.id)))}" data-link class="gd-card-action">Volver al detalle</a>
          </div>

          <div class="d-flex flex-column gap-2">
            <div class="d-flex justify-content-between align-items-center">
              <span class="gd-muted">Total de gastos</span>
              <strong class="gd-card-title gd-card-title-sm">${escapeHtml(String(detalle.gastos.length))}</strong>
            </div>
            <div class="d-flex justify-content-between align-items-center">
              <span class="gd-muted">Gasto del mes</span>
              <strong class="gd-card-title gd-card-title-sm">${escapeHtml(formatCurrency(cliente.gastadoMes))}</strong>
            </div>
          </div>
        </article>

        <article class="gd-card">
          <div class="gd-card-header">
            <h2 class="gd-card-title">Vista de gastos</h2>
          </div>
          <p class="gd-muted mb-0">Esta pagina muestra todos los movimientos del cliente sin expandir el listado del detalle.</p>
        </article>
      </section>

      ${renderDashboardExpenseCard({
        title: "Todos los gastos",
        expenses: detalle.gastos,
        formatMoney: formatCurrency,
        emptyMessage: "Todavia no hay gastos registrados para este cliente.",
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

  const porcentajeUsoPresupuesto = presupuestoDisponible > 0
    ? Math.min((cliente.gastadoMes / presupuestoDisponible) * 100, 100)
    : 0;
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
            title: "Uso del Presupuesto",
            value: `${Math.round(porcentajeUsoPresupuesto)}%`,
            delta: `Quedan ${formatCurrency(cliente.saldoActual)}`,
            color: "info",
            icon: "lni-pie-chart",
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

        ${renderDashboardExpenseCard({
          title: "Ultimos gastos",
          actionHref: gastosHref,
          actionText: "ver todo",
          expenses: detalle.gastos,
          formatMoney: formatCurrency,
          rowMapper: mapGastoClienteToRow,
          emptyMessage: "No hay gastos recientes",
        })}
      </section>

      <section id="recomendaciones-historicas" class="row g-3 g-md-4 mb-4">
        <div class="col-12 col-lg-6">
          <div class="card border-0 shadow-sm fp-card-rounded-lg gd-client-detail-fixed-card">
            <div class="card-body">
              <h5 class="card-title mb-3">Agregar recomendacion para ${escapeHtml(cliente.nombre)}</h5>
              <form id="agregarRecomendacionForm">
                <div class="mb-3">
                  <textarea class="form-control" id="recomendacion" rows="3" placeholder="Escribe una recomendacion personalizada para este cliente...">${escapeHtml(detalle.nuevaRecomendacion)}</textarea>
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
            maxHeight: "210px",
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

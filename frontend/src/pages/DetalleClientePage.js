import {
  graficoGastos,
  graficoTorta,
  contenedorRecomendaciones,
  listaUltimosGastos,
  tarjetaValor,
} from '../components/common/reusablePageComponents';

export function resolveDetalleCliente(pathname, state) {
  const match = pathname.match(/^\/cliente\/([^/]+)$/);
  if (!match) {
    return null;
  }

  const clienteId = match[1];
  const clienteAsesor = state.asesor.clientes.find((item) => item.id === clienteId);

  return {
    id: clienteId,
    nombre: clienteAsesor?.nombre ?? 'Juan Perez',
    presupuesto: clienteAsesor?.presupuesto ?? 15000,
    saldoActual: 6149.25,
    gastadoMes: clienteAsesor?.gastosMes ?? 14350.75,
  };
}

export function renderDetalleClientePage({
  pathname,
  state,
  escapeHtml,
  formatCurrency,
  encabezadoInterno,
  profileImage,
  profileName,
  currentRole,
  brandTarget,
  advisorClientHref,
  showAdvisorClientLink,
}) {
  const cliente = resolveDetalleCliente(pathname, state);
  if (!cliente) {
    return '';
  }

  const detalle = state.detalleCliente;
  const presupuestoDisponible = cliente.presupuesto;

  return `
    ${encabezadoInterno({
      pageTitle: `Cliente: ${cliente.nombre}`,
      profileImage,
      profileName,
      currentRole,
      isAsesor: true,
      brandTarget,
      advisorClientHref,
      showAdvisorClientLink,
      transparent: true,
    })}

    <section class="row g-3 g-md-4 mb-4">
      <div class="col-12 col-md-6 col-lg-3">
        ${tarjetaValor({ title: 'Saldo Actual', value: formatCurrency(cliente.saldoActual), color: 'primary', icon: 'lni-wallet' })}
      </div>
      <div class="col-12 col-md-6 col-lg-3">
        ${tarjetaValor({ title: 'Gastos del Mes', value: formatCurrency(cliente.gastadoMes), color: 'danger', icon: 'lni-stats-down' })}
      </div>
      <div class="col-12 col-md-6 col-lg-3">
        ${tarjetaValor({ title: 'Presupuesto Total Disponible', value: formatCurrency(presupuestoDisponible), color: 'success', icon: 'lni-coin' })}
      </div>
      <div class="col-12 col-md-6 col-lg-3">
        ${tarjetaValor({ title: 'Pozo Ahorrado', value: formatCurrency(presupuestoDisponible), color: 'info', icon: 'lni-pie-chart' })}
      </div>
    </section>

    <section class="row g-3 g-md-4 mb-4">
      <div class="col-12 col-lg-6">
        <div class="mb-3">
          ${
            graficoTorta({
              title: 'Distribucion de Gastos',
              canvasId: 'detallePieChart',
              ariaLabel: 'Distribucion de gastos',
              height: '436px',
            })
          }
        </div>
      </div>

      <div class="col-12 col-lg-6">
        <div class="mb-3">
          ${
            listaUltimosGastos({
              title: 'Ultimos Gastos',
              expenses: detalle.gastos,
              showAll: detalle.showAllRecentExpenses,
              toggleAction: 'toggle-detalle-expenses',
              formatCurrency,
            })
          }
        </div>
      </div>
    </section>

    <section class="row g-3 g-md-4 mb-4">
      <div class="col-12 col-lg-6">
        <div class="card border-0 shadow-sm fp-card-rounded-lg gd-client-detail-fixed-card">
          <div class="card-body">
            <h5 class="card-title mb-3">Agregar Recomendacion</h5>
            <form id="agregarRecomendacionForm">
              <div class="mb-3">
                <textarea class="form-control" id="recomendacion" rows="3" placeholder="Escribe una recomendacion personalizada...">${escapeHtml(detalle.nuevaRecomendacion)}</textarea>
              </div>
              <button type="submit" class="btn btn-primary w-100 btn-sm">Enviar Recomendacion</button>
            </form>
          </div>
        </div>
      </div>

      <div class="col-12 col-lg-6">
        ${contenedorRecomendaciones({
          title: 'Recomendaciones Enviadas',
          recommendations: detalle.recomendaciones,
          emptyText: 'No hay recomendaciones aun',
          cardClass: 'gd-client-detail-fixed-card',
          maxHeight: '210px',
        })}
      </div>
    </section>

    <section class="row g-3 g-md-4 mb-4">
      <div class="col-12">
        ${
          graficoGastos({
            title: 'Gastos de los Ultimos 12 Meses',
            canvasId: 'detalleLineChart',
            ariaLabel: 'Ultimos 12 meses',
            height: '260px',
          })
        }
      </div>
    </section>
  `;
}

import {
  graficoGastos,
  graficoTorta,
  listaUltimosGastos,
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
  encabezado,
}) {
  const cliente = resolveDetalleCliente(pathname, state);
  if (!cliente) {
    return '';
  }

  const detalle = state.detalleCliente;

  return `
    ${
      encabezado({
        title: cliente.nombre,
        subtitle: `Presupuesto Mensual: ${formatCurrency(cliente.presupuesto)}`,
        backAction: 'back-to-asesor',
      })
    }

    <section class="row g-3 g-md-4 mb-4">
      <div class="col-12 col-md-6 col-lg-3">
        <div class="card border-0 shadow-sm border-start" style="border-left-width:4px;border-left-color:#198754">
          <div class="card-body">
            <p class="text-muted mb-1 small">Saldo Actual</p>
            <h2 class="h4 mb-0">${formatCurrency(cliente.saldoActual)}</h2>
          </div>
        </div>
      </div>
      <div class="col-12 col-md-6 col-lg-3">
        <div class="card border-0 shadow-sm border-start" style="border-left-width:4px;border-left-color:#dc3545">
          <div class="card-body">
            <p class="text-muted mb-1 small">Gastado Este Mes</p>
            <h2 class="h4 mb-0">${formatCurrency(cliente.gastadoMes)}</h2>
          </div>
        </div>
      </div>
      <div class="col-12 col-md-6 col-lg-3">
        <div class="card border-0 shadow-sm border-start" style="border-left-width:4px;border-left-color:#0d6efd">
          <div class="card-body">
            <p class="text-muted mb-1 small">Total Ahorros</p>
            <h2 class="h4 mb-0">$2,500.00</h2>
          </div>
        </div>
      </div>
      <div class="col-12 col-md-6 col-lg-3">
        <div class="card border-0 shadow-sm border-start" style="border-left-width:4px;border-left-color:#ffc107">
          <div class="card-body">
            <p class="text-muted mb-1 small">% Presupuesto</p>
            <h2 class="h4 mb-0">${((cliente.gastadoMes / cliente.presupuesto) * 100).toFixed(1)}%</h2>
          </div>
        </div>
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

        <div class="card border-0 shadow-sm mb-3">
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

        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <h5 class="card-title mb-3">Recomendaciones Enviadas</h5>
            <div style="max-height:250px;overflow-y:auto">
              ${
                detalle.recomendaciones.length === 0
                  ? '<p class="text-muted small">No hay recomendaciones aun</p>'
                  : detalle.recomendaciones
                      .map(
                        (recom) => `
                          <div class="alert alert-info mb-2 py-2 px-3" role="alert">
                            <small><strong>${escapeHtml(recom.fecha)}</strong><br>${escapeHtml(recom.texto)}</small>
                          </div>
                        `,
                      )
                      .join('')
              }
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="row g-3 g-md-4 mb-4">
      <div class="col-12">
        ${
          graficoGastos({
            title: 'Gastos de los Ultimos 12 Meses',
            canvasId: 'detalleLineChart',
            ariaLabel: 'Ultimos 12 meses',
          })
        }
      </div>
    </section>
  `;
}

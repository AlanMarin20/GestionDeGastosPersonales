import {
  graficoGastos,
  graficoTorta,
  listaUltimosGastos,
} from '../components/common/reusablePageComponents';

export function renderDashboardPage({
  state,
  formatCurrency,
  escapeHtml,
  renderMetricCard,
}) {
  const dashboard = state.dashboard;
  const totalAhorros = dashboard.ahorros.reduce((sum, ahorro) => sum + ahorro.monto, 0);
  const ahorroDestino = dashboard.ahorros.find((item) => item.id === dashboard.ahorroDestinoId) || null;

  const ahorroCards = dashboard.ahorros
    .map((ahorro) => {
      const progress = ahorro.meta ? Math.min((ahorro.monto / ahorro.meta) * 100, 100) : 0;

      return `
        <div class="col-12 col-md-6">
          <div class="p-3 rounded-2 bg-light border">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h3 class="h6 mb-0">${escapeHtml(ahorro.nombre)}</h3>
              <div class="d-flex align-items-center gap-2">
                <span class="badge bg-primary">${formatCurrency(ahorro.monto)}</span>
                <button
                  type="button"
                  class="btn btn-success btn-sm rounded-circle p-0"
                  style="width:28px;height:28px;line-height:1"
                  data-action="open-destino-modal"
                  data-ahorro-id="${ahorro.id}"
                  aria-label="Destinar fondos a ${escapeHtml(ahorro.nombre)}"
                  title="Destinar fondos desde Saldo Actual"
                >+
                </button>
              </div>
            </div>
            ${
              ahorro.meta
                ? `
                  <div>
                    <small class="text-muted">Meta: ${formatCurrency(ahorro.meta)}</small>
                    <div class="progress mt-2" style="height:6px">
                      <div class="progress-bar bg-success" role="progressbar" style="width:${progress}%"></div>
                    </div>
                  </div>
                `
                : ''
            }
          </div>
        </div>
      `;
    })
    .join('');

  const modalBackdrop =
    dashboard.modals.ingreso || dashboard.modals.ahorro || dashboard.modals.destino
      ? '<div class="modal-backdrop fade show"></div>'
      : '';

  return `
    <section class="row g-3 g-md-4 mb-4">
      <div class="col-12 col-md-6 col-lg-3">
        <article class="card border-0 shadow-sm h-100 bg-primary bg-gradient text-white" style="border-radius: 15px;">
          <div class="card-body p-4 position-relative overflow-hidden d-flex flex-column justify-content-between">
            <div class="position-absolute opacity-25" style="top: -10px; right: -15px; font-size: 90px; transform: rotate(-10deg);">
              <i class="lni lni-wallet"></i>
            </div>
            <div style="z-index: 1; position: relative;">
              <p class="mb-1 fw-semibold text-white-50">Saldo Actual</p>
              <h2 class="h3 mb-0 fw-bold text-white">${formatCurrency(dashboard.saldoActual)}</h2>
            </div>
            <button type="button" class="btn btn-light btn-sm mt-3 fw-bold shadow-sm" data-action="open-ingreso-modal" style="border-radius: 8px; width: fit-content; z-index: 1; position: relative; color: #0d6efd;">
              + Nuevo ingreso
            </button>
          </div>
        </article>
      </div>
      <div class="col-12 col-md-6 col-lg-3">
        ${renderMetricCard({ title: 'Gastos del Mes', value: '$14,350.75', color: 'danger', icon: 'lni-stats-down' })}
      </div>
    </section>

    <section class="row g-3 g-md-4 mb-4">
      <div class="col-12 col-lg-4">
        ${
          graficoTorta({
            title: 'Categorias de Gastos (Mes Actual)',
            canvasId: 'dashboardPieChart',
            ariaLabel: 'Categorias de gastos',
          })
        }
      </div>

      <div class="col-12 col-lg-4">
        <article class="card border-0 shadow-sm mb-3" style="border-radius: 15px;">
          <div class="card-body">
            <h2 class="h5 mb-3">Anadir Nuevo Gasto</h2>
            <form id="nuevoGastoForm">
              <div class="mb-3">
                <label for="descripcion" class="form-label small fw-500">Descripcion</label>
                <input type="text" class="form-control form-control-sm" id="descripcion" name="descripcion" placeholder="Ej: Almuerzo" value="${escapeHtml(dashboard.formData.descripcion)}">
              </div>
              <div class="mb-3">
                <label for="monto" class="form-label small fw-500">Monto ($)</label>
                <input type="number" class="form-control form-control-sm" id="monto" name="monto" placeholder="0.00" step="0.01" value="${escapeHtml(dashboard.formData.monto)}">
              </div>
              <div class="mb-3">
                <label for="categoria" class="form-label small fw-500">Categoria</label>
                <select class="form-select form-select-sm" id="categoria" name="categoria">
                  ${['Comida', 'Vivienda', 'Transporte', 'Ocio', 'Otros']
                    .map(
                      (cat) =>
                        `<option value="${cat}" ${dashboard.formData.categoria === cat ? 'selected' : ''}>${cat}</option>`,
                    )
                    .join('')}
                </select>
              </div>
              <button type="submit" class="btn btn-primary btn-sm w-100">Registrar Gasto</button>
            </form>
          </div>
        </article>

        <article class="card border-0 shadow-sm" style="border-radius: 15px;">
          <div class="card-body">
            <h2 class="h5 mb-3"><i class="bi bi-lightbulb me-2"></i>Recomendaciones</h2>
            <div class="alert alert-info alert-sm mb-2 py-2 px-3" role="alert">
              <small><strong>💡 Sugerencia IA:</strong> Reducir gastos de comida un 15%</small>
            </div>
            <div class="alert alert-warning alert-sm py-2 px-3" role="alert">
              <small><strong>Asesor:</strong> Tu presupuesto de vivienda es alto. Considera revisarlo.</small>
            </div>
          </div>
        </article>
      </div>

      <div class="col-12 col-lg-4">
        ${
          listaUltimosGastos({
            title: 'Ultimos Gastos',
            expenses: dashboard.gastos,
            showAll: dashboard.showAllRecentExpenses,
            toggleAction: 'toggle-dashboard-expenses',
            formatCurrency,
          })
        }
      </div>
    </section>

    <section class="row g-3 g-md-4 mb-4">
      <div class="col-12">
        ${
          graficoGastos({
            title: 'Gastos de los Ultimos 12 Meses',
            canvasId: 'dashboardLineChart',
            ariaLabel: 'Ultimos 12 meses',
          })
        }
      </div>
    </section>

    <section class="row g-3 g-md-4">
      <div class="col-12 col-lg-8">
        <article class="card border-0 shadow-sm" style="border-radius: 15px;">
          <div class="card-body">
            <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
              <h2 class="h5 mb-0">Mis Ahorros</h2>
              <button type="button" class="btn btn-outline-primary btn-sm" data-action="open-ahorro-modal">Agregar ahorro</button>
            </div>
            <div class="row g-2">${ahorroCards}</div>
          </div>
        </article>
      </div>
      <div class="col-12 col-lg-4">
        <div class="card border-0 shadow-sm h-100 bg-success bg-gradient text-white" style="border-radius: 15px;">
          <div class="card-body p-4 position-relative overflow-hidden d-flex flex-column justify-content-center text-center">
            <div class="position-absolute opacity-25" style="top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 150px;">
              <i class="lni lni-coin"></i>
            </div>
            <div style="z-index: 1; position: relative;">
              <p class="mb-2 fw-semibold text-white-50">Presupuesto Disponible</p>
              <h2 class="display-5 mb-0 fw-bold text-white">${formatCurrency(totalAhorros)}</h2>
              <small class="text-white-50 mt-2 d-block">Suma total de todos los ahorros</small>
            </div>
          </div>
        </div>
      </div>
    </section>

    ${
      dashboard.modals.ingreso
        ? `
          <div class="modal d-block" tabindex="-1" role="dialog" aria-modal="true">
            <div class="modal-dialog modal-dialog-centered" role="document">
              <div class="modal-content">
                <form id="ingresoForm">
                  <div class="modal-header">
                    <h2 class="modal-title h5 mb-0">Nuevo ingreso</h2>
                    <button type="button" class="btn-close" aria-label="Cerrar" data-action="close-ingreso-modal"></button>
                  </div>
                  <div class="modal-body">
                    <div class="mb-3">
                      <label for="ingresoMonto" class="form-label">Monto</label>
                      <input type="number" id="ingresoMonto" name="monto" class="form-control" min="0" step="0.01" value="${escapeHtml(dashboard.ingresoForm.monto)}" required>
                    </div>
                    <div class="mb-3">
                      <label for="ingresoConcepto" class="form-label">Concepto</label>
                      <input type="text" id="ingresoConcepto" name="concepto" class="form-control" placeholder="Ej: Pago quincenal" value="${escapeHtml(dashboard.ingresoForm.concepto)}" required>
                    </div>
                    <div>
                      <label for="ingresoOrigen" class="form-label">Origen</label>
                      <select id="ingresoOrigen" name="origen" class="form-select">
                        ${['Sueldo', 'Freelance', 'Prestamo', 'Venta', 'Otro']
                          .map(
                            (origen) =>
                              `<option value="${origen}" ${dashboard.ingresoForm.origen === origen ? 'selected' : ''}>${origen}</option>`,
                          )
                          .join('')}
                      </select>
                    </div>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-outline-secondary" data-action="close-ingreso-modal">Cancelar</button>
                    <button type="submit" class="btn btn-success">Registrar ingreso</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        `
        : ''
    }

    ${
      dashboard.modals.ahorro
        ? `
          <div class="modal d-block" tabindex="-1" role="dialog" aria-modal="true">
            <div class="modal-dialog modal-dialog-centered" role="document">
              <div class="modal-content">
                <form id="nuevoAhorroForm">
                  <div class="modal-header">
                    <h2 class="modal-title h5 mb-0">Agregar ahorro</h2>
                    <button type="button" class="btn-close" aria-label="Cerrar" data-action="close-ahorro-modal"></button>
                  </div>
                  <div class="modal-body">
                    <div class="mb-3">
                      <label for="nuevoAhorroNombre" class="form-label">Nombre del ahorro</label>
                      <input type="text" id="nuevoAhorroNombre" name="nombre" class="form-control" placeholder="Ej: Fondo de viaje" value="${escapeHtml(dashboard.nuevoAhorroForm.nombre)}" required>
                    </div>
                    <div class="mb-3">
                      <label for="nuevoAhorroMonto" class="form-label">Monto inicial</label>
                      <input type="number" id="nuevoAhorroMonto" name="montoInicial" class="form-control" min="0" step="0.01" value="${escapeHtml(dashboard.nuevoAhorroForm.montoInicial)}">
                    </div>
                    <div>
                      <label for="nuevoAhorroMeta" class="form-label">Meta (opcional)</label>
                      <input type="number" id="nuevoAhorroMeta" name="meta" class="form-control" min="0" step="0.01" value="${escapeHtml(dashboard.nuevoAhorroForm.meta)}">
                    </div>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-outline-secondary" data-action="close-ahorro-modal">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Guardar ahorro</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        `
        : ''
    }

    ${
      dashboard.modals.destino && ahorroDestino
        ? `
          <div class="modal d-block" tabindex="-1" role="dialog" aria-modal="true">
            <div class="modal-dialog modal-dialog-centered" role="document">
              <div class="modal-content">
                <form id="destinoForm">
                  <div class="modal-header">
                    <h2 class="modal-title h5 mb-0">Destinar fondos a ${escapeHtml(ahorroDestino.nombre)}</h2>
                    <button type="button" class="btn-close" aria-label="Cerrar" data-action="close-destino-modal"></button>
                  </div>
                  <div class="modal-body">
                    <p class="small text-muted mb-2">Saldo disponible: ${formatCurrency(dashboard.saldoActual)}</p>
                    <label for="destinoMonto" class="form-label">Monto a transferir</label>
                    <input
                      type="number"
                      id="destinoMonto"
                      name="monto"
                      class="form-control"
                      min="0"
                      max="${dashboard.saldoActual}"
                      step="0.01"
                      value="${escapeHtml(dashboard.destinoForm.monto)}"
                      required
                    >
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-outline-secondary" data-action="close-destino-modal">Cancelar</button>
                    <button type="submit" class="btn btn-success">Destinar fondos</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        `
        : ''
    }

    ${modalBackdrop}
  `;
}

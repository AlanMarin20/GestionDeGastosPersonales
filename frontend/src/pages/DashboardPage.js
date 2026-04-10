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
  renderValueCard,
  encabezadoInterno,
  profileImage,
  profileName,
  currentRole,
  isAsesor,
}) {
  const dashboard = state.dashboard;
  const totalAhorros = dashboard.ahorros.reduce((sum, ahorro) => sum + ahorro.monto, 0);
  const ahorroDestino = dashboard.ahorros.find((item) => item.id === dashboard.ahorroDestinoId) || null;

  const ahorroCards = dashboard.ahorros
    .map((ahorro) => {
      const progress = ahorro.meta ? Math.min((ahorro.monto / ahorro.meta) * 100, 100) : 0;

      return `
        <div class="col-12 col-lg-4">
          <div class="p-4 bg-white border-0 shadow-sm" style="border-radius: 12px; transition: transform 0.2s;">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h3 class="h6 fw-bold mb-1 text-dark">${escapeHtml(ahorro.nombre)}</h3>
                <span class="badge bg-primary bg-opacity-10 text-primary px-2 py-1" style="border-radius: 6px;">${formatCurrency(ahorro.monto)}</span>
              </div>
              <button
                type="button"
                class="btn btn-primary btn-sm rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                style="width: 32px; height: 32px; font-weight: bold; font-size: 18px;"
                data-action="open-destino-modal"
                data-ahorro-id="${ahorro.id}"
                aria-label="Destinar fondos a ${escapeHtml(ahorro.nombre)}"
                title="Destinar fondos desde Saldo Actual"
              >
                +
              </button>
            </div>
            ${
              ahorro.meta
                ? `
                  <div>
                    <div class="d-flex justify-content-between mb-1">
                      <small class="text-muted fw-semibold" style="font-size: 12px;">Progreso</small>
                      <small class="text-muted fw-semibold" style="font-size: 12px;">Meta: ${formatCurrency(ahorro.meta)}</small>
                    </div>
                    <div class="progress" style="height: 8px; border-radius: 4px; background-color: #e2e8f0;">
                      <div class="progress-bar bg-success" role="progressbar" style="width: ${progress}%; border-radius: 4px;"></div>
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
    ${encabezadoInterno({
      pageTitle: '',
      profileImage,
      profileName,
      currentRole,
      isAsesor,
    })}

    <!-- ======== Fila 1: Metricas Principales ======== -->
    <section class="row g-2 mb-2">
      <!-- Contenedores Saldo Actual y Presupuesto Disponible -->
      <div class="col-12 col-lg-3 d-flex flex-column gap-1">
        ${renderValueCard({ title: 'Saldo Actual', value: formatCurrency(dashboard.saldoActual), color: 'primary', icon: 'lni-wallet', hasButton: true, buttonAction: 'open-ingreso-modal' })}
        ${renderValueCard({ title: 'Presupuesto Total Disponible', value: formatCurrency(totalAhorros), color: 'success', icon: 'lni-coin' })}
      </div>
      
      <!-- Gastos del Mes -->
      <div class="col-12 col-lg-3">
        ${renderMetricCard({ title: 'Gastos del Mes', value: '$14,350.75', color: 'danger', icon: 'lni-stats-down' })}
      </div>
      
      <!-- Añadir Nuevo Gasto (Arriba) -->
      <div class="col-12 col-lg-6">
        <article class="card border-0 shadow-sm" style="border-radius: 15px;">
          <div class="card-body" style="padding: 12px; min-height: 280px;">
            <h2 class="h5 mb-2">Anadir Nuevo Gasto</h2>
            <form id="nuevoGastoForm">
              <div class="mb-2">
                <label for="descripcion" class="form-label small fw-500">Descripcion</label>
                <input type="text" class="form-control form-control-sm" id="descripcion" name="descripcion" placeholder="Ej: Almuerzo" value="${escapeHtml(dashboard.formData.descripcion)}">
              </div>
              <div class="mb-2">
                <label for="monto" class="form-label small fw-500">Monto ($)</label>
                <input type="number" class="form-control form-control-sm" id="monto" name="monto" placeholder="0.00" step="0.01" value="${escapeHtml(dashboard.formData.monto)}">
              </div>
              <div class="mb-2">
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
              <button type="button" class="btn btn-outline-primary btn-sm w-100 mt-2">Registrar Gasto con imagen</button>
            </form>
          </div>
        </article>
      </div>
    </section>

    <!-- ======== Recomendaciones ======== -->
    <section class="mb-3" style="max-width: 555px;">
      <article class="card border-0 shadow-sm" style="border-radius: 15px;">
        <div class="card-body" style="padding: 16px;">
          <h2 class="mb-0" style="font-size: 16px; margin-bottom: 8px !important;"><i class="bi bi-lightbulb me-2"></i>Recomendaciones</h2>
          <div class="alert alert-info alert-sm mb-0" style="margin-bottom: 8px !important; padding: 8px 16px;" role="alert">
            <small style="font-size: 14px;"><strong>💡 Sugerencia IA:</strong> Reducir gastos de comida un 15%</small>
          </div>
          <div class="alert alert-warning alert-sm mb-0" style="padding: 8px 16px;" role="alert">
            <small style="font-size: 14px;"><strong>Asesor:</strong> Tu presupuesto de vivienda es alto. Considera revisarlo.</small>
          </div>
        </div>
      </article>
    </section>

    <!-- ======== Fila 1b: Graficos Estirados ======== -->
    <section class="row g-3 g-md-4 mb-4">
      <div class="col-12 col-lg-8">
        ${
          graficoGastos({
            title: 'Evolucion de Gastos (Ultimos 12 Meses)',
            canvasId: 'dashboardLineChart',
            ariaLabel: 'Ultimos 12 meses',
            height: '280px'
          })
        }
      </div>
      <div class="col-12 col-lg-4">
        ${
          graficoTorta({
            title: 'Distribucion Mensual',
            canvasId: 'dashboardPieChart',
            ariaLabel: 'Categorias de gastos',
          })
        }
      </div>
    </section>

    <!-- ======== Fila 2: Listas y Movimientos Recientes ======== -->
    <section class="row g-3 g-md-4 mb-4">
      <div class="col-12">
        ${
          listaUltimosGastos({
            title: 'Gastos Recientes',
            expenses: dashboard.gastos,
            showAll: dashboard.showAllRecentExpenses,
            toggleAction: 'toggle-dashboard-expenses',
            formatCurrency,
          })
        }
      </div>
    </section>

    <!-- ======== Fila 3: Panel Horizontal de Ahorros ======== -->
    <section class="row g-3 g-md-4">
      <div class="col-12">
        <article class="card border-0 shadow-sm" style="border-radius: 15px;">
          <div class="card-body p-4">
            <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
              <div class="d-flex align-items-center gap-3">
                <h2 class="h5 mb-0 fw-bold text-dark">Ahorros</h2>
                <div class="bg-success text-white px-3 py-2" style="border-radius: 8px; min-width: 150px; text-align: center;">
                  <small class="d-block fw-semibold" style="font-size: 12px;">Pozo Ahorrado</small>
                  <h3 class="h6 mb-0 fw-bold">${formatCurrency(totalAhorros)}</h3>
                </div>
              </div>
              <button type="button" class="btn btn-outline-primary btn-sm fw-bold" style="border-radius: 8px;" data-action="open-ahorro-modal">+ Crear ahorro</button>
            </div>
            <div class="row g-2">${ahorroCards}</div>
          </div>
        </article>
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
                    <h2 class="modal-title h5 mb-0">Crear ahorro</h2>
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

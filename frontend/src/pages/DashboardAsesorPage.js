export function renderDashboardAsesorPage({
  state,
  escapeHtml,
  formatCurrency,
  encabezadoInterno,
  tarjetaValor,
  profileImage,
  profileName,
}) {
  const asesor = state.asesor;
  const clientesFiltrados = asesor.clientes.filter((c) =>
    c.nombre.toLowerCase().includes(asesor.busqueda.toLowerCase()),
  );
  const clientesEnAlerta = asesor.clientes.filter((c) => c.estado === 'alerta').length;

  const getEstadoBadge = (estado) => {
    const clases = {
      alerta: 'bg-danger',
      normal: 'bg-warning',
      bueno: 'bg-success',
    };
    return clases[estado] || 'bg-secondary';
  };

  const getEstadoText = (estado) => {
    const textos = {
      alerta: 'Necesita asesoramiento',
      normal: 'En seguimiento',
      bueno: 'Bajo control',
    };
    return textos[estado] || 'Desconocido';
  };

  return `
    ${encabezadoInterno({
      pageTitle: '',
      profileImage,
      profileName,
      currentRole: 'Asesor',
      isAsesor: true,
    })}

    <section class="row g-3 g-md-4 mb-4">
      <div class="col-12 col-md-6 col-lg-4">
        ${tarjetaValor({
          title: 'Clientes Asociados',
          value: String(asesor.clientes.length),
          color: 'primary',
          icon: 'lni-users',
          variant: 'outline',
        })}
      </div>
      <div class="col-12 col-md-6 col-lg-4">
        ${tarjetaValor({
          title: 'En Alerta',
          value: String(clientesEnAlerta),
          color: 'danger',
          icon: 'lni-warning',
        })}
      </div>
      <div class="col-12 col-md-6 col-lg-4 d-flex flex-column gap-2">
        <button class="btn btn-primary w-100" type="button" data-bs-toggle="modal" data-bs-target="#agregarClienteModal">+ Agregar Cliente</button>
        <div class="input-group">
          <span class="input-group-text bg-white">🔎</span>
          <input type="text" class="form-control" id="busquedaCliente" placeholder="Buscar cliente..." value="${escapeHtml(asesor.busqueda)}">
        </div>
      </div>
    </section>

    <section class="card border-0 shadow-sm">
      <div class="card-body">
        <h5 class="card-title mb-3">Mis Clientes</h5>
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>Cliente</th>
                <th>Gastos Mes</th>
                <th>Presupuesto</th>
                <th>% Utilizado</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${
                clientesFiltrados.length === 0
                  ? `
                    <tr>
                      <td colspan="6" class="text-center text-muted py-4">No se encontraron clientes</td>
                    </tr>
                  `
                  : clientesFiltrados
                      .map((cliente) => {
                        const porcentajeNum = (cliente.gastosMes / cliente.presupuesto) * 100;
                        const porcentaje = porcentajeNum.toFixed(1);
                        const progressColor = porcentajeNum > 90 ? 'bg-danger' : porcentajeNum > 75 ? 'bg-warning' : 'bg-success';

                        return `
                          <tr>
                            <td>
                              <div class="d-flex align-items-center gap-2">
                                <img
                                  src="/assets/img/user-avatar-default.svg"
                                  alt="Foto de ${escapeHtml(cliente.nombre)}"
                                  class="rounded-circle border border-1 border-light-subtle"
                                  style="width: 34px; height: 34px; object-fit: cover;"
                                >
                                <span class="fw-500">${escapeHtml(cliente.nombre)}</span>
                              </div>
                            </td>
                            <td>${formatCurrency(cliente.gastosMes)}</td>
                            <td>${formatCurrency(cliente.presupuesto)}</td>
                            <td>
                              <div class="progress" style="height:20px">
                                <div class="progress-bar ${progressColor}" role="progressbar" style="width:${Math.min(porcentajeNum, 100)}%">
                                  <small>${porcentaje}%</small>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span class="badge ${getEstadoBadge(cliente.estado)}">${getEstadoText(cliente.estado)}</span>
                            </td>
                            <td>
                              <div class="btn-group btn-group-sm" role="group">
                                <button class="btn btn-outline-primary" data-nav="/cliente/${cliente.id}">Ver Detalle</button>
                                <button class="btn btn-outline-danger" data-action="desvincular-cliente" data-cliente-id="${cliente.id}" title="Desvincular cliente">🗑️</button>
                              </div>
                            </td>
                          </tr>
                        `;
                      })
                      .join('')
              }
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <div class="modal fade" id="agregarClienteModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Agregar Nuevo Cliente</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <form id="agregarClienteForm">
            <div class="modal-body">
              <div class="mb-3">
                <label for="nombreCliente" class="form-label">Nombre del Cliente</label>
                <input type="text" class="form-control" id="nombreCliente" value="${escapeHtml(asesor.nuevoCliente.nombre)}" placeholder="Ej: Juan Perez">
              </div>
              <div class="mb-3">
                <label for="presupuestoCliente" class="form-label">Presupuesto Mensual ($)</label>
                <input type="number" class="form-control" id="presupuestoCliente" value="${escapeHtml(asesor.nuevoCliente.presupuesto)}" placeholder="0.00" step="0.01">
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
              <button type="submit" class="btn btn-primary">Agregar Cliente</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

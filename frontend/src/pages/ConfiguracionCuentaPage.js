export function renderConfiguracionCuentaPage({ state, escapeHtml, encabezado }) {
  const config = state.configuracion;

  return `
    <div class="container py-4">
      ${
        encabezado({
          title: 'Configuracion de Cuenta',
          subtitle: 'Administra tu cuenta y preferencias',
          backAction: 'back',
        })
      }

      <div class="row">
        <div class="col-12 col-lg-6 mb-4">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <h5 class="card-title mb-3">Configuracion General</h5>

              <div class="mb-3">
                <label for="moneda" class="form-label">Moneda</label>
                <select class="form-select" id="moneda" name="moneda">
                  <option value="USD" ${config.moneda === 'USD' ? 'selected' : ''}>Dolar USD</option>
                  <option value="ARS" ${config.moneda === 'ARS' ? 'selected' : ''}>Peso Argentino</option>
                  <option value="EUR" ${config.moneda === 'EUR' ? 'selected' : ''}>Euro</option>
                </select>
              </div>

              <div class="mb-3">
                <label for="idioma" class="form-label">Idioma</label>
                <select class="form-select" id="idioma" name="idioma">
                  <option value="es" ${config.idioma === 'es' ? 'selected' : ''}>Espanol</option>
                  <option value="en" ${config.idioma === 'en' ? 'selected' : ''}>English</option>
                  <option value="pt" ${config.idioma === 'pt' ? 'selected' : ''}>Portugues</option>
                </select>
              </div>

              <div class="form-check form-switch mb-3">
                <input class="form-check-input" type="checkbox" id="temaOscuro" ${config.temaOscuro ? 'checked' : ''}>
                <label class="form-check-label" for="temaOscuro">Modo oscuro</label>
              </div>

              <button class="btn btn-primary" id="guardarConfiguracionBtn">Guardar Configuracion</button>
            </div>
          </div>
        </div>

        <div class="col-12 col-lg-6 mb-4">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <h5 class="card-title mb-3">Seguridad</h5>

              <div class="form-check form-switch mb-3">
                <input class="form-check-input" type="checkbox" id="autenticacionDos" ${config.autenticacionDos ? 'checked' : ''}>
                <label class="form-check-label" for="autenticacionDos">Autenticacion en dos pasos</label>
                <small class="d-block text-muted mt-1">Agrega una capa extra de seguridad a tu cuenta</small>
              </div>

              <hr>

              <p class="small text-muted mb-3">Estado: Tu cuenta esta segura</p>
              <button class="btn btn-outline-secondary btn-sm">Ver Actividad Reciente</button>
            </div>
          </div>
        </div>
      </div>

      <div class="card border-0 shadow-sm">
        <div class="card-body">
          <h5 class="card-title mb-3">Sesiones Activas</h5>
          <p class="text-muted small mb-3">Gestiona todos los dispositivos donde has iniciado sesion</p>

          <div class="table-responsive">
            <table class="table table-sm table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th>Dispositivo</th>
                  <th>Ubicacion</th>
                  <th>Ultima actividad</th>
                  <th>Accion</th>
                </tr>
              </thead>
              <tbody>
                ${config.sesiones
                  .map(
                    (sesion) => `
                      <tr>
                        <td class="small"><strong>${escapeHtml(sesion.dispositivo)}</strong></td>
                        <td class="small">${escapeHtml(sesion.ubicacion)}</td>
                        <td class="small">${escapeHtml(sesion.fecha)}</td>
                        <td>
                          ${
                            sesion.fecha === 'Hoy'
                              ? '<span class="badge bg-success">Actual</span>'
                              : `<button class="btn btn-sm btn-outline-danger" data-action="cerrar-sesion" data-sesion-id="${sesion.id}">Cerrar</button>`
                          }
                        </td>
                      </tr>
                    `,
                  )
                  .join('')}
              </tbody>
            </table>
          </div>

          <div class="mt-3">
            <button class="btn btn-outline-danger btn-sm" id="cerrarTodasSesionesBtn">Cerrar todas las otras sesiones</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

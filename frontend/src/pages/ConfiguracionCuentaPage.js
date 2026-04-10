export function renderConfiguracionCuentaPage({
  state,
  escapeHtml,
  encabezadoInterno,
  profileImage,
  profileName,
}) {
  const config = state.configuracion;

  return `
    ${encabezadoInterno({
      pageTitle: '',
      profileImage,
      profileName,
      currentRole: 'Usuario',
      isAsesor: false,
    })}

    <div class="container py-4">
      <div class="row">
        <div class="col-12 col-lg-6 mb-4">
          <div class="card border-0 shadow-sm h-100" style="border-radius: 15px;">
            <div class="card-body p-4 p-md-5">
              <h5 class="fw-bold mb-4 text-dark border-bottom pb-3">Configuración de la App</h5>

              <div class="mb-3">
                <label for="moneda" class="form-label fw-semibold text-muted small text-uppercase" style="letter-spacing: 0.5px;">Moneda Principal</label>
                <select class="form-select form-select-lg bg-light border-0" id="moneda" name="moneda" style="border-radius: 8px; font-size: 1rem;">
                  <option value="USD" ${config.moneda === 'USD' ? 'selected' : ''}>Dolar USD</option>
                  <option value="ARS" ${config.moneda === 'ARS' ? 'selected' : ''}>Peso Argentino</option>
                  <option value="EUR" ${config.moneda === 'EUR' ? 'selected' : ''}>Euro</option>
                </select>
              </div>

              <div class="mb-4">
                <label for="idioma" class="form-label fw-semibold text-muted small text-uppercase" style="letter-spacing: 0.5px;">Idioma</label>
                <select class="form-select form-select-lg bg-light border-0" id="idioma" name="idioma" style="border-radius: 8px; font-size: 1rem;">
                  <option value="es" ${config.idioma === 'es' ? 'selected' : ''}>Espanol</option>
                  <option value="en" ${config.idioma === 'en' ? 'selected' : ''}>English</option>
                  <option value="pt" ${config.idioma === 'pt' ? 'selected' : ''}>Portugues</option>
                </select>
              </div>

              <div class="form-check form-switch mb-4 d-flex align-items-center gap-2">
                <input class="form-check-input mt-0" type="checkbox" id="temaOscuro" ${config.temaOscuro ? 'checked' : ''} style="width: 2.5em; height: 1.25em; cursor: pointer;">
                <label class="form-check-label fw-semibold text-dark" for="temaOscuro" style="cursor: pointer;">Modo Oscuro</label>
              </div>

              <div class="d-flex justify-content-start">
                <button class="btn btn-primary fw-bold px-4 py-2" style="border-radius: 8px;" id="guardarConfiguracionBtn">Guardar Configuración</button>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-lg-6 mb-4">
          <div class="card border-0 shadow-sm h-100" style="border-radius: 15px;">
            <div class="card-body p-4 p-md-5">
              <h5 class="fw-bold mb-4 text-dark border-bottom pb-3">Seguridad de la App</h5>

              <div class="form-check form-switch mb-4 d-flex align-items-start gap-2">
                <input class="form-check-input mt-1" type="checkbox" id="autenticacionDos" ${config.autenticacionDos ? 'checked' : ''} style="width: 2.5em; height: 1.25em; cursor: pointer;">
                <div>
                  <label class="form-check-label fw-semibold text-dark" for="autenticacionDos" style="cursor: pointer;">Autenticación en Dos Pasos</label>
                  <small class="d-block text-muted">Agrega una capa extra de seguridad a tu cuenta.</small>
                </div>
              </div>

              <div class="alert bg-success bg-opacity-10 border-0 text-success d-flex align-items-center gap-3 p-3 mb-4" style="border-radius: 8px;">
                <i class="lni lni-shield fs-4"></i>
                <div>
                  <strong class="d-block">Estado de Seguridad</strong>
                  <small>Tu cuenta está protegida actualmente.</small>
                </div>
              </div>
              <button class="btn btn-outline-dark fw-bold px-4 py-2 w-100" style="border-radius: 8px;">Ver Actividad Reciente</button>
            </div>
          </div>
        </div>
      </div>

      <div class="card border-0 shadow-sm" style="border-radius: 15px;">
        <div class="card-body p-4 p-md-5">
          <h5 class="fw-bold mb-1 text-dark">Sesiones Activas</h5>
          <p class="text-muted small mb-3">Gestiona todos los dispositivos donde has iniciado sesion</p>

          <div class="table-responsive rounded-3 border">
            <table class="table table-hover mb-0 align-middle">
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
                        <td class="py-3 px-3"><strong>${escapeHtml(sesion.dispositivo)}</strong></td>
                        <td class="py-3 text-muted">${escapeHtml(sesion.ubicacion)}</td>
                        <td class="py-3 text-muted">${escapeHtml(sesion.fecha)}</td>
                        <td class="py-3 text-end pe-3">
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

          <div class="mt-4">
            <button class="btn btn-outline-danger fw-bold px-4 py-2" style="border-radius: 8px;" id="cerrarTodasSesionesBtn">Cerrar otras sesiones</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

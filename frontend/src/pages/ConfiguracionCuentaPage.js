import { renderDashboardAppLayout } from "../components/dashboard/dashboardAppLayout";

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function renderConfiguracionCuentaPage({
  state,
  profileImage,
  profileName,
}) {
  const config = state.configuracion;

  const content = `
    <div class="gd-grid-2">
      <article class="gd-card">
        <h2 class="gd-card-title mb-3">Preferencias de la app</h2>
        <div class="gd-form-grid">
          <div>
            <label class="gd-form-label" for="moneda">Moneda principal</label>
            <select id="moneda" name="moneda" class="gd-form-select">
              <option value="USD" ${config.moneda === "USD" ? "selected" : ""}>Dolar USD</option>
              <option value="ARS" ${config.moneda === "ARS" ? "selected" : ""}>Peso argentino</option>
              <option value="EUR" ${config.moneda === "EUR" ? "selected" : ""}>Euro</option>
            </select>
          </div>
          <div>
            <label class="gd-form-label" for="idioma">Idioma</label>
            <select id="idioma" name="idioma" class="gd-form-select">
              <option value="es" ${config.idioma === "es" ? "selected" : ""}>Espanol</option>
              <option value="en" ${config.idioma === "en" ? "selected" : ""}>English</option>
              <option value="pt" ${config.idioma === "pt" ? "selected" : ""}>Portugues</option>
            </select>
          </div>
          <div class="gd-form-full d-flex align-items-center justify-content-between border rounded-3 px-3 py-2" style="border-color: var(--gd-border) !important;">
            <div>
              <p class="gd-card-title mb-0" style="font-size: 0.75rem;">Modo oscuro</p>
              <small class="gd-muted">Activa el tema oscuro para paneles internos.</small>
            </div>
            <input class="form-check-input mt-0" type="checkbox" id="temaOscuro" ${config.temaOscuro ? "checked" : ""}>
          </div>
          <div class="gd-form-full d-flex justify-content-end mt-1">
            <button type="button" class="gd-btn-primary" id="guardarConfiguracionBtn">Guardar configuracion</button>
          </div>
        </div>
      </article>

      <article class="gd-card">
        <h2 class="gd-card-title mb-3">Seguridad</h2>
        <div class="d-flex align-items-center justify-content-between border rounded-3 px-3 py-2 mb-3" style="border-color: var(--gd-border) !important;">
          <div>
            <p class="gd-card-title mb-0" style="font-size: 0.75rem;">Autenticacion en dos pasos</p>
            <small class="gd-muted">Agrega una verificacion extra al iniciar sesion.</small>
          </div>
          <input class="form-check-input mt-0" type="checkbox" id="autenticacionDos" ${config.autenticacionDos ? "checked" : ""}>
        </div>

        <div class="rounded-3 p-3" style="background: rgba(30, 64, 175, 0.12); border: 1px solid rgba(59, 130, 246, 0.35);">
          <p class="gd-card-title mb-1" style="font-size: 0.75rem;">Estado de seguridad</p>
          <small class="gd-muted">Tu cuenta tiene las protecciones activas correctamente.</small>
        </div>
      </article>
    </div>

    <article class="gd-card">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mb-3">
        <div>
          <h2 class="gd-card-title mb-1">Sesiones activas</h2>
          <p class="gd-muted mb-0">Gestiona los dispositivos que tienen acceso a tu cuenta.</p>
        </div>
        <button type="button" class="gd-btn-secondary" id="cerrarTodasSesionesBtn">Cerrar otras sesiones</button>
      </div>

      <div class="table-responsive">
        <table class="gd-table">
          <thead>
            <tr>
              <th>Dispositivo</th>
              <th>Ubicacion</th>
              <th>Ultima actividad</th>
              <th class="gd-right">Accion</th>
            </tr>
          </thead>
          <tbody>
            ${config.sesiones
              .map(
                (sesion) => `
                  <tr>
                    <td>${escapeHtml(sesion.dispositivo)}</td>
                    <td class="gd-muted">${escapeHtml(sesion.ubicacion)}</td>
                    <td class="gd-muted">${escapeHtml(sesion.fecha)}</td>
                    <td class="gd-right">
                      ${
                        sesion.fecha === "Hoy"
                          ? '<span class="gd-pill gd-pill-transporte">Actual</span>'
                          : `<button type="button" class="gd-action-btn danger" data-action="cerrar-sesion" data-sesion-id="${escapeHtml(sesion.id)}">Cerrar</button>`
                      }
                    </td>
                  </tr>
                `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </article>
  `;

  return renderDashboardAppLayout({
    activePath: "/perfil/configuracion",
    pageTitle: "Configuracion de cuenta",
    pageSubtitle: "Preferencias, seguridad y control de sesiones",
    content,
    profileImage,
    profileName,
    notificationCount: state.finanzas?.recomendaciones?.length || 0,
  });
}

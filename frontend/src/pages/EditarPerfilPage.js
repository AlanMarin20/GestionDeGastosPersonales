export function renderEditarPerfilPage({
  state,
  escapeHtml,
  encabezadoInterno,
  profileImage,
  profileName,
  currentRole,
  brandTarget,
}) {
  const perfil = state.perfil;

  return `
    ${encabezadoInterno({
      pageTitle: '',
      profileImage,
      profileName,
      currentRole,
      isAsesor: false,
      brandTarget,
    })}

    <div class="container py-4">
      <div class="row">
        <div class="col-12 col-lg-4 mb-4">
          <div class="card border-0 shadow-sm h-100" style="border-radius: 15px;">
            <div class="card-body p-4 text-center d-flex flex-column align-items-center justify-content-center">
              <div class="position-relative mb-4">
                <img src="${escapeHtml(perfil.imagePreview)}" alt="Perfil" class="rounded-circle border border-4 border-white shadow" style="width:150px;height:150px;object-fit:cover">
                <label for="imageInput" class="position-absolute bottom-0 end-0 btn btn-primary rounded-circle shadow-sm d-flex align-items-center justify-content-center" style="width: 40px; height: 40px; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                  <i class="lni lni-camera text-white"></i>
                </label>
                <input type="file" id="imageInput" class="d-none" accept="image/*">
              </div>
              <h5 class="fw-bold mb-1 text-dark">${escapeHtml(perfil.nombre)}</h5>
              <p class="text-muted mb-3">${escapeHtml(perfil.email)}</p>
              <span class="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill fw-semibold">Cuenta Activa</span>
            </div>
          </div>
        </div>

        <div class="col-12 col-lg-8">
          <div class="card border-0 shadow-sm mb-4" style="border-radius: 15px;">
            <div class="card-body p-4 p-md-5">
              <h5 class="fw-bold mb-4 text-dark border-bottom pb-3">Información Personal</h5>
              <form id="perfilForm">
                <div class="row">
                  <div class="col-12 mb-3">
                    <label for="nombre" class="form-label fw-semibold text-muted small text-uppercase" style="letter-spacing: 0.5px;">Nombre Completo</label>
                    <input type="text" class="form-control form-control-lg bg-light border-0" id="nombre" name="nombre" value="${escapeHtml(perfil.nombre)}" style="border-radius: 8px; font-size: 16px;">
                  </div>
                  <div class="col-12 mb-4">
                    <label for="email" class="form-label fw-semibold text-muted small text-uppercase" style="letter-spacing: 0.5px;">Correo Electrónico</label>
                    <input type="email" class="form-control form-control-lg bg-light border-0" id="email" name="email" value="${escapeHtml(perfil.email)}" style="border-radius: 8px; font-size: 16px;">
                  </div>
                </div>
                <div class="d-flex justify-content-end">
                  <button type="submit" class="btn btn-primary fw-bold px-4 py-2" style="border-radius: 8px;">Guardar Cambios</button>
                </div>
              </form>
            </div>
          </div>

          <div class="card border-0 shadow-sm" style="border-radius: 15px;">
            <div class="card-body p-4 p-md-5">
              <h5 class="fw-bold mb-4 text-dark border-bottom pb-3">Seguridad de la Cuenta</h5>
              <form id="passwordForm">
                <div class="mb-3">
                  <label for="actual" class="form-label fw-semibold text-muted small text-uppercase" style="letter-spacing: 0.5px;">Contraseña Actual</label>
                  <input type="password" class="form-control form-control-lg bg-light border-0" id="actual" name="actual" value="${escapeHtml(perfil.passwordData.actual)}" style="border-radius: 8px; font-size: 16px;">
                </div>
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="nueva" class="form-label fw-semibold text-muted small text-uppercase" style="letter-spacing: 0.5px;">Nueva Contraseña</label>
                    <input type="password" class="form-control form-control-lg bg-light border-0" id="nueva" name="nueva" value="${escapeHtml(perfil.passwordData.nueva)}" style="border-radius: 8px; font-size: 16px;">
                  </div>
                  <div class="col-md-6 mb-4">
                    <label for="confirmar" class="form-label fw-semibold text-muted small text-uppercase" style="letter-spacing: 0.5px;">Confirmar Contraseña</label>
                    <input type="password" class="form-control form-control-lg bg-light border-0" id="confirmar" name="confirmar" value="${escapeHtml(perfil.passwordData.confirmar)}" style="border-radius: 8px; font-size: 16px;">
                  </div>
                </div>
                <div class="d-flex justify-content-end">
                  <button type="submit" class="btn btn-dark fw-bold px-4 py-2" style="border-radius: 8px;">Actualizar Contraseña</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

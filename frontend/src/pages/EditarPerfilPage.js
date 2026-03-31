export function renderEditarPerfilPage({ state, escapeHtml, encabezado }) {
  const perfil = state.perfil;

  return `
    <div class="container py-4">
      ${
        encabezado({
          title: 'Editar Perfil',
          subtitle: 'Actualiza tu informacion personal',
          backAction: 'back',
        })
      }

      <div class="row">
        <div class="col-12 col-md-4 mb-4">
          <div class="card border-0 shadow-sm">
            <div class="card-body text-center">
              <div class="mb-3">
                <img src="${escapeHtml(perfil.imagePreview)}" alt="Perfil" class="rounded-circle" style="width:150px;height:150px;object-fit:cover">
              </div>
              <h5 class="card-title">${escapeHtml(perfil.nombre)}</h5>
              <p class="text-muted small mb-3">${escapeHtml(perfil.email)}</p>
              <label for="imageInput" class="btn btn-primary btn-sm">Cambiar Imagen</label>
              <input type="file" id="imageInput" class="d-none" accept="image/*">
            </div>
          </div>
        </div>

        <div class="col-12 col-md-8">
          <div class="card border-0 shadow-sm mb-3">
            <div class="card-body">
              <h5 class="card-title mb-3">Informacion Personal</h5>
              <form id="perfilForm">
                <div class="mb-3">
                  <label for="nombre" class="form-label">Nombre Completo</label>
                  <input type="text" class="form-control" id="nombre" name="nombre" value="${escapeHtml(perfil.nombre)}">
                </div>
                <div class="mb-3">
                  <label for="email" class="form-label">Correo Electronico</label>
                  <input type="email" class="form-control" id="email" name="email" value="${escapeHtml(perfil.email)}">
                </div>
                <button type="submit" class="btn btn-primary">Guardar Cambios</button>
              </form>
            </div>
          </div>

          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <h5 class="card-title mb-3">Cambiar Contrasena</h5>
              <form id="passwordForm">
                <div class="mb-3">
                  <label for="actual" class="form-label">Contrasena Actual</label>
                  <input type="password" class="form-control" id="actual" name="actual" value="${escapeHtml(perfil.passwordData.actual)}">
                </div>
                <div class="mb-3">
                  <label for="nueva" class="form-label">Nueva Contrasena</label>
                  <input type="password" class="form-control" id="nueva" name="nueva" value="${escapeHtml(perfil.passwordData.nueva)}">
                </div>
                <div class="mb-3">
                  <label for="confirmar" class="form-label">Confirmar Contrasena</label>
                  <input type="password" class="form-control" id="confirmar" name="confirmar" value="${escapeHtml(perfil.passwordData.confirmar)}">
                </div>
                <button type="submit" class="btn btn-warning">Actualizar Contrasena</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

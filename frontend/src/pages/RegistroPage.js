export function renderRegistroPage({ renderAppHeader }) {
  return `
    <div class="registro-page min-vh-100 d-flex flex-column">
      ${renderAppHeader({ brandAction: "/" })}
      <main class="flex-grow-1 d-flex align-items-center justify-content-center py-5">
        <div class="container">
          <div class="row justify-content-center">
            <div class="col-12 col-sm-10 col-md-8 col-lg-5">
              <div class="card border-0 shadow-sm login-content-card">
                <div class="card-body p-4 p-md-5">
                  <h1 class="h3 mb-4 text-center">Crear Cuenta</h1>
                  <form id="registroForm">
                    <div id="registroError" class="alert alert-danger d-none small p-2 text-center" role="alert"></div>
                    <div class="mb-3">
                      <label for="nombre" class="form-label">Nombre completo</label>
                      <input type="text" class="form-control form-control-lg" id="nombre" placeholder="Ej: Juan Perez" required>
                    </div>
                    <div class="mb-3">
                      <label for="email" class="form-label">Email</label>
                      <input type="email" class="form-control form-control-lg" id="email" placeholder="ejemplo@correo.com" required>
                    </div>
                    <div class="mb-3">
                      <label for="contrasena" class="form-label">Contrasena</label>
                      <input type="password" class="form-control form-control-lg" id="contrasena" placeholder="********" required>
                    </div>
                    <div class="mb-4">
                      <label for="confirmarContrasena" class="form-label">Confirmar Contrasena</label>
                      <input type="password" class="form-control form-control-lg" id="confirmarContrasena" placeholder="********" required>
                    </div>
                    <button type="submit" class="btn btn-primary btn-lg w-100 mb-3">Registrarse</button>
                  </form>
                  <div class="text-center">
                    <p class="text-muted mb-0">
                      Ya tenes cuenta?
                      <a href="/login" data-link class="text-primary text-decoration-none fw-semibold">Iniciar Sesion</a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `;
}

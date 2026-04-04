export function renderLoginPage({ renderAppHeader }) {
  return `
    <div class="login-page min-vh-100 d-flex flex-column">
      ${renderAppHeader({ brandAction: "/" })}
      <main class="flex-grow-1 d-flex align-items-center justify-content-center py-5">
        <div class="container">
          <div class="row justify-content-center">
            <div class="col-12 col-sm-10 col-md-8 col-lg-5">
              <div class="card border-0 shadow-sm login-content-card">
                <div class="card-body p-4 p-md-5">
                  <h1 class="h3 mb-4 text-center">Iniciar Sesion</h1>
                  <form id="loginForm">
                    <div id="loginError" class="alert alert-danger d-none small p-2 text-center" role="alert"></div>
                    <div class="mb-3">
                      <label for="email" class="form-label">Email</label>
                      <input type="email" class="form-control form-control-lg" id="email" placeholder="ejemplo@correo.com" required>
                    </div>
                    <div class="mb-4">
                      <label for="contrasena" class="form-label">Contrasena</label>
                      <input type="password" class="form-control form-control-lg" id="contrasena" placeholder="********" required>
                    </div>
                    <button type="submit" class="btn btn-primary btn-lg w-100 mb-3">Iniciar Sesion</button>
                  </form>
                  <div class="text-center">
                    <p class="text-muted mb-0">
                      No tenes cuenta?
                      <a href="/registro" data-link class="text-primary text-decoration-none fw-semibold">Registrarse</a>
                    </p>
                  </div>
                  <div class="position-relative my-4">
                    <hr>
                    <span class="position-absolute top-50 start-50 translate-middle bg-white px-2 text-muted small">O</span>
                  </div>
                  <button type="button" class="btn btn-outline-secondary btn-lg w-100" disabled>
                    Continuar con Google
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `;
}

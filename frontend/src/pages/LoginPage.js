export function renderLoginPage({ renderAppHeader }) {
  return `
    <div class="login-page min-vh-100 position-relative overflow-hidden" style="background-color: #e2e8f0;">
      <!-- ======== bg-shapes (Efecto moderno sin imagenes) ======== -->
      <div class="position-absolute rounded-circle" style="width: 50vw; height: 50vw; max-width: 600px; max-height: 600px; background: linear-gradient(135deg, rgba(13, 110, 253, 0.4) 0%, rgba(13, 110, 253, 0.05) 100%); top: -10%; left: -10%; z-index: 0; filter: blur(40px);"></div>
      <div class="position-absolute rounded-circle" style="width: 40vw; height: 40vw; max-width: 500px; max-height: 500px; background: linear-gradient(135deg, rgba(25, 135, 84, 0.4) 0%, rgba(25, 135, 84, 0.05) 100%); bottom: -5%; right: -5%; z-index: 0; filter: blur(40px);"></div>

      <!-- ======== header start ======== -->
      <header class="header position-relative" style="z-index: 1;">
        <div class="navbar-area">
          <div class="container">
            <div class="row align-items-center">
              <div class="col-lg-12">
                <nav class="navbar navbar-expand-lg d-flex justify-content-between py-3">
                  <a class="navbar-brand" href="/" data-link>
                    <img src="/assets/img/logo/logo.svg" alt="Logo" />
                  </a>
                  <a href="/" data-link class="main-btn border-btn btn-hover btn-sm">Volver al Inicio</a>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </header>
      <!-- ======== header end ======== -->

      <!-- ======== login-section start ======== -->
      <section class="login-section pt-150 pb-120 position-relative" style="z-index: 1;">
        <div class="container">
          <div class="row justify-content-center">
            <div class="col-12 col-md-8 col-lg-5">
              <div class="card border-0 shadow-lg" style="border-radius: 15px;">
                <div class="card-body p-5">
                  <div class="section-title text-center mb-30">
                    <h3 class="mb-15">¡Bienvenido de nuevo!</h3>
                    <p>Ingresa a tu cuenta para gestionar tus gastos.</p>
                  </div>

                  <form id="loginForm">
                    <div id="loginError" class="alert alert-danger d-none small p-2 text-center" role="alert"></div>
                    
                    <div class="mb-4">
                      <label for="email" class="form-label fw-bold">Correo Electrónico</label>
                      <input type="email" class="form-control form-control-lg" id="email" placeholder="ejemplo@correo.com" required style="border-radius: 8px;">
                    </div>
                    
                    <div class="mb-4">
                      <label for="contrasena" class="form-label fw-bold">Contraseña</label>
                      <input type="password" class="form-control form-control-lg" id="contrasena" placeholder="********" required style="border-radius: 8px;">
                    </div>
                    
                    <button type="submit" class="main-btn btn-hover w-100 mb-4" style="border-radius: 8px;">Iniciar Sesión</button>
                  </form>
                  
                  <div class="text-center">
                    <p class="text-muted mb-0">
                      ¿No tienes cuenta?
                      <a href="/registro" data-link class="text-primary fw-bold text-decoration-none">Regístrate aquí</a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </section>
    </div>
  `;
}

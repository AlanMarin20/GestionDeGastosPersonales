export function renderLoginPage({ encabezadoExterno, botonIniciarCrearCuenta }) {
  return `
    <div class="login-page min-vh-100 position-relative overflow-hidden" style="background-color: #e2e8f0;">
      <!-- ======== bg-shapes (Efecto moderno sin imagenes) ======== -->
      <div class="position-absolute rounded-circle" style="width: 50vw; height: 50vw; max-width: 600px; max-height: 600px; background: linear-gradient(135deg, rgba(13, 110, 253, 0.4) 0%, rgba(13, 110, 253, 0.05) 100%); top: -10%; left: -10%; z-index: 0; filter: blur(40px); pointer-events: none;"></div>
      <div class="position-absolute rounded-circle" style="width: 40vw; height: 40vw; max-width: 500px; max-height: 500px; background: linear-gradient(135deg, rgba(25, 135, 84, 0.4) 0%, rgba(25, 135, 84, 0.05) 100%); bottom: -5%; right: -5%; z-index: 0; filter: blur(40px); pointer-events: none;"></div>

      ${encabezadoExterno({ rightHref: '/', rightText: 'Volver al Inicio', rightClass: 'auth-back-btn', withLightBackground: true })}

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
                    
                    ${botonIniciarCrearCuenta({
                      text: 'Iniciar Sesión',
                      type: 'submit',
                      className: 'main-btn btn-hover w-100 mb-4',
                      style: 'border-radius: 8px;',
                    })}
                  </form>

                  <div class="text-center">
                    <p class="text-muted mb-0">
                      ¿No tienes cuenta? <a href="/registro" data-link class="text-primary fw-bold text-decoration-none">Registrate aqui</a><br>
                      o
                    </p>
                  </div>

                  ${botonIniciarCrearCuenta({
                    text: 'Iniciar con Google',
                    type: 'button',
                    className: 'btn btn-outline-dark w-100 mb-2 fw-semibold',
                    style: 'border-radius: 10px; min-height: 46px; background-color: #fff; box-shadow: 0 4px 14px rgba(15, 23, 42, 0.08);',
                    iconHtml: '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.2-1.4 3.5-5.4 3.5-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.8 0 3 .8 3.7 1.5l2.5-2.4C16.6 3.2 14.5 2.2 12 2.2 6.9 2.2 2.8 6.4 2.8 11.6S6.9 21 12 21c6.9 0 9.1-4.8 9.1-7.3 0-.5 0-.8-.1-1.2H12z"/><path fill="#4285F4" d="M21.6 12.3c0-.7-.1-1.4-.2-2.1H12v4h5.4c-.2 1.1-.9 2.1-1.8 2.8v2.3h2.9c1.7-1.6 3.1-4 3.1-7z"/><path fill="#FBBC05" d="M12 22c2.5 0 4.6-.8 6.1-2.1l-2.9-2.3c-.8.6-1.9 1-3.2 1-2.5 0-4.6-1.7-5.4-4H3.6v2.5C5.1 19.7 8.3 22 12 22z"/><path fill="#34A853" d="M6.6 14.6c-.2-.7-.4-1.4-.4-2.1s.1-1.4.4-2.1V7.9H3.6C2.9 9.2 2.5 10.6 2.5 12s.4 2.8 1.1 4.1l3-1.5z"/></svg>',
                  })}

                  </div>
                </div>
              </div>
            </div>
          </div>
      </section>

    </div>
  `;
}

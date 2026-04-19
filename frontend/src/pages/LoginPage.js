export function renderLoginPage({ encabezadoExterno, botonIniciarCrearCuenta }) {
  // OAuth de terceros (Google/Apple) deshabilitado temporalmente.
  const socialAuthButtons = "";

  /*
  const socialAuthButtons = `
    ${botonIniciarCrearCuenta({
      text: 'Iniciar con Google',
      type: 'button',
      className: 'btn btn-outline-dark google-auth-btn w-100 mb-2 fw-semibold',
      style: 'border-radius: 10px; min-height: 46px; background-color: #fff; box-shadow: 0 4px 14px rgba(15, 23, 42, 0.08);',
      id: 'loginGoogleBtn',
      iconHtml: '<svg ...></svg>',
    })}

    ${botonIniciarCrearCuenta({
      text: 'Iniciar con Apple',
      type: 'button',
      className: 'btn btn-outline-light apple-auth-btn w-100 mb-2 fw-semibold',
      style: 'border-radius: 10px; min-height: 46px;',
      id: 'loginAppleBtn',
      iconHtml: '<svg ...></svg>',
    })}
  `;
  */

  return `
    <div class="login-page min-vh-100 position-relative overflow-hidden" style="background-color: var(--app-surface-bg);">
      <!-- ======== bg-shapes (Efecto moderno sin imagenes) ======== -->
      <div class="position-absolute rounded-circle" style="width: 50vw; height: 50vw; max-width: 600px; max-height: 600px; background: linear-gradient(135deg, rgba(13, 110, 253, 0.4) 0%, rgba(13, 110, 253, 0.05) 100%); top: -10%; left: -10%; z-index: 0; filter: blur(40px); pointer-events: none;"></div>
      <div class="position-absolute rounded-circle" style="width: 40vw; height: 40vw; max-width: 500px; max-height: 500px; background: linear-gradient(135deg, rgba(25, 135, 84, 0.4) 0%, rgba(25, 135, 84, 0.05) 100%); bottom: -5%; right: -5%; z-index: 0; filter: blur(40px); pointer-events: none;"></div>

      ${encabezadoExterno({ rightHref: '/', rightText: 'Volver al Inicio', rightClass: 'landing-access-btn', withLightBackground: true })}

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
                    <div id="loginError" class="alert alert-danger auth-error-alert d-none small p-2 text-center" role="alert"></div>
                    
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

                  ${socialAuthButtons}

                  </div>
                </div>
              </div>
            </div>
          </div>
      </section>

    </div>
  `;
}

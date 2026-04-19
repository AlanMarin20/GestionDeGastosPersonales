export function renderRegistroPage({ encabezadoExterno, botonIniciarCrearCuenta }) {
  // OAuth de terceros (Google/Apple) deshabilitado temporalmente.
  const socialRegisterMarkup = "";

  /*
  const socialRegisterMarkup = `
    <div class="text-center mb-4">
      <p class="text-muted mb-3">o regístrate con</p>
      ${botonIniciarCrearCuenta({
        text: 'Registrarse con Google',
        type: 'button',
        className: 'btn btn-outline-dark google-auth-btn w-100 mb-2 fw-semibold',
        style: 'border-radius: 10px; min-height: 46px; background-color: #fff; box-shadow: 0 4px 14px rgba(15, 23, 42, 0.08);',
        id: 'registerGoogleBtn',
        iconHtml: '<svg ...></svg>',
      })}
      ${botonIniciarCrearCuenta({
        text: 'Registrarse con Apple',
        type: 'button',
        className: 'btn btn-outline-light apple-auth-btn w-100 fw-semibold',
        style: 'border-radius: 10px; min-height: 46px;',
        id: 'registerAppleBtn',
        iconHtml: '<svg ...></svg>',
      })}
    </div>
  `;
  */

  return `
    <div class="login-page min-vh-100 position-relative overflow-hidden" style="background-color: var(--app-surface-bg);">
      <!-- ======== bg-shapes (Efecto moderno sin imagenes) ======== -->
      <div class="position-absolute rounded-circle" style="width: 50vw; height: 50vw; max-width: 600px; max-height: 600px; background: linear-gradient(135deg, rgba(13, 110, 253, 0.4) 0%, rgba(13, 110, 253, 0.05) 100%); top: -10%; left: -10%; z-index: 0; filter: blur(40px); pointer-events: none;"></div>
      <div class="position-absolute rounded-circle" style="width: 40vw; height: 40vw; max-width: 500px; max-height: 500px; background: linear-gradient(135deg, rgba(25, 135, 84, 0.4) 0%, rgba(25, 135, 84, 0.05) 100%); bottom: -5%; right: -5%; z-index: 0; filter: blur(40px); pointer-events: none;"></div>

      ${encabezadoExterno({ rightHref: '/', rightText: 'Volver al Inicio', rightClass: 'landing-access-btn', withLightBackground: true })}

      <!-- ======== signup-section start ======== -->
      <section class="login-section pt-150 pb-120 position-relative" style="z-index: 1;">
        <div class="container">
          <div class="row justify-content-center">
            <div class="col-12 col-md-8 col-lg-5">
              <div class="card border-0 shadow-lg" style="border-radius: 15px;">
                <div class="card-body p-5">
                  <div class="section-title text-center mb-30">
                    <h3 class="mb-15">Crea tu cuenta</h3>
                    <p>Comienza a tomar el control de tus finanzas hoy mismo.</p>
                  </div>

                  <form id="registroForm" novalidate>
                    <div id="registroError" class="alert alert-danger auth-error-alert d-none small p-2 text-center" role="alert"></div>
                    
                    <div class="mb-3">
                      <label for="nombre" class="form-label fw-bold">Nombre Completo</label>
                      <input type="text" class="form-control form-control-lg" id="nombre" placeholder="Juan Pérez" required style="border-radius: 8px;">
                    </div>

                    <div class="mb-3">
                      <label for="email" class="form-label fw-bold">Correo Electrónico</label>
                      <input type="email" class="form-control form-control-lg" id="email" placeholder="ejemplo@correo.com" required style="border-radius: 8px;">
                    </div>
                    
                    <div class="row">
                      <div class="col-md-6 mb-4">
                        <label for="contrasena" class="form-label fw-bold">Contraseña</label>
                        <input type="password" class="form-control form-control-lg" id="contrasena" placeholder="********" required style="border-radius: 8px;">
                      </div>
                      
                      <div class="col-md-6 mb-4">
                        <label for="confirmarContrasena" class="form-label fw-bold">Confirmar</label>
                        <input type="password" class="form-control form-control-lg" id="confirmarContrasena" placeholder="********" required style="border-radius: 8px;">
                      </div>
                    </div>
                    
                    ${botonIniciarCrearCuenta({
                      text: 'Crear Cuenta',
                      type: 'submit',
                      className: 'main-btn btn-hover w-100 mt-3 mb-3',
                      style: 'border-radius: 8px;',
                    })}
                  </form>

                  ${socialRegisterMarkup}
                  
                  <div class="text-center mt-4">
                    <p class="text-muted mb-0">
                      ¿Ya tienes una cuenta?
                      <a href="/login" data-link class="text-primary fw-bold text-decoration-none">Inicia sesión</a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  `;
}

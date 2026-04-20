export function renderRegistroExitosoPage({ encabezadoExterno, fondoDecorativoAuth }) {
  return `
    <div class="login-page min-vh-100 position-relative overflow-hidden fp-auth-page-shell">
      ${fondoDecorativoAuth()}

      ${encabezadoExterno({ rightHref: '/', rightText: 'Volver al Inicio', rightClass: 'landing-access-btn', withLightBackground: true })}

      <section class="login-section pt-150 pb-120 position-relative fp-auth-content-section">
        <div class="container">
          <div class="row justify-content-center">
            <div class="col-12 col-md-8 col-lg-5">
              <div class="card border-0 shadow-lg fp-auth-card">
                <div class="card-body p-5 text-center">
                  <div class="d-inline-flex align-items-center justify-content-center rounded-circle mb-4 fp-registro-exito-badge">
                    <span aria-hidden="true" class="fp-registro-exito-mark">✓</span>
                  </div>

                  <h3 class="mb-3">Cuenta creada con éxito</h3>
                  <p class="text-muted mb-4">Tu cuenta ya está lista. Ahora puedes iniciar sesión y comenzar a gestionar tus finanzas.</p>
                  <p class="small text-muted mb-4">Serás redirigido automáticamente en <span id="registroExitosoCountdown" class="fw-bold">5</span> segundos.</p>

                  <a href="/login" data-link class="main-btn btn-hover w-100 mb-3 fp-auth-primary-btn">
                    Ir a Iniciar Sesión
                  </a>

                  <a href="/" data-link class="btn btn-outline-secondary w-100 fw-semibold fp-auth-secondary-btn">
                    Volver al Inicio
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
}

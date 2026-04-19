export function renderRegistroExitosoPage({ encabezadoExterno }) {
  return `
    <div class="login-page min-vh-100 position-relative overflow-hidden" style="background-color: var(--app-surface-bg);">
      <div class="position-absolute rounded-circle" style="width: 50vw; height: 50vw; max-width: 600px; max-height: 600px; background: linear-gradient(135deg, rgba(13, 110, 253, 0.35) 0%, rgba(13, 110, 253, 0.04) 100%); top: -10%; left: -10%; z-index: 0; filter: blur(40px); pointer-events: none;"></div>
      <div class="position-absolute rounded-circle" style="width: 40vw; height: 40vw; max-width: 500px; max-height: 500px; background: linear-gradient(135deg, rgba(25, 135, 84, 0.35) 0%, rgba(25, 135, 84, 0.04) 100%); bottom: -5%; right: -5%; z-index: 0; filter: blur(40px); pointer-events: none;"></div>

      ${encabezadoExterno({ rightHref: '/', rightText: 'Volver al Inicio', rightClass: 'landing-access-btn', withLightBackground: true })}

      <section class="login-section pt-150 pb-120 position-relative" style="z-index: 1;">
        <div class="container">
          <div class="row justify-content-center">
            <div class="col-12 col-md-8 col-lg-5">
              <div class="card border-0 shadow-lg" style="border-radius: 15px;">
                <div class="card-body p-5 text-center">
                  <div class="d-inline-flex align-items-center justify-content-center rounded-circle mb-4" style="width: 80px; height: 80px; background: rgba(34, 197, 94, 0.16); border: 1px solid rgba(34, 197, 94, 0.3);">
                    <span aria-hidden="true" style="font-size: 2.35rem; line-height: 1; color: #22c55e; font-weight: 800;">✓</span>
                  </div>

                  <h3 class="mb-3">Cuenta creada con éxito</h3>
                  <p class="text-muted mb-4">Tu cuenta ya está lista. Ahora puedes iniciar sesión y comenzar a gestionar tus finanzas.</p>
                  <p class="small text-muted mb-4">Serás redirigido automáticamente en <span id="registroExitosoCountdown" class="fw-bold">5</span> segundos.</p>

                  <a href="/login" data-link class="main-btn btn-hover w-100 mb-3" style="border-radius: 8px;">
                    Ir a Iniciar Sesión
                  </a>

                  <a href="/" data-link class="btn btn-outline-secondary w-100 fw-semibold" style="border-radius: 8px;">
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

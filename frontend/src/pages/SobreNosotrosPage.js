export function renderSobreNosotrosPage({ encabezadoExterno, botonEncabezadoExterno, botonScrollTop }) {
  const headerAuthMarkup = `
    <div class="landing-auth-group d-flex align-items-center gap-2 gap-md-3">
      <div class="landing-nav-links d-none d-lg-flex align-items-center gap-4 pe-2">
        <a href="/" data-link class="text-white text-decoration-none nav-link-hover">Inicio</a>
        <a href="/faqs" data-link class="text-white text-decoration-none nav-link-hover">FAQ's</a>
        <a href="/sobre-nosotros" data-link class="text-white text-decoration-none fw-bold" style="opacity: 1;">Sobre nosotros</a>
      </div>
      <span class="landing-auth-copy">Hace valer más tu dinero</span>
      ${botonEncabezadoExterno({
        href: "/login",
        text: "Iniciar sesión",
        className: "landing-access-btn landing-login-btn",
        sizeClass: "btn-sm",
      })}
      ${botonEncabezadoExterno({
        href: "/registro",
        text: "Registrarse",
        className: "landing-access-btn landing-register-btn",
        sizeClass: "btn-sm",
      })}
    </div>
  `;

  return `
    <div class="min-vh-100 d-flex flex-column" style="background-color: var(--app-surface-bg);">
      ${encabezadoExterno({
        rightHref: "/login",
        rightText: "Iniciar sesión",
        rightClass: "landing-access-btn landing-login-btn",
        rightMarkup: headerAuthMarkup,
      })}

      <div class="container flex-grow-1" style="padding-top: 120px; padding-bottom: 60px;">
        <div class="row g-4 justify-content-center">
          <div class="col-12 col-xl-10">
            <h1 class="fw-bold mb-3" style="color: var(--app-text-primary);">Sobre Nosotros</h1>
            <p class="text-muted mb-0">
              Proyecto desarrollado en la materia WEB 2 del Instituto Universitario Aeronáutico.
            </p>
          </div>

          <div class="col-12 col-xl-10">
            <div class="card border-0 shadow-sm" style="border-radius: 15px;">
              <div class="card-body p-4 p-md-5">
                <h5 class="fw-bold mb-3" style="color: var(--app-text-primary);">¿De qué trata FinanzasPro?</h5>
                <p class="text-muted mb-3">
                  En la actualidad, la gestión eficiente de las finanzas personales se ha vuelto una necesidad fundamental para las personas. Muchas decisiones económicas cotidianas se basan en la capacidad de analizar gastos, identificar patrones de consumo y optimizar el uso del dinero.
                </p>
                <p class="text-muted mb-3">
                  El objetivo de este proyecto es diseñar e implementar una plataforma web de gestión de gastos personales, que permita a los usuarios registrar sus gastos mediante la carga de tickets o comprobantes, mientras que un asesor financiero podrá analizar los patrones de consumo generados por los usuarios.
                </p>
                <p class="text-muted mb-0">
                  Como característica innovadora, el sistema incorpora el uso de inteligencia artificial para interpretar imágenes de tickets o facturas, extrayendo información relevante como monto, comercio, fecha y categoría del gasto.
                </p>
              </div>
            </div>
          </div>

          <div class="col-12 col-xl-10">
            <div class="card border-0 shadow-sm" style="border-radius: 15px;">
              <div class="card-body p-4 p-md-5">
                <h5 class="fw-bold mb-4" style="color: var(--app-text-primary);">Equipo de Desarrollo</h5>

                <div class="row g-4">
                  <div class="col-12 col-md-6">
                    <div class="border rounded-3 h-100 p-4" style="border-color: var(--app-border-color) !important;">
                      <div class="d-flex align-items-center gap-3 mb-3">
                        <img
                          src="/assets/img/about/joaquin-contreras.webp"
                          alt="Joaquin Contreras"
                          class="rounded-circle border"
                          style="width: 72px; height: 72px; object-fit: cover; border-color: var(--app-border-color) !important;"
                          onerror="this.onerror=null; this.src='/assets/img/user-avatar-default.svg';"
                        />
                        <div>
                          <h6 class="fw-bold mb-1" style="color: var(--app-text-primary);">Joaquin Contreras</h6>
                          <p class="text-muted mb-0 small">Desarrollador Web</p>
                        </div>
                      </div>

                      <div class="d-flex flex-column gap-2">
                        <a href="https://www.linkedin.com/in/joaquincontreras755" target="_blank" rel="noopener noreferrer" class="text-decoration-none faq-link">
                          <i class="lni lni-linkedin-original me-2"></i>LinkedIn
                        </a>
                        <a href="mailto:cjoaquin35@gmail.com" class="text-decoration-none faq-link">
                          <i class="lni lni-envelope me-2"></i>cjoaquin35@gmail.com
                        </a>
                      </div>
                    </div>
                  </div>

                  <div class="col-12 col-md-6">
                    <div class="border rounded-3 h-100 p-4" style="border-color: var(--app-border-color) !important;">
                      <div class="d-flex align-items-center gap-3 mb-3">
                        <img
                          src="/assets/img/about/alan-marin.webp"
                          alt="Alan Marin"
                          class="rounded-circle border"
                          style="width: 72px; height: 72px; object-fit: cover; border-color: var(--app-border-color) !important;"
                          onerror="this.onerror=null; this.src='/assets/img/user-avatar-default.svg';"
                        />
                        <div>
                          <h6 class="fw-bold mb-1" style="color: var(--app-text-primary);">Alan Marin</h6>
                          <p class="text-muted mb-0 small">Desarrollador Web</p>
                        </div>
                      </div>

                      <div class="d-flex flex-column gap-2">
                        <a href="https://www.linkedin.com/in/alanmarin20/" target="_blank" rel="noopener noreferrer" class="text-decoration-none faq-link">
                          <i class="lni lni-linkedin-original me-2"></i>LinkedIn
                        </a>
                        <a href="mailto:marinalan396@gmail.com" class="text-decoration-none faq-link">
                          <i class="lni lni-envelope me-2"></i>marinalan396@gmail.com
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      ${botonScrollTop()}
    </div>
  `;
}

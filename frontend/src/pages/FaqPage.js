export function renderFaqPage({ encabezadoExterno, botonEncabezadoExterno, botonScrollTop }) {
  const headerAuthMarkup = `
    <div class="landing-auth-group d-flex align-items-center gap-2 gap-md-3">
      <div class="landing-nav-links d-none d-lg-flex align-items-center gap-4 pe-2">
        <a href="/" data-link class="text-white text-decoration-none nav-link-hover">Inicio</a>
        <a href="/faqs" data-link class="text-white text-decoration-none fw-bold" style="opacity: 1;">FAQ's</a>
        <a href="/sobre-nosotros" data-link class="text-white text-decoration-none nav-link-hover">Sobre nosotros</a>
      </div>
      <span class="landing-auth-copy" style="position: absolute; pointer-events: none; opacity: 0; visibility: hidden;">Hace valer más tu dinero</span>
      ${botonEncabezadoExterno({
        href: '/login',
        text: 'Iniciar sesión',
        className: 'landing-access-btn landing-login-btn',
        sizeClass: 'btn-sm',
      })}
      ${botonEncabezadoExterno({
        href: '/registro',
        text: 'Registrarse',
        className: 'landing-access-btn landing-register-btn',
        sizeClass: 'btn-sm',
      })}
    </div>
  `;

  return `
    <div class="min-vh-100 d-flex flex-column" style="background-color: var(--app-surface-bg);">
      ${encabezadoExterno({
        rightHref: '/login',
        rightText: 'Iniciar sesión',
        rightClass: 'landing-access-btn landing-login-btn',
        rightMarkup: headerAuthMarkup,
      })}

      <div class="container flex-grow-1" style="padding-top: 120px; padding-bottom: 60px;">
        <div class="row g-4">
          <!-- Contenido Principal -->
          <div class="col-12 col-lg-9 d-flex flex-column">
            <h1 class="fw-bold mb-4" style="color: var(--app-text-primary);">Portal de Preguntas Frecuentes</h1>
            
            <div class="card border-0 shadow-sm mb-4" style="border-radius: 15px; overflow: hidden;">
              <div class="card-body p-0 d-flex align-items-center">
                <span class="ps-4 pe-2 fw-bold text-muted">Buscar</span>
                <input type="text" class="form-control border-0 py-3 flex-grow-1" placeholder="Escribe tu duda aquí..." style="box-shadow: none; font-size: 1.1rem; background: transparent; color: var(--app-text-primary);">
                <div class="px-4 text-muted border-start d-flex align-items-center justify-content-center" style="border-color: var(--app-border-color) !important; cursor: pointer; height: 100%;">
                  <i class="lni lni-search-alt fs-4"></i>
                </div>
              </div>
            </div>

            <div class="card border-0 shadow-sm flex-grow-1" style="border-radius: 15px;">
              <div class="card-body p-4">
                <div class="row g-3 h-100">
                  <div class="col-12 col-md-4">
                    <div class="p-4 border rounded-3 text-center h-100 faq-cat-box d-flex flex-column align-items-center justify-content-center" style="cursor: pointer; transition: all 0.2s; border-color: var(--app-border-color) !important;">
                      <i class="lni lni-rocket fs-2 text-primary mb-3"></i>
                      <h5 class="fw-bold mb-2">Primeros pasos</h5>
                      <p class="text-muted small mb-0">Crear una cuenta y empezar</p>
                    </div>
                  </div>
                  <div class="col-12 col-md-4">
                    <div class="p-4 border rounded-3 text-center h-100 faq-cat-box d-flex flex-column align-items-center justify-content-center" style="cursor: pointer; transition: all 0.2s; border-color: var(--app-border-color) !important;">
                      <i class="lni lni-enter fs-2 text-primary mb-3"></i>
                      <h5 class="fw-bold mb-2">Iniciar Sesión</h5>
                      <p class="text-muted small mb-0">Acceso y contraseñas</p>
                    </div>
                  </div>
                  <div class="col-12 col-md-4">
                    <div class="p-4 border rounded-3 text-center h-100 faq-cat-box d-flex flex-column align-items-center justify-content-center" style="cursor: pointer; transition: all 0.2s; border-color: var(--app-border-color) !important;">
                      <i class="lni lni-user fs-2 text-primary mb-3"></i>
                      <h5 class="fw-bold mb-2">Tu perfil</h5>
                      <p class="text-muted small mb-0">Ajustes y preferencias</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Panel Lateral Derecho -->
          <div class="col-12 col-lg-3 d-flex flex-column gap-4">
            <div class="card border-0 shadow-sm" style="border-radius: 15px;">
              <div class="card-body p-4">
                <h6 class="fw-bold mb-3 border-bottom pb-2" style="border-color: var(--app-border-color) !important;">Reclamos</h6>
                <ul class="list-unstyled mb-0">
                  <li class="mb-2"><a href="/login" data-link class="text-decoration-none text-muted faq-link">Mis reclamos</a></li>
                  <li class="mb-0"><a href="/login" data-link class="text-decoration-none text-muted faq-link">Crear nuevo reclamo</a></li>
                </ul>
              </div>
            </div>

            <div class="card border-0 shadow-sm" style="border-radius: 15px;">
              <div class="card-body p-4">
                <h6 class="fw-bold mb-3 border-bottom pb-2" style="border-color: var(--app-border-color) !important;">Categorías</h6>
                <ul class="list-unstyled mb-0">
                  <li class="mb-2"><a href="#" class="text-decoration-none text-muted faq-link">Primeros pasos</a></li>
                  <li class="mb-2"><a href="#" class="text-decoration-none text-muted faq-link">Iniciar Sesión</a></li>
                  <li class="mb-0"><a href="#" class="text-decoration-none text-muted faq-link">Tu perfil</a></li>
                </ul>
              </div>
            </div>

            <div class="card border-0 shadow-sm flex-grow-1" style="border-radius: 15px;">
              <div class="card-body p-4">
                <h6 class="fw-bold mb-3 border-bottom pb-2" style="border-color: var(--app-border-color) !important;">Artículos populares</h6>
                <ul class="list-unstyled mb-0">
                  <li class="mb-3">
                    <a href="#" class="text-decoration-none text-muted faq-link d-block lh-sm"><i class="lni lni-chevron-right me-1" style="font-size: 0.8em;"></i> ¿Cómo puedo darme de baja?</a>
                  </li>
                  <li class="mb-3">
                    <a href="#" class="text-decoration-none text-muted faq-link d-block lh-sm"><i class="lni lni-chevron-right me-1" style="font-size: 0.8em;"></i> ¿Cómo recupero mi clave?</a>
                  </li>
                  <li class="mb-0">
                    <a href="#" class="text-decoration-none text-muted faq-link d-block lh-sm"><i class="lni lni-chevron-right me-1" style="font-size: 0.8em;"></i> ¿Qué incluye el servicio?</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      ${botonScrollTop()}
    </div>
  `;
}
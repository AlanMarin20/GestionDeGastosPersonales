export function renderFaqPage({
  encabezadoExterno,
  encabezadoAuthPublico,
  tarjetaPublicaConTitulo,
  botonScrollTop,
}) {
  const headerAuthMarkup = encabezadoAuthPublico({
    activeRoute: '/faqs',
    includeFaqClass: true,
  });

  const reclamosCard = tarjetaPublicaConTitulo({
    title: 'Reclamos',
    contentMarkup: `
      <ul class="list-unstyled mb-0">
        <li class="mb-2"><a href="/login" data-link class="text-decoration-none text-muted faq-link">Mis reclamos</a></li>
        <li class="mb-0"><a href="/login" data-link class="text-decoration-none text-muted faq-link">Crear nuevo reclamo</a></li>
      </ul>
    `,
  });

  const categoriasCard = tarjetaPublicaConTitulo({
    title: 'Categorías',
    contentMarkup: `
      <ul class="list-unstyled mb-0">
        <li class="mb-2"><a href="/faqs/crear-cuenta" data-link class="text-decoration-none text-muted faq-link">Primeros pasos</a></li>
        <li class="mb-2"><a href="/faqs/asesores-como-funciona" data-link class="text-decoration-none text-muted faq-link">Asesores</a></li>
        <li class="mb-2"><a href="/faqs/conectar-entidades" data-link class="text-decoration-none text-muted faq-link">Entidades conectadas</a></li>
        <li class="mb-0"><a href="/faqs/dar-de-baja" data-link class="text-decoration-none text-muted faq-link">Artículos populares</a></li>
      </ul>
    `,
  });

  const popularesCard = tarjetaPublicaConTitulo({
    title: 'Artículos populares',
    cardClass: 'flex-grow-1',
    contentMarkup: `
      <ul class="list-unstyled mb-0 text-start">
        <li class="mb-3">
          <a href="/faqs/dar-de-baja" data-link class="text-decoration-none text-muted faq-link d-block lh-sm text-start"><i class="lni lni-chevron-right me-1" style="font-size: 0.8em;"></i> ¿Cómo puedo darme de baja?</a>
        </li>
        <li class="mb-3">
          <a href="/faqs/recuperar-clave" data-link class="text-decoration-none text-muted faq-link d-block lh-sm text-start"><i class="lni lni-chevron-right me-1" style="font-size: 0.8em;"></i> ¿Cómo recupero mi clave?</a>
        </li>
        <li class="mb-0">
          <a href="/faqs/servicio-incluye" data-link class="text-decoration-none text-muted faq-link d-block lh-sm text-start"><i class="lni lni-chevron-right me-1" style="font-size: 0.8em;"></i> ¿Qué incluye el servicio?</a>
        </li>
      </ul>
    `,
  });

  return `
    <div class="min-vh-100 d-flex flex-column public-page-shell public-faq-page" style="background-color: var(--app-surface-bg);">
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
                <div class="px-3 text-muted d-flex align-items-center justify-content-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </div>
                <input type="text" class="form-control border-0 px-3 py-3 flex-grow-1" placeholder="Escribe tu duda aquí..." style="box-shadow: none; font-size: 1.1rem; background: transparent; color: var(--app-text-primary);">
              </div>
            </div>

            <div class="p-4 public-glass-block" style="border-radius: 15px;">
                <div class="row g-4">
                  <div class="col-12 col-md-4">
                    <h6 class="fw-bold mb-3 border-bottom pb-2" style="border-color: var(--app-border-color) !important;">Primeros pasos</h6>
                    <ul class="list-unstyled mb-0">
                      <li class="mb-2"><a href="/faqs/crear-cuenta" data-link class="text-decoration-none text-muted faq-link">Crear una cuenta en FinanzasPro</a></li>
                      <li class="mb-2"><a href="/faqs/iniciar-sesion" data-link class="text-decoration-none text-muted faq-link">Iniciar sesión</a></li>
                      <li class="mb-0"><a href="/faqs/tu-perfil" data-link class="text-decoration-none text-muted faq-link">Tu perfil</a></li>
                    </ul>
                  </div>
                  <div class="col-12 col-md-4">
                    <h6 class="fw-bold mb-3 border-bottom pb-2" style="border-color: var(--app-border-color) !important;">Asesores</h6>
                    <ul class="list-unstyled mb-0">
                      <li class="mb-2"><a href="/faqs/asesores-como-funciona" data-link class="text-decoration-none text-muted faq-link">Cómo funciona</a></li>
                      <li class="mb-2"><a href="/faqs/convertite-en-asesor" data-link class="text-decoration-none text-muted faq-link">Convertite en asesor</a></li>
                      <li class="mb-2"><a href="/faqs/precio-asesor" data-link class="text-decoration-none text-muted faq-link">Precio</a></li>
                      <li class="mb-0"><a href="/faqs/herramientas-asesor" data-link class="text-decoration-none text-muted faq-link">Herramientas de asesoría</a></li>
                    </ul>
                  </div>
                  <div class="col-12 col-md-4">
                    <h6 class="fw-bold mb-3 border-bottom pb-2" style="border-color: var(--app-border-color) !important;">Entidades conectadas</h6>
                    <ul class="list-unstyled mb-0">
                      <li class="mb-2"><a href="/faqs/conectar-entidades" data-link class="text-decoration-none text-muted faq-link">Conectar entidades y productos</a></li>
                      <li class="mb-2"><a href="/faqs/mis-movimientos" data-link class="text-decoration-none text-muted faq-link">Mis movimientos</a></li>
                      <li class="mb-0"><a href="/faqs/seccion-analisis" data-link class="text-decoration-none text-muted faq-link">Sección de "Análisis"</a></li>
                    </ul>
                  </div>
                </div>
            </div>
          </div>

          <!-- Panel Lateral Derecho -->
          <div class="col-12 col-lg-3 d-flex flex-column gap-4">
            ${reclamosCard}
            ${categoriasCard}
            ${popularesCard}
          </div>
        </div>
      </div>
      ${botonScrollTop()}
    </div>
  `;
}
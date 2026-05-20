import { t } from '../i18n';

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
    title: t('faq.claims'),
    contentMarkup: `
      <ul class="list-unstyled mb-0">
        <li class="mb-2"><a href="/login" data-link class="text-decoration-none text-muted faq-link">${t('faq.myClaims')}</a></li>
        <li class="mb-0"><a href="/login" data-link class="text-decoration-none text-muted faq-link">${t('faq.newClaim')}</a></li>
      </ul>
    `,
  });

  const categoriasCard = tarjetaPublicaConTitulo({
    title: t('faq.categories'),
    contentMarkup: `
      <ul class="list-unstyled mb-0">
        <li class="mb-2"><a href="/faqs/crear-cuenta" data-link class="text-decoration-none text-muted faq-link">${t('faq.firstSteps')}</a></li>
        <li class="mb-2"><a href="/faqs/asesores-como-funciona" data-link class="text-decoration-none text-muted faq-link">${t('faq.advisors')}</a></li>
        <li class="mb-2"><a href="/faqs/conectar-entidades" data-link class="text-decoration-none text-muted faq-link">${t('faq.connectedEntities')}</a></li>
        <li class="mb-0"><a href="/faqs/dar-de-baja" data-link class="text-decoration-none text-muted faq-link">${t('faq.popularArticles')}</a></li>
      </ul>
    `,
  });

  const popularesCard = tarjetaPublicaConTitulo({
    title: t('faq.popularArticles'),
    cardClass: 'flex-grow-1',
    contentMarkup: `
      <ul class="list-unstyled mb-0 text-start">
        <li class="mb-3">
          <a href="/faqs/dar-de-baja" data-link class="text-decoration-none text-muted faq-link d-block lh-sm">
            <i class="lni lni-chevron-right me-1" style="font-size: 0.8em;"></i> ${t('faq.howUnsubscribe')}
          </a>
        </li>
        <li class="mb-3">
          <a href="/faqs/recuperar-clave" data-link class="text-decoration-none text-muted faq-link d-block lh-sm">
            <i class="lni lni-chevron-right me-1" style="font-size: 0.8em;"></i> ${t('faq.howRecoverKey')}
          </a>
        </li>
        <li class="mb-0">
          <a href="/faqs/servicio-incluye" data-link class="text-decoration-none text-muted faq-link d-block lh-sm">
            <i class="lni lni-chevron-right me-1" style="font-size: 0.8em;"></i> ${t('faq.whatIncludes')}
          </a>
        </li>
      </ul>
    `,
  });

  const searchIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
      aria-hidden="true">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  `;

  return `
    <div class="min-vh-100 d-flex flex-column public-page-shell public-faq-page fp-public-surface">
      ${encabezadoExterno({
        rightHref: '/login',
        rightText: t('landing.authLogin'),
        rightClass: 'landing-access-btn landing-login-btn',
        rightMarkup: headerAuthMarkup,
      })}

      <main class="container flex-grow-1 fp-public-main-container">
        <div class="row g-4">

          <div class="col-12 col-lg-9 d-flex flex-column">
            <h1 class="fw-bold mb-4 fp-public-title">${t('faq.portalTitle')}</h1>

            <div class="card border-0 shadow-sm mb-4 faq-search-card">
              <div class="card-body p-0 d-flex align-items-center">
                <div class="px-3 d-flex align-items-center justify-content-center flex-shrink-0 faq-search-icon">
                  ${searchIcon}
                </div>
                <input
                  type="text"
                  class="form-control border-0 px-3 py-3 flex-grow-1 faq-search-input"
                  placeholder="${t('faq.searchPlaceholder')}"
                  aria-label="${t('faq.searchAria')}"
                />
              </div>
            </div>

            <div class="p-4 public-glass-block faq-categories-block">
              <div class="row g-4">
                <div class="col-12 col-md-4">
                  <h6 class="fw-bold mb-3 border-bottom pb-2 faq-category-divider">${t('faq.firstSteps')}</h6>
                  <ul class="list-unstyled mb-0">
                    <li class="mb-2"><a href="/faqs/crear-cuenta" data-link class="text-decoration-none text-muted faq-link">${t('faq.createAccount')}</a></li>
                    <li class="mb-2"><a href="/faqs/iniciar-sesion" data-link class="text-decoration-none text-muted faq-link">${t('faq.login')}</a></li>
                    <li class="mb-0"><a href="/faqs/tu-perfil" data-link class="text-decoration-none text-muted faq-link">${t('faq.yourProfile')}</a></li>
                  </ul>
                </div>
                <div class="col-12 col-md-4">
                  <h6 class="fw-bold mb-3 border-bottom pb-2 faq-category-divider">${t('faq.advisors')}</h6>
                  <ul class="list-unstyled mb-0">
                    <li class="mb-2"><a href="/faqs/asesores-como-funciona" data-link class="text-decoration-none text-muted faq-link">${t('faq.howItWorks')}</a></li>
                    <li class="mb-2"><a href="/faqs/convertite-en-asesor" data-link class="text-decoration-none text-muted faq-link">${t('faq.becomeAdvisor')}</a></li>
                    <li class="mb-2"><a href="/faqs/precio-asesor" data-link class="text-decoration-none text-muted faq-link">${t('faq.price')}</a></li>
                    <li class="mb-0"><a href="/faqs/herramientas-asesor" data-link class="text-decoration-none text-muted faq-link">${t('faq.advisorTools')}</a></li>
                  </ul>
                </div>
                <div class="col-12 col-md-4">
                  <h6 class="fw-bold mb-3 border-bottom pb-2 faq-category-divider">${t('faq.connectedEntities')}</h6>
                  <ul class="list-unstyled mb-0">
                    <li class="mb-2"><a href="/faqs/conectar-entidades" data-link class="text-decoration-none text-muted faq-link">${t('faq.connectEntities')}</a></li>
                    <li class="mb-2"><a href="/faqs/mis-movimientos" data-link class="text-decoration-none text-muted faq-link">${t('faq.myMovements')}</a></li>
                    <li class="mb-0"><a href="/faqs/seccion-analisis" data-link class="text-decoration-none text-muted faq-link">${t('faq.analysisSection')}</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <aside class="col-12 col-lg-3 d-flex flex-column gap-4">
            ${reclamosCard}
            ${categoriasCard}
            ${popularesCard}
          </aside>

        </div>
      </main>

      ${botonScrollTop()}
    </div>
  `;
}

import { t } from '../i18n';

// ─── Datos estáticos de la página ───────────────────────────────────────────

const ARROW_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true" style="margin-left:6px;flex-shrink:0"><path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/></svg>`;

const getNavLinks = () => [
  { href: '/',               label: t('landing.navHome') },
  { href: '/faqs',           label: t('landing.navFaqs') },
  { href: '/sobre-nosotros', label: t('landing.navAbout') },
];

const getAuthLinks = () => [
  { href: '/login',    label: t('landing.authLogin') },
  { href: '/registro', label: t('landing.authRegister') },
];

const getMetrics = () => [
  { value: '+5K',  label: t('landing.metricUsers') },
  { value: '$2M+', label: t('landing.metricExpenses') },
  { value: '98%',  label: t('landing.metricPrecision') },
  { value: '4.9★', label: t('landing.metricRating') },
];

const getFeatures = () => [
  {
    title: t('landing.featureRegisterTitle'),
    description: t('landing.featureRegisterDesc'),
    iconHtml: `
      <svg width="90" height="90" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M18 8 L52 8 L64 20 L64 72 L18 72 Z" stroke="#7dd3fc" stroke-width="2.2" stroke-linejoin="round" fill="rgba(56,189,248,0.06)"/>
        <path d="M52 8 L52 20 L64 20" stroke="#7dd3fc" stroke-width="2.2" stroke-linejoin="round" fill="none"/>
        <line x1="26" y1="36" x2="56" y2="36" stroke="#7dd3fc" stroke-width="1.8" stroke-linecap="round" opacity="0.5"/>
        <line x1="26" y1="44" x2="56" y2="44" stroke="#7dd3fc" stroke-width="1.8" stroke-linecap="round" opacity="0.5"/>
        <line x1="26" y1="52" x2="42" y2="52" stroke="#7dd3fc" stroke-width="1.8" stroke-linecap="round" opacity="0.5"/>
        <line x1="8" y1="40" x2="72" y2="40" stroke="#10b981" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M8 34 L8 40 L14 40" stroke="#10b981" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M72 34 L72 40 L66 40" stroke="#10b981" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `,
  },
  {
    title: t('landing.featureAnalyzeTitle'),
    description: t('landing.featureAnalyzeDesc'),
    iconHtml: `
      <svg width="90" height="90" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <line x1="12" y1="64" x2="68" y2="64" stroke="#7dd3fc" stroke-width="2" stroke-linecap="round" opacity="0.45"/>
        <line x1="12" y1="12" x2="12" y2="64" stroke="#7dd3fc" stroke-width="2" stroke-linecap="round" opacity="0.45"/>
        <rect x="19" y="44" width="10" height="20" rx="2.5" fill="rgba(56,189,248,0.18)" stroke="#7dd3fc" stroke-width="1.8"/>
        <rect x="35" y="30" width="10" height="34" rx="2.5" fill="rgba(56,189,248,0.18)" stroke="#7dd3fc" stroke-width="1.8"/>
        <rect x="51" y="18" width="10" height="46" rx="2.5" fill="rgba(16,185,129,0.18)" stroke="#10b981" stroke-width="1.8"/>
        <path d="M24 42 L40 28 L56 16" stroke="#10b981" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="3 2.5" opacity="0.75"/>
        <circle cx="56" cy="16" r="3.5" fill="#10b981" opacity="0.9"/>
      </svg>
    `,
  },
  {
    title: t('landing.featureOptimizeTitle'),
    description: t('landing.featureOptimizeDesc'),
    iconHtml: `
      <svg width="90" height="90" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="40" cy="40" r="30" stroke="#7dd3fc" stroke-width="2" fill="rgba(56,189,248,0.04)" opacity="0.65"/>
        <circle cx="40" cy="40" r="20" stroke="#7dd3fc" stroke-width="1.8" fill="rgba(56,189,248,0.06)" opacity="0.6"/>
        <circle cx="40" cy="40" r="10" fill="rgba(16,185,129,0.14)" stroke="#10b981" stroke-width="2"/>
        <circle cx="40" cy="40" r="3.5" fill="#10b981" opacity="0.9"/>
        <path d="M13 13 L34 34" stroke="#10b981" stroke-width="2" stroke-linecap="round"/>
        <path d="M21 13 L13 13 L13 21" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `,
  },
];

// ─── Helpers de markup ───────────────────────────────────────────────────────

function renderMobileNavItems() {
  const navLinks = getNavLinks();
  const authLinks = getAuthLinks();
  const navItems = navLinks.map((link, i) =>
    `<a href="${link.href}" data-link class="landing-mobile-menu-link landing-mobile-menu-item landing-mobile-menu-item-step-${i}">${link.label}</a>`,
  );
  const divider = `<span class="landing-mobile-menu-divider landing-mobile-menu-item landing-mobile-menu-item-step-${navLinks.length}" aria-hidden="true"></span>`;
  const authItems = authLinks.map((link, i) =>
    `<a href="${link.href}" data-link class="landing-mobile-menu-link landing-mobile-menu-link-auth landing-mobile-menu-item landing-mobile-menu-item-step-${navLinks.length + 1 + i}">${link.label}</a>`,
  );
  return [...navItems, divider, ...authItems].join('\n      ');
}

function renderFooterNavLinks() {
  return [...getNavLinks(), ...getAuthLinks()]
    .map(({ href, label }) => `<a href="${href}" data-link class="landing-footer-link">${label}</a>`)
    .join('\n                  ');
}

function renderMetrics() {
  return getMetrics().map(({ value, label }) => `
          <div class="landing-metric-item">
            <span class="landing-metric-value">${value}</span>
            <span class="landing-metric-label">${label}</span>
          </div>`).join('');
}

function renderFeatureCards(tarjetaLandingPage) {
  return getFeatures().map(feature => tarjetaLandingPage({
    ...feature,
    descriptionClassName: 'fp-feature-card-description-match-selected',
  })).join('');
}

// ─── Render principal ────────────────────────────────────────────────────────

export function renderLandingPage({ encabezadoExterno, encabezadoAuthPublico, tarjetaLandingPage, descripcionLanding, imagenesLanding, botonScrollTop }) {
  const headerAuthMarkup = encabezadoAuthPublico({
    activeRoute: '/',
    includeMobileToggle: true,
  });

  return `
    ${encabezadoExterno({
      rightHref: '/login',
      rightText: t('landing.authLogin'),
      rightClass: 'landing-access-btn landing-login-btn',
      rightMarkup: headerAuthMarkup,
    })}

    <div
      class="landing-mobile-menu-backdrop d-lg-none"
      data-landing-mobile-backdrop
      data-action="close-landing-mobile-menu"
      hidden
    ></div>
    <nav
      id="landing-mobile-navigation"
      class="landing-mobile-menu d-lg-none"
      aria-label="${t('landing.mobileNavAria')}"
      data-landing-mobile-menu
      hidden
    >
      <div class="landing-mobile-menu-head">
        <span class="landing-mobile-menu-title">${t('landing.mobileNavTitle')}</span>
        <button
          type="button"
          class="landing-mobile-menu-close"
          data-action="close-landing-mobile-menu"
          aria-label="${t('landing.closeNavMenu')}"
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>
      ${renderMobileNavItems()}
    </nav>

    <div class="landing-page-content-shell">

    <!-- Hero -->
    <section id="home" class="hero-section custom-landing-hero">
      <div class="container">
        <div class="row align-items-center position-relative landing-hero-row">
          <div class="col-lg-5">
            <div class="landing-hero-badge wow fadeInUp" data-wow-delay=".15s" aria-label="${t('landing.aiBadgeAria')}">
              <span class="landing-hero-badge-dot" aria-hidden="true"></span>
              ${t('landing.aiPowered')}
            </div>
            ${descripcionLanding({
              title: t('landing.heroTitle'),
              description: t('landing.heroDescription'),
              containerClass: 'hero-content',
              titleClass: 'wow fadeInUp fw-bold text-white landing-hero-title',
              titleDelay: '.3s',
              descriptionClass: 'wow fadeInUp text-white landing-hero-desc',
              descriptionDelay: '.45s',
              ctaMarkup: `
                <div class="landing-hero-cta wow fadeInUp" data-wow-delay=".6s">
                  <a href="/registro" data-link class="landing-cta-primary">
                    ${t('landing.startFree')} ${ARROW_ICON}
                  </a>
                  <a href="/faqs" data-link class="landing-cta-secondary">
                    ${t('landing.howItWorks')}
                  </a>
                </div>
              `,
            })}
          </div>
          <div class="col-lg-7">
            ${imagenesLanding({
              src: '/assets/img/hero/dashboard.webp',
              fallbackSrc: '/assets/img/hero/dashboard.png',
              alt: t('landing.heroImageAlt'),
              wrapperClass: 'hero-img wow fadeInUp d-flex align-items-center justify-content-center landing-hero-image-wrap',
              delay: '.5s',
              imageClass: 'landing-hero-image landing-media-rounded',
            })}
          </div>
        </div>
      </div>
    </section>

    <!-- Métricas -->
    <section class="landing-metrics-section" aria-label="${t('landing.statsAria')}">
      <div class="container">
        <div class="landing-metrics-grid">
          ${renderMetrics()}
        </div>
      </div>
    </section>

    <!-- Features -->
    <section id="features" class="feature-section pt-120 custom-landing-features">
      <div class="container">
        <div class="landing-section-header text-center wow fadeInUp" data-wow-delay=".1s">
          <span class="landing-section-label">${t('landing.featuresLabel')}</span>
          <h2 class="landing-section-title">${t('landing.featuresTitle')}</h2>
        </div>
        <div class="row justify-content-center">
          ${renderFeatureCards(tarjetaLandingPage)}
        </div>
      </div>
    </section>

    <!-- About / Asesores -->
    <section id="about" class="about-section pt-150 custom-landing-about">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-xl-6 col-lg-6">
            ${imagenesLanding({
              src: '/assets/img/hero/dashboard-asesor.webp',
              fallbackSrc: '/assets/img/hero/dashboard-asesor.png',
              alt: t('landing.aboutImageAlt'),
              wrapperClass: 'about-img landing-about-img',
              imageClass: 'w-100 landing-about-image landing-media-rounded',
            })}
          </div>
          <div class="col-xl-6 col-lg-6">
            <div class="landing-about-badge wow fadeInUp" data-wow-delay=".1s">
              <span class="landing-about-badge-icon" aria-hidden="true">◈</span>
              ${t('landing.forAdvisors')}
            </div>
            ${descripcionLanding({
              title: t('landing.aboutTitle'),
              description: t('landing.aboutDescription'),
              containerClass: 'about-content section-title mb-30',
              titleClass: 'mb-25 wow fadeInUp',
              titleDelay: '.2s',
              descriptionClass: 'wow fadeInUp',
              descriptionDelay: '.4s',
              ctaMarkup: `
                <div class="wow fadeInUp" data-wow-delay=".55s" style="margin-top:28px">
                  <a href="/registro" data-link class="landing-cta-primary">
                    ${t('landing.startAsAdvisor')} ${ARROW_ICON}
                  </a>
                </div>
              `,
            })}
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <div class="widget-wrapper">
          <div class="row justify-content-center text-center">
            <div class="col-12 col-lg-8">
              <div class="footer-widget">
                <div class="logo mb-3">
                  <a href="/" data-link class="d-inline-flex align-items-center gap-2 text-decoration-none">
                    <img src="/assets/img/logo/iconoSfondo.webp" alt="FinanzasPro" class="landing-footer-brand-image" />
                    <span class="fw-bold text-white fs-4 landing-footer-brand-text">FinanzasPro</span>
                  </a>
                </div>
                <p class="landing-footer-tagline mb-3">${t('landing.footerTagline')}</p>
                <nav class="landing-footer-links mb-4" aria-label="${t('landing.footerNavAria')}">
                  ${renderFooterNavLinks()}
                </nav>
                <p class="desc mb-0 text-white landing-footer-copy">
                  ${t('landing.footerCopy')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>

    </div>

    ${botonScrollTop()}
  `;
}

export function renderLandingPage({ encabezadoExterno, encabezadoAuthPublico, tarjetaLandingPage, descripcionLanding, imagenesLanding, botonScrollTop }) {
  const headerAuthMarkup = encabezadoAuthPublico({
    activeRoute: '/',
    includeMobileToggle: true,
  });

  return `
    ${encabezadoExterno({
      rightHref: '/login',
      rightText: 'Iniciar sesión',
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
      aria-label="Navegación móvil"
      data-landing-mobile-menu
      hidden
    >
      <div class="landing-mobile-menu-head">
        <span class="landing-mobile-menu-title">Navegación</span>
        <button
          type="button"
          class="landing-mobile-menu-close"
          data-action="close-landing-mobile-menu"
          aria-label="Cerrar menú de navegación"
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>
      <a href="/" data-link class="landing-mobile-menu-link landing-mobile-menu-item landing-mobile-menu-item-step-0">Inicio</a>
      <a href="/faqs" data-link class="landing-mobile-menu-link landing-mobile-menu-item landing-mobile-menu-item-step-1">FAQ's</a>
      <a href="/sobre-nosotros" data-link class="landing-mobile-menu-link landing-mobile-menu-item landing-mobile-menu-item-step-2">Sobre nosotros</a>
      <span class="landing-mobile-menu-divider landing-mobile-menu-item landing-mobile-menu-item-step-3" aria-hidden="true"></span>
      <a href="/login" data-link class="landing-mobile-menu-link landing-mobile-menu-link-auth landing-mobile-menu-item landing-mobile-menu-item-step-4">Iniciar sesión</a>
      <a href="/registro" data-link class="landing-mobile-menu-link landing-mobile-menu-link-auth landing-mobile-menu-item landing-mobile-menu-item-step-5">Registrarse</a>
    </nav>

    <div class="landing-page-content-shell">

    <section id="home" class="hero-section custom-landing-hero">
      <div class="container">
        <div class="row align-items-center position-relative landing-hero-row">
          <div class="col-lg-5">
            ${descripcionLanding({
              title: 'Tomá el control total de tu economía',
              description: 'Transformá la manera en que gestionás '+
                'tu dinero. Nuestra plataforma utiliza inteligencia ' +
                'artificial avanzada para digitalizar tus comprobantes ' +
                'al instante, permitiéndote visualizar tus consumos sin ' +
                'esfuerzo manual. Organizá tus ingresos, controlá tus ' +
                'gastos y accedé a métricas personalizadas desde cualquier ' +
                'dispositivo con una interfaz diseñada para tu comodidad.',
              containerClass: 'hero-content',
              titleClass: 'wow fadeInUp fw-bold text-white',
              titleDelay: '.4s',
              descriptionClass: 'wow fadeInUp fw-normal text-white opacity-75',
              descriptionDelay: '.6s',
            })}
          </div>
          <div class="col-lg-7">
            ${imagenesLanding({
              src: '/assets/img/hero/dashboard.webp',
              fallbackSrc: '/assets/img/hero/dashboard.png',
              alt: 'Vista de dashboard de usuario',
              wrapperClass: 'hero-img wow fadeInUp d-flex align-items-center justify-content-center landing-hero-image-wrap',
              delay: '.5s',
              imageClass: 'landing-hero-image landing-media-rounded',
            })}
          </div>
        </div>
      </div>
    </section>

    <section id="features" class="feature-section pt-120 custom-landing-features">
      <div class="container">
        <div class="row justify-content-center">
          ${tarjetaLandingPage({
            title: 'Registrá',
            description: 'Digitalizá tus comprobantes rápidamente ' +
            'con nuestra tecnología de reconocimiento de texto o ' +
            'realizá cargas manuales detalladas mediante formularios ' +
            'dinámicos. Nos adaptamos a tu ritmo para que ningún gasto ' +
            'quede fuera de tu historial.',
            descriptionClassName: 'fp-feature-card-description-match-selected',
            iconImageSrc: '/assets/img/hero/landingRegistra.webp',
            iconImageFallbackSrc: '/assets/img/hero/landingRegistra.png',
            iconAlt: 'Icono de registro',
          })}
          ${tarjetaLandingPage({
            title: 'Analizá',
            description: 'Visualizá la distribución de tus gastos por ' +
            'categoría o período de tiempo a través de gráficos interactivos ' +
            'de torta y barras. Identificá patrones mensuales y mantené ' +
            'un seguimiento preciso de tus ingresos y ahorros en un solo lugar.',
            descriptionClassName: 'fp-feature-card-description-match-selected',
            iconImageSrc: '/assets/img/hero/landingAnaliza.webp',
            iconImageFallbackSrc: '/assets/img/hero/landingAnaliza.png',
            iconAlt: 'Icono de análisis',
          })}
          ${tarjetaLandingPage({
            title: 'Optimizá',
            description: 'Utilizá la información generada para establecer ' +
            'presupuestos y objetivos de ahorro realistas. Recibí ' +
            'sugerencias personalizadas de tu asesor financiero para ' +
            'reducir gastos innecesarios y mejorar tu salud económica general.',
            descriptionClassName: 'fp-feature-card-description-match-selected',
            iconImageSrc: '/assets/img/hero/landingOptimiza.webp',
            iconImageFallbackSrc: '/assets/img/hero/landingOptimiza.png',
            iconAlt: 'Icono de optimización',
          })}
        </div>
      </div>
    </section>

    <section id="about" class="about-section pt-150 custom-landing-about">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-xl-6 col-lg-6">
            ${imagenesLanding({
              src: '/assets/img/hero/dashboard-asesor.webp',
              fallbackSrc: '/assets/img/hero/dashboard-asesor.png',
              alt: 'Imagen descriptiva del uso como asesor',
              wrapperClass: 'about-img landing-about-img',
              imageClass: 'w-100 landing-about-image landing-media-rounded',
            })}
          </div>
          <div class="col-xl-6 col-lg-6">
            ${descripcionLanding({
              title: 'Herramientas de análisis para una asesoría de precisión',
              description: 'Potenciá el valor de tu asesoría ' +
              'financiera con un panel de control avanzado. ' +
              'Accedé a los perfiles de consumo de tus clientes, ' +
              'identificá comportamientos de gasto problemáticos ' +
              'y generá recomendaciones basadas en datos reales y ' +
              'estadísticas detalladas. FinanzasPro te brinda la ' +
              'infraestructura necesaria para gestionar múltiples ' +
              'carteras de usuarios con eficiencia y profesionalismo.',
              containerClass: 'about-content section-title mb-30',
              titleClass: 'mb-25 wow fadeInUp',
              titleDelay: '.2s',
              descriptionClass: 'wow fadeInUp',
              descriptionDelay: '.4s',
            })}
          </div>
        </div>
      </div>
    </section>

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
                <nav class="landing-footer-links mb-3" aria-label="Enlaces de navegación pública">
                  <a href="/" data-link class="landing-footer-link">Inicio</a>
                  <a href="/faqs" data-link class="landing-footer-link">FAQ's</a>
                  <a href="/sobre-nosotros" data-link class="landing-footer-link">Sobre nosotros</a>
                  <a href="/login" data-link class="landing-footer-link">Iniciar sesión</a>
                  <a href="/registro" data-link class="landing-footer-link">Registrarse</a>
                </nav>
                <p class="desc mb-0 text-white">
                  © 2026 FinanzasPro. Todos los derechos reservados. Plataforma autorizada para la prestación de servicios de información sobre cuentas.
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

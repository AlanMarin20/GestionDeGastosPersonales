export function renderLandingPage({ encabezadoExterno, botonEncabezadoExterno, tarjetaLandingPage, descripcionLanding, imagenesLanding, botonScrollTop }) {
  const headerAuthMarkup = `
    <div class="landing-auth-group d-flex align-items-center gap-2 gap-md-3">
      <div class="landing-nav-links d-none d-lg-flex align-items-center gap-4 pe-2">
        <a href="/" data-link class="text-white text-decoration-none nav-link-hover">Inicio</a>
        <a href="/faqs" data-link class="text-white text-decoration-none nav-link-hover">FAQ's</a>
        <a href="/sobre-nosotros" data-link class="text-white text-decoration-none nav-link-hover">Sobre nosotros</a>
      </div>
      <span class="landing-auth-copy">Hace valer más tu dinero</span>
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
    ${encabezadoExterno({
      rightHref: '/login',
      rightText: 'Iniciar sesión',
      rightClass: 'landing-access-btn landing-login-btn',
      rightMarkup: headerAuthMarkup,
    })}

    <!-- ======== hero-section start ======== -->
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
              src: '/assets/img/hero/genericaDashboardPage.png',
              alt: 'Vista de dashboard de usuario',
              wrapperClass: 'hero-img wow fadeInUp d-flex align-items-center justify-content-center',
              delay: '.5s',
              wrapperStyle: 'min-height: 440px;',
              imageClass: 'landing-hero-image',
              imageStyle: 'border-radius: 30px;',
            })}
          </div>
        </div>
      </div>
    </section>
    <!-- ======== hero-section end ======== -->

    <!-- ======== feature-section start ======== -->
    <section id="features" class="feature-section pt-120">
      <div class="container">
        <div class="row justify-content-center">
          ${tarjetaLandingPage({
            title: 'Registrá',
            description: 'Digitalizá tus comprobantes rápidamente ' +
            'con nuestra tecnología de reconocimiento de texto o ' +
            'realizá cargas manuales detalladas mediante formularios ' +
            'dinámicos. Nos adaptamos a tu ritmo para que ningún gasto ' +
            'quede fuera de tu historial.',
            iconImageSrc: '/assets/img/hero/landingRegistra.png',
            iconAlt: 'Icono de registro',
          })}
          ${tarjetaLandingPage({
            title: 'Analizá',
            description: 'Visualizá la distribución de tus gastos por ' +
            'categoría o período de tiempo a través de gráficos interactivos ' +
            'de torta y barras. Identificá patrones mensuales y mantené ' +
            'un seguimiento preciso de tus ingresos y ahorros en un solo lugar.',
            iconImageSrc: '/assets/img/hero/landingAnaliza.png',
            iconAlt: 'Icono de análisis',
          })}
          ${tarjetaLandingPage({
            title: 'Optimizá',
            description: 'Utilizá la información generada para establecer ' +
            'presupuestos y objetivos de ahorro realistas. Recibí ' +
            'sugerencias personalizadas de tu asesor financiero para ' +
            'reducir gastos innecesarios y mejorar tu salud económica general.',
            iconImageSrc: '/assets/img/hero/landingOptimiza.png',
            iconAlt: 'Icono de optimización',
          })}
        </div>
      </div>
    </section>
    <!-- ======== feature-section end ======== -->

    <!-- ======== about-section start ======== -->
    <section id="about" class="about-section pt-150">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-xl-6 col-lg-6">
            ${imagenesLanding({
              src: '/assets/img/hero/genericaDetalleClientePage.png',
              alt: 'Imagen descriptiva del uso como asesor',
              wrapperClass: 'about-img',
              imageClass: 'w-100',
              imageStyle: 'border-radius: 30px;',
              extraMarkup: `
                <img src="/assets/img/about/about-left-shape.svg" alt="" class="shape shape-1" />
                <img src="/assets/img/about/left-dots.svg" alt="" class="shape shape-2" />
              `,
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
    <!-- ======== about-section end ======== -->

    <!-- ======== footer start ======== -->
    <footer class="footer">
      <div class="container">
        <div class="widget-wrapper">
          <div class="row justify-content-center text-center">
            <div class="col-12 col-lg-8">
              <div class="footer-widget">
                <div class="logo mb-3">
                  <a href="/" data-link class="d-inline-flex align-items-center gap-2 text-decoration-none">
                    <img src="/assets/img/logo/iconoSfondo.png" alt="FinanzasPro" style="width: 38px; height: 38px; object-fit: cover; border-radius: 50%;" />
                    <span class="fw-bold text-white fs-4" style="letter-spacing: -0.4px;">FinanzasPro</span>
                  </a>
                </div>
                <p class="desc mb-0 text-white">
                  © 2026 FinanzasPro. Todos los derechos reservados. Plataforma autorizada para la prestación de servicios de información sobre cuentas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
    <!-- ======== footer end ======== -->

    ${botonScrollTop()}
  `;
}

export function renderLandingPage({ encabezadoExterno, botonEncabezadoExterno, tarjetaLandingPage, descripcionLanding, imagenesLanding, botonScrollTop }) {
  return `
    ${encabezadoExterno({ rightHref: '/login', rightText: 'Acceder', rightClass: 'landing-access-btn' })}

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
              titleClass: 'wow fadeInUp',
              titleDelay: '.4s',
              descriptionClass: 'wow fadeInUp',
              descriptionDelay: '.6s',
              ctaMarkup: botonEncabezadoExterno({
                href: '/login',
                text: 'Acceder',
                className: 'landing-access-btn',
                sizeClass: '',
                wowDelay: '.6s',
              }),
            })}
          </div>
          <div class="col-lg-7">
            ${imagenesLanding({
              src: '/assets/img/hero/dashboard-generico-usuario.svg',
              alt: 'Vista de dashboard de usuario',
              wrapperClass: 'hero-img wow fadeInUp d-flex align-items-center justify-content-center',
              delay: '.5s',
              wrapperStyle: 'min-height: 440px;',
              imageClass: 'landing-hero-image',
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
            iconClass: 'lni-bootstrap',
          })}
          ${tarjetaLandingPage({
            title: 'Analizá',
            description: 'Visualizá la distribución de tus gastos por ' +
            'categoría o período de tiempo a través de gráficos interactivos ' +
            'de torta y barras. Identificá patrones mensuales y mantené ' +
            'un seguimiento preciso de tus ingresos y ahorros en un solo lugar.',
            iconClass: 'lni-layout',
          })}
          ${tarjetaLandingPage({
            title: 'Optimizá',
            description: 'Utilizá la información generada para establecer ' +
            'presupuestos y objetivos de ahorro realistas. Recibí ' +
            'sugerencias personalizadas de tu asesor financiero para ' +
            'reducir gastos innecesarios y mejorar tu salud económica general.',
            iconClass: 'lni-coffee-cup',
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
              src: '/assets/img/about/about-1.png',
              alt: 'Imagen descriptiva del uso como asesor',
              wrapperClass: 'about-img',
              imageClass: 'w-100',
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
          <div class="row">
            <div class="col-xl-4 col-lg-4 col-md-6">
              <div class="footer-widget">
                <div class="logo mb-30">
                  <a href="/" data-link class="d-inline-flex align-items-center gap-2 text-decoration-none">
                    <img src="/assets/img/logo/iconoSfondo.png" alt="FinanzasPro" style="width: 38px; height: 38px; object-fit: cover; border-radius: 50%;" />
                    <span class="fw-bold text-white fs-4" style="letter-spacing: -0.4px;">FinanzasPro</span>
                  </a>
                </div>
                <p class="desc mb-30 text-white">
                  Innovación y precisión en la gestión de tus activos. Diseñamos herramientas inteligentes para que alcances tu libertad financiera con el respaldo de expertos.
                </p>
                <ul class="socials">
                  <li>
                    <a href="jvascript:void(0)">
                      <i class="lni lni-facebook-filled"></i>
                    </a>
                  </li>
                  <li>
                    <a href="jvascript:void(0)">
                      <i class="lni lni-twitter-filled"></i>
                    </a>
                  </li>
                  <li>
                    <a href="jvascript:void(0)">
                      <i class="lni lni-instagram-filled"></i>
                    </a>
                  </li>
                  <li>
                    <a href="jvascript:void(0)">
                      <i class="lni lni-linkedin-original"></i>
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div class="col-xl-2 col-lg-2 col-md-6">
              <div class="footer-widget">
                <h3>About Us</h3>
                <ul class="links">
                  <li><a href="javascript:void(0)">Home</a></li>
                  <li><a href="javascript:void(0)">Feature</a></li>
                  <li><a href="javascript:void(0)">About</a></li>
                  <li><a href="javascript:void(0)">Testimonials</a></li>
                </ul>
              </div>
            </div>

            <div class="col-xl-3 col-lg-3 col-md-6">
              <div class="footer-widget">
                <h3>Features</h3>
                <ul class="links">
                  <li><a href="javascript:void(0)">How it works</a></li>
                  <li><a href="javascript:void(0)">Privacy policy</a></li>
                  <li><a href="javascript:void(0)">Terms of service</a></li>
                  <li><a href="javascript:void(0)">Refund policy</a></li>
                </ul>
              </div>
            </div>

            <div class="col-xl-3 col-lg-3 col-md-6">
              <div class="footer-widget">
                <h3>Other Products</h3>
                <ul class="links">
                  <li><a href="jvascript:void(0)">Accounting Software</a></li>
                  <li><a href="jvascript:void(0)">Billing Software</a></li>
                  <li><a href="jvascript:void(0)">Booking System</a></li>
                  <li><a href="jvascript:void(0)">Tracking System</a></li>
                </ul>
                Distributed by <a href="https://themewagon.com" target="_blank" style="color: #bfc7d7">ThemeWagon</a>
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

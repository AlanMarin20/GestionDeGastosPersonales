export function renderLandingPage({ encabezadoExterno, botonEncabezadoExterno, tarjetaLandingPage, descripcionLanding, imagenesLanding }) {
  return `
    ${encabezadoExterno({ rightHref: '/login', rightText: 'Acceder', rightClass: 'landing-access-btn' })}

    <!-- ======== hero-section start ======== -->
    <section id="home" class="hero-section custom-landing-hero">
      <div class="container">
        <div class="row align-items-center position-relative landing-hero-row">
          <div class="col-lg-5">
            ${descripcionLanding({
              title: 'Descripcion sobre el uso como usuario comun',
              description: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore',
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
            description: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore',
            iconClass: 'lni-bootstrap',
          })}
          ${tarjetaLandingPage({
            title: 'Analizá',
            description: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore',
            iconClass: 'lni-layout',
          })}
          ${tarjetaLandingPage({
            title: 'Optimizá',
            description: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore',
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
              title: 'Descripcion sobre el uso como asesor',
              description: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed dinonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem. Lorem ipsum dolor sit amet.',
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
                  <a href="/" data-link>
                    <img src="/assets/img/logo/logo.svg" alt="" />
                  </a>
                </div>
                <p class="desc mb-30 text-white">
                  Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed
                  dinonumy eirmod tempor invidunt.
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

    <!-- ======== scroll-top ======== -->
    <a href="#" class="scroll-top btn-hover" aria-label="Volver al comienzo">
      <span class="scroll-top-triangle" aria-hidden="true"></span>
    </a>
  `;
}

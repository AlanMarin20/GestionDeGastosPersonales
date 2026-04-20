const TEAM_MEMBERS = [
  {
    name: 'Joaquin Contreras',
    image: '/assets/img/about/joaquin-contreras.webp',
    linkedin: 'https://www.linkedin.com/in/joaquincontreras755',
    email: 'cjoaquin35@gmail.com',
  },
  {
    name: 'Alan Marin',
    image: '/assets/img/about/alan-marin.webp',
    linkedin: 'https://www.linkedin.com/in/alanmarin20/',
    email: 'marinalan396@gmail.com',
  },
];

function renderTeamMemberCard(member) {
  return `
    <div class="col-12 col-md-6">
      <div class="border rounded-3 h-100 p-4 team-member-panel" style="border-color: var(--app-border-color) !important;">
        <div class="d-flex align-items-center gap-3 mb-3">
          <img
            src="${member.image}"
            alt="${member.name}"
            class="rounded-circle border"
            style="width: 72px; height: 72px; object-fit: cover; border-color: var(--app-border-color) !important;"
            onerror="this.onerror=null; this.src='/assets/img/user-avatar-default.svg';"
          />
          <div>
            <h6 class="fw-bold mb-1" style="color: var(--app-text-primary);">${member.name}</h6>
            <p class="text-muted mb-0 small">Desarrollador Web</p>
          </div>
        </div>

        <div class="d-flex flex-column gap-2">
          <a href="${member.linkedin}" target="_blank" rel="noopener noreferrer" class="text-decoration-none faq-link">
            <i class="lni lni-linkedin-original me-2"></i>LinkedIn
          </a>
          <a href="mailto:${member.email}" class="text-decoration-none faq-link">
            <i class="lni lni-envelope me-2"></i>${member.email}
          </a>
        </div>
      </div>
    </div>
  `;
}

export function renderSobreNosotrosPage({
  encabezadoExterno,
  encabezadoAuthPublico,
  tarjetaPublicaBase,
  botonScrollTop,
}) {
  const headerAuthMarkup = encabezadoAuthPublico({
    activeRoute: '/sobre-nosotros',
  });

  const aboutProjectCard = tarjetaPublicaBase({
    bodyClass: 'card-body p-4 p-md-5',
    bodyMarkup: `
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
    `,
  });

  const teamCard = tarjetaPublicaBase({
    bodyClass: 'card-body p-4 p-md-5',
    bodyMarkup: `
      <h5 class="fw-bold mb-4" style="color: var(--app-text-primary);">Equipo de Desarrollo</h5>

      <div class="row g-4">
        ${TEAM_MEMBERS.map((member) => renderTeamMemberCard(member)).join('')}
      </div>
    `,
  });

  return `
    <div class="min-vh-100 d-flex flex-column public-page-shell public-about-page" style="background-color: var(--app-surface-bg);">
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
            ${aboutProjectCard}
          </div>

          <div class="col-12 col-xl-10">
            ${teamCard}
          </div>
        </div>
      </div>

      ${botonScrollTop()}
    </div>
  `;
}

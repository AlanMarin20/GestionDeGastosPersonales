import { escapeHtml } from '../utils/sanitize';
import { t } from '../i18n';

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
      <div class="border rounded-3 h-100 p-4 team-member-panel">
        <div class="d-flex align-items-center gap-3 mb-3">
          <img
            src="${escapeHtml(member.image)}"
            alt="${escapeHtml(member.name)}"
            class="rounded-circle border fp-team-member-avatar"
            data-fallback-src="/assets/img/user-avatar-default.svg"
          />
          <div>
            <h6 class="fw-bold mb-1 fp-public-title-sm">${escapeHtml(member.name)}</h6>
            <p class="text-muted mb-0 small">${t('about.webDeveloper')}</p>
          </div>
        </div>
        <div class="d-flex flex-column gap-2">
          <a href="${escapeHtml(member.linkedin)}" target="_blank" rel="noopener noreferrer" class="text-decoration-none faq-link">
            <i class="lni lni-linkedin-original me-2" aria-hidden="true"></i>LinkedIn
          </a>
          <a href="mailto:${escapeHtml(member.email)}" class="text-decoration-none faq-link">
            <i class="lni lni-envelope me-2" aria-hidden="true"></i>${escapeHtml(member.email)}
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
      <h5 class="fw-bold mb-3 fp-public-subtitle">${t('about.whatIsTitle')}</h5>
      <p class="text-muted mb-3">
        ${t('about.whatIsP1')}
      </p>
      <p class="text-muted mb-3">
        ${t('about.whatIsP2')}
      </p>
      <p class="text-muted mb-0">
        ${t('about.whatIsP3')}
      </p>
    `,
  });

  const teamCard = tarjetaPublicaBase({
    bodyClass: 'card-body p-4 p-md-5',
    bodyMarkup: `
      <h5 class="fw-bold mb-4 fp-public-subtitle">${t('about.teamTitle')}</h5>
      <div class="row g-4">
        ${TEAM_MEMBERS.map(renderTeamMemberCard).join('')}
      </div>
    `,
  });

  return `
    <div class="min-vh-100 d-flex flex-column public-page-shell public-about-page fp-public-surface">
      ${encabezadoExterno({
        rightHref: '/login',
        rightText: t('landing.authLogin'),
        rightClass: 'landing-access-btn landing-login-btn',
        rightMarkup: headerAuthMarkup,
      })}

      <main class="container flex-grow-1 fp-public-main-container">
        <div class="row g-4 justify-content-center">
          <div class="col-12 col-xl-10">
            <h1 class="fw-bold mb-3 fp-public-title">${t('about.pageTitle')}</h1>
            <p class="text-muted mb-0">
              ${t('about.intro')}
            </p>
          </div>
          <div class="col-12 col-xl-10">
            ${aboutProjectCard}
          </div>
          <div class="col-12 col-xl-10">
            ${teamCard}
          </div>
        </div>
      </main>

      ${botonScrollTop()}
    </div>
  `;
}

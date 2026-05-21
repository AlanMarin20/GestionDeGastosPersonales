import { escapeHtml } from "../../utils/sanitize";
import { t } from "../../i18n";

// Se utiliza para Acceder, Volver al Inicio
export function botonEncabezadoExterno({
  href = '/',
  text = t('header.access'),
  className = '',
  sizeClass = 'btn-sm',
  wowDelay = '',
} = {}) {
  const classes = ['main-btn', 'border-btn', 'btn-hover', 'boton-outline-reusable'];

  if (sizeClass) {
    classes.push(sizeClass);
  }

  if (wowDelay) {
    classes.push('wow', 'fadeInUp');
  }

  if (className) {
    classes.push(className);
  }

  const wowDelayAttribute = wowDelay ? ` data-wow-delay="${escapeHtml(wowDelay)}"` : '';

  return `<a href="${escapeHtml(href)}" data-link class="${escapeHtml(classes.join(' '))}"${wowDelayAttribute}>${escapeHtml(text)}</a>`;
}

export function encabezadoInterno({
  pageTitle = '',
  profileImage = '/assets/img/user-avatar-default.svg',
  profileName = 'Usuario',
  currentRole = 'Usuario',
  isAsesor = false,
  brandTarget = '/dashboard',
  advisorClientHref = '/dashboard/asesor',
  showAdvisorClientLink = false,
  transparent = false,
} = {}) {
  const roleLabel = isAsesor ? t('header.role.advisor') : t('header.role.user');
  const brandAction = brandTarget === 'scroll-top' ? 'brand-scroll-top' : 'brand-navigation';
  const headerClasses = [
    'py-3',
    'px-4',
    'd-flex',
    'justify-content-between',
    'align-items-center',
    'gap-3',
    'fp-internal-header',
    transparent ? 'fp-internal-header-transparent' : '',
  ].filter(Boolean);

  if (!transparent) {
    headerClasses.unshift('shadow-sm');
  }

  return `
    <header class="${escapeHtml(headerClasses.join(' '))}">
      <div class="d-flex align-items-center gap-3">
        ${showAdvisorClientLink
          ? `<button type="button" class="btn btn-outline-secondary btn-sm fw-semibold d-inline-flex align-items-center gap-2" data-nav="${escapeHtml(advisorClientHref)}" aria-label="${t('header.backToAdvisorDashboard')}">
              <i class="lni lni-arrow-left" aria-hidden="true"></i>
              <span class="d-none d-md-inline">${t('common.back')}</span>
            </button>`
          : ''}
        <button type="button" class="btn p-0 border-0 bg-transparent d-inline-flex align-items-center gap-2 d-none d-sm-inline-flex ms-1 text-decoration-none fp-brand-trigger" data-action="${escapeHtml(brandAction)}" data-target="${escapeHtml(brandTarget)}" aria-label="${t('header.goToFinanzasPro')}">
          <span class="d-inline-flex align-items-center justify-content-center rounded-circle shadow-sm overflow-hidden flex-shrink-0 fp-brand-icon-shell">
            <img src="/assets/img/logo/iconoSfondo.webp" alt="${t('header.brandIconAlt')}" class="fp-brand-icon-image">
          </span>
          <h4 class="mb-0 fw-bold text-dark fs-5 fp-brand-text-dark">FinanzasPro</h4>
          ${pageTitle
            ? `<span class="ms-sm-3 text-muted fw-semibold d-none d-md-block border-start ps-sm-3 border-2">${escapeHtml(pageTitle)}</span>`
            : ''}
        </button>
      </div>

      <div class="d-flex align-items-center gap-2 gap-md-3">
        <div class="dropdown">
          <button class="btn btn-outline-primary btn-sm fw-semibold dropdown-toggle shadow-sm fp-role-switcher" type="button" id="roleSwitcher" data-bs-toggle="dropdown" aria-expanded="false">
            ${escapeHtml(roleLabel)}
          </button>
          <ul class="dropdown-menu dropdown-menu-end shadow border-0 mt-3 fp-role-menu" aria-labelledby="roleSwitcher">
            <li>
              <a class="dropdown-item py-2 fw-semibold text-dark ${!isAsesor ? 'bg-primary bg-opacity-10 text-primary' : ''}" href="/dashboard" data-link>
                <i class="lni lni-user me-2"></i> ${t('header.user')}
              </a>
            </li>
            <li>
              <a class="dropdown-item py-2 fw-semibold text-dark ${isAsesor ? 'bg-primary bg-opacity-10 text-primary' : ''}" href="/dashboard/asesor" data-link>
                <i class="lni lni-briefcase me-2"></i> ${t('header.advisor')}
              </a>
            </li>
          </ul>
        </div>

        <div class="dropdown">
          <a href="#" class="d-block text-decoration-none" id="dropdownUser" data-bs-toggle="dropdown" aria-expanded="false" aria-label="${t('header.openUserMenu')}">
            <img src="${escapeHtml(profileImage)}" class="rounded-circle border border-2 border-primary shadow-sm fp-profile-avatar" alt="${t('header.profileAlt')}">
          </a>
          <ul class="dropdown-menu dropdown-menu-end shadow border-0 mt-3 fp-user-menu" aria-labelledby="dropdownUser">
            <li class="px-3 py-2 border-bottom mb-1">
              <div class="d-flex align-items-center gap-3">
                <img src="${escapeHtml(profileImage)}" class="rounded-circle fp-user-menu-avatar" alt="${t('header.profileAlt')}">
                <div>
                  <p class="mb-0 fw-bold text-dark lh-sm fp-user-menu-name">${escapeHtml(profileName)}</p>
                  <small class="text-muted fw-semibold fp-user-menu-role">${escapeHtml(currentRole)}</small>
                </div>
              </div>
            </li>
            <li><a class="dropdown-item py-2 fw-semibold text-dark" href="/dashboard" data-link><i class="lni lni-grid-alt me-2"></i> ${t('header.myDashboard')}</a></li>
            ${showAdvisorClientLink ? `<li><a class="dropdown-item py-2 fw-semibold text-dark" href="${escapeHtml(advisorClientHref)}" data-link><i class="lni lni-users me-2"></i> ${t('header.viewOtherClient')}</a></li>` : ''}
            <li><a class="dropdown-item py-2 fw-semibold text-dark" href="/perfil/editar" data-link><i class="lni lni-user me-2"></i> ${t('header.editProfile')}</a></li>
            <li><a class="dropdown-item py-2 fw-semibold text-dark" href="/perfil/notificaciones" data-link><i class="lni lni-alarm me-2"></i> ${t('header.notifications')}</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><button type="button" class="dropdown-item py-2 fw-bold text-danger border-0 bg-transparent text-start" data-action="logout"><i class="lni lni-exit me-2"></i> ${t('header.logout')}</button></li>
          </ul>
        </div>
      </div>
    </header>
  `;
}

export function encabezadoExterno({
  rightHref = '/',
  rightText = t('header.backToHome'),
  rightClass = '',
  withLightBackground = false,
  rightMarkup = '',
} = {}) {
  const headerClasses = [
    'header',
    'position-relative',
    'fp-external-header',
    withLightBackground ? 'fp-external-header-light' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return `
    <header class="${escapeHtml(headerClasses)}">
      <div class="navbar-area">
        <div class="container">
          <div class="row align-items-center">
            <div class="col-lg-12">
              <nav class="navbar navbar-expand-lg d-flex justify-content-between py-3">
                <a class="navbar-brand d-inline-flex align-items-center gap-2 fp-brand-link" href="/" data-link>
                  <span class="d-inline-flex align-items-center justify-content-center rounded-circle shadow-sm overflow-hidden flex-shrink-0 fp-brand-icon-shell">
                          <img src="/assets/img/logo/iconoSfondo.webp" alt="${t('header.brandIconAlt')}" class="fp-brand-icon-image">
                  </span>
                  <span class="fw-bold text-white fs-5 fp-brand-text-light">FinanzasPro</span>
                </a>
                ${rightMarkup || botonEncabezadoExterno({
                  href: rightHref,
                  text: rightText,
                  className: rightClass,
                  sizeClass: 'btn-sm',
                })}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </header>
  `;
}

export function encabezadoAuthPublico({
  activeRoute = '/',
  includeFaqClass = false,
  includeMobileToggle = false,
} = {}) {
  const navItems = [
    { href: '/', label: t('header.home') },
    { href: '/faqs', label: t('header.faqs') },
    { href: '/sobre-nosotros', label: t('header.about') },
  ];

  const navLinksMarkup = navItems
    .map((item) => {
      const isActive = item.href === activeRoute;
      const linkClasses = isActive
        ? 'text-white text-decoration-none fw-bold landing-nav-link-active'
        : 'text-white text-decoration-none nav-link-hover';

      return `<a href="${escapeHtml(item.href)}" data-link class="${escapeHtml(linkClasses)}">${escapeHtml(item.label)}</a>`;
    })
    .join('');

  const groupClasses = [
    'landing-auth-group',
    includeFaqClass ? 'faq-auth-group' : '',
    'd-flex',
    'align-items-center',
    'gap-2',
    'gap-md-3',
  ]
    .filter(Boolean)
    .join(' ');

  const mobileToggleMarkup = includeMobileToggle
    ? `
      <button
        type="button"
        class="landing-mobile-menu-toggle d-lg-none"
        data-action="toggle-landing-mobile-menu"
        aria-expanded="false"
        aria-controls="landing-mobile-navigation"
        aria-label="${t('header.openNavMenu')}"
      >
        <span class="landing-mobile-menu-toggle-line" aria-hidden="true"></span>
        <span class="landing-mobile-menu-toggle-line" aria-hidden="true"></span>
        <span class="landing-mobile-menu-toggle-line" aria-hidden="true"></span>
      </button>
    `
    : '';

  return `
    <div class="${escapeHtml(groupClasses)}">
      <div class="landing-nav-links d-none d-lg-flex align-items-center gap-4 pe-2">
        ${navLinksMarkup}
      </div>
      <span class="landing-auth-copy">${t('header.tagline')}</span>
      ${botonEncabezadoExterno({
        href: '/login',
        text: t('header.login'),
        className: 'landing-access-btn landing-login-btn',
        sizeClass: 'btn-sm',
      })}
      ${botonEncabezadoExterno({
        href: '/registro',
        text: t('header.register'),
        className: 'landing-access-btn landing-register-btn',
        sizeClass: 'btn-sm',
      })}
      ${mobileToggleMarkup}
    </div>
  `;
}

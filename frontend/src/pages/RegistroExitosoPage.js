import { t } from '../i18n';

export function renderRegistroExitosoPage({
  encabezadoExterno,
  fondoDecorativoAuth,
  renderAuthPublicPage,
}) {
  return renderAuthPublicPage({
    encabezadoExterno,
    fondoDecorativoAuth,
    cardBodyClass: 'card-body p-5 text-center',
    contentMarkup: `
      <div class="d-inline-flex align-items-center justify-content-center rounded-circle mb-4 fp-registro-exito-badge">
        <span aria-hidden="true" class="fp-registro-exito-mark">✓</span>
      </div>

      <h3 class="mb-3">${t('auth.accountCreated')}</h3>
      <p class="text-muted mb-4">${t('auth.accountCreatedDesc')}</p>
      <p class="small text-muted mb-4">
        ${t('auth.autoRedirect', { seconds: '<span id="registroExitosoCountdown" class="fw-bold">5</span>' })}
      </p>

      <a href="/login" data-link class="main-btn btn-hover w-100 mb-3 fp-auth-primary-btn">
        ${t('auth.goToLogin')}
      </a>
      <a href="/" data-link class="btn btn-outline-secondary w-100 fw-semibold fp-auth-secondary-btn">
        ${t('auth.backToHome')}
      </a>
    `,
  });
}

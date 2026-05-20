import { t } from '../i18n';

export function renderRecuperarContrasenaPage({
  encabezadoExterno,
  botonIniciarCrearCuenta,
  campoAuthInput,
  fondoDecorativoAuth,
  renderAuthPublicPage,
}) {
  const helperMarkup = `
    <p class="small text-muted mb-4 lh-sm">
      ${t('auth.recoverHelper')}
    </p>
  `;

  const fieldsMarkup = [
    campoAuthInput({
      id: 'email',
      label: t('auth.email'),
      type: 'email',
      placeholder: t('auth.emailPlaceholder'),
      wrapperClass: 'mb-3',
    }),
    helperMarkup,
  ].join('');

  const footerMarkup = `
    <p class="text-muted mb-2">
      ${t('auth.rememberedPassword')}
      <a href="/login" data-link class="text-primary fw-bold text-decoration-none">${t('auth.loginLinkLower')}</a>
    </p>
    <p class="text-muted mb-0">
      ${t('auth.noAccount')}
      <a href="/registro" data-link class="text-primary fw-bold text-decoration-none">${t('auth.registerHere')}</a>
    </p>
  `;

  return renderAuthPublicPage({
    encabezadoExterno,
    fondoDecorativoAuth,
    heading: t('auth.recoverHeading'),
    description: t('auth.recoverDescription'),
    formId: 'recuperarContrasenaForm',
    errorId: 'recuperarContrasenaError',
    formFieldsMarkup: fieldsMarkup,
    submitButtonMarkup: botonIniciarCrearCuenta({
      text: t('auth.sendVerificationCode'),
      type: 'submit',
      className: 'main-btn btn-hover w-100 mb-3',
    }),
    footerMarkup,
    footerClass: 'text-center',
  });
}

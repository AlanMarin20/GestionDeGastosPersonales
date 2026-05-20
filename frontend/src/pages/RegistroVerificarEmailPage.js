import { t } from '../i18n';

export function renderRegistroVerificarEmailPage({
  encabezadoExterno,
  botonIniciarCrearCuenta,
  campoAuthInput,
  fondoDecorativoAuth,
  renderAuthPublicPage,
}) {
  const helperMarkup = `
    <div class="rounded-3 border border-primary border-opacity-25 bg-primary bg-opacity-10 text-primary small p-3 mb-4">
      ${t('auth.verifyEmailHelper')}
    </div>
  `;

  const fieldsMarkup = [
    campoAuthInput({
      id: 'codigoRegistro',
      label: t('auth.verificationCode'),
      type: 'text',
      placeholder: t('auth.verificationCodePlaceholder'),
      wrapperClass: 'mb-3',
    }),
    helperMarkup,
  ].join('');

  const footerMarkup = `
    <p class="text-muted mb-2">
      ${t('auth.noCodeReceived')}
      <a href="#" data-action="resend-registration-code" class="text-primary fw-bold text-decoration-none">${t('auth.resendCode')}</a>
    </p>
    <p class="text-muted mb-0">
      ${t('auth.backTo')} <a href="/registro" data-link class="text-primary fw-bold text-decoration-none">${t('auth.createAccountLink')}</a>
    </p>
  `;

  return renderAuthPublicPage({
    encabezadoExterno,
    fondoDecorativoAuth,
    heading: t('auth.verifyEmailHeading'),
    description: t('auth.verifyEmailDescription'),
    formId: 'verificarRegistroForm',
    errorId: 'verificarRegistroError',
    formFieldsMarkup: fieldsMarkup,
    submitButtonMarkup: botonIniciarCrearCuenta({
      text: t('auth.activateAccount'),
      type: 'submit',
      className: 'main-btn btn-hover w-100 mb-3',
    }),
    footerMarkup,
    footerClass: 'text-center',
  });
}

import { t } from '../i18n';

export function renderVerificarCodigoRecuperacionPage({
  encabezadoExterno,
  botonIniciarCrearCuenta,
  campoAuthInput,
  fondoDecorativoAuth,
  renderAuthPublicPage,
}) {
  const helperMarkup = `
    <div class="rounded-3 border border-primary border-opacity-25 bg-primary bg-opacity-10 text-primary small p-3 mb-4">
      ${t('auth.verifyCodeHelper')}
    </div>
  `;

  const fieldsMarkup = [
    campoAuthInput({
      id: 'codigoRecuperacion',
      label: t('auth.verificationCodeLabel'),
      type: 'text',
      placeholder: t('auth.verificationCodePlaceholderLower'),
      wrapperClass: 'mb-3',
    }),
    helperMarkup,
  ].join('');

  const footerMarkup = `
    <p class="text-muted mb-2">
      ${t('auth.noCodeReceivedLower')}
      <a href="/recuperar-contrasena" data-link class="text-primary fw-bold text-decoration-none">${t('auth.requestNewCode')}</a>
    </p>
    <p class="text-muted mb-0">
      ${t('auth.backTo')} <a href="/login" data-link class="text-primary fw-bold text-decoration-none">${t('auth.loginLinkLower')}</a>
    </p>
  `;

  return renderAuthPublicPage({
    encabezadoExterno,
    fondoDecorativoAuth,
    heading: t('auth.verifyCodeHeading'),
    description: t('auth.verifyCodeDescription'),
    formId: 'verificarCodigoForm',
    errorId: 'verificarCodigoError',
    formFieldsMarkup: fieldsMarkup,
    submitButtonMarkup: botonIniciarCrearCuenta({
      text: t('auth.verifyCode'),
      type: 'submit',
      className: 'main-btn btn-hover w-100 mb-3',
    }),
    footerMarkup,
    footerClass: 'text-center',
  });
}

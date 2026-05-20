import { t } from '../i18n';

export function renderNuevaContrasenaPage({
  encabezadoExterno,
  botonIniciarCrearCuenta,
  campoAuthInput,
  fondoDecorativoAuth,
  renderAuthPublicPage,
}) {
  const passwordRowMarkup = `
    <div class="row">
      <div class="col-md-6 mb-4">
        ${campoAuthInput({
          id: 'nuevaContrasena',
          label: t('auth.newPasswordLabel'),
          type: 'password',
          placeholder: t('auth.passwordPlaceholder'),
          wrapperClass: null,
        })}
      </div>

      <div class="col-md-6 mb-4">
        ${campoAuthInput({
          id: 'confirmarContrasena',
          label: t('auth.confirmPasswordLabel'),
          type: 'password',
          placeholder: t('auth.passwordPlaceholder'),
          wrapperClass: null,
        })}
      </div>
    </div>
  `;

  const helperMarkup = `
    <p class="small text-muted mb-4">
      ${t('auth.passwordHelper')}
    </p>
  `;

  const fieldsMarkup = [passwordRowMarkup, helperMarkup].join('');

  const footerMarkup = `
    <p class="text-muted mb-0">
      ${t('auth.backTo')} <a href="/login" data-link class="text-primary fw-bold text-decoration-none">${t('auth.loginLinkLower')}</a>
    </p>
  `;

  return renderAuthPublicPage({
    encabezadoExterno,
    fondoDecorativoAuth,
    heading: t('auth.newPasswordHeading'),
    description: t('auth.newPasswordDescription'),
    formId: 'actualizarContrasenaForm',
    errorId: 'actualizarContrasenaError',
    formFieldsMarkup: fieldsMarkup,
    submitButtonMarkup: botonIniciarCrearCuenta({
      text: t('auth.updatePassword'),
      type: 'submit',
      className: 'main-btn btn-hover w-100 mb-3',
    }),
    footerMarkup,
    footerClass: 'text-center',
  });
}

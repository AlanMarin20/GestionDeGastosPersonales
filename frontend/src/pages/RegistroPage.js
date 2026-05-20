import { t } from '../i18n';

export function renderRegistroPage({
  encabezadoExterno,
  botonIniciarCrearCuenta,
  campoAuthInput,
  fondoDecorativoAuth,
  renderAuthPublicPage,
}) {
  // OAuth de terceros (Google/Apple) deshabilitado temporalmente.

  const passwordRowMarkup = `
    <div class="row">
      <div class="col-md-6 mb-4">
        ${campoAuthInput({
          id: 'contrasena',
          label: t('auth.password'),
          type: 'password',
          placeholder: t('auth.passwordPlaceholder'),
          wrapperClass: null,
        })}
      </div>

      <div class="col-md-6 mb-4">
        ${campoAuthInput({
          id: 'confirmarContrasena',
          label: t('auth.confirm'),
          type: 'password',
          placeholder: t('auth.passwordPlaceholder'),
          wrapperClass: null,
        })}
      </div>
    </div>
  `;

  const fieldsMarkup = [
    campoAuthInput({
      id: 'nombre',
      label: t('auth.fullName'),
      type: 'text',
      placeholder: t('auth.fullNamePlaceholder'),
      wrapperClass: 'mb-3',
    }),
    campoAuthInput({
      id: 'email',
      label: t('auth.email'),
      type: 'email',
      placeholder: t('auth.emailPlaceholder'),
      wrapperClass: 'mb-3',
    }),
    passwordRowMarkup,
  ].join('');

  const footerMarkup = `
    <p class="text-muted mb-0">
      ${t('auth.alreadyAccount')}
      <a href="/login" data-link class="text-primary fw-bold text-decoration-none">${t('auth.loginLink')}</a>
    </p>
  `;

  return renderAuthPublicPage({
    encabezadoExterno,
    fondoDecorativoAuth,
    heading: t('auth.createAccount'),
    description: t('auth.registerDescription'),
    formId: 'registroForm',
    errorId: 'registroError',
    formFieldsMarkup: fieldsMarkup,
    submitButtonMarkup: botonIniciarCrearCuenta({
      text: t('auth.createAccountBtn'),
      type: 'submit',
      className: 'main-btn btn-hover w-100 mt-3 mb-3',
    }),
    footerMarkup,
    footerClass: 'text-center mt-4',
  });
}

import { t } from '../i18n';

export function renderLoginPage({
  encabezadoExterno,
  botonIniciarCrearCuenta,
  campoAuthInput,
  renderAuthPublicPage,
  fondoDecorativoAuth,
}) {
  // OAuth de terceros (Google/Apple) deshabilitado temporalmente.
  const fieldsMarkup = [
    campoAuthInput({
      id: 'email',
      label: t('auth.email'),
      type: 'email',
      placeholder: t('auth.emailPlaceholder'),
      wrapperClass: 'mb-4',
    }),
    campoAuthInput({
      id: 'contrasena',
      label: t('auth.password'),
      type: 'password',
      placeholder: t('auth.passwordPlaceholder'),
      wrapperClass: 'mb-4',
    }),
  ].join('');

  const footerMarkup = `
    <p class="text-muted mb-0">
      ${t('auth.noAccount')} <a href="/registro" data-link class="text-primary fw-bold text-decoration-none">${t('auth.registerHere')}</a>
    </p>
  `;

  const submitButtonMarkup = [
    botonIniciarCrearCuenta({
      text: t('auth.login'),
      type: 'submit',
      className: 'main-btn btn-hover w-100 mb-3',
    }),
    `<p class="text-muted mb-3 text-center"><a href="/recuperar-contrasena" data-link class="text-primary fw-bold text-decoration-none">${t('auth.loginProblems')}</a></p>`,
  ].join('');

  return renderAuthPublicPage({
    encabezadoExterno,
    fondoDecorativoAuth,
    heading: t('auth.welcomeBack'),
    description: t('auth.loginDescription'),
    formId: 'loginForm',
    errorId: 'loginError',
    formFieldsMarkup: fieldsMarkup,
    submitButtonMarkup,
    footerMarkup,
    footerClass: 'text-center',
  });
}

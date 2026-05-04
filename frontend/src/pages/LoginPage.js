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
      label: 'Correo Electrónico',
      type: 'email',
      placeholder: 'ejemplo@correo.com',
      wrapperClass: 'mb-4',
    }),
    campoAuthInput({
      id: 'contrasena',
      label: 'Contraseña',
      type: 'password',
      placeholder: '********',
      wrapperClass: 'mb-4',
    }),
  ].join('');

  const footerMarkup = `
    <p class="text-muted mb-0">
      ¿No tienes cuenta? <a href="/registro" data-link class="text-primary fw-bold text-decoration-none">Registrate aqui</a>
    </p>
  `;

  const submitButtonMarkup = [
    botonIniciarCrearCuenta({
      text: 'Iniciar Sesión',
      type: 'submit',
      className: 'main-btn btn-hover w-100 mb-3',
    }),
    '<p class="text-muted mb-3 text-center"><a href="/recuperar-contrasena" data-link class="text-primary fw-bold text-decoration-none">¿Problemas para iniciar sesion?</a></p>',
  ].join('');

  return renderAuthPublicPage({
    encabezadoExterno,
    fondoDecorativoAuth,
    heading: '¡Bienvenido de nuevo!',
    description: 'Ingresa a tu cuenta para gestionar tus gastos.',
    formId: 'loginForm',
    errorId: 'loginError',
    formFieldsMarkup: fieldsMarkup,
    submitButtonMarkup,
    footerMarkup,
    footerClass: 'text-center',
  });
}

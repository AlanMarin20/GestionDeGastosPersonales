export function renderRecuperarContrasenaPage({
  encabezadoExterno,
  botonIniciarCrearCuenta,
  campoAuthInput,
  fondoDecorativoAuth,
  renderAuthPublicPage,
}) {
  const helperMarkup = `
    <p class="small text-muted mb-4 lh-sm">
      Si el correo pertenece a una cuenta, enviaremos un codigo de verificacion para continuar.
    </p>
  `;

  const fieldsMarkup = [
    campoAuthInput({
      id: 'email',
      label: 'Correo Electronico',
      type: 'email',
      placeholder: 'ejemplo@correo.com',
      wrapperClass: 'mb-3',
    }),
    helperMarkup,
  ].join('');

  const footerMarkup = `
    <p class="text-muted mb-2">
      ¿Recordaste tu contraseña?
      <a href="/login" data-link class="text-primary fw-bold text-decoration-none">Inicia sesion</a>
    </p>
    <p class="text-muted mb-0">
      No tienes cuenta?
      <a href="/registro" data-link class="text-primary fw-bold text-decoration-none">Registrate aqui</a>
    </p>
  `;

  return renderAuthPublicPage({
    encabezadoExterno,
    fondoDecorativoAuth,
    heading: 'Recupera tu contraseña',
    description: 'Confirma tu identidad para poder crear una nueva contraseña.',
    formId: 'recuperarContrasenaForm',
    errorId: 'recuperarContrasenaError',
    formFieldsMarkup: fieldsMarkup,
    submitButtonMarkup: botonIniciarCrearCuenta({
      text: 'Enviar codigo de verificacion',
      type: 'submit',
      className: 'main-btn btn-hover w-100 mb-3',
    }),
    footerMarkup,
    footerClass: 'text-center',
  });
}

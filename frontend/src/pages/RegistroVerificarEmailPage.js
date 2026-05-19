export function renderRegistroVerificarEmailPage({
  encabezadoExterno,
  botonIniciarCrearCuenta,
  campoAuthInput,
  fondoDecorativoAuth,
  renderAuthPublicPage,
}) {
  const helperMarkup = `
    <div class="rounded-3 border border-primary border-opacity-25 bg-primary bg-opacity-10 text-primary small p-3 mb-4">
      Enviamos un código de 6 dígitos a tu correo. Revisá tu bandeja de entrada o spam.
    </div>
  `;

  const fieldsMarkup = [
    campoAuthInput({
      id: 'codigoRegistro',
      label: 'Código de verificación',
      type: 'text',
      placeholder: 'Ingresá el código de 6 dígitos',
      wrapperClass: 'mb-3',
    }),
    helperMarkup,
  ].join('');

  const footerMarkup = `
    <p class="text-muted mb-2">
      ¿No recibiste el código?
      <a href="#" data-action="resend-registration-code" class="text-primary fw-bold text-decoration-none">Reenviar código</a>
    </p>
    <p class="text-muted mb-0">
      Volver a <a href="/registro" data-link class="text-primary fw-bold text-decoration-none">Crear cuenta</a>
    </p>
  `;

  return renderAuthPublicPage({
    encabezadoExterno,
    fondoDecorativoAuth,
    heading: 'Verificá tu correo',
    description: 'Ingresá el código que enviamos a tu correo para activar tu cuenta.',
    formId: 'verificarRegistroForm',
    errorId: 'verificarRegistroError',
    formFieldsMarkup: fieldsMarkup,
    submitButtonMarkup: botonIniciarCrearCuenta({
      text: 'Activar cuenta',
      type: 'submit',
      className: 'main-btn btn-hover w-100 mb-3',
    }),
    footerMarkup,
    footerClass: 'text-center',
  });
}

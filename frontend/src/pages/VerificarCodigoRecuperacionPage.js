export function renderVerificarCodigoRecuperacionPage({
  encabezadoExterno,
  botonIniciarCrearCuenta,
  campoAuthInput,
  fondoDecorativoAuth,
  renderAuthPublicPage,
}) {
  const helperMarkup = `
    <div class="rounded-3 border border-primary border-opacity-25 bg-primary bg-opacity-10 text-primary small p-3 mb-4">
      Si el correo pertenece a una cuenta, recibiras un codigo de 6 digitos para confirmar.
    </div>
  `;

  const fieldsMarkup = [
    campoAuthInput({
      id: 'codigoRecuperacion',
      label: 'Codigo de verificacion',
      type: 'text',
      placeholder: 'Ingresa el codigo de 6 digitos',
      wrapperClass: 'mb-3',
    }),
    helperMarkup,
  ].join('');

  const footerMarkup = `
    <p class="text-muted mb-2">
      No recibiste el codigo?
      <a href="/recuperar-contrasena" data-link class="text-primary fw-bold text-decoration-none">Solicitar un nuevo codigo</a>
    </p>
    <p class="text-muted mb-0">
      Volver a <a href="/login" data-link class="text-primary fw-bold text-decoration-none">Iniciar sesion</a>
    </p>
  `;

  return renderAuthPublicPage({
    encabezadoExterno,
    fondoDecorativoAuth,
    heading: 'Verifica tu codigo',
    description: 'Ingresa el codigo de verificacion de dos pasos para confirmar tu identidad.',
    formId: 'verificarCodigoForm',
    errorId: 'verificarCodigoError',
    formFieldsMarkup: fieldsMarkup,
    submitButtonMarkup: botonIniciarCrearCuenta({
      text: 'Verificar codigo',
      type: 'submit',
      className: 'main-btn btn-hover w-100 mb-3',
    }),
    footerMarkup,
    footerClass: 'text-center',
  });
}

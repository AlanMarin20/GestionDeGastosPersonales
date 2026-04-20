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
          label: 'Contraseña',
          type: 'password',
          placeholder: '********',
          wrapperClass: null,
        })}
      </div>

      <div class="col-md-6 mb-4">
        ${campoAuthInput({
          id: 'confirmarContrasena',
          label: 'Confirmar',
          type: 'password',
          placeholder: '********',
          wrapperClass: null,
        })}
      </div>
    </div>
  `;

  const fieldsMarkup = [
    campoAuthInput({
      id: 'nombre',
      label: 'Nombre Completo',
      type: 'text',
      placeholder: 'Juan Pérez',
      wrapperClass: 'mb-3',
    }),
    campoAuthInput({
      id: 'email',
      label: 'Correo Electrónico',
      type: 'email',
      placeholder: 'ejemplo@correo.com',
      wrapperClass: 'mb-3',
    }),
    passwordRowMarkup,
  ].join('');

  const footerMarkup = `
    <p class="text-muted mb-0">
      ¿Ya tienes una cuenta?
      <a href="/login" data-link class="text-primary fw-bold text-decoration-none">Inicia sesión</a>
    </p>
  `;

  return renderAuthPublicPage({
    encabezadoExterno,
    fondoDecorativoAuth,
    heading: 'Crea tu cuenta',
    description: 'Comienza a tomar el control de tus finanzas hoy mismo.',
    formId: 'registroForm',
    errorId: 'registroError',
    formFieldsMarkup: fieldsMarkup,
    submitButtonMarkup: botonIniciarCrearCuenta({
      text: 'Crear Cuenta',
      type: 'submit',
      className: 'main-btn btn-hover w-100 mt-3 mb-3',
    }),
    footerMarkup,
    footerClass: 'text-center mt-4',
  });
}

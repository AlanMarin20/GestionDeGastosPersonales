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
          label: 'Nueva contraseña',
          type: 'password',
          placeholder: '********',
          wrapperClass: null,
        })}
      </div>

      <div class="col-md-6 mb-4">
        ${campoAuthInput({
          id: 'confirmarContrasena',
          label: 'Confirmar contraseña',
          type: 'password',
          placeholder: '********',
          wrapperClass: null,
        })}
      </div>
    </div>
  `;

  const helperMarkup = `
    <p class="small text-muted mb-4">
      Usa al menos 8 caracteres con mayuscula, minuscula, numero y caracter especial.
    </p>
  `;

  const fieldsMarkup = [passwordRowMarkup, helperMarkup].join('');

  const footerMarkup = `
    <p class="text-muted mb-0">
      Volver a <a href="/login" data-link class="text-primary fw-bold text-decoration-none">Iniciar sesion</a>
    </p>
  `;

  return renderAuthPublicPage({
    encabezadoExterno,
    fondoDecorativoAuth,
    heading: 'Crea una nueva contraseña',
    description: 'Actualiza tu acceso para volver a iniciar sesion.',
    formId: 'actualizarContrasenaForm',
    errorId: 'actualizarContrasenaError',
    formFieldsMarkup: fieldsMarkup,
    submitButtonMarkup: botonIniciarCrearCuenta({
      text: 'Actualizar contraseña',
      type: 'submit',
      className: 'main-btn btn-hover w-100 mb-3',
    }),
    footerMarkup,
    footerClass: 'text-center',
  });
}

import { escapeHtml } from "../../utils/sanitize";
import { t } from "../../i18n";

export function fondoDecorativoAuth() {
  return `
    <div class="fp-auth-orb fp-auth-orb-primary" aria-hidden="true"></div>
    <div class="fp-auth-orb fp-auth-orb-success" aria-hidden="true"></div>
  `;
}

export function renderAuthPublicPage({
  encabezadoExterno,
  fondoDecorativoAuth,
  heading,
  description,
  formId,
  errorId,
  formFieldsMarkup = '',
  submitButtonMarkup = '',
  footerMarkup = '',
  footerClass = 'text-center',
} = {}) {
  return `
    <div class="login-page min-vh-100 position-relative overflow-hidden fp-auth-page-shell">
      ${fondoDecorativoAuth()}

      ${encabezadoExterno({ rightHref: '/', rightText: t('header.backToHome'), rightClass: 'landing-access-btn', withLightBackground: true })}

      <section class="login-section pt-150 pb-120 position-relative fp-auth-content-section">
        <div class="container">
          <div class="row justify-content-center">
            <div class="col-12 col-md-8 col-lg-5">
              <div class="card border-0 shadow-lg fp-auth-card">
                <div class="card-body p-5">
                  <div class="section-title text-center mb-30">
                    <h3 class="mb-15">${escapeHtml(heading)}</h3>
                    <p>${escapeHtml(description)}</p>
                  </div>

                  <form id="${escapeHtml(formId)}" novalidate>
                    <div id="${escapeHtml(errorId)}" class="alert alert-danger auth-error-alert d-none small p-2 text-center" role="alert"></div>
                    ${formFieldsMarkup}
                    ${submitButtonMarkup}
                  </form>

                  <div class="${escapeHtml(footerClass)}">
                    ${footerMarkup}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
}

export function campoAuthInput({
  id,
  label,
  type = 'text',
  placeholder = '',
  wrapperClass = 'mb-3',
  required = true,
  labelClass = 'form-label fw-bold',
  inputClass = 'form-control form-control-lg fp-auth-input',
  inputStyle = '',
} = {}) {
  const requiredAttr = required ? ' required' : '';
  const inputStyleAttr = inputStyle ? ` style="${escapeHtml(inputStyle)}"` : '';
  const inputMarkup = `
    <label for="${escapeHtml(id)}" class="${escapeHtml(labelClass)}">${escapeHtml(label)}</label>
    <input type="${escapeHtml(type)}" class="${escapeHtml(inputClass)}" id="${escapeHtml(id)}" placeholder="${escapeHtml(placeholder)}"${requiredAttr}${inputStyleAttr}>
  `;

  if (wrapperClass === null) {
    return inputMarkup;
  }

  const wrapperAttr = wrapperClass
    ? ` class="${escapeHtml(wrapperClass)}"`
    : '';

  return `<div${wrapperAttr}>${inputMarkup}</div>`;
}

export function botonIniciarCrearCuenta({
  text,
  type = 'button',
  className = 'main-btn btn-hover w-100 mb-4 fp-auth-primary-btn',
  style = '',
  iconHtml = '',
  id = '',
} = {}) {
  const idAttr = id ? ` id="${escapeHtml(id)}"` : '';
  const styleAttr = style ? ` style="${escapeHtml(style)}"` : '';
  const iconMarkup = iconHtml ? `<span class="d-inline-flex align-items-center">${iconHtml}</span>` : '';
  const textMarkup = `<span>${escapeHtml(text)}</span>`;
  const content = iconHtml
    ? `<span class="d-flex align-items-center justify-content-center gap-3">${iconMarkup}${textMarkup}</span>`
    : textMarkup;

  return `<button type="${escapeHtml(type)}" class="${escapeHtml(className)}"${styleAttr}${idAttr}>${content}</button>`;
}

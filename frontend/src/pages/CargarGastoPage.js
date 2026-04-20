import { renderDashboardAppLayout } from "../components/dashboard/dashboardAppLayout";
import { escapeHtml } from "../utils/sanitize";

const CATEGORY_OPTIONS = [
  "Supermercado",
  "Transporte",
  "Entretenimiento",
  "Salud",
  "Restaurantes",
  "Servicios",
  "Otros",
];

function renderCategoryOptions(selectedValue) {
  return CATEGORY_OPTIONS.map(
    (category) =>
      `<option value="${escapeHtml(category)}" ${selectedValue === category ? "selected" : ""}>${escapeHtml(category)}</option>`,
  ).join("");
}

export function renderCargarGastoPage({
  profileImage,
  profileName,
  activePath,
  pageTitle,
  pageSubtitle,
  activeTab,
  ticketFileName,
  aiForm,
  manualForm,
}) {
  const ticketTabActive = activeTab === "ticket";

  const content = `
    <div class="gd-tabs" role="tablist" aria-label="Modo de carga">
      <button
        type="button"
        class="gd-tab ${ticketTabActive ? "active" : ""}"
        data-action="switch-cargar-tab"
        data-tab="ticket"
      >
        Ticket con IA
      </button>
      <button
        type="button"
        class="gd-tab ${!ticketTabActive ? "active" : ""}"
        data-action="switch-cargar-tab"
        data-tab="manual"
      >
        Carga manual
      </button>
    </div>

    ${
      ticketTabActive
        ? `
          <div class="gd-card">
            <label class="gd-upload-zone" for="ticketUploadInput">
              <input type="file" id="ticketUploadInput" class="d-none" accept="image/png,image/jpeg,application/pdf">
              <div class="gd-upload-icon"><i class="lni lni-camera"></i></div>
              <div class="gd-upload-title">Subi una foto del ticket para autocompletar</div>
              <div class="gd-upload-sub">Formatos: PNG, JPG o PDF (maximo 10 MB)</div>
              <div class="gd-ai-badge"><i class="lni lni-bolt-alt"></i> IA extrae comercio, fecha, monto y categoria</div>
              ${ticketFileName ? `<div class="gd-upload-sub mt-2">Archivo detectado: ${escapeHtml(ticketFileName)}</div>` : ""}
            </label>

            <div class="gd-alert-strip warn">
              <i class="lni lni-warning"></i>
              <span>Revisa los datos detectados por IA antes de guardar.</span>
            </div>

            <form id="ticketAiForm">
              <div class="gd-form-grid">
                <div>
                  <label class="gd-form-label" for="ticketComercio">Comercio</label>
                  <input class="gd-form-input" id="ticketComercio" name="comercio" value="${escapeHtml(aiForm.comercio)}" required>
                </div>
                <div>
                  <label class="gd-form-label" for="ticketFecha">Fecha</label>
                  <input class="gd-form-input" id="ticketFecha" name="fecha" type="date" value="${escapeHtml(aiForm.fecha)}" required>
                </div>
                <div>
                  <label class="gd-form-label" for="ticketMonto">Monto</label>
                  <input class="gd-form-input" id="ticketMonto" name="monto" type="number" min="0" step="0.01" value="${escapeHtml(aiForm.monto)}" required>
                </div>
                <div>
                  <label class="gd-form-label" for="ticketCategoria">Categoria</label>
                  <select class="gd-form-select" id="ticketCategoria" name="categoria" required>
                    ${renderCategoryOptions(aiForm.categoria)}
                  </select>
                </div>
                <div class="gd-form-full">
                  <label class="gd-form-label" for="ticketDescripcion">Descripcion</label>
                  <input class="gd-form-input" id="ticketDescripcion" name="descripcion" value="${escapeHtml(aiForm.descripcion)}" placeholder="Detalle opcional">
                </div>
              </div>
              <button type="submit" class="gd-submit-btn">Guardar gasto detectado</button>
            </form>
          </div>
        `
        : `
          <div class="gd-card">
            <form id="manualExpenseForm">
              <div class="gd-form-grid">
                <div>
                  <label class="gd-form-label" for="manualComercio">Comercio</label>
                  <input class="gd-form-input" id="manualComercio" name="comercio" value="${escapeHtml(manualForm.comercio)}" placeholder="Ej: YPF, Carrefour" required>
                </div>
                <div>
                  <label class="gd-form-label" for="manualFecha">Fecha</label>
                  <input class="gd-form-input" id="manualFecha" name="fecha" type="date" value="${escapeHtml(manualForm.fecha)}" required>
                </div>
                <div>
                  <label class="gd-form-label" for="manualMonto">Monto</label>
                  <input class="gd-form-input" id="manualMonto" name="monto" type="number" min="0" step="0.01" value="${escapeHtml(manualForm.monto)}" required>
                </div>
                <div>
                  <label class="gd-form-label" for="manualCategoria">Categoria</label>
                  <select class="gd-form-select" id="manualCategoria" name="categoria" required>
                    <option value="">Selecciona una categoria</option>
                    ${renderCategoryOptions(manualForm.categoria)}
                  </select>
                </div>
                <div class="gd-form-full">
                  <label class="gd-form-label" for="manualDescripcion">Descripcion</label>
                  <input class="gd-form-input" id="manualDescripcion" name="descripcion" value="${escapeHtml(manualForm.descripcion)}" placeholder="Detalle opcional">
                </div>
              </div>
              <button type="submit" class="gd-submit-btn">Guardar gasto manual</button>
            </form>
          </div>
        `
    }
  `;

  return renderDashboardAppLayout({
    activePath,
    pageTitle,
    pageSubtitle,
    content,
    profileImage,
    profileName,
    notificationCount: 3,
  });
}

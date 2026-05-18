import { renderDashboardAppLayout } from "../components/dashboard/dashboardAppLayout";
import { escapeHtml } from "../utils/sanitize";

const NEW_CATEGORY_VALUE = "__new_category__";

function renderCategoryOptions(selectedValue, categoryOptions = []) {
  return `${categoryOptions
    .map(
      (cat) =>
        `<option value="${escapeHtml(cat)}" ${selectedValue === cat ? "selected" : ""}>${escapeHtml(cat)}</option>`,
    )
    .join("")}
    <option value="${NEW_CATEGORY_VALUE}" ${selectedValue === NEW_CATEGORY_VALUE ? "selected" : ""}>Nueva categoria</option>`;
}

function renderBatchQueue(batchTickets, categoryOptions) {
  if (!batchTickets || batchTickets.length === 0) {
    return "";
  }

  const cards = batchTickets
    .map((ticket, index) => {
      let statusBadge = "";
      let cardBody = "";

      if (ticket.status === "loading") {
        statusBadge = `<span class="gd-batch-badge gd-batch-badge--loading"><span class="gd-spinner gd-spinner--sm"></span> Analizando&hellip;</span>`;
        cardBody = `<p class="gd-muted gd-muted-sm" style="margin:0.4rem 0 0">Procesando archivo&hellip;</p>`;
      } else if (ticket.status === "ok") {
        statusBadge = `<span class="gd-batch-badge gd-batch-badge--ok">Listo</span>`;
        const d = ticket.data || {};
        cardBody = `
          <div class="gd-form-grid gd-form-grid--compact" style="margin-top:0.7rem">
            <div>
              <label class="gd-form-label" for="batchComercio${index}">Comercio/Fuente</label>
              <input class="gd-form-input" id="batchComercio${index}" name="comercio" value="${escapeHtml(d.comercio || "")}" placeholder="Ej: YPF, Carrefour">
            </div>
            <div>
              <label class="gd-form-label" for="batchFecha${index}">Fecha</label>
              <div class="gd-date-field">
                <i class="lni lni-calendar gd-date-field-icon" aria-hidden="true"></i>
                <input class="gd-form-input gd-date-field-input" id="batchFecha${index}" name="fecha" type="date" lang="es-AR" value="${escapeHtml(d.fecha || "")}">
              </div>
            </div>
            <div>
              <label class="gd-form-label" for="batchMonto${index}">Monto</label>
              <input class="gd-form-input" id="batchMonto${index}" name="monto" type="number" min="0" step="0.01" value="${escapeHtml(String(d.monto || ""))}">
            </div>
            <div>
              <label class="gd-form-label" for="batchCategoria${index}">Categoria</label>
              <select class="gd-form-select" id="batchCategoria${index}" name="categoria">
                <option value="">Selecciona una categoria</option>
                ${renderCategoryOptions(d.categoria || "", categoryOptions)}
              </select>
            </div>
            <div class="gd-form-full">
              <label class="gd-form-label" for="batchDescripcion${index}">Descripcion</label>
              <input class="gd-form-input" id="batchDescripcion${index}" name="descripcion" value="${escapeHtml(d.descripcion || "")}" placeholder="Detalle opcional">
            </div>
          </div>
          <div style="margin-top:0.8rem">
            <button type="button" class="gd-submit-btn" style="width:auto;padding:0.45rem 1.2rem" data-action="save-batch-ticket" data-batch-index="${index}">Guardar gasto</button>
          </div>
        `;
      } else if (ticket.status === "error") {
        statusBadge = `<span class="gd-batch-badge gd-batch-badge--error">Error</span>`;
        cardBody = `
          <p class="gd-muted gd-muted-sm" style="margin:0.4rem 0 0.6rem;color:var(--gd-danger,#dc3545)">${escapeHtml(ticket.error || "No se pudo interpretar el ticket.")}</p>
          <button type="button" class="gd-btn-secondary" data-action="fill-batch-ticket-manually" data-batch-index="${index}">Completar manualmente</button>
        `;
      } else {
        statusBadge = `<span class="gd-batch-badge">Pendiente</span>`;
      }

      return `
        <div class="gd-batch-card" data-batch-card="${index}">
          <div class="gd-batch-card__header">
            <span class="gd-batch-card__filename" title="${escapeHtml(ticket.fileName)}">${escapeHtml(ticket.fileName)}</span>
            ${statusBadge}
          </div>
          ${cardBody}
        </div>
      `;
    })
    .join("");

  return `
    <div class="gd-batch-queue" style="margin-top:1.2rem">
      <h3 class="gd-section-title" style="margin-bottom:0.8rem">Cola de tickets (${batchTickets.length})</h3>
      ${cards}
    </div>
  `;
}

export function renderCargarGastoPage({
  profileImage,
  profileName,
  activePath,
  pageTitle,
  pageSubtitle,
  ticketFileName,
  ocrLoading = false,
  expenseForm,
  categoryOptions = [],
  activeTab = "gasto",
  ingresoForm = {},
  ingresoCategories = [],
  batchTickets = [],
  batchMode = false,
}) {
  const categoryIsNew = expenseForm.categoria === NEW_CATEGORY_VALUE;
  const incomeCategoryIsNew = (ingresoForm.categoria || "") === NEW_CATEGORY_VALUE;

  const uploadZone = `
    <label class="gd-upload-zone" for="ticketUploadInput">
      <input type="file" id="ticketUploadInput" class="d-none" accept="image/png,image/jpeg" multiple>
      <div class="gd-upload-icon">
        ${ocrLoading ? '<span class="gd-spinner"></span>' : '<i class="lni lni-camera"></i>'}
      </div>
      <div class="gd-upload-title">
        ${ocrLoading ? "Analizando ticket con IA..." : "Arrastra y suelta tu ticket aqui, o haz clic para subirlo."}
      </div>
      ${!ocrLoading ? `
      <div class="gd-upload-sub">La IA autocompletara los datos si subes un ticket.</div>
      <div class="gd-ai-badge"><i class="lni lni-bolt-alt"></i> Scan with AI.</div>
      ` : ""}
      ${ticketFileName && !batchMode ? `<div class="gd-upload-sub" style="margin-top:0.4rem">Archivo: ${escapeHtml(ticketFileName)}</div>` : ""}
    </label>
  `;

  const gastoPanel = batchMode && batchTickets.length > 0
    ? `
      ${uploadZone}
      ${renderBatchQueue(batchTickets, categoryOptions)}
    `
    : `
      ${uploadZone}

    <p class="gd-muted gd-muted-sm" style="margin:0.5rem 0 0.8rem">La IA autocompletara los datos si subes un ticket.</p>

    <form id="expenseForm">
      <div class="gd-form-grid">
        <div>
          <label class="gd-form-label" for="expenseComercio">Comercio/Fuente</label>
          <input class="gd-form-input" id="expenseComercio" name="comercio" value="${escapeHtml(expenseForm.comercio)}" placeholder="Ej: YPF, Carrefour" required>
        </div>
        <div>
          <label class="gd-form-label" for="expenseFecha">Fecha</label>
          <div class="gd-date-field">
            <i class="lni lni-calendar gd-date-field-icon" aria-hidden="true"></i>
            <input class="gd-form-input gd-date-field-input" id="expenseFecha" name="fecha" type="date" lang="es-AR" value="${escapeHtml(expenseForm.fecha)}" required>
          </div>
        </div>
        <div>
          <label class="gd-form-label" for="expenseMonto">Monto</label>
          <input class="gd-form-input" id="expenseMonto" name="monto" type="number" min="0" step="0.01" value="${escapeHtml(expenseForm.monto)}" required>
        </div>
        <div>
          <label class="gd-form-label" for="expenseCategoria">Categoria</label>
          <select class="gd-form-select" id="expenseCategoria" name="categoria" required>
            <option value="">Selecciona una categoria</option>
            ${renderCategoryOptions(expenseForm.categoria, categoryOptions)}
          </select>
        </div>
        <div class="gd-form-full ${categoryIsNew ? "" : "d-none"}" data-new-category-wrap="unified">
          <label class="gd-form-label" for="expenseNuevaCategoria">Nombre de la nueva categoria</label>
          <div class="d-flex gap-2 flex-wrap">
            <input class="gd-form-input flex-grow-1" id="expenseNuevaCategoria" name="nuevaCategoria" value="" placeholder="Ej: Mascotas">
            <button type="button" class="gd-btn-primary" data-action="save-new-category" data-form="unified">Guardar categoria</button>
          </div>
        </div>
        <div class="gd-form-full">
          <label class="gd-form-label" for="expenseDescripcion">Descripcion</label>
          <input class="gd-form-input" id="expenseDescripcion" name="descripcion" value="${escapeHtml(expenseForm.descripcion)}" placeholder="Detalle opcional">
        </div>
      </div>
      <button type="submit" class="gd-submit-btn">Guardar gasto</button>
    </form>
  `;

  const ingresoPanel = `
    <form id="incomeForm">
      <div class="gd-form-grid">
        <div>
          <label class="gd-form-label" for="incomeFecha">Fecha</label>
          <div class="gd-date-field">
            <i class="lni lni-calendar gd-date-field-icon" aria-hidden="true"></i>
            <input class="gd-form-input gd-date-field-input" id="incomeFecha" name="fecha" type="date" lang="es-AR" value="${escapeHtml(ingresoForm.fecha || "")}" required>
          </div>
        </div>
        <div>
          <label class="gd-form-label" for="incomeMonto">Monto</label>
          <input class="gd-form-input" id="incomeMonto" name="monto" type="number" min="0" step="0.01" value="${escapeHtml(ingresoForm.monto || "")}" required>
        </div>
        <div class="gd-form-full">
          <label class="gd-form-label" for="incomeCategoria">Categoria</label>
          <select class="gd-form-select" id="incomeCategoria" name="categoria" required>
            <option value="">Selecciona una categoria</option>
            ${renderCategoryOptions(ingresoForm.categoria || "", ingresoCategories)}
          </select>
        </div>
        <div class="gd-form-full ${incomeCategoryIsNew ? "" : "d-none"}" data-new-category-wrap="income">
          <label class="gd-form-label" for="incomeNuevaCategoria">Nombre de la nueva categoria</label>
          <div class="d-flex gap-2 flex-wrap">
            <input class="gd-form-input flex-grow-1" id="incomeNuevaCategoria" value="" placeholder="Ej: Comision, Renta">
            <button type="button" class="gd-btn-primary" data-action="save-new-income-category">Guardar categoria</button>
          </div>
        </div>
        <div class="gd-form-full">
          <label class="gd-form-label" for="incomeDescripcion">Descripcion</label>
          <input class="gd-form-input" id="incomeDescripcion" name="descripcion" value="${escapeHtml(ingresoForm.descripcion || "")}" placeholder="Ej: Sueldo de mayo">
        </div>
      </div>
      <button type="submit" class="gd-submit-btn">Guardar ingreso</button>
    </form>
  `;

  const content = `
    <div class="gd-card">
      <div class="gd-tabs">
        <button type="button" class="gd-tab ${activeTab === "gasto" ? "active" : ""}" data-action="switch-cargar-tab" data-tab="gasto">Gasto</button>
        <button type="button" class="gd-tab ${activeTab === "ingreso" ? "active" : ""}" data-action="switch-cargar-tab" data-tab="ingreso">Ingreso</button>
      </div>
      ${activeTab === "gasto" ? gastoPanel : ingresoPanel}
    </div>
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

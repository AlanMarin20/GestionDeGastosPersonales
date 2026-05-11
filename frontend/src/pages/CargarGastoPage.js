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
}) {
  const categoryIsNew = expenseForm.categoria === NEW_CATEGORY_VALUE;
  const incomeCategoryIsNew = (ingresoForm.categoria || "") === NEW_CATEGORY_VALUE;

  const gastoPanel = `
    <label class="gd-upload-zone" for="ticketUploadInput">
      <input type="file" id="ticketUploadInput" class="d-none" accept="image/png,image/jpeg">
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
      ${ticketFileName ? `<div class="gd-upload-sub" style="margin-top:0.4rem">Archivo: ${escapeHtml(ticketFileName)}</div>` : ""}
    </label>

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

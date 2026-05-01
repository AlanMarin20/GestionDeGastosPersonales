import { renderDashboardAppLayout } from "../components/dashboard/dashboardAppLayout";
import { escapeHtml } from "../utils/sanitize";

const NEW_CATEGORY_VALUE = "__new_category__";

function renderCategoryOptions(selectedValue, categoryOptions = []) {
  return `${categoryOptions
    .map(
      (category) =>
        `<option value="${escapeHtml(category)}" ${selectedValue === category ? "selected" : ""}>${escapeHtml(category)}</option>`,
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
  expenseForm,
  categoryOptions = [],
}) {
  const categoryIsNew = expenseForm.categoria === NEW_CATEGORY_VALUE;

  const content = `
    <div class="gd-card">
      <label class="gd-upload-zone" for="ticketUploadInput">
        <input type="file" id="ticketUploadInput" class="d-none" accept="image/png,image/jpeg,application/pdf">
        <div class="gd-upload-icon"><i class="lni lni-camera"></i></div>
        <div class="gd-upload-title">Subi una foto del ticket (opcional)</div>
        <div class="gd-upload-sub">Si subis una imagen, la IA autocompleta los campos para que luego confirmes.</div>
        <div class="gd-upload-sub">Tambien podes completar todo manualmente sin subir foto.</div>
        <div class="gd-ai-badge"><i class="lni lni-bolt-alt"></i> IA extrae comercio, fecha, monto y categoria</div>
        ${ticketFileName ? `<div class="gd-upload-sub mt-2">Archivo detectado: ${escapeHtml(ticketFileName)}</div>` : ""}
      </label>

      <div class="gd-alert-strip warn">
        <i class="lni lni-warning"></i>
        <span>Si usas IA, revisa los datos detectados antes de guardar.</span>
      </div>

      <form id="expenseForm">
        <div class="gd-form-grid">
          <div>
            <label class="gd-form-label" for="expenseComercio">Comercio</label>
            <input class="gd-form-input" id="expenseComercio" name="comercio" value="${escapeHtml(expenseForm.comercio)}" placeholder="Ej: YPF, Carrefour" required>
          </div>
          <div>
            <label class="gd-form-label" for="expenseFecha">Fecha</label>
            <input class="gd-form-input" id="expenseFecha" name="fecha" type="date" value="${escapeHtml(expenseForm.fecha)}" required>
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

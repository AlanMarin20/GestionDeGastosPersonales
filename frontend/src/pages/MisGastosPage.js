import { renderDashboardAppLayout } from "../components/dashboard/dashboardAppLayout";
import { renderExpenseTable } from "../components/dashboard/dashboardExpenseTable";
import { escapeHtml } from "../utils/sanitize";
import { formatMoney } from "../utils/money";

function renderCategorySelect(id, options, selectedValue) {
  return `
    <select id="${id}" class="gd-form-select">
      ${options
        .map(
          (cat) =>
            `<option value="${escapeHtml(cat)}" ${selectedValue === cat ? "selected" : ""}>${escapeHtml(cat)}</option>`,
        )
        .join("")}
    </select>
  `;
}

function renderEditExpenseModal({ editingExpense, categoryOptions, ingresoCategories }) {
  if (!editingExpense) {
    return "";
  }

  const isIngreso = editingExpense.tipo === "ingreso";

  const ingresoCategoryOpts = [
    ...new Set([editingExpense.categoria, ...ingresoCategories].filter(Boolean)),
  ];

  const formFields = isIngreso
    ? `
      <div>
        <label class="gd-form-label" for="editExpenseFecha">Fecha</label>
        <div class="gd-date-field">
          <i class="lni lni-calendar gd-date-field-icon" aria-hidden="true"></i>
          <input id="editExpenseFecha" type="date" lang="es-AR" class="gd-form-input gd-date-field-input" value="${escapeHtml(editingExpense.fecha)}">
        </div>
      </div>
      <div>
        <label class="gd-form-label" for="editExpenseMonto">Monto</label>
        <input id="editExpenseMonto" type="number" min="0" step="0.01" class="gd-form-input" value="${escapeHtml(String(editingExpense.monto))}">
      </div>
      <div class="gd-form-full">
        <label class="gd-form-label" for="editExpenseCategoria">Categoria</label>
        ${renderCategorySelect("editExpenseCategoria", ingresoCategoryOpts, editingExpense.categoria)}
      </div>
      <div class="gd-form-full">
        <label class="gd-form-label" for="editExpenseDescripcion">Descripcion</label>
        <input id="editExpenseDescripcion" class="gd-form-input" value="${escapeHtml(editingExpense.descripcion || "")}" placeholder="Ej: Sueldo de mayo">
      </div>
    `
    : `
      <div>
        <label class="gd-form-label" for="editExpenseComercio">Comercio</label>
        <input id="editExpenseComercio" class="gd-form-input" value="${escapeHtml(editingExpense.comercio)}">
      </div>
      <div>
        <label class="gd-form-label" for="editExpenseCategoria">Categoria</label>
        ${renderCategorySelect("editExpenseCategoria", categoryOptions, editingExpense.categoria)}
      </div>
      <div>
        <label class="gd-form-label" for="editExpenseFecha">Fecha</label>
        <div class="gd-date-field">
          <i class="lni lni-calendar gd-date-field-icon" aria-hidden="true"></i>
          <input id="editExpenseFecha" type="date" lang="es-AR" class="gd-form-input gd-date-field-input" value="${escapeHtml(editingExpense.fecha)}">
        </div>
      </div>
      <div>
        <label class="gd-form-label" for="editExpenseMonto">Monto</label>
        <input id="editExpenseMonto" type="number" min="0" step="0.01" class="gd-form-input" value="${escapeHtml(String(editingExpense.monto))}">
      </div>
      <div class="gd-form-full">
        <label class="gd-form-label" for="editExpenseDescripcion">Descripcion</label>
        <input id="editExpenseDescripcion" class="gd-form-input" value="${escapeHtml(editingExpense.descripcion || "")}">
      </div>
    `;

  const title = isIngreso ? "Editar ingreso" : "Editar gasto";
  const subtitle = isIngreso
    ? "Actualiza categoria, fecha y monto."
    : "Actualiza comercio, categoria, fecha y monto.";

  return `
    <div class="gd-modal-backdrop" data-action="close-edit-expense-modal"></div>
    <section class="gd-modal" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}">
      <div class="gd-modal-card">
        <h3 class="gd-modal-title">${escapeHtml(title)}</h3>
        <p class="gd-modal-sub">${escapeHtml(subtitle)}</p>

        <div class="gd-form-grid">
          ${formFields}
        </div>

        <div class="gd-modal-actions">
          <button type="button" class="gd-btn-secondary" data-action="close-edit-expense-modal">Cancelar</button>
          <button type="button" class="gd-btn-primary" data-action="save-edit-expense" data-expense-id="${escapeHtml(editingExpense.id)}">Guardar cambios</button>
        </div>
      </div>
    </section>
  `;
}

function renderDeleteExpenseModal({ deletingExpense }) {
  if (!deletingExpense) {
    return "";
  }

  return `
    <div class="gd-modal-backdrop" data-action="close-delete-expense-modal"></div>
    <section class="gd-modal" role="dialog" aria-modal="true" aria-label="Eliminar gasto">
      <div class="gd-modal-card">
        <h3 class="gd-modal-title">Eliminar gasto</h3>
        <p class="gd-modal-sub">Esta accion eliminara el gasto de ${escapeHtml(deletingExpense.comercio)} por ${escapeHtml(formatMoney(deletingExpense.monto))}.</p>
        <div class="gd-modal-actions">
          <button type="button" class="gd-btn-secondary" data-action="close-delete-expense-modal">Cancelar</button>
          <button type="button" class="gd-btn-danger" data-action="confirm-delete-expense" data-expense-id="${escapeHtml(deletingExpense.id)}">Eliminar</button>
        </div>
      </div>
    </section>
  `;
}

export function renderMisGastosPage({
  profileImage,
  profileName,
  activePath,
  pageTitle,
  pageSubtitle,
  filters,
  categoryOptions,
  ingresoCategories = [],
  gastos,
  editingExpense,
  deletingExpense,
  tags = [],
  filtroEtiqueta = null,
}) {
  const content = `
    <div class="gd-filters">
      <input
        id="expenseSearchInput"
        class="gd-form-input"
        type="search"
        placeholder="Buscar por comercio o descripción"
        value="${escapeHtml(filters.search)}"
      >

      <select id="expenseTypeFilter" class="gd-form-select">
        <option value="Todos" ${filters.tipo === "Todos" ? "selected" : ""}>Todos los tipos</option>
        <option value="Ingreso" ${filters.tipo === "Ingreso" ? "selected" : ""}>Ingresos</option>
        <option value="Egreso" ${filters.tipo === "Egreso" ? "selected" : ""}>Gastos</option>
      </select>

      <select id="expenseCategoryFilter" class="gd-form-select">
        <option value="Todas" ${filters.categoria === "Todas" ? "selected" : ""}>Todas las categorias</option>
        ${categoryOptions
          .map(
            (category) =>
              `<option value="${escapeHtml(category)}" ${filters.categoria === category ? "selected" : ""}>${escapeHtml(category)}</option>`,
          )
          .join("")}
      </select>

      <select id="expenseTagFilter" class="gd-form-select">
        <option value="">Todas las etiquetas</option>
        ${tags.map((t) => `<option value="${escapeHtml(t.id)}" ${filtroEtiqueta === t.id ? "selected" : ""}>${escapeHtml(t.nombre)}</option>`).join("")}
      </select>

      <div class="gd-date-range">
        <label class="gd-form-label gd-date-range-label" for="expenseFechaDesde">Desde</label>
        <div class="gd-date-field">
          <i class="lni lni-calendar gd-date-field-icon" aria-hidden="true"></i>
          <input
            id="expenseFechaDesde"
            type="date"
            lang="es-AR"
            class="gd-form-input gd-date-input gd-date-field-input"
            value="${escapeHtml(filters.fechaDesde || "")}"
          >
        </div>
        <label class="gd-form-label gd-date-range-label" for="expenseFechaHasta">Hasta</label>
        <div class="gd-date-field">
          <i class="lni lni-calendar gd-date-field-icon" aria-hidden="true"></i>
          <input
            id="expenseFechaHasta"
            type="date"
            lang="es-AR"
            class="gd-form-input gd-date-input gd-date-field-input"
            value="${escapeHtml(filters.fechaHasta || "")}"
          >
        </div>
        ${(filters.fechaDesde || filters.fechaHasta) ? `
          <button type="button" class="gd-btn-clear-dates" data-action="clear-date-filter" aria-label="Limpiar rango de fechas">
            <i class="lni lni-close" aria-hidden="true"></i>
          </button>
        ` : ""}
      </div>

      <button type="button" class="gd-csv-btn" data-action="export-expenses-csv">
        <i class="lni lni-download"></i>
        Exportar CSV
      </button>
    </div>

    <div class="gd-card">
      <div class="gd-card-header">
        <h2 class="gd-card-title">Listado completo de movimientos</h2>
        <span class="gd-muted gd-muted-sm">${gastos.length} registros</span>
      </div>

      ${renderExpenseTable({
        expenses: gastos,
        showDescription: true,
        showActions: true,
        showTipo: true,
        emptyMessage: "No hay movimientos que coincidan con los filtros aplicados.",
      })}
    </div>

    ${renderEditExpenseModal({ editingExpense, categoryOptions, ingresoCategories })}

    ${renderDeleteExpenseModal({ deletingExpense })}
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

import { renderDashboardAppLayout } from "../components/dashboard/dashboardAppLayout";

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeCategoryClass(category) {
  const map = {
    supermercado: "supermercado",
    transporte: "transporte",
    entretenimiento: "entretenimiento",
    salud: "salud",
    restaurantes: "restaurantes",
    servicios: "servicios",
    otros: "otros",
  };

  return map[String(category || "").toLowerCase()] || "otros";
}

export function renderMisGastosPage({
  profileImage,
  profileName,
  activePath,
  pageTitle,
  pageSubtitle,
  filters,
  categoryOptions,
  periodOptions,
  gastos,
  editingExpense,
  deletingExpense,
  formatMoney,
}) {
  const content = `
    <div class="gd-filters">
      <input
        id="expenseSearchInput"
        class="gd-form-input"
        type="search"
        placeholder="Buscar por comercio"
        value="${escapeHtml(filters.search)}"
      >

      <select id="expenseCategoryFilter" class="gd-form-select">
        <option value="Todas" ${filters.categoria === "Todas" ? "selected" : ""}>Todas las categorias</option>
        ${categoryOptions
          .map(
            (category) =>
              `<option value="${escapeHtml(category)}" ${filters.categoria === category ? "selected" : ""}>${escapeHtml(category)}</option>`,
          )
          .join("")}
      </select>

      <select id="expensePeriodFilter" class="gd-form-select">
        <option value="todos" ${filters.periodo === "todos" ? "selected" : ""}>Todos los meses</option>
        ${periodOptions
          .map(
            (option) =>
              `<option value="${escapeHtml(option.value)}" ${filters.periodo === option.value ? "selected" : ""}>${escapeHtml(option.label)}</option>`,
          )
          .join("")}
      </select>

      <button type="button" class="gd-csv-btn" data-action="export-expenses-csv">
        <i class="lni lni-download"></i>
        Exportar CSV
      </button>
    </div>

    <div class="gd-card">
      <div class="gd-card-header">
        <h2 class="gd-card-title">Listado completo de gastos</h2>
        <span class="gd-muted" style="font-size: 0.72rem;">${gastos.length} registros</span>
      </div>

      <div class="gd-table-wrap">
        <table class="gd-table">
          <thead>
            <tr>
              <th>Comercio</th>
              <th>Categoria</th>
              <th>Descripcion</th>
              <th>Fecha</th>
              <th class="gd-right">Monto</th>
              <th class="gd-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${
              gastos.length === 0
                ? `
                  <tr>
                    <td colspan="6">
                      <div class="gd-empty">No hay gastos que coincidan con los filtros aplicados.</div>
                    </td>
                  </tr>
                `
                : gastos
                    .map(
                      (gasto) => `
                        <tr>
                          <td>${escapeHtml(gasto.comercio)}</td>
                          <td>
                            <span class="gd-pill gd-pill-${normalizeCategoryClass(gasto.categoria)}">${escapeHtml(gasto.categoria)}</span>
                          </td>
                          <td class="gd-muted">${escapeHtml(gasto.descripcion || "-")}</td>
                          <td class="gd-muted">${escapeHtml(gasto.fechaCorta)}</td>
                          <td class="gd-right">${escapeHtml(formatMoney(gasto.monto))}</td>
                          <td class="gd-right">
                            <span class="gd-action-cell">
                              <button type="button" class="gd-action-btn" data-action="open-edit-expense" data-expense-id="${escapeHtml(gasto.id)}" aria-label="Editar gasto">
                                Editar
                              </button>
                              <button type="button" class="gd-action-btn danger" data-action="open-delete-expense" data-expense-id="${escapeHtml(gasto.id)}" aria-label="Eliminar gasto">
                                Eliminar
                              </button>
                            </span>
                          </td>
                        </tr>
                      `,
                    )
                    .join("")
            }
          </tbody>
        </table>
      </div>
    </div>

    ${
      editingExpense
        ? `
          <div class="gd-modal-backdrop" data-action="close-edit-expense-modal"></div>
          <section class="gd-modal" role="dialog" aria-modal="true" aria-label="Editar gasto">
            <div class="gd-modal-card">
              <h3 class="gd-modal-title">Editar gasto</h3>
              <p class="gd-modal-sub">Actualiza comercio, categoria, fecha y monto.</p>

              <div class="gd-form-grid">
                <div>
                  <label class="gd-form-label" for="editExpenseComercio">Comercio</label>
                  <input id="editExpenseComercio" class="gd-form-input" value="${escapeHtml(editingExpense.comercio)}">
                </div>
                <div>
                  <label class="gd-form-label" for="editExpenseCategoria">Categoria</label>
                  <select id="editExpenseCategoria" class="gd-form-select">
                    ${categoryOptions
                      .map(
                        (category) =>
                          `<option value="${escapeHtml(category)}" ${editingExpense.categoria === category ? "selected" : ""}>${escapeHtml(category)}</option>`,
                      )
                      .join("")}
                  </select>
                </div>
                <div>
                  <label class="gd-form-label" for="editExpenseFecha">Fecha</label>
                  <input id="editExpenseFecha" type="date" class="gd-form-input" value="${escapeHtml(editingExpense.fecha)}">
                </div>
                <div>
                  <label class="gd-form-label" for="editExpenseMonto">Monto</label>
                  <input id="editExpenseMonto" type="number" min="0" step="0.01" class="gd-form-input" value="${escapeHtml(String(editingExpense.monto))}">
                </div>
                <div class="gd-form-full">
                  <label class="gd-form-label" for="editExpenseDescripcion">Descripcion</label>
                  <input id="editExpenseDescripcion" class="gd-form-input" value="${escapeHtml(editingExpense.descripcion || "")}">
                </div>
              </div>

              <div class="gd-modal-actions">
                <button type="button" class="gd-btn-secondary" data-action="close-edit-expense-modal">Cancelar</button>
                <button type="button" class="gd-btn-primary" data-action="save-edit-expense" data-expense-id="${escapeHtml(editingExpense.id)}">Guardar cambios</button>
              </div>
            </div>
          </section>
        `
        : ""
    }

    ${
      deletingExpense
        ? `
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
        `
        : ""
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

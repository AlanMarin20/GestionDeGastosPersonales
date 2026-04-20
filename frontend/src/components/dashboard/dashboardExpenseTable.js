import { normalizeCategoryClass } from "../../utils/category";
import { escapeHtml } from "../../utils/sanitize";

export function renderExpenseTable({
  expenses = [],
  formatMoney,
  showDescription = false,
  showActions = false,
  emptyMessage = "",
} = {}) {
  const rows = Array.isArray(expenses) ? expenses : [];
  const headers = [
    { label: "Comercio" },
    { label: "Categoria" },
    ...(showDescription ? [{ label: "Descripcion" }] : []),
    { label: "Fecha" },
    { label: "Monto", className: "gd-right" },
    ...(showActions ? [{ label: "Acciones", className: "gd-right" }] : []),
  ];

  const formatAmount = (amount) => {
    if (typeof formatMoney === "function") {
      return formatMoney(amount);
    }
    return String(amount ?? "");
  };

  const rowMarkup = rows.length === 0
    ? (emptyMessage
      ? `
        <tr>
          <td colspan="${headers.length}">
            <div class="gd-empty">${escapeHtml(emptyMessage)}</div>
          </td>
        </tr>
      `
      : "")
    : rows
      .map((expense) => {
        const descriptionCell = showDescription
          ? `<td class="gd-muted">${escapeHtml(expense.descripcion || "-")}</td>`
          : "";
        const actionsCell = showActions
          ? `
            <td class="gd-right">
              <span class="gd-action-cell">
                <button type="button" class="gd-action-btn" data-action="open-edit-expense" data-expense-id="${escapeHtml(expense.id)}" aria-label="Editar gasto">
                  Editar
                </button>
                <button type="button" class="gd-action-btn danger" data-action="open-delete-expense" data-expense-id="${escapeHtml(expense.id)}" aria-label="Eliminar gasto">
                  Eliminar
                </button>
              </span>
            </td>
          `
          : "";

        return `
          <tr>
            <td>${escapeHtml(expense.comercio)}</td>
            <td>
              <span class="gd-pill gd-pill-${normalizeCategoryClass(expense.categoria)}">${escapeHtml(expense.categoria)}</span>
            </td>
            ${descriptionCell}
            <td class="gd-muted">${escapeHtml(expense.fechaCorta)}</td>
            <td class="gd-right">${escapeHtml(formatAmount(expense.monto))}</td>
            ${actionsCell}
          </tr>
        `;
      })
      .join("");

  return `
    <div class="gd-table-wrap">
      <table class="gd-table">
        <thead>
          <tr>
            ${headers
              .map((header) => `<th${header.className ? ` class="${escapeHtml(header.className)}"` : ""}>${escapeHtml(header.label)}</th>`)
              .join("")}
          </tr>
        </thead>
        <tbody>
          ${rowMarkup}
        </tbody>
      </table>
    </div>
  `;
}
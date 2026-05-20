import { normalizeCategoryClass } from "../../utils/category";
import { escapeHtml } from "../../utils/sanitize";
import { formatMoney } from "../../utils/money";

export function renderExpenseTable({
  expenses = [],
  showDescription = false,
  showActions = false,
  showTipo = false,
  emptyMessage = "",
} = {}) {
  const rows = Array.isArray(expenses) ? expenses : [];
  const headers = [
    ...(showTipo ? [{ label: "Tipo" }] : []),
    { label: "Comercio" },
    { label: "Categoria" },
    ...(showDescription ? [{ label: "Descripcion" }] : []),
    { label: "Fecha" },
    { label: "Monto", className: "gd-right" },
    ...(showActions ? [{ label: "Acciones", className: "gd-right" }] : []),
  ];

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
        const esIngreso = expense.tipo === "ingreso";
        const esAhorro = expense.esTransferenciaInterna === true;

        const tipoCell = showTipo
          ? `<td><span class="gd-pill ${esAhorro ? "gd-pill-tipo-ahorro" : (esIngreso ? "gd-pill-tipo-ingreso" : "gd-pill-tipo-egreso")}">${esAhorro ? "AHORRO" : (esIngreso ? "INGRESO" : "GASTO")}</span></td>`
          : "";

        const tagsHtml = Array.isArray(expense.etiquetas) && expense.etiquetas.length > 0
          ? `<div class="gd-expense-tags">${expense.etiquetas.map((t) => `<span class="gd-tag-chip gd-tag-chip--sm">${escapeHtml(t.nombre)}</span>`).join("")}</div>`
          : "";

        const descriptionCell = showDescription
          ? `<td class="gd-muted">${escapeHtml(expense.descripcion || "-")}${tagsHtml}</td>`
          : "";

        const actionsCell = showActions
          ? `
            <td class="gd-right">
              <span class="gd-action-cell">
                <button type="button" class="gd-action-btn" data-action="open-edit-expense" data-expense-id="${escapeHtml(expense.id)}" aria-label="Editar gasto">
                  <i class="lni lni-pencil-alt" aria-hidden="true"></i> Editar
                </button>
                <button type="button" class="gd-action-btn danger" data-action="open-delete-expense" data-expense-id="${escapeHtml(expense.id)}" aria-label="Eliminar gasto">
                  <i class="lni lni-trash-can" aria-hidden="true"></i> Eliminar
                </button>
              </span>
            </td>
          `
          : "";

        const montoPrefix = showTipo ? (esIngreso ? "+" : "-") : "";
        const montoClass = showTipo
          ? (esIngreso ? "gd-monto-ingreso" : "gd-monto-egreso")
          : "";

        return `
          <tr>
            ${tipoCell}
            <td>${escapeHtml(expense.comercio)}</td>
            <td>
              <span class="gd-pill gd-pill-${normalizeCategoryClass(expense.categoria)}">${escapeHtml(expense.categoria)}</span>
            </td>
            ${descriptionCell}
            <td class="gd-muted">${escapeHtml(expense.fechaCorta)}</td>
            <td class="gd-right ${escapeHtml(montoClass)}">${montoPrefix}${escapeHtml(formatMoney(expense.monto))}</td>
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


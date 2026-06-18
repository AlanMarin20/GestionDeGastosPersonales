import { normalizeCategoryClass } from "../../utils/category";
import { escapeHtml } from "../../utils/sanitize";
import { formatMoney } from "../../utils/money";
import { t } from "../../i18n";

export function renderExpenseTable({
  expenses = [],
  showDescription = false,
  showActions = false,
  showTipo = false,
  emptyMessage = "",
} = {}) {
  const rows = Array.isArray(expenses) ? expenses : [];
  const headers = [
    ...(showTipo ? [{ label: t('expensesTable.type'), className: "gd-cell-tipo" }] : []),
    { label: t('expensesTable.merchant'), className: "gd-cell-comercio" },
    { label: t('expensesTable.category'), className: "gd-cell-categoria" },
    ...(showDescription ? [{ label: t('expensesTable.description'), className: "gd-cell-descripcion" }] : []),
    { label: t('expensesTable.date'), className: "gd-cell-fecha" },
    { label: t('expensesTable.amount'), className: "gd-cell-monto gd-right" },
    ...(showActions ? [{ label: t('expensesTable.actions'), className: "gd-cell-acciones gd-right" }] : []),
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
          ? `<td class="gd-cell-tipo"><span class="gd-pill ${esAhorro ? "gd-pill-tipo-ahorro" : (esIngreso ? "gd-pill-tipo-ingreso" : "gd-pill-tipo-egreso")}">${esAhorro ? t('common.savingUpper') : (esIngreso ? t('common.incomeUpper') : t('common.expenseUpper'))}</span></td>`
          : "";

        const tagsHtml = Array.isArray(expense.etiquetas) && expense.etiquetas.length > 0
          ? `<div class="gd-expense-tags">${expense.etiquetas.map((tag) => `<span class="gd-tag-chip gd-tag-chip--sm">${escapeHtml(tag.nombre)}</span>`).join("")}</div>`
          : "";

        const descriptionCell = showDescription
          ? `<td class="gd-cell-descripcion gd-muted">${escapeHtml(expense.descripcion || "-")}${tagsHtml}</td>`
          : "";

        // Contextual ARIA labels for high screen reader accessibility
        const formattedAmount = formatMoney(expense.monto);
        const typeLabel = esAhorro ? t('common.savingUpper') : (esIngreso ? t('common.incomeUpper') : t('common.expenseUpper'));
        const actionContext = `${typeLabel} - ${expense.comercio} (${formattedAmount})`;
        const editAriaLabel = `${t('expensesTable.editExpense')} - ${actionContext}`;
        const deleteAriaLabel = `${t('expensesTable.deleteExpense')} - ${actionContext}`;

        const actionsCell = showActions
          ? `
            <td class="gd-cell-acciones gd-right">
              <span class="gd-action-cell">
                <button type="button" class="gd-action-btn" data-action="open-edit-expense" data-expense-id="${escapeHtml(expense.id)}" aria-label="${escapeHtml(editAriaLabel)}">
                  <i class="lni lni-pencil-alt" aria-hidden="true"></i> ${t('common.edit')}
                </button>
                <button type="button" class="gd-action-btn danger" data-action="open-delete-expense" data-expense-id="${escapeHtml(expense.id)}" aria-label="${escapeHtml(deleteAriaLabel)}">
                  <i class="lni lni-trash-can" aria-hidden="true"></i> ${t('common.delete')}
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
            <td class="gd-cell-comercio">${escapeHtml(expense.comercio)}</td>
            <td class="gd-cell-categoria">
              <span class="gd-pill gd-pill-${normalizeCategoryClass(expense.categoria)}">${escapeHtml(expense.categoria)}</span>
            </td>
            ${descriptionCell}
            <td class="gd-cell-fecha gd-muted">${escapeHtml(expense.fechaCorta)}</td>
            <td class="gd-cell-monto gd-right ${escapeHtml(montoClass)}">${montoPrefix}${escapeHtml(formatMoney(expense.monto))}</td>
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
              .map((header) => `<th scope="col"${header.className ? ` class="${escapeHtml(header.className)}"` : ""}>${escapeHtml(header.label)}</th>`)
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


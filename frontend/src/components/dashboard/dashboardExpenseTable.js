import { normalizeCategoryClass } from "../../utils/category";
import { escapeHtml } from "../../utils/sanitize";
import { formatMoney } from "../../utils/money";
import { t } from "../../i18n";

export function renderExpenseTable({
  expenses = [],
  showDescription = false,
  showActions = false,
  showTipo = false,
  columnLayout = 'default',
  emptyMessage = "",
} = {}) {
  const rows = Array.isArray(expenses) ? expenses : [];
  const isClientDetailLayout = columnLayout === 'client-detail';
  const headers = isClientDetailLayout
    ? [
      { label: t('expensesTable.date') },
      { label: t('expensesTable.type') },
      { label: t('expensesTable.description') },
      { label: t('expensesTable.merchant') },
      { label: t('expensesTable.amount'), className: 'gd-right' },
      ...(showActions ? [{ label: t('expensesTable.actions'), className: 'gd-right' }] : []),
    ]
    : [
      ...(showTipo ? [{ label: t('expensesTable.type') }] : []),
      { label: t('expensesTable.merchant') },
      { label: t('expensesTable.category') },
      ...(showDescription ? [{ label: t('expensesTable.description') }] : []),
      { label: t('expensesTable.date') },
      { label: t('expensesTable.amount'), className: "gd-right" },
      ...(showActions ? [{ label: t('expensesTable.actions'), className: "gd-right" }] : []),
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
          ? `<td><span class="gd-pill ${esAhorro ? "gd-pill-tipo-ahorro" : (esIngreso ? "gd-pill-tipo-ingreso" : "gd-pill-tipo-egreso")}">${esAhorro ? t('common.savingUpper') : (esIngreso ? t('common.incomeUpper') : t('common.expenseUpper'))}</span></td>`
          : "";

        const tagsHtml = Array.isArray(expense.etiquetas) && expense.etiquetas.length > 0
          ? `<div class="gd-expense-tags">${expense.etiquetas.map((tag) => `<span class="gd-tag-chip gd-tag-chip--sm">${escapeHtml(tag.nombre)}</span>`).join("")}</div>`
          : "";

        const descriptionCell = showDescription
          ? `<td class="gd-muted">${escapeHtml(expense.descripcion || "-")}${tagsHtml}</td>`
          : "";

        const actionsCell = showActions
          ? `
            <td class="gd-right">
              <span class="gd-action-cell">
                <button type="button" class="gd-action-btn" data-action="open-edit-expense" data-expense-id="${escapeHtml(expense.id)}" aria-label="${t('expensesTable.editExpense')}">
                  <i class="lni lni-pencil-alt" aria-hidden="true"></i> ${t('common.edit')}
                </button>
                <button type="button" class="gd-action-btn danger" data-action="open-delete-expense" data-expense-id="${escapeHtml(expense.id)}" aria-label="${t('expensesTable.deleteExpense')}">
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

        if (isClientDetailLayout) {
          return `
            <tr>
              <td class="gd-muted">${escapeHtml(expense.fechaCorta || expense.fecha || "-")}</td>
              <td><span class="gd-pill ${esAhorro ? "gd-pill-tipo-ahorro" : (esIngreso ? "gd-pill-tipo-ingreso" : "gd-pill-tipo-egreso")}">${esAhorro ? t('common.savingUpper') : (esIngreso ? t('common.incomeUpper') : t('common.expenseUpper'))}</span></td>
              <td class="gd-muted">${escapeHtml(expense.descripcion || "-")}${tagsHtml}</td>
              <td>${escapeHtml(expense.comercio || "-")}</td>
              <td class="gd-right ${escapeHtml(montoClass)}">${montoPrefix}${escapeHtml(formatMoney(expense.monto))}</td>
              ${actionsCell}
            </tr>
          `;
        }

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


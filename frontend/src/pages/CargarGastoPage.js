import { renderDashboardAppLayout } from "../components/dashboard/dashboardAppLayout";
import { escapeHtml } from "../utils/sanitize";
import { t } from '../i18n';

const NEW_CATEGORY_VALUE = "__new_category__";

function renderCategoryOptions(selectedValue, categoryOptions = []) {
  return `${categoryOptions
    .map(
      (cat) =>
        `<option value="${escapeHtml(cat)}" ${selectedValue === cat ? "selected" : ""}>${escapeHtml(cat)}</option>`,
    )
    .join("")}
    <option value="${NEW_CATEGORY_VALUE}" ${selectedValue === NEW_CATEGORY_VALUE ? "selected" : ""}>${t('cargar.newCategory')}</option>`;
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
        statusBadge = `<span class="gd-batch-badge gd-batch-badge--loading"><span class="gd-spinner gd-spinner--sm"></span> ${t('cargar.analyzing')}</span>`;
        cardBody = `<p class="gd-muted gd-muted-sm" style="margin:0.4rem 0 0">${t('cargar.processingFile')}</p>`;
      } else if (ticket.status === "ok") {
        statusBadge = `<span class="gd-batch-badge gd-batch-badge--ok">${t('cargar.ready')}</span>`;
        const d = ticket.data || {};
        cardBody = `
          <div class="gd-form-grid gd-form-grid--compact" style="margin-top:0.7rem">
            <div>
              <label class="gd-form-label" for="batchComercio${index}">${t('cargar.merchantSource')}</label>
              <input class="gd-form-input" id="batchComercio${index}" name="comercio" value="${escapeHtml(d.comercio || "")}" placeholder="${t('cargar.placeholderMerchant')}">
            </div>
            <div>
              <label class="gd-form-label" for="batchFecha${index}">${t('cargar.fieldDate')}</label>
              <div class="gd-date-field">
                <i class="lni lni-calendar gd-date-field-icon" aria-hidden="true"></i>
                <input class="gd-form-input gd-date-field-input" id="batchFecha${index}" name="fecha" type="date" lang="es-AR" value="${escapeHtml(d.fecha || "")}">
              </div>
            </div>
            <div>
              <label class="gd-form-label" for="batchMonto${index}">${t('cargar.fieldAmount')}</label>
              <input class="gd-form-input" id="batchMonto${index}" name="monto" type="number" min="0" step="0.01" value="${escapeHtml(String(d.monto || ""))}">
            </div>
            <div>
              <label class="gd-form-label" for="batchCategoria${index}">${t('cargar.fieldCategory')}</label>
              <select class="gd-form-select" id="batchCategoria${index}" name="categoria">
                <option value="">${t('cargar.selectCategory')}</option>
                ${renderCategoryOptions(d.categoria || "", categoryOptions)}
              </select>
            </div>
            <div class="gd-form-full">
              <label class="gd-form-label" for="batchDescripcion${index}">${t('cargar.fieldDescription')}</label>
              <input class="gd-form-input" id="batchDescripcion${index}" name="descripcion" value="${escapeHtml(d.descripcion || "")}" placeholder="${t('cargar.placeholderOptionalDetail')}">
            </div>
          </div>
          <div style="margin-top:0.8rem">
            <button type="button" class="gd-submit-btn" style="width:auto;padding:0.45rem 1.2rem" data-action="save-batch-ticket" data-batch-index="${index}">${t('cargar.saveExpense')}</button>
          </div>
        `;
      } else if (ticket.status === "error") {
        statusBadge = `<span class="gd-batch-badge gd-batch-badge--error">${t('cargar.error')}</span>`;
        cardBody = `
          <p class="gd-muted gd-muted-sm" style="margin:0.4rem 0 0.6rem;color:var(--gd-danger,#dc3545)">${escapeHtml(ticket.error || t('cargar.ticketParseError'))}</p>
          <button type="button" class="gd-btn-secondary" data-action="fill-batch-ticket-manually" data-batch-index="${index}">${t('cargar.fillManually')}</button>
        `;
      } else {
        statusBadge = `<span class="gd-batch-badge">${t('cargar.pending')}</span>`;
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
      <h3 class="gd-section-title" style="margin-bottom:0.8rem">${t('cargar.ticketQueue', { count: batchTickets.length })}</h3>
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
  tags = [],
  selectedTagIds = [],
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
        ${ocrLoading ? t('cargar.analyzingTicketAI') : t('cargar.uploadHint')}
      </div>
      ${!ocrLoading ? `
      <div class="gd-upload-sub">${t('cargar.uploadSub')}</div>
      <div class="gd-ai-badge"><i class="lni lni-bolt-alt"></i> ${t('cargar.scanWithAI')}</div>
      ` : ""}
      ${ticketFileName && !batchMode ? `<div class="gd-upload-sub" style="margin-top:0.4rem">${t('cargar.file', { name: escapeHtml(ticketFileName) })}</div>` : ""}
    </label>
  `;

  const gastoPanel = batchMode && batchTickets.length > 0
    ? `
      ${uploadZone}
      ${renderBatchQueue(batchTickets, categoryOptions)}
    `
    : `
      ${uploadZone}

    <p class="gd-muted gd-muted-sm" style="margin:0.5rem 0 0.8rem">${t('cargar.aiAutocomplete')}</p>

    <form id="expenseForm">
      <div class="gd-form-grid">
        <div>
          <label class="gd-form-label" for="expenseComercio">${t('cargar.merchantSource')}</label>
          <input class="gd-form-input" id="expenseComercio" name="comercio" value="${escapeHtml(expenseForm.comercio)}" placeholder="${t('cargar.placeholderMerchant')}" required>
        </div>
        <div>
          <label class="gd-form-label" for="expenseFecha">${t('cargar.fieldDate')}</label>
          <div class="gd-date-field">
            <i class="lni lni-calendar gd-date-field-icon" aria-hidden="true"></i>
            <input class="gd-form-input gd-date-field-input" id="expenseFecha" name="fecha" type="date" lang="es-AR" value="${escapeHtml(expenseForm.fecha)}" required>
          </div>
        </div>
        <div>
          <label class="gd-form-label" for="expenseMonto">${t('cargar.fieldAmount')}</label>
          <input class="gd-form-input" id="expenseMonto" name="monto" type="number" min="0" step="0.01" value="${escapeHtml(expenseForm.monto)}" required>
        </div>
        <div>
          <label class="gd-form-label" for="expenseCategoria">${t('cargar.fieldCategory')}</label>
          <select class="gd-form-select" id="expenseCategoria" name="categoria" required>
            <option value="">${t('cargar.selectCategory')}</option>
            ${renderCategoryOptions(expenseForm.categoria, categoryOptions)}
          </select>
        </div>
        <div class="gd-form-full ${categoryIsNew ? "" : "d-none"}" data-new-category-wrap="unified">
          <label class="gd-form-label" for="expenseNuevaCategoria">${t('cargar.newCategoryName')}</label>
          <div class="d-flex gap-2 flex-wrap">
            <input class="gd-form-input flex-grow-1" id="expenseNuevaCategoria" name="nuevaCategoria" value="" placeholder="${t('cargar.placeholderPets')}">
            <button type="button" class="gd-btn-primary" data-action="save-new-category" data-form="unified">${t('cargar.saveCategory')}</button>
          </div>
        </div>
        <div class="gd-form-full">
          <label class="gd-form-label" for="expenseDescripcion">${t('cargar.fieldDescription')}</label>
          <input class="gd-form-input" id="expenseDescripcion" name="descripcion" value="${escapeHtml(expenseForm.descripcion)}" placeholder="${t('cargar.placeholderOptionalDetail')}">
        </div>
        <div class="gd-form-full">
          <label class="gd-form-label">${t('cargar.tags')}</label>
          <div class="gd-tag-picker" id="tagPickerContainer">
            ${tags.map((tag) => {
              const isSelected = selectedTagIds.includes(tag.id);
              return `<button type="button" class="gd-tag-chip${isSelected ? " gd-tag-chip--selected" : ""}" data-action="toggle-expense-tag" data-tag-id="${escapeHtml(tag.id)}">${escapeHtml(tag.nombre)}</button>`;
            }).join("")}
            <button type="button" class="gd-tag-chip gd-tag-chip--new" data-action="show-new-tag-input">${t('cargar.newTag')}</button>
          </div>
          <div class="d-none" id="newTagInputWrap">
            <div class="d-flex gap-2 align-items-center mt-2">
              <input class="gd-form-input flex-grow-1" id="newTagNameInput" maxlength="50" placeholder="${t('cargar.placeholderVacations')}">
              <button type="button" class="gd-btn-primary" data-action="create-and-select-tag">${t('cargar.add')}</button>
              <button type="button" class="gd-btn-secondary" data-action="hide-new-tag-input">${t('common.cancel')}</button>
            </div>
          </div>
        </div>
      </div>
      <button type="submit" class="gd-submit-btn">${t('cargar.saveExpense')}</button>
    </form>
  `;

  const ingresoPanel = `
    <form id="incomeForm">
      <div class="gd-form-grid">
        <div>
          <label class="gd-form-label" for="incomeFecha">${t('cargar.fieldDate')}</label>
          <div class="gd-date-field">
            <i class="lni lni-calendar gd-date-field-icon" aria-hidden="true"></i>
            <input class="gd-form-input gd-date-field-input" id="incomeFecha" name="fecha" type="date" lang="es-AR" value="${escapeHtml(ingresoForm.fecha || "")}" required>
          </div>
        </div>
        <div>
          <label class="gd-form-label" for="incomeMonto">${t('cargar.fieldAmount')}</label>
          <input class="gd-form-input" id="incomeMonto" name="monto" type="number" min="0" step="0.01" value="${escapeHtml(ingresoForm.monto || "")}" required>
        </div>
        <div class="gd-form-full">
          <label class="gd-form-label" for="incomeCategoria">${t('cargar.fieldCategory')}</label>
          <select class="gd-form-select" id="incomeCategoria" name="categoria" required>
            <option value="">${t('cargar.selectCategory')}</option>
            ${renderCategoryOptions(ingresoForm.categoria || "", ingresoCategories)}
          </select>
        </div>
        <div class="gd-form-full ${incomeCategoryIsNew ? "" : "d-none"}" data-new-category-wrap="income">
          <label class="gd-form-label" for="incomeNuevaCategoria">${t('cargar.newCategoryName')}</label>
          <div class="d-flex gap-2 flex-wrap">
            <input class="gd-form-input flex-grow-1" id="incomeNuevaCategoria" value="" placeholder="${t('cargar.placeholderCommission')}">
            <button type="button" class="gd-btn-primary" data-action="save-new-income-category">${t('cargar.saveCategory')}</button>
          </div>
        </div>
        <div class="gd-form-full">
          <label class="gd-form-label" for="incomeDescripcion">${t('cargar.fieldDescription')}</label>
          <input class="gd-form-input" id="incomeDescripcion" name="descripcion" value="${escapeHtml(ingresoForm.descripcion || "")}" placeholder="${t('cargar.placeholderSalary')}">
        </div>
      </div>
      <button type="submit" class="gd-submit-btn">${t('cargar.saveIncome')}</button>
    </form>
  `;

  const content = `
    <div class="gd-card">
      <div class="gd-tabs">
        <button type="button" class="gd-tab ${activeTab === "gasto" ? "active" : ""}" data-action="switch-cargar-tab" data-tab="gasto">${t('cargar.tabExpense')}</button>
        <button type="button" class="gd-tab ${activeTab === "ingreso" ? "active" : ""}" data-action="switch-cargar-tab" data-tab="ingreso">${t('cargar.tabIncome')}</button>
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

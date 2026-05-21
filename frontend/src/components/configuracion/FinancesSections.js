import { escapeHtml } from "../../utils/sanitize";
import { formatMoney } from "../../utils/money";
import { getBudgetAlertsForPeriod, getFinanzasCurrentPeriod } from "../../data/finanzas";
import { parseMonthKey, formatMonthLabelLong, compareMonthKeys } from "../../utils/date";
import { t } from "../../i18n";

function renderProxBadge() {
  return `<span class="gd-settings-prox-badge">${t('config.comingSoon')}</span>`;
}

function renderBudgetMonthPicker(viewPeriod, currentPeriod) {
  const isAtMax = compareMonthKeys(viewPeriod, currentPeriod) >= 0;
  return `
    <div class="gd-settings-budget-monthpicker">
      <button type="button" class="gd-ahorro-ctrl-btn" data-action="budget-prev-month" aria-label="${t('config.prevMonth')}">
        <i class="lni lni-chevron-left" aria-hidden="true"></i>
      </button>
      <span class="gd-settings-budget-monthpicker-label">${escapeHtml(formatMonthLabelLong(viewPeriod))}</span>
      <button type="button" class="gd-ahorro-ctrl-btn" data-action="budget-next-month"
        ${isAtMax ? "disabled" : ""} aria-label="${t('config.nextMonth')}">
        <i class="lni lni-chevron-right" aria-hidden="true"></i>
      </button>
    </div>
  `;
}

function renderBudgetSummary(budgets, spentByCategory) {
  if (budgets.length === 0) return "";
  const totalLimit = budgets.reduce((s, b) => s + Number(b.amountLimit || 0), 0);
  const totalSpent = budgets.reduce((s, b) => s + Number(spentByCategory[b.categoryName] || 0), 0);
  const pct = totalLimit > 0 ? Math.min(Math.round((totalSpent / totalLimit) * 100), 100) : 0;
  const rawPct = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;
  const exceeded = rawPct > 100;
  const nearLimit = rawPct >= 80;
  const n = budgets.length;

  return `
    <div class="gd-settings-budget-summary mb-3">
      <span class="gd-settings-budget-summary-stat"><strong>${n}</strong> ${n === 1 ? t('config.activeBudget') : t('config.activeBudgets')}</span>
      <span class="gd-settings-budget-summary-stat">${t('config.budgeted')}: <strong>${formatMoney(totalLimit)}</strong></span>
      <span class="gd-settings-budget-summary-stat">${t('config.spent')}: <strong>${formatMoney(totalSpent)}</strong></span>
      <div class="gd-settings-budget-summary-bar">
        <span class="gd-settings-budget-fill ${exceeded ? "gd-settings-budget-fill--danger" : nearLimit ? "gd-settings-budget-fill--warn" : ""}"
          style="--gd-budget-fill: ${pct}%;"></span>
      </div>
    </div>
  `;
}

function renderBudgetRow(budget, spentAmount, notifEnabled, isEditing, isReadOnly) {
  const spent = Number(spentAmount || 0);
  const limit = Number(budget.amountLimit || 0);
  const pct = limit > 0 ? Math.min(Math.round((spent / limit) * 100), 100) : 0;
  const rawPct = limit > 0 ? Math.round((spent / limit) * 100) : 0;
  const exceeded = rawPct > 100;
  const nearLimit = rawPct >= 80;
  const alertClass = exceeded ? "danger" : nearLimit ? "warning" : "";

  if (isEditing) {
    return `
      <div class="gd-settings-budget-row ${alertClass ? `gd-settings-budget-row--${alertClass}` : ""}">
        <span class="gd-settings-budget-cat">${escapeHtml(budget.categoryName)}</span>
        <div class="gd-settings-budget-bar">
          <span class="gd-settings-budget-fill ${exceeded ? "gd-settings-budget-fill--danger" : nearLimit ? "gd-settings-budget-fill--warn" : ""}"
            style="--gd-budget-fill: ${pct}%;"></span>
        </div>
        <div class="gd-settings-budget-inline-edit">
          <input type="number" class="gd-settings-budget-input gd-form-input"
            id="editBudgetInput-${escapeHtml(budget.id)}" value="${limit}" min="1">
        </div>
        <div class="gd-settings-budget-actions">
          <button type="button" class="gd-ahorro-ctrl-btn gd-ahorro-ctrl-btn--edit"
            data-action="save-budget-edit" data-budget-id="${escapeHtml(budget.id)}" aria-label="${t('config.saveChanges')}">
            <i class="lni lni-checkmark" aria-hidden="true"></i>
          </button>
          <button type="button" class="gd-ahorro-ctrl-btn"
            data-action="cancel-budget-edit" aria-label="${t('config.cancelEdit')}">
            <i class="lni lni-close" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    `;
  }

  return `
    <div class="gd-settings-budget-row ${alertClass ? `gd-settings-budget-row--${alertClass}` : ""}">
      <span class="gd-settings-budget-cat">${escapeHtml(budget.categoryName)}</span>
      <div class="gd-settings-budget-bar">
        <span class="gd-settings-budget-fill ${exceeded ? "gd-settings-budget-fill--danger" : nearLimit ? "gd-settings-budget-fill--warn" : ""}"
          style="--gd-budget-fill: ${pct}%;"></span>
      </div>
      <div class="gd-settings-budget-pct-wrap">
        <span class="gd-settings-budget-pct ${exceeded ? "text-danger" : nearLimit && notifEnabled ? "text-warning" : ""}">${rawPct}%</span>
        <span class="gd-settings-budget-spent">${formatMoney(spent)} / ${formatMoney(limit)}</span>
      </div>
      ${!isReadOnly ? `
      <div class="gd-settings-budget-actions">
        <button type="button" class="gd-ahorro-ctrl-btn gd-ahorro-ctrl-btn--edit"
          data-action="edit-budget" data-budget-id="${escapeHtml(budget.id)}" aria-label="${t('config.editBudget')}">
          <i class="lni lni-pencil-alt" aria-hidden="true"></i>
        </button>
        <button type="button" class="gd-ahorro-ctrl-btn gd-ahorro-ctrl-btn--danger"
          data-action="delete-budget" data-budget-id="${escapeHtml(budget.id)}" aria-label="${t('config.deleteBudget')}">
          <i class="lni lni-close" aria-hidden="true"></i>
        </button>
      </div>` : ""}
    </div>
  `;
}

function renderCategoryRow(cat) {
  const label = cat.icon ? `${cat.icon} ${cat.name}` : cat.name;
  const kindLabel = cat.isDefault ? t('config.system') : t('config.personal');
  const canDelete = !cat.isDefault;

  return `
    <div class="gd-settings-category-row">
      <span class="gd-settings-budget-cat">${escapeHtml(label)}</span>
      <span class="gd-settings-category-pill ${cat.isDefault ? "" : "gd-settings-category-pill--personal"}">${escapeHtml(kindLabel)}</span>
      ${canDelete
        ? `<button type="button" class="gd-ahorro-ctrl-btn gd-ahorro-ctrl-btn--danger" data-action="delete-category" data-category-id="${escapeHtml(String(cat.id))}" aria-label="${t('config.deleteCategory')}">
             <i class="lni lni-close" aria-hidden="true"></i>
           </button>`
        : `<span></span>`}
    </div>
  `;
}

export function renderFinancesSections({ activeSection, state }) {
  const currentPeriod = getFinanzasCurrentPeriod();
  const viewPeriod = state.finanzas.ui.budgetViewPeriod || currentPeriod;
  const [vpYear, vpMonth] = viewPeriod ? viewPeriod.split("-").map(Number) : [0, 0];
  const budgets = (state.finanzas.budgets || []).filter((b) => b.month === vpMonth && b.year === vpYear);
  const budgetAlerts = getBudgetAlertsForPeriod();
  const notifEnabled = state.notificaciones?.alertaPresupuesto !== false;

  const spentByCategory = {};
  (state.finanzas.gastos || [])
    .filter((e) => {
      const [y, m] = (e.fecha || "").slice(0, 7).split("-").map(Number);
      return e.tipo === "egreso" && y === vpYear && m === vpMonth;
    })
    .forEach((e) => {
      spentByCategory[e.categoria] = (spentByCategory[e.categoria] || 0) + Number(e.monto || 0);
    });

  const isCurrentOrFuture = !currentPeriod || compareMonthKeys(viewPeriod || currentPeriod, currentPeriod) >= 0;

  const { year: vpY, month: vpM } = parseMonthKey(viewPeriod);
  const prevM = vpM === 1 ? 12 : vpM - 1;
  const prevY = vpM === 1 ? vpY - 1 : vpY;
  const prevPeriodKey = `${prevY}-${String(prevM).padStart(2, "0")}`;
  const prevBudgets = (state.finanzas.budgets || []).filter((b) => b.month === prevM && b.year === prevY);
  const showCopyBtn = isCurrentOrFuture && budgets.length === 0 && prevBudgets.length > 0;

  const customCategories = state.finanzas.customCategories || [];
  const systemCategories = customCategories.filter((c) => c.isDefault);
  const personalCategories = customCategories.filter((c) => !c.isDefault);

  const allCategoryOptions = customCategories.length > 0
    ? customCategories
    : (state.finanzas.categories || []).map((name) => ({ id: null, name }));

  return `
    <!-- PRESUPUESTOS -->
    <section id="config-section-presupuestos" class="gd-settings-panel ${activeSection === "presupuestos" ? "active" : ""}" data-config-section="presupuestos" ${activeSection === "presupuestos" ? "" : "hidden"}>
      <article class="gd-card">
        ${renderBudgetMonthPicker(viewPeriod, currentPeriod)}

        <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mb-3">
          <div>
            <h2 class="gd-card-title mb-1">${t('config.monthlyBudgets')}</h2>
            <p class="gd-muted mb-0">${t('config.monthlyBudgetsSub')}</p>
          </div>
          ${budgetAlerts.length > 0
            ? `<span class="gd-settings-alert-chip">${budgetAlerts.length} ${budgetAlerts.length === 1 ? t('config.activeAlert') : t('config.activeAlerts')}</span>`
            : ""}
        </div>

        ${renderBudgetSummary(budgets, spentByCategory)}

        ${budgets.length === 0
          ? `<div class="gd-settings-prox-block mb-3">
               <i class="lni lni-wallet" aria-hidden="true"></i>
               <p class="mb-1 fw-semibold">${isCurrentOrFuture ? t('config.noBudgetsMonth') : t('config.noBudgetsPeriod')}</p>
               <p class="gd-muted mb-0">${isCurrentOrFuture ? t('config.noBudgetsMonthSub') : t('config.noBudgetsPeriodSub')}</p>
             </div>`
          : `<div class="gd-settings-budget-list mb-3">
               ${budgets.map((b) => renderBudgetRow(b, spentByCategory[b.categoryName] || 0, notifEnabled, b.id === state.finanzas.ui.editingBudgetId, !isCurrentOrFuture)).join("")}
             </div>`
        }

        ${showCopyBtn
          ? `<div class="mb-3">
               <button type="button" class="gd-btn-secondary w-100"
                 data-action="copy-budgets-from-prev"
                 data-prev-period="${escapeHtml(prevPeriodKey)}">
                 <i class="lni lni-copy" aria-hidden="true"></i>
                 ${t('config.copyBudgets', { month: formatMonthLabelLong(prevPeriodKey) })}
               </button>
             </div>`
          : ""}

        ${isCurrentOrFuture
          ? `<form id="nuevoBudgetForm" class="gd-form-grid gd-settings-budget-form">
               <div>
                 <label class="gd-form-label" for="budgetCategoria">${t('config.category')}</label>
                 <select id="budgetCategoria" class="gd-form-select">
                   <option value="">${t('config.selectCategory')}</option>
                   ${allCategoryOptions.map((c) => `<option value="${escapeHtml(String(c.id ?? c.name))}" data-name="${escapeHtml(c.name)}">${escapeHtml(c.name)}</option>`).join("")}
                 </select>
               </div>
               <div>
                 <label class="gd-form-label" for="budgetLimite">${t('config.monthlyLimit')}</label>
                 <input id="budgetLimite" type="number" min="1" class="gd-form-input" placeholder="${t('config.placeholderLimit')}">
               </div>
               <div class="d-flex align-items-end">
                 <button type="submit" class="gd-btn-primary w-100">${t('config.addBudget')}</button>
               </div>
             </form>`
          : `<p class="gd-muted small text-center mt-2">${t('config.readOnlyHint')}</p>`
        }
      </article>
    </section>

    <!-- CATEGORÍAS -->
    <section id="config-section-categorias" class="gd-settings-panel ${activeSection === "categorias" ? "active" : ""}" data-config-section="categorias" ${activeSection === "categorias" ? "" : "hidden"}>
      <article class="gd-card">
        <h2 class="gd-card-title mb-1">${t('config.customCategories')}</h2>
        <p class="gd-muted mb-3">${t('config.customCategoriesSub')}</p>

        ${customCategories.length === 0
          ? `<div class="gd-settings-prox-block mb-3">
               <i class="lni lni-tag" aria-hidden="true"></i>
               <p class="mb-1 fw-semibold">${t('config.noCategoriesLoaded')}</p>
               <p class="gd-muted mb-0">${t('config.noCategoriesLoadedSub')}</p>
             </div>`
          : `<div class="gd-settings-category-list mb-3">
               ${systemCategories.length > 0
                 ? `<p class="gd-settings-category-section-label">${t('config.systemSection')}</p>${systemCategories.map(renderCategoryRow).join("")}`
                 : ""}
               ${personalCategories.length > 0
                 ? `<p class="gd-settings-category-section-label mt-3">${t('config.personalSection')}</p>${personalCategories.map(renderCategoryRow).join("")}`
                 : ""}
             </div>`
        }

        <form id="nuevaCategoriaForm" class="gd-form-grid gd-settings-budget-form">
          <div>
            <label class="gd-form-label" for="nuevaCategoria">${t('config.categoryName')}</label>
            <input id="nuevaCategoria" class="gd-form-input" placeholder="${t('config.placeholderPets')}">
          </div>
          <div>
            <label class="gd-form-label" for="nuevoCategoriaEmoji">${t('config.emoji')} <span class="gd-form-optional">${t('common.optional')}</span></label>
            <input id="nuevoCategoriaEmoji" class="gd-form-input" placeholder="🐾" maxlength="8">
          </div>
          <div class="d-flex align-items-end">
            <button type="submit" class="gd-btn-primary w-100">${t('config.addCategory')}</button>
          </div>
        </form>
      </article>
    </section>
  `;
}

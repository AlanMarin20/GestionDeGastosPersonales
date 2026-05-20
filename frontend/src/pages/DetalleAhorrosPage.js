import { renderDashboardAppLayout } from "../components/dashboard/dashboardAppLayout";
import { tarjetaValor } from "../components/common/reusablePageComponents";
import { escapeHtml } from "../utils/sanitize";
import { formatMoney } from "../utils/money";
import { t } from '../i18n';

const STATUS_META = {
  "no-goal": { accent: "#7c3aed", bg: "rgba(124,58,237,0.12)", text: "#7c3aed", icon: "lni-investment" },
  low:       { accent: "#dc2626", bg: "rgba(220,38,38,0.10)",  text: "#dc2626", icon: "lni-investment" },
  mid:       { accent: "#d97706", bg: "rgba(217,119,6,0.10)",  text: "#d97706", icon: "lni-bar-chart" },
  near:      { accent: "#0ea5e9", bg: "rgba(14,165,233,0.10)", text: "#0ea5e9", icon: "lni-stats-up" },
  done:      { accent: "#16a34a", bg: "rgba(22,163,74,0.10)",  text: "#16a34a", icon: "lni-checkmark-circle" },
};

function resolveProgress(ahorro) {
  const meta = Number(ahorro.meta || 0);
  const monto = Number(ahorro.monto || 0);
  if (meta <= 0) return null;
  return Math.min((monto / meta) * 100, 100);
}

function getStatus(pct) {
  if (pct === null) return "no-goal";
  if (pct >= 100) return "done";
  if (pct >= 66)  return "near";
  if (pct >= 33)  return "mid";
  return "low";
}

function renderAhorroCard(ahorro) {
  const progress = resolveProgress(ahorro);
  const status   = getStatus(progress);
  const meta     = STATUS_META[status];
  const hasGoal  = progress !== null;
  const isDone   = status === "done";
  const pct      = hasGoal ? progress.toFixed(1) : 0;
  const remaining = hasGoal ? Math.max(0, Number(ahorro.meta) - Number(ahorro.monto)) : 0;

  return `
    <article
      class="gd-card gd-ahorro-card"
      style="--ahorro-accent:${meta.accent};--ahorro-bg:${meta.bg};--ahorro-text:${meta.text}"
    >
      <div class="gd-ahorro-card-body">
        <div class="gd-ahorro-card-head">
          <span class="gd-ahorro-avatar" aria-hidden="true">
            <i class="lni ${escapeHtml(meta.icon)}"></i>
          </span>
          <div class="gd-ahorro-card-info">
            <p class="gd-ahorro-card-name">${escapeHtml(ahorro.nombre)}</p>
            <p class="gd-ahorro-card-meta">${hasGoal ? t('ahorros.goal', { amount: escapeHtml(formatMoney(ahorro.meta)) }) : t('ahorros.noGoalSet')}</p>
          </div>
          <div class="gd-ahorro-card-controls">
            <button
              type="button"
              class="gd-ahorro-ctrl-btn gd-ahorro-ctrl-btn--edit"
              data-action="open-edit-ahorro"
              data-ahorro-id="${escapeHtml(ahorro.id)}"
              aria-label="${t('ahorros.editSaving')}"
            ><i class="lni lni-pencil-alt" aria-hidden="true"></i></button>
            <button
              type="button"
              class="gd-ahorro-ctrl-btn gd-ahorro-ctrl-btn--danger"
              data-action="open-delete-ahorro"
              data-ahorro-id="${escapeHtml(ahorro.id)}"
              aria-label="${t('ahorros.deleteSaving')}"
            ><i class="lni lni-close" aria-hidden="true"></i></button>
          </div>
        </div>

        <p class="gd-ahorro-amount">${escapeHtml(formatMoney(ahorro.monto))}</p>

        ${isDone ? `
          <div class="gd-ahorro-achieved">
            <i class="lni lni-checkmark-circle" aria-hidden="true"></i>
            ${t('ahorros.objectiveCompleted')}
          </div>
        ` : hasGoal ? `
          <div class="gd-ahorro-progress">
            <div class="gd-ahorro-progress-bar">
              <div class="gd-ahorro-progress-fill" style="width:${pct}%"></div>
            </div>
            <div class="gd-ahorro-progress-info">
              <span>${t('ahorros.pctCompleted', { pct })}</span>
              <span>${t('ahorros.remaining', { amount: escapeHtml(formatMoney(remaining)) })}</span>
            </div>
          </div>
        ` : ""}

        <div class="gd-ahorro-actions">
          <button
            type="button"
            class="gd-btn-ahorro-depositar"
            data-action="open-depositar-ahorro"
            data-ahorro-id="${escapeHtml(ahorro.id)}"
          >
            <i class="lni lni-arrow-down" aria-hidden="true"></i>
            ${t('ahorros.deposit')}
          </button>
          <button
            type="button"
            class="gd-btn-ahorro-retirar"
            data-action="open-retirar-ahorro"
            data-ahorro-id="${escapeHtml(ahorro.id)}"
            ${Number(ahorro.monto) <= 0 ? "disabled" : ""}
          >
            <i class="lni lni-arrow-up" aria-hidden="true"></i>
            ${t('ahorros.withdraw')}
          </button>
        </div>
      </div>
    </article>
  `;
}

function renderDepositarModal({ depositandoAhorro }) {
  if (!depositandoAhorro) return "";
  return `
    <div class="gd-modal-backdrop" data-action="close-depositar-ahorro-modal"></div>
    <section class="gd-modal" role="dialog" aria-modal="true" aria-label="${t('ahorros.depositToSaving')}">
      <div class="gd-modal-card">
        <div class="gd-modal-icon-header gd-modal-icon-header--success">
          <i class="lni lni-arrow-down" aria-hidden="true"></i>
        </div>
        <h3 class="gd-modal-title">${t('ahorros.depositTitle', { name: escapeHtml(depositandoAhorro.nombre) })}</h3>
        <p class="gd-modal-sub">${t('ahorros.depositSub')}</p>
        <div class="gd-form-grid">
          <div class="gd-form-full">
            <label class="gd-form-label" for="depositarMonto">${t('ahorros.amountToDeposit')}</label>
            <input id="depositarMonto" type="number" min="0.01" step="0.01" class="gd-form-input" placeholder="0.00" autofocus>
          </div>
          <div class="gd-form-full">
            <label class="gd-form-label" for="depositarDescripcion">${t('ahorros.description')} <span class="gd-form-optional">${t('common.optional')}</span></label>
            <input id="depositarDescripcion" class="gd-form-input" placeholder="${t('ahorros.placeholderMonthlySaving')}">
          </div>
        </div>
        <div class="gd-modal-actions">
          <button type="button" class="gd-btn-secondary" data-action="close-depositar-ahorro-modal">${t('common.cancel')}</button>
          <button type="button" class="gd-btn-primary" data-action="confirm-depositar-ahorro" data-ahorro-id="${escapeHtml(depositandoAhorro.id)}">${t('ahorros.deposit')}</button>
        </div>
      </div>
    </section>
  `;
}

function renderRetirarModal({ retirhandoAhorro }) {
  if (!retirhandoAhorro) return "";
  return `
    <div class="gd-modal-backdrop" data-action="close-retirar-ahorro-modal"></div>
    <section class="gd-modal" role="dialog" aria-modal="true" aria-label="${t('ahorros.withdrawFromSaving')}">
      <div class="gd-modal-card">
        <div class="gd-modal-icon-header gd-modal-icon-header--warning">
          <i class="lni lni-arrow-up" aria-hidden="true"></i>
        </div>
        <h3 class="gd-modal-title">${t('ahorros.withdrawTitle', { name: escapeHtml(retirhandoAhorro.nombre) })}</h3>
        <p class="gd-modal-sub">${t('ahorros.withdrawSub', { amount: escapeHtml(formatMoney(retirhandoAhorro.monto)) })}</p>
        <div class="gd-form-grid">
          <div class="gd-form-full">
            <label class="gd-form-label" for="retirarMonto">${t('ahorros.amountToWithdraw')}</label>
            <input id="retirarMonto" type="number" min="0.01" step="0.01" max="${escapeHtml(String(retirhandoAhorro.monto))}" class="gd-form-input" placeholder="0.00" autofocus>
          </div>
          <div class="gd-form-full">
            <label class="gd-form-label" for="retirarDescripcion">${t('ahorros.description')} <span class="gd-form-optional">${t('common.optional')}</span></label>
            <input id="retirarDescripcion" class="gd-form-input" placeholder="${t('ahorros.placeholderUnexpected')}">
          </div>
        </div>
        <div class="gd-modal-actions">
          <button type="button" class="gd-btn-secondary" data-action="close-retirar-ahorro-modal">${t('common.cancel')}</button>
          <button type="button" class="gd-btn-primary" data-action="confirm-retirar-ahorro" data-ahorro-id="${escapeHtml(retirhandoAhorro.id)}">${t('ahorros.withdraw')}</button>
        </div>
      </div>
    </section>
  `;
}

function renderEditAhorroModal({ editingAhorro }) {
  if (!editingAhorro) return "";
  return `
    <div class="gd-modal-backdrop" data-action="close-edit-ahorro-modal"></div>
    <section class="gd-modal" role="dialog" aria-modal="true" aria-label="${t('ahorros.editSaving')}">
      <div class="gd-modal-card">
        <div class="gd-modal-icon-header gd-modal-icon-header--info">
          <i class="lni lni-pencil-alt" aria-hidden="true"></i>
        </div>
        <h3 class="gd-modal-title">${t('ahorros.editObjective')}</h3>
        <p class="gd-modal-sub">${t('ahorros.editObjectiveSub')}</p>
        <div class="gd-form-grid">
          <div class="gd-form-full">
            <label class="gd-form-label" for="editAhorroNombre">${t('ahorros.name')}</label>
            <input id="editAhorroNombre" class="gd-form-input" value="${escapeHtml(editingAhorro.nombre)}">
          </div>
          <div>
            <label class="gd-form-label" for="editAhorroMonto">${t('ahorros.accumulatedAmount')}</label>
            <input id="editAhorroMonto" type="number" min="0" step="0.01" class="gd-form-input" value="${escapeHtml(String(editingAhorro.monto))}">
          </div>
          <div>
            <label class="gd-form-label" for="editAhorroMeta">${t('ahorros.goalLabel')} <span class="gd-form-optional">${t('common.optional')}</span></label>
            <input id="editAhorroMeta" type="number" min="0" step="0.01" class="gd-form-input" value="${escapeHtml(String(editingAhorro.meta ?? ""))}">
          </div>
        </div>
        <div class="gd-modal-actions">
          <button type="button" class="gd-btn-secondary" data-action="close-edit-ahorro-modal">${t('common.cancel')}</button>
          <button type="button" class="gd-btn-primary" data-action="save-edit-ahorro" data-ahorro-id="${escapeHtml(editingAhorro.id)}">${t('common.saveChanges')}</button>
        </div>
      </div>
    </section>
  `;
}

function renderDeleteAhorroModal({ deletingAhorro }) {
  if (!deletingAhorro) return "";
  return `
    <div class="gd-modal-backdrop" data-action="close-delete-ahorro-modal"></div>
    <section class="gd-modal" role="dialog" aria-modal="true" aria-label="${t('ahorros.deleteSaving')}">
      <div class="gd-modal-card">
        <div class="gd-modal-icon-header gd-modal-icon-header--danger">
          <i class="lni lni-trash-can" aria-hidden="true"></i>
        </div>
        <h3 class="gd-modal-title">${t('ahorros.deleteObjective')}</h3>
        <p class="gd-modal-sub">${t('ahorros.deleteObjectiveSub', { name: escapeHtml(deletingAhorro.nombre), amount: escapeHtml(formatMoney(deletingAhorro.monto)) })}</p>
        <div class="gd-modal-actions">
          <button type="button" class="gd-btn-secondary" data-action="close-delete-ahorro-modal">${t('common.cancel')}</button>
          <button type="button" class="gd-btn-danger" data-action="confirm-delete-ahorro" data-ahorro-id="${escapeHtml(deletingAhorro.id)}">${t('ahorros.deleteObjective')}</button>
        </div>
      </div>
    </section>
  `;
}

export function renderDetalleAhorrosPage({
  profileImage,
  profileName,
  activePath,
  pageTitle,
  pageSubtitle,
  ahorros,
  editingAhorro,
  deletingAhorro,
  depositandoAhorro,
  retirhandoAhorro,
}) {
  const totalAhorrado   = ahorros.reduce((sum, a) => sum + Number(a.monto || 0), 0);
  const ahorrosConMeta  = ahorros.filter((a) => a.meta);
  const totalMeta       = ahorrosConMeta.reduce((sum, a) => sum + Number(a.meta || 0), 0);
  const completados     = ahorros.filter((a) => {
    const p = resolveProgress(a);
    return p !== null && p >= 100;
  }).length;

  const completadosLabel = completados !== 1
    ? t('ahorros.completedCount', { count: completados })
    : t('ahorros.completedCountOne', { count: completados });

  const summaryMetrics = [
    { label: t('ahorros.totalSaved'),    value: formatMoney(totalAhorrado), delta: "", trend: "up" },
    { label: t('ahorros.activeObjectives'), value: String(ahorros.length), delta: "", trend: "up" },
    { label: t('ahorros.totalGoal'), value: ahorrosConMeta.length > 0 ? formatMoney(totalMeta) : "—", delta: ahorrosConMeta.length > 0 ? completadosLabel : "", trend: "up" },
  ];

  const objectiveCountLabel = ahorros.length !== 1
    ? t('ahorros.objectiveCount', { count: ahorros.length })
    : t('ahorros.objectiveCountOne', { count: ahorros.length });

  const goalsGrid = ahorros.length === 0
    ? `
      <div class="gd-ahorro-empty">
        <i class="lni lni-investment" aria-hidden="true"></i>
        <p>${t('ahorros.emptyTitle')}</p>
        <span>${t('ahorros.emptySub')}</span>
      </div>
    `
    : `<div class="gd-ahorro-grid">${ahorros.map(renderAhorroCard).join("")}</div>`;

  const content = `
    <section class="gd-metrics gd-metrics-3">
      ${summaryMetrics.map((m) => tarjetaValor({
        title: m.label,
        value: m.value,
        delta: m.delta,
        trend: m.trend,
        layout: "dashboard-metric",
        dashboardActionMarkup: "",
      })).join("")}
    </section>

    <article class="gd-card">
      <header class="gd-card-header">
        <h2 class="gd-card-title">${t('ahorros.myObjectives')}</h2>
        <span class="gd-muted gd-muted-sm">${objectiveCountLabel}</span>
      </header>
      ${goalsGrid}
    </article>

    <article class="gd-card gd-ahorro-new-card">
      <header class="gd-ahorro-new-header">
        <span class="gd-ahorro-new-icon" aria-hidden="true">
          <i class="lni lni-target"></i>
        </span>
        <div>
          <h2 class="gd-card-title" style="margin:0 0 0.18rem">${t('ahorros.newObjectiveTitle')}</h2>
          <p class="gd-muted gd-muted-sm" style="margin:0">${t('ahorros.newObjectiveSub')}</p>
        </div>
      </header>
      <form id="detalleAhorroForm" class="gd-ahorro-new-body">
        <div class="gd-ahorro-new-fields">
          <div>
            <label class="gd-form-label" for="detalleAhorroNombre">${t('ahorros.objectiveName')}</label>
            <input id="detalleAhorroNombre" class="gd-form-input" placeholder="${t('ahorros.placeholderEmergency')}" required>
          </div>
          <div>
            <label class="gd-form-label" for="detalleAhorroMonto">${t('ahorros.initialAmount')}</label>
            <input id="detalleAhorroMonto" type="number" min="0" step="0.01" class="gd-form-input" placeholder="0.00">
          </div>
          <div>
            <label class="gd-form-label" for="detalleAhorroMeta">${t('ahorros.targetGoal')} <span class="gd-form-optional">${t('common.optional')}</span></label>
            <input id="detalleAhorroMeta" type="number" min="0" step="0.01" class="gd-form-input" placeholder="0.00">
          </div>
        </div>
        <button type="submit" class="gd-ahorro-cta-btn">
          <i class="lni lni-plus" aria-hidden="true"></i>
          ${t('ahorros.createObjective')}
        </button>
      </form>
    </article>

    ${renderEditAhorroModal({ editingAhorro })}
    ${renderDeleteAhorroModal({ deletingAhorro })}
    ${renderDepositarModal({ depositandoAhorro })}
    ${renderRetirarModal({ retirhandoAhorro })}
  `;

  return renderDashboardAppLayout({
    activePath,
    pageTitle,
    pageSubtitle,
    content,
    profileImage,
    profileName,
  });
}

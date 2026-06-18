import { renderDashboardAppLayout } from "../components/dashboard/dashboardAppLayout";
import { tarjetaValor } from "../components/common/reusablePageComponents";
import { escapeHtml } from "../utils/sanitize";
import { formatMoney } from "../utils/money";
import { t } from '../i18n';

const RISK_CONFIG = {
  low: {
    labelKey: 'asesor.riskLow',
    className: "gd-risk-low",
    barColor: "#16a34a",
  },
  medium: {
    labelKey: 'asesor.riskMedium',
    className: "gd-risk-medium",
    barColor: "#ca8a04",
  },
  high: {
    labelKey: 'asesor.riskHigh',
    className: "gd-risk-high",
    barColor: "#dc2626",
  },
};

function renderAdvisorClientRow({ user, risk }) {
  return `
    <article class="gd-user-row">
      <span class="gd-user-avatar gd-user-avatar-dynamic" style="--gd-avatar-color: ${escapeHtml(user.avatarColor)};">${escapeHtml(user.initials)}</span>
      <div class="gd-user-copy-main">
        <div class="d-flex align-items-center justify-content-between gap-2">
          <span class="gd-user-name">${escapeHtml(user.name)}</span>
          <div class="gd-action-cell">
            <button type="button" class="gd-action-btn" data-nav="/cliente/${escapeHtml(encodeURIComponent(String(user.id)))}" aria-label="${t('asesor.viewClientDetail')}">${t('asesor.viewDetail')}</button>
            <button type="button" class="gd-action-btn danger" data-action="desvincular-cliente" data-cliente-id="${escapeHtml(String(user.id))}" aria-label="${t('asesor.unlinkClient')}">${t('forms.unlink')}</button>
          </div>
        </div>
        <div class="gd-user-sub">${escapeHtml(t('asesor.spentThisMonth', { amount: formatMoney(user.monthlySpend), tickets: String(user.tickets) }))}</div>
        <div class="gd-mini-bar">
          <div class="gd-mini-bar-fill gd-mini-bar-fill-dynamic" style="--gd-progress-width: ${Math.min(user.progress, 100)}%; --gd-progress-color: ${escapeHtml(risk.barColor)};"></div>
        </div>
      </div>
      <div class="gd-risk-meta">
        <span class="gd-risk-pill ${escapeHtml(risk.className)}">${escapeHtml(t(risk.labelKey))}</span>
        <span class="gd-risk-percent">${escapeHtml(`${user.spentPercent.toFixed(1)}%`)}</span>
      </div>
    </article>
  `;
}

function renderAddClientModal({ isOpen, newClientName, newClientCode }) {
  if (!isOpen) {
    return "";
  }

  return `
    <div class="gd-modal-backdrop" data-action="close-add-client-modal" aria-hidden="true"></div>
    <section class="gd-modal" role="dialog" aria-modal="true" aria-labelledby="addClientTitle">
      <div class="gd-modal-card">
        <h3 class="gd-modal-title" id="addClientTitle">${t('asesor.addClient')}</h3>
        <p class="gd-modal-sub">${t('asesor.addClientSub')}</p>
        <form id="addClientForm">
          <div class="gd-form-grid">
            <div class="gd-form-full">
              <label class="gd-form-label" for="nuevoClienteNombre">${t('asesor.clientName')}</label>
              <input id="nuevoClienteNombre" class="gd-form-input" type="text" name="nombre" placeholder="${t('asesor.placeholderClientName')}" value="${escapeHtml(newClientName)}" autocomplete="off">
            </div>
            <div class="gd-form-full">
              <label class="gd-form-label" for="nuevoClienteCodigo">${t('asesor.clientCode')}</label>
              <input id="nuevoClienteCodigo" class="gd-form-input" type="text" name="codigo" placeholder="${t('asesor.placeholderClientCode')}" value="${escapeHtml(newClientCode)}" autocomplete="off">
            </div>
          </div>
          <div class="gd-modal-actions">
            <button type="button" class="gd-btn-secondary" data-action="close-add-client-modal">${t('common.cancel')}</button>
            <button type="submit" class="gd-btn-primary">${t('asesor.addClient')}</button>
          </div>
        </form>
      </div>
    </section>
  `;
}

export function renderDashboardAsesorPage({
  profileImage,
  profileName,
  activePath,
  pageTitle,
  pageSubtitle,
  metrics,
  users,
  search,
  sortOrder,
  showAddClientModal,
  newClientName,
  newClientCode,
}) {
  const content = `
    <section class="gd-metrics gd-metrics-3">
      ${metrics
        .map(
          (metric) => tarjetaValor({
            title: metric.label,
            value: metric.value,
            delta: metric.delta,
            trend: metric.trend,
            layout: "dashboard-metric",
            dashboardValueClass: "gd-metric-value-compact",
          }),
        )
        .join("")}
    </section>

    <section class="gd-card">
      <header class="gd-card-header">
        <h2 class="gd-card-title">${t('asesor.assignedClients')}</h2>
        <div class="gd-advisor-toolbar d-flex align-items-center gap-2 ms-auto flex-nowrap justify-content-end">
          <select
            id="advisorSortSelect"
            class="form-select gd-advisor-sort-select gd-advisor-toolbar-control"
            aria-label="${t('asesor.sortClients')}"
          >
            <option value="a-z" ${sortOrder === "a-z" ? "selected" : ""}>${t('asesor.sortAz')}</option>
            <option value="z-a" ${sortOrder === "z-a" ? "selected" : ""}>${t('asesor.sortZa')}</option>
            <option value="riesgo-alto" ${sortOrder === "riesgo-alto" ? "selected" : ""}>${t('asesor.sortRiskHigh')}</option>
            <option value="riesgo-bajo" ${sortOrder === "riesgo-bajo" ? "selected" : ""}>${t('asesor.sortRiskLow')}</option>
          </select>
          <button
            type="button"
            class="gd-action-btn gd-advisor-toolbar-control"
            data-action="open-add-client-modal"
          >
            ${t('asesor.addClient')}
          </button>
          <input
            id="advisorSearchInput"
            class="gd-form-input gd-inline-search gd-advisor-toolbar-control"
            type="search"
            placeholder="${t('asesor.searchClient')}"
            value="${escapeHtml(search)}"
          >
        </div>
      </header>

      <div class="gd-user-list">
        ${
          users.length === 0
            ? `<div class="gd-empty">${t('asesor.noClientsMatch')}</div>`
            : users
                .map((user) => {
                  const risk = RISK_CONFIG[user.risk] || RISK_CONFIG.medium;
                  return renderAdvisorClientRow({ user, risk });
                })
                .join("")
        }
      </div>
    </section>

    ${renderAddClientModal({
      isOpen: showAddClientModal,
      newClientName,
      newClientCode,
    })}
  `;

  return renderDashboardAppLayout({
    activePath,
    pageTitle,
    pageSubtitle,
    content,
    profileImage,
    profileName,
    isAsesor: true,
    notificationCount: 3,
  });
}

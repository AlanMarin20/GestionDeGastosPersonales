import { renderDashboardAppLayout } from "../components/dashboard/dashboardAppLayout";
import { tarjetaValor } from "../components/common/reusablePageComponents";
import { escapeHtml } from "../utils/sanitize";

const RISK_CONFIG = {
  low: {
    label: "Riesgo bajo",
    className: "gd-risk-low",
    barColor: "#16a34a",
  },
  medium: {
    label: "Riesgo medio",
    className: "gd-risk-medium",
    barColor: "#ca8a04",
  },
  high: {
    label: "Riesgo alto",
    className: "gd-risk-high",
    barColor: "#dc2626",
  },
};

function renderAdvisorClientRow({ user, risk, formatMoney }) {
  return `
    <article class="gd-user-row">
      <span class="gd-user-avatar gd-user-avatar-dynamic" style="--gd-avatar-color: ${escapeHtml(user.avatarColor)};">${escapeHtml(user.initials)}</span>
      <div class="gd-user-copy-main">
        <div class="d-flex align-items-center justify-content-between gap-2">
          <span class="gd-user-name">${escapeHtml(user.name)}</span>
          <div class="gd-action-cell">
            <button type="button" class="gd-action-btn" data-nav="/cliente/${escapeHtml(encodeURIComponent(String(user.id)))}" aria-label="Ver detalle del cliente">Ver detalle</button>
            <button type="button" class="gd-action-btn danger" data-action="desvincular-cliente" data-cliente-id="${escapeHtml(String(user.id))}" aria-label="Desvincular cliente">🗑</button>
          </div>
        </div>
        <div class="gd-user-sub">${escapeHtml(formatMoney(user.monthlySpend))} este mes · ${escapeHtml(String(user.tickets))} tickets</div>
        <div class="gd-mini-bar">
          <div class="gd-mini-bar-fill gd-mini-bar-fill-dynamic" style="--gd-progress-width: ${Math.min(user.progress, 100)}%; --gd-progress-color: ${escapeHtml(risk.barColor)};"></div>
        </div>
      </div>
      <div class="gd-risk-meta">
        <span class="gd-risk-pill ${escapeHtml(risk.className)}">${escapeHtml(risk.label)}</span>
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
        <h3 class="gd-modal-title" id="addClientTitle">Agregar cliente</h3>
        <p class="gd-modal-sub">Completá el nombre y el código que te comparta el cliente.</p>
        <form id="addClientForm">
          <div class="gd-form-grid">
            <div class="gd-form-full">
              <label class="gd-form-label" for="nuevoClienteNombre">Nombre del cliente</label>
              <input id="nuevoClienteNombre" class="gd-form-input" type="text" name="nombre" placeholder="Ej. Maria Gomez" value="${escapeHtml(newClientName)}" autocomplete="off">
            </div>
            <div class="gd-form-full">
              <label class="gd-form-label" for="nuevoClienteCodigo">Código del cliente</label>
              <input id="nuevoClienteCodigo" class="gd-form-input" type="text" name="codigo" placeholder="Código compartido por el cliente" value="${escapeHtml(newClientCode)}" autocomplete="off">
            </div>
          </div>
          <div class="gd-modal-actions">
            <button type="button" class="gd-btn-secondary" data-action="close-add-client-modal">Cancelar</button>
            <button type="submit" class="gd-btn-primary">Agregar cliente</button>
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
  showAddClientModal,
  newClientName,
  newClientCode,
  formatMoney,
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
        <h2 class="gd-card-title">Clientes Asignados</h2>
        <div class="gd-advisor-toolbar d-flex align-items-center gap-2 ms-auto flex-nowrap justify-content-end">
          <button
            type="button"
            class="gd-action-btn gd-advisor-toolbar-control"
            data-action="open-add-client-modal"
          >
            Agregar cliente
          </button>
          <input
            id="advisorSearchInput"
            class="gd-form-input gd-inline-search gd-advisor-toolbar-control"
            type="search"
            placeholder="Buscar cliente"
            value="${escapeHtml(search)}"
          >
        </div>
      </header>

      <div class="gd-user-list">
        ${
          users.length === 0
            ? `<div class="gd-empty">No hay clientes que coincidan con la busqueda.</div>`
            : users
                .map((user) => {
                  const risk = RISK_CONFIG[user.risk] || RISK_CONFIG.medium;
                  return renderAdvisorClientRow({ user, risk, formatMoney });
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

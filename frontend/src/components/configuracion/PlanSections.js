import { t } from "../../i18n";

function renderProxBadge() {
  return `<span class="gd-settings-prox-badge">${t('config.comingSoon')}</span>`;
}

export function renderPlanSections({ activeSection, state }) {
  const ticketCount = state.finanzas.gastos?.length || 0;
  const ticketLimit = 50;
  const ticketPct = Math.min(Math.round((ticketCount / ticketLimit) * 100), 100);

  return `
    <!-- PLAN -->
    <section id="config-section-plan" class="gd-settings-panel ${activeSection === "plan" ? "active" : ""}" data-config-section="plan" ${activeSection === "plan" ? "" : "hidden"}>
      <article class="gd-card">
        <h2 class="gd-card-title mb-1">${t('config.currentPlanTitle')}</h2>
        <p class="gd-muted mb-3">${t('config.currentPlanSub')}</p>

        <div class="gd-settings-plan-card current">
          <div>
            <p class="gd-settings-session-title">${t('config.freePlan')}</p>
            <p class="gd-settings-session-sub">${t('config.freePlanSub', { limit: ticketLimit })}</p>
          </div>
          <span class="gd-settings-category-pill">${t('config.current')}</span>
        </div>

        <div class="gd-settings-plan-card">
          <div>
            <p class="gd-settings-session-title">${t('config.proPlan')} ${renderProxBadge()}</p>
            <p class="gd-settings-session-sub">${t('config.proPlanSub')}</p>
          </div>
          <button type="button" class="gd-btn-primary" disabled style="opacity:0.5;">${t('config.comingSoon')}</button>
        </div>

        <div class="gd-settings-usage-list mt-3">
          <div class="gd-settings-budget-row">
            <span class="gd-settings-budget-cat">${t('config.uploadedMovements')}</span>
            <div class="gd-settings-budget-bar">
              <span class="gd-settings-budget-fill${ticketPct >= 100 ? " gd-settings-budget-fill--danger" : ticketPct >= 80 ? " gd-settings-budget-fill--warn" : ""}"
                style="--gd-budget-fill: ${ticketPct}%;"></span>
            </div>
            <span class="gd-settings-budget-pct ${ticketPct >= 80 ? "text-warning" : ""}">${ticketCount} / ${ticketLimit}</span>
          </div>
        </div>
      </article>
    </section>

    <!-- ZONA PELIGROSA -->
    <section id="config-section-danger" class="gd-settings-panel ${activeSection === "danger" ? "active" : ""}" data-config-section="danger" ${activeSection === "danger" ? "" : "hidden"}>
      <article class="gd-card gd-settings-danger-card">
        <h2 class="gd-card-title mb-1">${t('config.dangerZoneTitle')}</h2>
        <p class="gd-muted mb-3">${t('config.dangerZoneSub')}</p>

        <div class="gd-settings-danger-row">
          <div>
            <p class="gd-settings-session-title">${t('config.deleteHistory')}</p>
            <p class="gd-settings-session-sub">${t('config.deleteHistorySub')}</p>
          </div>
          <button type="button" class="gd-btn-danger" data-action="borrar-historial">${t('config.deleteHistoryBtn')}</button>
        </div>

        <div class="gd-settings-danger-row">
          <div>
            <p class="gd-settings-session-title">${t('config.deleteAccount')}</p>
            <p class="gd-settings-session-sub">${t('config.deleteAccountSub')}</p>
          </div>
          <button type="button" class="gd-btn-danger" data-action="eliminar-cuenta">${t('config.deleteAccountBtn')}</button>
        </div>
      </article>
    </section>
  `;
}

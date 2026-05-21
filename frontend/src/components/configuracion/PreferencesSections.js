import { escapeHtml } from "../../utils/sanitize";
import { t } from "../../i18n";

function renderProxBadge() {
  return `<span class="gd-settings-prox-badge">${t('config.comingSoon')}</span>`;
}

export function renderPreferencesSections({ activeSection, config, state }) {
  const idiomaLabel = { es: t('config.langEs'), en: t('config.langEn') }[config.idioma] || t('config.langEs');
  const themeLabel = { light: t('config.themeLight'), dark: t('config.themeDark'), system: t('config.themeSystem') }[config.tema] || t('config.themeSystem');
  const fontSizeLabel = { sm: t('config.fontSm'), md: t('config.fontMd'), lg: t('config.fontLg') }[config.tamanioFuente] || t('config.fontMd');
  const densityLabel = { comfortable: t('config.densityComfortable'), compact: t('config.densityCompact') }[config.densidad] || t('config.densityComfortable');

  const ticketCount = state.finanzas.gastos?.length || 0;

  return `
    <!-- NOTIFICACIONES -->
    <section id="config-section-notificaciones" class="gd-settings-panel ${activeSection === "notificaciones" ? "active" : ""}" data-config-section="notificaciones" ${activeSection === "notificaciones" ? "" : "hidden"}>
      <article class="gd-card">
        <h2 class="gd-card-title mb-1">${t('config.expenseAlerts')}</h2>
        <p class="gd-muted mb-3">${t('config.expenseAlertsSub')}</p>

        <label class="gd-settings-toggle-row">
          <div>
            <p class="gd-card-title gd-card-title-xs mb-0">${t('config.unusualExpense')}</p>
            <small class="gd-muted">${t('config.unusualExpenseSub')}</small>
          </div>
          <input class="form-check-input mt-0" type="checkbox" id="resumenSemanal" ${state.notificaciones?.resumenSemanal !== false ? "checked" : ""}>
        </label>

        <label class="gd-settings-toggle-row">
          <div>
            <p class="gd-card-title gd-card-title-xs mb-0">${t('config.budget80')}</p>
            <small class="gd-muted">${t('config.budget80Sub')}</small>
          </div>
          <input class="form-check-input mt-0" type="checkbox" id="alertaPresupuesto" ${state.notificaciones?.alertaPresupuesto !== false ? "checked" : ""}>
        </label>

        <label class="gd-settings-toggle-row">
          <div>
            <p class="gd-card-title gd-card-title-xs mb-0">${t('config.advisorRecommendations')}</p>
            <small class="gd-muted">${t('config.advisorRecommendationsSub')}</small>
          </div>
          <input class="form-check-input mt-0" type="checkbox" id="recomendacionesIA" ${state.notificaciones?.recomendacionesIA !== false ? "checked" : ""}>
        </label>

        <label class="gd-settings-toggle-row">
          <div>
            <p class="gd-card-title gd-card-title-xs mb-0">${t('config.largeMovements')}</p>
            <small class="gd-muted">${t('config.largeMovementsSub')}</small>
          </div>
          <input class="form-check-input mt-0" type="checkbox" id="movimientosGrandes" ${state.notificaciones?.movimientosGrandes !== false ? "checked" : ""}>
        </label>

        <div class="d-flex justify-content-end mt-3">
          <button type="button" class="gd-btn-primary" id="guardarPreferenciasNotifBtn">${t('config.savePreferences')}</button>
        </div>
      </article>
    </section>

    <!-- APARIENCIA -->
    <section id="config-section-apariencia" class="gd-settings-panel ${activeSection === "apariencia" ? "active" : ""}" data-config-section="apariencia" ${activeSection === "apariencia" ? "" : "hidden"}>
      <article class="gd-card">
        <h2 class="gd-card-title mb-1">${t('config.appearanceTitle')}</h2>
        <p class="gd-muted mb-3">${t('config.appearanceSub')}</p>

        <div class="gd-form-grid">
          <div>
            <label class="gd-form-label" for="idioma">${t('config.language')}</label>
            <select id="idioma" name="idioma" class="gd-form-select">
              <option value="es" ${config.idioma === "es" ? "selected" : ""}>${t('config.langEs')}</option>
              <option value="en" ${config.idioma === "en" ? "selected" : ""}>${t('config.langEn')}</option>
            </select>
          </div>
          <div>
            <label class="gd-form-label" for="temaModo">${t('config.theme')}</label>
            <select id="temaModo" name="temaModo" class="gd-form-select">
              <option value="system" ${config.tema === "system" ? "selected" : ""}>${t('config.themeSystem')}</option>
              <option value="light" ${config.tema === "light" ? "selected" : ""}>${t('config.themeLight')}</option>
              <option value="dark" ${config.tema === "dark" ? "selected" : ""}>${t('config.themeDark')}</option>
            </select>
          </div>
          <div>
            <label class="gd-form-label" for="tamanioFuente">${t('config.fontSize')}</label>
            <select id="tamanioFuente" name="tamanioFuente" class="gd-form-select">
              <option value="sm" ${config.tamanioFuente === "sm" ? "selected" : ""}>${t('config.fontSm')}</option>
              <option value="md" ${config.tamanioFuente === "md" ? "selected" : ""}>${t('config.fontMd')}</option>
              <option value="lg" ${config.tamanioFuente === "lg" ? "selected" : ""}>${t('config.fontLg')}</option>
            </select>
          </div>
          <div>
            <label class="gd-form-label" for="densidad">${t('config.density')}</label>
            <select id="densidad" name="densidad" class="gd-form-select">
              <option value="comfortable" ${config.densidad === "comfortable" ? "selected" : ""}>${t('config.densityComfortable')}</option>
              <option value="compact" ${config.densidad === "compact" ? "selected" : ""}>${t('config.densityCompact')}</option>
            </select>
          </div>

          <label class="gd-form-full gd-setting-row" for="mostrarCentavos">
            <div>
              <p class="gd-card-title gd-card-title-xs mb-0">${t('config.showCents')}</p>
              <small class="gd-muted">${t('config.showCentsSub')}</small>
            </div>
            <input class="form-check-input mt-0" type="checkbox" id="mostrarCentavos" ${config.mostrarCentavos ? "checked" : ""}>
          </label>

          <div class="gd-form-full gd-settings-preview">
            <p class="gd-card-title gd-card-title-xs mb-2">${t('config.preview')}</p>
            <div class="gd-settings-preview-list">
              <div class="gd-settings-preview-item"><span>${t('config.previewLanguage')}</span><strong>${escapeHtml(idiomaLabel)}</strong></div>
              <div class="gd-settings-preview-item"><span>${t('config.previewTheme')}</span><strong>${escapeHtml(themeLabel)}</strong></div>
              <div class="gd-settings-preview-item"><span>${t('config.previewFont')}</span><strong>${escapeHtml(fontSizeLabel)}</strong></div>
              <div class="gd-settings-preview-item"><span>${t('config.previewDensity')}</span><strong>${escapeHtml(densityLabel)}</strong></div>
            </div>
          </div>
        </div>

        <div class="d-flex justify-content-end mt-3">
          <button type="button" class="gd-btn-primary" id="guardarConfiguracionBtn">${t('config.saveConfiguration')}</button>
        </div>
      </article>
    </section>

    <!-- MIS DATOS -->
    <section id="config-section-datos" class="gd-settings-panel ${activeSection === "datos" ? "active" : ""}" data-config-section="datos" ${activeSection === "datos" ? "" : "hidden"}>
      <article class="gd-card">
        <h2 class="gd-card-title mb-1">${t('config.exportMyData')}</h2>
        <p class="gd-muted mb-3">${t('config.exportMyDataSub')}</p>

        <div class="gd-settings-export-list">
          <div class="gd-settings-export-row">
            <div>
              <p class="gd-settings-session-title">${t('config.movementHistory')}</p>
              <p class="gd-settings-session-sub">${t('config.movementHistorySub', { count: ticketCount })}</p>
            </div>
            <div class="d-flex gap-2">
              <button type="button" class="gd-btn-secondary" data-action="export-gastos-csv">${t('config.csv')}</button>
              <button type="button" class="gd-btn-secondary" disabled title="${t('config.comingSoon')}" style="opacity:0.5;">${t('config.excel')}</button>
            </div>
          </div>

          <div class="gd-settings-export-row">
            <div>
              <p class="gd-settings-session-title">${t('config.monthlyReports')} ${renderProxBadge()}</p>
              <p class="gd-settings-session-sub">${t('config.monthlyReportsSub')}</p>
            </div>
            <button type="button" class="gd-btn-secondary" disabled style="opacity:0.5;">${t('config.pdf')}</button>
          </div>
        </div>
      </article>
    </section>
  `;
}

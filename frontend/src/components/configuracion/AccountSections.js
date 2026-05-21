import { escapeHtml } from "../../utils/sanitize";
import { getFinancialScore } from "../../data/finanzas";
import { t } from "../../i18n";

function scoreLabel(score) {
  if (score >= 80) return t('config.scoreExcellent');
  if (score >= 60) return t('config.scoreGood');
  if (score >= 40) return t('config.scoreFair');
  return t('config.scoreLow');
}

function scoreTier(score) {
  if (score >= 80) return "excellent";
  if (score >= 60) return "good";
  if (score >= 40) return "fair";
  return "low";
}

function renderScoreRing(score) {
  const tier = scoreTier(score);
  const label = scoreLabel(score);
  const circumference = 2 * Math.PI * 28;
  const dashOffset = circumference - (score / 100) * circumference;

  return `
    <div class="gd-score-ring-wrap">
      <svg class="gd-score-ring gd-score-ring--${escapeHtml(tier)}" viewBox="0 0 64 64" aria-label="${t('config.scoreFinancialAria', { score })}">
        <circle class="gd-score-ring-track" cx="32" cy="32" r="28" fill="none" stroke-width="6"/>
        <circle
          class="gd-score-ring-fill"
          cx="32" cy="32" r="28"
          fill="none" stroke-width="6"
          stroke-dasharray="${circumference.toFixed(2)}"
          stroke-dashoffset="${dashOffset.toFixed(2)}"
          transform="rotate(-90 32 32)"
        />
      </svg>
      <div class="gd-score-ring-inner">
        <span class="gd-score-ring-value">${score}</span>
        <span class="gd-score-ring-label">${escapeHtml(label)}</span>
      </div>
    </div>
  `;
}

function renderProxBadge() {
  return `<span class="gd-settings-prox-badge">${t('config.comingSoon')}</span>`;
}

export function renderAccountSections({ activeSection, profileImage, profileName, state, config }) {
  const safeName = String(profileName || t('config.defaultUser')).trim() || t('config.defaultUser');
  const nameParts = safeName.split(/\s+/).filter(Boolean);
  const firstName = nameParts[0] || t('config.defaultUser');
  const lastName = nameParts.slice(1).join(" ");
  const profileEmail = String(state.perfil?.email || "");
  const initials = nameParts.length > 1
    ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
    : firstName.slice(0, 2).toUpperCase();

  const score = getFinancialScore();
  const tier = scoreTier(score);
  const scoreDescriptions = {
    excellent: t('config.scoreDescExcellent'),
    good: t('config.scoreDescGood'),
    fair: t('config.scoreDescFair'),
    low: t('config.scoreDescLow'),
  };
  const scoreDesc = scoreDescriptions[tier];

  const perfilFin = config.perfilFinanciero || {};
  const ingresoEstimado = String(perfilFin.ingresoEstimado || "");
  const objetivoAhorro = String(perfilFin.objetivoAhorro || "");

  return `
    <!-- PERFIL -->
    <section id="config-section-perfil" class="gd-settings-panel ${activeSection === "perfil" ? "active" : ""}" data-config-section="perfil" ${activeSection === "perfil" ? "" : "hidden"}>

      <article class="gd-card">
        <div class="gd-settings-profile-head">
          <div class="gd-settings-avatar-wrap">
            <label for="configProfileImageInput" class="gd-settings-avatar-image-trigger" aria-label="${t('config.changePhoto')}">
              <img src="${escapeHtml(profileImage || "/assets/img/user-avatar-default.svg")}" alt="${t('config.avatarAlt')}" class="gd-settings-avatar-image" data-image-error-mode="toggle-next">
              <span class="gd-settings-avatar-fallback d-none" aria-hidden="true">${escapeHtml(initials)}</span>
            </label>
          </div>
          <div class="gd-settings-profile-copy">
            <p class="gd-card-title">${t('config.myProfile')}</p>
            <p class="gd-settings-profile-name">${escapeHtml(safeName)}</p>
            <p class="gd-muted mb-0">${escapeHtml(profileEmail)}</p>
          </div>
          <div class="gd-settings-profile-right">
            ${renderScoreRing(score)}
            <div class="gd-settings-avatar-actions">
              <label for="configProfileImageInput" class="gd-action-btn">${t('config.changePhotoBtn')}</label>
              <input id="configProfileImageInput" type="file" class="d-none" accept="image/*">
            </div>
          </div>
        </div>

        <div class="gd-settings-score-desc">
          <p class="gd-muted mb-0"><strong>${t('config.scoreSummary', { score, label: scoreLabel(score) })}</strong> — ${escapeHtml(scoreDesc)}</p>
          <p class="gd-muted mb-0 mt-1" style="font-size: 0.78rem;">${t('config.scoreCalc')}</p>
        </div>

        <div class="gd-form-grid mt-3">
          <div>
            <label class="gd-form-label" for="configNombre">${t('config.firstName')}</label>
            <input id="configNombre" class="gd-form-input" value="${escapeHtml(firstName)}">
          </div>
          <div>
            <label class="gd-form-label" for="configApellido">${t('config.lastName')}</label>
            <input id="configApellido" class="gd-form-input" value="${escapeHtml(lastName)}">
          </div>
          <div class="gd-form-full">
            <label class="gd-form-label" for="configEmail">${t('config.email')}</label>
            <input id="configEmail" class="gd-form-input" value="${escapeHtml(profileEmail)}">
          </div>
          <div>
            <label class="gd-form-label" for="configMoneda">${t('config.currency')}</label>
            <select id="moneda" name="moneda" class="gd-form-select">
              <option value="ARS" ${config.moneda === "ARS" ? "selected" : ""}>${t('config.currencyArs')}</option>
              <option value="USD" disabled>${t('config.currencyUsd')}</option>
              <option value="EUR" disabled>${t('config.currencyEur')}</option>
            </select>
          </div>
          <div>
            <label class="gd-form-label" for="configTelefono">
              ${t('config.phone')} ${renderProxBadge()}
            </label>
            <input id="configTelefono" class="gd-form-input" placeholder="${t('config.phonePlaceholder')}" disabled style="opacity:0.5;cursor:not-allowed;">
          </div>
        </div>

        <div class="d-flex justify-content-end gap-2 mt-3">
          <button type="button" class="gd-btn-secondary">${t('config.cancel')}</button>
          <button type="button" class="gd-btn-primary" id="guardarPerfilConfigBtn">${t('config.saveChanges')}</button>
        </div>
      </article>

      <article class="gd-card">
        <h2 class="gd-card-title mb-1">${t('config.financialProfile')}</h2>
        <p class="gd-muted mb-3">${t('config.financialProfileSub')}</p>
        <div class="gd-form-grid">
          <div>
            <label class="gd-form-label" for="configIngreso">${t('config.estimatedIncome')}</label>
            <input id="configIngreso" type="number" min="0" class="gd-form-input" value="${escapeHtml(ingresoEstimado)}" placeholder="${t('config.placeholderIncome')}">
          </div>
          <div>
            <label class="gd-form-label" for="configAhorro">${t('config.savingGoal')}</label>
            <input id="configAhorro" type="number" min="0" class="gd-form-input" value="${escapeHtml(objetivoAhorro)}" placeholder="${t('config.placeholderSavingGoal')}">
          </div>
          <div class="gd-form-full">
            <label class="gd-form-label" for="configPerfilGasto">${t('config.aiSpendProfile')}</label>
            <input id="configPerfilGasto" class="gd-form-input" value="${t('config.aiSpendProfileValue')}" disabled style="opacity:0.6;">
          </div>
        </div>
        <div class="d-flex justify-content-end mt-3">
          <button type="button" class="gd-btn-primary" id="guardarPerfilFinancieroBtn">${t('config.saveFinancialProfile')}</button>
        </div>
      </article>
    </section>

    <!-- SEGURIDAD -->
    <section id="config-section-seguridad" class="gd-settings-panel ${activeSection === "seguridad" ? "active" : ""}" data-config-section="seguridad" ${activeSection === "seguridad" ? "" : "hidden"}>
      <article class="gd-card">
        <h2 class="gd-card-title mb-1">${t('config.passwordAccess')}</h2>
        <p class="gd-muted mb-3">${t('config.passwordAccessSub')}</p>

        <div class="gd-form-grid">
          <div class="gd-form-full">
            <label class="gd-form-label" for="passwordActual">${t('config.currentPassword')}</label>
            <input id="passwordActual" type="password" class="gd-form-input" placeholder="••••••••">
          </div>
          <div>
            <label class="gd-form-label" for="passwordNueva">${t('config.newPassword')}</label>
            <input id="passwordNueva" type="password" class="gd-form-input" placeholder="••••••••">
          </div>
          <div>
            <label class="gd-form-label" for="passwordConfirmar">${t('config.confirmPassword')}</label>
            <input id="passwordConfirmar" type="password" class="gd-form-input" placeholder="••••••••">
          </div>
        </div>

        <div class="gd-settings-toggle-row mt-3" style="opacity:0.55;" title="${t('config.twoFactorUnavailable')}">
          <div>
            <p class="gd-card-title gd-card-title-xs mb-0">
              ${t('config.twoFactor')} ${renderProxBadge()}
            </p>
            <small class="gd-muted">${t('config.twoFactorSub')}</small>
          </div>
          <input class="form-check-input mt-0" type="checkbox" id="autenticacionDos" disabled>
        </div>

        <div class="d-flex justify-content-end gap-2 mt-3">
          <button type="button" class="gd-btn-secondary">${t('config.cancel')}</button>
          <button type="button" class="gd-btn-primary" id="guardarSeguridadBtn">${t('config.updateSecurity')}</button>
        </div>
      </article>

      <article class="gd-card">
        <h2 class="gd-card-title mb-1">${t('config.bestPractices')}</h2>
        <ul class="gd-policy-list mb-0">
          <li>${t('config.practice1')}</li>
          <li>${t('config.practice2')}</li>
          <li>${t('config.practice3')}</li>
          <li>${t('config.practice4')}</li>
          <li>${t('config.practice5')}</li>
        </ul>
      </article>
    </section>

    <!-- SESIONES -->
    <section id="config-section-sesiones" class="gd-settings-panel ${activeSection === "sesiones" ? "active" : ""}" data-config-section="sesiones" ${activeSection === "sesiones" ? "" : "hidden"}>
      <article class="gd-card">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mb-3">
          <div>
            <h2 class="gd-card-title mb-1">${t('config.activeSessions')} ${renderProxBadge()}</h2>
            <p class="gd-muted mb-0">${t('config.sessionsSub')}</p>
          </div>
        </div>
        <div class="gd-settings-prox-block">
          <i class="lni lni-tab" aria-hidden="true"></i>
          <p class="mb-1 fw-semibold">${t('config.deviceManagement')}</p>
          <p class="gd-muted mb-0">${t('config.deviceManagementSub')}</p>
        </div>
      </article>
    </section>
  `;
}

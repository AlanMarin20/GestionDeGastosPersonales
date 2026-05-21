import { renderDashboardAppLayout } from "../components/dashboard/dashboardAppLayout";
import { escapeHtml } from "../utils/sanitize";
import { t } from "../i18n";

function buildBenefitItem(text) {
  return `
    <li class="gd-onboarding-list-item">
      <span class="gd-onboarding-check" aria-hidden="true">✓</span>
      <span>${escapeHtml(text)}</span>
    </li>`;
}

function buildRespItem(text) {
  return `
    <li class="gd-onboarding-list-item">
      <span class="gd-onboarding-warn" aria-hidden="true">!</span>
      <span>${escapeHtml(text)}</span>
    </li>`;
}

export function renderAsesorOnboardingPage({ profileImage, profileName }) {
  const content = `
    <div class="gd-onboarding">

      <div class="gd-onboarding-hero">
        <span class="gd-onboarding-hero-icon" aria-hidden="true">🏛️</span>
        <h2 class="gd-onboarding-hero-title">${escapeHtml(t('onboarding.heroTitle'))}</h2>
        <p class="gd-onboarding-hero-sub">${escapeHtml(t('onboarding.heroSubtitle'))}</p>
      </div>

      <div class="gd-onboarding-grid">
        <div class="gd-onboarding-card gd-onboarding-card--benefits">
          <h3 class="gd-onboarding-card-heading">✨ ${escapeHtml(t('onboarding.benefitsTitle'))}</h3>
          <ul class="gd-onboarding-list">
            ${[t('onboarding.benefit1'), t('onboarding.benefit2'), t('onboarding.benefit3'), t('onboarding.benefit4')]
              .map(buildBenefitItem).join('')}
          </ul>
        </div>
        <div class="gd-onboarding-card gd-onboarding-card--responsibilities">
          <h3 class="gd-onboarding-card-heading">⚖️ ${escapeHtml(t('onboarding.responsibilitiesTitle'))}</h3>
          <ul class="gd-onboarding-list">
            ${[t('onboarding.resp1'), t('onboarding.resp2'), t('onboarding.resp3'), t('onboarding.resp4')]
              .map(buildRespItem).join('')}
          </ul>
        </div>
      </div>

      <div class="gd-onboarding-cta-wrap">
        <button type="button" class="gd-btn gd-btn-primary gd-btn-lg" data-action="show-onboarding-modal">
          ${escapeHtml(t('onboarding.cta'))}
        </button>
        <p class="gd-onboarding-cta-note">${escapeHtml(t('onboarding.ctaNote'))}</p>
      </div>

      <div id="gd-onboarding-modal" class="gd-modal-backdrop" hidden aria-modal="true" role="dialog" aria-labelledby="gd-modal-title">
        <div class="gd-modal">
          <div class="gd-modal-header">
            <h2 id="gd-modal-title" class="gd-modal-title">📋 ${escapeHtml(t('onboarding.modalTitle'))}</h2>
            <button type="button" class="gd-modal-close-btn" data-action="hide-onboarding-modal" aria-label="${escapeHtml(t('common.close'))}">×</button>
          </div>
          <div class="gd-modal-body">
            <div class="gd-tc-scroll">
              <p>${escapeHtml(t('onboarding.tc1'))}</p>
              <p>${escapeHtml(t('onboarding.tc2'))}</p>
            </div>
            <label class="gd-checkbox-label">
              <input
                type="checkbox"
                id="gd-terms-checkbox"
                class="gd-checkbox"
                data-action="toggle-advisor-terms"
              >
              <span>${escapeHtml(t('onboarding.termsLabel'))}</span>
            </label>
          </div>
          <div class="gd-modal-footer">
            <button type="button" class="gd-btn gd-btn-ghost" data-action="hide-onboarding-modal">
              ${escapeHtml(t('common.cancel'))}
            </button>
            <button
              type="button"
              id="gd-confirm-advisor-btn"
              class="gd-btn gd-btn-primary"
              data-action="submit-advisor-activation"
              disabled
            >
              ✅ ${escapeHtml(t('onboarding.confirmBtn'))}
            </button>
          </div>
        </div>
      </div>

    </div>
  `;

  return renderDashboardAppLayout({
    activePath: '/perfil/asesor-onboarding',
    pageTitle: t('onboarding.pageTitle'),
    pageSubtitle: t('onboarding.pageSubtitle'),
    content,
    profileImage,
    profileName,
    isAsesor: false,
  });
}

import { renderDashboardAppLayout } from "../components/dashboard/dashboardAppLayout";
import { escapeHtml } from "../utils/sanitize";
import { t } from "../i18n";

function benefitItem(text) {
  return `
    <li class="gd-onboarding-list-item">
      <span class="gd-onboarding-check" aria-hidden="true">✓</span>
      <span>${escapeHtml(text)}</span>
    </li>`;
}

function respItem(text) {
  return `
    <li class="gd-onboarding-list-item">
      <span class="gd-onboarding-warn" aria-hidden="true">!</span>
      <span>${escapeHtml(text)}</span>
    </li>`;
}

export function renderAsesorOnboardingPage({ profileImage, profileName, showModal = false, termsAccepted = false }) {
  const modal = showModal ? `
    <div class="gd-modal-backdrop" data-action="hide-onboarding-modal" aria-hidden="true"></div>
    <section class="gd-modal" role="dialog" aria-modal="true" aria-labelledby="gd-onboarding-modal-title">
      <div class="gd-modal-card">
        <h3 class="gd-modal-title" id="gd-onboarding-modal-title">
          📋 ${escapeHtml(t('onboarding.modalTitle'))}
        </h3>
        <p class="gd-modal-sub">${escapeHtml(t('onboarding.tc1'))}</p>
        <p class="gd-modal-sub">${escapeHtml(t('onboarding.tc2'))}</p>
        <label class="gd-onboarding-terms-label">
          <input
            type="checkbox"
            data-action="toggle-advisor-terms"
            ${termsAccepted ? 'checked' : ''}
          >
          <span>${escapeHtml(t('onboarding.termsLabel'))}</span>
        </label>
        <div class="gd-modal-actions">
          <button type="button" class="gd-btn-secondary" data-action="hide-onboarding-modal">
            ${escapeHtml(t('common.cancel'))}
          </button>
          <button
            type="button"
            id="gd-confirm-advisor-btn"
            class="gd-btn-primary"
            data-action="submit-advisor-activation"
            ${termsAccepted ? '' : 'disabled'}
          >
            ✅ ${escapeHtml(t('onboarding.confirmBtn'))}
          </button>
        </div>
      </div>
    </section>
  ` : '';

  const content = `
    <div class="gd-onboarding">

      <div class="gd-onboarding-hero gd-card">
        <div class="gd-onboarding-hero-icon" aria-hidden="true">🏛️</div>
        <h2 class="gd-onboarding-hero-title">${escapeHtml(t('onboarding.heroTitle'))}</h2>
        <p class="gd-onboarding-hero-sub">${escapeHtml(t('onboarding.heroSubtitle'))}</p>
      </div>

      <div class="gd-onboarding-grid">
        <div class="gd-card">
          <div class="gd-card-header">
            <h3 class="gd-card-title">✨ ${escapeHtml(t('onboarding.benefitsTitle'))}</h3>
          </div>
          <ul class="gd-onboarding-list">
            ${[t('onboarding.benefit1'), t('onboarding.benefit2'), t('onboarding.benefit3'), t('onboarding.benefit4')]
              .map(benefitItem).join('')}
          </ul>
        </div>
        <div class="gd-card">
          <div class="gd-card-header">
            <h3 class="gd-card-title">⚖️ ${escapeHtml(t('onboarding.responsibilitiesTitle'))}</h3>
          </div>
          <ul class="gd-onboarding-list">
            ${[t('onboarding.resp1'), t('onboarding.resp2'), t('onboarding.resp3'), t('onboarding.resp4')]
              .map(respItem).join('')}
          </ul>
        </div>
      </div>

      <div class="gd-onboarding-cta-wrap">
        <button type="button" class="gd-btn-primary" style="padding: 0 1.5rem; height: 40px; font-size: 0.82rem;" data-action="show-onboarding-modal">
          ${escapeHtml(t('onboarding.cta'))}
        </button>
        <p class="gd-onboarding-cta-note">${escapeHtml(t('onboarding.ctaNote'))}</p>
      </div>

    </div>

    ${modal}
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

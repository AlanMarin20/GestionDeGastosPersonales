import { renderDashboardAppLayout } from "../components/dashboard/dashboardAppLayout";
import { escapeHtml } from "../utils/sanitize";
import { t } from "../i18n";

function getProfileCompletion(perfil) {
  const checkpoints = [
    Boolean(String(perfil.nombre || "").trim()),
    Boolean(String(perfil.email || "").trim()),
    Boolean(String(perfil.imagePreview || "").trim()),
    Boolean(String(perfil.passwordData?.nueva || "").trim()),
  ];

  const completed = checkpoints.filter(Boolean).length;
  return Math.round((completed / checkpoints.length) * 100);
}

function getPasswordStrength(password) {
  const value = String(password || "");
  const checks = [
    value.length >= 8,
    /[a-z]/.test(value),
    /[A-Z]/.test(value),
    /\d/.test(value),
    /[^A-Za-z\d]/.test(value),
  ];

  const score = checks.filter(Boolean).length;

  if (score >= 5) {
    return { label: t('perfil.strengthHigh'), className: "gd-risk-low", width: 100 };
  }

  if (score >= 3) {
    return { label: t('perfil.strengthMedium'), className: "gd-risk-medium", width: 64 };
  }

  if (score >= 1) {
    return { label: t('perfil.strengthLow'), className: "gd-risk-high", width: 34 };
  }

  return { label: t('perfil.strengthUndefined'), className: "gd-risk-medium", width: 0 };
}

export function renderEditarPerfilPage({
  state,
  profileImage,
  profileName,
}) {
  const perfil = state.perfil;
  const profileCompletion = getProfileCompletion(perfil);
  const passwordStrength = getPasswordStrength(perfil.passwordData?.nueva);
  const activeSession = state.configuracion?.sesiones?.[0] || null;
  const totalSessions = state.configuracion?.sesiones?.length || 0;

  const content = `
    <div class="gd-grid-2">
      <article class="gd-card gd-profile-overview">
        <div class="d-flex flex-column align-items-center text-center gap-2 mb-3">
          <div class="position-relative">
            <label for="imageInput" class="gd-profile-photo-trigger" aria-label="${t('perfil.changePhoto')}">
              <img src="${escapeHtml(perfil.imagePreview || profileImage)}" alt="${t('perfil.photoAlt')}" class="rounded-circle gd-profile-photo">
            </label>
            <label for="imageInput" class="gd-action-btn position-absolute gd-profile-photo-label">${t('perfil.photo')}</label>
            <input type="file" id="imageInput" class="d-none" accept="image/*">
          </div>
          <h2 class="gd-card-title gd-card-title-md">${escapeHtml(perfil.nombre || profileName)}</h2>
          <p class="gd-muted mb-0">${escapeHtml(perfil.email)}</p>
          <div class="gd-profile-meta">
            <span class="gd-pill gd-pill-transporte">${t('perfil.activeAccount')}</span>
            <span class="gd-pill gd-pill-supermercado">${t('perfil.sessionsCount', { count: totalSessions })}</span>
          </div>
        </div>

        <div class="gd-profile-progress">
          <div class="d-flex justify-content-between align-items-center gap-2">
            <span class="gd-muted">${t('perfil.profileCompleted')}</span>
            <strong class="gd-card-title gd-card-title-sm">${profileCompletion}%</strong>
          </div>
          <div class="gd-mini-bar mt-2">
            <div class="gd-mini-bar-fill gd-mini-bar-fill-profile" style="width: ${profileCompletion}%;"></div>
          </div>
        </div>

        <div class="gd-profile-stats mt-3">
          <div class="gd-profile-stat">
            <span class="gd-session-mini-label">${t('perfil.lastActivity')}</span>
            <strong class="gd-session-mini-value">${escapeHtml(activeSession?.fecha || t('perfil.today'))}</strong>
          </div>
          <div class="gd-profile-stat">
            <span class="gd-session-mini-label">${t('perfil.currentDevice')}</span>
            <strong class="gd-session-mini-value">${escapeHtml(activeSession?.dispositivo || t('perfil.web'))}</strong>
          </div>
        </div>
      </article>

      <article class="gd-card">
        <h2 class="gd-card-title mb-1">${t('perfil.personalInfo')}</h2>
        <p class="gd-muted mb-3">${t('perfil.personalInfoSub')}</p>

        <form id="perfilForm" class="gd-form-grid">
          <div class="gd-form-full">
            <label class="gd-form-label" for="nombre">${t('perfil.fullName')}</label>
            <input id="nombre" name="nombre" class="gd-form-input" value="${escapeHtml(perfil.nombre)}" required>
          </div>
          <div class="gd-form-full">
            <label class="gd-form-label" for="email">${t('perfil.email')}</label>
            <input id="email" name="email" type="email" class="gd-form-input" value="${escapeHtml(perfil.email)}" required>
          </div>
          <div class="gd-form-full d-flex justify-content-end mt-1">
            <button type="submit" class="gd-btn-primary">${t('perfil.saveChanges')}</button>
          </div>
        </form>

        <p class="gd-profile-inline-hint mt-3 mb-0">${t('perfil.nameTip')}</p>
      </article>
    </div>

    <div class="gd-grid-2">
      <article class="gd-card">
        <h2 class="gd-card-title mb-1">${t('perfil.accountSecurity')}</h2>
        <p class="gd-muted mb-3">${t('perfil.accountSecuritySub')}</p>

        <form id="passwordForm" class="gd-form-grid">
          <div class="gd-form-full">
            <label class="gd-form-label" for="actual">${t('perfil.currentPassword')}</label>
            <input id="actual" name="actual" type="password" class="gd-form-input" value="${escapeHtml(perfil.passwordData.actual)}">
          </div>
          <div>
            <label class="gd-form-label" for="nueva">${t('perfil.newPassword')}</label>
            <input id="nueva" name="nueva" type="password" class="gd-form-input" value="${escapeHtml(perfil.passwordData.nueva)}">
          </div>
          <div>
            <label class="gd-form-label" for="confirmar">${t('perfil.confirmPassword')}</label>
            <input id="confirmar" name="confirmar" type="password" class="gd-form-input" value="${escapeHtml(perfil.passwordData.confirmar)}">
          </div>

          <div class="gd-form-full">
            <div class="d-flex align-items-center justify-content-between gap-2">
              <span class="gd-muted">${t('perfil.strength')}</span>
              <span class="gd-risk-pill ${escapeHtml(passwordStrength.className)}">${escapeHtml(passwordStrength.label)}</span>
            </div>
            <div class="gd-mini-bar mt-2">
              <div class="gd-mini-bar-fill gd-mini-bar-fill-password" style="width: ${passwordStrength.width}%;"></div>
            </div>
          </div>

          <div class="gd-form-full d-flex justify-content-end mt-1">
            <button type="submit" class="gd-btn-primary">${t('perfil.updatePassword')}</button>
          </div>
        </form>

        <ul class="gd-policy-list mt-3">
          <li>${t('perfil.policy1')}</li>
          <li>${t('perfil.policy2')}</li>
          <li>${t('perfil.policy3')}</li>
        </ul>
      </article>

      <article class="gd-card">
        <h2 class="gd-card-title mb-1">${t('perfil.accountActivity')}</h2>
        <p class="gd-muted mb-3">${t('perfil.accountActivitySub')}</p>

        <div class="gd-session-mini-row">
          <span class="gd-session-mini-label">${t('perfil.activeSessions')}</span>
          <strong class="gd-session-mini-value">${totalSessions}</strong>
        </div>
        <div class="gd-session-mini-row">
          <span class="gd-session-mini-label">${t('perfil.recentLocation')}</span>
          <strong class="gd-session-mini-value">${escapeHtml(activeSession?.ubicacion || t('perfil.noData'))}</strong>
        </div>
        <div class="gd-session-mini-row mb-3">
          <span class="gd-session-mini-label">${t('perfil.lastAccess')}</span>
          <strong class="gd-session-mini-value">${escapeHtml(activeSession?.fecha || t('perfil.today'))}</strong>
        </div>

        <div class="d-flex flex-column gap-2">
          <a href="/perfil/notificaciones" data-link class="gd-link-btn">${t('perfil.adjustNotifications')}</a>
        </div>
      </article>
    </div>
  `;

  return renderDashboardAppLayout({
    activePath: "/perfil/editar",
    pageTitle: t('perfil.pageTitle'),
    pageSubtitle: t('perfil.pageSubtitle'),
    content,
    profileImage,
    profileName,
    notificationCount: state.finanzas?.recomendaciones?.length || 0,
  });
}

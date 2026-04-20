import { renderDashboardAppLayout } from "../components/dashboard/dashboardAppLayout";
import { escapeHtml } from "../utils/sanitize";

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
    return { label: "Alta", className: "gd-risk-low", width: 100 };
  }

  if (score >= 3) {
    return { label: "Media", className: "gd-risk-medium", width: 64 };
  }

  if (score >= 1) {
    return { label: "Baja", className: "gd-risk-high", width: 34 };
  }

  return { label: "Sin definir", className: "gd-risk-medium", width: 0 };
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
            <img src="${escapeHtml(perfil.imagePreview || profileImage)}" alt="Foto de perfil" class="rounded-circle" style="width: 124px; height: 124px; object-fit: cover; border: 2px solid rgba(59, 130, 246, 0.35);">
            <label for="imageInput" class="gd-action-btn position-absolute" style="right: -2px; bottom: 2px; height: 28px;">Foto</label>
            <input type="file" id="imageInput" class="d-none" accept="image/*">
          </div>
          <h2 class="gd-card-title" style="font-size: 1rem;">${escapeHtml(perfil.nombre || profileName)}</h2>
          <p class="gd-muted mb-0">${escapeHtml(perfil.email)}</p>
          <div class="gd-profile-meta">
            <span class="gd-pill gd-pill-transporte">Cuenta activa</span>
            <span class="gd-pill gd-pill-supermercado">${totalSessions} sesiones</span>
          </div>
        </div>

        <div class="gd-profile-progress">
          <div class="d-flex justify-content-between align-items-center gap-2">
            <span class="gd-muted">Perfil completado</span>
            <strong class="gd-card-title" style="font-size: 0.76rem;">${profileCompletion}%</strong>
          </div>
          <div class="gd-mini-bar mt-2">
            <div class="gd-mini-bar-fill" style="width: ${profileCompletion}%; background: linear-gradient(90deg, rgba(37, 99, 235, 0.9), rgba(56, 189, 248, 0.9));"></div>
          </div>
        </div>

        <div class="gd-profile-stats mt-3">
          <div class="gd-profile-stat">
            <span class="gd-session-mini-label">Ultima actividad</span>
            <strong class="gd-session-mini-value">${escapeHtml(activeSession?.fecha || "Hoy")}</strong>
          </div>
          <div class="gd-profile-stat">
            <span class="gd-session-mini-label">Dispositivo actual</span>
            <strong class="gd-session-mini-value">${escapeHtml(activeSession?.dispositivo || "Web")}</strong>
          </div>
        </div>
      </article>

      <article class="gd-card">
        <h2 class="gd-card-title mb-1">Informacion personal</h2>
        <p class="gd-muted mb-3">Estos datos se usan para identificarte en paneles y reportes.</p>

        <form id="perfilForm" class="gd-form-grid">
          <div class="gd-form-full">
            <label class="gd-form-label" for="nombre">Nombre completo</label>
            <input id="nombre" name="nombre" class="gd-form-input" value="${escapeHtml(perfil.nombre)}" required>
          </div>
          <div class="gd-form-full">
            <label class="gd-form-label" for="email">Correo electronico</label>
            <input id="email" name="email" type="email" class="gd-form-input" value="${escapeHtml(perfil.email)}" required>
          </div>
          <div class="gd-form-full d-flex justify-content-end mt-1">
            <button type="submit" class="gd-btn-primary">Guardar cambios</button>
          </div>
        </form>

        <p class="gd-profile-inline-hint mt-3 mb-0">Tip: mantener un nombre completo claro ayuda a identificar movimientos en recomendaciones y exportaciones.</p>
      </article>
    </div>

    <div class="gd-grid-2">
      <article class="gd-card">
        <h2 class="gd-card-title mb-1">Seguridad de la cuenta</h2>
        <p class="gd-muted mb-3">Actualiza tu contrasena periodicamente para mantener tu cuenta protegida.</p>

        <form id="passwordForm" class="gd-form-grid">
          <div class="gd-form-full">
            <label class="gd-form-label" for="actual">Contrasena actual</label>
            <input id="actual" name="actual" type="password" class="gd-form-input" value="${escapeHtml(perfil.passwordData.actual)}">
          </div>
          <div>
            <label class="gd-form-label" for="nueva">Nueva contrasena</label>
            <input id="nueva" name="nueva" type="password" class="gd-form-input" value="${escapeHtml(perfil.passwordData.nueva)}">
          </div>
          <div>
            <label class="gd-form-label" for="confirmar">Confirmar contrasena</label>
            <input id="confirmar" name="confirmar" type="password" class="gd-form-input" value="${escapeHtml(perfil.passwordData.confirmar)}">
          </div>

          <div class="gd-form-full">
            <div class="d-flex align-items-center justify-content-between gap-2">
              <span class="gd-muted">Fortaleza</span>
              <span class="gd-risk-pill ${escapeHtml(passwordStrength.className)}">${escapeHtml(passwordStrength.label)}</span>
            </div>
            <div class="gd-mini-bar mt-2">
              <div class="gd-mini-bar-fill" style="width: ${passwordStrength.width}%; background: linear-gradient(90deg, rgba(239, 68, 68, 0.85), rgba(56, 189, 248, 0.85));"></div>
            </div>
          </div>

          <div class="gd-form-full d-flex justify-content-end mt-1">
            <button type="submit" class="gd-btn-primary">Actualizar contrasena</button>
          </div>
        </form>

        <ul class="gd-policy-list mt-3">
          <li>Usa al menos 8 caracteres con mayuscula, minuscula, numero y simbolo.</li>
          <li>Evita reutilizar claves de otras plataformas.</li>
          <li>No compartas tu contrasena por chat o correo.</li>
        </ul>
      </article>

      <article class="gd-card">
        <h2 class="gd-card-title mb-1">Actividad de cuenta</h2>
        <p class="gd-muted mb-3">Resumen rapido de sesiones y acciones recomendadas.</p>

        <div class="gd-session-mini-row">
          <span class="gd-session-mini-label">Sesiones activas</span>
          <strong class="gd-session-mini-value">${totalSessions}</strong>
        </div>
        <div class="gd-session-mini-row">
          <span class="gd-session-mini-label">Ubicacion reciente</span>
          <strong class="gd-session-mini-value">${escapeHtml(activeSession?.ubicacion || "Sin datos")}</strong>
        </div>
        <div class="gd-session-mini-row mb-3">
          <span class="gd-session-mini-label">Ultimo acceso</span>
          <strong class="gd-session-mini-value">${escapeHtml(activeSession?.fecha || "Hoy")}</strong>
        </div>

        <div class="d-flex flex-column gap-2">
          <a href="/perfil/notificaciones" data-link class="gd-link-btn">Ajustar notificaciones</a>
        </div>
      </article>
    </div>
  `;

  return renderDashboardAppLayout({
    activePath: "/perfil/editar",
    pageTitle: "Editar perfil",
    pageSubtitle: "Actualiza tu informacion personal y seguridad",
    content,
    profileImage,
    profileName,
    notificationCount: state.finanzas?.recomendaciones?.length || 0,
  });
}

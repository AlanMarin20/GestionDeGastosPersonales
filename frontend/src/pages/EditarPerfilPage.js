import { renderDashboardAppLayout } from "../components/dashboard/dashboardAppLayout";

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function renderEditarPerfilPage({
  state,
  profileImage,
  profileName,
}) {
  const perfil = state.perfil;

  const content = `
    <div class="gd-grid-2">
      <article class="gd-card">
        <div class="d-flex flex-column align-items-center text-center gap-2">
          <div class="position-relative">
            <img src="${escapeHtml(perfil.imagePreview || profileImage)}" alt="Foto de perfil" class="rounded-circle" style="width: 124px; height: 124px; object-fit: cover; border: 2px solid rgba(59, 130, 246, 0.35);">
            <label for="imageInput" class="gd-action-btn position-absolute" style="right: -2px; bottom: 2px; height: 28px;">Foto</label>
            <input type="file" id="imageInput" class="d-none" accept="image/*">
          </div>
          <h2 class="gd-card-title" style="font-size: 1rem;">${escapeHtml(perfil.nombre || profileName)}</h2>
          <p class="gd-muted mb-0">${escapeHtml(perfil.email)}</p>
          <span class="gd-pill gd-pill-transporte">Cuenta activa</span>
        </div>
      </article>

      <article class="gd-card">
        <h2 class="gd-card-title mb-3">Informacion personal</h2>
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
      </article>
    </div>

    <article class="gd-card">
      <h2 class="gd-card-title mb-3">Seguridad de la cuenta</h2>
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
        <div class="gd-form-full d-flex justify-content-end mt-1">
          <button type="submit" class="gd-btn-primary">Actualizar contrasena</button>
        </div>
      </form>
    </article>
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

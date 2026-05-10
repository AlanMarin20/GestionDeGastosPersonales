import { renderDashboardAppLayout } from "../components/dashboard/dashboardAppLayout";
import { escapeHtml } from "../utils/sanitize";
import { formatMoney } from "../utils/money";

function resolveProgress(ahorro) {
  const meta = Number(ahorro.meta || 0);
  const monto = Number(ahorro.monto || 0);

  if (meta <= 0) {
    return null;
  }

  return Math.min((monto / meta) * 100, 100);
}

function renderEditAhorroModal({ editingAhorro }) {
  if (!editingAhorro) return "";

  return `
    <div class="gd-modal-backdrop" data-action="close-edit-ahorro-modal"></div>
    <section class="gd-modal" role="dialog" aria-modal="true" aria-label="Editar ahorro">
      <div class="gd-modal-card">
        <h3 class="gd-modal-title">Editar ahorro</h3>
        <p class="gd-modal-sub">Actualiza nombre, monto y meta del objetivo.</p>

        <div class="gd-form-grid">
          <div class="gd-form-full">
            <label class="gd-form-label" for="editAhorroNombre">Nombre</label>
            <input id="editAhorroNombre" class="gd-form-input" value="${escapeHtml(editingAhorro.nombre)}">
          </div>
          <div>
            <label class="gd-form-label" for="editAhorroMonto">Monto actual</label>
            <input id="editAhorroMonto" type="number" min="0" step="0.01" class="gd-form-input" value="${escapeHtml(String(editingAhorro.monto))}">
          </div>
          <div>
            <label class="gd-form-label" for="editAhorroMeta">Meta (opcional)</label>
            <input id="editAhorroMeta" type="number" min="0" step="0.01" class="gd-form-input" value="${escapeHtml(String(editingAhorro.meta ?? ""))}">
          </div>
        </div>

        <div class="gd-modal-actions">
          <button type="button" class="gd-btn-secondary" data-action="close-edit-ahorro-modal">Cancelar</button>
          <button type="button" class="gd-btn-primary" data-action="save-edit-ahorro" data-ahorro-id="${escapeHtml(editingAhorro.id)}">Guardar cambios</button>
        </div>
      </div>
    </section>
  `;
}

function renderDeleteAhorroModal({ deletingAhorro }) {
  if (!deletingAhorro) return "";

  return `
    <div class="gd-modal-backdrop" data-action="close-delete-ahorro-modal"></div>
    <section class="gd-modal" role="dialog" aria-modal="true" aria-label="Eliminar ahorro">
      <div class="gd-modal-card">
        <h3 class="gd-modal-title">Eliminar ahorro</h3>
        <p class="gd-modal-sub">Esta accion eliminara el objetivo "${escapeHtml(deletingAhorro.nombre)}" con ${escapeHtml(formatMoney(deletingAhorro.monto))} acumulado.</p>
        <div class="gd-modal-actions">
          <button type="button" class="gd-btn-secondary" data-action="close-delete-ahorro-modal">Cancelar</button>
          <button type="button" class="gd-btn-danger" data-action="confirm-delete-ahorro" data-ahorro-id="${escapeHtml(deletingAhorro.id)}">Eliminar</button>
        </div>
      </div>
    </section>
  `;
}

export function renderDetalleAhorrosPage({
  profileImage,
  profileName,
  activePath,
  pageTitle,
  pageSubtitle,
  ahorros,
  editingAhorro,
  deletingAhorro,
}) {
  const content = `
    <article class="gd-card">
      <header class="gd-card-header">
        <h2 class="gd-card-title">Todos los ahorros</h2>
      </header>

      <div class="gd-list">
        ${ahorros.length === 0
          ? '<p class="gd-empty mb-0">Todavia no creaste objetivos de ahorro.</p>'
          : ahorros
              .map((ahorro) => {
                const progress = resolveProgress(ahorro);
                const hasGoal = progress !== null;

                return `
                  <div class="gd-list-item">
                    <div class="gd-list-item-main">
                      <p class="gd-list-item-title">${escapeHtml(ahorro.nombre)}</p>
                      <p class="gd-list-item-sub">${hasGoal ? `Meta: ${escapeHtml(formatMoney(ahorro.meta))}` : "Sin meta configurada"}</p>
                    </div>
                    <div class="gd-list-item-aside">
                      <p class="gd-list-item-amount">${escapeHtml(formatMoney(ahorro.monto))}</p>
                      <p class="gd-list-item-sub">${hasGoal ? `${escapeHtml(progress.toFixed(1))}%` : ""}</p>
                    </div>
                    <div class="gd-action-cell">
                      <button type="button" class="gd-action-btn" data-action="open-edit-ahorro" data-ahorro-id="${escapeHtml(ahorro.id)}" aria-label="Editar ahorro">Editar</button>
                      <button type="button" class="gd-action-btn danger" data-action="open-delete-ahorro" data-ahorro-id="${escapeHtml(ahorro.id)}" aria-label="Eliminar ahorro">🗑</button>
                    </div>
                  </div>
                `;
              })
              .join("")}
      </div>
    </article>

    <article class="gd-card">
      <header class="gd-card-header">
        <h2 class="gd-card-title">Crear nuevo ahorro</h2>
      </header>

      <form id="detalleAhorroForm" class="gd-form-grid">
        <div>
          <label class="gd-form-label" for="detalleAhorroNombre">Nombre</label>
          <input id="detalleAhorroNombre" class="gd-form-input" placeholder="Ej: Fondo de emergencia" required>
        </div>
        <div>
          <label class="gd-form-label" for="detalleAhorroMonto">Monto inicial</label>
          <input id="detalleAhorroMonto" type="number" min="0" step="0.01" class="gd-form-input" placeholder="0.00">
        </div>
        <div>
          <label class="gd-form-label" for="detalleAhorroMeta">Meta (opcional)</label>
          <input id="detalleAhorroMeta" type="number" min="0" step="0.01" class="gd-form-input" placeholder="0.00">
        </div>
        <div class="gd-form-full d-flex justify-content-end">
          <button type="submit" class="gd-btn-primary">Agregar ahorro</button>
        </div>
      </form>
    </article>

    ${renderEditAhorroModal({ editingAhorro })}
    ${renderDeleteAhorroModal({ deletingAhorro })}
  `;

  return renderDashboardAppLayout({
    activePath,
    pageTitle,
    pageSubtitle,
    content,
    profileImage,
    profileName,
    notificationCount: 3,
  });
}

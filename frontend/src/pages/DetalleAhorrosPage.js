import { renderDashboardAppLayout } from "../components/dashboard/dashboardAppLayout";
import { escapeHtml } from "../utils/sanitize";

function resolveProgress(ahorro) {
  const meta = Number(ahorro.meta || 0);
  const monto = Number(ahorro.monto || 0);

  if (meta <= 0) {
    return null;
  }

  return Math.min((monto / meta) * 100, 100);
}

export function renderDetalleAhorrosPage({
  profileImage,
  profileName,
  activePath,
  pageTitle,
  pageSubtitle,
  ahorros,
  formatMoney,
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

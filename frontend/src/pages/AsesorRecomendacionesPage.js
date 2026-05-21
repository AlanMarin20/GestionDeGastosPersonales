import { renderDashboardAppLayout } from "../components/dashboard/dashboardAppLayout";
import { escapeHtml } from "../utils/sanitize";
import { t } from "../i18n";

function formatDate(dateStr) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function renderClientOptions(clients) {
  if (!clients.length) return `<option value="">${t('asesorRec.noClients')}</option>`;
  return `
    <option value="">${t('asesorRec.selectClient')}</option>
    ${clients.map((c) => `<option value="${escapeHtml(c.id)}">${escapeHtml(c.nombre)}</option>`).join("")}
  `;
}

function renderHistory(recommendations) {
  if (!recommendations.length) {
    return `<p class="gd-empty">${t('asesorRec.noRecs')}</p>`;
  }

  return recommendations.map((r) => `
    <article class="gd-rec-advisory-item">
      <div class="gd-rec-advisory-meta">
        <span class="gd-rec-advisory-client">${escapeHtml(r.clienteNombre)}</span>
        <span class="gd-rec-advisory-date">${escapeHtml(formatDate(r.fecha))}</span>
      </div>
      ${r.titulo ? `<p class="gd-rec-advisory-title">${escapeHtml(r.titulo)}</p>` : ""}
      <p class="gd-rec-advisory-body">${escapeHtml(r.texto.length > 120 ? r.texto.slice(0, 120) + "…" : r.texto)}</p>
    </article>
  `).join("");
}

export function renderAsesorRecomendacionesPage({
  profileImage,
  profileName,
  activePath,
  pageTitle,
  pageSubtitle,
  clients,
  recommendations,
}) {
  const hasClients = clients.length > 0;

  const content = `
    <div class="row g-3 align-items-start">
      <div class="col-12 col-xl-5">
        <article class="gd-card">
          <header class="gd-card-header">
            <h2 class="gd-card-title">${t('asesorRec.newRec')}</h2>
          </header>
          <p class="gd-muted mb-3">${t('asesorRec.newRecSub')}</p>

          ${hasClients ? `
            <form id="advisorGlobalRecomendacionForm">
              <div class="gd-form-grid">
                <div class="gd-form-full">
                  <label class="gd-form-label" for="recClienteId">${t('asesorRec.selectClient')}</label>
                  <select id="recClienteId" class="gd-form-input" required>
                    ${renderClientOptions(clients)}
                  </select>
                </div>
                <div class="gd-form-full">
                  <label class="gd-form-label" for="recTitulo">${t('asesorRec.title')}</label>
                  <input id="recTitulo" class="gd-form-input" type="text" maxlength="80" placeholder="Ej. Revisá tu presupuesto de Alimentación">
                </div>
                <div class="gd-form-full">
                  <label class="gd-form-label" for="recTexto">${t('asesorRec.message')}</label>
                  <textarea id="recTexto" class="gd-form-input gd-textarea" rows="5" required placeholder="Escribí tu recomendación..."></textarea>
                </div>
              </div>
              <div class="d-flex justify-content-end mt-3">
                <button type="submit" class="gd-btn-primary">${t('asesorRec.send')}</button>
              </div>
            </form>
          ` : `
            <div class="gd-settings-advisor-empty">
              <i class="lni lni-users fs-1"></i>
              <p class="mb-0 fw-semibold">${t('asesorRec.noClients')}</p>
            </div>
          `}
        </article>
      </div>

      <div class="col-12 col-xl-7">
        <article class="gd-card">
          <header class="gd-card-header">
            <h2 class="gd-card-title">${t('asesorRec.history')}</h2>
          </header>
          <div class="gd-rec-advisory-list">
            ${renderHistory(recommendations)}
          </div>
        </article>
      </div>
    </div>
  `;

  return renderDashboardAppLayout({
    activePath,
    pageTitle,
    pageSubtitle,
    content,
    profileImage,
    profileName,
    isAsesor: true,
  });
}

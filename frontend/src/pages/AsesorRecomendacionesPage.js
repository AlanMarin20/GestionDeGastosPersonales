import { renderDashboardAppLayout } from "../components/dashboard/dashboardAppLayout";
import { escapeHtml } from "../utils/sanitize";
import { renderClientBanner } from "../components/common/reusablePageComponents";
import { t } from "../i18n";

const RISK_CONFIG = {
  low: {
    labelKey: 'asesor.riskLow',
    className: 'gd-risk-low',
    bannerStart: 'rgba(22, 163, 74, 0.34)',
    bannerEnd: 'rgba(21, 128, 61, 0.92)',
    bannerBorder: '#16a34a',
    bannerAccent: '#16a34a',
    bannerLabel: '#bbf7d0',
  },
  medium: {
    labelKey: 'asesor.riskMedium',
    className: 'gd-risk-medium',
    bannerStart: 'rgba(202, 138, 4, 0.34)',
    bannerEnd: 'rgba(146, 64, 14, 0.92)',
    bannerBorder: '#ca8a04',
    bannerAccent: '#ca8a04',
    bannerLabel: '#fde68a',
  },
  high: {
    labelKey: 'asesor.riskHigh',
    className: 'gd-risk-high',
    bannerStart: 'rgba(220, 38, 38, 0.34)',
    bannerEnd: 'rgba(127, 29, 29, 0.92)',
    bannerBorder: '#dc2626',
    bannerAccent: '#dc2626',
    bannerLabel: '#fecaca',
  },
};

function getClientRisk(cliente) {
  const presupuesto = Number(cliente?.presupuesto ?? 0);
  const gastadoMes = Number(cliente?.gastosMes ?? cliente?.monthlySpend ?? 0);
  const ratio = presupuesto > 0 ? (gastadoMes / presupuesto) * 100 : 0;

  if (ratio >= 95) return RISK_CONFIG.high;
  if (ratio > 90) return RISK_CONFIG.medium;
  return RISK_CONFIG.low;
}

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

function renderHistory(recommendations) {
  if (!recommendations.length) {
    return `<p class="gd-empty">${t('asesorRec.noRecs')}</p>`;
  }

  return recommendations.map((r) => `
    <article class="gd-rec-advisory-item">
      <div class="gd-rec-advisory-meta">
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
  selectedClientId,
}) {
  const normalizedSelectedClientId = String(selectedClientId || "");
  const targetClient = clients.find((client) => String(client.id) === normalizedSelectedClientId) || null;
  const targetClientName = targetClient?.nombre || t('asesorRec.selectClient');
  const targetClientRisk = targetClient ? getClientRisk(targetClient) : null;
  const targetClientHref = targetClient
    ? `/cliente/${encodeURIComponent(String(targetClient.id))}`
    : "/dashboard/asesor";

  // Filtrar recomendaciones para mostrar solo las del cliente seleccionado
  const clientRecommendations = normalizedSelectedClientId
    ? recommendations.filter((r) => String(r.clienteId) === normalizedSelectedClientId)
    : [];

  const content = `
    ${renderClientBanner({
      clienteName: targetClientName,
      risk: targetClientRisk,
      backHref: targetClientHref,
      backLabel: 'Volver',
    })}

    <div class="row g-3 align-items-start">
      <div class="col-12 col-xl-5">
        <article class="gd-card">
          <header class="gd-card-header">
            <h2 class="gd-card-title">${t('asesorRec.newRec')}</h2>
          </header>
          <form id="advisorGlobalRecomendacionForm">
            <div class="gd-form-grid">
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
        </article>
      </div>

      <div class="col-12 col-xl-7">
        <article class="gd-card">
          <header class="gd-card-header">
            <h2 class="gd-card-title">${t('asesorRec.history')}</h2>
          </header>
          <div class="gd-rec-advisory-list">
            ${renderHistory(clientRecommendations)}
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

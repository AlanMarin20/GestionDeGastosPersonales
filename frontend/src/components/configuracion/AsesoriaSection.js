import { escapeHtml } from "../../utils/sanitize";
import { t } from "../../i18n";

function getAdvisorInitials(name) {
  const words = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "AS";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function renderProxBadge() {
  return `<span class="gd-settings-prox-badge">${t('config.comingSoon')}</span>`;
}

export function renderAsesoriaSection({ activeSection, config }) {
  const advisorLink = config.asesoria?.asesor || null;
  const advisorRequest = config.asesoria?.solicitud || {};
  const advisorName = String(advisorLink?.nombre || "").trim();
  const advisorEmail = String(advisorLink?.email || "").trim();
  const advisorSpecialty = String(advisorLink?.especialidad || "").trim();
  const advisorCode = String(advisorLink?.codigoVerificacion || "").trim();
  const advisorInitials = getAdvisorInitials(advisorName);
  const advisorHasProfile = Boolean(advisorLink);

  return `
    <!-- ASESORIA -->
    <section id="config-section-asesoria" class="gd-settings-panel ${activeSection === "asesoria" ? "active" : ""}" data-config-section="asesoria" ${activeSection === "asesoria" ? "" : "hidden"}>
      <div class="row g-3 align-items-stretch">
        <div class="col-12 col-xl-6">
          <article class="gd-card h-100">
            <h2 class="gd-card-title mb-1">${t('config.addAdvisor')}</h2>
            <p class="gd-muted mb-3">${t('config.addAdvisorSub')}</p>

            <form id="agregarAsesorForm">
              <div class="gd-form-grid">
                <div>
                  <label class="gd-form-label" for="asesorNombre">${t('config.advisorName')}</label>
                  <input id="asesorNombre" class="gd-form-input" value="${escapeHtml(String(advisorRequest.nombre || ""))}" placeholder="${t('config.placeholderAdvisorName')}" required>
                </div>
                <div>
                  <label class="gd-form-label" for="asesorEmail">${t('config.advisorEmail')}</label>
                  <input id="asesorEmail" type="email" class="gd-form-input" value="${escapeHtml(String(advisorRequest.email || ""))}" placeholder="${t('config.placeholderAdvisorEmail')}" required>
                </div>
                <div class="gd-form-full">
                  <label class="gd-form-label" for="asesorEspecialidad">${t('config.specialty')} <span class="gd-form-optional">${t('common.optional')}</span></label>
                  <input id="asesorEspecialidad" class="gd-form-input" value="${escapeHtml(String(advisorRequest.especialidad || ""))}" placeholder="${t('config.placeholderSpecialty')}">
                </div>
              </div>
              <div class="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-2 mt-3">
                <small class="gd-muted">${t('config.advisorCodeHint')}</small>
                <button type="submit" class="gd-btn-primary">${t('config.generateCode')}</button>
              </div>
            </form>
          </article>
        </div>

        <div class="col-12 col-xl-6">
          <article class="gd-card h-100">
            <div class="d-flex align-items-start justify-content-between gap-2 mb-3">
              <div>
                <h2 class="gd-card-title mb-1">${t('config.advisorProfile')}</h2>
                <p class="gd-muted mb-0">${advisorHasProfile ? t('config.advisorProfileLinked') : t('config.advisorProfileEmpty')}</p>
              </div>
              ${advisorHasProfile
                ? `<button type="button" class="gd-ahorro-ctrl-btn gd-ahorro-ctrl-btn--danger" data-action="desvincular-asesor" aria-label="${t('config.unlinkAdvisor')}">
                     <i class="lni lni-close" aria-hidden="true"></i>
                   </button>`
                : ""}
            </div>

            ${advisorHasProfile
              ? `<div class="gd-settings-advisor-profile">
                   <div class="gd-settings-advisor-avatar">${escapeHtml(advisorInitials)}</div>
                   <div class="gd-settings-advisor-copy">
                     <p class="gd-settings-session-title mb-1">${escapeHtml(advisorName)}</p>
                     <p class="gd-settings-session-sub mb-1">${escapeHtml(advisorEmail)}</p>
                     <p class="gd-settings-session-sub mb-0">${escapeHtml(advisorSpecialty || t('config.noSpecialty'))}</p>
                   </div>
                 </div>
                 <div class="gd-settings-advisor-code-box mt-3">
                   <span class="gd-muted d-block mb-1">${t('config.verificationCode')}</span>
                   <strong class="gd-settings-advisor-code">${escapeHtml(advisorCode || t('config.codePending'))}</strong>
                   <p class="gd-muted mb-0 mt-2">${t('config.advisorMustEnterCode')}</p>
                 </div>
                 <div class="gd-settings-advisor-meta mt-3">
                   <span class="gd-settings-category-pill">${t('config.linked')}</span>
                   <span class="gd-settings-advisor-meta-text">${t('config.linkActive')}</span>
                 </div>`
              : `<div class="gd-settings-advisor-empty">
                   <i class="lni lni-user fs-1"></i>
                   <p class="mb-1 fw-semibold">${t('config.noAdvisorLinked')}</p>
                   <p class="gd-muted mb-0">${t('config.noAdvisorLinkedSub')}</p>
                 </div>`
            }
          </article>
        </div>
      </div>
    </section>
  `;
}

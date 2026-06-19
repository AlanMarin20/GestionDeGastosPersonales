import { renderDashboardAppLayout } from "../components/dashboard/dashboardAppLayout";
import { escapeHtml } from "../utils/sanitize";
import { formatMoney } from "../utils/money";
import { t } from '../i18n';
import { state } from "../state";

const SOURCE_CONFIG = {
  asesor: { labelKey: 'rec.sourceAdvisor', className: "gd-rec-source-asesor", iconClass: "lni lni-user" },
  ia:     { labelKey: 'rec.sourceIa',      className: "gd-rec-source-ia",     iconClass: "lni lni-bolt-alt" },
};

const SEVERITY_CONFIG = {
  danger:  { className: "gd-rec-severity-danger" },
  warning: { className: "gd-rec-severity-warning" },
  good:    { className: "gd-rec-severity-good" },
  info:    { className: "gd-rec-severity-info" },
};

const CATEGORY_ICON_MAP = {
  Transporte:    "lni lni-car-alt",
  Combustible:   "lni lni-car-alt",
  Entretenimiento: "lni lni-game",
  Salud:         "lni lni-heart",
  Servicios:     "lni lni-plug",
  Ahorros:       "lni lni-investment",
  Habitos:       "lni lni-reload",
  Deudas:        "lni lni-credit-cards",
  Viajes:        "lni lni-plane",
  Electronica:   "lni lni-laptop",
  Alimentos:     "lni lni-fresh-juice",
  Comida:        "lni lni-pizza",
  Restaurantes:  "lni lni-pizza",
  Presupuesto:   "lni lni-bar-chart",
};

function sortRecommendationsByDateDesc(recomendaciones = []) {
  return [...recomendaciones].sort((a, b) => {
    const dateCompare = String(b.date || "").localeCompare(String(a.date || ""));
    if (dateCompare !== 0) return dateCompare;
    return String(b.id || "").localeCompare(String(a.id || ""));
  });
}

function getCurrentMonthKey() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${now.getFullYear()}-${month}`;
}

function getRecommendationMonthKey(value) {
  return String(value || "").slice(0, 7);
}

function capitalizeFirstLetter(text) {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

function formatRecommendationDate(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";

  const date = new Date(`${raw}T00:00:00`);
  if (Number.isNaN(date.getTime())) return raw;

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function buildMonthOptions(recomendaciones = []) {
  const monthSet = new Set([getCurrentMonthKey()]);

  recomendaciones.forEach((item) => {
    const monthKey = getRecommendationMonthKey(item.date);
    if (monthKey) {
      monthSet.add(monthKey);
    }
  });

  return [...monthSet]
    .sort((a, b) => String(b).localeCompare(String(a)))
    .map((monthKey) => {
      const date = new Date(`${monthKey}-01T00:00:00`);
      const label = Number.isNaN(date.getTime())
        ? monthKey
        : capitalizeFirstLetter(
          new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric" }).format(date),
        );

      return { value: monthKey, label };
    });
}

function extractPct(text) {
  const m = text.match(/(\d+(?:\.\d+)?)%/);
  return m ? Number(m[1]) : null;
}

function extractMultiplier(text) {
  const m = text.match(/(\d+(?:\.\d+)?)x(?:\s|$)/i);
  return m ? Number(m[1]) : null;
}

function extractLargeNumber(text) {
  const all = [...text.matchAll(/\b(\d{3,})\b/g)].map((m) => Number(m[1]));
  return all.length > 0 ? Math.max(...all) : null;
}

function buildVisualElement(item) {
  const body = item.body || "";
  const severity = String(item.severity || "info").toLowerCase();

  if (severity === "danger") {
    const mult = extractMultiplier(body);
    if (mult !== null && mult > 1) {
      const normalWidth = Math.max(Math.min((1 / mult) * 100, 95), 8);
      return `
        <div class="gd-rec-visual" aria-label="${t('rec.compareLabel')}">
          <div class="gd-rec-ratio-wrap">
            <div class="gd-rec-ratio-row">
              <span class="gd-rec-ratio-label">${t('rec.average')}</span>
              <div class="gd-rec-ratio-bar gd-rec-ratio-normal" style="width: ${escapeHtml(normalWidth.toFixed(1))}%"></div>
            </div>
            <div class="gd-rec-ratio-row">
              <span class="gd-rec-ratio-label">${t('rec.thisMonth')}</span>
              <div class="gd-rec-ratio-bar gd-rec-ratio-excess" style="width: 100%">
                <span class="gd-rec-ratio-badge">${escapeHtml(mult.toFixed(1))}x</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }
  }

  if (severity === "warning") {
    const pct = extractPct(body);
    if (pct !== null && pct >= 0 && pct <= 110) {
      const clampedPct = Math.min(pct, 100);
      return `
        <div class="gd-rec-visual" aria-label="${t('rec.budgetUsedLabel')}">
          <div class="gd-rec-progress-bar" role="progressbar" aria-valuenow="${escapeHtml(String(clampedPct))}" aria-valuemin="0" aria-valuemax="100">
            <div class="gd-rec-progress-fill gd-rec-progress-warning" style="width: ${escapeHtml(clampedPct.toFixed(1))}%"></div>
          </div>
          <span class="gd-rec-progress-label">${t('rec.budgetUsed', { pct: pct.toFixed(0) })}</span>
        </div>
      `;
    }
  }

  if (severity === "good") {
    return `
      <div class="gd-rec-visual">
        <div class="gd-rec-achievement">
          <i class="lni lni-checkmark-circle gd-rec-achievement-icon" aria-hidden="true"></i>
          <span class="gd-rec-achievement-label">${t('rec.objectiveAchievedPeriod')}</span>
        </div>
      </div>
    `;
  }

  if (severity === "info") {
    const amount = extractLargeNumber(body);
    if (amount !== null && amount >= 100) {
      return `
        <div class="gd-rec-visual">
          <div class="gd-rec-savings-chip">
            <i class="lni lni-coin" aria-hidden="true"></i>
            <span>${t('rec.potentialSaving', { amount: escapeHtml(formatMoney(amount)) })}</span>
          </div>
        </div>
      `;
    }
  }

  return "";
}

function renderRecommendationCard(item) {
  const sourceRaw = String(item.source || "").trim().toLowerCase();
  const source = sourceRaw === "ia" ? SOURCE_CONFIG.ia : SOURCE_CONFIG.asesor;
  const severityKey = String(item.severity || "info").toLowerCase();
  const sev = SEVERITY_CONFIG[severityKey] || SEVERITY_CONFIG.info;
  const catKey = Object.keys(CATEGORY_ICON_MAP).find(
    (k) => k.toLowerCase() === String(item.category || "").toLowerCase(),
  );
  const catIcon = catKey ? CATEGORY_ICON_MAP[catKey] : "lni lni-tag";
  const visual = buildVisualElement(item);

  return `
    <article class="gd-rec-card ${escapeHtml(sev.className)}" aria-label="${escapeHtml(item.title || "")}">
      <header class="gd-rec-head">
        <span class="gd-rec-cat-icon gd-rec-cat-${escapeHtml(severityKey)}" aria-hidden="true">
          <i class="${escapeHtml(catIcon)}"></i>
        </span>
        <h2 class="gd-rec-title">${escapeHtml(item.title || "")}</h2>
        <span class="gd-rec-type ${escapeHtml(source.className)}">
          <i class="${escapeHtml(source.iconClass)}" aria-hidden="true"></i>
          ${escapeHtml(t(source.labelKey))}
        </span>
      </header>

      <p class="gd-rec-body">${escapeHtml(item.body || "")}</p>

      ${visual}

      <div class="gd-rec-meta">
        ${item.date ? `<span class="gd-rec-tag">${escapeHtml(formatRecommendationDate(item.date))}</span>` : ""}
        ${item.category ? `<span class="gd-rec-tag">${escapeHtml(item.category)}</span>` : ""}
      </div>
    </article>
  `;
}

export function renderRecomendacionesPage({
  profileImage,
  profileName,
  activePath,
  pageTitle,
  pageSubtitle,
  recomendaciones,
  isAsesor = false,
}) {
  const currentMonthKey = getCurrentMonthKey();
  const selectedMonthKey = state.finanzas.recomendacionesFiltroMesKey || currentMonthKey;
  const showAll = selectedMonthKey === "all";
  const monthOptions = buildMonthOptions(recomendaciones);
  const filteredRecommendations = showAll
    ? recomendaciones
    : recomendaciones.filter((item) => getRecommendationMonthKey(item.date) === selectedMonthKey);
  const orderedRecommendations = sortRecommendationsByDateDesc(filteredRecommendations);
  const selectedMonthLabel = showAll
    ? "Ver todo"
    : (monthOptions.find((option) => option.value === selectedMonthKey)?.label || "Mes actual");

  const dangerCount = orderedRecommendations.filter((r) => r.severity === "danger").length;
  const warningCount = orderedRecommendations.filter((r) => r.severity === "warning").length;

  const dangerLabel = dangerCount !== 1
    ? t('rec.alerts', { count: dangerCount })
    : t('rec.alertsOne', { count: dangerCount });
  const warningLabel = warningCount !== 1
    ? t('rec.warningsCount', { count: warningCount })
    : t('rec.warningsCountOne', { count: warningCount });

  const content = `
    <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
      <div class="d-flex gap-2 flex-wrap">
        ${dangerCount > 0 ? `<span class="gd-rec-badge gd-rec-badge-danger"><i class="lni lni-alarm"></i> ${escapeHtml(dangerLabel)}</span>` : ""}
        ${warningCount > 0 ? `<span class="gd-rec-badge gd-rec-badge-warning"><i class="lni lni-warning"></i> ${escapeHtml(warningLabel)}</span>` : ""}
        ${dangerCount === 0 && warningCount === 0 && orderedRecommendations.length > 0 ? `<span class="gd-rec-badge gd-rec-badge-good"><i class="lni lni-checkmark-circle"></i> ${t('rec.allInOrder')}</span>` : ""}
      </div>
      <div class="d-flex gap-2 flex-wrap align-items-center">
        <button id="regenerateAiRecsBtn" class="gd-btn-primary d-flex align-items-center gap-2" style="height: 38px; border-radius: 8px; font-size: 0.85rem; padding: 0 1.2rem;">
          <i class="lni lni-bolt-alt"></i>
          <span>${t('rec.analyzeWithAI')}</span>
        </button>
        <div style="min-width: 200px;">
          <select id="recMonthFilterSelect" class="gd-form-select" aria-label="Filtrar recomendaciones por mes" style="height: 38px;">
            <option value="all" ${showAll ? "selected" : ""}>Ver todo</option>
            ${monthOptions.map((option) => `
              <option value="${escapeHtml(option.value)}" ${option.value === selectedMonthKey ? "selected" : ""}>
                ${escapeHtml(option.label)}
              </option>
            `).join("")}
          </select>
        </div>
      </div>
    </div>

    ${orderedRecommendations.length > 0
      ? orderedRecommendations.map(renderRecommendationCard).join("")
      : `
        <div class="gd-card">
          <div class="gd-card-body" style="padding: 2rem; text-align: center;">
            <i class="lni lni-checkmark-circle" style="font-size: 2rem; color: #16a34a; display: block; margin-bottom: 0.5rem;"></i>
            <p class="gd-muted mb-0">${t('rec.noRecentRecommendations')}</p>
          </div>
        </div>
      `
    }
  `;

  return renderDashboardAppLayout({
    activePath,
    pageTitle,
    pageSubtitle,
    content,
    profileImage,
    profileName,
    isAsesor,
    notificationCount: dangerCount + warningCount,
  });
}

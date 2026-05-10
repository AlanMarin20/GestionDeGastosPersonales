import { renderDashboardAppLayout } from "../components/dashboard/dashboardAppLayout";
import { escapeHtml } from "../utils/sanitize";
import { formatMoney } from "../utils/money";

const SOURCE_CONFIG = {
  asesor: { label: "Asesor", className: "gd-rec-source-asesor", iconClass: "lni lni-user" },
  ia:     { label: "IA",     className: "gd-rec-source-ia",     iconClass: "lni lni-bolt-alt" },
};

const SEVERITY_CONFIG = {
  danger:  { className: "gd-rec-severity-danger",  badgeClass: "gd-rec-badge-danger",  badgeLabel: "Alerta critica", impactLabel: "Impacto alto" },
  warning: { className: "gd-rec-severity-warning", badgeClass: "gd-rec-badge-warning", badgeLabel: "Revision",       impactLabel: "Impacto medio" },
  good:    { className: "gd-rec-severity-good",    badgeClass: "gd-rec-badge-good",    badgeLabel: "Logro",          impactLabel: "Positivo" },
  info:    { className: "gd-rec-severity-info",    badgeClass: "gd-rec-badge-info",    badgeLabel: "Sugerencia",     impactLabel: "Impacto medio" },
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

const MONTH_INDEX_BY_NAME = {
  ene: 0, enero: 0, feb: 1, febrero: 1, mar: 2, marzo: 2,
  abr: 3, abril: 3, may: 4, mayo: 4, jun: 5, junio: 5,
  jul: 6, julio: 6, ago: 7, agosto: 7, sep: 8, septiembre: 8,
  set: 8, oct: 9, octubre: 9, nov: 10, noviembre: 10, dic: 11, diciembre: 11,
};

function padMonth(v) { return String(v).padStart(2, "0"); }

function getMonthIndex(token) {
  if (!token) return null;
  const n = token.toLowerCase().replace(/\./g, "");
  if (Object.prototype.hasOwnProperty.call(MONTH_INDEX_BY_NAME, n)) return MONTH_INDEX_BY_NAME[n];
  const s = n.slice(0, 3);
  return Object.prototype.hasOwnProperty.call(MONTH_INDEX_BY_NAME, s) ? MONTH_INDEX_BY_NAME[s] : null;
}

function parseRecommendationDate(value) {
  const fallbackYear = new Date().getFullYear();
  const raw = String(value || "").trim();
  if (!raw) return null;

  const isoMatch = raw.match(/(\d{4})-(\d{2})(?:-(\d{2}))?/);
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const monthIndex = Number(isoMatch[2]) - 1;
    const day = isoMatch[3] ? Number(isoMatch[3]) : 1;
    return { year, monthIndex, day, monthKey: `${year}-${padMonth(monthIndex + 1)}`, sortKey: year * 10000 + (monthIndex + 1) * 100 + day };
  }

  const tokens = raw.toLowerCase().replace(/[.,]/g, " ").split(/\s+/).filter(Boolean);
  if (!tokens.length) return null;
  const yearToken = tokens.find((t) => /^\d{4}$/.test(t));
  const year = yearToken ? Number(yearToken) : fallbackYear;
  const monthIndex = tokens.map((t) => getMonthIndex(t)).find((i) => i !== null);
  if (monthIndex === undefined || monthIndex === null) return null;
  const pos = tokens.findIndex((t) => getMonthIndex(t) === monthIndex);
  const prev = tokens[pos - 1];
  const next = tokens[pos + 1];
  const dayToken = /^\d{1,2}$/.test(prev) ? prev : /^\d{1,2}$/.test(next) ? next : "1";
  return { year, monthIndex, day: Number(dayToken), monthKey: `${year}-${padMonth(monthIndex + 1)}`, sortKey: year * 10000 + (monthIndex + 1) * 100 + Number(dayToken) };
}

function getLatestMonthRecommendations(recomendaciones) {
  const parsed = (recomendaciones || [])
    .map((item, index) => ({ item, index, parsedDate: parseRecommendationDate(item.date) }))
    .filter(({ parsedDate }) => Boolean(parsedDate));

  if (!parsed.length) return [];

  const latestMonthKey = parsed.reduce((key, entry) =>
    !key || entry.parsedDate.monthKey > key ? entry.parsedDate.monthKey : key, "");

  return parsed
    .filter(({ parsedDate }) => parsedDate.monthKey === latestMonthKey)
    .sort((a, b) => b.parsedDate.sortKey - a.parsedDate.sortKey || b.index - a.index)
    .map(({ item }) => item);
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
        <div class="gd-rec-visual" aria-label="Comparacion de gasto vs promedio">
          <div class="gd-rec-ratio-wrap">
            <div class="gd-rec-ratio-row">
              <span class="gd-rec-ratio-label">Promedio</span>
              <div class="gd-rec-ratio-bar gd-rec-ratio-normal" style="width: ${escapeHtml(normalWidth.toFixed(1))}%"></div>
            </div>
            <div class="gd-rec-ratio-row">
              <span class="gd-rec-ratio-label">Este mes</span>
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
        <div class="gd-rec-visual" aria-label="Porcentaje de presupuesto utilizado">
          <div class="gd-rec-progress-bar" role="progressbar" aria-valuenow="${escapeHtml(String(clampedPct))}" aria-valuemin="0" aria-valuemax="100">
            <div class="gd-rec-progress-fill gd-rec-progress-warning" style="width: ${escapeHtml(clampedPct.toFixed(1))}%"></div>
          </div>
          <span class="gd-rec-progress-label">${escapeHtml(pct.toFixed(0))}% del presupuesto utilizado</span>
        </div>
      `;
    }
  }

  if (severity === "good") {
    return `
      <div class="gd-rec-visual">
        <div class="gd-rec-achievement">
          <i class="lni lni-checkmark-circle gd-rec-achievement-icon" aria-hidden="true"></i>
          <span class="gd-rec-achievement-label">Objetivo cumplido este periodo</span>
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
            <span>Ahorro potencial: ${escapeHtml(formatMoney(amount))}/mes</span>
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
        <span class="gd-rec-badge ${escapeHtml(sev.badgeClass)}">${escapeHtml(sev.badgeLabel)}</span>
        <span class="gd-rec-type ${escapeHtml(source.className)}">
          <i class="${escapeHtml(source.iconClass)}" aria-hidden="true"></i>
          ${escapeHtml(source.label)}
        </span>
      </header>

      <p class="gd-rec-body">${escapeHtml(item.body || "")}</p>

      ${visual}

      <div class="gd-rec-meta">
        <span class="gd-rec-impact">${escapeHtml(sev.impactLabel)}</span>
        ${item.date ? `<span class="gd-rec-tag">${escapeHtml(item.date)}</span>` : ""}
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
  const latestMonthRecommendations = getLatestMonthRecommendations(recomendaciones);

  const dangerCount = latestMonthRecommendations.filter((r) => r.severity === "danger").length;
  const warningCount = latestMonthRecommendations.filter((r) => r.severity === "warning").length;

  const content = `
    <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
      <div class="d-flex gap-2 flex-wrap">
        ${dangerCount > 0 ? `<span class="gd-rec-badge gd-rec-badge-danger"><i class="lni lni-alarm"></i> ${escapeHtml(String(dangerCount))} alerta${dangerCount !== 1 ? "s" : ""}</span>` : ""}
        ${warningCount > 0 ? `<span class="gd-rec-badge gd-rec-badge-warning"><i class="lni lni-warning"></i> ${escapeHtml(String(warningCount))} aviso${warningCount !== 1 ? "s" : ""}</span>` : ""}
        ${dangerCount === 0 && warningCount === 0 && latestMonthRecommendations.length > 0 ? `<span class="gd-rec-badge gd-rec-badge-good"><i class="lni lni-checkmark-circle"></i> Todo en orden</span>` : ""}
      </div>
      <a href="/dashboard/recomendaciones/historicas" data-link class="gd-top-btn">
        <i class="lni lni-list" aria-hidden="true"></i>
        Ver historial
      </a>
    </div>

    ${latestMonthRecommendations.length > 0
      ? latestMonthRecommendations.map(renderRecommendationCard).join("")
      : `
        <div class="gd-card">
          <div class="gd-card-body" style="padding: 2rem; text-align: center;">
            <i class="lni lni-checkmark-circle" style="font-size: 2rem; color: #16a34a; display: block; margin-bottom: 0.5rem;"></i>
            <p class="gd-muted mb-0">No hay recomendaciones del ultimo mes.</p>
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

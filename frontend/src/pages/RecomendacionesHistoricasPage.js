import { renderDashboardAppLayout } from "../components/dashboard/dashboardAppLayout";
import { escapeHtml } from "../utils/sanitize";

const SOURCE_CONFIG = {
  asesor: {
    label: "Asesor",
    className: "gd-rec-source-asesor",
    iconClass: "lni lni-user",
  },
  ia: {
    label: "IA",
    className: "gd-rec-source-ia",
    iconClass: "lni lni-bolt-alt",
  },
};

const MONTH_LABELS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const MONTH_INDEX_BY_NAME = {
  ene: 0,
  enero: 0,
  feb: 1,
  febrero: 1,
  mar: 2,
  marzo: 2,
  abr: 3,
  abril: 3,
  may: 4,
  mayo: 4,
  jun: 5,
  junio: 5,
  jul: 6,
  julio: 6,
  ago: 7,
  agosto: 7,
  sep: 8,
  sept: 8,
  septiembre: 8,
  set: 8,
  oct: 9,
  octubre: 9,
  nov: 10,
  noviembre: 10,
  dic: 11,
  diciembre: 11,
};

function parseDateParts(dateStr) {
  const fallbackYear = String(new Date().getFullYear());
  const raw = String(dateStr || "").trim();

  if (!raw) return { month: "", year: "", monthKey: "", label: "" };

  const isoMatch = raw.match(/(\d{4})-(\d{2})(?:-(\d{2}))?/);
  if (isoMatch) {
    const year = isoMatch[1];
    const monthIdx = Number(isoMatch[2]) - 1;
    const month = MONTH_LABELS[monthIdx] || "";
    return {
      month,
      year,
      monthKey: `${year}-${String(monthIdx + 1).padStart(2, "0")}`,
      label: month && year ? `${month} ${year}` : month,
    };
  }

  const normalizedParts = raw
    .toLowerCase()
    .replace(/[.,]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  const yearToken = normalizedParts.find((part) => /^\d{4}$/.test(part));
  const year = yearToken || fallbackYear;
  const monthIndex = normalizedParts
    .map((part) => MONTH_INDEX_BY_NAME[part] ?? MONTH_INDEX_BY_NAME[part.slice(0, 3)] ?? null)
    .find((index) => index !== null);

  if (monthIndex === undefined || monthIndex === null) {
    return { month: "", year: "", monthKey: raw, label: raw };
  }

  const month = MONTH_LABELS[monthIndex] || "";
  return {
    month,
    year,
    monthKey: `${year}-${String(monthIndex + 1).padStart(2, "0")}`,
    label: month && year ? `${month} ${year}` : month,
  };
}

function normalizeRecommendationItem(item = {}) {
  // Usa fecha ISO para ordenamiento/agrupamiento (puede ser 'fecha' en ISO o 'date')
  const date = String(item.fecha || item.date || "").trim();
  const title = String(item.title || item.titulo || "Sin titulo").trim();
  const body = String(item.body || item.texto || "").trim();
  const source = String(item.source || item.type || item.emisor || "").trim().toLowerCase();

  return {
    ...item,
    date,
    title,
    body,
    source,
  };
}

function groupByMonth(recommendations) {
  const map = {};
  (recommendations || []).forEach((rawItem) => {
    const item = normalizeRecommendationItem(rawItem);
    const parsed = parseDateParts(item.date);
    const key = parsed.monthKey || parsed.label || item.date || "Sin fecha";

    if (!map[key]) {
      map[key] = {
        label: parsed.label || item.date || "Sin fecha",
        items: [],
      };
    }

    map[key].items.push(item);
  });
  return map;
}

function renderRecommendationItem(rawItem) {
  const item = normalizeRecommendationItem(rawItem);
  const parts = parseDateParts(item.date);
  const sourceRaw = String(item.source || item.type || '').trim().toLowerCase();
  const source = sourceRaw === 'ia' ? SOURCE_CONFIG.ia : SOURCE_CONFIG.asesor;
  
  return `
    <article class="gd-rec-card ${escapeHtml(source.className)}" data-date="${escapeHtml(item.date || '')}" data-month="${escapeHtml(parts.month)}" data-year="${escapeHtml(parts.year)}" data-source="${escapeHtml(sourceRaw === 'ia' ? 'ia' : 'asesor')}" data-title="${escapeHtml((item.title || '').toLowerCase())}" data-body="${escapeHtml((item.body || '').toLowerCase())}">
      <header class="gd-rec-head">
        <i class="${escapeHtml(source.iconClass)}"></i>
        <h2 class="gd-rec-title">${escapeHtml(item.title)}</h2>
        <span class="gd-rec-type">${escapeHtml(source.label)}</span>
      </header>
      <p class="gd-rec-body">${escapeHtml(item.body)}</p>
    </article>
  `;
}

export function renderRecomendacionesHistoricasPage({
  profileImage,
  profileName,
  activePath = "/dashboard/recomendaciones/historicas",
  pageTitle = "Historial de recomendaciones",
  pageSubtitle = "Recomendaciones agrupadas por mes",
  recomendaciones = [],
  filters = { search: "", periodo: "todos" },
  sidebarSections = null,
  notificationCount = recomendaciones.length,
}) {
  const byMonth = groupByMonth(recomendaciones);
  const months = Object.keys(byMonth).sort((a, b) => (a < b ? 1 : -1));

  const content = `
    <div class="d-flex justify-content-end mb-2">
      <a href="/dashboard/recomendaciones" data-link class="gd-top-btn">
        <i class="lni lni-arrow-left"></i>
        Volver
      </a>
    </div>

    <div class="gd-filters" style="display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; align-items: flex-end;">
      <div style="flex: 1; min-width: 200px;">
        <label class="gd-form-label">Buscar recomendaciones</label>
        <input id="recSearchInput" class="gd-form-input" type="search" placeholder="Buscar recomendaciones" value="${escapeHtml(filters.search)}">
      </div>

      <div>
        <label class="gd-form-label">Mes</label>
        <select id="recMonthFilter" class="gd-form-select">
          <option value="">Todos</option>
          <option value="Enero">Enero</option>
          <option value="Febrero">Febrero</option>
          <option value="Marzo">Marzo</option>
          <option value="Abril">Abril</option>
          <option value="Mayo">Mayo</option>
          <option value="Junio">Junio</option>
          <option value="Julio">Julio</option>
          <option value="Agosto">Agosto</option>
          <option value="Septiembre">Septiembre</option>
          <option value="Octubre">Octubre</option>
          <option value="Noviembre">Noviembre</option>
          <option value="Diciembre">Diciembre</option>
        </select>
      </div>

      <div>
        <label class="gd-form-label">Año</label>
        <select id="recYearFilter" class="gd-form-select">
          <option value="">Todos</option>
          <option value="2025">2025</option>
          <option value="2026">2026</option>
          <option value="2027">2027</option>
        </select>
      </div>

      <div>
        <label class="gd-form-label">Emisor</label>
        <select id="recEmitterFilter" class="gd-form-select">
          <option value="">Todos</option>
          <option value="asesor">Asesor</option>
          <option value="ia">IA</option>
        </select>
      </div>

      <button type="button" class="gd-csv-btn" data-action="export-recommendations-csv">
        <i class="lni lni-download"></i>
        Exportar CSV
      </button>
    </div>

    <div class="gd-card">
      <div class="gd-card-header">
        <h2 class="gd-card-title">${escapeHtml(pageTitle)}</h2>
        <span class="gd-muted gd-muted-sm">${recomendaciones.length} registros</span>
      </div>

      <div class="gd-card-body">
        ${months
          .map(
            (month) => `
          <section class="mb-4" data-month-section="${escapeHtml(month)}">
            <div class="gd-rec-month-header"><strong>${escapeHtml(byMonth[month].label)}</strong> <span class="badge bg-secondary">${byMonth[month].items.length}</span></div>
            <div class="gd-rec-month-list mt-2">${byMonth[month].items.map(renderRecommendationItem).join("")}</div>
          </section>
        `,
          )
          .join("")}
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
    notificationCount,
    sidebarSections,
  });
}

export default renderRecomendacionesHistoricasPage;

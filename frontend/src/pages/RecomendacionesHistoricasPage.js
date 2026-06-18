import { renderDashboardAppLayout } from "../components/dashboard/dashboardAppLayout";
import { escapeHtml } from "../utils/sanitize";
import { t } from '../i18n';

const SOURCE_CONFIG = {
  asesor: {
    labelKey: 'rec.sourceAdvisor',
    className: "gd-rec-source-asesor",
    iconClass: "lni lni-user",
  },
  ia: {
    labelKey: 'rec.sourceIa',
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

const MONTH_TO_I18N_KEY = {
  'Enero':      'recHist.monthEnero',
  'Febrero':    'recHist.monthFebrero',
  'Marzo':      'recHist.monthMarzo',
  'Abril':      'recHist.monthAbril',
  'Mayo':       'recHist.monthMayo',
  'Junio':      'recHist.monthJunio',
  'Julio':      'recHist.monthJulio',
  'Agosto':     'recHist.monthAgosto',
  'Septiembre': 'recHist.monthSeptiembre',
  'Octubre':    'recHist.monthOctubre',
  'Noviembre':  'recHist.monthNoviembre',
  'Diciembre':  'recHist.monthDiciembre',
};

function translateMonthLabel(label) {
  const spaceIdx = label.lastIndexOf(' ');
  if (spaceIdx === -1) {
    const key = MONTH_TO_I18N_KEY[label];
    return key ? t(key) : label;
  }
  const month = label.slice(0, spaceIdx);
  const year = label.slice(spaceIdx + 1);
  const key = MONTH_TO_I18N_KEY[month];
  return key ? `${t(key)} ${year}` : label;
}

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
  const date = String(item.fecha || item.date || "").trim();
  const title = String(item.title || item.titulo || t('recHist.noTitle')).trim();
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
    const key = parsed.monthKey || parsed.label || item.date || t('recHist.noDate');

    if (!map[key]) {
      map[key] = {
        label: parsed.label || item.date || t('recHist.noDate'),
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
        <span class="gd-rec-type">${escapeHtml(t(source.labelKey))}</span>
      </header>
      <p class="gd-rec-body">${escapeHtml(item.body)}</p>
    </article>
  `;
}

export function renderRecomendacionesHistoricasPage({
  profileImage,
  profileName,
  activePath = "/dashboard/recomendaciones/historicas",
  pageTitle = t('recHist.title'),
  pageSubtitle = t('recHist.subtitle'),
  recomendaciones = [],
  filters = { search: "", periodo: "todos" },
  sidebarSections = null,
  notificationCount = recomendaciones.length,
  isAsesor = false,
}) {
  const byMonth = groupByMonth(recomendaciones);
  const months = Object.keys(byMonth).sort((a, b) => (a < b ? 1 : -1));

  const content = `
    <div class="d-flex justify-content-end mb-2">
      <a href="/dashboard/recomendaciones" data-link class="gd-top-btn">
        <i class="lni lni-arrow-left"></i>
        ${t('common.back')}
      </a>
    </div>

    <div class="gd-filters" style="display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; align-items: flex-end;">
      <div style="flex: 1; min-width: 200px;">
        <label class="gd-form-label">${t('recHist.searchLabel')}</label>
        <input id="recSearchInput" class="gd-form-input" type="search" placeholder="${t('recHist.searchPlaceholder')}" value="${escapeHtml(filters.search)}">
      </div>

      <div>
        <label class="gd-form-label">${t('recHist.month')}</label>
        <select id="recMonthFilter" class="gd-form-select">
          <option value="">${t('recHist.all')}</option>
          <option value="Enero">${t('recHist.monthEnero')}</option>
          <option value="Febrero">${t('recHist.monthFebrero')}</option>
          <option value="Marzo">${t('recHist.monthMarzo')}</option>
          <option value="Abril">${t('recHist.monthAbril')}</option>
          <option value="Mayo">${t('recHist.monthMayo')}</option>
          <option value="Junio">${t('recHist.monthJunio')}</option>
          <option value="Julio">${t('recHist.monthJulio')}</option>
          <option value="Agosto">${t('recHist.monthAgosto')}</option>
          <option value="Septiembre">${t('recHist.monthSeptiembre')}</option>
          <option value="Octubre">${t('recHist.monthOctubre')}</option>
          <option value="Noviembre">${t('recHist.monthNoviembre')}</option>
          <option value="Diciembre">${t('recHist.monthDiciembre')}</option>
        </select>
      </div>

      <div>
        <label class="gd-form-label">${t('recHist.year')}</label>
        <select id="recYearFilter" class="gd-form-select">
          <option value="">${t('recHist.all')}</option>
          <option value="2025">2025</option>
          <option value="2026">2026</option>
          <option value="2027">2027</option>
        </select>
      </div>

      <div>
        <label class="gd-form-label">${t('recHist.emitter')}</label>
        <select id="recEmitterFilter" class="gd-form-select">
          <option value="">${t('recHist.all')}</option>
          <option value="asesor">${t('rec.sourceAdvisor')}</option>
          <option value="ia">${t('rec.sourceIa')}</option>
          <option value="">Todos</option>
          <option value="asesor">Asesor</option>
        </select>
      </div>

      <button type="button" class="gd-csv-btn" data-action="export-recommendations-csv">
        <i class="lni lni-download"></i>
        ${t('common.exportCsv')}
      </button>
    </div>

    <div class="gd-card">
      <div class="gd-card-header">
        <h2 class="gd-card-title">${escapeHtml(pageTitle)}</h2>
        <span class="gd-muted gd-muted-sm">${t('recHist.recordCount', { count: recomendaciones.length })}</span>
      </div>

      <div class="gd-card-body">
        ${months
          .map(
            (month) => `
          <section class="mb-4" data-month-section="${escapeHtml(month)}">
            <div class="gd-rec-month-header"><strong>${escapeHtml(translateMonthLabel(byMonth[month].label))}</strong> <span class="badge bg-secondary">${byMonth[month].items.length}</span></div>
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
    isAsesor,
    notificationCount,
    sidebarSections,
  });
}

export default renderRecomendacionesHistoricasPage;

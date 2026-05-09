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
  septiembre: 8,
  set: 8,
  oct: 9,
  octubre: 9,
  nov: 10,
  noviembre: 10,
  dic: 11,
  diciembre: 11,
};

function padMonth(value) {
  return String(value).padStart(2, "0");
}

function getMonthIndex(token) {
  if (!token) {
    return null;
  }

  const normalized = token.toLowerCase().replace(/\./g, "");

  if (Object.prototype.hasOwnProperty.call(MONTH_INDEX_BY_NAME, normalized)) {
    return MONTH_INDEX_BY_NAME[normalized];
  }

  const shortToken = normalized.slice(0, 3);
  if (Object.prototype.hasOwnProperty.call(MONTH_INDEX_BY_NAME, shortToken)) {
    return MONTH_INDEX_BY_NAME[shortToken];
  }

  return null;
}

function parseRecommendationDate(value) {
  const fallbackYear = new Date().getFullYear();
  const raw = String(value || "").trim();

  if (!raw) {
    return null;
  }

  const isoMatch = raw.match(/(\d{4})-(\d{2})(?:-(\d{2}))?/);
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const monthIndex = Number(isoMatch[2]) - 1;
    const day = isoMatch[3] ? Number(isoMatch[3]) : 1;

    return {
      year,
      monthIndex,
      day,
      monthKey: `${year}-${padMonth(monthIndex + 1)}`,
      sortKey: year * 10000 + (monthIndex + 1) * 100 + day,
    };
  }

  const tokens = raw.toLowerCase().replace(/[.,]/g, " ").split(/\s+/).filter(Boolean);
  if (!tokens.length) {
    return null;
  }

  const yearToken = tokens.find((token) => /^\d{4}$/.test(token));
  const year = yearToken ? Number(yearToken) : fallbackYear;
  const monthIndex = tokens
    .map((token) => getMonthIndex(token))
    .find((index) => index !== null);

  if (monthIndex === undefined || monthIndex === null) {
    return null;
  }

  const monthPosition = tokens.findIndex((token) => getMonthIndex(token) === monthIndex);
  const previousToken = tokens[monthPosition - 1];
  const nextToken = tokens[monthPosition + 1];
  const dayToken = /^\d{1,2}$/.test(previousToken)
    ? previousToken
    : /^\d{1,2}$/.test(nextToken)
      ? nextToken
      : "1";
  const day = Number(dayToken);

  return {
    year,
    monthIndex,
    day,
    monthKey: `${year}-${padMonth(monthIndex + 1)}`,
    sortKey: year * 10000 + (monthIndex + 1) * 100 + day,
  };
}

function getLatestMonthRecommendations(recomendaciones) {
  const parsedRecommendations = (recomendaciones || [])
    .map((item, index) => ({
      item,
      index,
      parsedDate: parseRecommendationDate(item.date),
    }))
    .filter(({ parsedDate }) => Boolean(parsedDate));

  if (!parsedRecommendations.length) {
    return [];
  }

  const latestMonthKey = parsedRecommendations.reduce((latestKey, entry) => {
    if (!latestKey) {
      return entry.parsedDate.monthKey;
    }

    return entry.parsedDate.monthKey > latestKey ? entry.parsedDate.monthKey : latestKey;
  }, "");

  return parsedRecommendations
    .filter(({ parsedDate }) => parsedDate.monthKey === latestMonthKey)
    .sort((left, right) => {
      const dateDiff = right.parsedDate.sortKey - left.parsedDate.sortKey;
      if (dateDiff !== 0) {
        return dateDiff;
      }

      return right.index - left.index;
    })
    .map(({ item }) => item);
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

  const content = `
    <div class="d-flex justify-content-end mb-2">
      <a href="/dashboard/recomendaciones/historicas" data-link class="gd-top-btn gd-top-btn-primary">
        <i class="lni lni-list"></i>
        Ver historial
      </a>
    </div>

    ${latestMonthRecommendations.length > 0
      ? latestMonthRecommendations
      .map((item) => {
        const sourceRaw = String(item.source || item.type || "").trim().toLowerCase();
        const source = sourceRaw === "ia" ? SOURCE_CONFIG.ia : SOURCE_CONFIG.asesor;

        return `
          <article class="gd-rec-card ${escapeHtml(source.className)}">
            <header class="gd-rec-head">
              <i class="${escapeHtml(source.iconClass)}"></i>
              <h2 class="gd-rec-title">${escapeHtml(item.title)}</h2>
              <span class="gd-rec-type">${escapeHtml(source.label)}</span>
            </header>
            <p class="gd-rec-body">${escapeHtml(item.body)}</p>
            <div class="gd-rec-meta">
              <span class="gd-rec-tag">${escapeHtml(item.date)}</span>
              <span class="gd-rec-tag">${escapeHtml(item.category)}</span>
            </div>
          </article>
        `;
      })
      .join("")
      : `
        <div class="gd-card">
          <div class="gd-card-body">
            <p class="gd-muted mb-0">No hay recomendaciones del ultimo mes.</p>
          </div>
        </div>
      `}
  `;

  return renderDashboardAppLayout({
    activePath,
    pageTitle,
    pageSubtitle,
    content,
    profileImage,
    profileName,
    isAsesor,
    notificationCount: latestMonthRecommendations.length,
  });
}

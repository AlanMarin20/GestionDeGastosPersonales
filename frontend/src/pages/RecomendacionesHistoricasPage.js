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

function parseDateParts(dateStr) {
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const shortMonths = { ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5, jul: 6, ago: 7, sep: 8, oct: 9, nov: 10, dic: 11 };
  
  if (!dateStr) return { month: '', year: '' };
  
  // Intenta formato ISO: 2026-04
  const isoMatch = dateStr.match(/(\d{4})-(\d{2})/);
  if (isoMatch) {
    const year = isoMatch[1];
    const monthIdx = parseInt(isoMatch[2], 10) - 1;
    return { month: months[monthIdx] || '', year };
  }
  
  // Intenta formato: "18 abr 2026"
  const parts = dateStr.split(' ');
  if (parts.length >= 2) {
    const shortMonth = parts[parts.length - 2].toLowerCase();
    const year = parts[parts.length - 1];
    const monthIdx = shortMonths[shortMonth];
    if (monthIdx !== undefined) {
      return { month: months[monthIdx], year };
    }
  }
  
  return { month: '', year: '' };
}

function groupByMonth(recommendations) {
  const map = {};
  (recommendations || []).forEach((r) => {
    const d = r.date || "Sin fecha";
    let month = d;
    const isoMatch = d.match(/(\d{4}-\d{2})/);
    if (isoMatch) month = isoMatch[1];
    else {
      const parts = d.split(" ");
      if (parts.length >= 2) month = parts.slice(-2).join(" ");
    }

    if (!map[month]) map[month] = [];
    map[month].push(r);
  });
  return map;
}

function renderRecommendationItem(item) {
  const parts = parseDateParts(item.date);
  const sourceRaw = String(item.source || item.type || '').trim().toLowerCase();
  const source = sourceRaw === 'ia' ? SOURCE_CONFIG.ia : SOURCE_CONFIG.asesor;
  
  return `
    <article class="gd-rec-card ${escapeHtml(source.className)}" data-month="${escapeHtml(parts.month)}" data-year="${escapeHtml(parts.year)}" data-source="${escapeHtml(sourceRaw === 'ia' ? 'ia' : 'asesor')}" data-title="${escapeHtml((item.title || '').toLowerCase())}" data-body="${escapeHtml((item.body || '').toLowerCase())}">
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
}) {
  const byMonth = groupByMonth(recomendaciones);
  const months = Object.keys(byMonth).sort((a, b) => (a < b ? 1 : -1));

  const content = `
    <div class="d-flex justify-content-end mb-2">
      <a href="/dashboard/recomendaciones" data-link class="btn btn-outline-secondary btn-sm">Volver a recomendaciones</a>
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
            <div class="gd-rec-month-header"><strong>${escapeHtml(month)}</strong> <span class="badge bg-secondary">${byMonth[month].length}</span></div>
            <div class="gd-rec-month-list mt-2">${byMonth[month].map(renderRecommendationItem).join("")}</div>
          </section>
        `,
          )
          .join("")}
      </div>
    </div>

    <script>
      (function() {
        const searchInput = document.getElementById('recSearchInput');
        const monthFilter = document.getElementById('recMonthFilter');
        const yearFilter = document.getElementById('recYearFilter');
        const emitterFilter = document.getElementById('recEmitterFilter');
        
        function applyFilters() {
          const searchTerm = (searchInput?.value || '').trim().toLowerCase();
          const selectedMonth = monthFilter?.value || '';
          const selectedYear = yearFilter?.value || '';
          const selectedEmitter = emitterFilter?.value || '';
          
          const cards = document.querySelectorAll('.gd-rec-card');
          cards.forEach(card => {
            let visible = true;
            
            // Filtrar por búsqueda
            if (searchTerm) {
              const title = card.getAttribute('data-title') || '';
              const body = card.getAttribute('data-body') || '';
              visible = title.includes(searchTerm) || body.includes(searchTerm);
            }
            
            // Filtrar por mes
            if (visible && selectedMonth) {
              const cardMonth = card.getAttribute('data-month') || '';
              visible = cardMonth === selectedMonth;
            }
            
            // Filtrar por año
            if (visible && selectedYear) {
              const cardYear = card.getAttribute('data-year') || '';
              visible = cardYear === selectedYear;
            }
            
            // Filtrar por emisor
            if (visible && selectedEmitter) {
              const cardSource = card.getAttribute('data-source') || '';
              visible = cardSource === selectedEmitter;
            }
            
            card.style.display = visible ? '' : 'none';
          });
          
          // Ocultar secciones vacías
          const sections = document.querySelectorAll('[data-month-section]');
          sections.forEach(section => {
            const visibleCards = section.querySelectorAll('.gd-rec-card[style=""]');
            const hasVisible = Array.from(visibleCards).some(c => c.style.display !== 'none');
            section.style.display = hasVisible ? '' : 'none';
          });
        }
        
        // Event listeners
        searchInput?.addEventListener('input', applyFilters);
        monthFilter?.addEventListener('change', applyFilters);
        yearFilter?.addEventListener('change', applyFilters);
        emitterFilter?.addEventListener('change', applyFilters);
        
        // Exportar CSV
        document.querySelector('[data-action="export-recommendations-csv"]')?.addEventListener('click', function() {
          const visibleCards = Array.from(document.querySelectorAll('.gd-rec-card')).filter(c => c.style.display !== 'none');
          const rows = [['Título', 'Cuerpo', 'Fecha', 'Categoría', 'Emisor']];
          
          visibleCards.forEach(card => {
            const title = card.querySelector('.gd-rec-title')?.textContent || '';
            const body = card.querySelector('.gd-rec-body')?.textContent || '';
            const tags = Array.from(card.querySelectorAll('.gd-rec-tag')).map(t => t.textContent);
            const date = tags[0] || '';
            const category = tags[1] || '';
            const emitter = card.getAttribute('data-source') || '';
            rows.push([title, body, date, category, emitter]);
          });
          
          const csv = rows.map(row => row.map(cell => '"' + String(cell).replace(/"/g, '""') + '"').join(',')).join('\n');
          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = 'recomendaciones.csv';
          link.click();
        });
      })();
    </script>
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

export default renderRecomendacionesHistoricasPage;

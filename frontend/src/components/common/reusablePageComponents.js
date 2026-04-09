export function encabezado({ title, subtitle, backAction = 'back' }) {
  return `
    <div class="mb-4">
      <button class="btn btn-outline-secondary btn-sm mb-3" data-action="${backAction}">← Volver</button>
      <h1 class="h3">${escapeHtml(title)}</h1>
      <p class="text-muted">${escapeHtml(subtitle)}</p>
    </div>
  `;
}

export function graficoTorta({ title, canvasId, ariaLabel }) {
  return `
    <article class="card border-0 shadow-sm dashboard-widget-card">
      <div class="card-body">
        <h2 class="h5 mb-3">${escapeHtml(title)}</h2>
        <div class="dashboard-widget-chart">
          <canvas id="${escapeHtml(canvasId)}" aria-label="${escapeHtml(ariaLabel)}" role="img"></canvas>
        </div>
      </div>
    </article>
  `;
}

export function graficoGastos({ title, canvasId, ariaLabel, height = '300px' }) {
  return `
    <article class="card border-0 shadow-sm dashboard-widget-card">
      <div class="card-body">
        <h2 class="h5 mb-3">${escapeHtml(title)}</h2>
        <div style="height:${escapeHtml(height)}">
          <canvas id="${escapeHtml(canvasId)}" aria-label="${escapeHtml(ariaLabel)}" role="img"></canvas>
        </div>
      </div>
    </article>
  `;
}

export function listaUltimosGastos({ title, expenses, showAll, toggleAction, formatCurrency }) {
  const displayExpenses = showAll ? expenses : expenses.slice(0, 5);

  // Mapeo dinámico para darle a cada categoría un color e ícono de LineIcons (lni)
  const categoryConfig = {
    'Comida': { icon: 'lni-restaurant', color: 'text-warning', bg: 'bg-warning' },
    'Transporte': { icon: 'lni-car', color: 'text-info', bg: 'bg-info' },
    'Vivienda': { icon: 'lni-home', color: 'text-primary', bg: 'bg-primary' },
    'Ocio': { icon: 'lni-ticket', color: 'text-danger', bg: 'bg-danger' },
    'Salud': { icon: 'lni-first-aid', color: 'text-success', bg: 'bg-success' },
    'Otros': { icon: 'lni-grid-alt', color: 'text-secondary', bg: 'bg-secondary' }
  };

  return `
    <article class="card border-0 shadow-sm" style="border-radius: 15px;">
      <div class="card-body p-4">
        <h2 class="h5 mb-4 fw-bold text-dark">${title}</h2>
        <div class="d-flex flex-column gap-3">
          ${displayExpenses.length === 0
            ? '<p class="text-muted text-center py-3">No hay gastos recientes</p>'
            : displayExpenses.map(expense => {
                const config = categoryConfig[expense.categoria] || categoryConfig['Otros'];
                return `
                  <div class="d-flex align-items-center justify-content-between p-2 rounded-3" style="transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='#f8f9fa'" onmouseout="this.style.backgroundColor='transparent'">
                    <div class="d-flex align-items-center gap-3">
                      <!-- Ícono dinámico -->
                      <div class="d-flex align-items-center justify-content-center rounded-circle ${config.bg} bg-opacity-10 ${config.color}" style="width: 45px; height: 45px;">
                        <i class="lni ${config.icon} fs-5"></i>
                      </div>
                      <div>
                        <h6 class="mb-0 fw-semibold text-dark">${expense.descripcion}</h6>
                        <small class="text-muted">${expense.fecha} • ${expense.categoria}</small>
                      </div>
                    </div>
                    <div class="text-end">
                      <span class="fw-bold text-dark">-${formatCurrency(expense.monto)}</span>
                    </div>
                  </div>
                `;
              }).join('')
          }
        </div>
        ${expenses.length > 5
          ? `
            <div class="text-center mt-4 pt-3 border-top">
              <button class="btn btn-link text-primary text-decoration-none fw-semibold p-0" data-action="${toggleAction}" data-value="${showAll ? 'hide' : 'show'}">
                ${showAll ? 'Ver menos' : 'Ver todos los gastos'} <i class="lni ${showAll ? 'lni-chevron-up' : 'lni-chevron-down'} ms-1"></i>
              </button>
            </div>
          `
          : ''
        }
      </div>
    </article>
  `;
}


function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

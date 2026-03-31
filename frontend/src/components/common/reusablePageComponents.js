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

export function listaUltimosGastos({
  title,
  expenses,
  showAll,
  toggleAction,
  formatCurrency,
}) {
  const visibleExpenses = showAll ? expenses : expenses.slice(0, 10);
  const listHtml =
    expenses.length === 0
      ? '<p class="text-muted small">No hay gastos registrados</p>'
      : visibleExpenses
          .map(
            (expense) => `
              <div class="border-bottom pb-2 mb-2">
                <div class="d-flex justify-content-between align-items-start">
                  <div>
                    <p class="mb-0 small fw-500">${escapeHtml(expense.descripcion)}</p>
                    <small class="text-muted">${escapeHtml(expense.categoria)}</small>
                  </div>
                  <div class="text-end">
                    <p class="mb-0 small fw-bold text-danger">-${formatCurrency(expense.monto)}</p>
                    <small class="text-muted">${escapeHtml(expense.fecha)}</small>
                  </div>
                </div>
              </div>
            `,
          )
          .join('');

  const toggleButton = !showAll
    ? expenses.length > 0
      ? `<button class="btn btn-sm btn-outline-primary w-100" data-action="${toggleAction}" data-value="show">Ver todos los gastos</button>`
      : ''
    : `<button class="btn btn-sm btn-outline-secondary w-100" data-action="${toggleAction}" data-value="hide">Mostrar menos</button>`;

  return `
    <article class="card border-0 shadow-sm dashboard-widget-card">
      <div class="card-body">
        <h2 class="h5 mb-3">${escapeHtml(title)}</h2>
        <div class="dashboard-recent-expenses">
          ${listHtml}
        </div>
        <div class="mt-3">${toggleButton}</div>
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

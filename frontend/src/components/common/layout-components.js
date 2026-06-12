import { renderExpenseTable } from "../dashboard/dashboardExpenseTable";
import { escapeHtml } from "../../utils/sanitize";
import { formatMoney } from "../../utils/money";
import { t } from "../../i18n";

export function botonScrollTop() {
  return `
    <button type="button" class="scroll-top btn-hover" data-action="scroll-top-page" aria-label="${t('header.scrollTop')}">
      <span class="scroll-top-triangle" aria-hidden="true"></span>
    </button>
  `;
}

export function descripcionLanding({
  title,
  description,
  containerClass = 'hero-content',
  titleClass = 'wow fadeInUp',
  titleDelay = '.4s',
  descriptionClass = 'wow fadeInUp',
  descriptionDelay = '.6s',
  ctaMarkup = '',
} = {}) {
  const titleDelayAttr = titleDelay ? ` data-wow-delay="${escapeHtml(titleDelay)}"` : '';
  const descriptionDelayAttr = descriptionDelay ? ` data-wow-delay="${escapeHtml(descriptionDelay)}"` : '';

  return `
    <div class="${escapeHtml(containerClass)}">
      <h2 class="${escapeHtml(titleClass)}"${titleDelayAttr}>
        ${escapeHtml(title)}
      </h2>
      <p class="${escapeHtml(descriptionClass)}"${descriptionDelayAttr}>
        ${escapeHtml(description)}
      </p>
      ${ctaMarkup}
    </div>
  `;
}

export function imagenesLanding({
  src,
  fallbackSrc = '',
  alt,
  wrapperClass = 'hero-img wow fadeInUp d-flex align-items-center justify-content-center',
  delay = '.5s',
  wrapperStyle = '',
  imageClass = 'w-100',
  imageStyle = '',
  extraMarkup = '',
} = {}) {
  const delayAttr = delay ? ` data-wow-delay="${escapeHtml(delay)}"` : '';
  const styleAttr = wrapperStyle ? ` style="${escapeHtml(wrapperStyle)}"` : '';
  const imageStyleAttr = imageStyle ? ` style="${escapeHtml(imageStyle)}"` : '';
  const hasFallbackSrc = Boolean(fallbackSrc);
  const imageMarkup = hasFallbackSrc
    ? `
      <picture>
        <source srcset="${escapeHtml(src)}" type="image/webp" />
        <img src="${escapeHtml(fallbackSrc)}" alt="${escapeHtml(alt)}" class="${escapeHtml(imageClass)}"${imageStyleAttr} />
      </picture>
    `
    : `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" class="${escapeHtml(imageClass)}"${imageStyleAttr} />`;

  return `
    <div class="${escapeHtml(wrapperClass)}"${delayAttr}${styleAttr}>
      ${imageMarkup}
      ${extraMarkup}
    </div>
  `;
}

export function botonMasAccion({
  dataAttributes = {},
  ariaLabel = 'Agregar',
  title = 'Agregar',
  className = 'btn btn-primary btn-sm fw-bold shadow-sm fp-circle-action-btn',
  style = '',
} = {}) {
  const dataAttrs = Object.entries(dataAttributes)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => ` data-${escapeHtml(key)}="${escapeHtml(String(value))}"`)
    .join('');
  const styleAttr = style ? ` style="${escapeHtml(style)}"` : '';

  return `<button type="button" class="${escapeHtml(className)}"${styleAttr} aria-label="${escapeHtml(ariaLabel)}" title="${escapeHtml(title)}"${dataAttrs}><span class="fp-circle-action-btn-plus">+</span></button>`;
}

export function tarjetaValor({
  title,
  value,
  delta = '',
  trend = 'up',
  layout = 'kpi',
  dashboardActionMarkup = '',
  dashboardValueClass = '',
  dashboardExtraMarkup = '',
  color = 'primary',
  icon = 'lni-bar-chart',
  variant = 'filled',
  hasButton = false,
  buttonAction = '',
  buttonId = '',
  metricId = '',
} = {}) {
  if (layout === 'dashboard-metric') {
    const deltaClass = trend === 'down'
      ? 'gd-delta-down'
      : trend === 'warn'
        ? 'gd-delta-warn'
        : 'gd-delta-up';
    const metricValueClass = ['gd-metric-value', dashboardValueClass]
      .filter(Boolean)
      .join(' ');
    const deltaMarkup = delta
      ? `<span class="gd-metric-delta ${deltaClass}">
          ${escapeHtml(delta)}
        </span>`
      : '';
    const metricIdAttr = metricId ? ` data-metric-id="${escapeHtml(metricId)}"` : '';

    return `
      <article class="gd-metric-card"${metricIdAttr}>
        <div class="gd-metric-head">
          <p class="gd-metric-label">${escapeHtml(title)}</p>
          ${dashboardActionMarkup}
        </div>
        <p class="${escapeHtml(metricValueClass)}">${escapeHtml(value)}</p>
        ${deltaMarkup}
        ${dashboardExtraMarkup}
      </article>
    `;
  }

  const gradientClasses = {
    success: 'bg-success bg-gradient text-white',
    danger: 'bg-danger bg-gradient text-white',
    info: 'bg-info bg-gradient text-dark',
    warning: 'bg-warning bg-gradient text-dark',
    primary: 'bg-primary bg-gradient text-white',
  };

  const outlineStyles = {
    success: {
      cardClass: 'bg-white text-success border border-success',
      textClass: 'text-success',
      mutedClass: 'text-success opacity-75',
    },
    danger: {
      cardClass: 'bg-white text-danger border border-danger',
      textClass: 'text-danger',
      mutedClass: 'text-danger opacity-75',
    },
    info: {
      cardClass: 'bg-white text-info border border-info',
      textClass: 'text-info',
      mutedClass: 'text-info opacity-75',
    },
    warning: {
      cardClass: 'bg-white text-warning border border-warning',
      textClass: 'text-warning',
      mutedClass: 'text-warning opacity-75',
    },
    primary: {
      cardClass: 'bg-white text-primary border border-primary',
      textClass: 'text-primary',
      mutedClass: 'text-primary opacity-75',
    },
  };

  const isOutline = variant === 'outline';
  const selectedOutline = outlineStyles[color] ?? outlineStyles.primary;
  const cardClasses = isOutline
    ? selectedOutline.cardClass
    : (gradientClasses[color] ?? gradientClasses.primary);
  const textColor = isOutline
    ? selectedOutline.textClass
    : ((color === 'warning' || color === 'info') ? 'text-dark' : 'text-white');
  const mutedColor = isOutline
    ? selectedOutline.mutedClass
    : ((color === 'warning' || color === 'info') ? 'text-dark opacity-75' : 'text-white-50');
  const buttonHTML = hasButton
    ? botonMasAccion({
        className: 'btn btn-light btn-sm fw-bold shadow-sm border-0 fp-circle-action-btn fp-circle-action-btn-kpi',
        dataAttributes: { action: buttonAction, id: buttonId },
        ariaLabel: t('reusable.actionFor', { title }),
        title: t('reusable.actionFor', { title }),
      })
    : '';

  return `
    <article class="card border-0 shadow-sm kpi-value-card kpi-${escapeHtml(color)} fp-card-rounded-lg fp-kpi-card ${cardClasses}">
      <div class="card-body p-3 position-relative overflow-hidden d-flex flex-column justify-content-center">
        <div class="position-absolute opacity-25 fp-kpi-card-icon">
          <i class="lni ${escapeHtml(icon)}"></i>
        </div>
        <p class="mb-1 fw-semibold ${mutedColor} fp-kpi-card-label">${escapeHtml(title)}</p>
        <h2 class="mb-0 fw-bold ${textColor} fp-kpi-card-value">${escapeHtml(value)}</h2>
        ${buttonHTML}
      </div>
    </article>
  `;
}

export function botonRegistrarGastos({
  text,
  type = 'button',
  className = 'btn btn-primary btn-sm w-100',
  style = '',
  iconClass = '',
} = {}) {
  const iconMarkup = iconClass ? `<i class="${escapeHtml(iconClass)} me-1"></i>` : '';
  const styleAttr = style ? ` style="${escapeHtml(style)}"` : '';
  return `<button type="${escapeHtml(type)}" class="${escapeHtml(className)}"${styleAttr}>${iconMarkup}${escapeHtml(text)}</button>`;
}

export function enlaceVerTodo({
  href,
  label = t('common.viewAll'),
  className = 'gd-top-btn',
  iconClass = 'lni lni-chevron-right',
  dataLink = true,
} = {}) {
  const dataLinkAttr = dataLink ? ' data-link' : '';
  const iconMarkup = iconClass ? `<i class="${escapeHtml(iconClass)}" aria-hidden="true"></i>` : '';

  return `<a href="${escapeHtml(href)}"${dataLinkAttr} class="${escapeHtml(className)}">${escapeHtml(label)} ${iconMarkup}</a>`;
}

export function renderClientBanner({
  clienteName,
  risk = null,
  backHref,
  backLabel = t('cliente.backToPortfolio'),
} = {}) {
  const initials = String(clienteName)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase() || 'CL';
  const bannerStyle = risk
    ? ` style="--gd-banner-bg-start: ${escapeHtml(risk.bannerStart)}; --gd-banner-bg-end: ${escapeHtml(risk.bannerEnd)}; --gd-banner-border: ${escapeHtml(risk.bannerBorder)}; --gd-banner-accent: ${escapeHtml(risk.bannerAccent)}; --gd-banner-label: ${escapeHtml(risk.bannerLabel)};"`
    : '';

  return `
    <div class="gd-client-banner" role="status" aria-label="${escapeHtml(t('cliente.viewingLabel'))} ${escapeHtml(clienteName)}"${bannerStyle}>
      <div class="gd-client-banner-avatar" aria-hidden="true">${escapeHtml(initials)}</div>
      <div class="gd-client-banner-info">
        <span class="gd-client-banner-label">${escapeHtml(t('cliente.viewingLabel'))}</span>
        <div class="gd-client-banner-name-row">
          <span class="gd-client-banner-name">${escapeHtml(clienteName)}</span>
          ${risk ? `<span class="gd-risk-pill ${escapeHtml(risk.className)}">${escapeHtml(t(risk.labelKey))}</span>` : ''}
        </div>
      </div>
      <a href="${escapeHtml(backHref)}" data-link class="gd-btn gd-btn-sm gd-client-banner-back">
        ← ${escapeHtml(backLabel)}
      </a>
    </div>
  `;
}

export function tarjetaAhorro({ ahorro }) {
  const progress = ahorro.meta ? Math.min((ahorro.monto / ahorro.meta) * 100, 100) : 0;

  return `
    <div class="col-12 col-lg-4">
      <div class="p-4 bg-white border shadow-sm fp-savings-card">
        <div class="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h3 class="h6 fw-bold mb-1 text-dark">${escapeHtml(ahorro.nombre)}</h3>
            <span class="badge bg-primary bg-opacity-10 text-primary px-2 py-1 fp-savings-amount-badge">${escapeHtml(formatMoney(ahorro.monto))}</span>
          </div>
          ${botonMasAccion({
            className: 'btn btn-primary btn-sm fw-bold shadow-sm border-0 fp-circle-action-btn',
            dataAttributes: { action: 'open-destino-modal', 'ahorro-id': ahorro.id },
            ariaLabel: t('reusable.allocateFundsTo', { name: ahorro.nombre }),
            title: t('reusable.allocateFunds'),
          })}
        </div>
        ${
          ahorro.meta
            ? `
              <div>
                <div class="d-flex justify-content-between mb-1">
                  <small class="text-muted fw-semibold fp-savings-progress-label">${t('reusable.progress')}</small>
                  <small class="text-muted fw-semibold fp-savings-progress-label">${t('reusable.goal', { amount: escapeHtml(formatMoney(ahorro.meta)) })}</small>
                </div>
                <div class="progress fp-savings-progress">
                  <div class="progress-bar bg-success fp-savings-progress-bar" role="progressbar" style="width: ${progress}%;"></div>
                </div>
              </div>
            `
            : ''
        }
      </div>
    </div>
  `;
}

function renderChartCard({
  title,
  canvasId,
  ariaLabel,
  height,
  dashboardStyle = false,
  cardClass = '',
  headerActionMarkup = '',
  chartWrapClass = '',
  chartWrapStyle = '',
  summaryItems = [],
  legendContainerId = '',
  centerValue = null,
  centerLabel = null,
}) {
  const summaryMarkup = Array.isArray(summaryItems) && summaryItems.length > 0
    ? `
      <div class="gd-chart-summary d-flex flex-wrap gap-2 mt-3">
        ${summaryItems.map((item) => {
          const badgeClass = item?.badgeClass || 'gd-chart-summary-badge';
          const label = item?.label ?? '';
          const value = item?.value ?? '';
          return `<span class="badge rounded-pill ${escapeHtml(badgeClass)}">${escapeHtml(label)}${value !== '' ? `: ${escapeHtml(String(value))}` : ''}</span>`;
        }).join('')}
      </div>
    `
    : '';
  const titleMarkup = title
    ? `<h2 class="${dashboardStyle ? 'gd-card-title' : 'h5 mb-4 fw-bold text-dark'}">${escapeHtml(title)}</h2>`
    : '';

  if (dashboardStyle) {
    const cardClasses = ['gd-card', cardClass].filter(Boolean).join(' ');
    const chartClasses = ['gd-chart-wrap', chartWrapClass].filter(Boolean).join(' ');
    const extraWrapStyle = chartWrapStyle ? ` ${escapeHtml(chartWrapStyle)}` : '';
    const legendMarkup = legendContainerId
      ? `<div id="${escapeHtml(legendContainerId)}" class="gd-chart-legend mt-2"></div>`
      : '';
    const centerValueAttr = centerValue !== null && centerValue !== undefined && centerValue !== ''
      ? ` data-center-value="${escapeHtml(String(centerValue))}"`
      : '';
    const centerLabelAttr = centerLabel !== null && centerLabel !== undefined && centerLabel !== ''
      ? ` data-center-label="${escapeHtml(String(centerLabel))}"`
      : '';

    return `
      <article class="${escapeHtml(cardClasses)}">
        <header class="gd-card-header">
          ${titleMarkup}
          ${headerActionMarkup}
        </header>
        ${summaryMarkup}
        <div class="${escapeHtml(chartClasses)}" style="min-height: ${escapeHtml(height)};${extraWrapStyle}">
          <canvas id="${escapeHtml(canvasId)}" aria-label="${escapeHtml(ariaLabel)}" role="img"${centerValueAttr}${centerLabelAttr}></canvas>
        </div>
        ${legendMarkup}
      </article>
    `;
  }

  const cardClasses = ['card', 'border-0', 'shadow-sm', 'h-100', 'fp-card-rounded-lg', cardClass]
    .filter(Boolean)
    .join(' ');
  const chartClasses = ['flex-grow-1', 'position-relative', 'fp-chart-canvas-wrap', chartWrapClass]
    .filter(Boolean)
    .join(' ');
  const extraWrapStyle = chartWrapStyle ? ` ${escapeHtml(chartWrapStyle)}` : '';
  const centerValueAttr = centerValue !== null && centerValue !== undefined && centerValue !== ''
    ? ` data-center-value="${escapeHtml(String(centerValue))}"`
    : '';
  const centerLabelAttr = centerLabel !== null && centerLabel !== undefined && centerLabel !== ''
    ? ` data-center-label="${escapeHtml(String(centerLabel))}"`
    : '';

  return `
    <article class="${escapeHtml(cardClasses)}">
      <div class="card-body p-4 d-flex flex-column">
        ${titleMarkup}
        ${summaryMarkup}
        <div class="${escapeHtml(chartClasses)}" style="min-height:${escapeHtml(height)};${extraWrapStyle}">
          <canvas id="${escapeHtml(canvasId)}" aria-label="${escapeHtml(ariaLabel)}" role="img"${centerValueAttr}${centerLabelAttr}></canvas>
        </div>
      </div>
    </article>
  `;
}

export function graficoTorta({
  title,
  canvasId,
  ariaLabel,
  height = '250px',
  dashboardStyle = false,
  cardClass = '',
  headerActionMarkup = '',
  chartWrapClass = '',
  chartWrapStyle = '',
  summaryItems = [],
  legendContainerId = '',
  centerValue = null,
  centerLabel = null,
} = {}) {
  return renderChartCard({
    title,
    canvasId,
    ariaLabel,
    height,
    dashboardStyle,
    cardClass,
    headerActionMarkup,
    chartWrapClass,
    chartWrapStyle,
    summaryItems,
    legendContainerId,
    centerValue,
    centerLabel,
  });
}

export function graficoGastos({
  title,
  canvasId,
  ariaLabel,
  height = '300px',
  dashboardStyle = false,
  cardClass = '',
  headerActionMarkup = '',
  chartWrapClass = '',
  chartWrapStyle = '',
  summaryItems = [],
} = {}) {
  return renderChartCard({
    title,
    canvasId,
    ariaLabel,
    height,
    dashboardStyle,
    cardClass,
    headerActionMarkup,
    chartWrapClass,
    chartWrapStyle,
    summaryItems,
  });
}

export function renderDashboardExpenseCard({
  title = null,
  actionHref = '',
  actionText = null,
  actionClassName = 'gd-top-btn',
  actionIconClass = 'lni lni-chevron-right',
  expenses = [],
  showDescription = false,
  showActions = false,
  showTipo = false,
  columnLayout = 'default',
  emptyMessage = null,
  cardClass = '',
  cardStyle = '',
  rowMapper = null,
} = {}) {
  const resolvedTitle = title ?? t('reusable.lastMovements');
  const resolvedActionText = actionText ?? t('reusable.viewAllExpenses');
  const resolvedEmptyMessage = emptyMessage ?? t('reusable.noRecentExpenses');
  const cardClasses = ['gd-card', cardClass].filter(Boolean).join(' ');
  const cardStyleAttr = cardStyle ? ` style="${escapeHtml(cardStyle)}"` : '';
  const actionMarkup = actionHref
    ? enlaceVerTodo({
        href: actionHref,
        label: resolvedActionText,
        className: actionClassName,
        iconClass: actionIconClass,
      })
    : '';
  const tableExpenses = typeof rowMapper === 'function'
    ? expenses.map((expense) => rowMapper(expense))
    : expenses;

  return `
    <article class="${escapeHtml(cardClasses)}"${cardStyleAttr}>
      <div class="gd-card-header">
        <h2 class="gd-card-title">${escapeHtml(resolvedTitle)}</h2>
        ${actionMarkup}
      </div>

      ${renderExpenseTable({
        expenses: tableExpenses,
        showDescription,
        showActions,
        showTipo,
        columnLayout,
        emptyMessage: resolvedEmptyMessage,
      })}
    </article>
  `;
}

export function contenedorRecomendaciones({
  title = null,
  recommendations = [],
  emptyText = null,
  maxHeight = '',
  padding = '16px',
  cardClass = '',
  cardStyle = '',
  bodyStyle = '',
  titleClass = 'gd-card-title',
  titleStyle = '',
  itemsWrapperClass = 'gd-rec-advisory-list',
  itemRenderer = null,
  headerActionMarkup = '',
  itemClassName = '',
} = {}) {
  const formatRecommendationDate = (value) => {
    if (!value) return '';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const resolvedTitle = title ?? t('reusable.recommendations');
  const resolvedEmptyText = emptyText ?? t('reusable.noRecommendationsYet');
  const items = recommendations ?? [];
  const hasScrollableArea = Boolean(maxHeight);
  const scrollStyle = hasScrollableArea
    ? `max-height: ${escapeHtml(maxHeight)}; overflow-y: auto; padding-right: 12px;`
    : '';
  const cardStyleAttr = cardStyle ? ` style="${escapeHtml(cardStyle)}"` : '';
  const titleStyleAttr = titleStyle ? ` style="${escapeHtml(titleStyle)}"` : '';
  const listStyleAttr = [
    `padding: ${escapeHtml(padding)};`,
    bodyStyle,
    scrollStyle,
  ]
    .filter(Boolean)
    .join(' ');
  const resolvedItemClassName = itemClassName ? ` ${itemClassName}` : '';

  const renderItem = itemRenderer ?? ((item) => `
    <article class="gd-rec-advisory-item${resolvedItemClassName}">
      <div class="gd-rec-advisory-meta">
        <span class="gd-rec-advisory-date">${escapeHtml(formatRecommendationDate(item.fecha ?? item.date ?? item.createdAt ?? item.creadoEn))}${item.titulo ? ` | ${escapeHtml(item.titulo)}` : ''}</span>
      </div>
      <p class="gd-rec-advisory-body">${escapeHtml(item.texto)}</p>
    </article>
  `);

  return `
    <article class="gd-card ${escapeHtml(cardClass)}"${cardStyleAttr}>
      <div class="gd-card-header">
        <h2 class="${escapeHtml(titleClass)}"${titleStyleAttr}>${escapeHtml(resolvedTitle)}</h2>
        ${headerActionMarkup}
      </div>
      <div class="${escapeHtml(itemsWrapperClass)}" style="${listStyleAttr}">
          ${
            items.length === 0
              ? `<p class="gd-empty mb-0">${escapeHtml(resolvedEmptyText)}</p>`
              : items
                  .map(
                    (item) => renderItem(item),
                  )
                  .join('')
          }
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
    <article class="card border-0 shadow-sm fp-card-rounded-lg">
      <div class="card-body p-4">
        <h2 class="h5 mb-4 fw-bold text-dark">${title}</h2>
        <div class="d-flex flex-column gap-3">
          ${displayExpenses.length === 0
            ? `<p class="text-muted text-center py-3">${t('reusable.noRecentExpenses')}</p>`
            : displayExpenses.map(expense => {
                const config = categoryConfig[expense.categoria] || categoryConfig['Otros'];
                return `
                  <div class="d-flex align-items-center justify-content-between p-2 rounded-3 fp-expense-row">
                    <div class="d-flex align-items-center gap-3">
                      <div class="d-flex align-items-center justify-content-center rounded-circle ${config.bg} bg-opacity-10 ${config.color} fp-expense-row-category-icon">
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
                ${showAll ? t('reusable.viewLess') : t('reusable.viewAllExpenses')} <i class="lni ${showAll ? 'lni-chevron-up' : 'lni-chevron-down'} ms-1"></i>
              </button>
            </div>
          `
          : ''
        }
      </div>
    </article>
  `;
}

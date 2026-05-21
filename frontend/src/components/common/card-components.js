import { escapeHtml } from "../../utils/sanitize";
import { t } from "../../i18n";

export function tarjetaPublicaBase({
  bodyMarkup = '',
  cardClass = '',
  cardStyle = '',
  bodyClass = 'card-body p-4',
} = {}) {
  const cardClasses = ['card', 'border-0', 'shadow-sm', 'fp-card-rounded-lg', cardClass]
    .filter(Boolean)
    .join(' ');
  const cardStyleAttr = cardStyle ? ` style="${escapeHtml(cardStyle)}"` : '';

  return `
    <article class="${escapeHtml(cardClasses)}"${cardStyleAttr}>
      <div class="${escapeHtml(bodyClass)}">
        ${bodyMarkup}
      </div>
    </article>
  `;
}

export function tarjetaPublicaConTitulo({
  title,
  contentMarkup = '',
  titleTag = 'h6',
  titleClass = 'fw-bold mb-3 border-bottom pb-2 fp-card-title-divider',
  titleStyle = '',
  cardClass = '',
  cardStyle = '',
  bodyClass = 'card-body p-4',
} = {}) {
  const safeTitle = String(title || '').trim();
  const normalizedTag = String(titleTag || 'h6').toLowerCase();
  const allowedTitleTags = new Set(['h2', 'h3', 'h4', 'h5', 'h6', 'p']);
  const safeTitleTag = allowedTitleTags.has(normalizedTag)
    ? normalizedTag
    : 'h6';
  const titleStyleAttr = titleStyle ? ` style="${escapeHtml(titleStyle)}"` : '';

  return tarjetaPublicaBase({
    cardClass,
    cardStyle,
    bodyClass,
    bodyMarkup: `
        <${safeTitleTag} class="${escapeHtml(titleClass)}"${titleStyleAttr}>${escapeHtml(safeTitle)}</${safeTitleTag}>
      ${contentMarkup}
    `,
  });
}

// tiene foto, titulo y descripcion
export function tarjetaLandingPage({
  title,
  description,
  iconClass = '',
  iconImageSrc = '',
  iconImageFallbackSrc = '',
  iconAlt = '',
  iconHtml = '',
  descriptionClassName = '',
} = {}) {
  const iconMarkup = iconHtml
    ? iconHtml
    : iconImageSrc
      ? iconImageFallbackSrc
        ? `
        <picture>
          <source srcset="${escapeHtml(iconImageSrc)}" type="image/webp" />
          <img src="${escapeHtml(iconImageFallbackSrc)}" alt="${escapeHtml(iconAlt || title)}" class="fp-feature-card-icon-image" />
        </picture>
      `
        : `<img src="${escapeHtml(iconImageSrc)}" alt="${escapeHtml(iconAlt || title)}" class="fp-feature-card-icon-image" />`
      : `<i class="lni ${escapeHtml(iconClass)}"></i>`;

  return `
    <div class="col-lg-4 col-md-8 col-sm-10">
      <div class="single-feature fp-feature-card">
        <div class="icon fp-feature-card-icon">
          ${iconMarkup}
        </div>
        <div class="content fp-feature-card-content">
          <h3 class="fp-feature-card-title">${escapeHtml(title)}</h3>
          <p class="fp-feature-card-description ${escapeHtml(descriptionClassName)}">
            ${escapeHtml(description)}
          </p>
        </div>
      </div>
    </div>
  `;
}

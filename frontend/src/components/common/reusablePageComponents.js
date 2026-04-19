export function encabezadoInterno({
  pageTitle = '',
  profileImage = '/assets/img/user-avatar-default.svg',
  profileName = 'Usuario',
  currentRole = 'Usuario',
  isAsesor = false,
  brandTarget = '/dashboard',
  advisorClientHref = '/dashboard/asesor',
  showAdvisorClientLink = false,
  transparent = false,
} = {}) {
  const roleLabel = isAsesor ? 'Asesor' : 'Usuario';
  const brandAction = brandTarget === 'scroll-top' ? 'brand-scroll-top' : 'brand-navigation';
  const headerClasses = ['py-3', 'px-4', 'd-flex', 'justify-content-between', 'align-items-center', 'gap-3'];

  if (!transparent) {
    headerClasses.unshift('shadow-sm');
  }

  const headerStyle = transparent
    ? 'background-color: transparent; backdrop-filter: none; z-index: 999; min-height: 80px;'
    : 'background-color: var(--app-header-bg, #eef2f6); z-index: 999; min-height: 80px;';

  return `
    <!-- ======== Topbar start ======== -->
    <header class="${escapeHtml(headerClasses.join(' '))}" style="${headerStyle}">
      <div class="d-flex align-items-center gap-3">
        <button type="button" class="btn p-0 border-0 bg-transparent d-inline-flex align-items-center gap-2 d-none d-sm-inline-flex ms-1 text-decoration-none" data-action="${escapeHtml(brandAction)}" data-target="${escapeHtml(brandTarget)}" aria-label="Ir a FinanzasPro" style="cursor: pointer; line-height: 1; white-space: nowrap;">
          <span class="d-inline-flex align-items-center justify-content-center rounded-circle shadow-sm overflow-hidden flex-shrink-0" style="width: 31px; height: 31px; background: transparent;">
            <img src="/assets/img/logo/iconoSfondo.png" alt="Icono FinanzasPro" style="width: 100%; height: 100%; object-fit: cover; display: block;">
          </span>
          <h4 class="mb-0 fw-bold text-dark fs-5" style="letter-spacing: -0.5px; line-height: 1; margin-top: 1px;">FinanzasPro</h4>
        </button>
        ${pageTitle
          ? `<span class="ms-sm-3 text-muted fw-semibold d-none d-md-block border-start ps-sm-3 border-2">${escapeHtml(pageTitle)}</span>`
          : ''}
      </div>

      <div class="d-flex align-items-center gap-2 gap-md-3">
        <div class="dropdown">
          <button class="btn btn-outline-primary btn-sm fw-semibold dropdown-toggle shadow-sm" type="button" id="roleSwitcher" data-bs-toggle="dropdown" aria-expanded="false" style="border-radius: 999px; min-width: 150px;">
            ${escapeHtml(roleLabel)}
          </button>
          <ul class="dropdown-menu dropdown-menu-end shadow border-0 mt-3" aria-labelledby="roleSwitcher" style="border-radius: 12px; min-width: 210px;">
            <li>
              <a class="dropdown-item py-2 fw-semibold text-dark ${!isAsesor ? 'bg-primary bg-opacity-10 text-primary' : ''}" href="/dashboard" data-link>
                <i class="lni lni-user me-2"></i> Usuario
              </a>
            </li>
            <li>
              <a class="dropdown-item py-2 fw-semibold text-dark ${isAsesor ? 'bg-primary bg-opacity-10 text-primary' : ''}" href="/dashboard/asesor" data-link>
                <i class="lni lni-briefcase me-2"></i> Asesor
              </a>
            </li>
          </ul>
        </div>

        <div class="dropdown">
          <a href="#" class="d-block text-decoration-none" id="dropdownUser" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Abrir menú de usuario">
            <img src="${escapeHtml(profileImage)}" class="rounded-circle border border-2 border-primary shadow-sm" alt="Perfil" style="width: 45px; height: 45px; object-fit: cover; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
          </a>
          <ul class="dropdown-menu dropdown-menu-end shadow border-0 mt-3" aria-labelledby="dropdownUser" style="border-radius: 12px; min-width: 250px;">
            <li class="px-3 py-2 border-bottom mb-1">
              <div class="d-flex align-items-center gap-3">
                <img src="${escapeHtml(profileImage)}" class="rounded-circle" alt="Perfil" style="width: 40px; height: 40px; object-fit: cover;">
                <div>
                  <p class="mb-0 fw-bold text-dark lh-sm" style="font-size: 15px;">${escapeHtml(profileName)}</p>
                  <small class="text-muted fw-semibold" style="font-size: 12px;">${escapeHtml(currentRole)}</small>
                </div>
              </div>
            </li>
            <li><a class="dropdown-item py-2 fw-semibold text-dark" href="/dashboard" data-link><i class="lni lni-grid-alt me-2"></i> Mi Dasboard</a></li>
            ${showAdvisorClientLink ? `<li><a class="dropdown-item py-2 fw-semibold text-dark" href="${escapeHtml(advisorClientHref)}" data-link><i class="lni lni-users me-2"></i> Ver otro cliente</a></li>` : ''}
            <li><a class="dropdown-item py-2 fw-semibold text-dark" href="/perfil/editar" data-link><i class="lni lni-user me-2"></i> Editar perfil</a></li>
            <li><a class="dropdown-item py-2 fw-semibold text-dark" href="/perfil/configuracion" data-link><i class="lni lni-cog me-2"></i> Configuración</a></li>
            <li><a class="dropdown-item py-2 fw-semibold text-dark" href="/perfil/notificaciones" data-link><i class="lni lni-alarm me-2"></i> Notificaciones</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><button type="button" class="dropdown-item py-2 fw-bold text-danger border-0 bg-transparent text-start" data-action="logout"><i class="lni lni-exit me-2"></i> Cerrar Sesión</button></li>
          </ul>
        </div>
      </div>
    </header>
    <!-- ======== Topbar end ======== -->
  `;
}

export function encabezadoExterno({
  rightHref = '/',
  rightText = 'Volver al Inicio',
  rightClass = '',
  withLightBackground = false,
  rightMarkup = '',
} = {}) {
  const headerStyle = withLightBackground
    ? 'z-index: 999; background-color: var(--app-header-overlay, rgba(226, 232, 240, 0.95)); backdrop-filter: blur(4px);'
    : 'z-index: 999;';

  return `
    <!-- ======== header start ======== -->
    <header class="header position-relative" style="${headerStyle}">
      <div class="navbar-area">
        <div class="container">
          <div class="row align-items-center">
            <div class="col-lg-12">
              <nav class="navbar navbar-expand-lg d-flex justify-content-between py-3">
                <a class="navbar-brand d-inline-flex align-items-center gap-2" href="/" data-link style="line-height: 1; white-space: nowrap;">
                  <span class="d-inline-flex align-items-center justify-content-center rounded-circle shadow-sm overflow-hidden flex-shrink-0" style="width: 31px; height: 31px; background: transparent;">
                    <img src="/assets/img/logo/iconoSfondo.png" alt="Icono FinanzasPro" style="width: 100%; height: 100%; object-fit: cover; display: block;">
                  </span>
                  <span class="fw-bold text-white fs-5" style="letter-spacing: -0.4px; line-height: 1; margin-top: 1px;">FinanzasPro</span>
                </a>
                ${rightMarkup || botonEncabezadoExterno({
                  href: rightHref,
                  text: rightText,
                  className: rightClass,
                  sizeClass: 'btn-sm',
                })}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </header>
    <!-- ======== header end ======== -->
  `;
}

export function botonScrollTop() {
  return `
    <button type="button" class="scroll-top btn-hover" data-action="scroll-top-page" aria-label="Volver al comienzo">
      <span class="scroll-top-triangle" aria-hidden="true"></span>
    </button>
  `;
}

// Se utiliza para Acceder, Volver al Inicio
export function botonEncabezadoExterno({
  href = '/',
  text = 'Acceder',
  className = '',
  sizeClass = 'btn-sm',
  wowDelay = '',
} = {}) {
  const classes = ['main-btn', 'border-btn', 'btn-hover', 'boton-outline-reusable'];

  if (sizeClass) {
    classes.push(sizeClass);
  }

  if (wowDelay) {
    classes.push('wow', 'fadeInUp');
  }

  if (className) {
    classes.push(className);
  }

  const wowDelayAttribute = wowDelay ? ` data-wow-delay="${escapeHtml(wowDelay)}"` : '';

  return `<a href="${escapeHtml(href)}" data-link class="${escapeHtml(classes.join(' '))}"${wowDelayAttribute}>${escapeHtml(text)}</a>`;
}

export function botonIniciarCrearCuenta({
  text,
  type = 'button',
  className = 'main-btn btn-hover w-100 mb-4',
  style = 'border-radius: 8px;',
  iconHtml = '',
  id = '',
} = {}) {
  const idAttr = id ? ` id="${escapeHtml(id)}"` : '';
  const iconMarkup = iconHtml ? `<span class="d-inline-flex align-items-center">${iconHtml}</span>` : '';
  const textMarkup = `<span>${escapeHtml(text)}</span>`;
  const content = iconHtml
    ? `<span class="d-flex align-items-center justify-content-center gap-3">${iconMarkup}${textMarkup}</span>`
    : textMarkup;

  return `<button type="${escapeHtml(type)}" class="${escapeHtml(className)}" style="${escapeHtml(style)}"${idAttr}>${content}</button>`;
}

// tiene foto, titulo y descripcion
export function tarjetaLandingPage({
  title,
  description,
  iconClass = '',
  iconImageSrc = '',
  iconAlt = '',
} = {}) {
  const iconMarkup = iconImageSrc
    ? `<img src="${escapeHtml(iconImageSrc)}" alt="${escapeHtml(iconAlt || title)}" style="width: 100%; height: 100%; object-fit: cover; object-position: center; display: block;" />`
    : `<i class="lni ${escapeHtml(iconClass)}"></i>`;

  return `
    <div class="col-lg-4 col-md-8 col-sm-10">
      <div class="single-feature">
        <div class="icon">
          ${iconMarkup}
        </div>
        <div class="content">
          <h3>${escapeHtml(title)}</h3>
          <p>
            ${escapeHtml(description)}
          </p>
        </div>
      </div>
    </div>
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

  return `
    <div class="${escapeHtml(wrapperClass)}"${delayAttr}${styleAttr}>
      <img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" class="${escapeHtml(imageClass)}"${imageStyleAttr} />
      ${extraMarkup}
    </div>
  `;
}

export function tarjetaValor({
  title,
  value,
  color = 'primary',
  icon = 'lni-bar-chart',
  variant = 'filled',
  hasButton = false,
  buttonAction = '',
  buttonId = '',
} = {}) {
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
        className: 'btn btn-light btn-sm fw-bold shadow-sm border-0',
        dataAttributes: { action: buttonAction, id: buttonId },
        ariaLabel: `Accion para ${title}`,
        title: `Accion para ${title}`,
        style: 'position: absolute; right: 8px; top: 50%; transform: translateY(-50%); border-radius: 50%; width: 24px; height: 24px; padding: 0; display: flex; align-items: center; justify-content: center; z-index: 2; color: #0d6efd; font-size: 16px; line-height: 1;',
      })
    : '';

  return `
    <article class="card border-0 shadow-sm kpi-value-card kpi-${escapeHtml(color)} ${cardClasses}" style="border-radius: 15px; min-height: 90px;">
      <div class="card-body p-3 position-relative overflow-hidden d-flex flex-column justify-content-center">
        <div class="position-absolute opacity-25" style="top: -5px; right: -5px; font-size: 60px; transform: rotate(-10deg);">
          <i class="lni ${escapeHtml(icon)}"></i>
        </div>
        <p class="mb-1 fw-semibold ${mutedColor}" style="z-index: 1; position: relative; font-size: 13px;">${escapeHtml(title)}</p>
        <h2 class="mb-0 fw-bold ${textColor}" style="z-index: 1; position: relative; font-size: 16px;">${escapeHtml(value)}</h2>
        ${buttonHTML}
      </div>
    </article>
  `;
}

export function botonMasAccion({
  dataAttributes = {},
  ariaLabel = 'Agregar',
  title = 'Agregar',
  className = 'btn btn-primary btn-sm fw-bold shadow-sm',
  style = 'border-radius: 50%; width: 32px; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 18px; line-height: 1;',
} = {}) {
  const dataAttrs = Object.entries(dataAttributes)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => ` data-${escapeHtml(key)}="${escapeHtml(String(value))}"`)
    .join('');

  return `<button type="button" class="${escapeHtml(className)}" style="${escapeHtml(style)}" aria-label="${escapeHtml(ariaLabel)}" title="${escapeHtml(title)}"${dataAttrs}><span style="display:block; line-height:1; transform: translateY(-1px);">+</span></button>`;
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

export function tarjetaAhorro({ ahorro, formatCurrency }) {
  const progress = ahorro.meta ? Math.min((ahorro.monto / ahorro.meta) * 100, 100) : 0;

  return `
    <div class="col-12 col-lg-4">
      <div class="p-4 bg-white border shadow-sm" style="border-radius: 12px; border-color: rgba(13, 110, 253, 0.24) !important; box-shadow: 0 10px 22px rgba(13, 110, 253, 0.12) !important; transition: transform 0.2s, box-shadow 0.2s;">
        <div class="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h3 class="h6 fw-bold mb-1 text-dark">${escapeHtml(ahorro.nombre)}</h3>
            <span class="badge bg-primary bg-opacity-10 text-primary px-2 py-1" style="border-radius: 6px;">${formatCurrency(ahorro.monto)}</span>
          </div>
          ${botonMasAccion({
            className: 'btn btn-primary btn-sm fw-bold shadow-sm border-0',
            dataAttributes: { action: 'open-destino-modal', 'ahorro-id': ahorro.id },
            ariaLabel: `Destinar fondos a ${ahorro.nombre}`,
            title: 'Destinar fondos desde Saldo Actual',
            style: 'border-radius: 50%; width: 32px; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 18px; line-height: 1;',
          })}
        </div>
        ${
          ahorro.meta
            ? `
              <div>
                <div class="d-flex justify-content-between mb-1">
                  <small class="text-muted fw-semibold" style="font-size: 12px;">Progreso</small>
                  <small class="text-muted fw-semibold" style="font-size: 12px;">Meta: ${formatCurrency(ahorro.meta)}</small>
                </div>
                <div class="progress" style="height: 8px; border-radius: 4px; background-color: #e2e8f0;">
                  <div class="progress-bar bg-success" role="progressbar" style="width: ${progress}%; border-radius: 4px;"></div>
                </div>
              </div>
            `
            : ''
        }
      </div>
    </div>
  `;
}

export function graficoTorta({ title, canvasId, ariaLabel, height = '250px' }) {
  return `
    <article class="card border-0 shadow-sm h-100" style="border-radius: 15px;">
      <div class="card-body p-4 d-flex flex-column">
        <h2 class="h5 mb-4 fw-bold text-dark">${escapeHtml(title)}</h2>
        <div class="flex-grow-1 position-relative" style="min-height:${escapeHtml(height)}; width: 100%;">
          <canvas id="${escapeHtml(canvasId)}" aria-label="${escapeHtml(ariaLabel)}" role="img"></canvas>
        </div>
      </div>
    </article>
  `;
}

export function graficoGastos({ title, canvasId, ariaLabel, height = '300px' }) {
  return `
    <article class="card border-0 shadow-sm h-100" style="border-radius: 15px;">
      <div class="card-body p-4 d-flex flex-column">
        <h2 class="h5 mb-4 fw-bold text-dark">${escapeHtml(title)}</h2>
        <div class="flex-grow-1 position-relative" style="min-height:${escapeHtml(height)}; width: 100%;">
          <canvas id="${escapeHtml(canvasId)}" aria-label="${escapeHtml(ariaLabel)}" role="img"></canvas>
        </div>
      </div>
    </article>
  `;
}

export function contenedorRecomendaciones({
  title = 'Recomendaciones',
  recommendations = [],
  emptyText = 'No hay recomendaciones aun',
  maxHeight = '',
  padding = '16px',
  titleIcon = 'bi bi-lightbulb',
  cardStyle = 'border-radius: 15px;',
  bodyStyle = '',
  titleClass = 'mb-0',
  titleStyle = 'font-size: 16px; margin-bottom: 8px !important;',
  itemsWrapperClass = 'd-flex flex-column gap-2',
  itemRenderer = null,
} = {}) {
  const items = recommendations ?? [];
  const hasScrollableArea = Boolean(maxHeight);
  const scrollStyle = hasScrollableArea
    ? `max-height: ${escapeHtml(maxHeight)}; overflow-y: auto; padding-right: 12px;`
    : '';

  const renderItem = itemRenderer ?? ((item, index) => `
    <div class="alert ${index % 2 === 0 ? 'alert-info' : 'alert-warning'} alert-sm mb-0" style="padding: 8px 16px;" role="alert">
      <small style="font-size: 14px;"><strong>${escapeHtml(item.fecha)}:</strong> ${escapeHtml(item.texto)}</small>
    </div>
  `);

  return `
    <article class="card border-0 shadow-sm" style="${escapeHtml(cardStyle)}">
      <div class="card-body" style="padding: ${escapeHtml(padding)};${bodyStyle ? ` ${escapeHtml(bodyStyle)}` : ''}${scrollStyle ? ` ${scrollStyle}` : ''}">
        <h2 class="${escapeHtml(titleClass)}" style="${escapeHtml(titleStyle)}"><i class="${escapeHtml(titleIcon)} me-2"></i>${escapeHtml(title)}</h2>
        <div class="${escapeHtml(itemsWrapperClass)}">
          ${
            items.length === 0
              ? `<p class="text-muted small mb-0">${escapeHtml(emptyText)}</p>`
              : items
                  .map(
                    (item, index) => renderItem(item, index),
                  )
                  .join('')
          }
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

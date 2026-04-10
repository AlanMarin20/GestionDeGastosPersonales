export function encabezadoInterno({
  pageTitle = '',
  profileImage = '/assets/img/user-avatar-default.svg',
  profileName = 'Usuario',
  currentRole = 'Usuario',
  isAsesor = false,
} = {}) {
  return `
    <!-- ======== Topbar start ======== -->
    <header class="shadow-sm py-3 px-4 d-flex justify-content-between align-items-center" style="background-color: #eef2f6; z-index: 999; height: 80px;">
      <div class="d-flex align-items-center gap-3">
        <button class="btn border-0 shadow-sm d-flex flex-column align-items-center justify-content-center gap-1" type="button" data-bs-toggle="offcanvas" data-bs-target="#sidebarMenu" aria-label="Abrir menú" style="background-color: #ffffff; color: #1e293b; width: 40px; height: 40px; border-radius: 50%;">
          <span style="display:block;width:16px;height:2px;background-color:#1e293b;border-radius:2px;"></span>
          <span style="display:block;width:16px;height:2px;background-color:#1e293b;border-radius:2px;"></span>
          <span style="display:block;width:16px;height:2px;background-color:#1e293b;border-radius:2px;"></span>
        </button>

        <div class="d-flex align-items-center gap-2 d-none d-sm-flex ms-1">
          <div class="bg-primary text-white d-flex align-items-center justify-content-center rounded-circle shadow-sm" style="width: 35px; height: 35px;">
            <i class="lni lni-wallet"></i>
          </div>
          <h4 class="mb-0 fw-bold text-dark fs-5" style="letter-spacing: -0.5px;">FinanzasPro</h4>
        </div>
        ${pageTitle
          ? `<span class="ms-sm-3 text-muted fw-semibold d-none d-md-block border-start ps-sm-3 border-2">${escapeHtml(pageTitle)}</span>`
          : ''}
      </div>

      <div class="d-flex align-items-center">
        <div class="dropdown">
          <a href="#" class="d-block text-decoration-none" id="dropdownUser" data-bs-toggle="dropdown" aria-expanded="false">
            <img src="${escapeHtml(profileImage)}" class="rounded-circle border border-2 border-primary shadow-sm" alt="Perfil" style="width: 45px; height: 45px; object-fit: cover; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
          </a>
          <ul class="dropdown-menu dropdown-menu-end shadow border-0 mt-3" aria-labelledby="dropdownUser" style="border-radius: 12px; min-width: 220px;">
            <li class="px-3 py-2 border-bottom mb-1">
              <div class="d-flex align-items-center gap-3">
                <img src="${escapeHtml(profileImage)}" class="rounded-circle" alt="Perfil" style="width: 40px; height: 40px; object-fit: cover;">
                <div>
                  <p class="mb-0 fw-bold text-dark lh-sm" style="font-size: 15px;">${escapeHtml(profileName)}</p>
                  <small class="text-muted fw-semibold" style="font-size: 12px;">${escapeHtml(currentRole)}</small>
                </div>
              </div>
            </li>
            <li><a class="dropdown-item py-2 fw-semibold text-dark ${!isAsesor ? 'bg-primary bg-opacity-10 text-primary' : ''}" href="/dashboard" data-link><i class="lni lni-user me-2"></i> Vista Usuario</a></li>
            <li><a class="dropdown-item py-2 fw-semibold text-dark ${isAsesor ? 'bg-primary bg-opacity-10 text-primary' : ''}" href="/dashboard/asesor" data-link><i class="lni lni-briefcase me-2"></i> Vista Asesor</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item py-2 fw-bold text-danger" href="/login" data-link><i class="lni lni-exit me-2"></i> Cerrar Sesión</a></li>
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
  withLightBackground = false,
} = {}) {
  const headerStyle = withLightBackground
    ? 'z-index: 999; background-color: rgba(226, 232, 240, 0.95); backdrop-filter: blur(4px);'
    : 'z-index: 999;';

  return `
    <!-- ======== header start ======== -->
    <header class="header position-relative" style="${headerStyle}">
      <div class="navbar-area">
        <div class="container">
          <div class="row align-items-center">
            <div class="col-lg-12">
              <nav class="navbar navbar-expand-lg d-flex justify-content-between py-3">
                <a class="navbar-brand d-flex align-items-center gap-2" href="/" data-link>
                  <span class="bg-primary text-white d-flex align-items-center justify-content-center rounded-circle shadow-sm" style="width: 34px; height: 34px;">
                    <i class="lni lni-wallet"></i>
                  </span>
                  <span class="fw-bold text-dark fs-5" style="letter-spacing: -0.4px;">FinanzasPro</span>
                </a>
                <a href="${escapeHtml(rightHref)}" data-link class="main-btn border-btn btn-hover btn-sm">${escapeHtml(rightText)}</a>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </header>
    <!-- ======== header end ======== -->
  `;
}

export function graficoTorta({ title, canvasId, ariaLabel }) {
  return `
    <article class="card border-0 shadow-sm h-100" style="border-radius: 15px;">
      <div class="card-body p-4 d-flex flex-column">
        <h2 class="h5 mb-4 fw-bold text-dark">${escapeHtml(title)}</h2>
        <div class="flex-grow-1 position-relative" style="min-height: 250px; width: 100%;">
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

import { renderDashboardAppLayout } from "../components/dashboard/dashboardAppLayout";
import { tarjetaValor } from "../components/common/reusablePageComponents";
import { escapeHtml } from "../utils/sanitize";

const SETTINGS_NAV_GROUPS = [
  {
    label: "Cuenta",
    items: [
      { id: "perfil", label: "Mi perfil", icon: "lni lni-user" },
      { id: "seguridad", label: "Seguridad", icon: "lni lni-lock-alt" },
      { id: "sesiones", label: "Sesiones", icon: "lni lni-tab" },
    ],
  },
  {
    label: "Finanzas",
    items: [
      { id: "presupuestos", label: "Presupuestos", icon: "lni lni-wallet" },
      { id: "categorias", label: "Categorias", icon: "lni lni-tag" },
    ],
  },
  {
    label: "Asesoria",
    items: [
      { id: "asesoria", label: "Asesor", icon: "lni lni-user" },
    ],
  },
  {
    label: "Preferencias",
    items: [
      { id: "notificaciones", label: "Notificaciones", icon: "lni lni-alarm" },
      { id: "apariencia", label: "Apariencia", icon: "lni lni-night" },
      { id: "datos", label: "Mis datos", icon: "lni lni-database" },
    ],
  },
  {
    label: "Plan",
    items: [
      { id: "plan", label: "Plan actual", icon: "lni lni-rocket" },
      { id: "danger", label: "Zona peligrosa", icon: "lni lni-warning" },
    ],
  },
];

const SETTINGS_SECTION_IDS = SETTINGS_NAV_GROUPS.reduce((ids, group) => {
  group.items.forEach((item) => {
    ids.push(item.id);
  });
  return ids;
}, []);

const DEFAULT_SETTINGS_SECTION = "perfil";

function getAdvisorInitials(name) {
  const words = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "AS";
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function resolveActiveSettingsSection() {
  if (typeof window === "undefined") {
    return DEFAULT_SETTINGS_SECTION;
  }

  const hashValue = String(window.location.hash || "");
  const parsed = hashValue.startsWith("#config-")
    ? hashValue.slice("#config-".length)
    : "";

  return SETTINGS_SECTION_IDS.includes(parsed)
    ? parsed
    : DEFAULT_SETTINGS_SECTION;
}

function renderSettingsNav(activeSection, alertsCount = 0) {
  return SETTINGS_NAV_GROUPS.map((group) => {
    const items = group.items
      .map((item) => {
        const isActive = item.id === activeSection;
        const badge = item.id === "notificaciones" && alertsCount > 0
          ? `<span class="gd-settings-nav-badge">${escapeHtml(String(alertsCount))}</span>`
          : "";

        return `
          <button
            type="button"
            class="gd-settings-nav-item ${isActive ? "active" : ""}"
            data-config-section-target="${escapeHtml(item.id)}"
            aria-controls="config-section-${escapeHtml(item.id)}"
            aria-selected="${isActive ? "true" : "false"}"
          >
            <i class="${escapeHtml(item.icon)}" aria-hidden="true"></i>
            <span>${escapeHtml(item.label)}</span>
            ${badge}
          </button>
        `;
      })
      .join("");

    return `
      <div class="gd-settings-nav-group">
        <p class="gd-settings-nav-label">${escapeHtml(group.label)}</p>
        ${items}
      </div>
    `;
  }).join("");
}

export function renderConfiguracionCuentaPage({
  state,
  profileImage,
  profileName,
}) {
  const config = state.configuracion;
  const recomendacionesPendientes = state.finanzas?.recomendaciones?.length || 0;
  const activeSection = resolveActiveSettingsSection();
  const safeName = String(profileName || "Usuario").trim() || "Usuario";
  const nameParts = safeName.split(/\s+/).filter(Boolean);
  const firstName = nameParts[0] || "Usuario";
  const lastName = nameParts.slice(1).join(" ");
  const profileEmail = String(state.perfil?.email || "usuario@finanzaspro.app");
  const roleValue = String(
    state.currentUser?.role || state.currentUser?.rol || "",
  ).toLowerCase();
  const roleLabel = roleValue === "asesor" ? "asesor" : "usuario";
  const initials = nameParts.length > 1
    ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
    : firstName.slice(0, 2).toUpperCase();

  const budgetRows = [
    { label: "Supermercado", usage: 82, color: "#38bdf8", amount: "60000" },
    { label: "Transporte", usage: 55, color: "#0ea5e9", amount: "40000" },
    { label: "Entretenimiento", usage: 95, color: "#ef4444", amount: "20000" },
    { label: "Salud", usage: 40, color: "#2563eb", amount: "15000" },
    { label: "Restaurantes", usage: 30, color: "#14b8a6", amount: "25000" },
  ];

  const customCategories = [
    { label: "Supermercado", kind: "Sistema", color: "#38bdf8" },
    { label: "Transporte", kind: "Sistema", color: "#0ea5e9" },
    { label: "Vacaciones", kind: "Personal", color: "#8b5cf6" },
    { label: "Trabajo", kind: "Personal", color: "#f59e0b" },
    { label: "Hogar", kind: "Personal", color: "#ef4444" },
  ];

  const themeLabel = {
    light: "Claro",
    dark: "Oscuro",
    system: "Sistema",
  }[config.tema] || "Sistema";
  const fontSizeLabel = {
    sm: "Pequeno",
    md: "Normal",
    lg: "Grande",
  }[config.tamanioFuente] || "Normal";
  const densityLabel = {
    comfortable: "Comoda",
    compact: "Compacta",
  }[config.densidad] || "Comoda";
  const advisorLink = config.asesoria?.asesor || null;
  const advisorRequest = config.asesoria?.solicitud || {};
  const advisorName = String(advisorLink?.nombre || "").trim();
  const advisorEmail = String(advisorLink?.email || "").trim();
  const advisorSpecialty = String(advisorLink?.especialidad || "").trim();
  const advisorCode = String(advisorLink?.codigoVerificacion || "").trim();
  const advisorInitials = getAdvisorInitials(advisorName);
  const advisorHasProfile = Boolean(advisorLink);
  const advisorStatusLabel = advisorHasProfile ? "Vinculado" : "Sin asesor vinculado";

  const content = `
    <section class="gd-settings-shell">
      <aside class="gd-settings-nav" aria-label="Subsecciones de configuracion">
        ${renderSettingsNav(activeSection, recomendacionesPendientes)}
      </aside>

      <div class="gd-settings-content">
        <section
          id="config-section-perfil"
          class="gd-settings-panel ${activeSection === "perfil" ? "active" : ""}"
          data-config-section="perfil"
          ${activeSection === "perfil" ? "" : "hidden"}
        >
          <article class="gd-card">
            <div class="gd-settings-profile-head">
              <div class="gd-settings-avatar-wrap">
                <label for="configProfileImageInput" class="gd-settings-avatar-image-trigger" aria-label="Cambiar foto de perfil">
                  <img
                    src="${escapeHtml(profileImage || "/assets/img/user-avatar-default.svg")}" 
                    alt="Avatar de ${escapeHtml(safeName)}"
                    class="gd-settings-avatar-image"
                    data-image-error-mode="toggle-next"
                  >
                  <span class="gd-settings-avatar-fallback d-none" aria-hidden="true">${escapeHtml(initials)}</span>
                </label>
              </div>

              <div class="gd-settings-profile-copy">
                <p class="gd-card-title">Mi perfil</p>
                <p class="gd-settings-profile-name">${escapeHtml(safeName)}</p>
                <p class="gd-muted mb-0">${escapeHtml(profileEmail)}</p>
              </div>

              <div class="gd-settings-avatar-actions">
                <label for="configProfileImageInput" class="gd-action-btn">Cambiar foto</label>
                <input id="configProfileImageInput" type="file" class="d-none" accept="image/*">
              </div>
            </div>

            <div class="gd-metrics gd-metrics-3 gd-settings-stats">
              ${[
                {
                  title: "gastos cargados",
                  value: String(state.finanzas?.gastos?.length || 0),
                },
                {
                  title: "sesiones activas",
                  value: String(state.configuracion?.sesiones?.length || 0),
                },
                {
                  title: "score financiero",
                  value: "74",
                },
              ]
                .map((metric) => tarjetaValor({
                  title: "",
                  value: metric.value,
                  delta: "",
                  layout: "dashboard-metric",
                  dashboardValueClass: "gd-settings-stat-value",
                  dashboardExtraMarkup: `<span class="gd-settings-stat-label">${escapeHtml(metric.title)}</span>`,
                }))
                .join("")}
            </div>

            <div class="gd-form-grid">
              <div>
                <label class="gd-form-label" for="configNombre">Nombre</label>
                <input id="configNombre" class="gd-form-input" value="${escapeHtml(firstName)}">
              </div>
              <div>
                <label class="gd-form-label" for="configApellido">Apellido</label>
                <input id="configApellido" class="gd-form-input" value="${escapeHtml(lastName)}">
              </div>
              <div class="gd-form-full">
                <label class="gd-form-label" for="configEmail">Email</label>
                <input id="configEmail" class="gd-form-input" value="${escapeHtml(profileEmail)}">
              </div>
              <div>
                <label class="gd-form-label" for="configMoneda">Moneda</label>
                <select id="moneda" name="moneda" class="gd-form-select">
                  <option value="USD" ${config.moneda === "USD" ? "selected" : ""}>Dolar USD</option>
                  <option value="ARS" ${config.moneda === "ARS" ? "selected" : ""}>Peso argentino</option>
                  <option value="EUR" ${config.moneda === "EUR" ? "selected" : ""}>Euro</option>
                </select>
              </div>
              <div>
                <label class="gd-form-label" for="configTelefono">Telefono</label>
                <input id="configTelefono" class="gd-form-input" value="+54 9 11 4823-7741">
              </div>
            </div>

            <div class="d-flex justify-content-end gap-2 mt-3">
              <button type="button" class="gd-btn-secondary">Cancelar</button>
              <button type="button" class="gd-btn-primary">Guardar cambios</button>
            </div>
          </article>

          <article class="gd-card">
            <h2 class="gd-card-title mb-1">Perfil financiero</h2>
            <p class="gd-muted mb-3">Informacion usada para recomendaciones personalizadas del asesor.</p>
            <div class="gd-form-grid">
              <div>
                <label class="gd-form-label" for="configIngreso">Ingreso mensual estimado</label>
                <input id="configIngreso" type="number" class="gd-form-input" value="320000">
              </div>
              <div>
                <label class="gd-form-label" for="configAhorro">Objetivo de ahorro mensual</label>
                <input id="configAhorro" type="number" class="gd-form-input" value="80000">
              </div>
              <div class="gd-form-full">
                <label class="gd-form-label" for="configPerfilGasto">Perfil de gasto IA</label>
                <input id="configPerfilGasto" class="gd-form-input" value="Consumidor equilibrado" disabled>
              </div>
            </div>
          </article>
        </section>

        <section
          id="config-section-seguridad"
          class="gd-settings-panel ${activeSection === "seguridad" ? "active" : ""}"
          data-config-section="seguridad"
          ${activeSection === "seguridad" ? "" : "hidden"}
        >
          <article class="gd-card">
            <h2 class="gd-card-title mb-1">Contrasena y acceso</h2>
            <p class="gd-muted mb-3">Actualiza tus credenciales y fortalece la seguridad de tu cuenta.</p>

            <div class="gd-form-grid">
              <div class="gd-form-full">
                <label class="gd-form-label" for="passwordActual">Contrasena actual</label>
                <input id="passwordActual" type="password" class="gd-form-input" placeholder="••••••••">
              </div>
              <div>
                <label class="gd-form-label" for="passwordNueva">Nueva contrasena</label>
                <input id="passwordNueva" type="password" class="gd-form-input" placeholder="••••••••">
              </div>
              <div>
                <label class="gd-form-label" for="passwordConfirmar">Confirmar contrasena</label>
                <input id="passwordConfirmar" type="password" class="gd-form-input" placeholder="••••••••">
              </div>
            </div>

            <div class="gd-settings-toggle-row mt-3">
              <div>
                <p class="gd-card-title gd-card-title-xs mb-0">Autenticacion en dos pasos</p>
                <small class="gd-muted">Agrega un segundo factor al iniciar sesion.</small>
              </div>
              <input class="form-check-input mt-0" type="checkbox" id="autenticacionDos" ${config.autenticacionDos ? "checked" : ""}>
            </div>

            <div class="d-flex justify-content-end gap-2 mt-3">
              <button type="button" class="gd-btn-secondary">Cancelar</button>
              <button type="button" class="gd-btn-primary">Actualizar seguridad</button>
            </div>
          </article>

          <article class="gd-card">
            <h2 class="gd-card-title mb-1">Buenas practicas recomendadas</h2>
            <ul class="gd-policy-list mb-0">
              <li>Usa contrasenas diferentes para cada servicio.</li>
              <li>Activa autenticacion en dos pasos para reducir riesgo de acceso indebido.</li>
              <li>Revisa sesiones activas semanalmente.</li>
            </ul>
          </article>
        </section>

        <section
          id="config-section-sesiones"
          class="gd-settings-panel ${activeSection === "sesiones" ? "active" : ""}"
          data-config-section="sesiones"
          ${activeSection === "sesiones" ? "" : "hidden"}
        >
          <article class="gd-card">
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mb-3">
              <div>
                <h2 class="gd-card-title mb-1">Sesiones activas</h2>
                <p class="gd-muted mb-0">Gestiona los dispositivos que tienen acceso a tu cuenta.</p>
              </div>
              <button type="button" class="gd-btn-secondary" id="cerrarTodasSesionesBtn">Cerrar sesiones remotas</button>
            </div>

            <div class="gd-settings-session-list">
              ${
                config.sesiones.length === 0
                  ? '<p class="gd-muted mb-0">No hay sesiones activas.</p>'
                  : config.sesiones
                      .map((sesion) => `
                        <div class="gd-settings-session-row">
                          <div>
                            <p class="gd-settings-session-title">${escapeHtml(sesion.dispositivo)}</p>
                            <p class="gd-settings-session-sub">${escapeHtml(sesion.ubicacion)} · ${escapeHtml(sesion.fecha)}</p>
                          </div>
                          ${
                            sesion.fecha === "Hoy"
                              ? '<span class="gd-pill gd-pill-transporte">Actual</span>'
                              : `<button type="button" class="gd-action-btn danger" data-action="cerrar-sesion" data-sesion-id="${escapeHtml(sesion.id)}">Cerrar</button>`
                          }
                        </div>
                      `)
                      .join("")
              }
            </div>
          </article>
        </section>

        <section
          id="config-section-presupuestos"
          class="gd-settings-panel ${activeSection === "presupuestos" ? "active" : ""}"
          data-config-section="presupuestos"
          ${activeSection === "presupuestos" ? "" : "hidden"}
        >
          <article class="gd-card">
            <h2 class="gd-card-title mb-1">Presupuestos mensuales</h2>
            <p class="gd-muted mb-3">Define limites por categoria y recibe alertas al acercarte al tope.</p>

            <div class="gd-settings-budget-list">
              ${budgetRows
                .map(
                  (row) => `
                    <div class="gd-settings-budget-row">
                      <span class="gd-settings-budget-dot" style="--gd-budget-color: ${escapeHtml(row.color)};"></span>
                      <span class="gd-settings-budget-cat">${escapeHtml(row.label)}</span>
                      <div class="gd-settings-budget-bar">
                        <span class="gd-settings-budget-fill" style="--gd-budget-fill: ${Math.min(row.usage, 100)}%; --gd-budget-color: ${escapeHtml(row.color)};"></span>
                      </div>
                      <span class="gd-settings-budget-pct">${escapeHtml(String(row.usage))}%</span>
                      <div class="gd-settings-budget-input-wrap">
                        <span class="gd-muted">$</span>
                        <input class="gd-form-input gd-settings-budget-input" value="${escapeHtml(row.amount)}">
                      </div>
                    </div>
                  `,
                )
                .join("")}
            </div>

            <div class="d-flex justify-content-end gap-2 mt-3">
              <button type="button" class="gd-btn-secondary">Restablecer</button>
              <button type="button" class="gd-btn-primary">Guardar presupuestos</button>
            </div>
          </article>
        </section>

        <section
          id="config-section-categorias"
          class="gd-settings-panel ${activeSection === "categorias" ? "active" : ""}"
          data-config-section="categorias"
          ${activeSection === "categorias" ? "" : "hidden"}
        >
          <article class="gd-card">
            <h2 class="gd-card-title mb-1">Categorias personalizadas</h2>
            <p class="gd-muted mb-3">Crea etiquetas para clasificar mejor tus gastos.</p>

            <div class="gd-settings-category-list">
              ${customCategories
                .map(
                  (category) => `
                    <div class="gd-settings-category-row">
                      <span class="gd-settings-budget-dot" style="--gd-budget-color: ${escapeHtml(category.color)};"></span>
                      <span class="gd-settings-budget-cat">${escapeHtml(category.label)}</span>
                      <span class="gd-settings-category-pill">${escapeHtml(category.kind)}</span>
                    </div>
                  `,
                )
                .join("")}
            </div>

            <div class="gd-form-grid mt-3">
              <div>
                <label class="gd-form-label" for="nuevaCategoria">Nombre de categoria</label>
                <input id="nuevaCategoria" class="gd-form-input" placeholder="Ej: Mascotas">
              </div>
              <div>
                <label class="gd-form-label" for="nuevoEmoji">Emoji</label>
                <input id="nuevoEmoji" class="gd-form-input" placeholder="🐾">
              </div>
            </div>

            <div class="d-flex justify-content-end mt-3">
              <button type="button" class="gd-btn-primary">Agregar categoria</button>
            </div>
          </article>
        </section>

        <section
          id="config-section-asesoria"
          class="gd-settings-panel ${activeSection === "asesoria" ? "active" : ""}"
          data-config-section="asesoria"
          ${activeSection === "asesoria" ? "" : "hidden"}
        >
          <div class="row g-3 align-items-stretch">
            <div class="col-12 col-xl-6">
              <article class="gd-card h-100">
                <h2 class="gd-card-title mb-1">Agregar asesor</h2>
                <p class="gd-muted mb-3">Genera un codigo unico de verificacion para que el asesor lo ingrese y quede vinculado a tu cuenta.</p>

                <form id="agregarAsesorForm">
                  <div class="gd-form-grid">
                    <div>
                      <label class="gd-form-label" for="asesorNombre">Nombre del asesor</label>
                      <input id="asesorNombre" class="gd-form-input" value="${escapeHtml(String(advisorRequest.nombre || ""))}" placeholder="Ej: Laura Gomez" required>
                    </div>
                    <div>
                      <label class="gd-form-label" for="asesorEmail">Email del asesor</label>
                      <input id="asesorEmail" type="email" class="gd-form-input" value="${escapeHtml(String(advisorRequest.email || ""))}" placeholder="asesor@correo.com" required>
                    </div>
                    <div class="gd-form-full">
                      <label class="gd-form-label" for="asesorEspecialidad">Especialidad</label>
                      <input id="asesorEspecialidad" class="gd-form-input" value="${escapeHtml(String(advisorRequest.especialidad || ""))}" placeholder="Ej: Ahorro, presupuesto, inversiones">
                    </div>
                  </div>

                  <div class="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-2 mt-3">
                    <small class="gd-muted">Al guardar se crea automaticamente el codigo de verificacion.</small>
                    <button type="submit" class="gd-btn-primary">Generar codigo y vincular</button>
                  </div>
                </form>
              </article>
            </div>

            <div class="col-12 col-xl-6">
              <article class="gd-card h-100">
                <div class="d-flex align-items-start justify-content-between gap-2 mb-3">
                  <div>
                    <h2 class="gd-card-title mb-1">Perfil del asesor</h2>
                    <p class="gd-muted mb-0">${advisorHasProfile ? "Revisa los datos vinculados y comparte el codigo de verificacion." : "Aun no tienes un asesor vinculado."}</p>
                  </div>
                  ${advisorHasProfile
                    ? `<button type="button" class="gd-action-btn danger" data-action="desvincular-asesor" aria-label="Desvincular asesor">🗑</button>`
                    : ""
                  }
                </div>

                ${advisorHasProfile
                  ? `
                    <div class="gd-settings-advisor-profile">
                      <div class="gd-settings-advisor-avatar">${escapeHtml(advisorInitials)}</div>
                      <div class="gd-settings-advisor-copy">
                        <p class="gd-settings-session-title mb-1">${escapeHtml(advisorName)}</p>
                        <p class="gd-settings-session-sub mb-1">${escapeHtml(advisorEmail)}</p>
                        <p class="gd-settings-session-sub mb-0">${escapeHtml(advisorSpecialty || "Sin especialidad definida")}</p>
                      </div>
                    </div>

                    <div class="gd-settings-advisor-code-box mt-3">
                      <span class="gd-muted d-block mb-1">Codigo de verificacion</span>
                      <strong class="gd-settings-advisor-code">${escapeHtml(advisorCode || "Pendiente de generar")}</strong>
                      <p class="gd-muted mb-0 mt-2">El asesor debe ingresar este codigo para completar la vinculacion.</p>
                    </div>

                    <div class="gd-settings-advisor-meta mt-3">
                      <span class="gd-settings-category-pill">${escapeHtml(advisorStatusLabel)}</span>
                      <span class="gd-settings-advisor-meta-text">Vinculo activo en la seccion de Asesoria.</span>
                    </div>
                  `
                  : `
                    <div class="gd-settings-advisor-empty">
                      <i class="lni lni-user fs-1"></i>
                      <p class="mb-1 fw-semibold">Sin asesor vinculado</p>
                      <p class="gd-muted mb-0">Completa el formulario de la izquierda para generar el codigo y activar el perfil del asesor.</p>
                    </div>
                  `
                }
              </article>
            </div>
          </div>
        </section>

        <section
          id="config-section-notificaciones"
          class="gd-settings-panel ${activeSection === "notificaciones" ? "active" : ""}"
          data-config-section="notificaciones"
          ${activeSection === "notificaciones" ? "" : "hidden"}
        >
          <article class="gd-card">
            <h2 class="gd-card-title mb-1">Alertas de gastos</h2>
            <p class="gd-muted mb-3">Decide cuando y como quieres recibir avisos.</p>

            <label class="gd-settings-toggle-row">
              <div>
                <p class="gd-card-title gd-card-title-xs mb-0">Gasto inusual detectado</p>
                <small class="gd-muted">Cuando un gasto supere tu patron habitual.</small>
              </div>
              <input class="form-check-input mt-0" type="checkbox" checked>
            </label>

            <label class="gd-settings-toggle-row">
              <div>
                <p class="gd-card-title gd-card-title-xs mb-0">Presupuesto al 80%</p>
                <small class="gd-muted">Aviso al acercarte al limite mensual.</small>
              </div>
              <input class="form-check-input mt-0" type="checkbox" checked>
            </label>

            <label class="gd-settings-toggle-row">
              <div>
                <p class="gd-card-title gd-card-title-xs mb-0">Recomendaciones del asesor</p>
                <small class="gd-muted">Notifica cada nuevo analisis publicado.</small>
              </div>
              <input class="form-check-input mt-0" type="checkbox" checked>
            </label>
          </article>
        </section>

        <section
          id="config-section-apariencia"
          class="gd-settings-panel ${activeSection === "apariencia" ? "active" : ""}"
          data-config-section="apariencia"
          ${activeSection === "apariencia" ? "" : "hidden"}
        >
          <article class="gd-card">
            <h2 class="gd-card-title mb-1">Apariencia y accesibilidad</h2>
            <p class="gd-muted mb-3">Controla idioma, tema y densidad visual del dashboard.</p>

            <div class="gd-form-grid">
              <div>
                <label class="gd-form-label" for="idioma">Idioma</label>
                <select id="idioma" name="idioma" class="gd-form-select">
                  <option value="es" ${config.idioma === "es" ? "selected" : ""}>Espanol</option>
                  <option value="en" ${config.idioma === "en" ? "selected" : ""}>English</option>
                  <option value="pt" ${config.idioma === "pt" ? "selected" : ""}>Portugues</option>
                </select>
              </div>
              <div>
                <label class="gd-form-label" for="temaModo">Tema</label>
                <select id="temaModo" name="temaModo" class="gd-form-select">
                  <option value="system" ${config.tema === "system" ? "selected" : ""}>Sistema</option>
                  <option value="light" ${config.tema === "light" ? "selected" : ""}>Claro</option>
                  <option value="dark" ${config.tema === "dark" ? "selected" : ""}>Oscuro</option>
                </select>
              </div>
              <div>
                <label class="gd-form-label" for="tamanioFuente">Tamano de fuente</label>
                <select id="tamanioFuente" name="tamanioFuente" class="gd-form-select">
                  <option value="sm" ${config.tamanioFuente === "sm" ? "selected" : ""}>Pequeno</option>
                  <option value="md" ${config.tamanioFuente === "md" ? "selected" : ""}>Normal</option>
                  <option value="lg" ${config.tamanioFuente === "lg" ? "selected" : ""}>Grande</option>
                </select>
              </div>
              <div>
                <label class="gd-form-label" for="densidad">Densidad</label>
                <select id="densidad" name="densidad" class="gd-form-select">
                  <option value="comfortable" ${config.densidad === "comfortable" ? "selected" : ""}>Comoda</option>
                  <option value="compact" ${config.densidad === "compact" ? "selected" : ""}>Compacta</option>
                </select>
              </div>

              <label class="gd-form-full gd-setting-row" for="mostrarCentavos">
                <div>
                  <p class="gd-card-title gd-card-title-xs mb-0">Mostrar centavos</p>
                  <small class="gd-muted">Visualiza montos con dos decimales en tablas y metricas.</small>
                </div>
                <input class="form-check-input mt-0" type="checkbox" id="mostrarCentavos" ${config.mostrarCentavos ? "checked" : ""}>
              </label>

              <label class="gd-form-full gd-setting-row" for="reducirAnimaciones">
                <div>
                  <p class="gd-card-title gd-card-title-xs mb-0">Reducir animaciones</p>
                  <small class="gd-muted">Desactiva transiciones para una experiencia mas estable.</small>
                </div>
                <input class="form-check-input mt-0" type="checkbox" id="reducirAnimaciones" ${config.reducirAnimaciones ? "checked" : ""}>
              </label>

              <div class="gd-form-full gd-settings-preview">
                <p class="gd-card-title gd-card-title-xs mb-2">Vista previa</p>
                <div class="gd-settings-preview-list">
                  <div class="gd-settings-preview-item">
                    <span>Tema</span>
                    <strong>${escapeHtml(themeLabel)}</strong>
                  </div>
                  <div class="gd-settings-preview-item">
                    <span>Fuente</span>
                    <strong>${escapeHtml(fontSizeLabel)}</strong>
                  </div>
                  <div class="gd-settings-preview-item">
                    <span>Densidad</span>
                    <strong>${escapeHtml(densityLabel)}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div class="d-flex justify-content-end mt-3">
              <button type="button" class="gd-btn-primary" id="guardarConfiguracionBtn">Guardar configuracion</button>
            </div>
          </article>
        </section>

        <section
          id="config-section-datos"
          class="gd-settings-panel ${activeSection === "datos" ? "active" : ""}"
          data-config-section="datos"
          ${activeSection === "datos" ? "" : "hidden"}
        >
          <article class="gd-card">
            <h2 class="gd-card-title mb-1">Exportar mis datos</h2>
            <p class="gd-muted mb-3">Descarga informacion financiera y reportes de tu cuenta.</p>

            <div class="gd-settings-export-list">
              <div class="gd-settings-export-row">
                <div>
                  <p class="gd-settings-session-title">Historial de gastos</p>
                  <p class="gd-settings-session-sub">Incluye monto, fecha, categoria y comercio.</p>
                </div>
                <div class="d-flex gap-2">
                  <button type="button" class="gd-btn-secondary">CSV</button>
                  <button type="button" class="gd-btn-secondary">Excel</button>
                </div>
              </div>

              <div class="gd-settings-export-row">
                <div>
                  <p class="gd-settings-session-title">Reportes mensuales</p>
                  <p class="gd-settings-session-sub">Resumen de los ultimos seis meses en PDF.</p>
                </div>
                <button type="button" class="gd-btn-secondary">PDF</button>
              </div>

              <div class="gd-settings-export-row">
                <div>
                  <p class="gd-settings-session-title">Exportacion completa</p>
                  <p class="gd-settings-session-sub">Archivo JSON con estructura completa de tu cuenta.</p>
                </div>
                <button type="button" class="gd-btn-primary">Generar archivo</button>
              </div>
            </div>
          </article>
        </section>

        <section
          id="config-section-plan"
          class="gd-settings-panel ${activeSection === "plan" ? "active" : ""}"
          data-config-section="plan"
          ${activeSection === "plan" ? "" : "hidden"}
        >
          <article class="gd-card">
            <h2 class="gd-card-title mb-1">Plan actual</h2>
            <p class="gd-muted mb-3">Gestiona tu suscripcion y revisa consumo del periodo.</p>

            <div class="gd-settings-plan-card current">
              <div>
                <p class="gd-settings-session-title">Plan gratuito</p>
                <p class="gd-settings-session-sub">Hasta 50 tickets por mes y reportes basicos.</p>
              </div>
              <span class="gd-settings-category-pill">Actual</span>
            </div>

            <div class="gd-settings-plan-card">
              <div>
                <p class="gd-settings-session-title">Plan Pro</p>
                <p class="gd-settings-session-sub">Tickets ilimitados, analisis IA avanzado y panel asesor.</p>
              </div>
              <button type="button" class="gd-btn-primary">Mejorar plan</button>
            </div>

            <div class="gd-settings-usage-list">
              <div class="gd-settings-budget-row">
                <span class="gd-settings-budget-cat">Tickets subidos</span>
                <div class="gd-settings-budget-bar">
                  <span class="gd-settings-budget-fill" style="--gd-budget-fill: 68%;"></span>
                </div>
                <span class="gd-settings-budget-pct">34 / 50</span>
              </div>
              <div class="gd-settings-budget-row">
                <span class="gd-settings-budget-cat">Exportaciones</span>
                <div class="gd-settings-budget-bar">
                  <span class="gd-settings-budget-fill" style="--gd-budget-fill: 20%;"></span>
                </div>
                <span class="gd-settings-budget-pct">2 / 10</span>
              </div>
            </div>
          </article>
        </section>

        <section
          id="config-section-danger"
          class="gd-settings-panel ${activeSection === "danger" ? "active" : ""}"
          data-config-section="danger"
          ${activeSection === "danger" ? "" : "hidden"}
        >
          <article class="gd-card gd-settings-danger-card">
            <h2 class="gd-card-title mb-1">Zona peligrosa</h2>
            <p class="gd-muted mb-3">Estas acciones son irreversibles. Procede con precaucion.</p>

            <div class="gd-settings-danger-row">
              <div>
                <p class="gd-settings-session-title">Cerrar todas las sesiones</p>
                <p class="gd-settings-session-sub">Finaliza el acceso en todos los dispositivos remotos.</p>
              </div>
              <button type="button" class="gd-btn-danger">Cerrar sesiones</button>
            </div>

            <div class="gd-settings-danger-row">
              <div>
                <p class="gd-settings-session-title">Borrar historial de gastos</p>
                <p class="gd-settings-session-sub">Elimina registros, reportes e imagenes de tickets.</p>
              </div>
              <button type="button" class="gd-btn-danger">Borrar historial</button>
            </div>

            <div class="gd-settings-danger-row">
              <div>
                <p class="gd-settings-session-title">Eliminar cuenta</p>
                <p class="gd-settings-session-sub">Borra permanentemente todos tus datos.</p>
              </div>
              <button type="button" class="gd-btn-danger">Eliminar cuenta</button>
            </div>
          </article>
        </section>
      </div>
    </section>
  `;

  return renderDashboardAppLayout({
    activePath: "/perfil/configuracion",
    pageTitle: "Configuracion",
    pageSubtitle: "Administra tu perfil, seguridad y preferencias",
    content,
    profileImage,
    profileName,
    notificationCount: recomendacionesPendientes,
  });
}

# Frontend Refactoring — Extracción por Capas: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Partir `main.js` (895 líneas) en módulos con responsabilidad única, dividir `reusablePageComponents.js` (963 líneas) por dominio, y partir `ConfiguracionCuentaPage.js` (899 líneas) en builders de sección, manteniendo la SPA hand-rolled sin cambios de comportamiento visible.

**Architecture:** `main.js` → entry point de CSS + llamada a `app.init()`. `router.js` posee `buildRouteView` + `renderDashboardLayout` + render wrappers + helpers de path (no importa de `app.js`, evitando ciclos). `app.js` posee `render()`, `navigate()`, bootstrap; importa de `router.js`. `reusablePageComponents.js` se convierte en barrel de 4 sub-módulos. `ConfiguracionCuentaPage.js` delega a 5 builders de sección.

**Tech Stack:** Vanilla JS ES modules, Vite, Bootstrap 5, Chart.js

**Spec:** `docs/superpowers/specs/2026-05-21-frontend-refactor-design.md`

---

## Mapa de archivos

| Acción | Archivo | Descripción |
|---|---|---|
| Crear | `src/router.js` | `getProfileProps`, `renderDashboardLayout`, helpers de path, render wrappers, `buildRouteView`, `isProtectedRoute`, `hasAuthenticatedSession` |
| Crear | `src/app.js` | `render()`, `navigate()`, bootstrap `init()`, system theme listener |
| Modificar | `src/main.js` | Solo CSS imports + `import { init } from './app'; init();` |
| Crear | `src/components/common/auth-components.js` | `fondoDecorativoAuth`, `campoAuthInput`, `botonIniciarCrearCuenta`, `renderAuthPublicPage` |
| Crear | `src/components/common/nav-components.js` | `encabezadoAuthPublico`, `encabezadoExterno`, `encabezadoInterno`, `botonEncabezadoExterno` |
| Crear | `src/components/common/card-components.js` | `tarjetaLandingPage`, `tarjetaPublicaBase`, `tarjetaPublicaConTitulo` |
| Crear | `src/components/common/layout-components.js` | `botonScrollTop`, `descripcionLanding`, `imagenesLanding` |
| Modificar | `src/components/common/reusablePageComponents.js` | Se convierte en barrel de re-exports |
| Crear | `src/components/configuracion/AccountSections.js` | Secciones `perfil`, `seguridad`, `sesiones` |
| Crear | `src/components/configuracion/FinancesSections.js` | Secciones `presupuestos`, `categorias` |
| Crear | `src/components/configuracion/AsesoriaSection.js` | Sección `asesoria` |
| Crear | `src/components/configuracion/PreferencesSections.js` | Secciones `notificaciones`, `apariencia`, `datos` |
| Crear | `src/components/configuracion/PlanSections.js` | Secciones `plan`, `danger` |
| Modificar | `src/pages/ConfiguracionCuentaPage.js` | Orquestador delgado que importa los 5 builders |

---

## Task 1: Crear `src/router.js`

Mover desde `main.js` a un nuevo archivo: `renderDashboardLayout`, helpers de path, `getProfileProps`, todos los render wrappers de página, `buildRouteView`, `isProtectedRoute`, `hasAuthenticatedSession`.

**Importante — no circular:** `router.js` NO importa de `app.js`. `app.js` importa de `router.js`. La dependencia es unidireccional.

**Files:**
- Create: `src/router.js`
- Modify: `src/main.js` (eliminar funciones que se mudaron, agregar import)

- [ ] **Step 1: Crear `src/router.js` con renderDashboardLayout, helpers y getProfileProps**

Crear `frontend/src/router.js`. Las primeras líneas deben ser todos los imports que necesitan las funciones que vienen de main.js (páginas, datos, state, utilidades — main.js líneas 5-187). **No importar nada de `./app`**. Luego agregar `renderDashboardLayout` (copiar literalmente de main.js líneas 259-272) y los helpers:

```js
export function renderDashboardLayout(content, { showScrollTop = true } = {}) {
  // Copiar literalmente de main.js líneas 259-272
  return `
    <div class="d-flex min-vh-100 overflow-hidden" style="background-color: var(--app-surface-bg);">
      <div class="flex-grow-1 d-flex flex-column h-100 overflow-y-auto w-100">
        <main class="container-fluid py-4 px-3 px-md-4 flex-grow-1">
          ${content}
        </main>
        ${showScrollTop ? botonScrollTop() : ""}
      </div>
    </div>
  `;
}

// === Helper compartido ===

function getProfileProps() {
  return {
    profileImage: state.perfil.imagePreview || DEFAULT_PROFILE_IMAGE,
    profileName: state.perfil.nombre || "Usuario",
  };
}

// === Helpers de path ===

function cambioRol(pathname) {
  return pathname.startsWith("/dashboard/asesor") ||
    pathname.startsWith("/cliente/")
    ? "Asesor"
    : "Usuario";
}

function getCurrentRoleLabel(pathname = window.location.pathname) {
  return cambioRol(pathname);
}

function getAdvisorClientHref() {
  return "/dashboard/asesor";
}

function getBrandTarget(pathname) {
  if (pathname === "/dashboard") return "scroll-top";
  if (pathname.startsWith("/cliente/")) return "/dashboard/asesor";
  if (pathname.startsWith("/dashboard/asesor")) return "/dashboard";
  return "/dashboard";
}
```

- [ ] **Step 2: Mover render wrappers y buildRouteView a `router.js`**

Copiar a `router.js`, después de los helpers, las funciones en el orden en que aparecen en main.js (líneas 274–783):
- `renderLandingPage` → `renderFaqPage` → `renderSobreNosotrosPage` → `renderFaqDetail`
- `renderLoginPage` → `renderRegistroPage` → `renderRecuperarContrasenaPage` → `renderVerificarCodigoRecuperacionPage` → `renderNuevaContrasenaPage` → `renderRegistroExitosoPage` → `renderRegistroVerificarEmailPage`
- `renderDashboardPage` → `renderDetalleAhorrosPage` → `renderCargarGastoPage` → `renderMisGastosPage` → `renderRecomendacionesPage` → `renderRecomendacionesHistoricasPage` → `renderPatronesPage` → `renderRecHistoricasClientePage`
- `renderDashboardAsesorPage` → `renderAsesorOnboardingPageView` → `renderAsesorRecomendacionesPage`
- `resolveDetalleCliente` → `renderDetalleClientePage`
- `renderEditarPerfilPage` → `renderConfiguracionCuentaPage` → `renderPreferenciaNotificacionesPage`
- `buildRouteView`
- `isProtectedRoute`
- `hasAuthenticatedSession`

En cada render wrapper que use `state.perfil.imagePreview || DEFAULT_PROFILE_IMAGE` y `state.perfil.nombre || "Usuario"`, reemplazar por `...getProfileProps()`. Por ejemplo:

```js
// Antes (en renderDashboardPage):
profileImage: state.perfil.imagePreview || DEFAULT_PROFILE_IMAGE,
profileName: state.perfil.nombre || "Usuario",

// Después:
...getProfileProps(),
```

Al final del archivo, exportar:

```js
export { buildRouteView, isProtectedRoute, hasAuthenticatedSession };
```

- [ ] **Step 3: Actualizar `main.js` para importar desde router.js**

No eliminar nada de main.js todavía. Solo agregar al inicio:

```js
import { buildRouteView, isProtectedRoute, hasAuthenticatedSession } from "./router";
```

Y comentar (no borrar) las funciones que ahora están en router.js para verificar que no hay conflictos de nombre. Construir y verificar en el navegador que `/dashboard` y `/dashboard/asesor` siguen funcionando.

- [ ] **Step 4: Verificar build**

```bash
cd frontend && npm run build
```

Esperado: sin errores. Si hay errores de "already declared" o "not defined", revisar que los imports en router.js sean correctos y que no queden referencias a funciones que se movieron.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/router.js frontend/src/main.js
git commit -m "refactor: extract router.js from main.js with getProfileProps helper"
```

---

## Task 2: Crear `src/app.js` y adelgazar `main.js`

Mover desde `main.js`: `renderDashboardLayout`, `navigate`, `render`, el system theme listener, y el bloque de bootstrap (`loadCurrentUser().finally(...)`) a `app.js` como `export function init()`.

**Files:**
- Create: `src/app.js`
- Modify: `src/main.js`

- [ ] **Step 1: Crear `src/app.js`**

Crear `frontend/src/app.js`. `renderDashboardLayout` **no va aquí** (ya está en router.js). Los cuerpos de `navigate` y `render` se copian literalmente desde main.js:

```js
import { attachGlobalNavigation } from "./handlers/navigation";
import { installGlobalImageErrorHandler } from "./ui/imageErrors";
import {
  applyTheme,
  loadAppPreferences,
  applyAccessibilityPreferences,
  resolveThemeForPath,
} from "./ui/theme";
import { initCharts } from "./ui/charts";
import { attachFormHandlers, clearRegistroExitosoAutoRedirect } from "./handlers/forms/index.js";
import {
  closeLandingMobileMenu,
  closeDashboardDropdowns,
} from "./handlers/mobileMenu";
import { getAccessToken } from "./api/client";
import {
  loadCurrentUser,
  loadDashboardBalances,
  loadMovimientos,
  isUserAsesor,
} from "./api/user";
import { loadAhorros } from "./api/ahorros";
import { loadRecomendaciones } from "./api/recomendaciones";
import { loadBudgets } from "./api/budgets";
import { loadCategories } from "./api/categories";
import { loadTags } from "./api/tags";
import {
  loadAsesorClientes,
  loadClienteDetalle,
  loadClienteMovimientos,
  loadClienteRecomendaciones,
  loadClienteGastosPorMes,
  loadClienteGraficoCategorias,
  loadAllAsesorRecomendaciones,
} from "./api/asesor";
import { state } from "./state";
import { DEFAULT_PROFILE_IMAGE } from "./config";
import { normalizeThemeMode } from "./utils/format";
import { buildRouteView, isProtectedRoute, hasAuthenticatedSession } from "./router";

export const appRoot = document.getElementById("root");

export function navigate(path, replace = false) {
  // Copiar literalmente de main.js líneas 194-226
}

export function render() {
  // Copiar literalmente de main.js líneas 797-839
  // Notar: usa buildRouteView (importado), attachFormHandlers, initCharts, appRoot
}

export function init() {
  attachGlobalNavigation({ navigate, render });
  installGlobalImageErrorHandler();

  const persistedPreferences = loadAppPreferences();
  Object.assign(state.configuracion, persistedPreferences);
  state.perfil.imagePreview =
    persistedPreferences.imagePreview ||
    state.perfil.imagePreview ||
    DEFAULT_PROFILE_IMAGE;
  state.configuracion.temaOscuro = resolveThemeForPath(window.location.pathname);
  applyTheme(state.configuracion.temaOscuro);
  applyAccessibilityPreferences();

  const systemThemeMedia = window.matchMedia("(prefers-color-scheme: dark)");
  const handleSystemThemeChange = () => {
    if (normalizeThemeMode(state.configuracion.tema) === "system") {
      render();
    }
  };

  if (typeof systemThemeMedia.addEventListener === "function") {
    systemThemeMedia.addEventListener("change", handleSystemThemeChange);
  } else if (typeof systemThemeMedia.addListener === "function") {
    systemThemeMedia.addListener(handleSystemThemeChange);
  }

  loadCurrentUser().finally(() => {
    if (getAccessToken()) {
      const initialPath = window.location.pathname;
      const clienteMatch = initialPath.match(/^\/cliente\/([^/?#]+)/);
      const initialLoads = [
        loadDashboardBalances(),
        loadMovimientos(),
        loadAhorros(),
        loadRecomendaciones(),
        loadAsesorClientes(),
        loadAllAsesorRecomendaciones(),
        loadBudgets(),
        loadCategories(),
        loadTags(),
      ];

      if (clienteMatch) {
        const clienteId = decodeURIComponent(clienteMatch[1]);
        initialLoads.push(
          loadClienteDetalle(clienteId),
          loadClienteMovimientos(clienteId),
          loadClienteRecomendaciones(clienteId),
          loadClienteGastosPorMes(clienteId),
          loadClienteGraficoCategorias(clienteId),
        );
      }

      Promise.all(initialLoads).finally(() => render());
      return;
    }
    render();
  });
}
```

Nota: llenar los cuerpos de `renderDashboardLayout`, `navigate`, `render` copiando exactamente desde main.js las funciones correspondientes (líneas 194–226, 259–272, 797–839).

- [ ] **Step 2: Verificar que router.js no importa app.js**

Las funciones en router.js producen solo strings HTML y no llaman a `navigate()` ni `render()` directamente. Verificar que ninguna función en router.js llame a esas funciones — si las hay, convertirlas en props o eliminarlas. `renderDashboardLayout` ya está en router.js (Task 1), así que no hay necesidad de importarla.

- [ ] **Step 3: Reemplazar `main.js` por el entry point final**

Reemplazar el contenido completo de `frontend/src/main.js` con:

```js
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import "flatpickr/dist/flatpickr.min.css";
import "chart.js/auto";
import "./index.css";
import "./App.css";
import "./components/dashboard/dashboard-widgets.css";
import "./components/dashboard/gestion-dashboard.css";
import { init } from "./app";

init();
```

- [ ] **Step 4: Verificar build y funcionalidad**

```bash
cd frontend && npm run build
```

Abrir en el navegador (o `npm run dev`) y verificar:
1. `/dashboard` carga y muestra datos.
2. `/dashboard/asesor` carga y muestra la lista de clientes.
3. `/perfil/configuracion` carga sin error.
4. Navegación entre rutas funciona (sin recargas de página).
5. El tema oscuro/claro sigue respondiendo al switch del sistema.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app.js frontend/src/main.js
git commit -m "refactor: extract app.js (render, navigate, bootstrap) and slim main.js to entry point"
```

---

## Task 3: Limpiar `router.js` — eliminar imports redundantes

Después de extraer app.js, router.js puede tener imports que ya no necesita (cosas que solo usa app.js). Revisar y eliminar los que no aparezcan en ninguna función de router.js.

**Files:**
- Modify: `src/router.js`

- [ ] **Step 1: Auditar imports de router.js**

Correr:

```bash
cd frontend && npm run build 2>&1 | grep "unused\|imported"
```

Alternativamente, revisar manualmente que cada import en router.js sea usado por al menos una función del archivo. Imports que seguramente pertenecen solo a app.js (no a render wrappers ni buildRouteView):
- `attachGlobalNavigation`, `installGlobalImageErrorHandler`
- `closeDashboardDropdowns`, `closeLandingMobileMenu`
- `loadCurrentUser`, `loadDashboardBalances`, etc. (APIs de carga inicial)
- `loadAppPreferences`, `saveAppPreferences`
- `applyTheme`, `applyAccessibilityPreferences`
- `attachFormHandlers`
- `initCharts`

Eliminar esos de router.js si están.

- [ ] **Step 2: Verificar build sin errores**

```bash
cd frontend && npm run build
```

Esperado: cero errores y cero warnings nuevos.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/router.js
git commit -m "refactor: remove unused imports from router.js"
```

---

## Task 4: Split de `reusablePageComponents.js` en 4 sub-módulos

**Files:**
- Create: `src/components/common/auth-components.js`
- Create: `src/components/common/nav-components.js`
- Create: `src/components/common/card-components.js`
- Create: `src/components/common/layout-components.js`
- Modify: `src/components/common/reusablePageComponents.js`

- [ ] **Step 1: Crear `auth-components.js`**

Crear `frontend/src/components/common/auth-components.js` con los siguientes imports necesarios:

```js
import { escapeHtml } from "../../utils/sanitize";
import { t } from "../../i18n";
```

Mover desde `reusablePageComponents.js`:
- `fondoDecorativoAuth` (actualmente en línea ~217)
- `renderAuthPublicPage` (línea ~224)
- `campoAuthInput` (línea ~272)
- `botonIniciarCrearCuenta` (línea ~385)

Exportar todas con `export function ...`.

- [ ] **Step 2: Crear `nav-components.js`**

Crear `frontend/src/components/common/nav-components.js` con imports:

```js
import { renderExpenseTable } from "../dashboard/dashboardExpenseTable";
import { escapeHtml } from "../../utils/sanitize";
import { t } from "../../i18n";
```

Mover desde `reusablePageComponents.js`:
- `encabezadoInterno` (línea ~6)
- `encabezadoExterno` (línea ~100)
- `encabezadoAuthPublico` (línea ~144)
- `botonEncabezadoExterno` (línea ~358, función interna que usan los encabezados — moverla también aunque no sea exported)

Exportar `encabezadoInterno`, `encabezadoExterno`, `encabezadoAuthPublico`.

- [ ] **Step 3: Crear `card-components.js`**

Crear `frontend/src/components/common/card-components.js` con imports:

```js
import { escapeHtml } from "../../utils/sanitize";
import { t } from "../../i18n";
```

Mover desde `reusablePageComponents.js`:
- `tarjetaPublicaBase` (línea ~301)
- `tarjetaPublicaConTitulo` (línea ~321, depende de tarjetaPublicaBase — mover las dos)
- `tarjetaLandingPage` (línea ~405)

Exportar las tres.

- [ ] **Step 4: Crear `layout-components.js`**

Crear `frontend/src/components/common/layout-components.js` con imports:

```js
import { escapeHtml } from "../../utils/sanitize";
import { t } from "../../i18n";
```

Mover desde `reusablePageComponents.js`:
- `botonScrollTop` (línea ~350)
- `descripcionLanding` (línea ~445)
- `imagenesLanding` (el resto del archivo, revisar qué funciones quedan)

Exportar todas.

- [ ] **Step 5: Convertir `reusablePageComponents.js` en barrel**

Reemplazar el contenido completo de `reusablePageComponents.js` con:

```js
export * from './nav-components.js';
export * from './auth-components.js';
export * from './card-components.js';
export * from './layout-components.js';
```

- [ ] **Step 6: Verificar build**

```bash
cd frontend && npm run build
```

Esperado: cero errores. Si hay "function not exported" o "not found", revisar que la función esté en el sub-módulo correcto y exportada.

- [ ] **Step 7: Verificar navegación en el browser**

Con `npm run dev`, verificar:
1. Landing page (`/`) carga con encabezados y tarjetas.
2. `/login`, `/registro` cargan formularios correctamente.
3. Header interno en `/dashboard` funciona.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/components/common/
git commit -m "refactor: split reusablePageComponents into 4 domain sub-modules with barrel re-export"
```

---

## Task 5: Split de `ConfiguracionCuentaPage.js` en builders de sección

La página tiene 5 grupos de secciones. Se crean 5 archivos en `src/components/configuracion/` y `ConfiguracionCuentaPage.js` queda como orquestador.

**Files:**
- Create: `src/components/configuracion/AccountSections.js`
- Create: `src/components/configuracion/FinancesSections.js`
- Create: `src/components/configuracion/AsesoriaSection.js`
- Create: `src/components/configuracion/PreferencesSections.js`
- Create: `src/components/configuracion/PlanSections.js`
- Modify: `src/pages/ConfiguracionCuentaPage.js`

- [ ] **Step 1: Identificar qué va en cada archivo**

Abrir `ConfiguracionCuentaPage.js` y localizar los comentarios de sección (`<!-- PERFIL -->`, `<!-- SEGURIDAD -->`, etc.). El contenido entre cada par de `<section id="config-section-X">...</section>` es lo que se extrae a cada builder.

Las funciones auxiliares locales a esas secciones también se mueven con ellas:
- `renderScoreRing`, `renderBudgetMonthPicker`, `renderBudgetSummary`, `renderBudgetRow`, `renderCategoryRow`, `getAdvisorInitials`, `renderProxBadge` — distribuirlas según dónde se usen.

- [ ] **Step 2: Crear `AccountSections.js`**

Crear `frontend/src/components/configuracion/AccountSections.js`:

```js
import { escapeHtml } from "../../utils/sanitize";
import { t } from "../../i18n";
import { getFinancialScore } from "../../data/finanzas";

// Mover aquí: scoreLabel, scoreTier, renderScoreRing, renderProxBadge
// Mover aquí: el bloque HTML de las secciones "perfil" y "seguridad" y "sesiones"

export function renderAccountSections({ activeSection, profileImage, profileName, config, state }) {
  // Contiene las tres secciones: perfil, seguridad, sesiones
  // Retorna el HTML concatenado de las tres <section id="config-section-X"> correspondientes
}
```

Las variables locales que se calculaban en `renderConfiguracionCuentaPage` y son necesarias aquí (firstName, lastName, initials, profileEmail, score, etc.) deben calcularse dentro de `renderAccountSections` o ser pasadas como props.

- [ ] **Step 3: Crear `FinancesSections.js`**

Crear `frontend/src/components/configuracion/FinancesSections.js`:

```js
import { escapeHtml } from "../../utils/sanitize";
import { formatMoney } from "../../utils/money";
import { t } from "../../i18n";
import { parseMonthKey, formatMonthLabelLong, compareMonthKeys } from "../../utils/date";
import { getBudgetAlertsForPeriod, getFinanzasCurrentPeriod } from "../../data/finanzas";

// Mover aquí: renderBudgetMonthPicker, renderBudgetSummary, renderBudgetRow, renderCategoryRow

export function renderFinancesSections({ activeSection, state }) {
  // Contiene secciones: presupuestos, categorias
  // Toda la lógica de viewPeriod, budgets, spentByCategory va aquí
}
```

- [ ] **Step 4: Crear `AsesoriaSection.js`**

Crear `frontend/src/components/configuracion/AsesoriaSection.js`:

```js
import { escapeHtml } from "../../utils/sanitize";
import { t } from "../../i18n";

// Mover aquí: getAdvisorInitials

export function renderAsesoriaSection({ activeSection, config }) {
  // Contiene sección: asesoria
  // Toda la lógica de advisorLink, advisorName, advisorInitials, etc. va aquí
}
```

- [ ] **Step 5: Crear `PreferencesSections.js`**

Crear `frontend/src/components/configuracion/PreferencesSections.js`:

```js
import { escapeHtml } from "../../utils/sanitize";
import { t } from "../../i18n";

export function renderPreferencesSections({ activeSection, config, state }) {
  // Contiene secciones: notificaciones, apariencia, datos
  // Las variables idiomaLabel, themeLabel, fontSizeLabel, densityLabel se calculan aquí
}
```

- [ ] **Step 6: Crear `PlanSections.js`**

Crear `frontend/src/components/configuracion/PlanSections.js`:

```js
import { escapeHtml } from "../../utils/sanitize";
import { t } from "../../i18n";

export function renderPlanSections({ activeSection, state }) {
  // Contiene secciones: plan, danger
  // ticketCount, ticketLimit, ticketPct se calculan aquí
}
```

- [ ] **Step 7: Actualizar `ConfiguracionCuentaPage.js` como orquestador**

Reemplazar el contenido de `renderConfiguracionCuentaPage` para que:
1. Solo calcule las variables globales que necesitan múltiples secciones (activeSection, recomendacionesPendientes).
2. Llame a cada builder y componga el contenido.
3. Mantenga `renderSettingsNav` y `SETTINGS_NAV_GROUPS` en este archivo (son parte del layout de la página).

Estructura resultante:

```js
import { renderDashboardAppLayout } from "../components/dashboard/dashboardAppLayout";
import { escapeHtml } from "../utils/sanitize";
import { t } from "../i18n";
import { renderAccountSections } from "../components/configuracion/AccountSections";
import { renderFinancesSections } from "../components/configuracion/FinancesSections";
import { renderAsesoriaSection } from "../components/configuracion/AsesoriaSection";
import { renderPreferencesSections } from "../components/configuracion/PreferencesSections";
import { renderPlanSections } from "../components/configuracion/PlanSections";

const SETTINGS_NAV_GROUPS = [ /* ... igual que ahora ... */ ];
const SETTINGS_SECTION_IDS = /* ... igual que ahora ... */;
const DEFAULT_SETTINGS_SECTION = "perfil";

function resolveActiveSettingsSection() { /* ... igual que ahora ... */ }
function renderSettingsNav(activeSection, alertsCount = 0) { /* ... igual que ahora ... */ }

export function renderConfiguracionCuentaPage({ state, profileImage, profileName, isAsesor = false }) {
  const activeSection = resolveActiveSettingsSection();
  const recomendacionesPendientes = state.finanzas?.recomendaciones?.length || 0;
  const sharedProps = { activeSection, state, config: state.configuracion, profileImage, profileName };

  const content = `
    <section class="gd-settings-shell">
      <aside class="gd-settings-nav" aria-label="${t('config.subsectionsAria')}">
        ${renderSettingsNav(activeSection, recomendacionesPendientes)}
      </aside>
      <div class="gd-settings-content">
        ${renderAccountSections(sharedProps)}
        ${renderFinancesSections(sharedProps)}
        ${renderAsesoriaSection(sharedProps)}
        ${renderPreferencesSections(sharedProps)}
        ${renderPlanSections(sharedProps)}
      </div>
    </section>
  `;

  return renderDashboardAppLayout({
    // ... igual que ahora
    content,
  });
}
```

- [ ] **Step 8: Verificar build**

```bash
cd frontend && npm run build
```

Esperado: cero errores. Si hay "is not defined" en un builder, es porque una función auxiliar o import no se movió junto con el HTML que la usa.

- [ ] **Step 9: Verificar `/perfil/configuracion` en el browser**

Con `npm run dev`, verificar:
1. La sección "Perfil" carga con el avatar, nombre y email.
2. La sección "Seguridad" muestra los inputs de contraseña.
3. La sección "Presupuestos" muestra los presupuestos con el month picker.
4. El sidebar de nav muestra el badge de recomendaciones pendientes si las hay.
5. El tab `#config-asesoria` abre la sección de asesoría.

- [ ] **Step 10: Commit**

```bash
git add frontend/src/components/configuracion/ frontend/src/pages/ConfiguracionCuentaPage.js
git commit -m "refactor: split ConfiguracionCuentaPage into 5 section builders"
```

---

## Task 6: Verificación final

- [ ] **Step 1: Build de producción**

```bash
cd frontend && npm run build
```

Esperado: cero errores.

- [ ] **Step 2: Verificar criterios del spec**

```bash
wc -l frontend/src/main.js frontend/src/components/common/reusablePageComponents.js frontend/src/pages/ConfiguracionCuentaPage.js
```

Esperado:
- `main.js` < 20 líneas
- `reusablePageComponents.js` < 10 líneas (solo re-exports)
- `ConfiguracionCuentaPage.js` < 100 líneas

- [ ] **Step 3: Verificar cero instancias inline de DEFAULT_PROFILE_IMAGE**

```bash
grep -n "DEFAULT_PROFILE_IMAGE" frontend/src/router.js
```

Esperado: solo aparece en `getProfileProps()`, no inline en funciones de render.

- [ ] **Step 4: Verificar rutas críticas**

Con `npm run dev`, recorrer manualmente:
1. `/dashboard` — carga métricas y gastos recientes.
2. `/dashboard/gastos` — tabla de gastos con filtros funciona.
3. `/dashboard/ahorros` — lista de metas de ahorro.
4. `/dashboard/asesor` — panel de clientes (si hay token de asesor).
5. `/cliente/:id` — detalle del cliente.
6. `/perfil/configuracion` — todas las secciones del sidebar.
7. Cambio de tema oscuro/claro.

- [ ] **Step 5: Commit final**

```bash
git add -A
git commit -m "refactor: frontend layer extraction — router, app, component splits"
```

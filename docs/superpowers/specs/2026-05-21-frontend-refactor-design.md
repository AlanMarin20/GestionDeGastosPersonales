# Frontend Refactoring — Extracción por Capas

**Date:** 2026-05-21  
**Branch:** entrega-final  
**Scope:** Optimización y refactorización del frontend (SPA hand-rolled, sin introducir frameworks)

---

## Objetivos

1. Dividir `main.js` (895 líneas) en módulos con responsabilidad única.
2. Eliminar la repetición del patrón `profileImage/profileName` en ~15 render wrappers.
3. Partir `reusablePageComponents.js` (963 líneas) en sub-módulos por dominio.
4. Partir `ConfiguracionCuentaPage.js` (899 líneas) en builders de sección.

**Restricciones:**
- Mantener la arquitectura SPA hand-rolled (HTML-en-string, sin React/Vue/Svelte).
- Sin cambios de comportamiento visible — la UI debe funcionar igual.
- Sin dependencias externas nuevas.

---

## Sección 1 — División de `main.js`

### Situación actual

`main.js` actúa como God Object: importa todo, define ~15 wrappers de render, contiene `buildRouteView`, `render()`, el bootstrap de la app y los listeners del sistema.

### Resultado deseado

`main.js` queda como entry point de ~30 líneas. Las responsabilidades se separan en:

| Archivo nuevo | Responsabilidades |
|---|---|
| `src/router.js` | `buildRouteView`, `isProtectedRoute`, helpers de path: `cambioRol`, `getCurrentRoleLabel`, `getAdvisorClientHref`, `getBrandTarget`, todos los render wrappers de página |
| `src/app.js` | `render()`, `renderDashboardLayout()`, `navigate()`, listener de tema del sistema, bootstrap (`loadCurrentUser + Promise.all`) |
| `main.js` | Imports de CSS, `attachGlobalNavigation`, `installGlobalImageErrorHandler`, carga de preferencias iniciales, kick-off de `app.init()` |

### Helper `getProfileProps()`

Se define en `src/router.js` (donde viven los render wrappers que lo consumen). Elimina la repetición en todos los render wrappers:

```js
function getProfileProps() {
  return {
    profileImage: state.perfil.imagePreview || DEFAULT_PROFILE_IMAGE,
    profileName: state.perfil.nombre || "Usuario",
  };
}
```

Cada render wrapper pasa a usar `...getProfileProps()` en lugar de inline.

### Flujo de dependencias resultante

```
main.js
  └── app.js  (render, navigate, bootstrap)
        └── router.js  (buildRouteView, render wrappers)
              └── pages/*.js
              └── components/**
```

---

## Sección 2 — Split de `reusablePageComponents.js`

### Situación actual

963 líneas con componentes de dominios completamente distintos mezclados: formularios auth, navbars, tarjetas de landing, decorativos de fondo.

### Resultado deseado

Cuatro archivos bajo `src/components/common/`:

| Archivo | Exports principales |
|---|---|
| `auth-components.js` | `fondoDecorativoAuth`, `campoAuthInput`, `botonIniciarCrearCuenta`, `renderAuthPublicPage` |
| `nav-components.js` | `encabezadoAuthPublico`, `encabezadoExterno`, `encabezadoInterno` |
| `card-components.js` | `tarjetaLandingPage`, `tarjetaPublicaBase`, `tarjetaPublicaConTitulo` |
| `layout-components.js` | `botonScrollTop`, `descripcionLanding`, `imagenesLanding` |

`reusablePageComponents.js` se convierte en barrel de re-exportación para compatibilidad hacia atrás:

```js
export * from './auth-components.js';
export * from './nav-components.js';
export * from './card-components.js';
export * from './layout-components.js';
```

Los consumidores existentes (`main.js`, `router.js`) no requieren cambios de imports.

---

## Sección 3 — Split de `ConfiguracionCuentaPage.js`

### Situación actual

899 líneas — una sola función `renderConfiguracionCuentaPage(props)` que renderiza todas las secciones de configuración inline.

### Resultado deseado

La página tiene 5 grupos de nav con 10 secciones en total. Builders de sección extraídos a `src/components/configuracion/`:

| Archivo | Secciones que renderiza |
|---|---|
| `AccountSections.js` | `perfil`, `seguridad`, `sesiones` |
| `FinancesSections.js` | `presupuestos`, `categorias` |
| `AsesoriaSection.js` | `asesoria` |
| `PreferencesSections.js` | `notificaciones`, `apariencia`, `datos` |
| `PlanSections.js` | `plan`, `danger` |

`ConfiguracionCuentaPage.js` queda como orquestador delgado (~80 líneas): mantiene la nav, el layout, `SETTINGS_NAV_GROUPS`, y las funciones compartidas (`resolveActiveSettingsSection`, `renderSettingsNav`). Las funciones de render de cada sección se mueven a su archivo correspondiente.

Cada builder recibe solo las props que necesita desde el orquestador.

---

## Plan de implementación (orden de tareas)

1. **Crear `getProfileProps()`** y aplicar en todos los render wrappers de `main.js` — cambio seguro, sin mover archivos.
2. **Extraer `src/router.js`** — mover render wrappers y `buildRouteView` desde `main.js`.
3. **Extraer `src/app.js`** — mover `render()`, `navigate()`, `renderDashboardLayout()`, bootstrap.
4. **Reducir `main.js`** a entry point (~30 líneas).
5. **Split `reusablePageComponents.js`** — crear los 4 sub-archivos + barrel.
6. **Split `ConfiguracionCuentaPage.js`** — crear `src/components/configuracion/` con los 4 builders.
7. **Verificar** que las dos rutas críticas funcionen: `/dashboard` y `/dashboard/asesor` + `/cliente/:id`.

---

## Criterios de éxito

- `main.js` < 60 líneas.
- `reusablePageComponents.js` es solo re-exports (< 15 líneas).
- `ConfiguracionCuentaPage.js` < 80 líneas.
- Cero instancias inline de `state.perfil.imagePreview || DEFAULT_PROFILE_IMAGE` fuera de `getProfileProps()`.
- `npm run build` sin errores ni warnings nuevos.
- Dashboard usuario y dashboard asesor + detalle cliente funcionan correctamente.

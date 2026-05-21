# Diseño: Flujo de Acceso al Panel de Asesor

**Fecha:** 2026-05-20  
**Estado:** Aprobado por el usuario

---

## Contexto y motivación

Actualmente cualquier usuario puede auto-declararse asesor rellenando un formulario en `/perfil/configuracion → Asesoría`, sin ninguna barrera ni explicación de lo que implica. Esto genera dos problemas:

1. **Falta de barrera**: no hay ninguna señal de que convertirse en asesor es algo que requiere compromiso y responsabilidad. Cualquier usuario llega al panel de asesor sin entender qué implica.
2. **Confusión visual**: el dashboard del asesor y la vista del cliente son visualmente idénticos al dashboard de usuario. El asesor no sabe si está viendo sus propios datos o los de un cliente.

Este diseño resuelve ambos problemas: introduce un flujo de onboarding educativo con aceptación de términos, y diferencia visualmente los tres contextos (usuario propio / panel asesor / vista de cliente).

---

## Decisiones de diseño

### 1. Barrera de acceso: onboarding con T&C (sin aprobación externa)

El usuario puede convertirse en asesor por sí mismo, pero primero debe pasar por un flujo de onboarding que:
- Explica qué es el rol de asesor y qué permite
- Detalla los beneficios y responsabilidades
- Requiere aceptar términos y condiciones

Al aceptar los T&C y confirmar, el backend asigna el rol de asesor al instante. No hay intervención de administrador.

**Alternativa descartada:** aprobación por admin — agrega fricción operativa sin beneficio real para el scope actual.

### 2. Diferenciación visual: sidebar exclusivo + banner naranja

**Opción elegida:** el modo asesor tiene un sidebar con navegación propia (diferente al de usuario). Al ver a un cliente, aparece un banner naranja persistente en el área de contenido.

**Alternativa descartada:** pills de modo en el topbar — menos impacto visual, puede pasar desapercibido.

---

## Flujo completo

```
Usuario sin rol asesor
    │
    ├─ Click en "Panel Asesor" (sidebar)
    │
    ▼
[/perfil/asesor-onboarding] Landing page de onboarding
    │  · Hero con título y bajada
    │  · Grilla de Beneficios (4 items)
    │  · Grilla de Responsabilidades (4 items)
    │  · Sección "¿Para quién es?" (3 perfiles)
    │  · CTA: "Quiero ser asesor →"
    │
    ▼
Modal de Términos y Condiciones
    │  · Texto scrollable de T&C
    │  · Checkbox: "Leí y acepto los términos" (obligatorio)
    │  · Botón "Confirmar y activar" (deshabilitado hasta checkbox)
    │  · Botón "Cancelar"
    │
    ▼ (al confirmar)
Backend: asigna rol asesor al usuario
    │
    ▼
Redirect a [/dashboard/asesor]
```

---

## Pantallas y componentes

### A. Landing page de onboarding (`/perfil/asesor-onboarding`)

Usa el layout de dashboard estándar (sidebar de usuario + topbar) con el contenido central propio.

**Estructura del contenido:**
- **Hero**: icono 🏛️, título "Convertite en Asesor Financiero", bajada
- **Grilla 2 columnas**:
  - Beneficios (borde violeta): acceso a datos de clientes, panel exclusivo, envío de recomendaciones, indicadores de riesgo
  - Responsabilidades (borde naranja): confidencialidad, asesoramiento ético, no uso indebido de datos, respetar términos
- **"¿Para quién es?"**: 3 perfiles (contadores/asesores, familia/amigos, profesionales finanzas personales)
- **CTA**: botón primario "Quiero ser asesor →" + nota "Revisarás los términos en el siguiente paso"

### B. Modal de Términos y Condiciones

Se abre sobre la landing page al clickear el CTA.

**Estructura:**
- Título "📋 Términos de asesor"
- Área de texto scrollable con los T&C completos
- Checkbox: "Leí y acepto los términos y condiciones del programa de asesores de FinanzasPro"
- Botones: "Cancelar" (cierra modal) / "Confirmar y activar" (deshabilitado hasta checkbox marcado)

**Al confirmar:** llamada al backend para asignar el rol, luego redirect a `/dashboard/asesor`.

### C. Sidebar exclusivo del asesor

Reemplaza al sidebar de usuario cuando el path es `/dashboard/asesor` o `/cliente/:id`.

**Navegación:**
```
ASESORÍA
  ⬡ Mi cartera           → /dashboard/asesor
  📤 Recomendaciones     → /dashboard/recomendaciones  (ruta existente, reutilizada)
  ⚙ Config. asesor       → /perfil/configuracion (tab asesoría)

──────────────────
  ← Ir a mi dashboard   → /dashboard
```

**User chip (pie del sidebar):**
- Avatar + nombre
- Badge "● ASESOR" en color violeta (en lugar de "usuario")

### D. Banner de cliente (`/cliente/:id`)

Banner persistente entre el topbar y el contenido de la página.

**Contenido:**
- Avatar circular con iniciales del cliente (fondo naranja)
- Etiqueta "👁 ESTÁS VIENDO A" (naranja, uppercase, pequeño)
- Nombre completo del cliente (blanco, bold, grande)
- Botón "← Volver a mi cartera" (a la derecha, fondo naranja)

**Estilo:** fondo degradado `#7c2d12 → #431407`, borde inferior `2px solid #ea580c`.

---

## Cambios requeridos en el sistema

### Frontend

| Área | Cambio |
|------|--------|
| Routing (`main.js`) | Si usuario no tiene rol asesor y accede a `/dashboard/asesor`, redirigir a `/perfil/asesor-onboarding` |
| Nueva página | `AsesorOnboardingPage.js` — landing page + lógica de modal T&C |
| `dashboardAppLayout.js` | Sidebar condicional: si `isAsesor`, mostrar nav de asesor con "Ir a mi dashboard" |
| `DetalleClientePage.js` | Agregar banner naranja persistente arriba del contenido |
| State (`state.js`) | Agregar `state.user.roles: string[]` — cargado al hacer login, determina si se muestra el sidebar de asesor o se redirige al onboarding |

### Backend

| Área | Cambio |
|------|--------|
| Endpoint nuevo | `POST /api/auth/activate-advisor` — asigna rol `asesor` en `usuario_roles` al usuario autenticado, requiere body `{ acceptedTerms: true }` |
| Endpoint existente o nuevo | `GET /api/auth/me` (o incluir `roles` en el JWT payload) — para que el frontend sepa los roles del usuario al cargar la app |
| Guard en rutas de asesor | `RolesGuard` ya existe en el backend; verificar que `/api/asesor/*` lo use correctamente |

**Nota sobre detección de rol en el frontend:** hoy el frontend distingue asesor/usuario solo por URL (función `cambioRol()` en `main.js`). Con este cambio, necesita leer `state.user.roles` para saber si el usuario tiene el rol asesor *antes* de navegar, y así decidir si va al onboarding o al panel. Esto requiere cargar los roles del backend al hacer login y guardarlos en estado.

---

## Verificación

1. **Usuario sin rol asesor:** acceder a `/dashboard/asesor` → debe redirigir a `/perfil/asesor-onboarding`
2. **Onboarding:** recorrer la landing page, clickear CTA → modal aparece
3. **Modal T&C:** botón "Confirmar" deshabilitado sin checkbox; al marcarlo se habilita
4. **Activación:** al confirmar → rol asignado, redirect a `/dashboard/asesor` con sidebar de asesor
5. **Sidebar asesor:** nav exclusivo visible, badge "ASESOR" en chip de usuario
6. **"Ir a mi dashboard":** link en sidebar lleva a `/dashboard` con sidebar de usuario normal
7. **Vista cliente:** banner naranja visible con nombre del cliente y botón de volver
8. **Botón volver:** redirige a `/dashboard/asesor` (cartera del asesor)
9. **Asesor ya activado:** acceder directamente a `/perfil/asesor-onboarding` → redirigir a `/dashboard/asesor`

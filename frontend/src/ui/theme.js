import {
  THEME_STORAGE_KEY,
  APP_PREFERENCES_STORAGE_KEY,
  DEFAULT_PROFILE_IMAGE,
} from "../config";
import { state } from "../state";
import {
  normalizeThemeMode,
  normalizeFontSizeMode,
  normalizeDensityMode,
  normalizeCurrency,
} from "../utils/format";

export function applyTheme(isDark) {
  const nextTheme = isDark ? "dark" : "light";
  document.documentElement.setAttribute("data-bs-theme", nextTheme);
  document.documentElement.setAttribute("data-theme", nextTheme);
  document.body.classList.toggle("theme-dark", isDark);
  document.body.classList.toggle("theme-light", !isDark);
}

export function loadThemePreference() {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  if (storedTheme === "dark") return true;
  if (storedTheme === "light") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function saveThemePreference(isDark) {
  localStorage.setItem(THEME_STORAGE_KEY, isDark ? "dark" : "light");
}

export function loadAppPreferences() {
  const fallbackThemeMode = loadThemePreference() ? "dark" : "light";
  const rawPreferences = localStorage.getItem(APP_PREFERENCES_STORAGE_KEY);

  const fallback = {
    moneda: normalizeCurrency(state.configuracion.moneda),
    idioma: String(state.configuracion.idioma || "es"),
    tema: fallbackThemeMode,
    tamanioFuente: normalizeFontSizeMode(state.configuracion.tamanioFuente),
    densidad: normalizeDensityMode(state.configuracion.densidad),
    reducirAnimaciones: Boolean(state.configuracion.reducirAnimaciones),
    mostrarCentavos: Boolean(state.configuracion.mostrarCentavos),
    autenticacionDos: Boolean(state.configuracion.autenticacionDos),
    imagePreview: String(state.perfil?.imagePreview || DEFAULT_PROFILE_IMAGE),
    asesoria: {
      asesor: state.configuracion?.asesoria?.asesor || null,
      solicitud: {
        nombre: String(state.configuracion?.asesoria?.solicitud?.nombre || ""),
        email: String(state.configuracion?.asesoria?.solicitud?.email || ""),
        especialidad: String(state.configuracion?.asesoria?.solicitud?.especialidad || ""),
      },
    },
  };

  if (!rawPreferences) return fallback;

  try {
    const parsedPreferences = JSON.parse(rawPreferences);

    return {
      moneda: normalizeCurrency(parsedPreferences.moneda || fallback.moneda),
      idioma: ["es", "en", "pt"].includes(parsedPreferences.idioma)
        ? parsedPreferences.idioma
        : fallback.idioma,
      tema: normalizeThemeMode(parsedPreferences.tema || fallback.tema),
      tamanioFuente: normalizeFontSizeMode(parsedPreferences.tamanioFuente || fallback.tamanioFuente),
      densidad: normalizeDensityMode(parsedPreferences.densidad || fallback.densidad),
      reducirAnimaciones: Boolean(parsedPreferences.reducirAnimaciones),
      mostrarCentavos: Boolean(parsedPreferences.mostrarCentavos),
      autenticacionDos: Boolean(parsedPreferences.autenticacionDos),
      imagePreview: String(parsedPreferences.imagePreview || fallback.imagePreview),
      asesoria: {
        asesor: parsedPreferences.asesoria?.asesor || fallback.asesoria.asesor,
        solicitud: {
          nombre: String(parsedPreferences.asesoria?.solicitud?.nombre || fallback.asesoria.solicitud.nombre),
          email: String(parsedPreferences.asesoria?.solicitud?.email || fallback.asesoria.solicitud.email),
          especialidad: String(parsedPreferences.asesoria?.solicitud?.especialidad || fallback.asesoria.solicitud.especialidad),
        },
      },
    };
  } catch {
    return fallback;
  }
}

export function saveAppPreferences() {
  const themeMode = normalizeThemeMode(state.configuracion.tema);

  localStorage.setItem(
    APP_PREFERENCES_STORAGE_KEY,
    JSON.stringify({
      moneda: normalizeCurrency(state.configuracion.moneda),
      idioma: state.configuracion.idioma,
      tema: themeMode,
      tamanioFuente: normalizeFontSizeMode(state.configuracion.tamanioFuente),
      densidad: normalizeDensityMode(state.configuracion.densidad),
      reducirAnimaciones: Boolean(state.configuracion.reducirAnimaciones),
      mostrarCentavos: Boolean(state.configuracion.mostrarCentavos),
      autenticacionDos: Boolean(state.configuracion.autenticacionDos),
      imagePreview: String(state.perfil?.imagePreview || DEFAULT_PROFILE_IMAGE),
      asesoria: {
        asesor: state.configuracion?.asesoria?.asesor || null,
        solicitud: {
          nombre: String(state.configuracion?.asesoria?.solicitud?.nombre || ""),
          email: String(state.configuracion?.asesoria?.solicitud?.email || ""),
          especialidad: String(state.configuracion?.asesoria?.solicitud?.especialidad || ""),
        },
      },
    }),
  );

  if (themeMode === "dark" || themeMode === "light") {
    saveThemePreference(themeMode === "dark");
  }
}

export function applyAccessibilityPreferences() {
  const fontSizeMode = normalizeFontSizeMode(state.configuracion.tamanioFuente);
  const densityMode = normalizeDensityMode(state.configuracion.densidad);

  document.body.classList.remove("app-font-sm", "app-font-md", "app-font-lg");
  document.body.classList.add(`app-font-${fontSizeMode}`);
  document.body.classList.toggle("app-density-compact", densityMode === "compact");
  document.body.classList.toggle("app-reduced-motion", Boolean(state.configuracion.reducirAnimaciones));
}

export function isFixedDarkRoute(pathname) {
  return pathname === "/" ||
    pathname === "/faqs" ||
    pathname.startsWith("/faqs/") ||
    pathname === "/sobre-nosotros" ||
    pathname === "/login" ||
    pathname.startsWith("/recuperar-contrasena") ||
    pathname === "/registro" ||
    pathname === "/registro/exitoso";
}

export function resolveThemeForPath(pathname) {
  if (isFixedDarkRoute(pathname)) return true;

  const themeMode = normalizeThemeMode(state.configuracion.tema);

  if (themeMode === "dark") return true;
  if (themeMode === "light") return false;

  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

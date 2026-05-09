import {
  CURRENCY_CONFIG,
  THEME_MODES,
  FONT_SIZE_MODES,
  DENSITY_MODES,
} from "../config";

export function formatCurrency(value) {
  return `$${Number(value).toFixed(2)}`;
}

export function isStrongPassword(password) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(password);
}

export function normalizeThemeMode(value) {
  return THEME_MODES.has(value) ? value : "system";
}

export function normalizeFontSizeMode(value) {
  return FONT_SIZE_MODES.has(value) ? value : "md";
}

export function normalizeDensityMode(value) {
  return DENSITY_MODES.has(value) ? value : "comfortable";
}

export function normalizeCurrency(value) {
  return CURRENCY_CONFIG[value] ? value : "USD";
}

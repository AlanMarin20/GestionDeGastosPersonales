import { CURRENCY_CONFIG } from "../config";
import { state } from "../state";
import { normalizeCurrency } from "./format";

export function createMoneyFormatter() {
  const currencyCode = normalizeCurrency(state.configuracion.moneda);
  const currencyConfig = CURRENCY_CONFIG[currencyCode] || CURRENCY_CONFIG.USD;
  const language = String(state.configuracion.idioma || "es");
  const locale = currencyConfig.localeByLanguage?.[language] || currencyConfig.fallbackLocale;
  const shouldShowDecimals = Boolean(state.configuracion.mostrarCentavos);

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyConfig.currency,
    maximumFractionDigits: shouldShowDecimals ? 2 : 0,
    minimumFractionDigits: shouldShowDecimals ? 2 : 0,
  });
}

export function formatMoney(value) {
  const normalizedValue = Number(value);
  const amount = Number.isFinite(normalizedValue) ? normalizedValue : 0;
  return createMoneyFormatter().format(amount);
}

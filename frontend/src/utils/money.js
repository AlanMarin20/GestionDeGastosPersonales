import { state } from "../state";

const LOCALE_MAP = {
  es: "es-AR",
  en: "en-US",
  pt: "pt-BR",
};

export function createMoneyFormatter() {
  const shouldShowDecimals = Boolean(state.configuracion.mostrarCentavos);
  const locale = LOCALE_MAP[state.configuracion.idioma] || "es-AR";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: shouldShowDecimals ? 2 : 0,
    minimumFractionDigits: shouldShowDecimals ? 2 : 0,
  });
}

export function formatMoney(value) {
  const normalizedValue = Number(value);
  const amount = Number.isFinite(normalizedValue) ? normalizedValue : 0;
  return createMoneyFormatter().format(amount);
}

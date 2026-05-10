import { state } from "../state";

export function createMoneyFormatter() {
  const shouldShowDecimals = Boolean(state.configuracion.mostrarCentavos);

  return new Intl.NumberFormat("es-AR", {
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

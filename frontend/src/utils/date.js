export const MONTH_LABELS_SHORT = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

export const MONTH_LABELS_LONG = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export function getCurrentDateShort() {
  return new Date().toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
}

export function getMonthKeyFromDate(dateIso) {
  if (!dateIso || typeof dateIso !== "string") {
    return "";
  }

  const [year = "", month = ""] = dateIso.split("-");
  if (year.length !== 4 || month.length !== 2) {
    return "";
  }

  return `${year}-${month}`;
}

export function parseMonthKey(monthKey) {
  const [yearString = "0", monthString = "0"] = String(monthKey).split("-");
  const year = Number.parseInt(yearString, 10);
  const month = Number.parseInt(monthString, 10);

  return {
    year: Number.isNaN(year) ? 0 : year,
    month: Number.isNaN(month) ? 0 : month,
  };
}

export function compareMonthKeys(a, b) {
  const left = parseMonthKey(a);
  const right = parseMonthKey(b);

  if (left.year !== right.year) {
    return left.year - right.year;
  }

  return left.month - right.month;
}

export function formatMonthLabelShort(monthKey) {
  const { month } = parseMonthKey(monthKey);
  if (month < 1 || month > 12) {
    return monthKey;
  }

  return MONTH_LABELS_SHORT[month - 1];
}

export function formatMonthLabelLong(monthKey) {
  const { year, month } = parseMonthKey(monthKey);
  if (month < 1 || month > 12) {
    return monthKey;
  }

  return `${MONTH_LABELS_LONG[month - 1]} ${year}`;
}

function parseDateValue(dateIso) {
  if (!dateIso) {
    return null;
  }

  const rawValue = String(dateIso).trim();
  const normalizedValue = /^\d{4}-\d{2}-\d{2}$/.test(rawValue)
    ? `${rawValue}T00:00:00`
    : rawValue;
  const date = new Date(normalizedValue);

  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDateDDMMYYYY(dateIso) {
  const date = parseDateValue(dateIso);
  if (!date) {
    return "-";
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

export function formatIsoDateShort(dateIso) {
  const date = parseDateValue(dateIso);
  if (!date) {
    return "-";
  }

  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
}

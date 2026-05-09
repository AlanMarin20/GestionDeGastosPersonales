import { getFilteredExpenses, getFinanzasCurrentPeriod } from "./finanzas";

export function csvEscape(value) {
  const stringValue = String(value ?? "");

  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replaceAll('"', '""')}"`;
  }

  return stringValue;
}

export function exportFilteredExpensesAsCsv() {
  const filteredExpenses = getFilteredExpenses();
  const rows = [
    ["Comercio", "Categoria", "Descripcion", "Fecha", "Monto"],
    ...filteredExpenses.map((expense) => [
      expense.comercio,
      expense.categoria,
      expense.descripcion || "",
      expense.fecha,
      Number(expense.monto || 0),
    ]),
  ];

  const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `gastos_${getFinanzasCurrentPeriod()}.csv`;
  document.body.append(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(url);
}

export function applyHistoricalRecommendationFilters() {
  const searchInput = document.getElementById("recSearchInput");
  const monthFilter = document.getElementById("recMonthFilter");
  const yearFilter = document.getElementById("recYearFilter");
  const emitterFilter = document.getElementById("recEmitterFilter");

  const searchTerm = (searchInput?.value || "").trim().toLowerCase();
  const selectedMonth = monthFilter?.value || "";
  const selectedYear = yearFilter?.value || "";
  const selectedEmitter = emitterFilter?.value || "";

  document.querySelectorAll(".gd-rec-card").forEach((card) => {
    let visible = true;

    if (searchTerm) {
      const title = card.getAttribute("data-title") || "";
      const body = card.getAttribute("data-body") || "";
      visible = title.includes(searchTerm) || body.includes(searchTerm);
    }

    if (visible && selectedMonth) {
      visible = (card.getAttribute("data-month") || "") === selectedMonth;
    }

    if (visible && selectedYear) {
      visible = (card.getAttribute("data-year") || "") === selectedYear;
    }

    if (visible && selectedEmitter) {
      visible = (card.getAttribute("data-source") || "") === selectedEmitter;
    }

    card.style.display = visible ? "" : "none";
  });

  document.querySelectorAll("[data-month-section]").forEach((section) => {
    const hasVisibleCards = Array.from(
      section.querySelectorAll(".gd-rec-card"),
    ).some((card) => card.style.display !== "none");

    section.style.display = hasVisibleCards ? "" : "none";
  });
}

export function exportVisibleHistoricalRecommendationsAsCsv() {
  const visibleCards = Array.from(document.querySelectorAll(".gd-rec-card")).filter(
    (card) => card.style.display !== "none",
  );

  const rows = [["Título", "Cuerpo", "Fecha", "Mes", "Año", "Emisor"]];

  visibleCards.forEach((card) => {
    rows.push([
      card.querySelector(".gd-rec-title")?.textContent || "",
      card.querySelector(".gd-rec-body")?.textContent || "",
      card.getAttribute("data-date") || "",
      card.getAttribute("data-month") || "",
      card.getAttribute("data-year") || "",
      card.getAttribute("data-source") || "",
    ]);
  });

  const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "recomendaciones.csv";
  document.body.append(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(url);
}

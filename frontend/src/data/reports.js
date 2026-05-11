import { formatMoney } from "../utils/money";
import { getMonthKeyFromDate } from "../utils/date";
import { state } from "../state";
import {
  getDashboardMonthlySeries,
  getFinanzasCurrentPeriod,
  getFinanzasExpensesForPeriod,
} from "./finanzas";

export function getReportEvolutionRows() {
  const series = getDashboardMonthlySeries();
  const maxValue = series.reduce((max, item) => Math.max(max, item.total), 0);

  return series.map((item) => ({
    label: item.label,
    amount: formatMoney(item.total),
    width: maxValue > 0 ? Math.max((item.total / maxValue) * 100, 8) : 8,
  }));
}

export function getMerchantRankingRows(limit = 5) {
  const totals = new Map();
  const currentPeriod = getFinanzasCurrentPeriod();

  getFinanzasExpensesForPeriod(currentPeriod)
    .filter((e) => e.tipo === "egreso" && e.comercio)
    .forEach((expense) => {
      totals.set(expense.comercio, (totals.get(expense.comercio) || 0) + Number(expense.monto || 0));
    });

  const ranking = [...totals.entries()]
    .map(([label, total]) => ({ label, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);

  const maxValue = ranking.reduce((max, item) => Math.max(max, item.total), 0);
  const overallTotal = ranking.reduce((sum, item) => sum + item.total, 0);

  return ranking.map((item) => ({
    label: item.label,
    amount: formatMoney(item.total),
    width: maxValue > 0 ? Math.max((item.total / maxValue) * 100, 8) : 8,
    pct: overallTotal > 0 ? Math.round((item.total / overallTotal) * 100) : 0,
  }));
}

export function getUnusualSpendingMessages() {
  const currentPeriod = getFinanzasCurrentPeriod();
  const allEgresos = state.finanzas.gastos.filter((e) => e.tipo === "egreso");

  // Aggregate current month totals per category, tracking top merchant
  const currentByCategory = new Map();
  allEgresos
    .filter((e) => getMonthKeyFromDate(e.fecha) === currentPeriod)
    .forEach((e) => {
      const cat = e.categoria || "Otros";
      if (!currentByCategory.has(cat)) {
        currentByCategory.set(cat, { total: 0, topComercio: "", topMonto: 0 });
      }
      const entry = currentByCategory.get(cat);
      entry.total += Number(e.monto || 0);
      const monto = Number(e.monto || 0);
      if (e.comercio && monto > entry.topMonto) {
        entry.topComercio = e.comercio;
        entry.topMonto = monto;
      }
    });

  // Aggregate historical monthly totals per category
  const historicalByCategory = new Map();
  allEgresos
    .filter((e) => getMonthKeyFromDate(e.fecha) !== currentPeriod)
    .forEach((e) => {
      const cat = e.categoria || "Otros";
      const month = getMonthKeyFromDate(e.fecha);
      if (!historicalByCategory.has(cat)) historicalByCategory.set(cat, new Map());
      const monthMap = historicalByCategory.get(cat);
      monthMap.set(month, (monthMap.get(month) || 0) + Number(e.monto || 0));
    });

  const unusual = [];

  currentByCategory.forEach(({ total, topComercio }, category) => {
    const monthMap = historicalByCategory.get(category);
    if (!monthMap || monthMap.size < 2) return;

    const monthTotals = [...monthMap.values()];
    const historicalAvg = monthTotals.reduce((s, v) => s + v, 0) / monthTotals.length;

    if (historicalAvg <= 0) return;

    const ratio = total / historicalAvg;
    if (ratio >= 1.8) {
      unusual.push({ category, comercio: topComercio, amount: total, ratio, historicalAvg });
    }
  });

  unusual.sort((a, b) => b.ratio - a.ratio);
  return unusual.slice(0, 5);
}

export function getReportMetrics({ averageMonthlyExpense, categories, merchantRanking }) {
  return [
    {
      id: "avg-monthly",
      label: "Promedio mensual",
      value: formatMoney(averageMonthlyExpense),
      delta: "ultimos 6 meses",
      trend: "neutral",
    },
    {
      id: "top-category",
      label: "Categoria principal",
      value: categories[0]?.label || "Sin datos",
      delta: categories[0] ? `${categories[0].share} del total` : "sin movimiento",
      trend: "up",
    },
    {
      id: "top-merchant",
      label: "Comercio top",
      value: merchantRanking[0]?.label || "Sin datos",
      delta: merchantRanking[0]?.amount || "sin consumo",
      trend: "up",
    },
  ];
}

import { formatMoney } from "../utils/money";
import { getMonthKeyFromDate, formatIsoDateShort } from "../utils/date";
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

  getFinanzasExpensesForPeriod(currentPeriod).forEach((expense) => {
    totals.set(expense.comercio, (totals.get(expense.comercio) || 0) + Number(expense.monto || 0));
  });

  const ranking = [...totals.entries()]
    .map(([label, total]) => ({ label, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);

  const maxValue = ranking.reduce((max, item) => Math.max(max, item.total), 0);

  return ranking.map((item) => ({
    label: item.label,
    amount: formatMoney(item.total),
    width: maxValue > 0 ? Math.max((item.total / maxValue) * 100, 8) : 8,
  }));
}

export function getUnusualSpendingMessages() {
  const currentPeriod = getFinanzasCurrentPeriod();
  const currentExpenses = getFinanzasExpensesForPeriod(currentPeriod);
  const previousExpenses = state.finanzas.gastos.filter(
    (expense) => getMonthKeyFromDate(expense.fecha) !== currentPeriod,
  );

  const unusual = [];

  currentExpenses.forEach((expense) => {
    const historical = previousExpenses.filter(
      (item) => item.categoria === expense.categoria,
    );

    if (historical.length === 0) return;

    const historicalAverage =
      historical.reduce((sum, item) => sum + Number(item.monto || 0), 0) / historical.length;

    if (historicalAverage <= 0) return;

    const ratio = Number(expense.monto || 0) / historicalAverage;
    if (ratio >= 1.8) {
      unusual.push({
        commerce: expense.comercio,
        amount: Number(expense.monto || 0),
        ratio,
        average: historicalAverage,
        date: formatIsoDateShort(expense.fecha),
      });
    }
  });

  unusual.sort((a, b) => b.ratio - a.ratio);

  return unusual.slice(0, 2).map((item) =>
    `${item.commerce} · ${formatMoney(item.amount)} el ${item.date} — ${item.ratio.toFixed(1)}x mayor a tu promedio de ${formatMoney(item.average)}`,
  );
}

export function getReportMetrics({ averageMonthlyExpense, categories, merchantRanking }) {
  return [
    {
      label: "Promedio mensual",
      value: formatMoney(averageMonthlyExpense),
      delta: "ultimos 6 meses",
      trend: "up",
    },
    {
      label: "Categoria principal",
      value: categories[0]?.label || "Sin datos",
      delta: categories[0] ? `${categories[0].share} del total` : "sin movimiento",
      trend: "up",
    },
    {
      label: "Comercio top",
      value: merchantRanking[0]?.label || "Sin datos",
      delta: merchantRanking[0]?.amount || "sin consumo",
      trend: "up",
    },
  ];
}

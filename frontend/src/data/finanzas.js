import { state } from "../state";
import { CATEGORY_COLORS } from "./mockData";
import { getMonthKeyFromDate, compareMonthKeys, formatMonthLabelShort, formatMonthLabelLong, formatIsoDateShort } from "../utils/date";
import { formatMoney } from "../utils/money";

export function getFinanzasCurrentPeriod() {
  return state.finanzas.currentPeriod;
}

export function getFinanzasAllMonthKeys() {
  const monthSet = new Set();

  state.finanzas.gastos.forEach((expense) => {
    const monthKey = getMonthKeyFromDate(expense.fecha);
    if (monthKey) {
      monthSet.add(monthKey);
    }
  });

  if (!monthSet.has(state.finanzas.currentPeriod)) {
    monthSet.add(state.finanzas.currentPeriod);
  }

  return [...monthSet].sort(compareMonthKeys);
}

export function getFinanzasMonthTotal(periodKey) {
  return state.finanzas.gastos
    .filter((expense) => getMonthKeyFromDate(expense.fecha) === periodKey)
    .reduce((sum, expense) => sum + Number(expense.monto || 0), 0);
}

export function getFinanzasExpensesForPeriod(periodKey) {
  return state.finanzas.gastos.filter(
    (expense) => getMonthKeyFromDate(expense.fecha) === periodKey,
  );
}

export function getDashboardMonthlySeries() {
  const monthKeys = getFinanzasAllMonthKeys();
  const recentMonthKeys = monthKeys.slice(-6);

  return recentMonthKeys.map((monthKey) => ({
    key: monthKey,
    label: formatMonthLabelShort(monthKey),
    total: getFinanzasMonthTotal(monthKey),
  }));
}

export function getDashboardCategorySummary(periodKey = getFinanzasCurrentPeriod()) {
  const totals = new Map();
  const expenses = getFinanzasExpensesForPeriod(periodKey);

  expenses.forEach((expense) => {
    const category = expense.categoria || "Otros";
    totals.set(category, (totals.get(category) || 0) + Number(expense.monto || 0));
  });

  const overall = [...totals.values()].reduce((sum, value) => sum + value, 0);
  const ranked = [...totals.entries()]
    .map(([label, total]) => ({ label, total }))
    .sort((a, b) => b.total - a.total);

  const top = ranked.slice(0, 4);
  const restTotal = ranked.slice(4).reduce((sum, item) => sum + item.total, 0);

  if (restTotal > 0) {
    top.push({ label: "Otros", total: restTotal });
  }

  if (top.length === 0) {
    top.push({ label: "Otros", total: 1 });
  }

  return top.map((item) => {
    const shareNumber = overall > 0 ? Math.round((item.total / overall) * 100) : 0;
    return {
      label: item.label,
      total: item.total,
      share: `${shareNumber}%`,
      color: CATEGORY_COLORS[item.label] || CATEGORY_COLORS.Otros,
    };
  });
}

export function getDashboardBalanceData() {
  const balanceData = state.finanzas.balancesData || {};

  return {
    ingreso: Number(balanceData.ingreso ?? 0),
    egreso: Number(balanceData.egreso ?? 0),
    ahorro: Number(balanceData.ahorro ?? 0),
    disponible: (Number(balanceData.ingreso ?? 0) - Number(balanceData.egreso ?? 0)),
  };
}

export function getDashboardMetrics() {
  const balanceData = getDashboardBalanceData();

  const metricDefinitions = [
    {
      key: "monthly-expense",
      label: "Gasto mensual",
      resolveValue: (source) => formatMoney(source.egreso),
      resolveDelta: () => "dato cargado desde la base",
      resolveTrend: () => "up",
    },
    {
      key: "available-cash",
      label: "Dinero Disponible",
      resolveValue: (source) => formatMoney(source.disponible),
      resolveDelta: () => "calculado: ingreso - egreso",
      resolveTrend: () => "up",
    },
    {
      key: "net-income",
      label: "Ingreso",
      resolveValue: (source) => formatMoney(source.ingreso),
      resolveDelta: () => "dato cargado desde la base",
      resolveTrend: () => "up",
    },
    {
      key: "accumulated-savings",
      label: "Ahorro acumulado",
      resolveValue: (source) => formatMoney(source.ahorro),
      resolveDelta: () => "dato cargado desde la base",
      resolveTrend: () => "up",
    },
  ];

  return metricDefinitions.map((definition) => ({
    id: definition.key,
    label: definition.label,
    value: definition.resolveValue(balanceData),
    delta: definition.resolveDelta(balanceData),
    trend: definition.resolveTrend(balanceData),
  }));
}

export function getDashboardRecentExpenses(limit = 5, periodKey = getFinanzasCurrentPeriod()) {
  return getFinanzasExpensesForPeriod(periodKey)
    .slice()
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, limit)
    .map((expense) => ({
      ...expense,
      fechaCorta: formatIsoDateShort(expense.fecha),
    }));
}

export function getMisGastosCategoryOptions() {
  const categorySet = new Set(Array.isArray(state.finanzas.categories) ? state.finanzas.categories : []);

  state.finanzas.gastos.forEach((expense) => {
    if (expense.categoria) {
      categorySet.add(expense.categoria);
    }
  });

  return [...categorySet].sort((a, b) => a.localeCompare(b));
}

export function getMisGastosPeriodOptions() {
  return getFinanzasAllMonthKeys()
    .slice()
    .sort((a, b) => compareMonthKeys(b, a))
    .map((monthKey) => ({
      value: monthKey,
      label: formatMonthLabelLong(monthKey),
    }));
}

export function getFilteredExpenses() {
  const { search, categoria, periodo } = state.finanzas.filtros;
  const normalizedSearch = search.trim().toLowerCase();

  return state.finanzas.gastos
    .filter((expense) => {
      if (periodo !== "todos" && getMonthKeyFromDate(expense.fecha) !== periodo) {
        return false;
      }

      if (categoria !== "Todas" && expense.categoria !== categoria) {
        return false;
      }

      if (normalizedSearch && !expense.comercio.toLowerCase().includes(normalizedSearch)) {
        return false;
      }

      return true;
    })
    .slice()
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .map((expense) => ({
      ...expense,
      fechaCorta: formatIsoDateShort(expense.fecha),
    }));
}

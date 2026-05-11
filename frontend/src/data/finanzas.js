import { state } from "../state";
import { CATEGORY_COLORS } from "./mockData";
import { getMonthKeyFromDate, compareMonthKeys, formatMonthLabelShort, formatMonthLabelLong, formatIsoDateShort, formatDateDDMMYYYY } from "../utils/date";
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
  const expenses = getFinanzasExpensesForPeriod(periodKey).filter(
    (expense) => expense.tipo === "egreso",
  );

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
  const currentPeriod = getFinanzasCurrentPeriod();
  const monthlyIngreso = getFinanzasExpensesForPeriod(currentPeriod)
    .filter((expense) => expense.tipo === "ingreso")
    .reduce((sum, expense) => sum + Number(expense.monto || 0), 0);

  const metricDefinitions = [
    {
      key: "monthly-expense",
      label: "Gasto mensual",
      resolveValue: () => formatMoney(balanceData.egreso),
      resolveTrend: () => "up",
    },
    {
      key: "available-cash",
      label: "Dinero Disponible",
      resolveValue: () => formatMoney(monthlyIngreso - balanceData.egreso),
      resolveTrend: () => "up",
    },
    {
      key: "net-income",
      label: "Ingreso Total Mensual",
      resolveValue: () => formatMoney(monthlyIngreso),
      resolveTrend: () => "up",
    },
  ];

  return metricDefinitions.map((definition) => ({
    id: definition.key,
    label: definition.label,
    value: definition.resolveValue(),
    delta: "",
    trend: definition.resolveTrend(),
  }));
}

export function getDashboardRecentExpenses(limit = 5) {
  return state.finanzas.gastos
    .slice()
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, limit)
    .map((expense) => ({
      ...expense,
      fechaCorta: formatDateDDMMYYYY(expense.fecha),
    }));
}

export function getDashboardInsight() {
  const currentPeriod = getFinanzasCurrentPeriod();
  const monthlyIngreso = getFinanzasExpensesForPeriod(currentPeriod)
    .filter((g) => g.tipo === "ingreso")
    .reduce((sum, g) => sum + Number(g.monto || 0), 0);
  const { egreso } = getDashboardBalanceData();

  if (monthlyIngreso === 0 && egreso === 0) {
    return "Registrá tus ingresos y gastos para ver un análisis de tu situación financiera mensual.";
  }
  if (monthlyIngreso === 0) {
    return "Registrá tus ingresos del mes para calcular tu balance y tasa de ahorro.";
  }
  const pct = Math.round((egreso / monthlyIngreso) * 100);
  if (pct > 100) return `Tus gastos superan tus ingresos en ${pct - 100}% este mes. Revisá las categorías con mayor gasto.`;
  if (pct > 80) return `Estás usando el ${pct}% de tus ingresos en gastos. Intentá reducir para mejorar tu ahorro mensual.`;
  if (pct <= 50) return `Excelente. Solo el ${pct}% de tus ingresos son gastos este mes.`;
  return `Llevás gastado el ${pct}% de tus ingresos este mes. Vas bien en el control de gastos.`;
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
  const { search, categoria, periodo, tipo, fechaDesde, fechaHasta } = state.finanzas.filtros;
  const normalizedSearch = search.trim().toLowerCase();

  return state.finanzas.gastos
    .filter((expense) => {
      // Filtro por rango de fechas (fecha puntual o fecha desde/hasta)
      if (fechaDesde || fechaHasta) {
        const expDate = expense.fecha ? expense.fecha.slice(0, 10) : "";
        if (fechaDesde && expDate < fechaDesde) return false;
        if (fechaHasta && expDate > fechaHasta) return false;
      } else if (periodo && periodo !== "todos") {
        if (getMonthKeyFromDate(expense.fecha) !== periodo) return false;
      }

      if (categoria !== "Todas" && expense.categoria !== categoria) {
        return false;
      }

      if (tipo && tipo !== "Todos") {
        const tipoEsperado = tipo === "Ingreso" ? "ingreso" : "egreso";
        if (expense.tipo !== tipoEsperado) return false;
      }

      if (normalizedSearch) {
        const inComercio = (expense.comercio || "").toLowerCase().includes(normalizedSearch);
        const inDescripcion = (expense.descripcion || "").toLowerCase().includes(normalizedSearch);
        if (!inComercio && !inDescripcion) return false;
      }

      return true;
    })
    .slice()
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .map((expense) => ({
      ...expense,
      fechaCorta: formatDateDDMMYYYY(expense.fecha),
    }));
}

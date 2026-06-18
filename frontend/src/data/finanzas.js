import { state } from "../state";
import { CATEGORY_COLORS } from "./mockData";
import { getMonthKeyFromDate, compareMonthKeys, formatMonthLabelShort, formatMonthLabelLong, formatDateDDMMYYYY } from "../utils/date";
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
    total: state.finanzas.gastos
      .filter((e) => getMonthKeyFromDate(e.fecha) === monthKey && e.tipo === "egreso")
      .reduce((sum, e) => sum + Number(e.monto || 0), 0),
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
  const ingreso = Number(balanceData.ingreso ?? 0);
  const egreso = Number(balanceData.egreso ?? 0);
  const ahorro = Number(balanceData.ahorro ?? 0);
  const disponible = Number(balanceData.disponible ?? (ingreso - egreso - ahorro));

  return {
    ingreso,
    egreso,
    ahorro,
    disponible,
  };
}

export function getDashboardMetrics() {
  const balanceData = getDashboardBalanceData();

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
      resolveValue: () => formatMoney(balanceData.disponible),
      resolveTrend: () => "up",
    },
    {
      key: "net-income",
      label: "Ingreso Total Mensual",
      resolveValue: () => formatMoney(balanceData.ingreso),
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

export function getDashboardRecentExpenses(limit = 10) {
  const gastos = state.finanzas.gastos;
  
  if (!Array.isArray(gastos)) {
    return [];
  }

  // Copiar y ordenar por fecha descendente (más recientes primero)
  const sorted = gastos.slice().sort((a, b) => {
    return new Date(b.fecha) - new Date(a.fecha);
  });

  // Tomar los primeros N movimientos ordenados y agregar fechaCorta
  return sorted.slice(0, limit).map((gasto) => ({
    ...gasto,
    fechaCorta: formatIsoDateShort(gasto.fecha),
  }));
}

// `getDashboardCategorySummaryFromRecentMovements` eliminado; el resumen
// de categorías se obtiene ahora siempre con `getDashboardCategorySummary(period)`.

export function getDashboardInsight() {
  const { ingreso: monthlyIngreso, egreso } = getDashboardBalanceData();

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

const SEVERITY_RANK = { danger: 0, warning: 1, good: 2, info: 3 };

function severityRank(sev) {
  return SEVERITY_RANK[String(sev || "info").toLowerCase()] ?? 3;
}

export function getDashboardInsights() {
  const { ingreso, egreso } = getDashboardBalanceData();
  if (ingreso > 0 && egreso > 0) {
    const pct = Math.round((egreso / ingreso) * 100);

    if (pct > 100) {
      return [{
        type: "danger",
        icon: "lni-warning",
        title: "Gastos superan ingresos",
        body: `Tus gastos superan tus ingresos en ${pct - 100}% este mes. Revisá tu presupuesto.`,
      }];
    }

    if (pct >= 80) {
      return [{
        type: "warning",
        icon: "lni-warning",
        title: "Gasto elevado este mes",
        body: `Utilizaste el ${pct}% de tu ingreso mensual. Quedan ${formatMoney(ingreso - egreso)} disponibles.`,
      }];
    }

  // 3. Budget alerts
  if (insights.length < 3) {
    const budgetAlerts = getBudgetAlertsForPeriod(currentPeriod);
    if (budgetAlerts.length > 0) {
      const top = budgetAlerts[0];
      const type = top.exceeded ? "danger" : "warning";
      insights.push({
        type,
        icon: "lni-wallet",
        title: `Presupuesto: ${top.categoryName}`,
        body: `${top.exceeded ? "Superaste" : "Alcanzaste el"} ${top.pct}% del presupuesto de ${top.categoryName} este mes (${formatMoney(top.spent)} / ${formatMoney(top.limit)}).`,
      });
    }

    return [{
      type: "info",
      icon: "lni-bulb",
      title: "Análisis mensual",
      body: `Llevás gastado el ${pct}% de tus ingresos este mes. Vas bien en el control de gastos.`,
    }];
  }

  if (egreso > 0) {
    return [{
      type: "info",
      icon: "lni-bulb",
      title: "Salud del presupuesto",
      body: "Agregá tus ingresos del mes para calcular tu balance y tasa de ahorro.",
    }];
  }

  return [{
    type: "info",
    icon: "lni-bulb",
    title: "Salud del presupuesto",
    body: "Registrá tus ingresos y gastos para ver el estado de tu presupuesto mensual.",
  }];
}

export function getLatestDashboardRecommendation() {
  const recomendaciones = Array.isArray(state.finanzas.recomendaciones)
    ? state.finanzas.recomendaciones
    : [];

  const latest = recomendaciones
    .filter((item) => item && (item.date || item.createdAt || item.fecha))
    .slice()
    .sort((a, b) => {
      const aDate = String(a.date || a.createdAt || a.fecha || "");
      const bDate = String(b.date || b.createdAt || b.fecha || "");
      const dateCompare = bDate.localeCompare(aDate);
      if (dateCompare !== 0) return dateCompare;
      return String(b.id || "").localeCompare(String(a.id || ""));
    })[0];

  if (!latest) return null;

  return {
    title: latest.title || latest.titulo || "",
    body: latest.body || latest.contenido || "",
    date: String(latest.date || latest.createdAt || latest.fecha || ""),
    category: latest.category || latest.categoria || "",
    source: latest.source || latest.tipo || "ia",
  };
}

export function getBudgetAlertsForPeriod(periodKey = null) {
  const period = periodKey || getFinanzasCurrentPeriod();
  if (!period) return [];
  const [year, month] = period.split("-").map(Number);
  const budgets = state.finanzas.budgets || [];
  const periodBudgets = budgets.filter((b) => b.month === month && b.year === year);
  if (periodBudgets.length === 0) return [];

  const alerts = [];
  periodBudgets.forEach((b) => {
    const spent = state.finanzas.gastos
      .filter((e) => getMonthKeyFromDate(e.fecha) === period && e.tipo === "egreso" && e.categoria === b.categoryName)
      .reduce((sum, e) => sum + Number(e.monto || 0), 0);
    const pct = b.amountLimit > 0 ? Math.round((spent / b.amountLimit) * 100) : 0;
    if (pct >= 80) {
      alerts.push({
        categoryName: b.categoryName,
        spent,
        limit: b.amountLimit,
        pct,
        exceeded: pct > 100,
      });
    }
  });
  return alerts;
}

export function getFinancialScore() {
  const currentPeriod = getFinanzasCurrentPeriod();
  const currentExpenses = getFinanzasExpensesForPeriod(currentPeriod);
  const ingreso = currentExpenses.filter((e) => e.tipo === "ingreso").reduce((sum, e) => sum + Number(e.monto || 0), 0);
  const egreso = currentExpenses.filter((e) => e.tipo === "egreso").reduce((sum, e) => sum + Number(e.monto || 0), 0);

  let score = 0;

  // 1. Ahorro relativo (40 pts): how much of income is saved
  if (ingreso > 0) {
    const savingRate = (ingreso - egreso) / ingreso;
    if (savingRate >= 0.30) score += 40;
    else if (savingRate >= 0.20) score += 30;
    else if (savingRate >= 0.10) score += 20;
    else if (savingRate >= 0) score += 10;
  }

  // 2. Objetivos de ahorro (30 pts)
  const ahorros = state.dashboard.ahorros || [];
  if (ahorros.length > 0) {
    score += 10;
    const withGoal = ahorros.filter((a) => Number(a.meta || 0) > 0);
    if (withGoal.length > 0) {
      const avgProgress = withGoal.reduce((sum, a) => {
        const pct = Number(a.meta) > 0 ? Number(a.montoActual || a.monto || 0) / Number(a.meta) : 0;
        return sum + pct;
      }, 0) / withGoal.length;
      if (avgProgress >= 0.5) score += 20;
      else if (avgProgress >= 0.25) score += 10;
    }
  }

  // 3. Diversificación de gastos (20 pts)
  if (ingreso > 0) score += 10;
  const uniqueCats = new Set(currentExpenses.filter((e) => e.tipo === "egreso").map((e) => e.categoria));
  if (uniqueCats.size >= 3) score += 10;

  // 4. Historial disponible (10 pts)
  const allMonths = getFinanzasAllMonthKeys();
  if (allMonths.length >= 2) score += 10;

  return Math.max(0, Math.min(100, score));
}

export function getUnreadNotifications() {
  const notifs = state.notifications || [];
  const unread = notifs.filter((n) => !n.wasRead);
  const items = unread.slice(0, 4).map((n) => ({
    id: n.id,
    title: n.title || "Notificación",
    body: n.body || "",
    severity: String(n.severity || "info").toLowerCase(),
  }));
  return { count: unread.length, items };
}

export function getFilteredExpenses() {
  const { search, periodo, tipo, fechaDesde, fechaHasta } = state.finanzas.filtros;
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

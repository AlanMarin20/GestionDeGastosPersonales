import { state } from "../state";
import { getMonthKeyFromDate } from "../utils/date";

export function addExpenseRecord({ comercio, fecha, monto, categoria, descripcion }) {
  const numericAmount = Number.parseFloat(String(monto));

  if (!comercio || !fecha || Number.isNaN(numericAmount) || numericAmount <= 0 || !categoria) {
    return false;
  }

  const monthKey = getMonthKeyFromDate(fecha);
  const id = `g-${Date.now()}`;

  state.finanzas.gastos = [
    { id, comercio, fecha, monto: numericAmount, categoria, descripcion },
    ...state.finanzas.gastos,
  ];

  if (monthKey) {
    state.finanzas.currentPeriod = monthKey;

    if (state.finanzas.ticketGoalByPeriod[monthKey] !== undefined) {
      state.finanzas.ticketGoalByPeriod[monthKey] += 1;
    }
  }

  return true;
}

export function addSavingsGoalRecord({ nombre, montoInicial, meta }) {
  const trimmedName = String(nombre || "").trim();
  const parsedInitialAmount = Number.parseFloat(String(montoInicial));
  const parsedGoal = Number.parseFloat(String(meta));

  if (!trimmedName) {
    return false;
  }

  const safeInitialAmount = Number.isNaN(parsedInitialAmount)
    ? 0
    : Math.max(parsedInitialAmount, 0);
  const safeGoal = Number.isNaN(parsedGoal) || parsedGoal <= 0 ? undefined : parsedGoal;

  state.dashboard.ahorros = [
    {
      id: Date.now().toString(),
      nombre: trimmedName,
      monto: safeInitialAmount,
      meta: safeGoal,
    },
    ...state.dashboard.ahorros,
  ];

  return true;
}

export function updateExpenseRecord(expenseId, updates) {
  const previousExpense = state.finanzas.gastos.find((item) => item.id === expenseId);
  if (!previousExpense) {
    return false;
  }

  const nextAmount = Number.parseFloat(String(updates.monto));
  if (!updates.comercio || !updates.fecha || Number.isNaN(nextAmount) || nextAmount <= 0 || !updates.categoria) {
    return false;
  }

  state.finanzas.gastos = state.finanzas.gastos.map((expense) =>
    expense.id === expenseId
      ? {
          ...expense,
          comercio: updates.comercio,
          fecha: updates.fecha,
          monto: nextAmount,
          categoria: updates.categoria,
          descripcion: updates.descripcion || "",
        }
      : expense,
  );

  return true;
}

export function deleteExpenseRecord(expenseId) {
  const previousLength = state.finanzas.gastos.length;
  state.finanzas.gastos = state.finanzas.gastos.filter(
    (expense) => expense.id !== expenseId,
  );

  return state.finanzas.gastos.length !== previousLength;
}

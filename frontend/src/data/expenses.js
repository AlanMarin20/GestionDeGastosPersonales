import { state } from "../state";
import { getMonthKeyFromDate } from "../utils/date";
import { apiCreateMovimiento, apiUpdateMovimiento, apiDeleteMovimiento } from "../api/movimientos";

export async function addExpenseRecord({ comercio, fecha, monto, categoria, descripcion, tagIds }) {
  const numericAmount = Number.parseFloat(String(monto));

  if (!comercio || !fecha || Number.isNaN(numericAmount) || numericAmount <= 0 || !categoria) {
    return false;
  }

  try {
    const saved = await apiCreateMovimiento({
      tipo: "egreso",
      monto: numericAmount,
      comercio,
      categoria,
      descripcion,
      fecha,
      tagIds,
    });

    const monthKey = getMonthKeyFromDate(fecha);
    // Build etiquetas from the saved response or resolve from state.finanzas.tags
    const savedEtiquetas = Array.isArray(saved.etiquetas)
      ? saved.etiquetas
      : (Array.isArray(tagIds) && tagIds.length > 0
        ? (state.finanzas.tags || []).filter((t) => tagIds.includes(t.id))
        : []);

    state.finanzas.gastos = [
      {
        id: saved.id,
        comercio,
        fecha,
        monto: numericAmount,
        categoria,
        descripcion: descripcion || "",
        tipo: "egreso",
        etiquetas: savedEtiquetas,
      },
      ...state.finanzas.gastos,
    ];

    if (monthKey) {
      state.finanzas.currentPeriod = monthKey;
      if (state.finanzas.ticketGoalByPeriod[monthKey] !== undefined) {
        state.finanzas.ticketGoalByPeriod[monthKey] += 1;
      }
    }

    return true;
  } catch (error) {
    console.error("Error guardando gasto:", error);
    return false;
  }
}

export async function addIncomeRecord({ fecha, monto, categoria, descripcion }) {
  const numericAmount = Number.parseFloat(String(monto));

  if (!fecha || Number.isNaN(numericAmount) || numericAmount <= 0 || !categoria) {
    return false;
  }

  const source = descripcion || categoria;

  try {
    const saved = await apiCreateMovimiento({
      tipo: "ingreso",
      monto: numericAmount,
      comercio: source,
      categoria,
      descripcion: descripcion || "",
      fecha,
    });

    const monthKey = getMonthKeyFromDate(fecha);

    state.finanzas.gastos = [
      {
        id: saved.id,
        comercio: source,
        fecha,
        monto: numericAmount,
        categoria,
        descripcion: descripcion || "",
        tipo: "ingreso",
      },
      ...state.finanzas.gastos,
    ];

    if (monthKey) {
      state.finanzas.currentPeriod = monthKey;
    }

    return true;
  } catch (error) {
    console.error("Error guardando ingreso:", error);
    return false;
  }
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

export async function updateExpenseRecord(expenseId, updates) {
  const previousExpense = state.finanzas.gastos.find((item) => item.id === expenseId);
  if (!previousExpense) {
    return false;
  }

  const isIngreso = previousExpense.tipo === "ingreso";
  const nextAmount = Number.parseFloat(String(updates.monto));

  if (!updates.fecha || Number.isNaN(nextAmount) || nextAmount <= 0 || !updates.categoria) {
    return false;
  }
  if (!isIngreso && !updates.comercio) {
    return false;
  }

  const apiPayload = {
    tipo: previousExpense.tipo,
    monto: nextAmount,
    categoria: updates.categoria,
    descripcion: updates.descripcion || "",
    fecha: updates.fecha,
  };
  if (!isIngreso) {
    apiPayload.comercio = updates.comercio;
  }

  try {
    await apiUpdateMovimiento(expenseId, apiPayload);

    state.finanzas.gastos = state.finanzas.gastos.map((expense) =>
      expense.id === expenseId
        ? {
            ...expense,
            ...(isIngreso ? {} : { comercio: updates.comercio }),
            fecha: updates.fecha,
            monto: nextAmount,
            categoria: updates.categoria,
            descripcion: updates.descripcion || "",
          }
        : expense,
    );

    return true;
  } catch (error) {
    console.error("Error actualizando gasto:", error);
    return false;
  }
}

export async function deleteExpenseRecord(expenseId) {
  try {
    await apiDeleteMovimiento(expenseId);

    const previousLength = state.finanzas.gastos.length;
    state.finanzas.gastos = state.finanzas.gastos.filter(
      (expense) => expense.id !== expenseId,
    );

    return state.finanzas.gastos.length !== previousLength;
  } catch (error) {
    console.error("Error eliminando gasto:", error);
    return false;
  }
}

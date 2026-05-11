import { apiFetch } from "./client";
import { state } from "../state";

export async function loadBudgets() {
  try {
    const res = await apiFetch("/api/budgets");
    if (!res.ok) return;
    const data = await res.json();
    if (Array.isArray(data)) {
      state.finanzas.budgets = data.map((b) => ({
        id: b.id,
        categoryId: b.category?.id ?? null,
        categoryName: b.category?.name ?? "Sin categoría",
        amountLimit: Number(b.amountLimit ?? 0),
        month: Number(b.month),
        year: Number(b.year),
      }));
    }
  } catch {
    // silently ignore
  }
}

export async function createBudget({ categoryId, amountLimit, month, year }) {
  const res = await apiFetch("/api/budgets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ categoryId: Number(categoryId), amountLimit: Number(amountLimit), month: Number(month), year: Number(year) }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(Array.isArray(err.message) ? err.message[0] : (err.message || `HTTP ${res.status}`));
  }
  return res.json();
}

export async function updateBudget(id, { amountLimit }) {
  const res = await apiFetch(`/api/budgets/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amountLimit: Number(amountLimit) }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function deleteBudget(id) {
  const res = await apiFetch(`/api/budgets/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

import { apiFetch } from "./client";
import { state } from "../state";

export async function loadCategories() {
  try {
    const res = await apiFetch("/api/categories");
    if (!res.ok) return;
    const data = await res.json();
    if (Array.isArray(data)) {
      state.finanzas.customCategories = data.map((c) => ({
        id: c.id,
        name: c.name,
        icon: c.icon ?? "",
        color: c.color ?? "",
        isDefault: Boolean(c.isDefault),
        userId: c.user?.id ?? null,
      }));
      // Sync category names into finanzas.categories for the expense form
      const names = data.map((c) => c.name);
      const merged = Array.from(new Set([...state.finanzas.categories, ...names])).sort((a, b) => a.localeCompare(b));
      state.finanzas.categories = merged;
    }
  } catch {
    // silently ignore
  }
}

export async function createCategory({ name, icon, color }) {
  const body = { name };
  if (icon) body.icon = icon;
  if (color) body.color = color;

  const res = await apiFetch("/api/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(Array.isArray(err.message) ? err.message[0] : (err.message || `HTTP ${res.status}`));
  }
  return res.json();
}

export async function deleteCategory(id) {
  const res = await apiFetch(`/api/categories/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

import { state } from "../state";
import { apiFetch } from "./client";

export async function loadTags() {
  const res = await apiFetch("/api/tags");
  if (!res.ok) return;
  const data = await res.json();
  state.finanzas.tags = Array.isArray(data) ? data : [];
}

export async function createTag(nombre) {
  const res = await apiFetch("/api/tags", {
    method: "POST",
    body: JSON.stringify({ nombre }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const tag = await res.json();
  state.finanzas.tags = [...state.finanzas.tags, tag];
  return tag;
}

export async function deleteTag(id) {
  const res = await apiFetch(`/api/tags/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  state.finanzas.tags = state.finanzas.tags.filter((t) => t.id !== id);
}

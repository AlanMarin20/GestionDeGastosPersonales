import { apiFetch } from "./client";

export async function apiCreateMovimiento({ tipo, monto, comercio, categoria, descripcion, fecha, tagIds }) {
  const response = await apiFetch("/api/movimientos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tipo,
      monto: Number(monto),
      comercio: comercio || undefined,
      categoria: categoria || undefined,
      descripcion: descripcion || undefined,
      fecha: fecha || undefined,
      tagIds: tagIds?.length ? tagIds : undefined,
    }),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

export async function apiUpdateMovimiento(id, { tipo, monto, comercio, categoria, descripcion, fecha, tagIds }) {
  const body = {};
  if (tipo !== undefined) body.tipo = tipo;
  if (monto !== undefined) body.monto = Number(monto);
  if (comercio !== undefined) body.comercio = comercio || undefined;
  if (categoria !== undefined) body.categoria = categoria || undefined;
  if (descripcion !== undefined) body.descripcion = descripcion || undefined;
  if (fecha !== undefined) body.fecha = fecha || undefined;
  if (tagIds !== undefined) body.tagIds = tagIds;

  const response = await apiFetch(`/api/movimientos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

export async function apiDeleteMovimiento(id) {
  const response = await apiFetch(`/api/movimientos/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

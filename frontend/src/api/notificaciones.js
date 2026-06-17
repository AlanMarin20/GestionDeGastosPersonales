import { apiFetch, getAccessToken } from "./client";
import { state } from "../state";

export async function loadNotifications() {
  if (!getAccessToken()) return;

  try {
    const response = await apiFetch("/api/notifications");
    if (!response.ok) return;

    const data = await response.json();
    if (Array.isArray(data)) {
      state.notifications = data.map((n) => ({
        id: n.id,
        title: n.mensaje || "Notificación",
        body: "",
        severity: n.tipo || "info",
        date: n.createdAt ? new Date(n.createdAt).toLocaleDateString() : "",
        wasRead: n.wasRead,
      }));
    }
  } catch (error) {
    console.warn("Error cargando notificaciones:", error);
  }
}

export async function markNotificationAsRead(id) {
  if (!getAccessToken()) return;

  try {
    const response = await apiFetch(`/api/notifications/${id}/read`, {
      method: "PATCH",
    });
    if (response.ok) {
      if (Array.isArray(state.notifications)) {
        const item = state.notifications.find((n) => n.id === id);
        if (item) {
          item.wasRead = true;
        }
      }
    }
  } catch (error) {
    console.warn("Error al marcar notificación como leída:", error);
  }
}

export async function markAllNotificationsAsRead() {
  if (!getAccessToken()) return;
  const unread = (state.notifications || []).filter((n) => !n.wasRead);
  if (unread.length === 0) return;

  try {
    await Promise.all(
      unread.map((n) =>
        apiFetch(`/api/notifications/${n.id}/read`, {
          method: "PATCH",
        })
      )
    );
    unread.forEach((n) => {
      n.wasRead = true;
    });
  } catch (error) {
    console.warn("Error al marcar todas las notificaciones como leídas:", error);
  }
}

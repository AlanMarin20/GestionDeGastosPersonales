import { APP_NOTIFICATION_CONTAINER_ID, APP_CONFIRM_DIALOG_ID } from "../config";

function ensureAppNotificationContainer() {
  let container = document.getElementById(APP_NOTIFICATION_CONTAINER_ID);

  if (!container) {
    container = document.createElement("div");
    container.id = APP_NOTIFICATION_CONTAINER_ID;
    container.className = "app-notification-stack";
    container.setAttribute("aria-live", "polite");
    container.setAttribute("aria-atomic", "true");
    document.body.append(container);
  }

  return container;
}

export function showAppNotification(message, type = "info", durationMs = 3400) {
  const text = String(message || "").trim();
  if (!text) return;

  const variant = ["info", "success", "error", "warning"].includes(type) ? type : "info";
  const container = ensureAppNotificationContainer();

  while (container.childElementCount >= 4) {
    container.firstElementChild?.remove();
  }

  const toast = document.createElement("div");
  toast.className = `app-notification app-notification-${variant}`;
  toast.setAttribute("role", variant === "error" ? "alert" : "status");
  toast.textContent = text;
  container.append(toast);

  window.requestAnimationFrame(() => {
    toast.classList.add("is-visible");
  });

  let dismissed = false;
  const dismiss = () => {
    if (dismissed) return;
    dismissed = true;
    toast.classList.remove("is-visible");
    toast.classList.add("is-leaving");

    window.setTimeout(() => {
      toast.remove();
    }, 220);
  };

  const timeoutId = window.setTimeout(dismiss, durationMs);
  toast.addEventListener("click", () => {
    window.clearTimeout(timeoutId);
    dismiss();
  });
}

export function showAppConfirm({
  title = "Confirmar accion",
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  danger = false,
} = {}) {
  return new Promise((resolve) => {
    const existing = document.getElementById(APP_CONFIRM_DIALOG_ID);
    existing?.remove();

    const root = document.createElement("div");
    root.id = APP_CONFIRM_DIALOG_ID;
    root.className = "app-confirm-root";

    const backdrop = document.createElement("button");
    backdrop.type = "button";
    backdrop.className = "app-confirm-backdrop";
    backdrop.setAttribute("aria-label", "Cerrar confirmacion");

    const dialog = document.createElement("section");
    dialog.className = `app-confirm-dialog${danger ? " app-confirm-danger" : ""}`;
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-label", title);

    const heading = document.createElement("h3");
    heading.className = "app-confirm-title";
    heading.textContent = title;

    const body = document.createElement("p");
    body.className = "app-confirm-message";
    body.textContent = message || "Confirma para continuar.";

    const actions = document.createElement("div");
    actions.className = "app-confirm-actions";

    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.className = "app-confirm-btn app-confirm-btn-secondary";
    cancelBtn.textContent = cancelText;

    const confirmBtn = document.createElement("button");
    confirmBtn.type = "button";
    confirmBtn.className = danger
      ? "app-confirm-btn app-confirm-btn-danger"
      : "app-confirm-btn app-confirm-btn-primary";
    confirmBtn.textContent = confirmText;

    actions.append(cancelBtn, confirmBtn);
    dialog.append(heading, body, actions);
    root.append(backdrop, dialog);
    document.body.append(root);

    window.requestAnimationFrame(() => {
      root.classList.add("is-open");
      cancelBtn.focus();
    });

    let settled = false;
    const finalize = (result) => {
      if (settled) return;
      settled = true;
      root.classList.remove("is-open");
      document.removeEventListener("keydown", onKeyDown);

      window.setTimeout(() => {
        root.remove();
        resolve(result);
      }, 180);
    };

    const onKeyDown = (event) => {
      if (event.key === "Escape") finalize(false);
    };

    document.addEventListener("keydown", onKeyDown);
    backdrop.addEventListener("click", () => finalize(false));
    cancelBtn.addEventListener("click", () => finalize(false));
    confirmBtn.addEventListener("click", () => finalize(true));
  });
}

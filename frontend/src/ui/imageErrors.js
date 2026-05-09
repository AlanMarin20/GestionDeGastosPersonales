let hasGlobalImageErrorHandler = false;

function handleGlobalImageError(event) {
  const target = event.target;
  if (!(target instanceof HTMLImageElement)) return;

  const fallbackSrc = target.getAttribute("data-fallback-src");
  if (fallbackSrc && target.dataset.fallbackApplied !== "true") {
    const currentSrc = target.getAttribute("src") || "";
    if (currentSrc !== fallbackSrc) {
      target.dataset.fallbackApplied = "true";
      target.src = fallbackSrc;
      return;
    }
  }

  if (target.getAttribute("data-image-error-mode") === "toggle-next") {
    target.classList.add("d-none");
    const nextElement = target.nextElementSibling;
    if (nextElement instanceof HTMLElement) {
      nextElement.classList.remove("d-none");
    }
  }
}

export function installGlobalImageErrorHandler() {
  if (hasGlobalImageErrorHandler) return;
  document.addEventListener("error", handleGlobalImageError, true);
  hasGlobalImageErrorHandler = true;
}

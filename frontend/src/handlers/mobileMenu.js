export function getLandingMobileMenuElements() {
  const menu = document.querySelector("[data-landing-mobile-menu]");
  const backdrop = document.querySelector("[data-landing-mobile-backdrop]");
  const toggleButton = document.querySelector("[data-action='toggle-landing-mobile-menu']");
  const menuContainer = menu?.closest(".landing-auth-group") ||
    toggleButton?.closest(".landing-auth-group") || null;

  return { menu, backdrop, toggleButton, menuContainer };
}

export function closeLandingMobileMenu({ restoreFocus = false } = {}) {
  const { menu, backdrop, toggleButton } = getLandingMobileMenuElements();

  document.body.classList.remove("landing-mobile-menu-open");

  if (!menu || !toggleButton) {
    if (backdrop) {
      backdrop.classList.remove("is-open");
      backdrop.hidden = true;
    }
    return;
  }

  const wasOpen = !menu.hidden;
  menu.classList.remove("is-open");
  menu.hidden = true;

  if (backdrop) {
    backdrop.classList.remove("is-open");
    backdrop.hidden = true;
  }

  toggleButton.setAttribute("aria-expanded", "false");

  if (restoreFocus && wasOpen) {
    toggleButton.focus();
  }
}

export function toggleLandingMobileMenu() {
  const { menu, backdrop, toggleButton } = getLandingMobileMenuElements();

  if (!menu || !toggleButton) return;

  if (menu.hidden) {
    menu.hidden = false;
    if (backdrop) backdrop.hidden = false;

    menu.classList.remove("is-open");
    backdrop?.classList.remove("is-open");

    window.requestAnimationFrame(() => {
      menu.classList.add("is-open");
      backdrop?.classList.add("is-open");
    });

    document.body.classList.add("landing-mobile-menu-open");
    toggleButton.setAttribute("aria-expanded", "true");
    return;
  }

  closeLandingMobileMenu();
}

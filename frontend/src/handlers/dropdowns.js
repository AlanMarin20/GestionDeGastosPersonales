export const DASHBOARD_DROPDOWN_CONFIG = Object.freeze([
  Object.freeze({ containerSelector: ".gd-top-notifications", triggerAction: "toggle-notifications-menu" }),
  Object.freeze({ containerSelector: ".gd-user-chip-menu", triggerAction: "toggle-user-chip-menu" }),
  Object.freeze({ containerSelector: ".gd-income-entry-menu", triggerAction: "toggle-income-entry-menu" }),
]);

const DASHBOARD_DROPDOWN_CONFIG_BY_ACTION = Object.freeze(
  DASHBOARD_DROPDOWN_CONFIG.reduce((configByAction, config) => {
    configByAction[config.triggerAction] = config;
    return configByAction;
  }, {}),
);

export function closeDashboardDropdown(config) {
  if (!config) return;

  document.querySelectorAll(`${config.containerSelector}.is-open`).forEach((menu) => {
    menu.classList.remove("is-open");
    const trigger = menu.querySelector(`[data-action='${config.triggerAction}']`);
    trigger?.setAttribute("aria-expanded", "false");
  });
}

export function closeDashboardDropdowns() {
  DASHBOARD_DROPDOWN_CONFIG.forEach((config) => {
    closeDashboardDropdown(config);
  });
}

export function toggleDashboardDropdown(trigger, action) {
  const config = DASHBOARD_DROPDOWN_CONFIG_BY_ACTION[action];
  if (!config) return;

  const menu = trigger?.closest(config.containerSelector);
  if (!menu) return;

  const shouldOpen = !menu.classList.contains("is-open");
  closeDashboardDropdowns();

  if (shouldOpen) {
    menu.classList.add("is-open");
    trigger.setAttribute("aria-expanded", "true");
  }
}

export function toggleDashboardNotificationsMenu(trigger) {
  toggleDashboardDropdown(trigger, "toggle-notifications-menu");
}

export function toggleDashboardUserChipMenu(trigger) {
  toggleDashboardDropdown(trigger, "toggle-user-chip-menu");
}

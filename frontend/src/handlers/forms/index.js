import { attachAuthFormHandlers, clearRegistroExitosoAutoRedirect } from "./auth.js";
import { attachExpenseFormHandlers } from "./expense.js";
import { attachDashboardFormHandlers } from "./dashboard.js";
import { attachSavingsFormHandlers } from "./savings.js";
import { attachAdvisorFormHandlers } from "./advisor.js";
import { attachProfileFormHandlers } from "./profile.js";
import { attachNotificationFormHandlers } from "./notifications.js";

export { clearRegistroExitosoAutoRedirect };

export function attachFormHandlers(pathname, { navigate, render }) {
  attachAuthFormHandlers(pathname, { navigate, render });
  attachExpenseFormHandlers(pathname, { navigate, render });
  attachDashboardFormHandlers(pathname, { navigate, render });
  attachSavingsFormHandlers(pathname, { navigate, render });
  attachAdvisorFormHandlers(pathname, { navigate, render });
  attachProfileFormHandlers(pathname, { navigate, render });
  attachNotificationFormHandlers(pathname, { navigate, render });
}

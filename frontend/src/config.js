// Determinar la URL del API
const viteApiUrl = import.meta.env.VITE_API_URL;
export const API_BASE_URL = viteApiUrl && viteApiUrl.trim() ? viteApiUrl.trim() : (import.meta.env.PROD ? "" : "http://localhost:3000");
export const ACCESS_TOKEN_KEY = "access_token";
export const THEME_STORAGE_KEY = "theme_preference";
export const APP_PREFERENCES_STORAGE_KEY = "app_preferences";
export const DEFAULT_PROFILE_IMAGE = "/assets/img/user-avatar-default.svg";
export const PASSWORD_POLICY_MESSAGE =
  "La contraseña debe tener al menos 8 caracteres e incluir mayúscula, minúscula, número y carácter especial";
export const REGISTRO_EXITOSO_REDIRECT_SECONDS = 5;
export const APP_NOTIFICATION_CONTAINER_ID = "app-notification-stack";
export const APP_CONFIRM_DIALOG_ID = "app-confirm-dialog";

export const THEME_MODES = new Set(["light", "dark", "system"]);
export const FONT_SIZE_MODES = new Set(["sm", "md", "lg"]);
export const DENSITY_MODES = new Set(["comfortable", "compact"]);

export const CURRENCY_CONFIG = {
  USD: {
    currency: "USD",
    fallbackLocale: "en-US",
    localeByLanguage: {
      es: "es-AR",
      en: "en-US",
      pt: "pt-BR",
    },
  },
  ARS: {
    currency: "ARS",
    fallbackLocale: "es-AR",
    localeByLanguage: {
      es: "es-AR",
      en: "en-US",
      pt: "pt-BR",
    },
  },
  EUR: {
    currency: "EUR",
    fallbackLocale: "es-ES",
    localeByLanguage: {
      es: "es-ES",
      en: "en-IE",
      pt: "pt-PT",
    },
  },
};

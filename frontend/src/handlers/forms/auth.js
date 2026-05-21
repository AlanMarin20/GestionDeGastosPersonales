import { state } from "../../state";
import { t } from "../../i18n";
import {
  API_BASE_URL,
  ACCESS_TOKEN_KEY,
  PASSWORD_POLICY_MESSAGE,
  REGISTRO_EXITOSO_REDIRECT_SECONDS,
} from "../../config";
import { isStrongPassword } from "../../utils/format";
import { showAppNotification } from "../../ui/notifications";
import {
  requestPasswordReset,
  verifyResetCode,
  resetPassword,
  registerUser,
  verifyRegistrationEmail,
  resendRegistrationCode,
  syncProfileFromUser,
} from "../../api/user";

let registroExitosoRedirectTimeoutId = null;
let registroExitosoCountdownIntervalId = null;

export function clearRegistroExitosoAutoRedirect() {
  if (registroExitosoRedirectTimeoutId !== null) {
    window.clearTimeout(registroExitosoRedirectTimeoutId);
    registroExitosoRedirectTimeoutId = null;
  }

  if (registroExitosoCountdownIntervalId !== null) {
    window.clearInterval(registroExitosoCountdownIntervalId);
    registroExitosoCountdownIntervalId = null;
  }
}

export function attachAuthFormHandlers(pathname, { navigate }) {
  if (pathname !== "/registro/exitoso") {
    clearRegistroExitosoAutoRedirect();
  }

  if (pathname === "/login") {
    const loginForm = document.getElementById("loginForm");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("contrasena");
    const errorDiv = document.getElementById("loginError");

    const removeFieldErrorState = () => {
      [emailInput, passwordInput].forEach((field) => {
        field?.classList.remove("auth-input-error");
      });
    };

    const setAuthError = (message, fieldsToHighlight = [], variant = "default") => {
      if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.remove("auth-error-alert-email-format");
        if (variant === "email-format") {
          errorDiv.classList.add("auth-error-alert-email-format");
        }
        errorDiv.classList.remove("d-none");
      }
      removeFieldErrorState();
      fieldsToHighlight.forEach((field) => {
        field?.classList.add("auth-input-error");
      });
    };

    const clearAuthError = () => {
      if (errorDiv) {
        errorDiv.classList.add("d-none");
        errorDiv.classList.remove("auth-error-alert-email-format");
      }
      removeFieldErrorState();
    };

    [emailInput, passwordInput].forEach((field) => {
      field?.addEventListener("input", () => {
        field.classList.remove("auth-input-error");
      });
    });

    loginForm?.addEventListener("submit", async (event) => {
      event.preventDefault();

      const email = emailInput?.value?.trim() ?? "";
      const password = passwordInput?.value ?? "";
      const submitBtn = loginForm.querySelector('button[type="submit"]');

      clearAuthError();

      if (!email || !password) {
        setAuthError(t('forms.completeEmailPassword'), [emailInput, passwordInput]);
        return;
      }

      if (!email.includes("@")) {
        setAuthError(t('forms.emailMustHaveAt'), [emailInput], "email-format");
        return;
      }

      if (submitBtn) submitBtn.disabled = true;

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.message || t('forms.invalidCredentials'));
        }

        const data = await response.json();
        localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
        syncProfileFromUser(data.user);
        navigate("/dashboard");
      } catch (error) {
        const message = error instanceof Error ? error.message : t('forms.couldNotLogin');
        setAuthError(message, [emailInput, passwordInput]);
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  if (pathname === "/recuperar-contrasena") {
    const recoveryForm = document.getElementById("recuperarContrasenaForm");
    const emailInput = document.getElementById("email");
    const errorDiv = document.getElementById("recuperarContrasenaError");

    state.authRecovery.codeVerified = false;

    if (emailInput && state.authRecovery.email) {
      emailInput.value = state.authRecovery.email;
    }

    const removeFieldErrorState = () => {
      [emailInput].forEach((field) => {
        field?.classList.remove("auth-input-error");
      });
    };

    const setAuthError = (message, fieldsToHighlight = [], variant = "default") => {
      if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.remove("auth-error-alert-email-format");
        if (variant === "email-format") {
          errorDiv.classList.add("auth-error-alert-email-format");
        }
        errorDiv.classList.remove("d-none");
      }
      removeFieldErrorState();
      fieldsToHighlight.forEach((field) => {
        field?.classList.add("auth-input-error");
      });
    };

    const clearAuthError = () => {
      if (errorDiv) {
        errorDiv.classList.add("d-none");
        errorDiv.classList.remove("auth-error-alert-email-format");
      }
      removeFieldErrorState();
    };

    emailInput?.addEventListener("input", () => {
      emailInput.classList.remove("auth-input-error");
    });

    recoveryForm?.addEventListener("submit", async (event) => {
      event.preventDefault();

      const email = emailInput?.value?.trim() ?? "";
      const submitBtn = recoveryForm.querySelector('[type="submit"]');

      clearAuthError();

      if (!email) {
        setAuthError(t('forms.completeEmail'), [emailInput]);
        return;
      }

      if (!email.includes("@")) {
        setAuthError(t('forms.emailMustHaveAtLower'), [emailInput], "email-format");
        return;
      }

      if (submitBtn) submitBtn.disabled = true;
      try {
        await requestPasswordReset(email);
      } catch (err) {
        setAuthError(err?.message || t('forms.couldNotSendCode'), [emailInput]);
        if (submitBtn) submitBtn.disabled = false;
        return;
      }
      if (submitBtn) submitBtn.disabled = false;

      state.authRecovery.email = email;
      state.authRecovery.code = "";
      state.authRecovery.codeVerified = false;
      showAppNotification(t('forms.recoveryCodeSent'), "info");
      navigate("/recuperar-contrasena/verificar");
    });
  }

  if (pathname === "/recuperar-contrasena/verificar") {
    const verifyForm = document.getElementById("verificarCodigoForm");
    const codeInput = document.getElementById("codigoRecuperacion");
    const errorDiv = document.getElementById("verificarCodigoError");

    const removeFieldErrorState = () => {
      [codeInput].forEach((field) => {
        field?.classList.remove("auth-input-error");
      });
    };

    const setAuthError = (message, fieldsToHighlight = []) => {
      if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.remove("d-none");
      }
      removeFieldErrorState();
      fieldsToHighlight.forEach((field) => {
        field?.classList.add("auth-input-error");
      });
    };

    const clearAuthError = () => {
      if (errorDiv) {
        errorDiv.classList.add("d-none");
      }
      removeFieldErrorState();
    };

    codeInput?.addEventListener("input", () => {
      const sanitized = (codeInput.value || "").replace(/\D/g, "").slice(0, 6);
      if (sanitized !== codeInput.value) {
        codeInput.value = sanitized;
      }
      codeInput.classList.remove("auth-input-error");
    });

    verifyForm?.addEventListener("submit", async (event) => {
      event.preventDefault();

      const code = (codeInput?.value || "").trim();
      const normalizedCode = code.replace(/\s+/g, "");
      const submitBtn = verifyForm.querySelector('[type="submit"]');

      clearAuthError();

      if (!normalizedCode) {
        setAuthError(t('forms.enterVerificationCode'), [codeInput]);
        return;
      }

      if (!/^\d{6}$/.test(normalizedCode)) {
        setAuthError(t('forms.codeMustHave6'), [codeInput]);
        return;
      }

      if (submitBtn) submitBtn.disabled = true;
      try {
        await verifyResetCode(state.authRecovery.email, normalizedCode);
        state.authRecovery.code = normalizedCode;
        state.authRecovery.codeVerified = true;
        navigate("/recuperar-contrasena/nueva");
      } catch (err) {
        setAuthError(err?.message || t('forms.invalidOrExpiredCode'), [codeInput]);
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  if (pathname === "/recuperar-contrasena/nueva") {
    if (!state.authRecovery.codeVerified) {
      showAppNotification("Primero verifica tu codigo para continuar", "warning");
      navigate("/recuperar-contrasena/verificar", true);
      return;
    }

    const updateForm = document.getElementById("actualizarContrasenaForm");
    const passwordInput = document.getElementById("nuevaContrasena");
    const confirmPasswordInput = document.getElementById("confirmarContrasena");
    const errorDiv = document.getElementById("actualizarContrasenaError");

    const removeFieldErrorState = () => {
      [passwordInput, confirmPasswordInput].forEach((field) => {
        field?.classList.remove("auth-input-error");
      });
    };

    const setAuthError = (message, fieldsToHighlight = []) => {
      if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.remove("d-none");
      }
      removeFieldErrorState();
      fieldsToHighlight.forEach((field) => {
        field?.classList.add("auth-input-error");
      });
    };

    const clearAuthError = () => {
      if (errorDiv) {
        errorDiv.classList.add("d-none");
      }
      removeFieldErrorState();
    };

    [passwordInput, confirmPasswordInput].forEach((field) => {
      field?.addEventListener("input", () => {
        field.classList.remove("auth-input-error");
      });
    });

    updateForm?.addEventListener("submit", async (event) => {
      event.preventDefault();

      const password = passwordInput?.value ?? "";
      const confirmPassword = confirmPasswordInput?.value ?? "";
      const submitBtn = updateForm.querySelector('[type="submit"]');

      clearAuthError();

      if (!password || !confirmPassword) {
        setAuthError(t('forms.completeFields'), [passwordInput, confirmPasswordInput]);
        return;
      }

      if (!isStrongPassword(password)) {
        setAuthError(PASSWORD_POLICY_MESSAGE, [passwordInput]);
        return;
      }

      if (password !== confirmPassword) {
        setAuthError(t('forms.passwordsDoNotMatchLower'), [passwordInput, confirmPasswordInput]);
        return;
      }

      if (submitBtn) submitBtn.disabled = true;
      try {
        await resetPassword(state.authRecovery.email, state.authRecovery.code, password);
        state.authRecovery.email = "";
        state.authRecovery.code = "";
        state.authRecovery.codeVerified = false;
        showAppNotification(t('forms.passwordUpdatedLogin'), "success");
        navigate("/login", true);
      } catch (err) {
        setAuthError(err?.message || t('forms.couldNotUpdatePassword'));
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  if (pathname === "/registro") {
    const registroForm = document.getElementById("registroForm");
    const nombreInput = document.getElementById("nombre");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("contrasena");
    const confirmPasswordInput = document.getElementById("confirmarContrasena");
    const errorDiv = document.getElementById("registroError");

    const removeFieldErrorState = () => {
      [nombreInput, emailInput, passwordInput, confirmPasswordInput].forEach((field) => {
        field?.classList.remove("auth-input-error");
      });
    };

    const setAuthError = (message, fieldsToHighlight = [], variant = "default") => {
      if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.remove("auth-error-alert-email-format");
        if (variant === "email-format") {
          errorDiv.classList.add("auth-error-alert-email-format");
        }
        errorDiv.classList.remove("d-none");
      }
      removeFieldErrorState();
      fieldsToHighlight.forEach((field) => {
        field?.classList.add("auth-input-error");
      });
    };

    const clearAuthError = () => {
      if (errorDiv) {
        errorDiv.classList.add("d-none");
        errorDiv.classList.remove("auth-error-alert-email-format");
      }
      removeFieldErrorState();
    };

    [nombreInput, emailInput, passwordInput, confirmPasswordInput].forEach((field) => {
      field?.addEventListener("input", () => {
        field.classList.remove("auth-input-error");
      });
    });

    registroForm?.addEventListener("submit", async (event) => {
      event.preventDefault();

      const nombre = nombreInput?.value?.trim() ?? "";
      const email = emailInput?.value?.trim() ?? "";
      const password = passwordInput?.value ?? "";
      const confirmPassword = confirmPasswordInput?.value ?? "";
      const submitBtn = registroForm.querySelector('button[type="submit"]');

      clearAuthError();

      if (!nombre || !email || !password || !confirmPassword) {
        setAuthError(t('forms.completeRequiredFields'), [
          nombreInput,
          emailInput,
          passwordInput,
          confirmPasswordInput,
        ]);
        return;
      }

      if (!email.includes("@")) {
        setAuthError(t('forms.emailMustHaveAt'), [emailInput], "email-format");
        return;
      }

      if (!isStrongPassword(password)) {
        setAuthError(PASSWORD_POLICY_MESSAGE, [passwordInput]);
        return;
      }

      if (password !== confirmPassword) {
        setAuthError(t('forms.passwordsDoNotMatch'), [passwordInput, confirmPasswordInput]);
        return;
      }

      if (submitBtn) submitBtn.disabled = true;

      try {
        await registerUser(nombre, email, password);
        state.authRegistration.email = email;
        state.authRegistration.codeVerified = false;
        navigate("/registro/verificar");
      } catch (error) {
        const message = error instanceof Error ? error.message : t('forms.couldNotRegister');
        setAuthError(message, [emailInput, passwordInput, confirmPasswordInput]);
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  if (pathname === "/registro/verificar") {
    const verifyForm = document.getElementById("verificarRegistroForm");
    const codeInput = document.getElementById("codigoRegistro");
    const errorDiv = document.getElementById("verificarRegistroError");

    const removeFieldErrorState = () => {
      codeInput?.classList.remove("auth-input-error");
    };

    const setAuthError = (message, fieldsToHighlight = []) => {
      if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.remove("d-none");
      }
      removeFieldErrorState();
      fieldsToHighlight.forEach((field) => {
        field?.classList.add("auth-input-error");
      });
    };

    const clearAuthError = () => {
      if (errorDiv) errorDiv.classList.add("d-none");
      removeFieldErrorState();
    };

    codeInput?.addEventListener("input", () => {
      const sanitized = (codeInput.value || "").replace(/\D/g, "").slice(0, 6);
      if (sanitized !== codeInput.value) codeInput.value = sanitized;
      codeInput.classList.remove("auth-input-error");
    });

    verifyForm?.addEventListener("submit", async (event) => {
      event.preventDefault();

      const normalizedCode = (codeInput?.value || "").trim().replace(/\s+/g, "");
      const submitBtn = verifyForm.querySelector('[type="submit"]');

      clearAuthError();

      if (!normalizedCode) {
        setAuthError(t('forms.enterVerificationCodeAccent'), [codeInput]);
        return;
      }

      if (!/^\d{6}$/.test(normalizedCode)) {
        setAuthError(t('forms.codeMustHave6Accent'), [codeInput]);
        return;
      }

      if (submitBtn) submitBtn.disabled = true;
      try {
        await verifyRegistrationEmail(state.authRegistration.email, normalizedCode);
        state.authRegistration.codeVerified = true;
        navigate("/registro/exitoso", true);
      } catch (err) {
        setAuthError(err?.message || t('forms.invalidOrExpiredCodeAccent'), [codeInput]);
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });

    document.addEventListener("click", async (event) => {
      const target = event.target?.closest("[data-action='resend-registration-code']");
      if (!target) return;
      event.preventDefault();

      try {
        await resendRegistrationCode(state.authRegistration.email);
        showAppNotification(t('forms.codeResent'), "success");
      } catch (err) {
        showAppNotification(err?.message || t('forms.couldNotResendCode'), "danger");
      }
    }, { once: true });
  }

  if (pathname === "/registro/exitoso") {
    clearRegistroExitosoAutoRedirect();

    const countdownElement = document.getElementById("registroExitosoCountdown");
    let secondsLeft = REGISTRO_EXITOSO_REDIRECT_SECONDS;

    if (countdownElement) {
      countdownElement.textContent = String(secondsLeft);
    }

    registroExitosoCountdownIntervalId = window.setInterval(() => {
      secondsLeft = Math.max(secondsLeft - 1, 0);
      if (countdownElement) {
        countdownElement.textContent = String(secondsLeft);
      }

      if (secondsLeft === 0) {
        if (registroExitosoCountdownIntervalId !== null) {
          window.clearInterval(registroExitosoCountdownIntervalId);
          registroExitosoCountdownIntervalId = null;
        }
      }
    }, 1000);

    registroExitosoRedirectTimeoutId = window.setTimeout(() => {
      clearRegistroExitosoAutoRedirect();
      navigate("/login", true);
    }, REGISTRO_EXITOSO_REDIRECT_SECONDS * 1000);
  }
}

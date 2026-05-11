import flatpickr from "flatpickr";
import { Spanish } from "flatpickr/dist/l10n/es.js";

const DATE_PICKER_OPTIONS = {
  dateFormat: "Y-m-d",
  altInput: true,
  altFormat: "d/m/Y",
  altInputClass: "gd-form-input gd-date-field-input flatpickr-input",
  locale: Spanish,
  allowInput: true,
  disableMobile: true,
};

export function initDatePicker(element, options = {}) {
  if (!element) return null;
  if (element._flatpickr) element._flatpickr.destroy();
  return flatpickr(element, { ...DATE_PICKER_OPTIONS, ...options });
}

import { state } from '../state';
import { es } from './es';
import { en } from './en';

const translations = { es, en };

export function t(key, vars = {}) {
  const lang = state.configuracion?.idioma || 'es';
  const dict = translations[lang] || translations.es;
  let str = dict[key] ?? translations.es[key] ?? key;
  return str.replace(/\{(\w+)\}/g, (_, k) => {
    const val = vars[k];
    return val !== undefined ? String(val) : `{${k}}`;
  });
}

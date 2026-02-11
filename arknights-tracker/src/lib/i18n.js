// src/lib/i18n.js
import { derived } from 'svelte/store';
import { currentLocale } from '$lib/stores/locale';
import ru from './locales/ru.json';
import en from './locales/en.json';
import ja from './locales/ja.json';
import de from './locales/de.json';
import id from './locales/id.json';
import it from './locales/it.json';
import fr from './locales/fr.json';
import ko from './locales/ko.json';
import vi from './locales/vi.json';
import es from './locales/es.json';
import th from './locales/th.json';
import pt from './locales/pt.json';
import zhCN from './locales/zhcn.json';
import zhTW from './locales/zhtw.json';

const translations = {
  ru,
  en,
  ja,
  de,
  id,
  it,
  fr,
  ko,
  vi,
  es,
  pt,
  th,
  "zh-CN": zhCN, 
  "zh-TW": zhTW
};

const getNestedValue = (obj, path) => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

const formatString = (str, vars) => {
  if (!vars) return str;
  return Object.keys(vars).reduce((acc, key) => {
    return acc.replace(new RegExp(`{${key}}`, 'g'), vars[key]);
  }, str);
};

export const t = derived(currentLocale, ($locale) => (key, vars = {}) => {
  const localeData = translations[$locale] || translations['en'];
  
  let text = getNestedValue(localeData, key);
  
  if (!text && $locale !== 'en') {
    text = getNestedValue(translations['en'], key);
  }

  if (!text) return key;

  return formatString(text, vars);
});

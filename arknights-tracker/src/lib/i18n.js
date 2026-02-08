// src/lib/i18n.js
import { derived } from 'svelte/store';
import { currentLocale } from '$lib/stores/locale';
import ru from './locales/ru.json';
import en from './locales/en.json';

const translations = {
  ru,
  en
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

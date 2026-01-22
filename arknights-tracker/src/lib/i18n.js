// src/lib/i18n.js
import { derived } from 'svelte/store';
import { currentLocale } from '$lib/stores/locale';

// Импортируем все переводы
import ru from './locales/ru.json';
import en from './locales/en.json';

// Словарь переводов
const translations = {
  ru,
  en
};

// Функция для получения значения по пути (например, "page.rating.luckyTitle")
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

// Форматирование строки (замена {n} на значение)
const formatString = (str, vars) => {
  if (!vars) return str;
  return Object.keys(vars).reduce((acc, key) => {
    return acc.replace(new RegExp(`{${key}}`, 'g'), vars[key]);
  }, str);
};

// Экспортируем derived store `t`
// Он автоматически обновляется при смене currentLocale
export const t = derived(currentLocale, ($locale) => (key, vars = {}) => {
  // Берем переводы для текущего языка или фоллбек на английский
  const localeData = translations[$locale] || translations['en'];
  
  let text = getNestedValue(localeData, key);
  
  // Если перевод не найден, пробуем найти в английском (фоллбек)
  if (!text && $locale !== 'en') {
    text = getNestedValue(translations['en'], key);
  }

  // Если все еще нет, возвращаем ключ
  if (!text) return key;

  return formatString(text, vars);
});

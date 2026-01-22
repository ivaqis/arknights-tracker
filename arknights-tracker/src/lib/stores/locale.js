// src/lib/stores/locale.js
import { writable } from 'svelte/store';

// Список доступных языков
export const languages = [
  { code: 'zh-TW',  label: '繁體中文' },             // Китайский (традиционный)
  { code: 'en',     label: 'English' },              // Английский
  { code: 'ja',     label: '日本語' },               // Японский
  { code: 'zh-CN',  label: '简体中文' },             // Китайский (упрощённый)
  { code: 'de',     label: 'Deutsch' },              // Немецкий
  { code: 'id',     label: 'Bahasa Indonesia' },     // Индонезийский
  { code: 'it',     label: 'Italiano' },             // Итальянский
  { code: 'pt-BR',  label: 'Português (Brasil)' },   // Португальский (Бразилия)
  { code: 'ko',     label: '한국어' },               // Корейский
  { code: 'fr',     label: 'Français' },             // Французский
  { code: 'vi',     label: 'Tiếng Việt' },           // Вьетнамский
  { code: 'ru',     label: 'Русский' },              // Русский
  { code: 'es-419', label: 'Español (Latinoamérica)' }, // Испанский (Лат. Америка)
  { code: 'th',     label: 'ไทย' }                   // Тайский
];

// Простая функция для проверки, поддерживается ли язык полностью
export const isSupported = (code) => ['ru', 'en'].includes(code);

// 2. Логика определения начального языка
const getInitialLocale = () => {
  // Проверка для SSR (чтобы не упало на сервере)
  if (typeof window === 'undefined') return 'en';

  // А. Пробуем достать сохраненный язык из LocalStorage (если пользователь уже выбирал)
  const saved = localStorage.getItem('user_locale');
  if (saved && languages.some(l => l.code === saved)) {
    return saved;
  }

  // Б. Определяем язык браузера
  // navigator.language может вернуть 'ru-RU', 'en-US', 'ru' и т.д.
  const browserLang = navigator.language || navigator.userLanguage; 
  
  if (!browserLang) return 'en';

  // 1. Ищем точное совпадение (например, 'pt-BR' или 'zh-CN')
  const exactMatch = languages.find(l => l.code === browserLang);
  if (exactMatch) return exactMatch.code;

  // 2. Ищем совпадение по базовому языку (например, из 'ru-RU' берем 'ru')
  const baseLang = browserLang.split('-')[0];
  const baseMatch = languages.find(l => l.code === baseLang);
  
  // Особый случай для китайского: если браузер просто 'zh', лучше дать 'zh-CN'
  if (baseLang === 'zh' && !exactMatch) {
     return 'zh-CN'; 
  }

  if (baseMatch) return baseMatch.code;

  // В. Если ничего не подошло — Английский
  return 'en';
};

// 3. Создаем стор с вычисленным значением
export const currentLocale = writable(getInitialLocale());

// 4. Подписываемся на изменения, чтобы сохранять выбор пользователя в LocalStorage
// Это нужно, чтобы при перезагрузке страницы язык не сбрасывался
if (typeof window !== 'undefined') {
  currentLocale.subscribe(value => {
    localStorage.setItem('user_locale', value);
  });
}
// src/lib/stores/locale.js
import { writable } from 'svelte/store';

export const languages = [
  { code: 'zh-TW',  label: '繁體中文' },             // Китайский (традиционный)
  { code: 'en',     label: 'English' },              // Английский
  { code: 'ja',     label: '日本語' },               // Японский
  { code: 'zh-CN',  label: '简体中文' },             // Китайский (упрощённый)
  { code: 'de',     label: 'Deutsch' },              // Немецкий
  { code: 'id',     label: 'Bahasa Indonesia' },     // Индонезийский
  { code: 'it',     label: 'Italiano' },             // Итальянский
  { code: 'pt',  label: 'Português (Brasil)' },   // Португальский (Бразилия)
  { code: 'ko',     label: '한국어' },               // Корейский
  { code: 'fr',     label: 'Français' },             // Французский
  { code: 'vi',     label: 'Tiếng Việt' },           // Вьетнамский
  { code: 'ru',     label: 'Русский' },              // Русский
  { code: 'es', label: 'Español (Latinoamérica)' }, // Испанский (Лат. Америка)
  { code: 'th',     label: 'ไทย' }                   // Тайский
];

export const isSupported = (code) => ['ru', 'en', 'ja', 'de', 'id', 'it', 'fr', 'ko', 'vi', 'es', 'th', 'pt', 'zh-CN', 'zh-TW'].includes(code);
const getInitialLocale = () => {
  if (typeof window === 'undefined') return 'en';
  const saved = localStorage.getItem('user_locale');
  if (saved && languages.some(l => l.code === saved)) {
    return saved;
  }
  const browserLang = navigator.language || navigator.userLanguage; 
  
  if (!browserLang) return 'en';
  const exactMatch = languages.find(l => l.code === browserLang);
  if (exactMatch) return exactMatch.code;
  const baseLang = browserLang.split('-')[0];
  const baseMatch = languages.find(l => l.code === baseLang);
  if (baseLang === 'zh' && !exactMatch) {
     return 'zh-TW'; 
  }
  if (baseMatch) return baseMatch.code;
  return 'en';
};
export const currentLocale = writable(getInitialLocale());
if (typeof window !== 'undefined') {
  currentLocale.subscribe(value => {
    localStorage.setItem('user_locale', value);
  });
}
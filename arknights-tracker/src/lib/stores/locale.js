import { writable } from 'svelte/store';

export const languages = [
  { code: 'zh-TW',  label: '繁體中文' },
  { code: 'en-US',  label: 'English (US)' },
  { code: 'en-GB',  label: 'English (UK)' },
  { code: 'ja',     label: '日本語' },
  { code: 'zh-CN',  label: '简体中文' },
  { code: 'de',     label: 'Deutsch' },
  { code: 'id',     label: 'Bahasa Indonesia' },
  { code: 'it',     label: 'Italiano' },
  { code: 'pt',     label: 'Português (Brasil)' },
  { code: 'ko',     label: '한국어' },
  { code: 'fr',     label: 'Français' },
  { code: 'vi',     label: 'Tiếng Việt' },
  { code: 'ru',     label: 'Русский' },
  { code: 'es',     label: 'Español (Latinoamérica)' },
  { code: 'th',     label: 'ไทย' }
];

export const isSupported = (code) => [
  'ru', 'en', 'en-US', 'en-GB', 'ja', 'de', 'id', 'it', 'fr', 'ko', 'vi', 'es', 'th', 'pt', 'zh-CN', 'zh-TW'
].includes(code);

export const uiLanguages = [
  { code: 'uk', label: 'Українська' },
  { code: 'pl', label: 'Polski' },
  { code: 'kk', label: 'Қазақ тілі' },
  { code: 'ka', label: 'ქართული' },
  { code: 'ar', label: 'العربية' },
  { code: 'fi', label: 'Suomi' },
  { code: 'my', label: 'Bahasa Malaysia' },
];

export const isSupportedUi = (code) => [
  'ru', 'en', 'en-US', 'en-GB', 'ja', 'de', 'id', 'it', 'fr', 'ko', 'vi', 'es', 'th', 'pt', 'zh-CN', 'zh-TW',
  'uk', 'pl', 'kk', 'ka', 'ar', 'fi', 'my'
].includes(code);

export const normalizeLocale = (code) => {
  if (!code) return 'en-US';
  if (code === 'my') return 'ms-MY';
  if (code === 'en') return 'en-US';
  return code;
};

const getInitialLocale = () => {
  if (typeof window === 'undefined') return 'en-US';
  const saved = localStorage.getItem('user_locale');
  if (saved && languages.some(l => l.code === saved)) {
    return saved;
  }
  if (saved === 'en') return 'en-US';
  const browserLang = navigator.language || navigator.userLanguage; 
  
  if (!browserLang) return 'en-US';
  const exactMatch = languages.find(l => l.code.toLowerCase() === browserLang.toLowerCase());
  if (exactMatch) return exactMatch.code;
  const baseLang = browserLang.split('-')[0].toLowerCase();
  if (baseLang === 'zh') {
     return 'zh-TW'; 
  }
  if (baseLang === 'en') {
    const lower = browserLang.toLowerCase();
    if (lower.includes('gb') || lower.includes('uk')) {
      return 'en-GB';
    }
    return 'en-US';
  }
  const baseMatch = languages.find(l => l.code.toLowerCase().startsWith(baseLang));
  if (baseMatch) return baseMatch.code;
  return 'en-US';
};

const getInitialUiLocale = (initialMain) => {
  if (typeof window === 'undefined') return 'en-US';
  const saved = localStorage.getItem('user_ui_locale');
  const allCodes = [
    ...languages.map(l => l.code),
    ...uiLanguages.map(l => l.code)
  ];
  if (saved && allCodes.includes(saved)) {
    return saved;
  }
  if (saved === 'en') return 'en-US';
  return initialMain;
};

const initialMain = getInitialLocale();
export const currentLocale = writable(initialMain);
export const currentUiLocale = writable(getInitialUiLocale(initialMain));

if (typeof window !== 'undefined') {
  currentLocale.subscribe(value => {
    localStorage.setItem('user_locale', value);
  });
  currentUiLocale.subscribe(value => {
    localStorage.setItem('user_ui_locale', value);
  });
}

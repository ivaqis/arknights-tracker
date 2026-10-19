import { type Writable, writable, get } from "svelte/store";

export interface LocaleLabel<T extends string> {
    code: T;
    label: string;
}

export type Locale =
    | "ru"
    | "en-US"
    | "en-GB"
    | "ja"
    | "de"
    | "id"
    | "it"
    | "fr"
    | "ko"
    | "vi"
    | "es"
    | "th"
    | "pt"
    | "zh-CN"
    | "zh-TW";
export type UiOnlyLocale =
    | "uk"
    | "pl"
    | "kk"
    | "ka"
    | "ar"
    | "fi"
    | "my";
export type UiLocale = Locale | UiOnlyLocale;
export type SupportedLocale = Locale | "en";
export type SupportedUiLocale = SupportedLocale | UiOnlyLocale;

export const languages: readonly LocaleLabel<Locale>[] = [
    { code: "zh-TW", label: "繁體中文" },
    { code: "en-US", label: "English (US)" },
    { code: "en-GB", label: "English (UK)" },
    { code: "ja",    label: "日本語" },
    { code: "zh-CN", label: "简体中文" },
    { code: "de",    label: "Deutsch" },
    { code: "id",    label: "Bahasa Indonesia" },
    { code: "it",    label: "Italiano" },
    { code: "pt",    label: "Português (Brasil)" },
    { code: "ko",    label: "한국어" },
    { code: "fr",    label: "Français" },
    { code: "vi",    label: "Tiếng Việt" },
    { code: "ru",    label: "Русский" },
    { code: "es",    label: "Español (Latinoamérica)" },
    { code: "th",    label: "ไทย" }
];

export const uiLanguages: readonly LocaleLabel<UiOnlyLocale>[] = [
    { code: "uk", label: "Українська" },
    { code: "pl", label: "Polski" },
    { code: "kk", label: "Қазақ тілі" },
    { code: "ka", label: "ქართული" },
    { code: "ar", label: "العربية" },
    { code: "fi", label: "Suomi" },
    { code: "my", label: "Bahasa Malaysia" },
];

const supportedLocaleSet = new Set<SupportedLocale | string>([
    ...languages.map(lang => lang.code),
    "en"
]);
const supportedUiLocaleSet = new Set<SupportedUiLocale | string>([
    ...languages.map(lang => lang.code),
    ...uiLanguages.map(lang => lang.code),
    "en"
]);

export function isSupported(code: SupportedLocale | string): boolean {
    return supportedLocaleSet.has(code);
}

export function isSupportedUi(code: SupportedUiLocale | string): boolean {
    return supportedUiLocaleSet.has(code);
}

export function normalizeLocale(code: SupportedUiLocale | string | null | undefined): string {
    if (!code) return "en-US";

    if (code === "my") return "ms-MY";
    if (code === "en") return "en-US";

    return code;
}

function getInitialLocale(): Locale {
    if (typeof window === "undefined") {
        return "en-US";
    }

    const saved = localStorage.getItem("user_locale");

    if (saved && languages.some(l => l.code === saved)) {
        return saved as Locale;
    }

    if (saved === "en") {
        return "en-US";
    }

    const browserLang = navigator.language;

    if (!browserLang) {
        return "en-US";
    }

    const exactMatch = languages.find(l => l.code.toLowerCase() === browserLang.toLowerCase());

    if (exactMatch) {
        return exactMatch.code;
    }

    const baseLang = browserLang.split("-")[0].toLowerCase();

    if (baseLang === "zh") {
        return "zh-TW";
    }

    if (baseLang === "en") {
        const lower = browserLang.toLowerCase();

        if (lower.includes("gb") || lower.includes("uk")) {
            return "en-GB";
        }

        return "en-US";
    }

    const baseMatch = languages.find(l => l.code.toLowerCase().startsWith(baseLang));

    if (baseMatch) {
        return baseMatch.code;
    }

    return "en-US";
}

function getInitialUiLocale(main: Locale): UiLocale {
    if (typeof window === "undefined") {
        return "en-US";
    }

    const saved = localStorage.getItem("user_ui_locale");
    const allCodes: string[] = [
        ...languages.map(l => l.code),
        ...uiLanguages.map(l => l.code)
    ];

    if (saved && allCodes.includes(saved)) {
        return saved as UiLocale;
    }

    if (saved === "en") {
        return "en-US";
    }

    return main;
}

const initialMain = getInitialLocale();
export const currentLocale: Writable<Locale> = writable(initialMain);
export const currentUiLocale: Writable<UiLocale> = writable(getInitialUiLocale(initialMain));

interface LocaleFontConfig {
    fontName: string;
    url: string;
}

const LOCALE_FONTS: Record<string, LocaleFontConfig> = {
    "zh-CN": {
        fontName: "'Noto Sans SC'",
        url: "https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;800&display=swap"
    },
    "zh-TW": {
        fontName: "'Noto Sans TC'",
        url: "https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;800&display=swap"
    },
    "ja": {
        fontName: "'Noto Sans JP'",
        url: "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;800&display=swap"
    },
    "ko": {
        fontName: "'Noto Sans KR'",
        url: "https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;800&display=swap"
    },
    "th": {
        fontName: "'Noto Sans Thai'",
        url: "https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;500;800&display=swap"
    },
    "ka": {
        fontName: "'Noto Sans Georgian'",
        url: "https://fonts.googleapis.com/css2?family=Noto+Sans+Georgian:wght@400;500;800&display=swap"
    },
    "ar": {
        fontName: "'Noto Sans Arabic'",
        url: "https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;800&display=swap"
    }
};

export function updateLocaleFont(uiCode: string, mainCode?: string) {
    if (typeof document === "undefined") return;

    const targetCode = LOCALE_FONTS[uiCode] ? uiCode : (mainCode && LOCALE_FONTS[mainCode] ? mainCode : null);
    const fontConfig = targetCode ? LOCALE_FONTS[targetCode] : null;

    const linkId = "dynamic-locale-font";
    let linkElem = document.getElementById(linkId) as HTMLLinkElement | null;

    if (!fontConfig) {
        if (linkElem) linkElem.remove();
        document.documentElement.style.removeProperty("--font-locale");
        return;
    }

    if (!linkElem) {
        linkElem = document.createElement("link");
        linkElem.id = linkId;
        linkElem.rel = "stylesheet";
        document.head.appendChild(linkElem);
    }
    if (linkElem.href !== fontConfig.url) {
        linkElem.href = fontConfig.url;
    }

    document.documentElement.style.setProperty("--font-locale", `${fontConfig.fontName}, 'Noto Sans', sans-serif`);
}

if (typeof window !== "undefined") {
    currentLocale.subscribe(value => {
        localStorage.setItem("user_locale", value);
        updateLocaleFont(get(currentUiLocale), value);
    });
    currentUiLocale.subscribe(value => {
        localStorage.setItem("user_ui_locale", value);
        updateLocaleFont(value, get(currentLocale));
    });
}

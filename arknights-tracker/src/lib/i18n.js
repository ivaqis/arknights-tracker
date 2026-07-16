// src/lib/i18n.js

import { derived, writable } from 'svelte/store';
import { currentLocale, currentUiLocale } from '$lib/stores/locale';

const localeModules = import.meta.glob('./locales/*.json');
const uiLocaleModules = import.meta.glob('./uiLocales/*.json');
const hyperlinkModules = import.meta.glob('./locales/*/hyperlink.json');
const loadedTranslations = writable({});

export const isI18nReady = writable(false);

const getNestedValue = (obj, path) => {
    if (!obj) return null;
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

const formatString = (str, vars) => {
    if (!vars) return str;
    return Object.keys(vars).reduce((acc, key) => {
        return acc.replace(new RegExp(`{${key}}`, 'g'), vars[key]);
    }, str);
};

const getFileName = (code) => {
    if (code === 'zh-CN') return 'zhcn';
    if (code === 'zh-TW') return 'zhtw';
    return code;
};

const isUiOnly = (code) => {
    const fileName = getFileName(code);
    return `./uiLocales/${fileName}.json` in uiLocaleModules;
};

const loadLocale = async (locale) => {
    const fileName = getFileName(locale);
    let isAlreadyLoaded = false;

    loadedTranslations.subscribe(current => {
        if (current[locale]) isAlreadyLoaded = true;
    })();

    if (!isAlreadyLoaded) {
        let loader;
        if (isUiOnly(locale)) {
            loader = uiLocaleModules[`./uiLocales/${fileName}.json`];
        } else {
            loader = localeModules[`./locales/${fileName}.json`];
        }

        if (loader) {
            try {
                const mod = await loader();
                const data = mod.default || mod;

                let hyperlinkData = {};
                const hyperLinkLoader = hyperlinkModules[`./locales/${fileName}/hyperlink.json`];
                if (hyperLinkLoader) {
                    try {
                        const hlMod = await hyperLinkLoader();
                        const rawHlData = hlMod.default || hlMod;
                        for (const [key, value] of Object.entries(rawHlData)) {
                            const parts = key.split('.');
                            let current = hyperlinkData;
                            for (let i = 0; i < parts.length - 1; i++) {
                                const part = parts[i];
                                if (!current[part]) current[part] = {};
                                current = current[part];
                            }
                            current[parts[parts.length - 1]] = value;
                        }
                    } catch (hlErr) {
                        console.error(`Failed to load hyperlink data for ${locale}`, hlErr);
                    }
                }

                loadedTranslations.update(current => ({
                    ...current,
                    [locale]: {
                        ...data,
                        hyperlink: hyperlinkData
                    }
                }));
            } catch (err) {
                console.error(`Failed to load translation for locale: ${locale}`, err);
            }
        }
    }
};

derived([currentLocale, currentUiLocale], ([$main, $ui]) => [$main, $ui])
    .subscribe(async ([$main, $ui]) => {
        if ($main && $ui) {
            isI18nReady.set(false);
            
            await Promise.all([
                loadLocale($main),
                loadLocale($ui),
                loadLocale('en')
            ]);
            
            if (typeof document !== 'undefined') {
                document.documentElement.lang = $ui;
            }
            
            isI18nReady.set(true);
        }
    });

export const t = derived(
    [loadedTranslations, currentLocale, currentUiLocale],
    ([$translations, $locale, $uiLocale]) => (key, vars = {}) => {
        const uiData = $translations[$uiLocale] || {};
        const mainData = $translations[$locale] || {};
        const enData = $translations['en'] || {};
        
        let text = getNestedValue(uiData, key);
        
        if (!text && $uiLocale !== $locale) {
            text = getNestedValue(mainData, key);
        }
        
        if (!text && $locale !== 'en' && $uiLocale !== 'en') {
            text = getNestedValue(enData, key);
        }

        if (!text) return key;

        return formatString(text, vars);
    }
);

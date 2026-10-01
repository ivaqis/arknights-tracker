import { RichTextParamParser } from "$lib/classes/richText/expressions/RichTextParamParser";
import { currentLocale, currentUiLocale } from "$lib/stores/locale";
import { derived, type Readable, type Writable, writable } from "svelte/store";

interface LocaleStructure {
    [key: string]: string | LocaleStructure | undefined;
}

export interface HyperlinkData {
    name: string;
    desc: string;
}

interface HyperlinkDataMap {
    [key: string]: HyperlinkData | HyperlinkDataMap | undefined;
}

interface LoadedTranslations {
    [key: string]:
        & { hyperlink: HyperlinkDataMap; }
        & LocaleStructure;
}

export type LocaleVariableMap = Record<string, number | string>;

export type LocalizationFn = (path: string, vars?: LocaleVariableMap) => string;
export type LocalizationOrDefaultFn = (path: string, defaultStr: string, vars?: LocaleVariableMap) => string;

const localeModules = import.meta.glob("./locales/*.json");
const uiLocaleModules = import.meta.glob("./uiLocales/*.json");
const hyperlinkModules = import.meta.glob("./locales/*/hyperlink.json");

const loadedTranslations: Writable<LoadedTranslations> = writable({});

export const isI18nReady: Writable<boolean> = writable(false);

function getNestedValue(obj: LocaleStructure, path: string): string | null {
    let current: string | LocaleStructure | undefined = obj;

    for (const key of path.split(".")) {
        if (typeof current === "string" || typeof current === "undefined") {
            return null;
        }

        current = current[key];
    }

    if (typeof current === "object" || typeof current === "undefined") {
        return null;
    }

    return current;
}

function formatString(str: string, vars: LocaleVariableMap | null | undefined): string {
    if (!vars) {
        return str;
    }

    const parser = new RichTextParamParser(key => vars[key]);

    return str.replace(RichTextParamParser.REGEX, (match, expr) => {
        return parser.parseSafe(expr);
    });
}

function getFileName(code: string): string {
    switch (code) {
        case "zh-CN":
            return "zhcn";
        case "zh-TW":
            return "zhtw";
        case "en-US":
        case "en-GB":
            return "en";

        default:
            return code;
    }
}

function isUiOnly(code: string): boolean {
    const fileName = getFileName(code);

    return `./uiLocales/${fileName}.json` in uiLocaleModules;
}

async function loadLocale(code: string) {
    const fileName = getFileName(code);

    let isAlreadyLoaded = false;

    loadedTranslations.subscribe(current => {
        if (current[code]) {
            isAlreadyLoaded = true;
        }
    })();

    if (!isAlreadyLoaded) {
        let loader = isUiOnly(code)
            ? uiLocaleModules[`./uiLocales/${fileName}.json`] as (() => Promise<LocaleStructure | { default: LocaleStructure }>) | undefined
            : localeModules[`./locales/${fileName}.json`] as (() => Promise<LocaleStructure | { default: LocaleStructure }>) | undefined;

        if (loader) {
            try {
                const mod = await loader();
                const data = (mod.default ?? mod) as LocaleStructure;

                let hyperlinkData: HyperlinkDataMap = await getHyperlinkData(fileName);

                loadedTranslations.update(current => ({
                    ...current,
                    [code]: {
                        ...data,
                        hyperlink: hyperlinkData,
                    }
                }) as LoadedTranslations);
            } catch (error) {
                console.error(`Failed to load translation for locale: ${code}`, error);
            }
        }
    }
}

async function getHyperlinkData(fileName: string): Promise<HyperlinkDataMap> {
    const result: HyperlinkDataMap = {};

    const hyperLinkLoader = hyperlinkModules[`./locales/${fileName}/hyperlink.json`] as (() => Promise<Record<string, HyperlinkData> | { default: Record<string, HyperlinkData> }>) | undefined;

    if (hyperLinkLoader) {
        try {
            const hlMod = await hyperLinkLoader();
            const rawHlData = (hlMod.default ?? hlMod) as Record<string, HyperlinkData>;

            for (const [key, value] of Object.entries(rawHlData)) {
                const parts = key.split(".");

                let current = result;

                for (let i = 0; i < parts.length - 1; i++) {
                    const part = parts[i];

                    if (!current[part]) {
                        current[part] = {};
                    }

                    current = current[part] as HyperlinkDataMap;
                }

                current[parts[parts.length - 1]] = value;
            }
        } catch (error) {
            console.error(`Failed to load hyperlink data for ${fileName}`, error);
        }
    }

    return result;
}

derived([currentLocale, currentUiLocale], ([$main, $ui]) => [$main, $ui])
    .subscribe(async ([$main, $ui]) => {
        if ($main && $ui) {
            isI18nReady.set(false);

            await Promise.all([
                loadLocale($main),
                loadLocale($ui),
                loadLocale("en"),
            ]);

            if (typeof document !== "undefined") {
                document.documentElement.lang = $ui;
            }

            isI18nReady.set(true);
        }
    });

export const t: Readable<LocalizationFn & LocalizationOrDefaultFn> = derived(
    [loadedTranslations, currentLocale, currentUiLocale],
    ([$translations, $locale, $uiLocale]) => (path: string, defaultStrOrVars?: string | LocaleVariableMap, vars?: LocaleVariableMap) => {
        let defaultStr: string | null = null;
        let variables: LocaleVariableMap | null = null;

        if (typeof defaultStrOrVars === "string") {
            defaultStr = defaultStrOrVars;

            if (vars) {
                variables = vars;
            }
        } else if (typeof defaultStrOrVars === "object") {
            variables = defaultStrOrVars;
        }

        const uiData = $translations[$uiLocale] || {};
        const mainData = $translations[$locale] || {};
        const enData = $translations['en'] || $translations['en-US'] || $translations['en-GB'] || {};

        let text = getNestedValue(uiData, path);

        if (!text && $uiLocale !== $locale) {
            text = getNestedValue(mainData, path);
        }

        if (!text && !['en', 'en-US', 'en-GB'].includes($locale) && !['en', 'en-US', 'en-GB'].includes($uiLocale)) {
            text = getNestedValue(enData, path);
        }

        if (!text && defaultStr) {
            text = defaultStr;
        }

        if (!text) {
            return path;
        }

        return formatString(text, variables)
    }
);

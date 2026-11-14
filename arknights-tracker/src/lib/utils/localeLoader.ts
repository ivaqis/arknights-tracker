export function normalizeLang(lang?: string | null): string {
    if (!lang) return "en";
    const lower = lang.toLowerCase();
    if (lower.startsWith("zh-cn") || lower === "zhcn") return "zhcn";
    if (lower.startsWith("zh-tw") || lower === "zhtw") return "zhtw";
    const code = lower.split("-")[0];
    return code || "en";
}

const localeModules = import.meta.glob<Record<string, any>>("/src/lib/locales/*/*.json");
const charLocaleModules = import.meta.glob<Record<string, any>>("/src/lib/locales/*/characters/*.json");

const localeCache: Record<string, Record<string, any>> = {};
const charLocaleCache: Record<string, any> = {};

export async function loadLocaleNamespace(namespace: string, locale?: string | null): Promise<Record<string, any>> {
    const lang = normalizeLang(locale);
    const cacheKey = `${lang}/${namespace}`;
    if (localeCache[cacheKey]) return localeCache[cacheKey];

    const targetPath = `/src/lib/locales/${lang}/${namespace}.json`;
    const fallbackPath = `/src/lib/locales/en/${namespace}.json`;

    const loader = localeModules[targetPath] ?? localeModules[fallbackPath];
    if (!loader) return {};

    try {
        const mod = await loader();
        const data = mod?.default ?? mod ?? {};
        localeCache[cacheKey] = data;
        return data;
    } catch {
        return {};
    }
}

export async function loadLocaleItem(namespace: string, id: string, locale?: string | null): Promise<any> {
    if (!id) return {};
    const data = await loadLocaleNamespace(namespace, locale);
    return data?.[id] ?? {};
}

export async function loadCharacterLocale(charId: string, locale?: string | null): Promise<any> {
    if (!charId) return {};
    const lang = normalizeLang(locale);
    const cacheKey = `${lang}/${charId}`;
    if (charLocaleCache[cacheKey]) return charLocaleCache[cacheKey];

    const targetPath = `/src/lib/locales/${lang}/characters/${charId}.json`;
    const fallbackPath = `/src/lib/locales/en/characters/${charId}.json`;

    const loader = charLocaleModules[targetPath] ?? charLocaleModules[fallbackPath];
    if (!loader) return {};

    try {
        const mod = await loader();
        const data = mod?.default ?? mod ?? {};
        charLocaleCache[cacheKey] = data;
        return data;
    } catch {
        return {};
    }
}


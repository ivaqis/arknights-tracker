import { items } from "$lib/data/items/items";
import { weapons } from "$lib/data/weapons";
import { equipment } from "$lib/data/items/equipment";
import { enemies } from "$lib/data/enemies";
import { food } from "$lib/data/items/food";
import { craftableItemsList } from "$lib/data/crafts/craftableItemsList";
import { achievements } from "$lib/data/achievements";
import { rawEvents } from "$lib/data/timeline";
import { banners } from "$lib/data/banners";
import { characters } from "$lib/data/characters";
import { getEnemyUrl, getEquipmentUrl, getRecipeTreeUrlItem, getWeaponUrl } from "$lib/utils/linkUtils";

export type SearchCategory =
    | "all"
    | "operators"
    | "weapons"
    | "equipment"
    | "items"
    | "enemies"
    | "recipes"
    | "food"
    | "achievements"
    | "events"
    | "banners";

export interface SearchEntry {
    id: string;
    category: SearchCategory;
    titleKey: string;
    staticName?: string;
    iconId?: string;
    imageVariant?: string;
    badge?: string;
    rarity?: number;
    url?: string;
    isItemModal?: boolean;
    bannerData?: any;
    keywords?: string;
    featuredIds?: string[];
}

export interface SearchResult extends SearchEntry {
    displayTitle: string;
    categoryLabelKey: string;
    highlightedTitle?: string;
    matchedSnippet?: string;
}

export interface SearchResponse {
    results: SearchResult[];
    hasMore: boolean;
    total: number;
}

export interface IndexedDesc {
    text: string;
    lower: string;
    tokens: string[];
    stems: string[];
}

export function getLangFolder(code: string): string {
    const c = (code || "").toLowerCase();
    if (c.startsWith("zh-cn") || c === "zhcn") return "zhcn";
    if (c.startsWith("zh-tw") || c === "zhtw") return "zhtw";
    if (c.startsWith("en")) return "en";
    if (c.startsWith("ja")) return "ja";
    if (c.startsWith("ko")) return "ko";
    if (c.startsWith("ru")) return "ru";
    if (c.startsWith("de")) return "de";
    if (c.startsWith("es")) return "es";
    if (c.startsWith("fr")) return "fr";
    if (c.startsWith("id")) return "id";
    if (c.startsWith("it")) return "it";
    if (c.startsWith("pt")) return "pt";
    if (c.startsWith("th")) return "th";
    if (c.startsWith("vi")) return "vi";
    return "en";
}

const achievementLocaleModules = import.meta.glob<Record<string, any>>("../locales/*/achievements.json", {
    eager: true
});
const achievementsByLocale: Record<string, Record<string, any>> = {};
for (const [path, mod] of Object.entries(achievementLocaleModules)) {
    const match = path.match(/locales\/([^/]+)\/achievements\.json/);
    if (match) {
        achievementsByLocale[match[1]] = mod?.default ?? mod;
    }
}

export function getAchievementName(localeCode: string, id: string): string {
    const lang = getLangFolder(localeCode);
    const item = achievementsByLocale[lang]?.[id] || achievementsByLocale["en"]?.[id];
    return item?.name || "";
}

let cachedIndex: SearchEntry[] | null = null;

export function buildSearchIndex(): SearchEntry[] {
    if (cachedIndex) {
        return cachedIndex;
    }

    const list: SearchEntry[] = [];
    const itemsMap = items as Record<string, any>;

    for (const [id, char] of Object.entries(characters as Record<string, any>)) {
        if (!char) continue;
        list.push({
            id,
            category: "operators",
            titleKey: `characters.${id}`,
            staticName: char.name,
            iconId: id,
            imageVariant: "operator-preview",
            rarity: char.rarity ? Number(char.rarity) : undefined,
            url: `/operators/${id}`,
            keywords: `${char.class || ""} ${char.element || ""} ${char.weapon || ""}`
        });
    }

    for (const [id, wpn] of Object.entries(weapons as Record<string, any>)) {
        if (!wpn) continue;
        list.push({
            id,
            category: "weapons",
            titleKey: `weaponsList.${id}`,
            staticName: wpn.name,
            iconId: id,
            imageVariant: "weapon-icon",
            rarity: wpn.rarity ? Number(wpn.rarity) : undefined,
            url: getWeaponUrl(id),
            keywords: `${wpn.weapon || ""} ${wpn.gameId || ""}`
        });
    }

    for (const [id, eq] of Object.entries(equipment as Record<string, any>)) {
        if (!eq) continue;
        const itm = itemsMap[id];
        list.push({
            id,
            category: "equipment",
            titleKey: `equipment.${id}`,
            iconId: itm?.iconId || id,
            imageVariant: "equipment",
            rarity: eq.rarity ? Number(eq.rarity) : undefined,
            url: getEquipmentUrl(id),
            keywords: eq.pack || ""
        });
    }

    for (const [id, eny] of Object.entries(enemies as Record<string, any>)) {
        if (!eny) continue;
        list.push({
            id,
            category: "enemies",
            titleKey: `enemies.${id}`,
            staticName: id,
            iconId: id,
            imageVariant: "enemy-icon",
            rarity: eny.rarity ? Number(eny.rarity) : undefined,
            url: getEnemyUrl(id),
            keywords: id
        });
    }

    for (const [id, fd] of Object.entries(food as Record<string, any>)) {
        if (!fd) continue;
        const itm = itemsMap[id];
        list.push({
            id,
            category: "food",
            titleKey: `itemNames.${id}`,
            iconId: itm?.iconId || id,
            imageVariant: "item",
            rarity: itm?.rarity ? Number(itm.rarity) : undefined,
            url: `/food/${id}`
        });
    }

    const recipeIds = new Set(craftableItemsList);
    for (const itemId of recipeIds) {
        const itm = itemsMap[itemId];
        list.push({
            id: itemId,
            category: "recipes",
            titleKey: `itemNames.${itemId}`,
            iconId: itm?.iconId || itemId,
            imageVariant: "item",
            rarity: itm?.rarity ? Number(itm.rarity) : undefined,
            url: getRecipeTreeUrlItem(itemId)
        });
    }

    const equipmentSet = new Set(Object.keys(equipment));
    const foodSet = new Set(Object.keys(food));
    for (const [id, itm] of Object.entries(itemsMap)) {
        if (!itm || equipmentSet.has(id) || foodSet.has(id)) continue;
        list.push({
            id,
            category: "items",
            titleKey: `itemNames.${id}`,
            iconId: itm.iconId || id,
            imageVariant: "item",
            rarity: itm.rarity ? Number(itm.rarity) : undefined,
            url: "",
            isItemModal: true,
            keywords: `${itm.type || ""} ${itm.groupId || ""}`
        });
    }

    const enAch = achievementsByLocale["en"] || {};
    for (const [id, ach] of Object.entries(achievements as Record<string, any>)) {
        if (!ach) continue;
        const enItem = enAch[id];
        list.push({
            id,
            category: "achievements",
            titleKey: "",
            staticName: enItem?.name || id,
            iconId: `${id}_lv0${ach.initLevel || 1}`,
            imageVariant: "achievement",
            url: `/achievements?id=${id}`
        });
    }

    for (const ev of rawEvents) {
        list.push({
            id: ev.id,
            category: "events",
            titleKey: ev.title,
            staticName: ev.title,
            iconId: ev.icon,
            imageVariant: "event-icon",
            badge: ev.version ? `v${ev.version}` : undefined,
            bannerData: {
                ...ev,
                id: ev.id,
                name: ev.title,
                startTime: ev.startTime,
                endTime: ev.endTime
            },
            keywords: ev.version || ""
        });
    }

    for (const b of banners as any[]) {
        const featIds = [...(b.featured6 || []), ...(b.featured5 || [])];
        list.push({
            id: b.id,
            category: "banners",
            titleKey: `banners.${b.id}`,
            staticName: b.name,
            iconId: b.miniIcon || b.icon,
            imageVariant: "banner-icon",
            badge: b.version ? `v${b.version}` : undefined,
            bannerData: {
                ...b,
                id: b.id,
                name: b.name,
                startTime: b.startTime,
                endTime: b.endTime
            },
            keywords: `${b.type || ""} ${featIds.join(" ")}`,
            featuredIds: featIds
        });
    }

    cachedIndex = list;
    return cachedIndex;
}

export const CATEGORY_LABELS: Record<SearchCategory, string> = {
    all: "profile.all",
    operators: "systemNames.operators",
    weapons: "pages.weapons",
    equipment: "pages.equipment",
    items: "pages.items",
    enemies: "pages.enemies",
    recipes: "pages.recipes",
    food: "pages.food",
    achievements: "pages.achievements",
    events: "pages.events",
    banners: "systemNames.banners"
};

export const CATEGORY_ICONS: Record<SearchCategory, string> = {
    all: "list",
    operators: "operators",
    weapons: "weapons",
    equipment: "edc",
    items: "boxes",
    enemies: "hongshan",
    recipes: "recepies",
    food: "tacticals",
    achievements: "achievement",
    events: "timeline",
    banners: "records"
};

const EN_TO_RU: Record<string, string> = {
    q: "й", w: "ц", e: "у", r: "к", t: "е", y: "н", u: "г", i: "ш", o: "щ", p: "з", "[": "х", "]": "ъ",
    a: "ф", s: "ы", d: "в", f: "а", g: "п", h: "р", j: "о", k: "л", l: "д", ";": "ж", "'": "э",
    z: "я", x: "ч", c: "с", v: "м", b: "и", n: "т", m: "ь", ",": "б", ".": "ю", "`": "ё"
};
const RU_TO_EN: Record<string, string> = Object.entries(EN_TO_RU).reduce((acc, [en, ru]) => {
    acc[ru] = en;
    return acc;
}, {} as Record<string, string>);

function convertLayout(str: string): string[] {
    const lower = str.toLowerCase();
    let toRu = "";
    let toEn = "";
    let hasEn = false;
    let hasRu = false;

    for (const ch of lower) {
        if (EN_TO_RU[ch]) {
            toRu += EN_TO_RU[ch];
            hasEn = true;
        } else {
            toRu += ch;
        }
        if (RU_TO_EN[ch]) {
            toEn += RU_TO_EN[ch];
            hasRu = true;
        } else {
            toEn += ch;
        }
    }

    const res: string[] = [];
    if (hasEn && toRu !== lower) res.push(toRu);
    if (hasRu && toEn !== lower) res.push(toEn);
    return res;
}

const LATIN_TO_RU_MULTI: [string, string][] = [
    ["shch", "щ"], ["sch", "щ"], ["ch", "ч"], ["sh", "ш"],
    ["zh", "ж"], ["yo", "ё"], ["jo", "ё"], ["yu", "ю"],
    ["ju", "ю"], ["ya", "я"], ["ja", "я"], ["ts", "ц"],
    ["kh", "х"], ["ph", "ф"], ["th", "т"], ["ee", "и"], ["oo", "у"]
];
const LATIN_TO_RU_SINGLE: Record<string, string> = {
    a: "а", b: "б", c: "к", d: "д", e: "е", f: "ф", g: "г", h: "х", i: "и",
    j: "й", k: "к", l: "л", m: "м", n: "н", o: "о", p: "п", q: "к", r: "р",
    s: "с", t: "т", u: "у", v: "в", w: "в", x: "кс", y: "й", z: "з"
};
const RU_TO_LATIN: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "zh", з: "z",
    и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
    с: "s", т: "t", u: "u", ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh",
    щ: "shch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya"
};

function transliterate(str: string): string[] {
    const lower = str.toLowerCase();
    const res: string[] = [];
    if (/[a-z]/.test(lower)) {
        let ru = lower;
        for (const [lat, cyr] of LATIN_TO_RU_MULTI) {
            ru = ru.replaceAll(lat, cyr);
        }
        let s = "";
        for (const ch of ru) {
            s += LATIN_TO_RU_SINGLE[ch] || ch;
        }
        if (s !== lower) res.push(s);
    }
    if (/[а-яё]/.test(lower)) {
        let lat = "";
        for (const ch of lower) {
            lat += RU_TO_LATIN[ch] !== undefined ? RU_TO_LATIN[ch] : ch;
        }
        if (lat !== lower) res.push(lat);
    }
    return res;
}

function stemRussian(word: string): string {
    word = word.toLowerCase().replace(/ё/g, "е");
    const match = word.match(/[аеиоуыэюя]/);
    if (!match) return word;
    const start = (match.index ?? 0) + 1;
    let rv = word.slice(start);
    if (!rv) return word;

    const PERFECTIVE_GERUND = /((ив|ивши|ившись|ыв|ывши|ывшись)|((?<=[ая])(в|вши|вшись)))$/;
    const REFLEXIVE = /(ся|сь)$/;
    const ADJECTIVE = /(ее|ие|ые|ое|ими|ыми|ей|ий|ый|ой|ем|им|ым|ом|его|ого|ему|ому|их|ых|ую|юю|ая|яя|ою|ею)$/;
    const PARTICIPLE = /(((?<=[ая])(ем|нн|вш|ющ|щ))|(ивш|ывш|ующ))$/;
    const VERB = /((ила|ыла|ена|ейте|уйте|ите|или|ыли|ей|уй|ил|ыл|им|ым|ен|ило|ыло|ено|ят|ует|уют|ит|ыт|ены|ить|ыть|ишь|ую|ю)|((?<=[ая])(ла|на|ете|йте|ли|й|л|ем|н|ло|но|ет|ют|ны|ть|ешь|нно)))$/;
    const NOUN = /(а|ев|ов|ие|ье|е|иями|ями|ами|еи|ии|и|ией|ей|ой|ий|й|иям|ям|ием|ем|ам|ом|о|у|ах|иях|ях|ы|ь|ию|ью|ю|ия|ья|я)$/;

    let m = rv.match(PERFECTIVE_GERUND);
    if (m) {
        rv = rv.slice(0, -m[0].length);
    } else {
        rv = rv.replace(REFLEXIVE, "");
        m = rv.match(ADJECTIVE);
        if (m) {
            rv = rv.slice(0, -m[0].length);
            const pm = rv.match(PARTICIPLE);
            if (pm) rv = rv.slice(0, -pm[0].length);
        } else {
            m = rv.match(VERB);
            if (m) {
                rv = rv.slice(0, -m[0].length);
            } else {
                m = rv.match(NOUN);
                if (m) rv = rv.slice(0, -m[0].length);
            }
        }
    }

    rv = rv.replace(/и$/, "").replace(/ость?$/, "");
    if (rv.endsWith("ейше") || rv.endsWith("ейш")) rv = rv.replace(/ейше?$/, "");
    if (rv.endsWith("нн")) rv = rv.slice(0, -1);
    rv = rv.replace(/ь$/, "");

    return word.slice(0, start) + rv;
}

function stemEnglish(w: string): string {
    w = w.toLowerCase();
    if (w.length < 3) return w;
    if (w.endsWith("sses")) w = w.slice(0, -2);
    else if (w.endsWith("ies")) w = w.slice(0, -2);
    else if (w.endsWith("ss")) {}
    else if (w.endsWith("s")) w = w.slice(0, -1);

    if (w.endsWith("eed")) {
        if (w.length > 4) w = w.slice(0, -1);
    } else if (w.endsWith("ed")) {
        if (/[aeiou].*ed$/.test(w)) w = w.slice(0, -2);
    } else if (w.endsWith("ing")) {
        if (/[aeiou].*ing$/.test(w)) w = w.slice(0, -3);
    }

    if (w.endsWith("y") && /[bcdfghjklmnpqrstvwxz]y$/.test(w)) {
        w = w.slice(0, -1) + "i";
    }
    return w;
}

function stemWord(word: string): string {
    if (/[а-яё]/.test(word)) return stemRussian(word);
    if (/[a-z]/.test(word)) return stemEnglish(word);
    return word;
}

function isDistanceOne(a: string, b: string): boolean {
    if (a === b) return true;
    const diff = a.length - b.length;
    if (diff < -1 || diff > 1) return false;
    let i = 0;
    let j = 0;
    let edits = 0;
    while (i < a.length && j < b.length) {
        if (a[i] !== b[j]) {
            edits++;
            if (edits > 1) return false;
            if (diff === 1) i++;
            else if (diff === -1) j++;
            else { i++; j++; }
        } else {
            i++;
            j++;
        }
    }
    if (i < a.length || j < b.length) edits++;
    return edits <= 1;
}

function tokenize(text: string): string[] {
    if (!text) return [];
    return text.toLowerCase().split(/[^\p{L}\p{N}]+/gu).filter(Boolean);
}

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function highlightText(text: string, terms: string[]): string {
    if (!text || !terms.length) return escapeHtml(text || "");
    const escaped = escapeHtml(text);
    const validTerms = [...new Set(terms.filter(t => t.length > 0))].sort((a, b) => b.length - a.length);
    if (!validTerms.length) return escaped;
    const pattern = new RegExp("(" + validTerms.map(t => t.replace(/[.*+?^${}()|[\]\\\/]/g, "\\$&")).join("|") + ")", "gi");
    return escaped.replace(pattern, '<b class="font-bold text-amber-600 dark:text-[#FFE145]">$1</b>');
}

function extractSnippet(text: string, fullPhrase: string, terms: string[], stemmedTerms: string[]): string {
    if (!text) return "";
    const clean = text.replace(/<[^>]+>/g, "").replace(/\{[^}]+\}/g, "").replace(/\s+/g, " ").trim();
    if (!clean) return "";
    const lower = clean.toLowerCase();

    let bestIdx = -1;
    let termLen = 4;
    const highlightTerms = [...terms];

    if (fullPhrase && fullPhrase.length > 2) {
        const pIdx = lower.indexOf(fullPhrase.toLowerCase());
        if (pIdx !== -1) {
            bestIdx = pIdx;
            termLen = fullPhrase.length;
            if (!highlightTerms.includes(fullPhrase)) highlightTerms.push(fullPhrase);
        }
    }

    if (bestIdx === -1 && stemmedTerms.length > 1) {
        const tokens = tokenize(clean);
        for (let i = 0; i < tokens.length - 1; i++) {
            if (stemWord(tokens[i]) === stemmedTerms[0] && stemWord(tokens[i + 1]) === stemmedTerms[1]) {
                const wIdx = lower.indexOf(tokens[i]);
                if (wIdx !== -1) {
                    bestIdx = wIdx;
                    termLen = tokens[i].length + 1 + tokens[i + 1].length;
                    highlightTerms.push(tokens[i], tokens[i + 1]);
                    break;
                }
            }
        }
    }

    if (bestIdx === -1) {
        const tokens = tokenize(clean);
        let charOffset = 0;
        for (const tok of tokens) {
            const idx = lower.indexOf(tok, charOffset);
            if (idx !== -1) {
                charOffset = idx + tok.length;
                const sTok = stemWord(tok);
                if (terms.includes(tok) || stemmedTerms.some(st => st === sTok || tok.startsWith(st) || sTok.startsWith(st))) {
                    bestIdx = idx;
                    termLen = tok.length;
                    highlightTerms.push(tok);
                    break;
                }
            }
        }
    }

    if (bestIdx === -1) return "";

    let start = 0;
    if (bestIdx > 0) {
        const prevSpace = clean.lastIndexOf(" ", bestIdx - 2);
        if (prevSpace !== -1 && (bestIdx - prevSpace) <= 18) {
            start = prevSpace + 1;
        } else {
            start = Math.max(0, bestIdx - 12);
        }
    }

    let end = Math.min(clean.length, bestIdx + termLen + 45);
    if (end < clean.length) {
        const nextSpace = clean.indexOf(" ", end);
        if (nextSpace !== -1 && (nextSpace - (bestIdx + termLen)) <= 55) {
            end = nextSpace;
        }
    }

    let snippet = clean.slice(start, end);
    if (start > 0) snippet = "..." + snippet;
    if (end < clean.length) snippet = snippet + "...";

    return highlightText(snippet, highlightTerms);
}

const allLocaleDescModules = import.meta.glob<Record<string, any>>("../locales/*/*.json");
const allCharDescModules = import.meta.glob<Record<string, any>>("../locales/*/characters/*.json");

const descIndexLoaded: Record<string, boolean> = {};
const descIndexMap: Record<string, Map<string, IndexedDesc[]>> = {};

function addDesc(map: Map<string, IndexedDesc[]>, id: string, text: any): void {
    if (!id || typeof text !== "string") return;
    const clean = text.replace(/<[^>]+>/g, "").replace(/\{[^}]+\}/g, "").replace(/\s+/g, " ").trim();
    if (!clean) return;

    let list = map.get(id);
    if (!list) {
        list = [];
        map.set(id, list);
    }
    if (list.some(item => item.text === clean)) return;

    const lower = clean.toLowerCase();
    const tokens = tokenize(clean);
    const stems = tokens.map(stemWord);
    list.push({ text: clean, lower, tokens, stems });
}

export async function ensureDescriptionsLoaded(localeCode: string = "ru"): Promise<void> {
    const langFolder = getLangFolder(localeCode);
    if (descIndexLoaded[langFolder]) return;

    const map = new Map<string, IndexedDesc[]>();
    const prefix = `../locales/${langFolder}/`;
    const charPrefix = `../locales/${langFolder}/characters/`;

    const loadPromises = Object.entries(allLocaleDescModules)
        .filter(([path]) => path.startsWith(prefix) && !path.includes("/characters/"))
        .map(async ([, loader]) => {
            try {
                const mod: any = await loader();
                const data = mod?.default ?? mod;
                if (!data) return;

                if (typeof data !== "object") return;

                for (const [id, entry] of Object.entries(data as Record<string, any>)) {
                    if (!entry || typeof entry !== "object") continue;

                    if (typeof entry.description === "string") addDesc(map, id, entry.description);
                    if (typeof entry.decoDesc === "string") addDesc(map, id, entry.decoDesc);
                    if (typeof entry.desc === "string") addDesc(map, id, entry.desc);
                    if (typeof entry.extraDesc === "string") addDesc(map, id, entry.extraDesc);
                    if (typeof entry.setBonus === "string") addDesc(map, id, entry.setBonus);
                    if (typeof entry.nickname === "string") addDesc(map, id, entry.nickname);
                    if (typeof entry.featureDesc === "string") addDesc(map, id, entry.featureDesc);
                    if (typeof entry.category === "string") addDesc(map, id, entry.category);
                    if (typeof entry.group === "string") addDesc(map, id, entry.group);

                    if (Array.isArray(entry.skills)) {
                        for (const s of entry.skills) {
                            if (typeof s === "string") {
                                addDesc(map, id, s);
                            } else if (s && typeof s === "object") {
                                addDesc(map, id, s.name);
                                addDesc(map, id, s.description || s.desc);
                            }
                        }
                    }
                    if (Array.isArray(entry.abilities)) {
                        for (const a of entry.abilities) {
                            if (typeof a === "string") {
                                addDesc(map, id, a);
                            } else if (a && typeof a === "object") {
                                addDesc(map, id, a.name);
                                addDesc(map, id, a.desc || a.description);
                            }
                        }
                    }
                    if (Array.isArray(entry.obtainWays)) {
                        for (const o of entry.obtainWays) addDesc(map, id, o);
                    }
                    if (entry.levels && typeof entry.levels === "object") {
                        for (const lv of Object.values(entry.levels)) {
                            if (lv && typeof lv === "object") {
                                addDesc(map, id, (lv as any).desc);
                                addDesc(map, id, (lv as any).completeDesc);
                            }
                        }
                    }
                }
            } catch (e) {}
        });

    const charPromises = Object.entries(allCharDescModules)
        .filter(([path]) => path.startsWith(charPrefix))
        .map(async ([path, loader]) => {
            try {
                const mod: any = await loader();
                const data = mod?.default ?? mod;
                const charId = path.split("/").pop()?.replace(".json", "") || "";
                if (charId && data) {
                    if (data.baseInfo) {
                        addDesc(map, charId, data.baseInfo.bio);
                        addDesc(map, charId, data.baseInfo.profession);
                        addDesc(map, charId, data.baseInfo.humanResources);
                        addDesc(map, charId, data.baseInfo.raceTag);
                        addDesc(map, charId, data.baseInfo.blocTag);
                        if (Array.isArray(data.baseInfo.tags)) {
                            for (const t of data.baseInfo.tags) addDesc(map, charId, t);
                        }
                        if (Array.isArray(data.baseInfo.expertTags)) {
                            for (const t of data.baseInfo.expertTags) addDesc(map, charId, t);
                        }
                        if (Array.isArray(data.baseInfo.hobbyTags)) {
                            for (const t of data.baseInfo.hobbyTags) addDesc(map, charId, t);
                        }
                        if (Array.isArray(data.baseInfo.giftPreferTags)) {
                            for (const t of data.baseInfo.giftPreferTags) addDesc(map, charId, t);
                        }
                    }
                    if (data.skills && typeof data.skills === "object") {
                        for (const s of Object.values(data.skills)) {
                            if (s && typeof s === "object") {
                                addDesc(map, charId, (s as any).name);
                                addDesc(map, charId, (s as any).desc || (s as any).description);
                                if (Array.isArray((s as any).levels)) {
                                    for (const lv of (s as any).levels) addDesc(map, charId, lv);
                                }
                            }
                        }
                    }
                    if (data.potentials && typeof data.potentials === "object") {
                        for (const p of Object.values(data.potentials)) {
                            if (p && typeof p === "object") {
                                addDesc(map, charId, (p as any).name);
                                addDesc(map, charId, (p as any).desc || (p as any).description);
                            }
                        }
                    }
                    if (data.tags && typeof data.tags === "object") {
                        for (const t of Object.values(data.tags)) {
                            if (t && typeof t === "object") {
                                addDesc(map, charId, (t as any).name);
                                addDesc(map, charId, (t as any).description);
                            }
                        }
                    }
                    if (Array.isArray(data.voiceLines)) {
                        for (const v of data.voiceLines) {
                            if (v && typeof v === "object") {
                                addDesc(map, charId, v.title);
                                addDesc(map, charId, v.text);
                            }
                        }
                    }
                    if (data.arts && typeof data.arts === "object") {
                        for (const art of Object.values(data.arts)) {
                            if (art && typeof art === "object") {
                                addDesc(map, charId, (art as any).name);
                                addDesc(map, charId, (art as any).description);
                                addDesc(map, charId, (art as any).author);
                            }
                        }
                    }
                    const charFiles = data.files || data.skills?.files || data.baseInfo?.files;
                    if (charFiles && typeof charFiles === "object") {
                        for (const fileText of Object.values(charFiles)) {
                            if (typeof fileText === "string") {
                                addDesc(map, charId, fileText);
                            }
                        }
                    }
                }
            } catch (e) {}
        });

    await Promise.all([...loadPromises, ...charPromises]);

    if (map.size === 0 && langFolder !== "en") {
        await ensureDescriptionsLoaded("en");
        descIndexMap[langFolder] = descIndexMap["en"];
        descIndexLoaded[langFolder] = true;
        return;
    }

    descIndexMap[langFolder] = map;
    descIndexLoaded[langFolder] = true;
}

export function performSearch(
    query: string,
    selectedCategory: SearchCategory,
    translate: (key: string) => string,
    limit: number = 20,
    localeCode: string = "ru",
    isAdvanced: boolean = false
): SearchResponse {
    const raw = (query || "").trim();
    if (!raw) return { results: [], hasMore: false, total: 0 };
    const lowerRaw = raw.toLowerCase();

    const variants = [lowerRaw];
    const isRu = (localeCode || "").toLowerCase().startsWith("ru");
    if (isRu) {
        for (const v of convertLayout(raw)) {
            if (!variants.includes(v)) variants.push(v);
        }
        for (const v of transliterate(raw)) {
            if (!variants.includes(v)) variants.push(v);
        }
    }

    const rawTokens = tokenize(raw);
    const rawStems = rawTokens.map(stemWord);

    const highlightTerms: string[] = [];

    for (const v of variants) {
        const toks = tokenize(v);
        for (const t of toks) {
            if (t.length >= 2 || raw.length === 1) {
                if (!highlightTerms.includes(t)) highlightTerms.push(t);
            }
        }
    }

    const index = buildSearchIndex();
    const scored: { item: SearchEntry; score: number; displayTitle: string; matchedSnippet?: string }[] = [];

    const langFolder = getLangFolder(localeCode);
    const descMap = isAdvanced ? descIndexMap[langFolder] : null;

    for (const item of index) {
        if (selectedCategory !== "all" && item.category !== selectedCategory) {
            continue;
        }

        let displayTitle = "";
        if (item.titleKey) {
            const translated = translate(item.titleKey);
            if (translated && translated !== item.titleKey) {
                displayTitle = translated;
            }
        }
        if (!displayTitle && item.category === "achievements") {
            const achItem = achievementsByLocale[langFolder]?.[item.id] || achievementsByLocale["en"]?.[item.id];
            if (achItem?.name) {
                displayTitle = achItem.name;
            }
        }
        if (!displayTitle) {
            displayTitle = item.staticName || item.id;
        }

        const lowerTitle = displayTitle.toLowerCase();
        const lowerStatic = (item.staticName || "").toLowerCase();
        const lowerId = item.id.toLowerCase();
        const achItem = item.category === "achievements" ? (achievementsByLocale[langFolder]?.[item.id] || achievementsByLocale["en"]?.[item.id]) : null;
        const lowerKeywords = `${item.keywords || ""} ${achItem?.category || ""} ${achItem?.group || ""}`.toLowerCase();

        let score = 0;
        let matchedSnippet: string | undefined = undefined;
        let bestDescQuality = -1;
        const matchedRawTokens = new Set<number>();

        for (const v of variants) {
            if (lowerTitle === v) {
                score = Math.max(score, 600);
                rawTokens.forEach((_, idx) => matchedRawTokens.add(idx));
            } else if (lowerTitle.startsWith(v)) {
                score = Math.max(score, 400);
                rawTokens.forEach((_, idx) => matchedRawTokens.add(idx));
            } else if (lowerTitle.includes(` ${v}`) || lowerTitle.includes(`(${v}`)) {
                score = Math.max(score, 300);
                rawTokens.forEach((_, idx) => matchedRawTokens.add(idx));
            } else if (lowerTitle.includes(v)) {
                score = Math.max(score, 200);
                rawTokens.forEach((_, idx) => matchedRawTokens.add(idx));
            } else if (v.length >= 4 && lowerTitle.length >= 4 && isDistanceOne(lowerTitle, v)) {
                score = Math.max(score, 180);
                rawTokens.forEach((_, idx) => matchedRawTokens.add(idx));
            } else if (lowerStatic && lowerStatic.startsWith(v)) {
                score = Math.max(score, 140);
                rawTokens.forEach((_, idx) => matchedRawTokens.add(idx));
            } else if (lowerStatic && lowerStatic.includes(v)) {
                score = Math.max(score, 110);
                rawTokens.forEach((_, idx) => matchedRawTokens.add(idx));
            } else if (lowerStatic && v.length >= 4 && lowerStatic.length >= 4 && isDistanceOne(lowerStatic, v)) {
                score = Math.max(score, 100);
                rawTokens.forEach((_, idx) => matchedRawTokens.add(idx));
            } else if (lowerId.startsWith(v)) {
                score = Math.max(score, 90);
                rawTokens.forEach((_, idx) => matchedRawTokens.add(idx));
            } else if (lowerId.includes(v)) {
                score = Math.max(score, 70);
                rawTokens.forEach((_, idx) => matchedRawTokens.add(idx));
            } else if (lowerKeywords.includes(v)) {
                score = Math.max(score, 50);
                rawTokens.forEach((_, idx) => matchedRawTokens.add(idx));
            }
        }

        const titleTokens = tokenize(displayTitle);
        const titleStems = titleTokens.map(stemWord);

        for (let qIdx = 0; qIdx < rawTokens.length; qIdx++) {
            const qt = rawTokens[qIdx];
            const qs = rawStems[qIdx];
            for (let i = 0; i < titleTokens.length; i++) {
                const tt = titleTokens[i];
                if (tt === qt) {
                    score += 80;
                    matchedRawTokens.add(qIdx);
                    break;
                } else if (tt.startsWith(qt)) {
                    score += 60;
                    matchedRawTokens.add(qIdx);
                    break;
                } else if (titleStems[i] === qs) {
                    score += 50;
                    matchedRawTokens.add(qIdx);
                    if (!highlightTerms.includes(tt)) highlightTerms.push(tt);
                    break;
                } else if (qt.length >= 4 && tt.length >= 4 && isDistanceOne(tt, qt)) {
                    score += 45;
                    matchedRawTokens.add(qIdx);
                    if (!highlightTerms.includes(tt)) highlightTerms.push(tt);
                    break;
                } else if (qs.length >= 4 && titleStems[i].length >= 4 && isDistanceOne(titleStems[i], qs)) {
                    score += 40;
                    matchedRawTokens.add(qIdx);
                    if (!highlightTerms.includes(tt)) highlightTerms.push(tt);
                    break;
                }
            }
        }

        if (item.category === "banners" && item.featuredIds && item.featuredIds.length > 0) {
            for (const featId of item.featuredIds) {
                let featName = "";
                const charKey = `characters.${featId}`;
                const charTrans = translate(charKey);
                if (charTrans && charTrans !== charKey) {
                    featName = charTrans;
                } else {
                    const wpnKey = `weaponsList.${featId}`;
                    const wpnTrans = translate(wpnKey);
                    if (wpnTrans && wpnTrans !== wpnKey) {
                        featName = wpnTrans;
                    } else {
                        const charObj = (characters as any)[featId];
                        const wpnObj = (weapons as any)[featId];
                        featName = charObj?.name || wpnObj?.name || featId;
                    }
                }
                if (!featName) continue;
                const lowerFeat = featName.toLowerCase();
                const featTokens = tokenize(featName);
                const featStems = featTokens.map(stemWord);

                let featScore = 0;
                for (const v of variants) {
                    if (lowerFeat === v) {
                        featScore = Math.max(featScore, 260);
                        rawTokens.forEach((_, idx) => matchedRawTokens.add(idx));
                    } else if (lowerFeat.startsWith(v)) {
                        featScore = Math.max(featScore, 210);
                        rawTokens.forEach((_, idx) => matchedRawTokens.add(idx));
                    } else if (lowerFeat.includes(v)) {
                        featScore = Math.max(featScore, 170);
                        rawTokens.forEach((_, idx) => matchedRawTokens.add(idx));
                    } else if (v.length >= 4 && lowerFeat.length >= 4 && isDistanceOne(lowerFeat, v)) {
                        featScore = Math.max(featScore, 150);
                        rawTokens.forEach((_, idx) => matchedRawTokens.add(idx));
                    }
                }

                for (let qIdx = 0; qIdx < rawTokens.length; qIdx++) {
                    const qt = rawTokens[qIdx];
                    const qs = rawStems[qIdx];
                    for (let i = 0; i < featTokens.length; i++) {
                        const ft = featTokens[i];
                        if (ft === qt) {
                            featScore += 70;
                            matchedRawTokens.add(qIdx);
                            if (!highlightTerms.includes(ft)) highlightTerms.push(ft);
                            break;
                        } else if (ft.startsWith(qt)) {
                            featScore += 50;
                            matchedRawTokens.add(qIdx);
                            if (!highlightTerms.includes(ft)) highlightTerms.push(ft);
                            break;
                        } else if (featStems[i] === qs) {
                            featScore += 45;
                            matchedRawTokens.add(qIdx);
                            if (!highlightTerms.includes(ft)) highlightTerms.push(ft);
                            break;
                        } else if (qt.length >= 4 && ft.length >= 4 && isDistanceOne(ft, qt)) {
                            featScore += 40;
                            matchedRawTokens.add(qIdx);
                            if (!highlightTerms.includes(ft)) highlightTerms.push(ft);
                            break;
                        }
                    }
                }

                if (featScore > 0) {
                    score = Math.max(score, featScore);
                    if (!matchedSnippet) {
                        matchedSnippet = `${highlightText(featName, highlightTerms)}`;
                    }
                }
            }
        }

        if (descMap) {
            const descs = descMap.get(item.id);
            if (descs) {
                for (const d of descs) {
                    let descQuality = 0;

                    for (const v of variants) {
                        if (d.lower.includes(v)) {
                            score += 450;
                            descQuality += 1000;
                            rawTokens.forEach((_, idx) => matchedRawTokens.add(idx));
                            break;
                        }
                    }

                    if (descQuality < 1000 && rawStems.length > 1) {
                        for (let i = 0; i < d.stems.length - 1; i++) {
                            if (d.stems[i] === rawStems[0] && d.stems[i + 1] === rawStems[1]) {
                                score += 320;
                                descQuality += 500;
                                rawTokens.forEach((_, idx) => matchedRawTokens.add(idx));
                                break;
                            }
                        }
                    }

                    for (let qIdx = 0; qIdx < rawTokens.length; qIdx++) {
                        const qt = rawTokens[qIdx];
                        const qs = rawStems[qIdx];
                        for (let i = 0; i < d.tokens.length; i++) {
                            if (d.tokens[i] === qt) {
                                score += 30;
                                descQuality += 50;
                                matchedRawTokens.add(qIdx);
                                break;
                            } else if (d.tokens[i].startsWith(qt)) {
                                score += 20;
                                descQuality += 30;
                                matchedRawTokens.add(qIdx);
                                break;
                            } else if (d.stems[i] === qs) {
                                score += 15;
                                descQuality += 20;
                                matchedRawTokens.add(qIdx);
                                if (!highlightTerms.includes(d.tokens[i])) highlightTerms.push(d.tokens[i]);
                                break;
                            }
                        }
                    }

                    if (descQuality > bestDescQuality) {
                        bestDescQuality = descQuality;
                        matchedSnippet = extractSnippet(d.text, raw, highlightTerms, rawStems);
                    }
                }
            }
        }

        if (rawTokens.length > 1) {
            const coverage = matchedRawTokens.size / rawTokens.length;
            if (coverage < 1) {
                score = Math.round(score * coverage * 0.25);
            }
        }

        if (score > 0) {
            scored.push({ item, score, displayTitle, matchedSnippet });
        }
    }

    scored.sort((a, b) => {
        if (b.score !== a.score) {
            return b.score - a.score;
        }
        return a.displayTitle.localeCompare(b.displayTitle);
    });

    const hasMore = scored.length > limit;
    const results = scored.slice(0, limit).map(({ item, displayTitle, matchedSnippet }) => ({
        ...item,
        displayTitle,
        highlightedTitle: highlightText(displayTitle, highlightTerms),
        matchedSnippet,
        categoryLabelKey: CATEGORY_LABELS[item.category]
    }));

    return {
        results,
        hasMore,
        total: scored.length
    };
}

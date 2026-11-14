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
    const match = /locales\/([^/]+)\/achievements\.json/.exec(path);
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

function indexOperators(list: SearchEntry[]): void {
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
}

function indexWeapons(list: SearchEntry[]): void {
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
}

function indexEquipment(list: SearchEntry[], itemsMap: Record<string, any>): void {
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
}

function indexEnemies(list: SearchEntry[]): void {
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
}

function indexFood(list: SearchEntry[], itemsMap: Record<string, any>): void {
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
}

function indexRecipes(list: SearchEntry[], itemsMap: Record<string, any>): void {
    for (const itemId of new Set(craftableItemsList)) {
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
}

function indexItems(list: SearchEntry[], itemsMap: Record<string, any>): void {
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
}

function indexAchievements(list: SearchEntry[]): void {
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
}

function indexEvents(list: SearchEntry[]): void {
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
}

function indexBanners(list: SearchEntry[]): void {
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
}

export function buildSearchIndex(): SearchEntry[] {
    if (cachedIndex) return cachedIndex;

    const list: SearchEntry[] = [];
    const itemsMap = items as Record<string, any>;

    indexOperators(list);
    indexWeapons(list);
    indexEquipment(list, itemsMap);
    indexEnemies(list);
    indexFood(list, itemsMap);
    indexRecipes(list, itemsMap);
    indexItems(list, itemsMap);
    indexAchievements(list);
    indexEvents(list);
    indexBanners(list);

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
            lat += RU_TO_LATIN[ch] ?? ch;
        }
        if (lat !== lower) res.push(lat);
    }
    return res;
}

function findLongestSuffix(text: string, suffixes: string[]): string | null {
    for (const s of suffixes) {
        if (text.endsWith(s)) return s;
    }
    return null;
}

const GERUND_BASE = ["ившись", "ывшись", "ивши", "ывши", "ив", "ыв"];
const GERUND_VOWEL = ["вшись", "вши", "в"];
const REFLEXIVE_SUFFIXES = ["ся", "сь"];
const ADJECTIVE_SUFFIXES = [
    "ими", "ыми", "его", "ого", "ему", "ому", "ее", "ие", "ые", "ое",
    "ей", "ий", "ый", "ой", "ем", "им", "ым", "ом", "их", "ых", "ую", "юю", "ая", "яя", "ою", "ею"
];
const PARTICIPLE_BASE = ["ивш", "ывш", "ующ"];
const PARTICIPLE_VOWEL = ["нн", "вш", "ющ", "ем", "щ"];
const VERB_BASE = [
    "ейте", "уйте", "ите", "или", "ыли", "ила", "ыла", "ена", "ило", "ыло", "ено",
    "ует", "уют", "ены", "ить", "ыть", "ишь", "ей", "уй", "ил", "ыл", "им", "ым", "ен", "ят", "ит", "ыт", "ую", "ю"
];
const VERB_VOWEL = [
    "ейте", "нно", "ете", "йте", "ешь", "ла", "на", "ли", "ем", "ло", "но", "ет", "ют", "ны", "ть", "й", "л", "н"
];
const NOUN_SUFFIXES = [
    "иями", "ями", "ами", "ией", "иям", "ием", "иях", "ев", "ов", "ие", "ье", "еи", "ии",
    "ей", "ой", "ий", "ям", "ем", "ам", "ом", "ах", "ях", "ию", "ью", "ия", "ья",
    "а", "е", "и", "й", "о", "у", "ы", "ь", "ю", "я"
];

function stripVowelSuffix(word: string, rv: string, suffixes: string[]): string | null {
    const s = findLongestSuffix(rv, suffixes);
    if (!s) return null;
    const charBeforeIdx = word.length - s.length - 1;
    if (charBeforeIdx >= 0) {
        const prev = word[charBeforeIdx];
        if (prev === "а" || prev === "я") {
            return rv.slice(0, -s.length);
        }
    }
    return null;
}

function stripStepOne(word: string, rv: string): string {
    const gerund = findLongestSuffix(rv, GERUND_BASE);
    if (gerund) return rv.slice(0, -gerund.length);
    const gerundVowel = stripVowelSuffix(word, rv, GERUND_VOWEL);
    if (gerundVowel !== null) return gerundVowel;

    let res = rv;
    const refl = findLongestSuffix(res, REFLEXIVE_SUFFIXES);
    if (refl) res = res.slice(0, -refl.length);

    const adj = findLongestSuffix(res, ADJECTIVE_SUFFIXES);
    if (adj) {
        res = res.slice(0, -adj.length);
        const part = findLongestSuffix(res, PARTICIPLE_BASE);
        if (part) return res.slice(0, -part.length);
        const partV = stripVowelSuffix(word, res, PARTICIPLE_VOWEL);
        if (partV !== null) return partV;
        return res;
    }

    const verb = findLongestSuffix(res, VERB_BASE);
    if (verb) return res.slice(0, -verb.length);
    const verbV = stripVowelSuffix(word, res, VERB_VOWEL);
    if (verbV !== null) return verbV;

    const noun = findLongestSuffix(res, NOUN_SUFFIXES);
    if (noun) return res.slice(0, -noun.length);

    return res;
}

function stemRussian(word: string): string {
    const normalized = word.toLowerCase().replaceAll("ё", "е");
    const match = /[аеиоуыэюя]/.exec(normalized);
    if (!match) return normalized;
    const start = (match.index ?? 0) + 1;
    let rv = normalized.slice(start);
    if (!rv) return normalized;

    rv = stripStepOne(normalized, rv);

    if (rv.endsWith("и")) rv = rv.slice(0, -1);
    if (rv.endsWith("ость")) rv = rv.slice(0, -4);
    else if (rv.endsWith("ост")) rv = rv.slice(0, -3);

    if (rv.endsWith("ейше")) rv = rv.slice(0, -4);
    else if (rv.endsWith("ейш")) rv = rv.slice(0, -3);

    if (rv.endsWith("нн")) rv = rv.slice(0, -1);
    if (rv.endsWith("ь")) rv = rv.slice(0, -1);

    return normalized.slice(0, start) + rv;
}

function stemEnglish(w: string): string {
    let res = w.toLowerCase();
    if (res.length < 3) return res;

    if (res.endsWith("sses") || res.endsWith("ies")) {
        res = res.slice(0, -2);
    } else if (res.endsWith("s") && !res.endsWith("ss")) {
        res = res.slice(0, -1);
    }

    if (res.endsWith("eed")) {
        if (res.length > 4) res = res.slice(0, -1);
    } else if (res.endsWith("ed")) {
        if (/[aeiou]/.test(res.slice(0, -2))) res = res.slice(0, -2);
    } else if (res.endsWith("ing")) {
        if (/[aeiou]/.test(res.slice(0, -3))) res = res.slice(0, -3);
    }

    if (res.endsWith("y") && /[bcdfghjklmnpqrstvwxz]y$/.test(res)) {
        res = `${res.slice(0, -1)}i`;
    }
    return res;
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
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function highlightText(text: string, terms: string[]): string {
    if (!text || !terms.length) return escapeHtml(text || "");
    const escaped = escapeHtml(text);
    const validTerms = [...new Set(terms.filter(t => t.length > 0))].sort((a, b) => b.length - a.length);
    if (!validTerms.length) return escaped;
    const escapedTerms = validTerms.map(t => t.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&"));
    const pattern = new RegExp(`(${escapedTerms.join("|")})`, "gi");
    return escaped.replace(pattern, '<b class="font-bold text-amber-600 dark:text-[#FFE145]">$1</b>');
}

function findPhraseMatch(lower: string, fullPhrase: string): { idx: number; len: number } | null {
    if (!fullPhrase || fullPhrase.length <= 2) return null;
    const pIdx = lower.indexOf(fullPhrase.toLowerCase());
    return pIdx !== -1 ? { idx: pIdx, len: fullPhrase.length } : null;
}

function findTwoStemMatch(clean: string, lower: string, stemmedTerms: string[]): { idx: number; len: number; words: string[] } | null {
    if (stemmedTerms.length < 2) return null;
    const tokens = tokenize(clean);
    for (let i = 0; i < tokens.length - 1; i++) {
        if (stemWord(tokens[i]) === stemmedTerms[0] && stemWord(tokens[i + 1]) === stemmedTerms[1]) {
            const wIdx = lower.indexOf(tokens[i]);
            if (wIdx !== -1) {
                return {
                    idx: wIdx,
                    len: tokens[i].length + 1 + tokens[i + 1].length,
                    words: [tokens[i], tokens[i + 1]]
                };
            }
        }
    }
    return null;
}

function findTokenMatch(clean: string, lower: string, terms: string[], stemmedTerms: string[]): { idx: number; len: number; word: string } | null {
    const tokens = tokenize(clean);
    let charOffset = 0;
    for (const tok of tokens) {
        const idx = lower.indexOf(tok, charOffset);
        if (idx !== -1) {
            charOffset = idx + tok.length;
            const sTok = stemWord(tok);
            const isMatch = terms.includes(tok) || stemmedTerms.some(st => st === sTok || tok.startsWith(st) || sTok.startsWith(st));
            if (isMatch) {
                return { idx, len: tok.length, word: tok };
            }
        }
    }
    return null;
}

function buildSnippetString(clean: string, bestIdx: number, termLen: number, highlightTerms: string[]): string {
    let start = 0;
    if (bestIdx > 0) {
        const prevSpace = clean.lastIndexOf(" ", bestIdx - 2);
        start = (prevSpace !== -1 && (bestIdx - prevSpace) <= 18) ? prevSpace + 1 : Math.max(0, bestIdx - 12);
    }

    let end = Math.min(clean.length, bestIdx + termLen + 45);
    if (end < clean.length) {
        const nextSpace = clean.indexOf(" ", end);
        if (nextSpace !== -1 && (nextSpace - (bestIdx + termLen)) <= 55) {
            end = nextSpace;
        }
    }

    let snippet = clean.slice(start, end);
    if (start > 0) snippet = `...${snippet}`;
    if (end < clean.length) snippet = `${snippet}...`;

    return highlightText(snippet, highlightTerms);
}

function extractSnippet(text: string, fullPhrase: string, terms: string[], stemmedTerms: string[]): string {
    if (!text) return "";
    const clean = text.replace(/<[^>]+>/g, "").replace(/\{[^}]+\}/g, "").replace(/\s+/g, " ").trim();
    if (!clean) return "";
    const lower = clean.toLowerCase();

    let bestIdx = -1;
    let termLen = 4;
    const highlightTerms = [...terms];

    const phraseMatch = findPhraseMatch(lower, fullPhrase);
    if (phraseMatch) {
        bestIdx = phraseMatch.idx;
        termLen = phraseMatch.len;
        if (!highlightTerms.includes(fullPhrase)) highlightTerms.push(fullPhrase);
    }

    if (bestIdx === -1) {
        const twoStemMatch = findTwoStemMatch(clean, lower, stemmedTerms);
        if (twoStemMatch) {
            bestIdx = twoStemMatch.idx;
            termLen = twoStemMatch.len;
            highlightTerms.push(...twoStemMatch.words);
        }
    }

    if (bestIdx === -1) {
        const tokenMatch = findTokenMatch(clean, lower, terms, stemmedTerms);
        if (tokenMatch) {
            bestIdx = tokenMatch.idx;
            termLen = tokenMatch.len;
            highlightTerms.push(tokenMatch.word);
        }
    }

    if (bestIdx === -1) return "";

    return buildSnippetString(clean, bestIdx, termLen, highlightTerms);
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

function indexGeneralItemEntry(map: Map<string, IndexedDesc[]>, id: string, entry: any): void {
    if (!entry || typeof entry !== "object") return;
    const fields = [
        entry.description, entry.decoDesc, entry.desc, entry.extraDesc,
        entry.setBonus, entry.nickname, entry.featureDesc, entry.category, entry.group
    ];
    for (const val of fields) {
        if (typeof val === "string") addDesc(map, id, val);
    }

    if (Array.isArray(entry.skills)) {
        for (const s of entry.skills) {
            if (typeof s === "string") addDesc(map, id, s);
            else if (s && typeof s === "object") {
                addDesc(map, id, s.name);
                addDesc(map, id, s.description || s.desc);
            }
        }
    }
    if (Array.isArray(entry.abilities)) {
        for (const a of entry.abilities) {
            if (typeof a === "string") addDesc(map, id, a);
            else if (a && typeof a === "object") {
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

function indexCharacterBaseInfo(map: Map<string, IndexedDesc[]>, charId: string, baseInfo: any): void {
    if (!baseInfo) return;
    addDesc(map, charId, baseInfo.bio);
    addDesc(map, charId, baseInfo.profession);
    addDesc(map, charId, baseInfo.humanResources);
    addDesc(map, charId, baseInfo.raceTag);
    addDesc(map, charId, baseInfo.blocTag);
    const tagArrays = [baseInfo.tags, baseInfo.expertTags, baseInfo.hobbyTags, baseInfo.giftPreferTags];
    for (const arr of tagArrays) {
        if (Array.isArray(arr)) {
            for (const t of arr) addDesc(map, charId, t);
        }
    }
}

function indexCharacterData(map: Map<string, IndexedDesc[]>, charId: string, data: any): void {
    if (!charId || !data) return;
    indexCharacterBaseInfo(map, charId, data.baseInfo);

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
            if (typeof fileText === "string") addDesc(map, charId, fileText);
        }
    }
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
                if (!data || typeof data !== "object") return;
                for (const [id, entry] of Object.entries(data as Record<string, any>)) {
                    indexGeneralItemEntry(map, id, entry);
                }
            } catch (e) {
                console.error(e);
            }
        });

    const charPromises = Object.entries(allCharDescModules)
        .filter(([path]) => path.startsWith(charPrefix))
        .map(async ([path, loader]) => {
            try {
                const mod: any = await loader();
                const data = mod?.default ?? mod;
                const charId = path.split("/").pop()?.replace(".json", "") || "";
                indexCharacterData(map, charId, data);
            } catch (e) {
                console.error(e);
            }
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

function computeVariants(raw: string, isRu: boolean): string[] {
    const variants = [raw.toLowerCase()];
    if (!isRu) return variants;
    for (const v of convertLayout(raw)) {
        if (!variants.includes(v)) variants.push(v);
    }
    for (const v of transliterate(raw)) {
        if (!variants.includes(v)) variants.push(v);
    }
    return variants;
}

function collectHighlightTerms(raw: string, variants: string[]): string[] {
    const highlightTerms: string[] = [];
    for (const v of variants) {
        for (const t of tokenize(v)) {
            if ((t.length >= 2 || raw.length === 1) && !highlightTerms.includes(t)) {
                highlightTerms.push(t);
            }
        }
    }
    return highlightTerms;
}

function resolveDisplayTitle(
    item: SearchEntry,
    translate: (key: string) => string,
    langFolder: string
): string {
    if (item.titleKey) {
        const translated = translate(item.titleKey);
        if (translated && translated !== item.titleKey) return translated;
    }
    if (item.category === "achievements") {
        const achItem = achievementsByLocale[langFolder]?.[item.id] || achievementsByLocale["en"]?.[item.id];
        if (achItem?.name) return achItem.name;
    }
    return item.staticName || item.id;
}

function matchVariantScore(
    lowerTitle: string,
    lowerStatic: string,
    lowerId: string,
    lowerKeywords: string,
    v: string
): number {
    if (lowerTitle === v) return 600;
    if (lowerTitle.startsWith(v)) return 400;
    if (lowerTitle.includes(` ${v}`) || lowerTitle.includes(`(${v}`)) return 300;
    if (lowerTitle.includes(v)) return 200;
    if (v.length >= 4 && lowerTitle.length >= 4 && isDistanceOne(lowerTitle, v)) return 180;
    if (lowerStatic) {
        if (lowerStatic.startsWith(v)) return 140;
        if (lowerStatic.includes(v)) return 110;
        if (v.length >= 4 && lowerStatic.length >= 4 && isDistanceOne(lowerStatic, v)) return 100;
    }
    if (lowerId.startsWith(v)) return 90;
    if (lowerId.includes(v)) return 70;
    if (lowerKeywords.includes(v)) return 50;
    return 0;
}

function scoreByVariants(
    lowerTitle: string,
    lowerStatic: string,
    lowerId: string,
    lowerKeywords: string,
    variants: string[],
    rawTokens: string[],
    matchedRawTokens: Set<number>
): number {
    let score = 0;
    for (const v of variants) {
        const s = matchVariantScore(lowerTitle, lowerStatic, lowerId, lowerKeywords, v);
        if (s > 0) {
            score = Math.max(score, s);
            rawTokens.forEach((_, idx) => matchedRawTokens.add(idx));
        }
    }
    return score;
}

function matchTokenScore(tt: string, ts: string, qt: string, qs: string): number {
    if (tt === qt) return 80;
    if (tt.startsWith(qt)) return 60;
    if (ts === qs) return 50;
    if (qt.length >= 4 && tt.length >= 4 && isDistanceOne(tt, qt)) return 45;
    if (qs.length >= 4 && ts.length >= 4 && isDistanceOne(ts, qs)) return 40;
    return 0;
}

function scoreTitleTokens(
    titleTokens: string[],
    titleStems: string[],
    rawTokens: string[],
    rawStems: string[],
    highlightTerms: string[],
    matchedRawTokens: Set<number>
): number {
    let score = 0;
    for (let qIdx = 0; qIdx < rawTokens.length; qIdx++) {
        const qt = rawTokens[qIdx];
        const qs = rawStems[qIdx];
        for (let i = 0; i < titleTokens.length; i++) {
            const tt = titleTokens[i];
            const s = matchTokenScore(tt, titleStems[i], qt, qs);
            if (s > 0) {
                score += s;
                matchedRawTokens.add(qIdx);
                if (s <= 50 && !highlightTerms.includes(tt)) highlightTerms.push(tt);
                break;
            }
        }
    }
    return score;
}

function resolveFeaturedName(featId: string, translate: (key: string) => string): string {
    const charKey = `characters.${featId}`;
    const charTrans = translate(charKey);
    if (charTrans && charTrans !== charKey) return charTrans;
    const wpnKey = `weaponsList.${featId}`;
    const wpnTrans = translate(wpnKey);
    if (wpnTrans && wpnTrans !== wpnKey) return wpnTrans;
    const charObj = (characters as Record<string, any>)[featId];
    const wpnObj = (weapons as Record<string, any>)[featId];
    return charObj?.name || wpnObj?.name || featId;
}

function scoreSingleFeatured(
    featName: string,
    variants: string[],
    rawTokens: string[],
    rawStems: string[],
    highlightTerms: string[],
    matchedRawTokens: Set<number>
): number {
    const lowerFeat = featName.toLowerCase();
    const featTokens = tokenize(featName);
    const featStems = featTokens.map(stemWord);
    let featScore = 0;

    for (const v of variants) {
        if (lowerFeat === v) featScore = Math.max(featScore, 260);
        else if (lowerFeat.startsWith(v)) featScore = Math.max(featScore, 210);
        else if (lowerFeat.includes(v)) featScore = Math.max(featScore, 170);
        else if (v.length >= 4 && lowerFeat.length >= 4 && isDistanceOne(lowerFeat, v)) featScore = Math.max(featScore, 150);
        if (featScore > 0) rawTokens.forEach((_, idx) => matchedRawTokens.add(idx));
    }

    for (let qIdx = 0; qIdx < rawTokens.length; qIdx++) {
        const qt = rawTokens[qIdx];
        const qs = rawStems[qIdx];
        for (let i = 0; i < featTokens.length; i++) {
            const ft = featTokens[i];
            const s = matchTokenScore(ft, featStems[i], qt, qs);
            if (s > 0) {
                featScore += s;
                matchedRawTokens.add(qIdx);
                if (!highlightTerms.includes(ft)) highlightTerms.push(ft);
                break;
            }
        }
    }
    return featScore;
}

function scoreBannerFeatured(
    featuredIds: string[],
    translate: (key: string) => string,
    variants: string[],
    rawTokens: string[],
    rawStems: string[],
    highlightTerms: string[],
    matchedRawTokens: Set<number>
): { score: number; snippet?: string } {
    let bestScore = 0;
    let snippet: string | undefined;

    for (const featId of featuredIds) {
        const featName = resolveFeaturedName(featId, translate);
        if (!featName) continue;
        const res = scoreSingleFeatured(featName, variants, rawTokens, rawStems, highlightTerms, matchedRawTokens);
        if (res > 0) {
            bestScore = Math.max(bestScore, res);
            if (!snippet) snippet = highlightText(featName, highlightTerms);
        }
    }
    return { score: bestScore, snippet };
}

function scoreDescriptions(
    descs: IndexedDesc[],
    variants: string[],
    raw: string,
    rawTokens: string[],
    rawStems: string[],
    highlightTerms: string[],
    matchedRawTokens: Set<number>
): { score: number; snippet?: string } {
    let totalScore = 0;
    let bestQuality = -1;
    let snippet: string | undefined;

    for (const d of descs) {
        let quality = 0;
        for (const v of variants) {
            if (d.lower.includes(v)) {
                totalScore += 450;
                quality += 1000;
                rawTokens.forEach((_, idx) => matchedRawTokens.add(idx));
                break;
            }
        }

        if (quality < 1000 && rawStems.length > 1) {
            for (let i = 0; i < d.stems.length - 1; i++) {
                if (d.stems[i] === rawStems[0] && d.stems[i + 1] === rawStems[1]) {
                    totalScore += 320;
                    quality += 500;
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
                    totalScore += 30;
                    quality += 50;
                    matchedRawTokens.add(qIdx);
                    break;
                } else if (d.tokens[i].startsWith(qt)) {
                    totalScore += 20;
                    quality += 30;
                    matchedRawTokens.add(qIdx);
                    break;
                } else if (d.stems[i] === qs) {
                    totalScore += 15;
                    quality += 20;
                    matchedRawTokens.add(qIdx);
                    if (!highlightTerms.includes(d.tokens[i])) highlightTerms.push(d.tokens[i]);
                    break;
                }
            }
        }

        if (quality > bestQuality) {
            bestQuality = quality;
            snippet = extractSnippet(d.text, raw, highlightTerms, rawStems);
        }
    }

    return { score: totalScore, snippet };
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

    const isRu = (localeCode || "").toLowerCase().startsWith("ru");
    const variants = computeVariants(raw, isRu);
    const rawTokens = tokenize(raw);
    const rawStems = rawTokens.map(stemWord);
    const highlightTerms = collectHighlightTerms(raw, variants);

    const index = buildSearchIndex();
    const scored: { item: SearchEntry; score: number; displayTitle: string; matchedSnippet?: string }[] = [];

    const langFolder = getLangFolder(localeCode);
    const descMap = isAdvanced ? descIndexMap[langFolder] : null;

    for (const item of index) {
        if (selectedCategory !== "all" && item.category !== selectedCategory) {
            continue;
        }

        const displayTitle = resolveDisplayTitle(item, translate, langFolder);
        const lowerTitle = displayTitle.toLowerCase();
        const lowerStatic = (item.staticName || "").toLowerCase();
        const lowerId = item.id.toLowerCase();
        const achItem = item.category === "achievements" ? (achievementsByLocale[langFolder]?.[item.id] || achievementsByLocale["en"]?.[item.id]) : null;
        const lowerKeywords = `${item.keywords || ""} ${achItem?.category || ""} ${achItem?.group || ""}`.toLowerCase();

        const matchedRawTokens = new Set<number>();
        let score = scoreByVariants(lowerTitle, lowerStatic, lowerId, lowerKeywords, variants, rawTokens, matchedRawTokens);

        const titleTokens = tokenize(displayTitle);
        const titleStems = titleTokens.map(stemWord);
        score += scoreTitleTokens(titleTokens, titleStems, rawTokens, rawStems, highlightTerms, matchedRawTokens);

        let matchedSnippet: string | undefined;

        if (item.category === "banners" && (item.featuredIds?.length ?? 0) > 0) {
            const featRes = scoreBannerFeatured(item.featuredIds!, translate, variants, rawTokens, rawStems, highlightTerms, matchedRawTokens);
            if (featRes.score > 0) {
                score = Math.max(score, featRes.score);
                matchedSnippet = featRes.snippet;
            }
        }

        if (descMap) {
            const descs = descMap.get(item.id);
            if (descs) {
                const descRes = scoreDescriptions(descs, variants, raw, rawTokens, rawStems, highlightTerms, matchedRawTokens);
                score += descRes.score;
                if (descRes.snippet) matchedSnippet = descRes.snippet;
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

// src/lib/utils/imageUtils.js

// 1. Импортируем данные (Svelte сам поймет путь через $lib)
import { currencies } from '$lib/data/items/currencies';
import { progression } from '$lib/data/items/progression';

// 2. Вспомогательная функция, чтобы получить ID
// Она работает и если там объекты [{id: 'lmd'}], и если просто строки ['lmd']
const extractIds = (list) => {
    if (!list) return [];
    return list.map(item => (typeof item === 'string' ? item : item.id));
};

// 3. Создаем списки ID для проверки
// Используем Set для мгновенного поиска, но можно и обычный includes
const CURRENCY_IDS = extractIds(currencies);
const PROGRESSION_IDS = extractIds(progression);


export function normalizeId(str) {
    if (!str) return "";
    if (str.toString().startsWith("http")) return str;
    return str.toString().replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_\-\.]/g, "");
}

export function getImagePath(idOrName, variant = 'operator-icon') {
    if (!idOrName) return "";
    if (idOrName.toString().startsWith("http")) return idOrName;

    const name = normalizeId(idOrName);
    const withExt = (n) => /\.(png|jpg|jpeg|webp|gif)$/i.test(n) ? n : `${n}.png`;

    switch (variant) {
        case 'operator-splash':
            return `/images/operators/splash/${withExt(name)}`;
        
        case 'item':
            // --- ТЕПЕРЬ ПРОВЕРЯЕМ ПО ИМПОРТИРОВАННЫМ СПИСКАМ ---
            
            // 1. Если есть в валютах -> папка currencies
            if (CURRENCY_IDS.includes(name)) {
                return `/images/items/currencies/${withExt(name)}`;
            }

            // 2. Если есть в материалах -> папка progression
            if (PROGRESSION_IDS.includes(name)) {
                return `/images/items/progression/${withExt(name)}`;
            }

            // 3. Если нигде не нашли, но запросили 'item' —
            // скорее всего это материал (progression) или лежит в корне items
            // Давай по дефолту кидать в progression, так как там больше всего предметов
            return `/images/items/progression/${withExt(name)}`;
        
        case 'currency':
            return `/images/items/currencies/${withExt(name)}`;

        case 'banner-icon':
            return `/images/banners/icon/${withExt(name)}`;

        case 'banner-mini':
            return `/images/banners/miniIcon/${withExt(name)}`;

        case 'event-icon':
            return `/images/events/icon/${withExt(name)}`; 
            
        case 'operator-icon':
        default:
            return `/images/operators/icons/${withExt(name)}`;
    }
}
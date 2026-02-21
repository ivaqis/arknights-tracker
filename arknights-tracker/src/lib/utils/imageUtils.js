// src/lib/utils/imageUtils.js

import { currencies } from '$lib/data/items/currencies';
import { progression } from '$lib/data/items/progression';

const extractIds = (list) => {
    if (!list) return [];
    return list.map(item => (typeof item === 'string' ? item : item.id));
};

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
            if (CURRENCY_IDS.includes(name)) {
                return `/images/items/currencies/${withExt(name)}`;
            }

            if (PROGRESSION_IDS.includes(name)) {
                return `/images/items/progression/${withExt(name)}`;
            }

            return `/images/items/progression/${withExt(name)}`;
        
        case 'currency':
            return `/images/items/currencies/${withExt(name)}`;

        case 'banner-icon':
            return `/images/banners/icon/${withExt(name)}`;

        case 'banner-mini':
            return `/images/banners/miniIcon/${withExt(name)}`;

        case 'event-icon':
            return `/images/events/icon/${withExt(name)}`; 

        case 'skill-icon':
            return `/images/operators/skills/${withExt(name)}`;

        case 'operator-preview':
            return `/images/operators/preview/${withExt(name)}`;

        case 'weapon-icon':
            return `/images/weapons/${withExt(name)}`;

        case 'attribute-icon':
            return `/images/operators/attributes/${withExt(name)}`;
            
        case 'fac-skill':
            return `/images/operators/facSkills/${withExt(name)}`;

        case 'operator-art':
            return `/images/operators/arts/${withExt(name)}`;
            
        case 'operator-icon':
        default:
            return `/images/operators/icons/${withExt(name)}`;
    }
}
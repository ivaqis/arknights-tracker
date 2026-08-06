// src/lib/utils/imageUtils.js

import { currencies } from '$lib/data/items/currencies';
import { progression } from '$lib/data/items/progression';
import { characters } from '$lib/data/characters';

const extractIds = (list) => {
    if (!list) return [];
    return list.map(item => (typeof item === 'string' ? item : item.id));
};

const apiIdToCharId = Object.values(characters || {}).reduce((acc, char) => {
    if (char?.apiId) {
        acc[char.apiId] = char.id;
    }
    return acc;
}, {});

const CURRENCY_IDS = new Set(extractIds(currencies));
const PROGRESSION_IDS = new Set(extractIds(progression));

const IMAGE_EXT_REGEX = /\.(png|jpg|jpeg|webp|gif|svg)$/i;

export function normalizeId(str) {
    if (!str) return "";
    if (str.toString().startsWith("http")) return str;
    const clean = str.toString().trim();
    if (apiIdToCharId[clean]) {
        return apiIdToCharId[clean];
    }
    return clean.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_\-.]/g, "");
}

export function getImagePath(idOrName, variant = 'operator-icon') {
    if (!idOrName) return "";
    if (idOrName.toString().startsWith("http")) return idOrName;

    const name = normalizeId(idOrName);
    const withExt = (n, defaultExt = 'png') => {
        if (!IMAGE_EXT_REGEX.test(n)) return `${n}.${defaultExt}`;
        if (defaultExt === 'webp') {
            return n.replace(IMAGE_EXT_REGEX, '.webp');
        }
        return n;
    };

    switch (variant) {
        case 'operator-splash':
            return `/images/operators/splash/${withExt(name)}`;
        
        case 'item':
            if (CURRENCY_IDS.has(name)) {
                return `/images/items/currencies/${withExt(name)}`;
            }

            if (PROGRESSION_IDS.has(name)) {
                return `/images/items/progression/${withExt(name)}`;
            }

            return `/images/items/progression/${withExt(name)}`;
        
        case 'currency':
            return `/images/items/currencies/${withExt(name)}`;

        case 'building-icon':
            return `/images/buildings/icons/${withExt(name)}`;

        case 'item-icon':
            return `/images/items/items/${withExt(name)}`;

        case 'item-icon-bg':
            return `/images/items/icon-bg/${withExt(name)}`;

        case 'banner-icon':
            return `/images/banners/icon/${withExt(name, 'webp')}`;

        case 'banner-mini':
            return `/images/banners/miniIcon/${withExt(name, 'webp')}`;

        case 'event-icon':
            return `/images/events/icon/${withExt(name, 'webp')}`; 

        case 'skill-icon':
            return `/images/operators/skills/${withExt(name)}`;

        case 'operator-preview':
            return `/images/operators/preview/${withExt(name)}`;

        case 'weapon-icon':
            return `/images/weapons/${withExt(name)}`;

        case 'weapons-big':
            return `/images/weaponsBig/${withExt(name)}`;

        case 'enemy-icon':
            return `/images/enemies/${withExt(name)}`;

        case 'equipment':
            return `/images/equipment/${withExt(name)}`;

        case 'attribute-icon':
            return `/images/operators/attributes/${withExt(name)}`;
            
        case 'fac-skill':
            return `/images/operators/facSkills/${withExt(name)}`;

        case 'operator-art':
            return `/images/operators/arts/${withExt(name)}`;

        case 'operator-art-lq':
            return `/images/operators/artsLQ/${withExt(name)}`;
            
        case 'contract-tag-icon':
            return `/images/crisisContract/tags/icon_${withExt(name)}`;

        case 'essence-icon':
            return `/images/essences/${withExt(name, 'webp')}`;

        case 'essence-type-icon':
            return `/images/essencesTypes/${withExt(name, 'webp')}`;

        case 'operator-icon':
        default:
            return `/images/operators/icons/${withExt(name)}`;
    }
}
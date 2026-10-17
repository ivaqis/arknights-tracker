import { currencies } from '$lib/data/items/currencies';
import { progression } from '$lib/data/items/progression';
import { characters } from '$lib/data/characters';
import { weapons } from '$lib/data/weapons';
import { enemyVariantMap } from '$lib/data/enemies';

const extractIds = (list) => {
    if (!list) return [];
    return list.map(item => (typeof item === 'string' ? item : item.id));
};

const apiIdToCharId = Object.values(characters || {}).reduce((acc, char) => {
    if (char?.apiId) {
        acc[char.apiId] = char.id;
    }
    if (char?.gameId) {
        acc[char.gameId] = char.id;
    }
    return acc;
}, {});

const weaponIdToGameId = Object.values(weapons || {}).reduce((acc, w) => {
    if (w?.id && w?.gameId) {
        acc[w.id] = w.gameId;
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

export function resolveArtName(idOrName) {
    if (!idOrName) return "";
    let clean = idOrName.toString().trim();
    if (clean.startsWith("http")) return clean;
    if (clean.includes(".")) clean = clean.split(".")[0];
    if (clean.startsWith("pic_")) return clean;

    const parts = clean.split("_");
    let charId = "";
    let potPart = "";

    const potIdx = parts.findIndex(p => p.startsWith("potential") || p.startsWith("ex"));
    if (potIdx !== -1) {
        charId = parts.slice(0, potIdx).join("_");
        potPart = parts.slice(potIdx).join("_");
    } else {
        charId = parts[0];
        potPart = parts.slice(1).join("_") || "potential1";
    }

    let potNum = "1";
    if (potPart.includes("potential6") || potPart.includes("potential5")) potNum = "5";
    else if (potPart.includes("potential3")) potNum = "3";

    if (potPart.includes("ex01")) {
        potNum = "1_ex01";
    }

    const char = characters[charId] || Object.values(characters || {}).find(c => c.id === charId || c.gameId === charId);
    if (char?.gameId) {
        return `pic_${potNum}_${char.gameId}`;
    }
    return clean;
}

export function resolveWeaponName(idOrName) {
    if (!idOrName) return "";
    let clean = idOrName.toString().trim();
    if (clean.startsWith("http")) return clean;
    if (clean.includes(".")) clean = clean.split(".")[0];
    if (clean.startsWith("wpn_")) return clean;
    const w = weapons[clean] || Object.values(weapons || {}).find(item => item.id === clean || item.gameId === clean);
    return w?.gameId || weaponIdToGameId[clean] || clean;
}

export function resolvePreviewName(idOrName) {
    if (!idOrName) return "";
    let clean = idOrName.toString().trim();
    if (clean.startsWith("http")) return clean;
    if (clean.includes(".")) clean = clean.split(".")[0];
    if (clean.startsWith("icon_") || clean.startsWith("common_")) return clean;
    const char = characters[clean] || Object.values(characters || {}).find(c => c.id === clean || c.gameId === clean || c.apiId === clean);
    const gameId = char?.gameId || (clean.startsWith("chr_") ? clean : null);
    if (gameId) {
        return `icon_${gameId}`;
    }
    return clean;
}

const WEAPON_ATTACK_ICON_MAP = {
    sword: 'icon_attack_sword',
    greatSword: 'icon_attack_claym',
    claymore: 'icon_attack_claym',
    claym: 'icon_attack_claym',
    polearm: 'icon_attack_lance',
    lance: 'icon_attack_lance',
    artsUnit: 'icon_attack_funnel',
    funnel: 'icon_attack_funnel',
    pistol: 'icon_attack_pistol'
};

export function resolveSkillIconName(idOrName) {
    if (!idOrName) return "";
    let clean = idOrName.toString().trim();
    if (clean.startsWith("http")) return clean;
    if (clean.includes(".")) clean = clean.split(".")[0];
    if (clean.startsWith("icon_") || clean.startsWith("btn_") || clean.startsWith("decal_")) {
        return clean;
    }

    if (WEAPON_ATTACK_ICON_MAP[clean]) {
        return WEAPON_ATTACK_ICON_MAP[clean];
    }

    const match = clean.match(/^([a-zA-Z0-9]+)_(battleSkill|comboSkill|ultimate|talent[12]|skill[12]|normalAttack|basicAttack)$/i);
    if (match) {
        const charKey = match[1];
        const skillType = match[2].toLowerCase();

        const char = characters[charKey] || Object.values(characters || {}).find(c => c.id === charKey || c.gameId === charKey || c.apiId === charKey);
        if (char?.gameId) {
            const shortName = char.gameId.replace(/^chr_\d+_/, '');
            const skillShortName = (shortName === 'endminm' || shortName === 'endminf') ? 'endmin' : shortName;

            if (skillType === 'battleskill' || skillType === 'skill1') {
                return `icon_skill_${skillShortName}_01`;
            }
            if (skillType === 'comboskill') {
                return `icon_combo_skill_${skillShortName}_01`;
            }
            if (skillType === 'ultimate') {
                return `icon_ultimate_skill_${skillShortName}_01`;
            }
            if (skillType === 'talent1') {
                const tName = (shortName === 'endminf') ? 'endminm' : shortName;
                return `icon_talent_${tName}_01`;
            }
            if (skillType === 'talent2') {
                const tName = (shortName === 'endminf') ? 'endminm' : shortName;
                return `icon_talent_${tName}_02`;
            }
            if (skillType === 'basicattack' || skillType === 'normalattack') {
                const weapon = char.weapon;
                if (weapon && WEAPON_ATTACK_ICON_MAP[weapon]) {
                    return WEAPON_ATTACK_ICON_MAP[weapon];
                }
            }
        }
    }

    return clean;
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

        case 'monument-icon':
            return `/images/umbralMonument/icon/${withExt(name, 'webp')}`; 

        case 'monument-cover':
            return `/images/umbralMonument/cover/${withExt(name, 'webp')}`;

        case 'skill-icon':
            return `/images/operators/skills/${withExt(resolveSkillIconName(name))}`;

        case 'operator-preview':
            return `/images/operators/preview/${withExt(resolvePreviewName(name))}`;

        case 'weapon-icon':
            return `/images/weapons/${withExt(resolveWeaponName(name))}`;

        case 'weapons-big':
            return `/images/weaponsBig/${withExt(resolveWeaponName(name))}`;

        case 'enemy-icon': {
            const mappedName = enemyVariantMap[name]?.baseId || name;
            return `/images/enemies/${withExt(mappedName)}`;
        }

        case 'equipment':
            return `/images/equipment/${withExt(name)}`;

        case 'suit-logo-w':
            return `/images/suitLogoW/${withExt(name, 'webp')}`;

        case 'suit-logo-d':
            return `/images/suitLogoD/${withExt(name, 'webp')}`;

        case 'attribute-icon':
            return `/images/operators/attributes/${withExt(name)}`;
            
        case 'fac-skill':
            return `/images/operators/facSkills/${withExt(name)}`;

        case 'operator-art':
            return `/images/operators/arts/${withExt(resolveArtName(name), 'png')}`;

        case 'operator-art-lq':
            return `/images/operators/artsLQ/${withExt(resolveArtName(name), 'webp')}`;
            
        case 'contract-tag-icon':
            return `/images/crisisContract/tags/icon_${withExt(name)}`;

        case 'essence-icon':
            return `/images/essences/${withExt(name, 'webp')}`;

        case 'essence-type-icon':
            return `/images/essencesTypes/${withExt(name, 'webp')}`;

        case 'achievement':
        case 'achievement-icon':
            return `/images/achievments/${withExt(name, 'webp')}`;

        case 'operator-icon':
        default:
            return `/images/operators/icons/${withExt(name)}`;
    }
}
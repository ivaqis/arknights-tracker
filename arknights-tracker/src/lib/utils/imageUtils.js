import { characters } from '$lib/data/characters';
import { weapons } from '$lib/data/weapons';
import { enemyVariantMap } from '$lib/data/enemies';
import { characterStickers } from '$lib/data/characterStickers';

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



const IMAGE_EXT_REGEX = /\.(png|jpg|jpeg|webp|gif|svg)$/i;

export function normalizeId(str) {
    if (!str) return "";
    if (str.toString().startsWith("http")) return str;
    const clean = str.toString().trim();
    if (apiIdToCharId[clean]) {
        return apiIdToCharId[clean];
    }
    return clean.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_\-./]/g, "");
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
    pistol: 'icon_attack_pistol',
    handcannon: 'icon_attack_pistol'
};

export function resolveBattleIconName(idOrName) {
    if (!idOrName) return "";
    let clean = idOrName.toString().trim();
    if (clean.startsWith("http")) return clean;
    if (clean.includes(".")) clean = clean.split(".")[0];
    if (clean.startsWith("icon_")) return clean;
    const char = characters[clean] || Object.values(characters || {}).find(c => c.id === clean || c.gameId === clean || c.apiId === clean);
    const gameId = char?.gameId || (clean.startsWith("chr_") ? clean : null);
    if (gameId) return `icon_${gameId}`;
    return clean;
}

export function resolveBarkIconName(idOrName) {
    if (!idOrName) return "";
    let clean = idOrName.toString().trim();
    if (clean.startsWith("http")) return clean;
    if (clean.includes(".")) clean = clean.split(".")[0];
    if (clean.startsWith("aibark_")) return clean;
    const char = characters[clean] || Object.values(characters || {}).find(c => c.id === clean || c.gameId === clean || c.apiId === clean);
    const gameId = char?.gameId || (clean.startsWith("chr_") ? clean : null);
    if (gameId) return `aibark_${gameId}`;
    return clean;
}

export function resolveCharGameId(idOrName) {
    if (!idOrName) return "";
    let clean = idOrName.toString().trim();
    if (clean.startsWith("http")) return clean;
    if (clean.includes(".")) clean = clean.split(".")[0];
    const char = characters[clean] || Object.values(characters || {}).find(c => c.id === clean || c.gameId === clean || c.apiId === clean);
    return char?.gameId || clean;
}

export function resolveCharInfoName(idOrName) {
    if (!idOrName) return "";
    let clean = idOrName.toString().trim();
    if (clean.startsWith("http")) return clean;
    if (clean.includes(".")) clean = clean.split(".")[0];
    if (clean.startsWith("bg_charinfo_")) return clean;
    const char = characters[clean] || Object.values(characters || {}).find(c => c.id === clean || c.gameId === clean || c.apiId === clean);
    const gameId = char?.gameId || (clean.startsWith("chr_") ? clean : null);
    if (gameId) return `bg_charinfo_${gameId}`;
    return clean;
}

export function resolveReceptionPosterName(idOrName) {
    if (!idOrName) return "";
    let clean = idOrName.toString().trim();
    if (clean.startsWith("http")) return clean;
    if (clean.includes(".")) clean = clean.split(".")[0];
    if (clean.startsWith("poster_")) return clean;
    const char = characters[clean] || Object.values(characters || {}).find(c => c.id === clean || c.gameId === clean || c.apiId === clean);
    const gameId = char?.gameId || (clean.startsWith("chr_") ? clean : null);
    if (gameId) return `poster_${gameId}`;
    return clean;
}

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
        
        case 'game-item':
        case 'item-game':
        case 'item':
        case 'item-icon':
        case 'currency':
            return `/images/items/${withExt(name)}`;

        case 'building-icon':
            return `/images/buildings/icons/${withExt(name)}`;

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

        case 'item-tips':
        case 'item-obtain':
            return `/images/itemTips/${withExt(name)}`;

        case 'operator-battle-icon':
        case 'charbattleicon':
            return `/images/operators/charbattleicon/${withExt(resolveBattleIconName(name))}`;

        case 'operator-bark-icon':
        case 'aibarkcharicon':
            return `/images/operators/aibarkcharicon/${withExt(resolveBarkIconName(name))}`;

        case 'operator-gacha':
        case 'chargacha':
            return `/images/operators/chargacha/${withExt(resolveCharGameId(name))}`;

        case 'operator-head-icon':
        case 'charhorheadicon':
            return `/images/operators/charhorheadicon/${withExt(resolveCharGameId(name))}`;

        case 'operator-info-bg':
        case 'charinfo':
            return `/images/operators/charinfo/${withExt(resolveCharInfoName(name))}`;

        case 'operator-gacha-shadow':
        case 'gachashadow':
            return `/images/operators/gachashadow/${withExt(resolveCharGameId(name))}`;

        case 'operator-chapter-icon':
        case 'chaptchariconnew': {
            const mapped = CHAPTER_ICON_MAP[name] || CHAPTER_ICON_MAP[characters[name]?.gameId] || name;
            return `/images/operators/chaptchariconnew/${withExt(mapped)}`;
        }

        case 'operator-reception-room':
        case 'receptionroom':
            return `/images/operators/receptionroom/${withExt(resolveReceptionPosterName(name))}`;

        case 'war-echoes':
        case 'seasontower':
            return `/images/warEchoes/${withExt(name, 'webp')}`;

        case 'monument-theme':
        case 'highdifficulty':
            return `/images/umbralMonument/themes/${withExt(name, 'webp')}`;

        case 'sticker':
            return `/images/stickers/${withExt(name)}`;

        case 'operator-icon':
        default:
            return `/images/operators/icons/${withExt(name)}`;
    }
}

const CHAPTER_ICON_MAP = {
    chr_0006_wolfgd: 'chapter_character_char_icon_01',
    chr_0013_aglina: 'chapter_character_char_icon_02',
    chr_0016_laevat: 'chapter_character_char_icon_03',
    chr_0017_yvonne: 'chapter_character_char_icon_04',
    chr_0028_wulfa: 'chapter_character_char_icon_06',
    chr_0031_mifu: 'chapter_character_char_icon_07',
    chr_0033_camille: 'chapter_character_char_icon_08',
    chr_0032_lizhiyan: 'chapter_character_char_icon_09',
    chr_0035_liino: 'chapter_character_char_icon_010',
    chr_0034_typhoea: 'chapter_character_char_icon_011'
};

export function getCharacterExtraArts(characterOrId) {
    const char = typeof characterOrId === 'object' && characterOrId !== null
        ? characterOrId
        : (characters[characterOrId] || Object.values(characters || {}).find(c => c.id === characterOrId || c.gameId === characterOrId));

    if (!char?.gameId) return [];
    const gid = char.gameId;
    const isEndmin = char.id === 'endministrator1' || char.id === 'endministrator2';

    const arts = [
        { id: 'receptionroom', url: getImagePath(gid, 'receptionroom') },
        { id: 'charhorheadicon', url: getImagePath(gid, 'charhorheadicon') },
        { id: 'chargacha', url: getImagePath(gid, 'chargacha') },
        { id: 'charbattleicon', url: getImagePath(gid, 'charbattleicon') },
        { id: 'charinfo', url: getImagePath(gid, 'charinfo') }
    ];

    if (!isEndmin) {
        arts.push(
            { id: 'gachashadow', url: getImagePath(gid, 'gachashadow') },
            { id: 'gachashadow_s', url: getImagePath(`${gid}_s`, 'gachashadow') }
        );
    }

    arts.push({ id: 'aibarkcharicon', url: getImagePath(gid, 'aibarkcharicon') });

    const chapterIcon = CHAPTER_ICON_MAP[gid] || CHAPTER_ICON_MAP[char.id];
    if (chapterIcon) {
        arts.push({ id: 'chaptcharicon', url: getImagePath(chapterIcon, 'chaptchariconnew') });
    }

    const stickers = characterStickers[char.id] || [];
    for (const file of stickers) {
        const id = file.replace(/^.*[\\/]/, '').replace(/\.[^/.]+$/, '');
        arts.push({
            id,
            url: getImagePath(file, 'sticker')
        });
    }

    return arts;
}

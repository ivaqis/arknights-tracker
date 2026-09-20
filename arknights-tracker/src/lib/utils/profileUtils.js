import { characters } from "$lib/data/characters.js";
import { weapons } from "$lib/data/weapons.js";
import { equipment } from "$lib/data/items/equipment.js";
import { getImagePath } from "$lib/utils/imageUtils.js";
import ruEquip from "$lib/locales/ru/equipment.json";
import enEquip from "$lib/locales/en/equipment.json";

export const charOrderMap = Object.keys(characters || {}).reduce((acc, key, idx) => {
    acc[key] = idx;
    return acc;
}, {});

export function getSvelteCharId(char) {
    if (!char) return "";
    const raw = typeof char === "string" ? char : (char.id || char.charId || char.charData?.id || "");
    const found = characters[raw] || Object.values(characters).find(c => c.gameId === raw || c.apiId === raw || c.id === raw);
    return found ? found.id : raw;
}

export function mapProfessionToClass(key) {
    if (!key) return "guard";
    return key.replace("profession_", "");
}

export function mapPropertyToElement(key) {
    if (!key) return null;
    return key.replace("char_property_", "");
}

export function getOperatorData(char) {
    const svelteId = getSvelteCharId(char);
    const staticData = characters[svelteId] || Object.values(characters).find(c => c.gameId === svelteId || c.apiId === svelteId || c.id === svelteId);
    if (staticData) {
        return staticData;
    }

    return {
        id: char.charData?.avatarSqUrl || svelteId || char.id,
        name: char.charData?.name || char.name || "Operator",
        rarity: Number(char.charData?.rarity?.value || char.rarity || 4),
        class: mapProfessionToClass(char.charData?.profession?.key) || "guard",
        element: mapPropertyToElement(char.charData?.property?.key) || null
    };
}

export function getWeaponData(weapon) {
    if (!weapon) return null;
    const skillKey = weapon.weaponData?.skills?.find(s => s.key?.startsWith("sk_wpn_"))?.key;
    const gameId = skillKey ? skillKey.replace("sk_", "") : (weapon.id || weapon.weaponData?.id);
    const staticData = Object.values(weapons || {}).find(w => w.id === gameId || w.gameId === gameId);
    if (staticData) {
        return staticData;
    }
    return {
        id: gameId,
        name: weapon.weaponData?.name || weapon.name || gameId,
        rarity: Number(weapon.weaponData?.rarity?.value || weapon.rarity?.value || weapon.rarity || 4),
        type: weapon.weaponData?.type?.value || weapon.type || "sword"
    };
}

export function getWeaponIcon(weapon) {
    if (!weapon) return "";
    const mapped = getWeaponData(weapon);
    const wpnId = mapped?.id || weapon.id;
    if (wpnId) {
        return getImagePath(wpnId, "weapon-icon");
    }
    return weapon.icon || "";
}

export function getWeaponTerms(wpn) {
    if (!wpn) return [];
    if (wpn.weaponTerms && wpn.weaponTerms.length > 0) {
        return wpn.weaponTerms;
    }
    if (Array.isArray(wpn.skills) && wpn.skills.length > 0 && wpn.skills.every(s => typeof s.level === 'number')) {
        return wpn.skills.map(s => s.level);
    }
    const refine = wpn.refineLevel || 0;
    const wpnStatic = getWeaponData(wpn);
    const rarity = wpnStatic?.rarity || wpn.rarity || 4;
    const gameId = wpnStatic?.id || wpn.id || "";
    const level = wpn.level || 1;

    const baseTermsMap = {
        "wpn_sword_0006": [6, 3, 1],
        "wpn_sword_0012": [5, 5, 1],
        "wpn_funnel_0005": [3, 2, 1],
        "wpn_claym_0012": [2, 1, 2]
    };

    const defaultRarityBase = {
        6: [5, 3, 1],
        5: [2, 2, 1],
        4: [1, 1, 1]
    };

    const base = baseTermsMap[gameId] || defaultRarityBase[rarity] || [1, 1];
    const tier = Math.min(4, Math.floor(level / 20));
    const lowerMax1 = rarity === 3 ? 5 : 3;
    const lowerMax2 = 3;

    const progression = rarity === 3
        ? [tier + 1, 1]
        : [[1, 1], [2, 1], [2, 2], [3, 2], [3, 3]][tier];

    const lowerCurrent1 = progression[0];
    const lowerCurrent2 = progression[1];

    let term1 = Math.ceil(base[0] * (lowerCurrent1 / lowerMax1));
    let term2 = base[1] ? Math.ceil(base[1] * (lowerCurrent2 / lowerMax2)) : 0;
    let term3 = (base[2] || 1) + (base.length >= 3 ? refine : 0);

    const gemData = wpn.gem?.gemData;
    if (gemData) {
        const isRarity5 = gemData.templateId === "item_gem_rarity_5";
        const bonus = isRarity5 ? 4 : 2;
        term1 += bonus;
        if (base[1]) term2 += bonus;
        if (gemData.termId && base.length >= 3) {
            term3 += isRarity5 ? 2 : 1;
        }
    }

    if (base.length >= 3) return [term1, term2, term3];
    if (base.length === 2) return [term1, term2];
    return [term1];
}

export function getStaticEquipId(equipData, equipmentNames = {}) {
    if (!equipData) return null;
    const nameToMatch = equipData.name;
    if (!nameToMatch) return null;

    let matched = Object.keys(equipmentNames).find(key => equipmentNames[key]?.name === nameToMatch);
    if (matched) return matched;

    matched = Object.keys(ruEquip).find(key => ruEquip[key]?.name === nameToMatch);
    if (matched) return matched;

    matched = Object.keys(enEquip).find(key => enEquip[key]?.name === nameToMatch);
    if (matched) return matched;

    if (equipment[equipData.id]) return equipData.id;
    return null;
}

export function getEquipTier(equipOrLevel, staticEquipOrRarity) {
    if (!equipOrLevel) return 0;

    if (typeof equipOrLevel === "object") {
        const equip = equipOrLevel;
        if (equip.enhance && typeof equip.enhance === "object") {
            const count = Object.keys(equip.enhance).length;
            if (count > 0) return Math.min(3, count);
        }
        if (equip.enhanceStatus !== undefined && equip.enhanceStatus !== null) {
            return Math.max(0, Math.min(3, Number(equip.enhanceStatus) - 1));
        }
        return 0;
    }

    const val = Number.parseInt(String(equipOrLevel).replace("equip_level_", ""), 10) || 0;
    const r = Number(staticEquipOrRarity) || 4;
    if (r < 5) return 0;
    if (val >= 70) return 3;
    if (val >= 50) return 2;
    if (val >= 36) return 1;
    return 0;
}

export function getEquipRarity(equip, staticEquip) {
    if (staticEquip?.rarity) return Number(staticEquip.rarity);
    const key = equip?.equipData?.rarity?.key || "";
    const match = key.match(/equip_rarity_(\d+)/);
    if (match) return Number.parseInt(match[1], 10);
    const val = Number(equip?.equipData?.rarity?.value || equip?.rarity);
    return Number.isNaN(val) ? 4 : val;
}

export function getPropertyLabel(propKey) {
    if (!propKey) return "Stat";
    const rawKey = propKey.replace("equip_attr_", "").replace("equip_", "");
    const lowerKey = rawKey.toLowerCase();

    const mappings = {
        "wisd": "Wisdom",
        "str": "Strength",
        "agi": "Agility",
        "will": "Willpower",
        "def": "Defense",
        "maxhp": "HP",
        "hp": "HP",
        "ultimate_sp_gain_scalar": "SP Gain",
        "atk": "Attack",
        "ultimate_sp_gain": "SP Gain",
        "heal_scalar": "Healing",
        "spell_vulnerable": "Vulnerability",
        "physical_damage_increase": "Physical DMG Dealt",
        "cryst_and_pulse_damage_increase": "Crystal/Pulse DMG Increase",
        "normal_attack_damage_increase": "Normal Attack DMG Increase",
        "sub": "Sub Attribute"
    };

    for (const [k, v] of Object.entries(mappings)) {
        if (lowerKey === k || lowerKey.includes(k)) return v;
    }

    return rawKey
        .split("_")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
}

const STAT_ICON_RULES = [
    [["wisd", "int"], "int"],
    [["str"], "str"],
    [["agi"], "agi"],
    [["will"], "will"],
    [["def"], "def"],
    [["maxhp", "hp"], "hp"],
    [["atk"], "atk"],
    [["sp_gain", "usp", "usgs"], "usp"],
    [["heal"], "heal"],
    [["vulnerable", "magicdam"], "magicdam"],
    [["normal_skill_damage"], "normalskillefficiency"],
    [["combo_skill_damage"], "comboskillefficiency"],
    [["normal_attack_damage"], "normalattackdamageincrease"],
    [["physical_damage", "physical", "phy"], "physicaldamageincrease"],
    [["physical_and_spellinfliction", "spellinfliction"], "magicdam"],
    [["cryst_and_pulse_damage", "all_skill_damage", "spell_damage", "sub"], "alldamagetakenscalar"],
    [["crit"], "crirate"]
];

export function getStatIcon(propKey) {
    if (!propKey) return null;
    const key = propKey.toLowerCase();
    const rule = STAT_ICON_RULES.find(([needles]) => needles.some(needle => key.includes(needle)));
    return rule ? rule[1] : null;
}

export function getCultivationLabel(node, lvl) {
    if (!node) return lvl.toString();
    const match = node.name.match(/[αβγ]\s*$/);
    return match ? match[0] : lvl.toString();
}

export function interpolateBlackboard(text, bb) {
    if (!text) return "";
    if (!bb || Object.keys(bb).length === 0) return text;

    return text.replace(/\{([^{}]+)\}/g, (match, content) => {
        let [expr, format] = content.split(":");
        let mathStr = expr.replace(/\b(\d+),(\d+)\b/g, (m, f) => Object.keys(bb)[f] || m);

        for (const key in bb) {
            const regex = new RegExp(String.raw`\b${key}\b`, "g");
            mathStr = mathStr.replace(regex, `(${bb[key]})`);
        }

        if (/[^0-9+\-*/().\s]/.test(mathStr)) return match;

        let result = 0;
        try {
            result = new Function("return " + mathStr)();
        } catch (e) {
            return match;
        }
        if (format) {
            if (format.includes("%")) {
                result = Number.parseFloat((result * 100).toFixed(4)) + "%";
            } else if (format === "0") {
                result = Math.round(result);
            } else {
                result = Number.parseFloat(Number(result).toFixed(4));
            }
        }
        return `<span class="text-[#38BDF8] font-bold drop-shadow-sm">${result}</span>`;
    });
}

export function getTalents(char, detailedChar, staticDetails = null, charLocale = null) {
    const svelteId = getSvelteCharId(char);
    const hasCharData = char?.charData && (char.charData.combatTalents?.length || char.charData.cultivationTalents?.length || char.charData.abilityTalents?.length);
    if (!hasCharData) {
        if (!staticDetails && !charLocale) return [];
        const talents = [];

        for (const idx of [1, 2]) {
            const localeData = charLocale?.skills?.[`talent${idx}`];
            if (localeData && localeData.name) {
                const pNodes = detailedChar?.talent?.latestPassiveSkillNodes || char?.talent?.latestPassiveSkillNodes || [];
                const tNode = pNodes.find(id => id.includes(`passive_skill_${idx - 1}_`));
                const match = tNode?.match(/passive_skill_\d+_(\d+)/);
                const currentLevel = match ? Number.parseInt(match[1], 10) : (detailedChar?.talentLevels?.[`talent${idx}`] || 0);
                const descIndex = Math.max(0, currentLevel - 1);
                let desc = localeData.levels?.[descIndex] || localeData.levels?.[0] || "";
                const bbKey = `talent${idx}_${Math.max(1, currentLevel)}`;
                const blackboard = staticDetails?.blackboard || {};
                const currentBlackboard = blackboard[bbKey] || blackboard[`talent${idx}`] || {};
                desc = interpolateBlackboard(desc, currentBlackboard);
                talents.push({
                    name: localeData.name,
                    iconUrl: "",
                    localImageId: `${svelteId}_talent${idx}`,
                    desc,
                    type: 'combat',
                    currentLevel,
                    levelsCount: localeData.levels?.length || 2
                });
            }
        }

        for (const idx of [1, 2]) {
            const localeData = charLocale?.skills?.[`baseSkill${idx}`];
            if (localeData && localeData.name) {
                const fNodes = detailedChar?.talent?.latestFactorySkillNodes || detailedChar?.talent?.latestSpaceshipSkillNodes || char?.talent?.latestFactorySkillNodes || char?.talent?.latestSpaceshipSkillNodes || [];
                const fNode = fNodes.find(id => id.includes(`_${idx - 1}_`) || id.includes(`_${idx}_`) || (idx === 1 && id.endsWith('_a')) || (idx === 2 && id.endsWith('_b')));
                let currentLevel = 0;
                if (fNode) {
                    const m = fNode.match(/_(\d+)$/);
                    currentLevel = m ? Number.parseInt(m[1], 10) : 1;
                }
                if (detailedChar?.talentLevels?.[`baseSkill${idx}`] !== undefined) {
                    currentLevel = detailedChar.talentLevels[`baseSkill${idx}`];
                }
                const facSkillKey = `facSkill${idx}_${Math.max(1, currentLevel)}`;
                const localImageId = staticDetails?.facSkills?.[facSkillKey]?.name || "";
                const postfix = staticDetails?.facSkills?.[facSkillKey]?.skillNamePostfix || "";
                const finalName = postfix ? `${localeData.name} ${postfix}` : localeData.name;
                const descIndex = Math.max(0, currentLevel - 1);
                let desc = localeData.levels?.[descIndex] || localeData.levels?.[0] || "";
                const bbKey = `baseSkill${idx}_${Math.max(1, currentLevel)}`;
                const blackboard = staticDetails?.blackboard || {};
                const currentBlackboard = blackboard[bbKey] || blackboard[`baseSkill${idx}`] || {};
                desc = interpolateBlackboard(desc, currentBlackboard);
                talents.push({
                    name: finalName,
                    iconUrl: "",
                    localImageId,
                    desc,
                    type: 'cultivation',
                    currentLevel,
                    levelsCount: localeData.levels?.length || 2
                });
            }
        }

        const localeData = charLocale?.skills?.indicator;
        if (localeData) {
            const attrNodes = new Set(detailedChar?.talent?.attrNodes || char?.talent?.attrNodes || []);
            const charStatic = characters[svelteId] || Object.values(characters).find(c => c.id === svelteId || c.gameId === svelteId || c.apiId === svelteId);
            const charPrefix = (charStatic?.gameId || svelteId).replace(/m$|f$/, "");
            let activeNodesCount = 0;
            let totalValue = 0;
            const levels = localeData.levels || [];
            attrNodes.forEach(nodeId => {
                if ((nodeId.includes('endmin') && svelteId.includes('endministrator')) || (charPrefix && nodeId.includes(charPrefix)) || (svelteId && nodeId.includes(svelteId))) {
                    activeNodesCount++;
                }
            });
            for (let i = 0; i < Math.min(activeNodesCount, levels.length); i++) {
                const match = levels[i]?.match(/\+(\d+)/);
                if (match) totalValue += Number.parseInt(match[1], 10);
            }
            const activeLevel = activeNodesCount > 0 ? activeNodesCount : 1;
            let description = levels[Math.max(0, activeNodesCount - 1)] || levels[0] || "";
            const bbKey = `indicator_${activeLevel}`;
            const blackboard = staticDetails?.blackboard || {};
            const currentBlackboard = blackboard[bbKey] || blackboard?.indicator || {};
            description = interpolateBlackboard(description, currentBlackboard);
            description = description.replace(/([-+]\s*)\d+(?:\.\d+)?/, `$1${totalValue}`);

            const attrType = staticDetails?.indicatorType || staticDetails?.mainAttribute || "str";
            const localImageId = `icon_attribute_${attrType}`;
            talents.push({
                name: localeData.name || "Ability",
                iconUrl: "",
                localImageId,
                desc: description,
                type: 'ability',
                totalValue,
                activeCount: activeNodesCount,
                levelsCount: levels.length || 4
            });
        }

        return talents;
    }
    const combatNodes = char.charData.combatTalents || [];
    const groupedCombat = {};
    combatNodes.forEach(node => {
        if (!groupedCombat[node.name]) {
            groupedCombat[node.name] = [];
        }
        groupedCombat[node.name].push(node);
    });
    
    const talents = [];
    const combatList = [];
    Object.entries(groupedCombat).forEach(([name, nodes]) => {
        nodes.sort((a, b) => a.id.localeCompare(b.id));
        const levelsCount = nodes.length;
        
        let talentIdx = 0;
        const match = nodes[0]?.id?.match(/passive_skill_(\d+)_/);
        if (match) {
            talentIdx = Number.parseInt(match[1], 10);
        }
        const currentIdx = talentIdx + 1;
        
        const talentKey = `talent${currentIdx}`;
        const currentLevel = detailedChar?.talentLevels?.[talentKey] || 0;
        
        const nodeData = nodes[currentLevel > 0 ? currentLevel - 1 : 0] || {};
        
        const talentKeyName = `talent${currentIdx}`;
        const localeData = charLocale?.skills?.[talentKeyName];
        const localizedName = localeData?.name || nodeData.name;
        let desc = nodeData.desc;
        if (localeData?.levels) {
            const descIndex = Math.max(0, currentLevel - 1);
            desc = localeData.levels[descIndex] || localeData.levels[0] || desc;
        }
        const bbKey = `${talentKeyName}_${Math.max(1, currentLevel)}`;
        const blackboard = staticDetails?.blackboard || {};
        const currentBlackboard = blackboard[bbKey] || blackboard[talentKeyName] || {};
        desc = interpolateBlackboard(desc, currentBlackboard);

        combatList.push({
            idx: currentIdx,
            data: {
                name: localizedName,
                iconUrl: nodeData.iconUrl,
                localImageId: `${svelteId}_talent${currentIdx}`,
                desc: desc,
                descParams: nodeData.descParams,
                type: 'combat',
                currentLevel,
                levelsCount
            }
        });
    });
    combatList.sort((a, b) => a.idx - b.idx);
    combatList.forEach(item => talents.push(item.data));

    const cultNodes = char.charData.cultivationTalents || [];
    const groupedCult = {};
    cultNodes.forEach(node => {
        const baseName = node.name.replace(/[αβγ]\s*$/, "").trim();
        if (!groupedCult[baseName]) {
            groupedCult[baseName] = [];
        }
        groupedCult[baseName].push(node);
    });

    const cultList = [];
    Object.entries(groupedCult).forEach(([baseName, nodes]) => {
        nodes.sort((a, b) => a.id.localeCompare(b.id));
        const levelsCount = nodes.length;

        let skillIdx = 1;
        const fallbackNode = nodes[0] || {};
        if (fallbackNode.id) {
            const parts = fallbackNode.id.split('_');
            if (parts.length >= 2) {
                const parsedIdx = Number.parseInt(parts[parts.length - 2], 10);
                if (!Number.isNaN(parsedIdx)) {
                    skillIdx = parsedIdx;
                }
            }
        }

        const baseKey = `baseSkill${skillIdx}`;
        const currentLevel = detailedChar?.talentLevels?.[baseKey] || 0;

        const nodeData = nodes[currentLevel > 0 ? currentLevel - 1 : 0] || {};
        let localImageId = "";
        if (nodeData.id) {
            const parts = nodeData.id.split('_');
            if (parts.length >= 2) {
                const levelIdx = parts[parts.length - 1];
                const facSkillKey = `facSkill${skillIdx}_${levelIdx}`;
                localImageId = staticDetails?.facSkills?.[facSkillKey]?.name || "";
            }
        }

        const baseKeyPrefix = `baseSkill${skillIdx}`;
        const localeData = charLocale?.skills?.[baseKeyPrefix];
        const localizedName = localeData?.name || nodeData.name;
        
        const greekMatch = nodeData.name.match(/[αβγ]\s*$/);
        let finalName = localizedName;
        if (greekMatch && !finalName.match(/[αβγ]\s*$/)) {
            finalName = `${finalName} ${greekMatch[0]}`;
        }

        let desc = nodeData.desc;
        if (localeData?.levels) {
            const descIndex = Math.max(0, currentLevel - 1);
            desc = localeData.levels[descIndex] || localeData.levels[0] || desc;
        }
        const bbKey = `${baseKeyPrefix}_${Math.max(1, currentLevel)}`;
        const blackboard = staticDetails?.blackboard || {};
        const currentBlackboard = blackboard[bbKey] || blackboard[baseKeyPrefix] || {};
        desc = interpolateBlackboard(desc, currentBlackboard);

        cultList.push({
            idx: skillIdx,
            data: {
                name: finalName,
                iconUrl: nodeData.iconUrl,
                localImageId: localImageId,
                desc: desc,
                descParams: nodeData.descParams,
                type: 'cultivation',
                currentLevel,
                levelsCount,
                nodes
            }
        });
    });
    cultList.sort((a, b) => a.idx - b.idx);
    cultList.forEach(item => talents.push(item.data));

    const abilityNodes = char.charData.abilityTalents || [];
    if (abilityNodes.length > 0) {
        const attrNodes = new Set(detailedChar?.talent?.attrNodes || char.talent?.attrNodes || []);
        const hasNode = (nodeId) => {
            if (attrNodes.has(nodeId)) return true;
            if (nodeId.includes('endmin')) {
                const suffix = nodeId.split('_').pop();
                return Array.from(attrNodes).some(attrId => attrId.includes('endmin') && attrId.endsWith('_' + suffix));
            }
            return false;
        };
        let totalValue = 0;
        let activeNodesCount = 0;
        
        abilityNodes.forEach(node => {
            if (hasNode(node.id)) {
                activeNodesCount++;
                const valMatch = node.desc?.match(/\+(\d+)/);
                if (valMatch) {
                    totalValue += Number.parseInt(valMatch[1], 10);
                }
            }
        });

        const firstNode = abilityNodes[0] || {};
        let description = firstNode.desc || "";
        if (activeNodesCount > 0) {
            const activeNodeList = abilityNodes.filter(n => hasNode(n.id));
            activeNodeList.sort((a, b) => a.id.localeCompare(b.id));
            const highestActive = activeNodeList[activeNodeList.length - 1];
            if (highestActive) {
                description = highestActive.desc || "";
            }
        }

        const localeData = charLocale?.skills?.indicator;
        const localizedName = localeData?.name || firstNode.name || "Ability";
        if (localeData?.levels) {
            const activeLevel = activeNodesCount > 0 ? activeNodesCount : 1;
            description = localeData.levels[activeLevel - 1] || localeData.levels[0] || description;
        }

        const activeLevel = activeNodesCount > 0 ? activeNodesCount : 1;
        const bbKey = `indicator_${activeLevel}`;
        const blackboard = staticDetails?.blackboard || {};
        const currentBlackboard = blackboard[bbKey] || blackboard?.indicator || {};
        description = interpolateBlackboard(description, currentBlackboard);

        description = description.replace(/([-+]\s*)\d+(?:\.\d+)?/, `$1${totalValue}`);

        const getAttributeType = (desc) => {
            if (!desc) return "str";
            const d = desc.toLowerCase();
            if (d.includes("ловкост") || d.includes("agility") || d.includes("agi")) return "agi";
            if (d.includes("интеллект") || d.includes("wisdom") || d.includes("intellect") || d.includes("wisd") || d.includes("int")) return "wisd";
            if (d.includes("сила") || d.includes("strength") || d.includes("str")) return "str";
            if (d.includes("воля") || d.includes("willpower") || d.includes("will")) return "will";
            if (d.includes("hp") || d.includes("здоровье") || d.includes("хп")) return "maxHp";
            if (d.includes("def") || d.includes("защит")) return "def";
            return "str";
        };

        const attrType = getAttributeType(firstNode.desc || firstNode.name || "");
        const localImageId = `icon_attribute_${attrType}`;

        talents.push({
            name: localizedName,
            iconUrl: firstNode.iconUrl,
            localImageId: localImageId,
            desc: description,
            type: 'ability',
            totalValue: totalValue,
            activeCount: activeNodesCount,
            levelsCount: abilityNodes.length
        });
    }

    return talents;
}

export function getServerLabel(serverId) {
    return serverId === "2" ? "Asia" : "Americas / Europe";
}

import { characters } from "$lib/data/characters.js";
import { weapons } from "$lib/data/weapons.js";
import { equipment } from "$lib/data/items/equipment.js";
import { getImagePath } from "$lib/utils/imageUtils";
import ruEquip from "$lib/locales/ru/equipment.json";
import enEquip from "$lib/locales/en/equipment.json";
import { interpolateBlackboard } from "./blackboardUtils";
import {
    charOrderMap,
    getSvelteCharId,
    mapProfessionToClass,
    mapPropertyToElement,
    getOperatorData,
    getWeaponData
} from "./operatorUtils";

export {
    charOrderMap,
    getSvelteCharId,
    mapProfessionToClass,
    mapPropertyToElement,
    getOperatorData,
    getWeaponData
};

export { interpolateBlackboard };

export function getWeaponIcon(weapon: any): string {
    if (!weapon) return "";
    const mapped = getWeaponData(weapon);
    const wpnId = mapped?.id || weapon.id;
    if (wpnId) {
        return getImagePath(wpnId, "weapon-icon");
    }
    return weapon.icon || "";
}

const SKILL_ALIASES: Record<string, string[]> = {
    attr_str: ["strength", "сила", "str"],
    attr_atk: ["attack", "atk", "атака"],
    attr_will: ["will", "воля"],
    attr_wisd: ["intellect", "wisd", "интеллект"],
    attr_agi: ["agility", "agi", "ловкость"],
    attr_hp: ["hp", "оз", "хп"],
    attr_magicdam: ["arts dmg", "magicdam", "маг. урон", "magic dmg", "arts damage", "урон от искусств"],
    attr_naturaldam: ["nature dmg", "naturaldam", "урон природы", "nature damage"],
    attr_pulsedam: ["electric dmg", "pulsedam", "pulse dmg", "элек. урон", "электрический урон"],
    attr_physpell: ["arts intensity", "physpell", "интенсивность искусств", "физ. заклинания"],
    attr_phydam: ["physical dmg", "phydam", "физ. урон", "physical damage"],
    attr_firedam: ["heat dmg", "firedam", "урон теплом", "огненный урон"],
    attr_icedam: ["cryo dmg", "icedam", "урон холодом", "ледяной урон"],
    attr_usp: ["ult efficiency", "usp", "эффективность ульты"],
    attr_heal: ["treatment efficiency", "эффективность лечения"],
    attr_main: ["main attribute", "основной атрибут"],
    attr_crirate: ["critical rate", "crirate", "шанс крит. удара", "крит. шанс"],
    break: ["brutality", "break", "сокрушение", "брейк"],
    burst: ["detonate", "burst", "детонация", "взрыв", "берст"],
    combo: ["pursuit", "combo", "преследование", "комбо"],
    crit: ["fracture", "crit", "разлом", "крит"],
    force: ["assault", "force", "натиск"],
    heal: ["medicant", "heal", "лекарь", "лечение", "исцеление"],
    keyword: ["efficacy", "keyword", "действенность", "эффективность"],
    magabn: ["infliction", "magabn", "наложение", "аномалия"],
    phyabn: ["combative", "phyabn", "боевой"],
    smash: ["crusher", "smash", "сокрушитель"],
    spirit: ["inspiring", "spirit", "воодушевление", "дух"],
    tacafter: ["flow", "tacafter", "течение", "поток"],
    tactic: ["suppression", "tactic", "tactics", "подавление", "тактика"],
    ult: ["twilight", "ult", "ultimate", "сумерки", "ульта", "абсолютный навык"]
};

function termMatchesSkill(t: any, skillId: string): boolean {
    if (!t || !skillId) return false;
    const tid = String(t.id || "").toLowerCase().trim();
    const tname = String(t.name || "").toLowerCase().trim();
    const sid = String(skillId).toLowerCase().trim();

    const cleanTid = tid.replace(/^(gat_passive_|gst_passive_|term_|attr_)/, "");
    const cleanSid = sid.replace(/^(gat_passive_|gst_passive_|term_|attr_)/, "");
    if (cleanTid && cleanSid && cleanTid === cleanSid) {
        return true;
    }

    const aliases = SKILL_ALIASES[sid] || [cleanSid];
    for (const a of aliases) {
        if (tname === a || (a.length >= 4 && tname.includes(a))) {
            return true;
        }
        if (tid === a || (a.length >= 4 && tid.includes(a))) {
            return true;
        }
    }
    return false;
}

export function getWeaponTerms(wpn: any): number[] {
    if (!wpn) return [];
    if (Array.isArray(wpn.weaponTerms) && wpn.weaponTerms.length > 0) {
        return wpn.weaponTerms;
    }
    if (Array.isArray(wpn.skills) && wpn.skills.length > 0 && wpn.skills.every((s: any) => typeof s === 'number' || typeof s?.level === 'number')) {
        return wpn.skills.map((s: any) => typeof s === 'number' ? s : s.level);
    }

    const refine = Number(wpn.refineLevel) || 0;
    const wpnStatic = getWeaponData(wpn);
    const rarity = Number(wpnStatic?.rarity || wpn.rarity || 4);
    const level = Number(wpn.level) || 1;
    const skillKeys = wpnStatic?.skills || [];

    let bt = wpn.breakthroughLevel;
    if (bt === undefined || bt === null) {
        if (level >= 80) bt = 4;
        else if (level >= 60) bt = level > 60 ? 3 : 2;
        else if (level >= 40) bt = level > 40 ? 2 : 1;
        else if (level >= 20) bt = level > 20 ? 1 : 0;
        else bt = 0;
    }

    let baseTerms: number[];
    let upperBounds: number[];
    if (rarity === 3) {
        const s1 = bt === 4 ? 5 : bt === 3 ? 4 : bt === 2 ? 3 : bt === 1 ? 2 : 1;
        const u1 = bt === 4 ? 9 : bt === 3 ? 8 : bt === 2 ? 6 : bt === 1 ? 5 : 3;
        const s2 = 1 + refine;
        const u2 = Math.min(9, 4 + refine);
        baseTerms = [s1, s2];
        upperBounds = [u1, u2];
    } else {
        const s1 = bt >= 3 ? 3 : bt >= 1 ? 2 : 1;
        const u1 = bt === 4 ? 9 : bt === 3 ? 8 : bt === 2 ? 6 : bt === 1 ? 5 : 3;
        const s2 = bt >= 4 ? 3 : bt >= 2 ? 2 : 1;
        const u2 = bt === 4 ? 9 : bt === 3 ? 7 : bt === 2 ? 6 : bt === 1 ? 4 : 3;
        const s3 = 1 + refine;
        const u3 = Math.min(9, 4 + refine);
        baseTerms = [s1, s2, s3];
        upperBounds = [u1, u2, u3];
    }

    const gem = wpn.gem;
    if (gem) {
        const gemTerms = gem.terms || gem.skills || gem.gemData?.terms || wpn.terms;
        if (Array.isArray(gemTerms) && gemTerms.length > 0) {
            return baseTerms.map((baseVal, idx) => {
                const skillId = skillKeys[idx];
                let bonus = 0;
                const found = skillId
                    ? gemTerms.find((t: any) => termMatchesSkill(t, skillId))
                    : null;
                if (found) {
                    bonus = Number(found.cost ?? found.level ?? found.value ?? 0) || 0;
                }
                const upper = upperBounds[idx] || 9;
                return Math.min(upper, Math.max(1, baseVal + bonus));
            });
        }

        const gemTemplate = gem.gemData?.templateId || gem.templateId || gem.presetId || gem.gemData?.name || "";
        const parsedRarity = parseInt(gemTemplate.replace(/[^0-9]/g, "").slice(-1)) || Number(gem.gemData?.rarity || gem.rarity) || 5;
        const s1Bonus = parsedRarity >= 5 ? 3 : parsedRarity === 4 ? 2 : 1;

        return baseTerms.map((baseVal, idx) => {
            const isPassive = rarity === 3 ? idx === 1 : idx === 2;
            const bonus = (idx === 0 && !isPassive) ? s1Bonus : 0;
            const upper = upperBounds[idx] || 9;
            return Math.min(upper, Math.max(1, baseVal + bonus));
        });
    }

    return baseTerms.map((v, idx) => Math.min(upperBounds[idx] || 9, Math.max(1, v)));
}

export function getStaticEquipId(equipData: any, equipmentNames: Record<string, any> = {}): string | null {
    if (!equipData) return null;
    const nameToMatch = equipData.name;
    if (!nameToMatch) return null;

    let matched = Object.keys(equipmentNames).find(key => equipmentNames[key]?.name === nameToMatch);
    if (matched) return matched;

    matched = Object.keys(ruEquip).find(key => (ruEquip as Record<string, any>)[key]?.name === nameToMatch);
    if (matched) return matched;

    matched = Object.keys(enEquip).find(key => (enEquip as Record<string, any>)[key]?.name === nameToMatch);
    if (matched) return matched;

    if ((equipment as Record<string, any>)[equipData.id]) return equipData.id;
    return null;
}

export function getEquipTier(equipOrLevel: any, staticEquipOrRarity?: any): number {
    if (!equipOrLevel) return 0;

    if (typeof equipOrLevel === "object") {
        const equip = equipOrLevel;
        if (equip.enhance && typeof equip.enhance === "object") {
            const count = Object.keys(equip.enhance).length;
            if (count > 0) return Math.min(3, count);
        }
        if (equip.enhanceStatus !== undefined && equip.enhanceStatus !== null) {
            const status = Number(equip.enhanceStatus);
            if (status >= 3) return 3;
            if (status === 2) return 1;
            return 0;
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

export function getEquipRarity(equip: any, staticEquip: any): number {
    if (staticEquip?.rarity) return Number(staticEquip.rarity);
    const key = equip?.equipData?.rarity?.key || "";
    const match = key.match(/equip_rarity_(\d+)/);
    if (match) return Number.parseInt(match[1], 10);
    const val = Number(equip?.equipData?.rarity?.value || equip?.rarity);
    return Number.isNaN(val) ? 4 : val;
}

export function getPropertyLabel(propKey: string): string {
    if (!propKey) return "Stat";
    const rawKey = propKey.replace("equip_attr_", "").replace("equip_", "");
    const lowerKey = rawKey.toLowerCase();

    const mappings: Record<string, string> = {
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

const STAT_ICON_RULES: [string[], string][] = [
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

export function getStatIcon(propKey: string): string | null {
    if (!propKey) return null;
    const key = propKey.toLowerCase();
    const rule = STAT_ICON_RULES.find(([needles]) => needles.some(needle => key.includes(needle)));
    return rule ? rule[1] : null;
}

export function getCultivationLabel(node: any, lvl: number | string): string {
    if (!node) return lvl.toString();
    const match = node.name.match(/[αβγ]\s*$/);
    return match ? match[0] : lvl.toString();
}

export function getTalents(char: any, detailedChar: any, staticDetails: any = null, charLocale: any = null): any[] {
    const svelteId = getSvelteCharId(char);
    const hasCharData = char?.charData && (char.charData.combatTalents?.length || char.charData.cultivationTalents?.length || char.charData.abilityTalents?.length);
    if (!hasCharData) {
        if (!staticDetails && !charLocale) return [];
        const talents: any[] = [];

        for (const idx of [1, 2]) {
            const localeData = charLocale?.skills?.[`talent${idx}`];
            if (localeData && localeData.name) {
                const pNodes = detailedChar?.talent?.latestPassiveSkillNodes || char?.talent?.latestPassiveSkillNodes || [];
                const tNode = pNodes.find((id: string) => id.includes(`passive_skill_${idx - 1}_`));
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
                const fNode = fNodes.find((id: string) => id.includes(`_${idx - 1}_`) || id.includes(`_${idx}_`) || (idx === 1 && id.endsWith('_a')) || (idx === 2 && id.endsWith('_b')));
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
            const charStatic = (characters as Record<string, any>)[svelteId] || Object.values(characters).find((c: any) => c.id === svelteId || c.gameId === svelteId || c.apiId === svelteId);
            const charPrefix = (charStatic?.gameId || svelteId).replace(/m$|f$/, "");
            let activeNodesCount = 0;
            let totalValue = 0;
            const levels = localeData.levels || [];
            attrNodes.forEach(nodeId => {
                const nId = String(nodeId);
                if ((nId.includes('endmin') && svelteId.includes('endministrator')) || (charPrefix && nId.includes(charPrefix)) || (svelteId && nId.includes(svelteId))) {
                    activeNodesCount++;
                }
            });
            for (let i = 0; i < Math.min(activeNodesCount, levels.length); i++) {
                const match = levels[i]?.match(/(\d+)/);
                if (match) totalValue += Number.parseInt(match[1], 10);
            }
            const activeLevel = activeNodesCount > 0 ? activeNodesCount : 1;
            let description = levels[Math.max(0, activeNodesCount - 1)] || levels[0] || "";
            const bbKey = `indicator_${activeLevel}`;
            const blackboard = staticDetails?.blackboard || {};
            const currentBlackboard = blackboard[bbKey] || blackboard?.indicator || {};
            description = interpolateBlackboard(description, currentBlackboard);
            description = description.replace(/([-+]?\s*)(\d+(?:\.\d+)?)/, `$1${totalValue}`);

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
    const groupedCombat: Record<string, any[]> = {};
    combatNodes.forEach((node: any) => {
        if (!groupedCombat[node.name]) {
            groupedCombat[node.name] = [];
        }
        groupedCombat[node.name].push(node);
    });
    
    const talents: any[] = [];
    const combatList: any[] = [];
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
    const groupedCult: Record<string, any[]> = {};
    cultNodes.forEach((node: any) => {
        const baseName = node.name.replace(/[αβγ]\s*$/, "").trim();
        if (!groupedCult[baseName]) {
            groupedCult[baseName] = [];
        }
        groupedCult[baseName].push(node);
    });

    const cultList: any[] = [];
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
        const hasNode = (nodeId: string) => {
            if (attrNodes.has(nodeId)) return true;
            if (nodeId.includes('endmin')) {
                const suffix = nodeId.split('_').pop();
                return Array.from(attrNodes).some((attrId: any) => String(attrId).includes('endmin') && String(attrId).endsWith('_' + suffix));
            }
            return false;
        };
        let totalValue = 0;
        let activeNodesCount = 0;
        
        abilityNodes.forEach((node: any) => {
            if (hasNode(node.id)) {
                activeNodesCount++;
                const valMatch = node.desc?.match(/(\d+)/);
                if (valMatch) {
                    totalValue += Number.parseInt(valMatch[1], 10);
                }
            }
        });

        const firstNode = abilityNodes[0] || {};
        let description = firstNode.desc || "";
        if (activeNodesCount > 0) {
            const activeNodeList = abilityNodes.filter((n: any) => hasNode(n.id));
            activeNodeList.sort((a: any, b: any) => a.id.localeCompare(b.id));
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

        description = description.replace(/([-+]?\s*)(\d+(?:\.\d+)?)/, `$1${totalValue}`);

        const getAttributeType = (desc: string) => {
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

export function getServerLabel(serverId: string | number | null | undefined): string {
    return serverId === "2" ? "Asia" : "Americas / Europe";
}


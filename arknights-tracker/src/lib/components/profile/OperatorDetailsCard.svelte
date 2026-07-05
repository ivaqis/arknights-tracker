<script>
    import { t } from "$lib/i18n.js";
    import { currentLocale } from "$lib/stores/locale.js";
    import { fade } from "svelte/transition";
    import Icon from "$lib/components/Icon.svelte";
    import Image from "$lib/components/Image.svelte";
    import PotentialIcon from "$lib/components/operators/PotentialIcon.svelte";
    import AscensionIcon from "$lib/components/operators/AscensionIcon.svelte";
    import Tooltip from "$lib/components/Tooltip.svelte";
    import { equipment } from "$lib/data/items/equipment.js";
    import { getImagePath } from "$lib/utils/imageUtils.js";
    import { getRarityColor, getHexColorByElement } from "$lib/utils/colorUtils.js";
    import { parseRichText, hyperlinkAction } from "$lib/utils/richText.js";

    const localeModules = {
        en: import.meta.glob("/src/lib/locales/en/equipment.json"),
        ru: import.meta.glob("/src/lib/locales/ru/equipment.json"),
        de: import.meta.glob("/src/lib/locales/de/equipment.json"),
        es: import.meta.glob("/src/lib/locales/es/equipment.json"),
        fr: import.meta.glob("/src/lib/locales/fr/equipment.json"),
        id: import.meta.glob("/src/lib/locales/id/equipment.json"),
        it: import.meta.glob("/src/lib/locales/it/equipment.json"),
        ja: import.meta.glob("/src/lib/locales/ja/equipment.json"),
        ko: import.meta.glob("/src/lib/locales/ko/equipment.json"),
        pt: import.meta.glob("/src/lib/locales/pt/equipment.json"),
        th: import.meta.glob("/src/lib/locales/th/equipment.json"),
        vi: import.meta.glob("/src/lib/locales/vi/equipment.json"),
        zhcn: import.meta.glob("/src/lib/locales/zhcn/equipment.json"),
        zhtw: import.meta.glob("/src/lib/locales/zhtw/equipment.json"),
    };

    let equipLocaleData = {};

    $: loadEquipLocale($currentLocale);
    $: curLabel = $currentLocale === 'ru' ? 'текущ.' : 'current';

    async function loadEquipLocale(lang) {
        lang = lang || "en";
        const safeLang = lang.toLowerCase().replace("-", "");
        const localePath = `/src/lib/locales/${safeLang}/equipment.json`;
        const fallbackPath = `/src/lib/locales/en/equipment.json`;

        let localeLoader = localeModules[safeLang]?.[localePath];
        if (!localeLoader && safeLang !== "en") {
            localeLoader = localeModules["en"]?.[fallbackPath];
        }

        if (localeLoader) {
            const mod = await localeLoader();
            equipLocaleData = mod.default || mod;
        } else {
            equipLocaleData = {};
        }
    }

    function interpolateBlackboard(text, bb) {
        if (!text) return "";
        if (!bb || Object.keys(bb).length === 0) return text;

        return text.replace(/\{([^}]+)\}/g, (match, content) => {
            let [expr, format] = content.split(":");
            let mathStr = expr.replace(/\b(\d+),(\d+)\b/g, (m, f) => Object.keys(bb)[f] || m);

            for (const key in bb) {
                const regex = new RegExp(`\\b${key}\\b`, "g");
                mathStr = mathStr.replace(regex, `(${bb[key]})`);
            }

            if (/[a-zA-Z_]/.test(mathStr)) return match;

            let result = 0;
            try {
                result = new Function("return " + mathStr)();
            } catch (e) {
                return match;
            }
            if (format) {
                if (format.includes("%")) {
                    result = parseFloat((result * 100).toFixed(2)) + "%";
                } else if (format === "0") {
                    result = Math.round(result);
                } else {
                    result = parseFloat(Number(result).toFixed(2));
                }
            }
            return `<span class="text-[#38BDF8] font-bold drop-shadow-sm">${result}</span>`;
        });
    }

    function tOrFallback(key, fallback) {
        const translated = $t(key);
        if (typeof translated === "object") return fallback;
        return translated === key ? fallback : translated;
    }

    export let selectedChar;
    export let detailedChar;
    export let opData;
    export let targetCharData;
    export let elementColor;
    export let svelteId;
    export let talentsList;
    export let getWeaponData;
    export let getWeaponIcon;
    export let getStaticEquipId;
    export let getEquipRarity;
    export let getEquipTier;
    export let getStatIcon;
    export let charDetails = null;
    export let charLocale = null;
    export let weaponDetails = null;

    function getEquipName(staticId, fallbackName) {
        if (!staticId) return fallbackName || "";
        const transKey = `equipment.${staticId}`;
        const trans = $t(transKey);
        if (trans && trans !== transKey) return trans;
        return fallbackName || staticId;
    }

    function getSkillDescription(skillKey, skillLvl) {
        const skillData = charLocale?.skills?.[skillKey] || {};
        let text = skillData.description;
        if (!text) {
            const skillMeta = Array.isArray(targetCharData?.skills) 
                ? targetCharData.skills.find(s => s.key === skillKey || s.id?.includes(skillKey)) 
                : targetCharData?.skills?.[skillKey];
            text = skillMeta?.desc || skillMeta?.description || "";
        }
        if (!text) return "";

        const skillValues = charDetails?.skills?.[skillKey] || {};
        const blackboard = charDetails?.blackboard || {};

        text = text.replace(
            /\{(-?[a-zA-Z0-9_\.]+)(?::([^}]+))?\}/g,
            (match, rawKey, format) => {
                const isNegative = rawKey.startsWith("-");
                const cleanKey = isNegative ? rawKey.substring(1) : rawKey;
                const lowerKey = cleanKey.toLowerCase();

                let foundRaw = null;
                if (skillValues) {
                    const fk = Object.keys(skillValues).find(
                        (k) => k.toLowerCase() === lowerKey,
                    );
                    if (fk) foundRaw = skillValues[fk];
                }
                if (foundRaw === null || foundRaw === undefined) {
                    if (blackboard) {
                        for (const subSkill of Object.values(blackboard)) {
                            if (subSkill && typeof subSkill === "object") {
                                const fk = Object.keys(subSkill).find(
                                    (k) => k.toLowerCase() === lowerKey,
                                );
                                if (fk) {
                                    foundRaw = subSkill[fk];
                                    break;
                                }
                            }
                        }
                    }
                }
                if (foundRaw === null || foundRaw === undefined) return match;
                let num = 0;
                let isPercentData = false;
                if (
                    typeof foundRaw === "object" &&
                    !Array.isArray(foundRaw) &&
                    Array.isArray(foundRaw.data)
                ) {
                    const idx = Math.min(skillLvl - 1, foundRaw.data.length - 1);
                    num = parseFloat(foundRaw.data[idx]);
                    if (foundRaw.dataType === "percent") isPercentData = true;
                } else if (Array.isArray(foundRaw)) {
                    const idx = Math.min(skillLvl - 1, foundRaw.length - 1);
                    num = parseFloat(foundRaw[idx]);
                } else {
                    num = parseFloat(foundRaw);
                }
                if (isNaN(num)) return match;
                if (isNegative) num = -num;
                let result = num;
                if (format) {
                    if (format.includes("%"))
                        result = Math.round(num * 100) + "%";
                    else if (format === "0") result = Math.round(num);
                    else if (format === "0.0") result = num.toFixed(1);
                    else result = parseFloat(num.toFixed(2));
                } else {
                    if (isPercentData)
                        result = parseFloat((num * 100).toFixed(2)) + "%";
                    else result = parseFloat(num.toFixed(2));
                }

                return `<span class="text-[#38BDF8] font-bold drop-shadow-sm">${result}</span>`;
            }
        );

        return text;
    }

    function getGemIcon(gemData) {
        if (!gemData) return "";
        if (gemData.iconId) return gemData.iconId;
        const id = gemData.id || "";
        const match = id.match(/_(\d+)_/);
        if (match) {
            const num = parseInt(match[1], 10);
            return `icon_wpngem_${String(num).padStart(2, '0')}`;
        }
        const fallbackMatch = id.match(/(\d+)/);
        if (fallbackMatch) {
            const num = parseInt(fallbackMatch[1], 10);
            return `icon_wpngem_${String(num).padStart(2, '0')}`;
        }
        return "";
    }

    const DB_PROP_TO_ATTR_TYPE = {
        "equip_attr_def": "Def",
        "equip_attr_maxhp": "MaxHp",
        "equip_attr_atk": "Atk",
        "equip_attr_str": "Str",
        "equip_attr_agi": "Agi",
        "equip_attr_wisd": "Wisd",
        "equip_attr_will": "Will",
        "equip_sub": "Sub",
        "equip_attr_normal_skill_damage_increase": "NormalSkillEfficiency",
        "equip_attr_combo_skill_damage_increase": "ComboSkillEfficiency",
        "equip_attr_normal_attack_damage_increase": "NormalAttackDamageIncrease",
        "equip_attr_ultimate_sp_gain_scalar": "UltimateSpGainScalar",
        "equip_attr_ultimate_sp_gain": "UltimateSpGain",
        "equip_attr_cryst_and_pulse_damage_increase": "CrystAndPulseDamageIncrease",
        "equip_attr_physical_damage_increase": "PhysicalDamageIncrease",
        "equip_all_skill_damage_increase": "AllSkillDamageIncrease",
        "equip_spell_damage_increase": "SpellDamageIncrease",
        "equip_attr_physical_and_spellinfliction_enhance": "OriginiumArts",
        "equip_attr_physical_and_spellInfliction_enhance": "OriginiumArts",
        "equip_attr_heal_scalar": "HealScalar",
        "equip_attr_spell_vulnerable": "SpellVulnerable"
    };

    function matchDisplayAttr(propKey, displayAttrs) {
        if (!propKey || !displayAttrs) return null;
        const lowerProp = propKey.toLowerCase();
        
        const targetType = DB_PROP_TO_ATTR_TYPE[propKey] || DB_PROP_TO_ATTR_TYPE[lowerProp];
        if (targetType) {
            const found = displayAttrs.find(a => a.attrType === targetType || a.attrType.toLowerCase() === targetType.toLowerCase());
            if (found) return found;
        }
        
        const cleanProp = lowerProp.replace("equip_attr_", "").replace("equip_", "").replace("_increase", "").replace(/_/g, "");
        let match = displayAttrs.find(a => {
            const cleanAttr = a.attrType.toLowerCase().replace(/_/g, "");
            return cleanAttr === cleanProp || cleanAttr.includes(cleanProp) || cleanProp.includes(cleanAttr);
        });
        if (match) return match;
        
        return displayAttrs.find(a => {
            const cleanAttr = a.attrType.toLowerCase();
            return lowerProp.includes(cleanAttr) || cleanAttr.includes(cleanProp);
        });
    }

    function getPrimaryAttrIcon(charClass) {
        const cls = charClass?.toLowerCase() || "";
        if (cls.includes("caster") || cls.includes("supporter")) return "int";
        if (cls.includes("specialist") || cls.includes("recon")) return "agi";
        if (cls.includes("vanguard")) return "will";
        return "str";
    }

    function getWeaponStatLabel(statKey) {
        if (!statKey) return "";
        const sKey = statKey.toLowerCase();
        if (sKey === "baseatk") {
            return $t("stats.baseAtk") || "Base ATK";
        }
        const mappings = {
            "str": "equipSkills.Str",
            "agi": "equipSkills.Agi",
            "wisd": "equipSkills.Wisd",
            "will": "equipSkills.Will",
            "atk": "equipSkills.Atk",
            "def": "equipSkills.Def",
            "phy_dmg_up": "equipSkills.PhysicalDamageIncrease",
            "spell_dmg_up": "equipSkills.SpellDamageIncrease",
            "pulse_dmg_up": "equipSkills.PulseDamageIncrease",
            "cryst_dmg_up": "equipSkills.CrystDamageIncrease",
            "fire_dmg_up": "equipSkills.FireDamageIncrease",
            "ice_dmg_up": "equipSkills.CrystDamageIncrease",
            "crit_up": "equipSkills.CriticalRate",
            "hp_up": "equipSkills.MaxHp",
            "shield_up": "equipSkills.Shield",
            "usgs": "equipSkills.UltimateSpGainScalar",
            "primary_attr_up": "equipSkills.Main",
            "second_attr_up": "equipSkills.Sub"
        };

        const transKey = mappings[sKey];
        if (transKey) {
            const trans = $t(transKey);
            if (trans && trans !== transKey) return trans;
        }

        // Substring matching for translation keys
        for (const [k, tKey] of Object.entries(mappings)) {
            if (sKey.includes(k)) {
                const trans = $t(tKey);
                if (trans && trans !== tKey) return trans;
            }
        }

        const englishFallback = {
            "str": "Strength",
            "agi": "Agility",
            "wisd": "Wisdom",
            "will": "Willpower",
            "atk": "Attack",
            "def": "Defense",
            "phy_dmg_up": "Physical DMG Dealt",
            "spell_dmg_up": "Spell DMG Dealt",
            "pulse_dmg_up": "Pulse DMG Dealt",
            "cryst_dmg_up": "Crystal DMG Dealt",
            "fire_dmg_up": "Fire DMG Dealt",
            "ice_dmg_up": "Ice DMG Dealt",
            "crit_up": "Crit Rate",
            "hp_up": "HP",
            "shield_up": "Shield",
            "usgs": "SP Gain",
            "primary_attr_up": "Primary Attribute",
            "second_attr_up": "Secondary Attribute"
        };

        for (const [k, fallbackVal] of Object.entries(englishFallback)) {
            if (sKey.includes(k)) return fallbackVal;
        }

        return statKey
            .split("_")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(" ");
    }

    function getPropertyLabel(propKey) {
        if (!propKey) return "Stat";
        const rawKey = propKey.replace("equip_attr_", "").replace("equip_", "");
        const lowerKey = rawKey.toLowerCase();
        
        // Exact mapping from database keys to existing i18n keys
        const mappings = {
            "wisd": "equipSkills.Wisd",
            "str": "equipSkills.Str",
            "agi": "equipSkills.Agi",
            "will": "equipSkills.Will",
            "def": "equipSkills.Def",
            "maxhp": "equipSkills.MaxHp",
            "hp": "equipSkills.MaxHp",
            "atk": "equipSkills.Atk",
            "ultimate_sp_gain_scalar": "equipSkills.UltimateSpGainScalar",
            "ultimate_sp_gain": "equipSkills.UltimateSpGainScalar",
            "heal_scalar": "equipSkills.HealOutputIncrease",
            "heal_output_increase": "equipSkills.HealOutputIncrease",
            "heal_taken_increase": "equipSkills.HealTakenIncrease",
            "spell_vulnerable": "equipSkills.SpellDamageIncrease",
            "spell_damage_increase": "equipSkills.SpellDamageIncrease",
            "physical_damage_increase": "equipSkills.PhysicalDamageIncrease",
            "cryst_and_pulse_damage_increase": "equipSkills.CrystAndPulseDamageIncrease",
            "normal_attack_damage_increase": "equipSkills.NormalAttackDamageIncrease",
            "normal_skill_damage_increase": "equipSkills.NormalSkillEfficiency",
            "combo_skill_damage_increase": "equipSkills.ComboSkillEfficiency",
            "ultimate_skill_damage_increase": "equipSkills.UltimateSkillEfficiency",
            "critical_damage_increase": "equipSkills.CriticalDamageIncrease",
            "crit_dmg_up": "equipSkills.CriticalDamageIncrease",
            "critical_rate": "equipSkills.CriticalRate",
            "crit_rate": "equipSkills.CriticalRate",
            "crit_up": "equipSkills.CriticalRate",
            "sub": "equipSkills.Sub",
            "main": "equipSkills.Main"
        };

        const transKey = mappings[lowerKey];
        if (transKey) {
            const trans = $t(transKey);
            if (trans && trans !== transKey) return trans;
        }

        // Substring matching for translation keys
        for (const [k, tKey] of Object.entries(mappings)) {
            if (lowerKey.includes(k)) {
                const trans = $t(tKey);
                if (trans && trans !== tKey) return trans;
            }
        }

        // Default English fallback values
        const englishFallback = {
            "wisd": "Wisdom",
            "str": "Strength",
            "agi": "Agility",
            "will": "Willpower",
            "def": "Defense",
            "maxhp": "HP",
            "hp": "HP",
            "atk": "Attack",
            "ultimate_sp_gain": "SP Gain",
            "heal_scalar": "Healing",
            "spell_vulnerable": "Vulnerability",
            "physical_damage_increase": "Physical DMG Dealt",
            "cryst_and_pulse_damage_increase": "Crystal/Pulse DMG Increase",
            "normal_attack_damage_increase": "Normal Attack DMG Increase",
            "normal_skill_damage_increase": "Battle Skill DMG Bonus",
            "combo_skill_damage_increase": "Combo Skill DMG Bonus",
            "ultimate_skill_damage_increase": "Ultimate DMG Bonus",
            "critical_damage_increase": "Critical DMG",
            "critical_rate": "Critical Rate",
            "sub": "Secondary Attribute",
            "main": "Main Attribute"
        };

        for (const [k, fallbackVal] of Object.entries(englishFallback)) {
            if (lowerKey.includes(k)) return fallbackVal;
        }

        return rawKey
            .split("_")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(" ");
    }

    function getWeaponStatsToRender(wpn, wpnStatic, weaponDetails, opClass) {
        if (!wpn) return [];
        let list = [];
        
        let baseAtkVal = 0;
        if (weaponDetails?.levels?.baseAtk) {
            baseAtkVal = weaponDetails.levels.baseAtk[wpn.level - 1] || weaponDetails.levels.baseAtk[0] || 0;
        } else {
            baseAtkVal = Math.round(80 + wpn.level * 2.5);
        }
        list.push({
            key: "baseAtk",
            icon: "atk",
            label: getWeaponStatLabel("baseatk"),
            value: `${baseAtkVal}`
        });

        if (weaponDetails?.blackboard) {
            const refineLevel = wpn.refineLevel !== undefined ? wpn.refineLevel : 0;
            const potSkillIndex = weaponDetails.potSkill || 3;
            
            for (let i = 1; i <= 3; i++) {
                const skillKey = `skill${i}`;
                const bb = weaponDetails.blackboard[skillKey];
                const tiers = weaponDetails.skillLevels?.[skillKey];
                
                if (bb && tiers) {
                    let activeTier = tiers[0];
                    for (const t of tiers) {
                        if (wpn.level >= t.level) activeTier = t;
                    }
                    let rank = activeTier.lower;
                    let upper = activeTier.upper;
                    if (i === potSkillIndex) {
                        rank += refineLevel;
                        upper += refineLevel;
                    }
                    if (rank > upper) rank = upper;
                    if (rank > 9) rank = 9;

                    const bbKeys = Object.keys(bb);
                    const mainKey = bbKeys.find(k => k !== 'duration' && k !== 'duration2' && k !== 'duration3' && k !== 'duration4' && k !== 'max_stack' && k !== 'max_stacks' && k !== 'cd' && k !== 'cd ' && k !== 'lv');
                    
                    if (mainKey) {
                        const values = bb[mainKey];
                        const val = values ? (values[rank - 1] !== undefined ? values[rank - 1] : values[0]) : null;
                        if (val !== null && val !== undefined) {
                            let iconName = getStatIcon(mainKey);
                            if (!iconName) {
                                const kLower = mainKey.toLowerCase();
                                if (kLower.includes("physical") || kLower.includes("phy")) {
                                    iconName = "physicaldamageincrease";
                                } else if (kLower.includes("usgs") || kLower.includes("sp_gain")) {
                                    iconName = "usp";
                                } else if (kLower === "mainattr" || kLower === "primary_attr_up") {
                                    iconName = getPrimaryAttrIcon(opClass);
                                } else {
                                    iconName = "circle";
                                }
                            }
                            
                            let displayVal = "";
                            const num = Number(val);
                            if (!isNaN(num)) {
                                if (Math.abs(num) > 0 && Math.abs(num) < 1) {
                                    displayVal = `${Math.round(num * 1000) / 10}%`;
                                } else {
                                    displayVal = `${Math.round(num)}`;
                                }
                            } else {
                                displayVal = val;
                            }

                            list.push({
                                key: mainKey,
                                icon: iconName,
                                label: getWeaponStatLabel(mainKey),
                                value: displayVal
                            });
                        }
                    }
                }
            }
        } else {
            list.push({ key: "def", icon: "def", label: "DEF", value: `${Math.round(20 + wpn.level * 0.8)}` });
            list.push({ key: "maxhp", icon: "hp", label: "HP", value: `${Math.round(150 + wpn.level * 4)}` });
        }

        return list;
    }

    function getWeaponStatsRanges(wpn, wpnStatic, weaponDetails, opClass) {
        if (!wpn) return [];
        let list = [];

        // Base ATK
        let baseAtkMin = 83;
        let baseAtkMax = 305;
        if (weaponDetails?.levels?.baseAtk && weaponDetails.levels.baseAtk.length > 0) {
            baseAtkMin = weaponDetails.levels.baseAtk[0];
            baseAtkMax = weaponDetails.levels.baseAtk[weaponDetails.levels.baseAtk.length - 1];
        }
        list.push({
            key: "baseAtk",
            icon: "atk",
            label: getWeaponStatLabel("baseatk"),
            range: `${baseAtkMin}-${baseAtkMax}`
        });

        if (weaponDetails?.blackboard) {
            for (let i = 1; i <= 3; i++) {
                const skillKey = `skill${i}`;
                const bb = weaponDetails.blackboard[skillKey];
                if (bb) {
                    const bbKeys = Object.keys(bb);
                    const mainKey = bbKeys.find(k => k !== 'duration' && k !== 'duration2' && k !== 'duration3' && k !== 'duration4' && k !== 'max_stack' && k !== 'max_stacks' && k !== 'cd' && k !== 'cd ' && k !== 'lv');
                    if (mainKey) {
                        const values = bb[mainKey];
                        if (values && values.length > 0) {
                            const minVal = values[0];
                            const maxVal = values[values.length - 1];
                            let iconName = getStatIcon(mainKey);
                            if (!iconName) {
                                const kLower = mainKey.toLowerCase();
                                if (kLower.includes("physical") || kLower.includes("phy")) {
                                    iconName = "physicaldamageincrease";
                                } else if (kLower.includes("usgs") || kLower.includes("sp_gain")) {
                                    iconName = "usp";
                                } else if (kLower === "mainattr" || kLower === "primary_attr_up") {
                                    iconName = getPrimaryAttrIcon(opClass);
                                } else {
                                    iconName = "circle";
                                }
                            }
                            
                            let rangeStr = "";
                            const minNum = Number(minVal);
                            const maxNum = Number(maxVal);
                            if (!isNaN(minNum) && !isNaN(maxNum)) {
                                if (Math.abs(minNum) > 0 && Math.abs(minNum) < 1) {
                                    rangeStr = `${Math.round(minNum * 100)}%-${Math.round(maxNum * 100)}%`;
                                } else {
                                    rangeStr = `${Math.round(minNum)}-${Math.round(maxNum)}`;
                                }
                            } else {
                                rangeStr = `${minVal}-${maxVal}`;
                            }

                            list.push({
                                key: mainKey,
                                icon: iconName,
                                label: getWeaponStatLabel(mainKey),
                                range: rangeStr
                            });
                        }
                    }
                }
            }
        } else {
            list.push({ key: "def", icon: "def", label: "DEF", range: "21-92" });
            list.push({ key: "maxhp", icon: "hp", label: "HP", range: "154-510" });
        }

        return list;
    }

    function getSkillStatLabel(skillKey, key, charLocale, lang = "en") {
        const localized = charLocale?.skills?.[skillKey]?.[skillKey]?.[key];
        if (localized) return localized;

        const tKey = `stats.${key}`;
        const trans = $t(tKey);
        if (trans && trans !== tKey) return trans;

        const statsKeyMap = {
            "hp": "stats.hp",
            "atk": "stats.atk",
            "def": "stats.def",
            "cooldown": "stats.coolDown",
            "cool_down": "stats.coolDown",
            "costvalue": "stats.costValue",
            "cost_value": "stats.costValue"
        };
        const mappedKey = statsKeyMap[key.toLowerCase()];
        if (mappedKey) {
            const mappedTrans = $t(mappedKey);
            if (mappedTrans && mappedTrans !== mappedKey) return mappedTrans;
        }

        return key
            .replace(/([A-Z])/g, ' $1')
            .replace(/([0-9]+)/g, ' $1 ')
            .replace(/_/g, ' ')
            .trim()
            .split(/\s+/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(" ");
    }

    function getSkillStatsList(skillKey, skillLvl, charDetails, charLocale, lang = "en") {
        if (!charDetails || !charDetails.skills || !charDetails.skills[skillKey]) {
            return [];
        }

        const skillValues = charDetails.skills[skillKey];
        const list = [];
        const safeLang = (lang || "en").toLowerCase().replace("-", "");

        for (const [key, valObj] of Object.entries(skillValues)) {
            if (key === "elementType") continue;

            let data = null;
            let isPercent = false;

            if (valObj && typeof valObj === "object" && Array.isArray(valObj.data)) {
                data = valObj.data;
                isPercent = valObj.dataType === "percent";
            } else if (Array.isArray(valObj)) {
                data = valObj;
            }

            if (!data || data.length === 0) continue;

            const currentIdx = Math.min(skillLvl - 1, data.length - 1);
            const currentVal = parseFloat(data[currentIdx]);

            if (isNaN(currentVal)) continue;

            let currentStr = "";
            const isTimeStat = key.toLowerCase().includes("cooldown") || key.toLowerCase() === "cool" || key.toLowerCase().includes("duration");
            const suffix = isTimeStat ? (safeLang === "ru" ? " сек." : "s") : "";

            if (isPercent) {
                const curPct = Math.round(currentVal * 100);
                currentStr = `${curPct}%`;
            } else {
                const curValFormatted = currentVal % 1 === 0 ? currentVal.toString() : currentVal.toFixed(1);
                currentStr = `${curValFormatted}${suffix}`;
            }

            list.push({
                key,
                label: getSkillStatLabel(skillKey, key, charLocale, lang),
                value: currentStr
            });
        }

        return list;
    }
</script>

<div class="w-full overflow-x-auto custom-scrollbar pb-1">
    <div in:fade={{ duration: 200 }} class="w-[950px] h-[447px] mx-auto relative bg-black/30 dark:bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-2xl transition-all duration-300 text-left mt-3 overflow-hidden">
        
        <div class="absolute inset-0 bg-gradient-to-br {elementColor} pointer-events-none z-0 rounded-2xl"></div>
        <div class="absolute left-[-25px] top-2 pointer-events-none z-0 select-none opacity-90" style="width: 50%; height: 100%; transform: scale(1.5); transform-origin: left center;">
            <Image id={opData.id} variant="operator-splash" className="w-full h-full object-contain object-center" />
        </div>

        <div class="relative z-10 grid grid-cols-12 gap-8 items-stretch">
            <div class="col-span-7 relative flex flex-col rounded-xl justify-between">
                <div class="z-10">
                    <div class="flex flex-col gap-2 mb-2">
                        <div class="flex items-start justify-between w-full gap-2">
                            <div class="flex flex-col gap-2 w-full">
                                <div class="flex items-center justify-between w-full">
                                    <div class="flex items-center gap-2">
                                        {#if opData.class}
                                            <Tooltip text={$t(`classes.${opData.class}`)}>
                                                <div class="w-10 h-10 rounded flex items-center justify-center shadow-sm">
                                                    <Icon name={opData.class} class="w-10 h-10 text-white rounded-md" />
                                                </div>
                                            </Tooltip>
                                        {/if}
                                        {#if opData.element}
                                            <Tooltip text={$t(`elements.${opData.element}`)}>
                                                <div class="w-10 h-10 rounded flex items-center justify-center shadow-sm">
                                                    <Icon name={opData.element} class="w-10 h-10 text-white rounded-md" />
                                                </div>
                                            </Tooltip>
                                        {/if}
                                        <h3 class="pl-1 text-3xl font-sdk font-black text-white tracking-tight drop-shadow-xl leading-none" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.85);">
                                            {$t(`characters.${opData.id}`) || opData.name}
                                        </h3>
                                    </div>

                                    <Tooltip text="P{Math.max(1, (selectedChar.potential || 1)) - 1}">
                                        <PotentialIcon pot={Math.max(0, (selectedChar.potential || 1) - 1)} size={50} className="ml-1 pt-2" />
                                    </Tooltip>
                                </div>

                                <div class="flex items-center gap-0 -space-x-2 ml-[-3px]">
                                    {#each Array(opData.rarity || 1) as _}
                                        <Icon name="strokeStar" class="w-10 h-10 text-gray-600 dark:text-white" style="stroke-opacity: 20%" />
                                    {/each}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="flex justify-between items-end mt-auto z-10">
                    <div class="flex flex-row items-end gap-3">
                        <div class="flex flex-col gap-1.5">
                            {#each ["basicAttack", "battleSkill", "comboSkill", "ultimate"] as skillKey, idx}
                                {@const skillMeta = Array.isArray(targetCharData?.skills) ? targetCharData.skills[idx] : targetCharData?.skills?.[skillKey]}
                                {#if skillMeta}
                                    {@const skillLvl = detailedChar?.userSkills?.[skillMeta.id]?.level || 1}
                                    {@const skillImageId = skillKey === "basicAttack" ? (opData?.weapon || "sword") : `${svelteId}_${skillKey}`}
                                    {@const currentElement = skillMeta?.property?.key?.replace("skill_property_", "") || targetCharData?.property?.key?.replace("char_property_", "") || opData?.element || "physical"}
                                    {@const currentColor = getHexColorByElement(currentElement) || "#5E5D5D"}
                                    {@const isUltimate = skillKey === "ultimate"}
                                    {@const skillStats = getSkillStatsList(skillKey, skillLvl, charDetails, charLocale, $currentLocale)}
                                    
                                    <Tooltip>
                                        <div class="flex flex-col items-center group relative cursor-pointer">
                                            <div class="w-14 h-14 shrink-0 flex items-center justify-center relative">
                                                <div
                                                    class="absolute inset-0 rounded-full border-[2.5px] border-transparent"
                                                    style="background: conic-gradient(from 225deg, #d1d5db 270deg, transparent 0deg) border-box;
                                                    mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
                                                    -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
                                                    -webkit-mask-composite: destination-out;
                                                    mask-composite: exclude;"
                                                ></div>
                                                
                                                <div class="w-[82%] h-[82%] rounded-full bg-black/35 relative overflow-hidden flex items-center justify-center border border-white/5 shadow-md">
                                                    {#if isUltimate}
                                                        <div class="absolute inset-0" style="background-color: {currentColor}"></div>
                                                    {:else}
                                                        <div class="absolute inset-0" style="background-color: {currentColor}; clip-path: polygon(50% 50%, -100% 100%, 200% 100%);"></div>
                                                    {/if}
                                                    <div class="relative z-10 w-[85%] h-[85%] flex items-center justify-center">
                                                        <Image id={skillImageId} variant="skill-icon" className="w-full h-full object-contain filter drop-shadow" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div class="flex items-center justify-center select-none mt-[-10px]">
                                                {#if skillLvl >= 10}
                                                    <div class="w-6 h-6 rounded-full bg-black/60 border border-white/10 flex flex-col items-center justify-center scale-95 shadow-md z-10 relative">
                                                        <div class="flex flex-col items-center mt-[-1px]">
                                                            <svg width="7" height="7" viewBox="0 0 24 24"><path d="M12 2L21 7V17L12 22L3 17V7L12 2Z" fill={(skillLvl - 9) > 0 ? "#FFFFFF" : "rgba(255,255,255,0.1)"} stroke={(skillLvl - 9) > 0 ? "#FFFFFF" : "rgba(255,255,255,0.25)"} stroke-width="2.5" /></svg>
                                                            <div class="flex">
                                                                <svg width="7" height="7" viewBox="0 0 24 24"><path d="M12 2L21 7V17L12 22L3 17V7L12 2Z" fill={(skillLvl - 9) > 1 ? "#FFFFFF" : "rgba(255,255,255,0.1)"} stroke={(skillLvl - 9) > 1 ? "#FFFFFF" : "rgba(255,255,255,0.25)"} stroke-width="2.5" /></svg>
                                                                <svg width="7" height="7" viewBox="0 0 24 24"><path d="M12 2L21 7V17L12 22L3 17V7L12 2Z" fill={(skillLvl - 9) > 2 ? "#FFFFFF" : "rgba(255,255,255,0.1)"} stroke={(skillLvl - 9) > 2 ? "#FFFFFF" : "rgba(255,255,255,0.25)"} stroke-width="2.5" /></svg>
                                                            </div>
                                                        </div>
                                                    </div>
                                                {:else}
                                                    <div class="w-6 h-6 rounded-full bg-black/60 border border-white/10 flex items-center justify-center shadow-md z-10 relative">
                                                        <span class="text-xs font-black text-white/90 font-nums mt-[1px]">{skillLvl}</span>
                                                    </div>
                                                {/if}
                                            </div>
                                        </div>
                                        <div slot="content" class="flex flex-col gap-1 text-left max-w-[280px]" use:hyperlinkAction>
                                            <div class="flex items-center gap-1.5 border-b border-white/10 pb-1 mb-1 font-sans">
                                                <span class="px-1.5 py-0.5 bg-white/10 text-white rounded text-[10px] font-bold">
                                                    {$t(`menu.${skillKey}`) || skillKey}
                                                </span>
                                                <span class="font-bold text-[#FFE145]">{charLocale?.skills?.[skillKey]?.name || skillMeta.name || "Skill"}</span>
                                                <span class="text-xs text-gray-400 font-nums">(Lv. {skillLvl})</span>
                                            </div>
                                            <span class="text-xs leading-relaxed text-gray-200">
                                                {@html parseRichText(getSkillDescription(skillKey, skillLvl))}
                                            </span>
                                            {#if skillStats && skillStats.length > 0}
                                                <div class="border-t border-white/10 pt-1.5 mt-1.5 flex flex-col gap-1 select-none">
                                                    {#each skillStats as stat}
                                                        <div class="flex items-center justify-between text-[11px]">
                                                            <span class="text-white/70">{stat.label}</span>
                                                            <span class="font-nums text-[#38BDF8] font-bold">{stat.value}</span>
                                                        </div>
                                                    {/each}
                                                </div>
                                            {/if}
                                        </div>
                                    </Tooltip>
                                {/if}
                            {/each}
                        </div>

                        <div class="flex flex-row items-end gap-3 shrink-0">
                            <div class="flex flex-col items-start select-none justify-end pb-1">
                                <div class="flex items-baseline gap-1.5">
                                    <span class="text-[11px] font-bold text-white/50 uppercase tracking-wider" style="text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">Lv.</span>
                                    <span class="text-[42px] font-light text-white leading-none tracking-tighter font-nums" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.9);">{selectedChar.level}<span class="text-[22px] text-white/40 font-normal">/{({ 4: 90, 3: 80, 2: 60, 1: 40, 0: 20 }[Number(selectedChar.evolvePhase)] ?? 90)}</span></span>
                                </div>
                            </div>
                            <AscensionIcon ascension={selectedChar.evolvePhase || 0} size={56} className="pb-1" />
                        </div>
                    </div>

                    <div class="flex flex-col gap-3 items-end justify-center">
                        {#if talentsList && talentsList.length > 0}
                            {#each talentsList as talent}
                                <Tooltip>
                                    <div class="group relative cursor-pointer transition-transform duration-200 hover:scale-105 select-none">
                                        {#if talent.type === "cultivation"}
                                            <div class="w-[35px] h-[35px] flex items-center justify-center {talent.currentLevel === 0 ? 'opacity-40 grayscale' : ''}">
                                                <Image id={talent.localImageId || talent.iconUrl} interactive={true} variant="fac-skill" className="max-w-full max-h-full object-contain" />
                                            </div>
                                            {#if talent.name}
                                                {@const match = talent.name.match(/[αβγ]\s*$/)}
                                                {@const label = match ? match[0] : ""}
                                                {#if label && talent.currentLevel > 0}
                                                    <div class="absolute -bottom-1 -right-1.5 z-10 text-white font-black font-serif text-[15px] select-none" style="text-shadow: 1px 1px 2px #000, -1px -1px 2px #000, 1px -1px 2px #000, -1px 1px 2px #000;">
                                                        {label}
                                                    </div>
                                                {/if}
                                            {/if}
                                        {:else if talent.type === "ability"}
                                            <div class="w-[35px] h-[35px] rounded-full bg-[#F3CE00] border-[3px] border-[#D5B500] overflow-hidden flex items-center justify-center shadow-sm p-[2px] {talent.activeCount === 0 ? 'opacity-40 grayscale' : ''}">
                                                <Image id={talent.localImageId || talent.iconUrl} interactive={true} variant="attribute-icon" className="w-full h-full object-cover rounded-full" />
                                            </div>
                                            {#if talent.activeCount > 0}
                                                <div class="absolute -bottom-1 -right-2.5 z-10 bg-black/90 border border-white/20 px-1 py-0.5 rounded text-[9px] font-black text-[#FFE145] font-nums leading-none shadow-md">
                                                    +{talent.totalValue}
                                                </div>
                                            {/if}
                                        {:else}
                                            <div class="w-[35px] h-[35px] rounded-full bg-[#F3CE00] border-[3px] border-[#D5B500] overflow-hidden flex items-center justify-center shadow-sm p-[2px] {talent.currentLevel === 0 ? 'opacity-40 grayscale' : ''}">
                                                <Image id={talent.localImageId || talent.iconUrl} interactive={true} variant="skill-icon" className="w-full h-full object-cover rounded-full" />
                                            </div>
                                            {#if talent.currentLevel > 0}
                                                <div class="absolute -bottom-1.5 -right-1.5 z-10 flex gap-[2px] pb-1 items-center pointer-events-none select-none">
                                                    {#each Array(talent.currentLevel) as _, i}
                                                        <div class="w-[4px] h-[10px] rounded-full transform rotate-[30deg] border-[1px] shrink-0 border-[#FFE145] bg-[#FFE145] shadow-sm"></div>
                                                    {/each}
                                                </div>
                                            {/if}
                                        {/if}
                                    </div>
                                    <div slot="content" class="flex flex-col gap-1 text-left max-w-[280px]" use:hyperlinkAction>
                                        <span class="font-bold text-[#FFE145]">{talent.name}</span>
                                        <span class="text-xs leading-relaxed text-gray-200">{@html parseRichText(talent.desc)}</span>
                                    </div>
                                </Tooltip>
                            {/each}
                        {/if}
                    </div>
                </div>
            </div>

            <div class="col-span-5 flex flex-col gap-2 justify-between">
                {#if detailedChar?.weapon}
                    {@const wpn = detailedChar.weapon}
                    {@const wpnStatic = getWeaponData(wpn)}
                    {@const wpnName = $t(`weaponsList.${wpnStatic?.id}`) !== `weaponsList.${wpnStatic?.id}` ? $t(`weaponsList.${wpnStatic?.id}`) : (wpnStatic?.name || wpn.id)}
                    {@const wpnStats = getWeaponStatsToRender(wpn, wpnStatic, weaponDetails, opData.class)}
                    {@const baseAtkStat = wpnStats.find(s => s.key === 'baseAtk')}
                    
                    <Tooltip class="w-full">
                        <a href="/weapons/{wpnStatic?.id}?level={wpn.level}&refine={wpn.refineLevel}" class="relative pl-8 pr-3 py-3 flex flex-row items-stretch justify-between gap-3 rounded-xl max-h-[140px] hover:bg-white/5 transition-all w-full select-none"
                           style="background: linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(20,20,20,0.85) 100%) padding-box, linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.15)) border-box;">
                            
                            <div class="flex flex-col justify-end items-start shrink-0">
                                <div class="flex flex-col items-start leading-none select-none">
                                    <span class="text-[9px] font-black text-white/50 uppercase tracking-wider" style="text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">Lv.</span>
                                    <span class="text-[36px] font-black text-white leading-none tracking-tighter" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.9);">{wpn.level}</span>
                                    <div class="w-12 h-[4px] mt-1 rounded" style="background-color: {getRarityColor(wpnStatic?.rarity || wpn.rarity || 5)};"></div>
                                </div>
                            </div>

                            <div class="flex flex-col flex-1 min-w-0 ml-1">
                                <div class="flex flex-col items-end w-full min-w-0">
                                    <div class="flex flex-row-reverse overflow-visible w-full mr-[-40px]">
                                        <h4 class="text-md font-black text-white leading-tight text-nowrap shrink-0 mr-[-32px]" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.85);">
                                            {wpnName}
                                        </h4>
                                    </div>
                                    <div class="flex items-center mt-2 select-none -space-x-1.5 mr-[-75px] z-40">
                                        {#each Array(wpnStatic?.rarity || wpn.rarity || 5) as _}
                                            <Icon name="strokeStar" class="shrink-0 w-7 h-7 text-gray-600 dark:text-white" />
                                        {/each}
                                    </div>
                                </div>

                                <div class="flex items-center gap-3 w-full mt-5 select-none ml-[-6px] justify-between z-30">
                                    <div class="flex items-center justify-center">
                                        {#if wpn.gem && wpn.gem.gemData}
                                            {@const gemRarity = parseInt(wpn.gem.gemData.templateId?.replace("item_gem_rarity_", "")) || wpn.gem.gemData.rarity || 4}
                                            {@const gemColor = getRarityColor(gemRarity)}
                                            {@const localIcon = getGemIcon(wpn.gem.gemData)}
                                            <div class="relative w-8 h-8 rounded-md border-b-2 flex items-center justify-center bg-black/40 shadow-inner overflow-hidden transition-transform" style="border-color: {gemColor}; box-shadow: 0 0 4px {gemColor}33;">
                                                <img 
                                                    src={getImagePath('item_gem_rarity_' + gemRarity, 'essence-type-icon')} 
                                                    alt="" 
                                                    class="absolute inset-0 w-full h-full object-cover opacity-80 pointer-events-none" 
                                                />
                                                {#if wpn.gem.gemData.icon}
                                                    <img 
                                                        src={getImagePath(localIcon, 'essence-icon') || wpn.gem.gemData.icon} 
                                                        alt={wpn.gem.gemData.name} 
                                                        referrerpolicy="no-referrer" 
                                                        class="relative z-10 w-7 h-7 object-contain left-0.5 bottom-0.5" 
                                                        on:error={(e) => {
                                                            if (e.target.src !== wpn.gem.gemData.icon) {
                                                                e.target.src = wpn.gem.gemData.icon;
                                                            }
                                                        }}
                                                    />
                                                {:else}
                                                    <div class="relative z-10 w-1.5 h-1.5 rounded-full" style="background-color: {gemColor}"></div>
                                                {/if}
                                            </div>
                                        {:else}
                                            <div class="relative w-8 h-8 rounded-md border border-dashed border-white/20 bg-black/20 flex items-center justify-center text-white/20 hover:border-white/40 hover:text-white/40 transition-colors cursor-pointer">
                                                <Icon name="noData" class="shrink-0 w-3 h-3" />
                                            </div>
                                        {/if}
                                    </div>
                                    
                                    {#if baseAtkStat}
                                        <div class="flex items-center">
                                            <div class="flex items-center gap-1.5 text-[13px] font-black text-white font-nums bg-gray-200/50 px-1.5 py-1.5 rounded leading-none w-fit">
                                                <Icon name="atk" class="w-3.5 h-3.5 text-white/90" />
                                            </div>
                                            <span class="text-white ml-1.5 items-center text-[18px] font-nums">{baseAtkStat.value}</span>
                                        </div>
                                    {/if}
                                </div>
                            </div>

                            <div class="flex items-center gap-2 shrink-0 ml-2 pr-5">
                                <div class="relative w-[120px] h-[120px] flex items-center justify-center shrink-0">
                                    <div class="absolute top-0 right-0 z-10">
                                        <PotentialIcon pot={wpn.refineLevel !== undefined ? wpn.refineLevel : 0} size={30} />
                                    </div>
                                    <img 
                                        src={getWeaponIcon(wpn) || wpn.weaponData?.iconUrl || ''} 
                                        alt="Weapon" 
                                        class="w-full h-full object-contain pointer-events-none ml-5"
                                        on:error={(e) => { if (wpn.weaponData?.iconUrl && e.target.src !== wpn.weaponData.iconUrl) e.target.src = wpn.weaponData.iconUrl; }} 
                                    />
                                </div>
                            </div>
                        </a>
                        <div slot="content" class="flex flex-col gap-2 text-left max-w-[280px] p-1 font-sans select-none">
                            <div class="flex flex-col border-b border-white/10 pb-1 mb-0.5">
                                <span class="font-bold text-[#FFE145] text-sm">{wpnName}</span>
                                <span class="text-[10px] text-gray-400 font-medium font-nums leading-none mt-1">
                                    Lv. {wpn.level} • R{wpn.refineLevel !== undefined ? wpn.refineLevel : 0}
                                </span>
                            </div>
                            <div class="flex flex-col gap-1.5">
                                {#each getWeaponStatsRanges(wpn, wpnStatic, weaponDetails, opData.class) as stat}
                                    {@const currentStat = wpnStats.find(s => s.key === stat.key)}
                                    <div class="flex items-center justify-between text-xs">
                                        <div class="flex items-center gap-1.5 text-white/90">
                                            <Icon name={stat.icon} class="w-3 h-3 text-gray-200" />
                                            <span class="max-w-[90px] truncate">{stat.label}</span>
                                        </div>
                                        <div class="font-nums flex items-center gap-1.5">
                                            <span class="text-[#38BDF8] font-bold">+{stat.range}</span>

                                        </div>
                                    </div>
                                {/each}
                            </div>
                        </div>
                    </Tooltip>
                {:else}
                    <div class="flex flex-col gap-2 items-center justify-center bg-gradient-to-r from-transparent to-[#1a1a1a] border border-white/5 rounded-xl p-6 text-xs text-white/40 italic flex items-center justify-center min-h-[150px]">
                        <Icon name="noData" class="shrink-0 w-6 h-6" />
                        {$t("profile.no_weapon") || "No weapon"}
                    </div>
                {/if}

                <div class="flex flex-col gap-1.5 flex-1">
                    {#each ['bodyEquip', 'armEquip', 'firstAccessory', 'secondAccessory'] as eqKey}
                        {@const equip = detailedChar?.[eqKey]}
                        {#if equip && equip.equipData}
                            {@const staticId = getStaticEquipId(equip.equipData)}
                            {@const staticEquip = staticId ? equipment[staticId] : null}
                            {@const eqRarity = getEquipRarity(equip, staticEquip)}
                            {@const tier = eqRarity < 5 ? 0 : (equip.enhanceStatus !== undefined ? Math.max(0, equip.enhanceStatus - 1) : getEquipTier(equip.equipData.level?.value || equip.equipData.level, eqRarity))}
                            {@const rarityColor = eqRarity === 6 ? "#F4700C" : (eqRarity === 5 ? "#F9B90C" : (eqRarity === 4 ? "#9253F1" : (eqRarity === 3 ? "#26BAFB" : (eqRarity === 2 ? "#AABD00" : "#8F8F8F"))))}
                            {@const statsToRender = (() => {
                                let list = [];
                                const staticDefAttr = staticEquip?.displayAttr?.find(a => a.attrType.toLowerCase() === "def");
                                if (staticDefAttr) {
                                    list.push({ propKey: "equip_attr_def", statIcon: "def", statVal: staticDefAttr.values[tier] || staticDefAttr.values[0] });
                                } else {
                                    list.push({ propKey: "equip_attr_def", statIcon: "def", statVal: 10 + tier * 5 });
                                }
                                const subProperties = (equip.equipData.properties || []).filter(p => !p.toLowerCase().includes("def"));
                                for (const propKey of subProperties) {
                                    const statIcon = getStatIcon(propKey);
                                    const displayAttr = matchDisplayAttr(propKey, staticEquip?.displayAttr);
                                    const statVal = displayAttr ? displayAttr.values[tier] || displayAttr.values[0] : null;
                                    list.push({ propKey, statIcon, statVal });
                                }
                                return list;
                            })()}
                            
                            <Tooltip class="w-full">
                                <a href="/equipment/{staticId || equip.equipId}" class="relative flex items-center justify-between p-1 rounded-xl pl-3 pr-4 hover:bg-white/5 transition-all cursor-pointer min-h-[42px] min-w-0 w-full"
                                   style="background: linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(20,20,20,0.85) 100%) padding-box, linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.15)) border-box;">
                                    <div class="flex items-center gap-3 min-w-0 flex-1">
                                        <div class="flex flex-col items-center justify-center shrink-0">
                                            <div class="relative w-12 h-12 flex items-center justify-center">
                                                <img src={staticId ? getImagePath(staticId, 'equipment') : (equip.equipData?.iconUrl || '')} alt="Equip" class="w-full h-full object-contain pointer-events-none" on:error={(e) => { if (equip.equipData?.iconUrl) e.target.src = equip.equipData.iconUrl; }} />
                                            </div>
                                            <div class="w-8 h-[3px] rounded mt-0.5" style="background-color: {rarityColor};"></div>
                                        </div>
                                        
                                        <div class="flex flex-col items-start justify-start min-w-0 flex-1 select-none text-left">
                                            <span class="text-sm font-bold text-white truncate font-sdk block w-full" style="text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">{getEquipName(staticId, equip.equipData?.name)}</span>
                                            <span class="text-[10px] text-white/40 font-sans justify-start block w-full truncate">
                                                {$t(`equipmentTypes.${eqKey === 'bodyEquip' ? 'body' : (eqKey === 'armEquip' ? 'hand' : 'edc')}`)}
                                            </span>
                                        </div>
                                    </div>
                                </a>
                                <div slot="content" class="flex flex-col gap-2 text-left max-w-[320px] p-1 font-sans select-none" use:hyperlinkAction>
                                    {#if staticEquip && staticEquip.pack && staticEquip.pack !== "none" && equipLocaleData[staticId]?.setBonus}
                                        <div class="flex flex-col gap-0.5">
                                            <span class="text-[13px] font-bold text-[#FFE145] leading-tight">
                                                {tOrFallback(`packs.${staticEquip.pack}`, staticEquip.pack)}
                                            </span>
                                            <span class="text-xs leading-relaxed text-gray-200">
                                                {@html parseRichText(interpolateBlackboard(equipLocaleData[staticId].setBonus, staticEquip.blackboard || {}))}
                                            </span>
                                        </div>
                                        <hr class="border-white/10 my-1" />
                                    {/if}
                                    
                                    {@const itemTiers = eqRarity >= 5 ? [0, 1, 2, 3] : [0]}
                                    <table class="w-full text-left border-collapse text-[11px]">
                                        <thead>
                                            <tr class="border-b border-white/10">
                                                <th class="py-1 px-1 font-bold text-gray-400 text-left w-[40%]">
                                                    {tOrFallback("sort.stats", "Attribute")}
                                                </th>
                                                {#each itemTiers as tIdx}
                                                    <th class="py-1 px-0.5 text-center w-[15%]">
                                                        <div class="flex items-center justify-center {tIdx === tier ? 'text-[#26BAFB] font-bold scale-110' : 'text-gray-400 opacity-60'}">
                                                            <svg
                                                                class="w-[20px] h-[11px]"
                                                                viewBox="0 0 54 30"
                                                                fill="none"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                            >
                                                                <rect
                                                                    x="33.3789"
                                                                    y="15"
                                                                    width="4.23793"
                                                                    height="14.7562"
                                                                    rx="2.11897"
                                                                    transform="rotate(30 33.3789 15)"
                                                                    fill={tIdx >= 1 ? (tIdx === tier ? '#38BDF8' : '#26BAFB') : '#8F8F8F'}
                                                                />
                                                                <rect
                                                                    x="41.8555"
                                                                    y="15"
                                                                    width="4.23793"
                                                                    height="14.7562"
                                                                    rx="2.11897"
                                                                    transform="rotate(30 41.8555 15)"
                                                                    fill={tIdx >= 2 ? (tIdx === tier ? '#38BDF8' : '#26BAFB') : '#8F8F8F'}
                                                                />
                                                                <rect
                                                                    x="50.3281"
                                                                    y="15"
                                                                    width="4.23793"
                                                                    height="14.7562"
                                                                    rx="2.11897"
                                                                    transform="rotate(30 50.3281 15)"
                                                                    fill={tIdx >= 3 ? (tIdx === tier ? '#38BDF8' : '#26BAFB') : '#8F8F8F'}
                                                                />

                                                                <path
                                                                    d="M28 17L20 29H8L0 17L8 5H20L28 17ZM14 12C11.2386 12 9 14.2386 9 17C9 19.7614 11.2386 22 14 22C16.7614 22 19 19.7614 19 17C19 14.2386 16.7614 12 14 12Z"
                                                                    fill={tIdx >= 3 ? (tIdx === tier ? '#38BDF8' : '#26BAFB') : '#8F8F8F'}
                                                                />
                                                                {#if tIdx >= 1}
                                                                    <path
                                                                        d="M28.0068 17L20.0068 29H8.00684L4.39844 23.5859L9.8877 19.834C10.7895 21.1422 12.2978 22 14.0068 22C16.7683 22 19.0068 19.7614 19.0068 17C19.0068 15.9584 18.6885 14.9912 18.1436 14.1904L23.625 10.4453L28.0068 17Z"
                                                                        fill={tIdx === tier ? '#38BDF8' : '#26BAFB'}
                                                                    />
                                                                {/if}

                                                                <path
                                                                    d="M31 0L36.1962 9H25.8038L31 0Z"
                                                                    fill={tIdx >= 3 ? (tIdx === tier ? '#38BDF8' : '#26BAFB') : '#8F8F8F'}
                                                                />
                                                                {#if tIdx >= 1 && tIdx < 3}
                                                                    <path
                                                                        d="M33.5981 4.5L36.197 9H25.8047L33.5981 4.5Z"
                                                                        fill={tIdx === tier ? '#38BDF8' : '#26BAFB'}
                                                                    />
                                                                {/if}
                                                            </svg>
                                                        </div>
                                                    </th>
                                                {/each}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {#if staticEquip && staticEquip.displayAttr}
                                                {#each staticEquip.displayAttr as attr}
                                                    {@const iconName = attr.attrType.toLowerCase() === "maxhp" ? "hp" : attr.attrType.toLowerCase()}
                                                    {@const isDef = attr.attrType.toLowerCase() === "def"}
                                                    <tr class="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                                                        <td class="py-1 px-1 flex items-center gap-1.5 whitespace-nowrap text-white/90">
                                                            <Icon name={iconName} class="w-3 h-3 text-gray-200" />
                                                            <span class="max-w-[100px] truncate">{tOrFallback(`equipSkills.${attr.attrType}`, attr.attrType)}</span>
                                                        </td>
                                                        {#each itemTiers as valIndex}
                                                            {@const val = attr.values[valIndex]}
                                                            {@const isAllDamage = attr.attrType.toLowerCase() === "alldamagetakenscalar"}
                                                            {@const displayVal = isAllDamage && val !== undefined ? 1 - val : val}
                                                            {@const isCurrent = valIndex === tier}
                                                            <td class="py-1 px-0.5 text-center font-nums {isCurrent ? 'text-[#38BDF8] font-bold bg-[#38BDF8]/10' : 'text-white/60'}">
                                                                {#if isDef && valIndex > 0}
                                                                    -
                                                                {:else if displayVal === 0 || !displayVal}
                                                                    -
                                                                {:else if Math.abs(displayVal) > 0 && Math.abs(displayVal) < 1}
                                                                    {Math.round(displayVal * 1000) / 10}%
                                                                {:else}
                                                                    {Math.round(displayVal * 10) / 10}
                                                                {/if}
                                                            </td>
                                                        {/each}
                                                    </tr>
                                                {/each}
                                            {/if}
                                        </tbody>
                                    </table>
                                </div>
                            </Tooltip>
                        {:else}
                            <div class="flex items-center gap-2 bg-[#202020]/20 border border-dashed border-white/5 p-1 rounded-xl pl-3 pr-4 min-h-[42px] text-[11px] text-white/30 select-none h-full">
                                <div class="w-10 h-10 flex items-center justify-center border border-dashed border-white/5 rounded bg-black/10 shrink-0">
                                    <Icon name="noData" class="shrink-0 w-4 h-4 opacity-50" />
                                </div>
                                <div class="flex flex-col justify-center min-w-0">
                                    <span class="font-sdk text-white/40">{$t("profile.empty_slot") || "Empty Slot"}</span>
                                    <span class="text-[9px] uppercase tracking-wider text-white/20">
                                        {$t(`equipmentTypes.${eqKey === 'bodyEquip' ? 'body' : (eqKey === 'armEquip' ? 'hand' : 'edc')}`) || ''}
                                    </span>
                                </div>
                            </div>
                        {/if}
                    {/each}
                </div>
            </div>
        </div>
    </div>
</div>
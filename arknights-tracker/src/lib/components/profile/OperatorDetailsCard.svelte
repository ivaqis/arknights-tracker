<script>
    import { t } from "$lib/i18n.js";
    import { currentLocale } from "$lib/stores/locale.js";
    import { fade } from "svelte/transition";
    import Icon from "$lib/components/Icon.svelte";
    import Image from "$lib/components/Image.svelte";
    import PotentialIcon from "$lib/components/operators/PotentialIcon.svelte";
    import AscensionIcon from "$lib/components/operators/AscensionIcon.svelte";
    import { createEventDispatcher, tick } from "svelte";
    import Tooltip from "$lib/components/Tooltip.svelte";
    import { equipment } from "$lib/data/items/equipment.js";
    import { getImagePath } from "$lib/utils/imageUtils.js";
    import { getRarityColor, getHexColorByElement } from "$lib/utils/colorUtils.js";
    import { parseRichText, hyperlinkAction } from "$lib/utils/richText.js";
    import { addNotification } from "$lib/stores/notifications.js";

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

    const weaponLocaleModules = {
        en: import.meta.glob("/src/lib/locales/en/weapons.json"),
        ru: import.meta.glob("/src/lib/locales/ru/weapons.json"),
        de: import.meta.glob("/src/lib/locales/de/weapons.json"),
        es: import.meta.glob("/src/lib/locales/es/weapons.json"),
        fr: import.meta.glob("/src/lib/locales/fr/weapons.json"),
        id: import.meta.glob("/src/lib/locales/id/weapons.json"),
        it: import.meta.glob("/src/lib/locales/it/weapons.json"),
        ja: import.meta.glob("/src/lib/locales/ja/weapons.json"),
        ko: import.meta.glob("/src/lib/locales/ko/weapons.json"),
        pt: import.meta.glob("/src/lib/locales/pt/weapons.json"),
        th: import.meta.glob("/src/lib/locales/th/weapons.json"),
        vi: import.meta.glob("/src/lib/locales/vi/weapons.json"),
        zhcn: import.meta.glob("/src/lib/locales/zhcn/weapons.json"),
        zhtw: import.meta.glob("/src/lib/locales/zhtw/weapons.json"),
    };

    let equipLocaleData = {};
    let weaponLocaleData = {};

    $: loadEquipLocale($currentLocale);
    $: loadWeaponLocale($currentLocale);
    $: curLabel = $currentLocale === 'ru' ? 'текущ.' : 'current';

    async function loadEquipLocale(lang) {
        lang = lang || "en";
        const safeLang = lang.toLowerCase().startsWith("en") ? "en" : lang.toLowerCase().replace("-", "");
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

    async function loadWeaponLocale(lang) {
        lang = lang || "en";
        const safeLang = lang.toLowerCase().startsWith("en") ? "en" : lang.toLowerCase().replace("-", "");
        const localePath = `/src/lib/locales/${safeLang}/weapons.json`;
        const fallbackPath = `/src/lib/locales/en/weapons.json`;

        let localeLoader = weaponLocaleModules[safeLang]?.[localePath];
        if (!localeLoader && safeLang !== "en") {
            localeLoader = weaponLocaleModules["en"]?.[fallbackPath];
        }

        if (localeLoader) {
            const mod = await localeLoader();
            weaponLocaleData = mod.default || mod;
        } else {
            weaponLocaleData = {};
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
                    result = parseFloat((result * 100).toFixed(4)) + "%";
                } else if (format === "0") {
                    result = Math.round(result);
                } else {
                    result = parseFloat(Number(result).toFixed(4));
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
    export let getWeaponTerms = () => [];
    export let getStaticEquipId;
    export let getEquipRarity;
    export let getEquipTier;
    export let getStatIcon;
    export let charDetails = null;
    export let charLocale = null;
    export let weaponDetails = null;

    let isExporting = false;

    $: evolvePhase = (() => {
        if (selectedChar?.evolvePhase !== undefined && selectedChar?.evolvePhase !== null) {
            return Number(selectedChar.evolvePhase);
        }
        if (detailedChar?.evolvePhase !== undefined && detailedChar?.evolvePhase !== null) {
            return Number(detailedChar.evolvePhase);
        }
        const breakNode = selectedChar?.talent?.latestBreakNode || detailedChar?.talent?.latestBreakNode || "";
        if (breakNode.includes("70") || breakNode.includes("T5")) return 4;
        if (breakNode.includes("60") || breakNode.includes("T4")) return 3;
        if (breakNode.includes("40") || breakNode.includes("T3")) return 2;
        if (breakNode.includes("20") || breakNode.includes("T2")) return 1;
        const lvl = Number(selectedChar?.level || detailedChar?.level) || 1;
        if (lvl > 80) return 4;
        if (lvl > 60) return 3;
        if (lvl > 40) return 2;
        if (lvl > 20) return 1;
        return 0;
    })();

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
        if (text && typeof text === "object") {
            text = text.main || Object.values(text)[0] || "";
        }
        if (!text) {
            text = skillData.desc || "";
        }
        if (!text) {
            const skillMeta = Array.isArray(targetCharData?.skills) 
                ? targetCharData.skills.find(s => s.key === skillKey || s.id?.includes(skillKey)) 
                : targetCharData?.skills?.[skillKey];
            text = skillMeta?.desc || skillMeta?.description || "";
        }
        if (!text || typeof text !== "string") return "";

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
                    else result = parseFloat(num.toFixed(4));
                } else {
                    if (isPercentData)
                        result = parseFloat((num * 100).toFixed(4)) + "%";
                    else result = parseFloat(num.toFixed(4));
                }

                return `<span class="text-[#38BDF8] font-bold drop-shadow-sm">${result}</span>`;
            }
        );

        return text;
    }

    function getGemIcon(gemData) {
        if (!gemData) return "";
        if (gemData.iconId) return gemData.iconId;
        const id = gemData.templateId || gemData.termId || gemData.id || gemData.itemId || "";
        const match = id.match(/_(\d+)/);
        if (match) {
            const num = parseInt(match[1], 10);
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

    const characterDataModules = import.meta.glob("/src/lib/data/charactersData/*.json", { eager: true });

    function getOperatorDataDetails() {
        if (charDetails) return charDetails;
        if (svelteId) {
            const mod = characterDataModules[`/src/lib/data/charactersData/${svelteId}.json`];
            return mod?.default || mod || null;
        }
        return null;
    }

    function getOperatorMainStatIcon(opClass) {
        const details = getOperatorDataDetails();
        if (details?.mainAttribute) {
            const m = details.mainAttribute.toLowerCase();
            return m === "wisd" ? "int" : m;
        }
        return getPrimaryAttrIcon(opClass || opData?.class);
    }

    function getOperatorSubStatIcon() {
        const details = getOperatorDataDetails();
        if (details?.secondaryAttribute) {
            const s = details.secondaryAttribute.toLowerCase();
            return s === "wisd" ? "int" : s;
        }
        return "circle";
    }

    function resolveAttributeIcon(attrKey, defaultIcon = "circle") {
        if (!attrKey) return defaultIcon;
        const lower = attrKey.toLowerCase();
        if (lower === "main" || lower === "mainattr" || lower === "primary_attr_up" || lower === "primary_attr" || lower === "equip_attr_main" || lower === "equip_main") {
            return getOperatorMainStatIcon();
        }
        if (lower === "sub" || lower === "subattr" || lower === "second_attr_up" || lower === "secondary_attr_up" || lower === "secondary_attr" || lower === "equip_attr_sub" || lower === "equip_sub") {
            return getOperatorSubStatIcon();
        }
        if (getStatIcon) {
            const found = getStatIcon(attrKey);
            if (found) return found;
        }
        if (lower === "maxhp" || lower === "hp_up") return "hp";
        if (lower.includes("physical") || lower.includes("phy")) return "physicaldamageincrease";
        if (lower.includes("crit")) return "crirate";
        if (lower.includes("usgs") || lower.includes("sp_gain")) return "usp";
        if (lower.includes("def")) return "def";
        if (lower.includes("atk")) return "atk";
        return defaultIcon;
    }

    function getPrimaryAttrIcon(charClass) {
        const cls = charClass?.toLowerCase() || "";
        if (cls.includes("caster") || cls.includes("supporter")) return "int";
        if (cls.includes("specialist") || cls.includes("recon")) return "agi";
        if (cls.includes("vanguard")) return "will";
        return "str";
    }

    function getEquippedPackCount(targetPack) {
        if (!targetPack || targetPack === "none") return 0;
        let count = 0;
        for (const key of ['bodyEquip', 'armEquip', 'firstAccessory', 'secondAccessory']) {
            const item = detailedChar?.[key] || selectedChar?.[key];
            if (item && (item.equipData || item.id)) {
                const sId = (getStaticEquipId ? getStaticEquipId(item.equipData) : null) || (equipment[item.id] ? item.id : (item.id?.startsWith('item_') ? item.id : `item_${item.id}`));
                const staticItem = sId ? equipment[sId] : null;
                if (staticItem && staticItem.pack === targetPack) {
                    count++;
                }
            }
        }
        return count;
    }

    function getWeaponStatLabel(statKey) {
        if (!statKey) return "";
        const sKey = statKey.toLowerCase();
        if (sKey === "baseatk") {
            return $t("stats.baseAtk");
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
            const wpnTerms = (wpn.weaponTerms && wpn.weaponTerms.length > 0) ? wpn.weaponTerms : (getWeaponTerms ? getWeaponTerms(wpn) : []);
            
            for (let i = 1; i <= 3; i++) {
                const skillKey = `skill${i}`;
                const bb = weaponDetails.blackboard[skillKey];
                const tiers = weaponDetails.skillLevels?.[skillKey];
                
                if (bb) {
                    let rank = 1;
                    if (wpnTerms && typeof wpnTerms[i - 1] === 'number') {
                        rank = wpnTerms[i - 1];
                    } else if (tiers) {
                        let activeTier = tiers[0];
                        for (const t of tiers) {
                            if (wpn.level >= t.level) activeTier = t;
                        }
                        rank = activeTier.lower;
                        let upper = activeTier.upper;
                        if (i === potSkillIndex) {
                            rank += refineLevel;
                            upper += refineLevel;
                        }
                        if (rank > upper) rank = upper;
                    }
                    if (rank > 9) rank = 9;
                    if (rank < 1) rank = 1;

                    const bbKeys = Object.keys(bb);
                    const mainKey = bbKeys.find(k => k !== 'duration' && k !== 'duration2' && k !== 'duration3' && k !== 'duration4' && k !== 'max_stack' && k !== 'max_stacks' && k !== 'cd' && k !== 'cd ' && k !== 'lv');
                    
                    if (mainKey) {
                        const values = bb[mainKey];
                        const val = values ? (values[rank - 1] !== undefined ? values[rank - 1] : values[0]) : null;
                        if (val !== null && val !== undefined) {
                            let iconName = resolveAttributeIcon(mainKey, "circle");
                            
                            let displayVal = "";
                            const num = Number(val);
                            if (!isNaN(num)) {
                                if (Math.abs(num) > 0 && Math.abs(num) < 1) {
                                    displayVal = `+${Math.round(num * 1000) / 10}%`;
                                } else {
                                    displayVal = `+${Math.round(num)}`;
                                }
                            } else {
                                const sVal = String(val);
                                displayVal = sVal.startsWith("+") || sVal.startsWith("-") ? sVal : `+${sVal}`;
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
            list.push({ key: "def", icon: "def", label: "DEF", value: `+${Math.round(20 + wpn.level * 0.8)}` });
            list.push({ key: "maxhp", icon: "hp", label: "HP", value: `+${Math.round(150 + wpn.level * 4)}` });
        }

        return list;
    }

    function getWeaponSkillsToRender(wpn, wpnStatic, weaponDetails, opClass) {
        if (!wpn || !wpnStatic) return [];
        const wpnId = wpnStatic.id;
        const wpnLocale = weaponLocaleData[wpnId] || {};
        const skillsLocale = wpnLocale.skills || [];
        const wpnTerms = (wpn.weaponTerms && wpn.weaponTerms.length > 0) ? wpn.weaponTerms : (getWeaponTerms ? getWeaponTerms(wpn) : []);
        const refineLevel = wpn.refineLevel !== undefined ? wpn.refineLevel : 0;
        const potSkillIndex = weaponDetails?.potSkill || 3;

        const opDetails = getOperatorDataDetails();
        const mainAttrKey = opDetails?.mainAttribute || (opClass?.toLowerCase().includes("caster") ? "wisd" : "str");
        const mainAttrLabel = getWeaponStatLabel(mainAttrKey);
        const subAttrKey = opDetails?.secondaryAttribute;
        const subAttrLabel = subAttrKey ? getWeaponStatLabel(subAttrKey) : "";

        const result = [];
        for (let i = 1; i <= 3; i++) {
            const skillKey = `skill${i}`;
            const skillLocale = skillsLocale[i - 1];

            let rank = 1;
            if (wpnTerms && typeof wpnTerms[i - 1] === 'number') {
                rank = wpnTerms[i - 1];
            } else if (weaponDetails?.skillLevels?.[skillKey]) {
                const tiers = weaponDetails.skillLevels[skillKey];
                let activeTier = tiers[0];
                for (const t of tiers) {
                    if (wpn.level >= t.level) activeTier = t;
                }
                rank = activeTier.lower;
                let upper = activeTier.upper;
                if (i === potSkillIndex) {
                    rank += refineLevel;
                    upper += refineLevel;
                }
                if (rank > upper) rank = upper;
            }
            if (rank > 9) rank = 9;
            if (rank < 1) rank = 1;

            const bbRaw = weaponDetails?.blackboard?.[skillKey];
            const bb = {};
            if (bbRaw) {
                for (const [k, v] of Object.entries(bbRaw)) {
                    const idx = Math.min(Math.max(0, rank - 1), v.length - 1);
                    bb[k] = v[idx];
                }
            }

            if (skillLocale) {
                let skillName = skillLocale.name || "";
                let skillDesc = skillLocale.description || "";

                const mainAttrPhrases = ["Основной показатель", "Main Attribute", "Main attribute", "主属性", "主能力值", "คุณสมบัติ​หลัก", "Thuộc tính chính", "Thuộc tính Chính", "Atribut Utama", "Atributo Principal", "Atributo principal", "Attribut principal", "Hauptattribut", "Attributo principale", "주 능력치", "주속성", "주속성치", "主能力値", "Hauptattribut", "Pääominaisuus", "Asosiy parametr", "Negizgi parametr"];
                for (const phrase of mainAttrPhrases) {
                    if (skillName.includes(phrase)) {
                        skillName = skillName.replace(phrase, mainAttrLabel);
                    }
                    if (skillDesc.includes(phrase)) {
                        skillDesc = skillDesc.replace(phrase, mainAttrLabel);
                    }
                }

                if (subAttrLabel) {
                    const subAttrPhrases = ["Побочный показатель", "Secondary Attribute", "Secondary attribute", "副属性", "副能力值", "คุณสมบัติ​รอง", "Thuộc tính phụ", "Atribut Sekunder", "Atributo Secundario", "Atributo secundario", "Attribut secondaire", "Nebenattribut", "Attributo secondario", "부 능력치", "부속성", "부속성치", "副能力値", "Nebenattribut", "Sivuominaisuus", "Ikkilamchi parametr", "Qosalqy parametr"];
                    for (const phrase of subAttrPhrases) {
                        if (skillName.includes(phrase)) {
                            skillName = skillName.replace(phrase, subAttrLabel);
                        }
                        if (skillDesc.includes(phrase)) {
                            skillDesc = skillDesc.replace(phrase, subAttrLabel);
                        }
                    }
                }

                const interpolatedDesc = interpolateBlackboard(skillDesc, bb);
                const parsedDesc = parseRichText(interpolatedDesc);

                result.push({
                    name: skillName,
                    descriptionHtml: parsedDesc,
                    rank
                });
            }
        }
        return result;
    }

    function getSkillStatLabel(skillKey, key, charLocale, lang = "en", conditionKey = null) {
        const skillObj = charLocale?.skills?.[skillKey];
        if (conditionKey && skillObj?.[conditionKey]?.[key]) {
            return skillObj[conditionKey][key];
        }
        const localized = skillObj?.[key] || skillObj?.[skillKey]?.[key];
        if (localized) return localized;

        if (key === "costValue" && skillKey !== "ultimate") {
            const trans2 = $t("stats.costValue2");
            if (trans2 && trans2 !== "stats.costValue2") return trans2;
        }

        const tKey = `stats.${key}`;
        const trans = $t(tKey);
        if (trans && trans !== tKey) return trans;

        const statsKeyMap = {
            "hp": "stats.hp",
            "atk": "stats.atk",
            "def": "stats.def",
            "cooldown": "stats.coolDown",
            "cool_down": "stats.coolDown",
            "costvalue": skillKey !== "ultimate" ? "stats.costValue2" : "stats.costValue",
            "cost_value": skillKey !== "ultimate" ? "stats.costValue2" : "stats.costValue"
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

            if (valObj && typeof valObj === "object" && !Array.isArray(valObj) && !Array.isArray(valObj.data)) {
                for (const [subKey, subVal] of Object.entries(valObj)) {
                    let subData = null;
                    let subIsPercent = false;
                    if (subVal && typeof subVal === "object" && Array.isArray(subVal.data)) {
                        subData = subVal.data;
                        subIsPercent = subVal.dataType === "percent";
                    } else if (Array.isArray(subVal)) {
                        subData = subVal;
                    }
                    if (!subData || subData.length === 0) continue;
                    const currentIdx = Math.min(skillLvl - 1, subData.length - 1);
                    const currentVal = parseFloat(subData[currentIdx]);
                    if (isNaN(currentVal)) continue;
                    let currentStr = "";
                    const isTimeStat = subKey.toLowerCase().includes("cooldown") || subKey.toLowerCase() === "cool" || subKey.toLowerCase().includes("duration");
                    const suffix = isTimeStat ? (safeLang === "ru" ? " сек." : "s") : "";
                    if (subIsPercent) {
                        currentStr = `${parseFloat((currentVal * 100).toFixed(4))}%`;
                    } else {
                        const curValFormatted = currentVal % 1 === 0 ? currentVal.toString() : currentVal.toFixed(1);
                        currentStr = `${curValFormatted}${suffix}`;
                    }
                    list.push({
                        key: `${key}_${subKey}`,
                        label: getSkillStatLabel(skillKey, subKey, charLocale, lang, key),
                        value: currentStr
                    });
                }
                continue;
            }

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
                const curPct = parseFloat((currentVal * 100).toFixed(4));
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

    let copied = false;
    function handleShare() {
        if (typeof window === "undefined") return;
        const charId = opData?.id || svelteId || selectedChar?.id;
        const url = new URL(window.location.href);
        if (charId) {
            url.searchParams.set("char", charId);
        }
        navigator.clipboard.writeText(url.toString()).then(() => {
            copied = true;
            addNotification("success", $t("profile.link_copied"));
            setTimeout(() => {
                copied = false;
            }, 2000);
        }).catch(err => {
            console.error("Failed to copy link: ", err);
            addNotification("error", $t("profile.copy_failed"));
        });
    }

    const dispatch = createEventDispatcher();

    let cardElement;

    async function handleSavePhoto() {
        if (!cardElement || typeof window === "undefined") return;

        isExporting = true;
        await tick();
        await new Promise(r => setTimeout(r, 200));

        const charName = $t(`characters.${opData?.id}`) !== `characters.${opData?.id}` ? $t(`characters.${opData?.id}`) : (opData?.name || opData?.id || "operator");
        const charId = opData?.id || svelteId || selectedChar?.id || "operator";
        const dateStr = new Date().toISOString().slice(0, 10);
        const fileName = `goyfield_${charId}_${dateStr}.png`;

        dispatch("openPhotoModal", {
            operatorName: charName,
            fileName: fileName,
            isGenerating: true,
            imageUrl: null,
            imageBlob: null
        });

        let tempSvg = null;
        try {
            const useElements = cardElement.querySelectorAll("use");
            const neededIds = new Set();
            useElements.forEach(u => {
                const href = u.getAttribute("href") || u.getAttribute("xlink:href") || "";
                if (href.startsWith("#")) {
                    neededIds.add(href.slice(1));
                }
            });

            const spriteSheet = document.getElementById("__svg-sprite-sheet__");
            if (spriteSheet && neededIds.size > 0) {
                tempSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                tempSvg.style.position = "absolute";
                tempSvg.style.width = "0";
                tempSvg.style.height = "0";
                tempSvg.style.overflow = "hidden";
                tempSvg.setAttribute("aria-hidden", "true");

                neededIds.forEach(id => {
                    const sym = spriteSheet.querySelector(`symbol#${CSS.escape(id)}`) || document.getElementById(id);
                    if (sym) {
                        tempSvg.appendChild(sym.cloneNode(true));
                    }
                });

                if (tempSvg.childNodes.length > 0) {
                    cardElement.appendChild(tempSvg);
                }
            }

            const { toBlob } = await import("html-to-image");
            const blob = await toBlob(cardElement, {
                pixelRatio: 2,
                skipAutoScale: true,
                imagePlaceholder: "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E",
                width: 950,
                height: 447,
                style: {
                    margin: "0",
                    border: "none",
                    outline: "none",
                    boxShadow: "none",
                    transform: "none"
                }
            });

            if (blob) {
                const blobUrl = URL.createObjectURL(blob);
                dispatch("openPhotoModal", {
                    operatorName: charName,
                    fileName: fileName,
                    isGenerating: false,
                    imageUrl: blobUrl,
                    imageBlob: blob
                });
            } else {
                throw new Error("Failed to create image blob");
            }
        } catch (err) {
            console.error("Failed to generate character card image:", err);
            addNotification("error", $t("profile.copy_failed"));
            dispatch("openPhotoModal", {
                operatorName: charName,
                fileName: fileName,
                isGenerating: false,
                imageUrl: null,
                imageBlob: null,
                error: true
            });
        } finally {
            isExporting = false;
            if (tempSvg && tempSvg.parentNode) {
                tempSvg.parentNode.removeChild(tempSvg);
            }
        }
    }
</script>

<div class="w-full overflow-x-auto custom-scrollbar pb-1">
    <div bind:this={cardElement} in:fade={{ duration: 200 }} class="w-[950px] h-[447px] mx-auto relative {isExporting ? 'bg-[#181818] border-none' : 'bg-black/30 dark:bg-black/40 border border-white/10'} backdrop-blur-md rounded-2xl p-5 transition-all duration-300 text-left mt-3 overflow-hidden">
        
        <div
            class="absolute inset-0 pointer-events-none z-0 rounded-2xl"
            style={isExporting
                ? `background: linear-gradient(125deg, ${getHexColorByElement(opData?.element)}E6 0%, ${getHexColorByElement(opData?.element)}99 35%, ${getHexColorByElement(opData?.element)}33 70%, transparent 100%);`
                : ''}
        >
            {#if !isExporting}
                <div class="absolute inset-0 bg-gradient-to-br {elementColor} rounded-2xl"></div>
            {/if}
        </div>
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
                                            {$t(`characters.${opData.id}`) !== `characters.${opData.id}` ? $t(`characters.${opData.id}`) : opData.name}
                                        </h3>
                                    </div>

                                    <Tooltip text="P{Math.max(1, (selectedChar.potential || 1)) - 1}">
                                        <PotentialIcon pot={Math.max(0, (selectedChar.potential || 1) - 1)} size={50} className="ml-1 pt-2" />
                                    </Tooltip>
                                </div>

                                <div class="flex items-center gap-0 -space-x-1 ml-[-3px]">
                                    {#each Array(opData.rarity || 1) as _}
                                        <Icon name="star" class="w-10 h-10 text-white" style="stroke-opacity: 20%" />
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
                                {@const skillMeta = (Array.isArray(targetCharData?.skills) ? targetCharData.skills[idx] : targetCharData?.skills?.[skillKey]) || charDetails?.skills?.[skillKey] || charLocale?.skills?.[skillKey] || { name: skillKey }}
                                {@const skillTypeMap = { basicAttack: "skill_type_normal_attack", battleSkill: "skill_type_normal_skill", comboSkill: "skill_type_combo_skill", ultimate: "skill_type_ultimate_skill" }}
                                {@const skillTypeKey = skillTypeMap[skillKey]}
                                {@const skillLvl = detailedChar?.userSkills?.[skillTypeKey]?.level || (Array.isArray(detailedChar?.skills) ? detailedChar.skills.find(s => s.type === skillTypeKey)?.level : null) || detailedChar?.userSkills?.[skillMeta?.id]?.level || detailedChar?.userSkills?.[skillKey]?.level || 1}
                                {@const skillImageId = skillKey === "basicAttack" ? (opData?.weapon || "sword") : `${svelteId}_${skillKey}`}
                                {@const currentElement = skillMeta?.elementType || skillMeta?.property?.key?.replace("skill_property_", "") || targetCharData?.property?.key?.replace("char_property_", "") || opData?.element || "physical"}
                                {@const currentColor = getHexColorByElement(currentElement) || "#5E5D5D"}
                                {@const isUltimate = skillKey === "ultimate"}
                                {@const skillStats = getSkillStatsList(skillKey, skillLvl, charDetails, charLocale, $currentLocale)}
                                
                                <Tooltip>
                                    <div class="flex flex-col items-center group relative">
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
                                                {$t(`menu.${skillKey}`)}
                                            </span>
                                            <span class="font-bold text-[#FFE145]">{charLocale?.skills?.[skillKey]?.name || skillMeta?.name || "Skill"}</span>
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
                            {/each}
                        </div>

                        <div class="flex flex-row items-end gap-3 shrink-0">
                            <div class="flex flex-col items-start select-none justify-end pb-1">
                                <div class="flex items-baseline gap-1.5">
                                    <span class="text-[11px] font-bold text-white/50 uppercase tracking-wider" style="text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">Lv.</span>
                                    <span class="text-[42px] font-light text-white leading-none tracking-tighter font-nums" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.9);">{selectedChar.level}<span class="text-[22px] text-white/40 font-normal">/{({ 4: 90, 3: 80, 2: 60, 1: 40, 0: 20 }[evolvePhase] ?? 90)}</span></span>
                                </div>
                            </div>
                            <AscensionIcon ascension={evolvePhase} size={56} className="pb-1 text-white" />
                        </div>
                    </div>

                    <div class="flex flex-col gap-3 items-end justify-center">
                        {#if talentsList && talentsList.length > 0}
                            {#each talentsList as talent}
                                <Tooltip>
                                    <div class="group relative select-none">
                                        {#if talent.type === "cultivation"}
                                            <div class="w-[35px] h-[35px] flex items-center justify-center {talent.currentLevel === 0 ? 'opacity-80 grayscale' : ''}">
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
                                            <div class="w-[35px] h-[35px] rounded-full bg-[#F3CE00] border-[3px] border-[#D5B500] overflow-hidden flex items-center justify-center shadow-sm p-[2px] {talent.activeCount === 0 ? 'opacity-80 grayscale' : ''}">
                                                <Image id={talent.localImageId || talent.iconUrl} interactive={true} variant="attribute-icon" className="w-full h-full object-cover rounded-full" />
                                            </div>
                                            {#if talent.activeCount > 0}
                                                <div class="absolute -bottom-1 -right-2.5 z-10 bg-black/90 border border-white/20 px-1 py-0.5 rounded text-[9px] font-black text-[#FFE145] font-nums leading-none shadow-md">
                                                    +{talent.totalValue}
                                                </div>
                                            {/if}
                                        {:else}
                                            <div class="w-[35px] h-[35px] rounded-full bg-[#F3CE00] border-[3px] border-[#D5B500] overflow-hidden flex items-center justify-center shadow-sm p-[2px] {talent.currentLevel === 0 ? 'opacity-80 grayscale' : ''}">
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
                    {@const wpnTerms = (wpn.weaponTerms && wpn.weaponTerms.length > 0) ? wpn.weaponTerms : (getWeaponTerms ? getWeaponTerms(wpn) : [])}
                    
                    <Tooltip class="w-full">
                        <a href="/weapons/{wpnStatic?.id}?level={wpn.level}&refine={wpn.refineLevel}&skills={wpnTerms.join(',')}" class="relative pl-14 pr-3 py-2 flex flex-col justify-between gap-0.5 rounded-xl hover:bg-white/5 transition-all w-full select-none"
                           style="background: linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(20,20,20,0.85) 100%) padding-box, linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.15)) border-box;">
                            
                            <div class="flex flex-row items-stretch justify-between gap-3 w-full">
                                <div class="flex flex-col justify-end items-start shrink-0">
                                    <div class="flex flex-col items-start leading-none select-none">
                                        <span class="text-[9px] font-black text-white/50 uppercase tracking-wider" style="text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">Lv.</span>
                                        <span class="text-[32px] font-black text-white leading-none tracking-tighter" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.9);">{wpn.level}</span>
                                        <div class="w-12 h-[4px] mt-1 rounded" style="background-color: {getRarityColor(wpnStatic?.rarity || wpn.rarity || 5)};"></div>
                                    </div>
                                </div>

                                <div class="flex flex-col justify-between flex-1 min-w-0 ml-1">
                                    <div class="flex flex-col items-end w-full min-w-0">
                                        <div class="flex flex-row-reverse overflow-visible w-full mr-[-30px]">
                                            <h4 class="text-md font-black text-white leading-tight text-nowrap shrink-0" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.85);">
                                                {wpnName}
                                            </h4>
                                        </div>
                                        <div class="flex items-center mt-2 select-none -space-x-1 mr-[-33px] z-40">
                                            {#each Array(wpnStatic?.rarity || wpn.rarity || 5) as _}
                                                <Icon name="star" class="shrink-0 w-7 h-7 text-white" />
                                            {/each}
                                        </div>
                                    </div>

                                    <div class="flex items-center justify-end gap-1.5">
                                        {#if wpn.gem && (wpn.gem.gemData || wpn.gem.templateId)}
                                            {@const gemTemplate = wpn.gem.gemData?.templateId || wpn.gem.templateId}
                                            {@const gemRarity = parseInt(gemTemplate?.replace("item_gem_rarity_", "")) || wpn.gem.gemData?.rarity || wpn.gem.rarity || 4}
                                            {@const gemColor = getRarityColor(gemRarity)}
                                            {@const localIcon = getGemIcon(wpn.gem.gemData || wpn.gem)}
                                            <div class="flex items-left mt-6 uppercase select-none text-xs text-gray-400 space-x-1 z-40" style="text-shadow: 1px 1px 2px rgba(0,0,0,0.7);">{$t("stats.essence")}</div>
                                            <div class="shrink-0 relative w-10 h-10 rounded border-b-2 mr-[-33px] flex items-center justify-center bg-black/40 shadow-inner overflow-hidden transition-transform" style="border-color: {gemColor}; box-shadow: 0 0 4px {gemColor}33;">
                                                <img 
                                                    src={getImagePath('item_gem_rarity_' + gemRarity, 'essence-type-icon')} 
                                                    alt="" 
                                                    class="absolute inset-0 w-full h-full object-cover opacity-80 pointer-events-none" 
                                                />
                                                {#if wpn.gem.gemData?.icon || wpn.gem.iconUrl}
                                                    <img 
                                                        src={getImagePath(localIcon, 'essence-icon') || wpn.gem.gemData?.icon || wpn.gem.iconUrl} 
                                                        alt={wpn.gem.gemData?.name || wpn.gem.name || ''} 
                                                        referrerpolicy="no-referrer" 
                                                        class="relative z-10 w-6 h-6 object-contain left-0.5 bottom-0.5" 
                                                        on:error={(e) => {
                                                            const fallback = wpn.gem.gemData?.icon || wpn.gem.iconUrl;
                                                            if (fallback && e.target.src !== fallback) {
                                                                e.target.src = fallback;
                                                            }
                                                        }}
                                                    />
                                                {:else}
                                                    <div class="relative z-10 w-1.5 h-1.5 rounded-full" style="background-color: {gemColor}"></div>
                                                {/if}
                                            </div>
                                        {:else}
                                           <div class="flex items-left mt-6 uppercase select-none text-xs text-gray-400 space-x-1 z-40">{$t("stats.essence")}</div> 
                                            <div class="mr-[-33px] relative w-10 h-10 rounded border border-dashed border-white/20 bg-black/20 flex items-center justify-center text-white/20 hover:border-white/40 hover:text-white/40 transition-colors cursor-pointer">
                                                <Icon name="noData" class="shrink-0 w-4 h-4" />
                                            </div>
                                        {/if}
                                    </div>
                                </div>

                                <div class="flex items-center gap-2 shrink-0 ml-2 pr-2">
                                    <div class="relative w-[110px] h-[110px] flex items-center justify-center shrink-0">
                                        <div class="absolute top-0 right-0 z-10 flex flex-col items-end gap-1">
                                            <PotentialIcon pot={wpn.refineLevel !== undefined ? wpn.refineLevel : 0} size={30} />

                                            {#if wpnTerms && wpnTerms.length > 0}
                                                <div class="flex flex-col items-center gap-1.5 mt-0.5">
                                                    {#each wpnTerms as term}
                                                        <div class="flex items-center gap-1.5 px-1 py-0.5 rounded-[4px]" style="background: linear-gradient(to right, transparent, #2D2D2B 35%);">
                                                            <div class="w-[7px] h-[15px] rounded-full transform rotate-[40deg] border-[1.5px] transition-all duration-200 outline-none shrink-0 flex items-center justify-center bg-[#FFE145] border-[#FFE145] dark:bg-[#FFE145] dark:border-[#FFE145] shadow-sm"></div>
                                                            <span class="pl-0.5 text-[12px] font-black text-[#FFE145] font-nums leading-none">{term}</span>
                                                        </div>
                                                    {/each}
                                                </div>
                                            {/if}
                                        </div>

                                        <img 
                                            src={getWeaponIcon(wpn) || wpn.weaponData?.iconUrl || ''} 
                                            alt="Weapon" 
                                            class="w-full h-full object-contain pointer-events-none ml-5 mr-2"
                                            on:error={(e) => { if (wpn.weaponData?.iconUrl && e.target.src !== wpn.weaponData.iconUrl) e.target.src = wpn.weaponData.iconUrl; }} 
                                        />
                                    </div>
                                </div>
                            </div>

                            <div class="flex items-center gap-3 w-full select-none justify-between z-30 pt-1.5">
                                {#if baseAtkStat}
                                    <div class="flex items-center shrink-0">
                                        <div class="flex items-center gap-1.5 text-[13px] font-black text-white font-nums bg-gray-200/50 px-1.5 py-1.5 rounded leading-none w-fit">
                                            <Icon name="atk" class="w-3.5 h-3.5 text-white/90" />
                                        </div>
                                        <span class="text-white ml-1.5 items-center text-[18px] font-nums">{baseAtkStat.value}</span>
                                    </div>
                                {/if}

                                <div class="flex items-center gap-1.5 flex-wrap pr-1.5">
                                    {#each wpnStats.filter(s => s.key !== 'baseAtk') as stat}
                                        <div class="flex items-center gap-1 px-1.5 py-0.5">
                                            {#if stat.icon === 'circle' || stat.icon === 'alldamagetakenscalar' || !stat.icon}
                                                <div class="w-1.5 h-1.5 rounded-full bg-white/80 shrink-0"></div>
                                            {:else}
                                                <Icon name={stat.icon} class="w-3.5 h-3.5 text-white/90 shrink-0" />
                                            {/if}
                                            <span class="text-white font-nums text-[12px] font-bold leading-none">{stat.value}</span>
                                        </div>
                                    {/each}
                                </div>
                            </div>
                        </a>
                        <div slot="content" class="flex flex-col gap-2.5 text-left max-w-[320px] sm:max-w-[360px] p-1.5 font-sans select-none" use:hyperlinkAction>
                            <div class="flex flex-col border-b border-white/10 pb-1.5 mb-0.5">
                                <span class="font-bold text-[#FFE145] text-sm leading-tight">{wpnName}</span>
                                <div class="flex items-center gap-2 text-xs font-nums mt-1 text-gray-300">
                                    <span class="text-white font-bold">Lv. {wpn.level}</span>
                                    <span class="text-gray-500">•</span>
                                    <span class="text-[#FFE145] font-bold">P{wpn.refineLevel !== undefined ? wpn.refineLevel : 0}</span>
                                    {#if baseAtkStat}
                                        <span class="text-gray-500">•</span>
                                        <span class="text-gray-300">{$t("stats.baseAtk")} <span class="text-[#38BDF8] font-bold">{baseAtkStat.value}</span></span>
                                    {/if}
                                </div>
                            </div>
                            {@const weaponSkills = getWeaponSkillsToRender(wpn, wpnStatic, weaponDetails, opData.class)}
                            {#if weaponSkills.length > 0}
                                <div class="flex flex-col gap-2.5">
                                    {#each weaponSkills as skill}
                                        <div class="flex flex-col gap-0.5">
                                            <div class="flex items-center justify-between gap-2">
                                                <span class="font-bold text-white text-xs leading-snug">{skill.name}</span>
                                                <span class="text-[10px] font-bold font-nums text-gray-400 shrink-0">{skill.rank}/9</span>
                                            </div>
                                            <div class="text-[11px] text-gray-300 leading-relaxed whitespace-pre-line">
                                                {@html skill.descriptionHtml}
                                            </div>
                                        </div>
                                    {/each}
                                </div>
                            {:else}
                                <div class="flex flex-col gap-1.5">
                                    {#each wpnStats as stat}
                                        <div class="flex items-center justify-between text-xs">
                                            <span class="text-white/90">{stat.label}</span>
                                            <span class="text-[#38BDF8] font-bold font-nums">{stat.value}</span>
                                        </div>
                                    {/each}
                                </div>
                            {/if}
                        </div>
                    </Tooltip>
                {:else}
                    <div class="flex flex-col gap-2 items-center justify-center bg-gradient-to-r from-transparent to-[#1a1a1a] border border-white/5 rounded-xl p-6 text-xs text-white/40 italic flex items-center justify-center min-h-[150px]">
                        <Icon name="noData" class="shrink-0 w-6 h-6" />
                        {$t("profile.no_weapon")}
                    </div>
                {/if}

                <div class="grid grid-cols-2 gap-2 flex-1">
                    {#each ['bodyEquip', 'armEquip', 'firstAccessory', 'secondAccessory'] as eqKey}
                        {@const equip = detailedChar?.[eqKey] || selectedChar?.[eqKey]}
                        {#if equip && (equip.equipData || equip.id)}
                            {@const staticId = getStaticEquipId(equip.equipData) || (equipment[equip.id] ? equip.id : (equip.id?.startsWith('item_') ? equip.id : `item_${equip.id}`))}
                            {@const staticEquip = staticId ? equipment[staticId] : null}
                            {@const eqRarity = getEquipRarity(equip, staticEquip)}
                            {@const tier = eqRarity < 5 ? 0 : getEquipTier(equip, staticEquip)}
                            {@const rarityColor = eqRarity === 6 ? "#F4700C" : (eqRarity === 5 ? "#F9B90C" : (eqRarity === 4 ? "#9253F1" : (eqRarity === 3 ? "#26BAFB" : (eqRarity === 2 ? "#AABD00" : "#8F8F8F"))))}
                            {@const statsToRender = (() => {
                                let list = [];
                                if (staticEquip && staticEquip.displayAttr) {
                                    for (const attr of staticEquip.displayAttr) {
                                        const isDef = attr.attrType.toLowerCase() === "def";
                                        const val = attr.values ? (isDef ? attr.values[0] : (attr.values[tier] !== undefined ? attr.values[tier] : attr.values[0])) : undefined;
                                        if (val !== undefined && val !== null && val !== 0) {
                                            const iconName = attr.attrType.toLowerCase() === "maxhp" ? "hp" : attr.attrType.toLowerCase();
                                            const isAllDamage = attr.attrType.toLowerCase() === "alldamagetakenscalar";
                                            const displayVal = isAllDamage ? 1 - val : val;
                                            
                                            let formattedVal = "";
                                            const num = Number(displayVal);
                                            if (!isNaN(num)) {
                                                if (Math.abs(num) > 0 && Math.abs(num) < 1) {
                                                    formattedVal = `+${Math.round(num * 1000) / 10}%`;
                                                } else {
                                                    formattedVal = `+${Math.round(num * 10) / 10}`;
                                                }
                                            } else {
                                                formattedVal = `+${displayVal}`;
                                            }
                                            
                                            const resolvedIcon = resolveAttributeIcon(attr.attrType, iconName);
                                            list.push({
                                                attrType: attr.attrType,
                                                icon: resolvedIcon,
                                                value: formattedVal
                                            });
                                        }
                                    }
                                } else {
                                    const staticDefAttr = staticEquip?.displayAttr?.find(a => a.attrType.toLowerCase() === "def");
                                    if (staticDefAttr) {
                                        list.push({ attrType: "def", icon: "def", value: `+${staticDefAttr.values[tier] || staticDefAttr.values[0]}` });
                                    } else {
                                        list.push({ attrType: "def", icon: "def", value: `+${10 + tier * 5}` });
                                    }
                                    const subProperties = (equip.equipData?.properties || []).filter(p => !p.toLowerCase().includes("def"));
                                    for (const propKey of subProperties) {
                                        const statIcon = resolveAttributeIcon(propKey, "circle");
                                        const displayAttr = matchDisplayAttr(propKey, staticEquip?.displayAttr);
                                        const statVal = displayAttr ? displayAttr.values[tier] || displayAttr.values[0] : null;
                                        if (statVal !== null && statVal !== undefined) {
                                            list.push({ attrType: propKey, icon: statIcon || "circle", value: `+${statVal}` });
                                        }
                                    }
                                }
                                return list;
                            })()}
                            
                            <Tooltip class="w-full h-full">
                                <a href="/equipment/{staticId || equip.equipId}" class="relative flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-all cursor-pointer min-w-0 w-full h-full"
                                   style="background: linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(20,20,20,0.85) 100%) padding-box, linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.15)) border-box;">
                                    <div class="flex flex-col items-start justify-center shrink-0">
                                        {#if eqRarity >= 5}
                                            <div class="w-[26px] h-[18px] flex shrink-0">
                                                <svg class="w-full h-full" viewBox="0 0 54 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <rect x="33.3789" y="15" width="4.23793" height="14.7562" rx="2.11897" transform="rotate(30 33.3789 15)" fill={tier >= 1 ? "#26BAFB" : "#8F8F8F"} />
                                                    <rect x="41.8555" y="15" width="4.23793" height="14.7562" rx="2.11897" transform="rotate(30 41.8555 15)" fill={tier >= 2 ? "#26BAFB" : "#8F8F8F"} />
                                                    <rect x="50.3281" y="15" width="4.23793" height="14.7562" rx="2.11897" transform="rotate(30 50.3281 15)" fill={tier >= 3 ? "#26BAFB" : "#8F8F8F"} />
                                                    <path d="M28 17L20 29H8L0 17L8 5H20L28 17ZM14 12C11.2386 12 9 14.2386 9 17C9 19.7614 11.2386 22 14 22C16.7614 22 19 19.7614 19 17C19 14.2386 16.7614 12 14 12Z" fill={tier >= 3 ? "#26BAFB" : "#8F8F8F"} />
                                                    {#if tier >= 1}
                                                        <path d="M28.0068 17L20.0068 29H8.00684L4.39844 23.5859L9.8877 19.834C10.7895 21.1422 12.2978 22 14.0068 22C16.7683 22 19.0068 19.7614 19.0068 17C19.0068 15.9584 18.6885 14.9912 18.6885 14.1904L23.625 10.4453L28.0068 17Z" fill="#26BAFB" />
                                                    {/if}
                                                    <path d="M31 0L36.1962 9H25.8038L31 0Z" fill={tier >= 3 ? "#26BAFB" : "#8F8F8F"} />
                                                    {#if tier >= 1 && tier < 3}
                                                        <path d="M33.5981 4.5L36.197 9H25.8047L33.5981 4.5Z" fill="#26BAFB" />
                                                    {/if}
                                                </svg>
                                            </div>
                                        {:else}
                                            <div class="h-[12px] mb-1"></div>
                                        {/if}
                                        
                                        <div class="relative w-16 h-16 flex items-center justify-center">
                                            <img src={staticId ? getImagePath(staticId, 'equipment') : (equip.equipData?.iconUrl || '')} alt="Equip" class="w-full h-full object-contain pointer-events-none scale-125" on:error={(e) => { if (equip.equipData?.iconUrl) e.target.src = equip.equipData.iconUrl; }} />
                                        </div>
                                        <div class="w-10 h-[4px] rounded mt-1" style="background-color: {rarityColor};"></div>
                                    </div>

                                    <div class="flex flex-col justify-center flex-1 min-w-0 select-none">
                                        <div class="flex flex-col gap-2">
                                            {#each statsToRender as stat}
                                                <div class="flex items-center gap-1.5 text-xs text-white/90">
                                                    {#if stat.icon === 'circle' || stat.icon === 'alldamagetakenscalar' || !stat.icon}
                                                        <div class="w-1.5 h-1.5 rounded-full bg-white/80 shrink-0"></div>
                                                    {:else}
                                                        <Icon name={stat.icon} class="w-3.5 h-3.5 text-white/80 shrink-0" />
                                                    {/if}
                                                    <span class="font-nums font-bold leading-none text-xs">{stat.value}</span>
                                                </div>
                                            {/each}
                                        </div>
                                    </div>
                                </a>
                                <div slot="content" class="flex flex-col gap-2 text-left max-w-[320px] p-1 font-sans select-none" use:hyperlinkAction>
                                    {#if staticEquip && staticEquip.pack && staticEquip.pack !== "none" && equipLocaleData[staticId]?.setBonus}
                                        {@const packCount = getEquippedPackCount(staticEquip.pack)}
                                        {@const isSetComplete = packCount >= 3}
                                        <div class="flex flex-col gap-0.5">
                                            <div class="flex items-center gap-1.5">
                                                <span class="text-[13px] font-bold text-[#FFE145] leading-tight">
                                                    {tOrFallback(`packs.${staticEquip.pack}`, staticEquip.pack)}
                                                </span>
                                                <span class="text-xs font-nums font-bold {isSetComplete ? 'text-[#38BDF8]' : 'text-gray-400'}">
                                                    ({packCount}/3)
                                                </span>
                                            </div>
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
                                                        {#if isDef}
                                                            {@const defVal = attr.values[0]}
                                                            <td colspan={itemTiers.length} class="py-1 px-0.5 text-center font-nums text-[#38BDF8] font-bold bg-[#38BDF8]/10">
                                                                {#if defVal === 0 || defVal === undefined || defVal === null}
                                                                    -
                                                                {:else if Math.abs(defVal) > 0 && Math.abs(defVal) < 1}
                                                                    {Math.round(defVal * 1000) / 10}%
                                                                {:else}
                                                                    {Math.round(defVal * 10) / 10}
                                                                {/if}
                                                            </td>
                                                        {:else}
                                                            {#each itemTiers as valIndex}
                                                                {@const val = attr.values[valIndex]}
                                                                {@const isAllDamage = attr.attrType.toLowerCase() === "alldamagetakenscalar"}
                                                                {@const displayVal = isAllDamage && val !== undefined ? 1 - val : val}
                                                                {@const isCurrent = valIndex === tier}
                                                                <td class="py-1 px-0.5 text-center font-nums {isCurrent ? 'text-[#38BDF8] font-bold bg-[#38BDF8]/10' : 'text-white/60'}">
                                                                    {#if displayVal === 0 || displayVal === undefined || displayVal === null}
                                                                        -
                                                                    {:else if Math.abs(displayVal) > 0 && Math.abs(displayVal) < 1}
                                                                        {Math.round(displayVal * 1000) / 10}%
                                                                    {:else}
                                                                        {Math.round(displayVal * 10) / 10}
                                                                    {/if}
                                                                </td>
                                                            {/each}
                                                        {/if}
                                                    </tr>
                                                {/each}
                                            {/if}
                                        </tbody>
                                    </table>
                                </div>
                            </Tooltip>
                        {:else}
                            <div class="flex items-center gap-3 bg-[#202020]/20 border border-dashed border-white/5 p-2.5 rounded-xl text-xs text-white/30 select-none h-full min-h-[70px]">
                                <div class="w-12 h-12 flex items-center justify-center border border-dashed border-white/5 rounded bg-black/10 shrink-0">
                                    <Icon name="noData" class="shrink-0 w-4 h-4 opacity-50" />
                                </div>
                                <div class="flex flex-col justify-center min-w-0">
                                    <span class="font-sdk text-white/40 text-xs truncate">{$t("profile.empty_slot")}</span>
                                    <span class="text-[10px] uppercase tracking-wider text-white/20 truncate">
                                        {$t(`equipmentTypes.${eqKey === 'bodyEquip' ? 'body' : (eqKey === 'armEquip' ? 'hand' : 'edc')}`)}
                                    </span>
                                </div>
                            </div>
                        {/if}
                    {/each}
                </div>
            </div>
        </div>
    </div>

    <div class="w-[950px] mx-auto flex justify-end gap-2 mt-1.5">
        <button
            type="button"
            on:click={handleSavePhoto}
            class="flex items-center justify-center px-2.5 py-1.5 rounded-xl text-xs font-bold font-sdk transition-all duration-200 cursor-pointer bg-white/5 hover:bg-white/15 dark:bg-black/30 dark:hover:bg-black/50 text-gray-700 dark:text-gray-200 hover:text-black dark:hover:text-white border border-gray-200/40 dark:border-white/10 active:scale-95 shadow-sm"
        >
            <Icon name="camera" class="w-4 h-3.5" />
        </button>

        <button
            type="button"
            on:click={handleShare}
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-sdk transition-all duration-200 cursor-pointer bg-white/5 hover:bg-white/15 dark:bg-black/30 dark:hover:bg-black/50 text-gray-700 dark:text-gray-200 hover:text-black dark:hover:text-white border border-gray-200/40 dark:border-white/10 active:scale-95 shadow-sm"
        >
            {#if copied}
                <Icon name="success" class="w-3.5 h-3.5 text-[#FFE145]" />
            {:else}
                <Icon name="share" class="w-3.5 h-3.5" />
            {/if}
            <span>{$t("profile.share")}</span>
        </button>
    </div>
</div>
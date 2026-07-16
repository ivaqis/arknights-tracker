<script>
    import { page } from "$app/stores";
    import { t } from "$lib/i18n.js";
    import { getUserProfileByName } from "$lib/api.js";
    import { addNotification } from "$lib/stores/notifications.js";
    import { fade, fly } from "svelte/transition";
    import { characters } from "$lib/data/characters.js";
    import { weapons } from "$lib/data/weapons.js";
    import { getImagePath } from "$lib/utils/imageUtils.js";
    import { getGradientColorByElement } from "$lib/utils/colorUtils.js";
    import ruEquip from "$lib/locales/ru/equipment.json";
    import enEquip from "$lib/locales/en/equipment.json";
    import { currentLocale } from "$lib/stores/locale.js";

    import Icon from "$lib/components/Icon.svelte";
    import Button from "$lib/components/Button.svelte";
    import Modal from "$lib/components/modals/Modal.svelte";
    import Tooltip from "$lib/components/Tooltip.svelte";
    import ContractLevelTag from "$lib/components/profile/ContractLevelTag.svelte";
    import RatingCard from "$lib/components/records/RatingCard.svelte";
    import OperatorDetailsCard from "$lib/components/profile/OperatorDetailsCard.svelte";
    import AccountSummary from "$lib/components/profile/AccountSummary.svelte";
    import CrisisContract from "$lib/components/profile/ContractContainer.svelte";
    import Image from "$lib/components/Image.svelte";

    $: username = $page.params.username;

    let profile = null;
    let loading = true;
    let errorMsg = "";
    let selectedGameUid = null;
    let favoriteGameUid = "";
    let linkCopied = false;
    let copiedUid = null;
    let showFullAvatarModal = false;

    const charactersById = Object.values(characters || {}).reduce((acc, char) => {
        if (char && char.id) acc[char.id] = char;
        return acc;
    }, {});

    const charactersByApiId = Object.values(characters || {}).reduce((acc, char) => {
        if (char && char.apiId) acc[char.apiId] = char;
        return acc;
    }, {});

    function getSvelteCharId(char) {
        if (!char) return "";
        return char.id || char.charId || char.charData?.id || "";
    }

    function mapProfessionToClass(key) {
        if (!key) return "guard";
        return key.replace("profession_", "");
    }

    function mapPropertyToElement(key) {
        if (!key) return null;
        return key.replace("char_property_", "");
    }

    function getOperatorData(char) {
        const svelteId = getSvelteCharId(char);
        const staticData = charactersById[svelteId] || charactersByApiId[svelteId];
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

    function getWeaponData(weapon) {
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

    function getWeaponIcon(weapon) {
        if (!weapon) return "";
        const mapped = getWeaponData(weapon);
        const wpnId = mapped?.id || weapon.id;
        if (wpnId) {
            return getImagePath(wpnId, "weapon-icon");
        }
        return weapon.icon || "";
    }

    function getWeaponTerms(wpn) {
        if (!wpn) return [];
        if (wpn.weaponTerms && wpn.weaponTerms.length > 0) {
            return wpn.weaponTerms;
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

        let base = baseTermsMap[gameId];
        if (!base) {
            if (rarity === 6) base = [5, 3, 1];
            else if (rarity === 5) base = [2, 2, 1];
            else if (rarity === 4) base = [1, 1, 1];
            else base = [1, 1];
        }

        let lower_current_1 = 1;
        let lower_current_2 = 1;
        let lower_max_1 = 3;
        let lower_max_2 = 3;

        if (rarity === 3) {
            lower_max_1 = 5;
            if (level < 20) lower_current_1 = 1;
            else if (level < 40) lower_current_1 = 2;
            else if (level < 60) lower_current_1 = 3;
            else if (level < 80) lower_current_1 = 4;
            else lower_current_1 = 5;
        } else {
            if (level < 20) {
                lower_current_1 = 1;
                lower_current_2 = 1;
            } else if (level < 40) {
                lower_current_1 = 2;
                lower_current_2 = 1;
            } else if (level < 60) {
                lower_current_1 = 2;
                lower_current_2 = 2;
            } else if (level < 80) {
                lower_current_1 = 3;
                lower_current_2 = 2;
            } else {
                lower_current_1 = 3;
                lower_current_2 = 3;
            }
        }

        let term1 = Math.ceil(base[0] * (lower_current_1 / lower_max_1));
        let term2 = base[1] ? Math.ceil(base[1] * (lower_current_2 / lower_max_2)) : 0;
        let term3 = base[2] || 1;

        if (base.length >= 3) {
            term3 += refine;
        }

        if (wpn.gem && wpn.gem.gemData) {
            const gemRarity = wpn.gem.gemData.templateId === "item_gem_rarity_5" ? 5 : 4;
            const hasMatchingTerm = !!wpn.gem.gemData.termId;

            if (gemRarity === 5) {
                term1 += 4;
                if (base[1]) term2 += 4;
                if (hasMatchingTerm && base.length >= 3) {
                    term3 += 2;
                }
            } else if (gemRarity === 4) {
                term1 += 2;
                if (base[1]) term2 += 2;
                if (hasMatchingTerm && base.length >= 3) {
                    term3 += 1;
                }
            }
        }

        return base.length >= 3 ? [term1, term2, term3] : (base.length === 2 ? [term1, term2] : [term1]);
    }

    function getStaticEquipId(equipData) {
        if (!equipData) return null;
        const nameToMatch = equipData.name;
        if (!nameToMatch) return null;

        let matched = Object.keys(equipmentNames).find(key => equipmentNames[key]?.name === nameToMatch);
        if (matched) return matched;

        matched = Object.keys(ruEquip).find(key => ruEquip[key]?.name === nameToMatch);
        if (matched) return matched;

        matched = Object.keys(enEquip).find(key => enEquip[key]?.name === nameToMatch);
        if (matched) return matched;

        return null;
    }

    let equipmentNames = {};
    $: if (typeof window !== 'undefined' && $currentLocale) {
        loadEquipmentNames($currentLocale);
    }
    async function loadEquipmentNames(lang) {
        try {
            const safeLang = (lang || "en").toLowerCase().replace("-", "");
            const mod = await import(`../../../lib/locales/${safeLang}/equipment.json`);
            equipmentNames = mod.default || mod;
        } catch (e) {
            try {
                const mod = await import(`../../../lib/locales/en/equipment.json`);
                equipmentNames = mod.default || mod;
            } catch (err) {}
        }
    }

    $: if (username) {
        loadProfile(username);
    }

    async function loadProfile(name) {
        loading = true;
        errorMsg = "";
        try {
            const data = await getUserProfileByName(name);
            if (!data) {
                errorMsg = "Profile not found";
                profile = null;
            } else {
                profile = data;
                favoriteGameUid = profile.favorite_game_uid || "";
                // Parse details
                if (profile.details) {
                    profile.details = profile.details.map(d => {
                        let parsedInfo = {};
                        try {
                            parsedInfo = typeof d.account_info === "string" ? JSON.parse(d.account_info) : d.account_info;
                        } catch (e) {
                            console.error("Failed to parse detail account_info:", e);
                        }
                        return {
                            ...d,
                            info: parsedInfo
                        };
                    });
                    if (profile.details.length > 0) {
                        const fav = favoriteGameUid;
                        const hasFav = profile.details.some(d => d.game_uid === fav);
                        selectedGameUid = hasFav ? fav : profile.details[0].game_uid;
                    }
                }
            }
        } catch (e) {
            errorMsg = e.message || "Failed to load profile";
        } finally {
            loading = false;
        }
    }

    $: sortedDetails = (() => {
        const details = profile?.details || [];
        if (!favoriteGameUid) return details;
        return [...details].sort((a, b) => {
            if (a.game_uid === favoriteGameUid) return -1;
            if (b.game_uid === favoriteGameUid) return 1;
            return 0;
        });
    })();

    $: activeAccount = profile?.details?.find(d => d.game_uid === selectedGameUid) || sortedDetails?.[0];

    $: sortedChars = (() => {
        const chars = activeAccount?.info?.chars || [];
        return [...chars].sort((a, b) => {
            const aData = getOperatorData(a);
            const bData = getOperatorData(b);
            const aRarity = aData?.rarity || 0;
            const bRarity = bData?.rarity || 0;
            if (bRarity !== aRarity) {
                return bRarity - aRarity;
            }
            const aLevel = a?.level || 0;
            const bLevel = b?.level || 0;
            if (bLevel !== aLevel) {
                return bLevel - aLevel;
            }
            return (aData?.id || "").localeCompare(bData?.id || "");
        });
    })();

    let selectedOperatorId = null;
    let prevGameUid = null;

    $: if (selectedGameUid !== prevGameUid) {
        prevGameUid = selectedGameUid;
        if (sortedChars && sortedChars.length > 0) {
            selectedOperatorId = sortedChars[0].id;
        }
    }

    $: selectedChar = sortedChars.find(c => c.id === selectedOperatorId) || sortedChars[0];
    $: selectedDetailedChar = selectedChar ? getDetailedChar(selectedChar.id) : null;
    let selectedCharDetails = null;
    let currentFetchId = null;
    $: if (selectedChar) {
        const svelteId = getSvelteCharId(selectedChar);
        currentFetchId = svelteId;
        selectedCharDetails = null;
        if (svelteId) {
            import(`../../../lib/data/charactersData/${svelteId}.json`)
                .then(mod => {
                    if (currentFetchId === svelteId) {
                        selectedCharDetails = mod.default || mod;
                    }
                })
                .catch(err => {
                    console.warn("Failed to load details for", svelteId, err);
                    selectedCharDetails = null;
                });
        } else {
            selectedCharDetails = null;
        }
    }

    let selectedCharLocale = null;
    let currentLocaleFetchId = null;
    let currentLocaleFetchLang = null;
    $: if (selectedChar && $currentLocale) {
        const svelteId = getSvelteCharId(selectedChar);
        const lang = ($currentLocale || "en").toLowerCase().replace("-", "");
        currentLocaleFetchId = svelteId;
        currentLocaleFetchLang = lang;
        selectedCharLocale = null;
        if (svelteId) {
            import(`../../../lib/locales/${lang}/characters/${svelteId}.json`)
                .then(mod => {
                    if (currentLocaleFetchId === svelteId && currentLocaleFetchLang === lang) {
                        selectedCharLocale = mod.default || mod;
                    }
                })
                .catch(err => {
                    if (lang !== "en") {
                        import(`../../../lib/locales/en/characters/${svelteId}.json`)
                            .then(mod => {
                                if (currentLocaleFetchId === svelteId && currentLocaleFetchLang === lang) {
                                    selectedCharLocale = mod.default || mod;
                                }
                            })
                            .catch(err2 => {
                                console.warn("Failed to load fallback en locale for", svelteId, err2);
                                if (currentLocaleFetchId === svelteId && currentLocaleFetchLang === lang) {
                                    selectedCharLocale = null;
                                }
                            });
                    } else {
                        console.warn("Failed to load locale for", svelteId, err);
                        if (currentLocaleFetchId === svelteId && currentLocaleFetchLang === lang) {
                            selectedCharLocale = null;
                        }
                    }
                });
        } else {
            selectedCharLocale = null;
        }
    }

    let selectedWeaponDetails = null;
    let currentWeaponFetchId = null;
    $: if (selectedDetailedChar?.weapon) {
        const wpnStatic = getWeaponData(selectedDetailedChar.weapon);
        const wpnId = wpnStatic?.id;
        if (wpnId) {
            currentWeaponFetchId = wpnId;
            import(`../../../lib/data/weaponsData/${wpnId}.json`)
                .then(mod => {
                    if (currentWeaponFetchId === wpnId) {
                        selectedWeaponDetails = mod.default || mod;
                    }
                })
                .catch(err => {
                    console.warn("Failed to load weapon details for", wpnId, err);
                    selectedWeaponDetails = null;
                });
        } else {
            selectedWeaponDetails = null;
        }
    } else {
        selectedWeaponDetails = null;
    }

    $: talentsList = selectedChar ? getTalents(selectedChar, selectedDetailedChar, selectedCharDetails, selectedCharLocale) : [];
    $: opData = selectedChar ? getOperatorData(selectedChar) : null;
    $: detailedChar = selectedDetailedChar;
    $: svelteId = selectedChar ? getSvelteCharId(selectedChar) : "";
    $: targetCharData = detailedChar?.charData || selectedChar?.charData;
    $: elementColor = opData ? (getGradientColorByElement(opData.element) || "from-white/5 to-transparent") : "from-white/5 to-transparent";

    function getDetailedChar(charId) {
        if (!activeAccount?.info?.chars) return null;
        return activeAccount.info.chars.find(c => c.charData?.id === charId || c.id === charId);
    }

    function getEquipTier(levelStr, rarity) {
        const val = parseInt(levelStr?.replace("equip_level_", "") || levelStr) || 0;
        const r = Number(rarity) || 4;
        if (r < 5) return 0;
        if (val >= 70) return 3;
        if (val >= 50) return 2;
        if (val >= 36) return 1;
        return 0;
    }

    function getEquipRarity(equip, staticEquip) {
        if (staticEquip?.rarity) return Number(staticEquip.rarity);
        const key = equip?.equipData?.rarity?.key || "";
        const match = key.match(/equip_rarity_(\d+)/);
        if (match) return parseInt(match[1]);
        const val = Number(equip?.equipData?.rarity?.value || equip?.rarity);
        return isNaN(val) ? 4 : val;
    }

    function getPropertyLabel(propKey) {
        if (!propKey) return "Stat";
        const rawKey = propKey.replace("equip_attr_", "").replace("equip_", "");
        const lowerKey = rawKey.toLowerCase();
        
        const transKey = `stats.${rawKey}`;
        const trans = $t(transKey);
        if (trans && trans !== transKey) return trans;

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

    function getStatIcon(propKey) {
        if (!propKey) return null;
        const key = propKey.toLowerCase();
        if (key.includes("wisd") || key.includes("int")) return "int";
        if (key.includes("str")) return "str";
        if (key.includes("agi")) return "agi";
        if (key.includes("will")) return "will";
        if (key.includes("def")) return "def";
        if (key.includes("maxhp") || key.includes("hp")) return "hp";
        if (key.includes("atk")) return "atk";
        if (key.includes("sp_gain") || key.includes("usp")) return "usp";
        if (key.includes("heal")) return "heal";
        if (key.includes("vulnerable") || key.includes("magicdam")) return "magicdam";
        if (key.includes("normal_skill_damage")) return "normalskillefficiency";
        if (key.includes("combo_skill_damage")) return "comboskillefficiency";
        if (key.includes("normal_attack_damage")) return "normalattackdamageincrease";
        if (key.includes("physical_damage")) return "physicaldamageincrease";
        if (key.includes("physical_and_spellinfliction") || key.includes("spellinfliction")) return "magicdam";
        if (key.includes("cryst_and_pulse_damage")) return "alldamagetakenscalar";
        if (key.includes("all_skill_damage")) return "alldamagetakenscalar";
        if (key.includes("spell_damage")) return "alldamagetakenscalar";
        if (key.includes("sub")) return "alldamagetakenscalar";
        return null;
    }

    function getCultivationLabel(node, lvl) {
        if (!node) return lvl.toString();
        const match = node.name.match(/[αβγ]\s*$/);
        return match ? match[0] : lvl.toString();
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

    function getTalents(char, detailedChar, staticDetails = null, charLocale = null) {
        if (!char?.charData) return [];
        const svelteId = getSvelteCharId(char);
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
                talentIdx = parseInt(match[1], 10);
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
            const baseName = node.name.replace(/\s*[αβγ]\s*$/, "").trim();
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
                    const parsedIdx = parseInt(parts[parts.length - 2], 10);
                    if (!isNaN(parsedIdx)) {
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
                        totalValue += parseInt(valMatch[1], 10);
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

    function getServerLabel(serverId) {
        return serverId === "2" ? "Asia" : "Americas / Europe";
    }

    function getAvatarUrl(pictureId) {
        if (pictureId) return `https://goyfield.moe/uploads/${pictureId}.webp`;
        return "";
    }

    function handleCopyProfileLink() {
        if (!profile || !profile.name) return;
        const link = `${window.location.origin}/u/${profile.name}`;
        navigator.clipboard.writeText(link).then(() => {
            linkCopied = true;
            setTimeout(() => {
                linkCopied = false;
            }, 2000);
        }).catch(err => {
            console.error("Failed to copy link: ", err);
            addNotification("error", $t("profile.copy_failed") || "Failed to copy");
        });
    }

    function handleCopyUid(uid) {
        navigator.clipboard.writeText(uid).then(() => {
            copiedUid = uid;
            setTimeout(() => {
                if (copiedUid === uid) copiedUid = null;
            }, 2000);
        }).catch(err => {
            console.error("Failed to copy UID: ", err);
            addNotification("error", $t("profile.copy_failed") || "Failed to copy");
        });
    }
</script>

<svelte:head>
    <title>{username ? `${username} - Profile | Goyfield` : 'Player Profile | Goyfield'}</title>
</svelte:head>

<div class="max-w-[1800px] w-full mx-auto pb-20">
    {#if profile && profile.background}
        <div class="fixed inset-0 w-[100vw] h-[100vh] pointer-events-none z-0 flex items-center justify-center overflow-hidden">
            <div class="w-full h-full object-cover opacity-65 dark:opacity-55 transform scale-105">
                <Image id={profile.background} variant="operator-art" size="100%" />
            </div>
            <div class="absolute inset-0 bg-black/5 dark:bg-black/15 z-10"></div>
            <div class="absolute bottom-0 left-0 right-0 h-[30vh] bg-gradient-to-t dark:from-[#2a2a2a] from-[#F0F2F4] to-transparent z-10"></div>
        </div>
    {/if}
    {#if loading}
        <div class="flex items-center justify-center min-h-[60vh]">
            <Icon name="loading" class="w-12 h-12 text-[#FFE145] animate-spin" />
        </div>
    {:else if errorMsg}
        <div class="flex flex-col items-center justify-center min-h-[80vh] text-center relative z-10" in:fade>
            <div class="bg-white/5 border border-white/10 p-8 rounded-2xl max-w-md backdrop-blur-md shadow-2xl">
                <img src="/images/empty.png" alt="Empty" class="w-36 h-auto object-contain mb-4 mx-auto select-none pointer-events-none" />
                <h3 class="text-xl font-bold dark:text-white text-gray-900 mb-2 font-sdk">
                    {errorMsg === "Profile not found" ? $t("profile.profile_not_found") : $t("profile.profile_hidden")}
                </h3>
                <p class="text-sm dark:text-gray-400 text-gray-600">
                    {errorMsg === "Profile not found" 
                        ? $t("profile.profile_not_registered_desc", { username }) 
                        : $t("profile.profile_hidden_desc")}
                </p>
                <Button variant="yellow" onClick={() => window.location.href = '/leaderboard'} className="mt-6 ">
                    <div slot="icon">
                        <Icon name="arrowLeft" class="w-5 h-5" />
                    </div>
                    {$t("profile.error_return_btn")}
                </Button>
            </div>
        </div>
    {:else if profile}
        <div class="space-y-6 relative z-10" in:fade>
            <div class="{!profile?.background ? 'bg-white dark:bg-[#383838] border border-white/10' : 'bg-white/5 border dark:bg-[#383838]/5 dark:border-[#444444]/20 border-white/20'} rounded-2xl p-6 backdrop-blur-sm shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div class="flex items-center gap-4">
                    <div class="relative group shrink-0 w-28 h-28">
                        <button
                            type="button"
                            class="w-full h-full rounded-md border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#FFE145] transition-all overflow-hidden {getAvatarUrl(profile.picture) ? 'cursor-zoom-in' : 'cursor-default'}"
                            on:click={() => {
                                if (getAvatarUrl(profile.picture)) {
                                    showFullAvatarModal = true;
                                }
                            }}
                            aria-label="View avatar"
                        >
                            {#if getAvatarUrl(profile.picture)}
                                <img
                                    src={getAvatarUrl(profile.picture)}
                                    alt="User Avatar"
                                    class="w-full h-full object-cover"
                                />
                            {:else}
                                <div class="w-full h-full bg-white/10 flex items-center justify-center text-white/50 text-3xl font-bold">
                                    {profile.name ? profile.name[0].toUpperCase() : "?"}
                                </div>
                            {/if}
                        </button>
                    </div>

                    <div class="flex flex-col gap-1 relative">
                        <div class="flex items-center gap-2">
                            <h1 class="text-3xl font-bold dark:text-white text-gray-900 font-sdk">
                                {profile.name}
                            </h1>
                            <Tooltip text={$t("profile.copy_profile_link") || "Copy profile link"}>
                                <button on:click={handleCopyProfileLink} class="text-gray-400 hover:text-white transition-colors flex items-center justify-center w-6 h-6">
                                    {#if linkCopied}
                                        <Icon name="success" class="w-3.5 h-3.5 text-yellow-400" />
                                    {:else}
                                        <Icon name="link" class="w-4 h-4" />
                                    {/if}
                                </button>
                            </Tooltip>
                        </div>
                        {#if profile.avatar_strike === 1}
                            <span class="text-[10px] text-orange-400 font-bold flex items-center gap-1 mt-1">
                                <Icon name="warning" class="w-3.5 h-3.5" />
                                {$t("profile.strike_warning")}
                            </span>
                        {/if}
                    </div>
                </div>

                <div class="flex flex-wrap items-center gap-4">
                    {#if sortedDetails && sortedDetails.length > 0}
                        {#each sortedDetails as d}
                            <div
                                on:click={() => selectedGameUid = d.game_uid}
                                on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') selectedGameUid = d.game_uid; }}
                                role="button"
                                tabindex="0"
                                class="{!profile?.background ? 'bg-gray-100/80' : 'bg-gray-100/25'}  dark:bg-black/20 backdrop-blur-md border text-left p-3 rounded-xl flex items-center gap-4 w-[285px] hover:bg-gray-400/15 dark:hover:bg-black/35 transition-all relative group cursor-pointer select-none outline-none focus-visible:ring-1 focus-visible:ring-[#FFE145]
                                {selectedGameUid === d.game_uid ? 'border-2 border-[#FFE145]' : 'border-2 border-white/10 dark:border-gray-400/20'}"
                            >
                                <img
                                    src={d.info?.base?.avatarUrl || (d.info?.chars?.[0]?.charData?.avatarSqUrl) || "/images/operators/icons/endministrator1.png"}
                                    alt="Roster Leader"
                                    referrerpolicy="no-referrer"
                                    class="w-12 h-12 rounded bg-white/10 border border-white/20 object-cover shrink-0"
                                    on:error={(e) => e.target.src = '/images/operators/icons/endministrator1.png'}
                                />
                                <div class="flex-1 min-w-0 flex flex-col gap-0.5">
                                    <div class="flex items-center gap-1.5">
                                        <span class="text-md font-bold dark:text-white text-gray-900 font-sdk truncate">{d.info?.base?.name || "Profile"}</span>
                                        <ContractLevelTag level={d.info?.contract?.level || 0} />
                                    </div>
                                    <div class="text-[10px] text-gray-500 dark:text-gray-400 font-mono truncate flex items-center gap-1">
                                        <span>UID: {d.game_uid}</span>
                                        <Tooltip text={$t("profile.copy_uid") || "Copy UID"}>
                                            <button 
                                                on:click|stopPropagation={() => handleCopyUid(d.game_uid)} 
                                                class="text-gray-500 hover:text-gray-600 hover:dark:text-white transition-colors cursor-pointer flex items-center justify-center p-0.5"
                                            >
                                                {#if copiedUid === d.game_uid}
                                                    <Icon name="success" class="w-3.5 h-3.5 text-yellow-400" />
                                                {:else}
                                                    <Icon name="copy" class="w-3 h-3 opacity-60 hover:opacity-100" />
                                                {/if}
                                            </button>
                                        </Tooltip>
                                    </div>
                                    <div class="bg-gray-200 text-gray-600 dark:bg-[#383838] dark:text-[#B0B0B0] px-1.5 py-0.5 rounded text-[9px] font-medium font-sans w-fit truncate">
                                        {getServerLabel(d.info?.base?.serverId)}
                                    </div>
                                </div>
                                <div class="flex flex-col items-center justify-center shrink-0 min-w-[36px] border-l border-white/10 pl-3">
                                    <span class="bg-gray-800 text-white dark:bg-white dark:text-black font-black text-[9px] px-1 tracking-tighter uppercase leading-none mb-0.5 select-none">Lv.</span>
                                    <span class="text-2xl font-black dark:text-white text-gray-900 font-mono leading-none">{d.info?.base?.level || 1}</span>
                                </div>
                            </div>
                        {/each}
                    {/if}
                </div>
            </div>

            {#if activeAccount}
                <div class="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-[320px_435px_1fr] gap-6" in:fade>
                    
                    <div class="space-y-6">
                        <AccountSummary 
                            stats={activeAccount.info?.stats || {}} 
                            totalCharsCount={Object.keys(charactersById).length} 
                            profileBackground={!profile?.background}
                        />

                        {#if activeAccount?.records_uid}
                            <div class="min-w-0 flex flex-col">
                                <RatingCard customGameUid={activeAccount.records_uid} isProfile={true} hideBorders={!!profile?.background} />
                            </div>
                        {/if}
                    </div>

                    <CrisisContract
                        contract={activeAccount.info?.contract}
                        hasBackground={!!profile?.background}
                    />

                    <div class="col-span-1 xl:col-span-2 2xl:col-span-1 w-full min-w-0 overflow-hidden">
                        <div class="{!profile?.background ? 'bg-white dark:bg-[#383838] border border-white/10' : 'bg-white/5 border dark:bg-[#383838]/5 dark:border-[#444444]/20 border-white/20'} rounded-xl p-5 flex flex-col w-full mx-auto backdrop-blur-sm shadow-sm min-w-0 overflow-hidden">
                            <div class="flex items-center justify-between border-b {!profile?.background ? 'border-gray-100 dark:border-[#444444]' : 'border-gray-100/30 dark:border-[#444444]/30'} pb-3 mb-3">
                                <div class="flex gap-2">
                                    <Icon name="operators" class="w-6 h-6 text-[#21272C] dark:text-[#FDFDFD]" />
                                    <h2 class="text-xl font-bold text-[#21272C] dark:text-[#FDFDFD] font-sdk">
                                        {$t("profile.operators_title")}
                                    </h2>
                                </div>
                            </div>
                            <div class="flex gap-3.5 overflow-x-auto pb-2.5 whitespace-nowrap max-w-full justify-start items-center">
                                {#each sortedChars as char}
                                    {@const opData = getOperatorData(char)}
                                    {@const isSelected = char.id === selectedOperatorId}
                                    <div class="relative w-12 h-12 shrink-0 flex items-center justify-center">
                                        <button
                                            on:click={() => selectedOperatorId = char.id}
                                            class="w-11 h-11 rounded-full border-2 transition-all duration-300 outline-none cursor-pointer
                                            {isSelected ? 'ring-2 ring-gray-400 dark:ring-white shadow-md dark:border-gray-500'  : 'border-[#FF6600]/80 hover:opacity-85'}"
                                        >
                                            <Image id={opData.id} variant="operator-icon" className="w-full h-full object-cover rounded-full" />
                                        </button>
                                        <div class="absolute -bottom-1 -right-1 z-10 px-1 py-0.5 text-[12px] text-white bg-black/40 rounded-md leading-none font-nums select-none shadow-xl">
                                            {char.level}
                                        </div>
                                    </div>
                                {/each}
                            </div>

                            {#if selectedChar}
                                {#key selectedOperatorId}
                                    <OperatorDetailsCard
                                        {selectedChar}
                                        {detailedChar}
                                        {opData}
                                        {targetCharData}
                                        {elementColor}
                                        {svelteId}
                                        {talentsList}
                                        {getWeaponData}
                                        {getWeaponIcon}
                                        {getWeaponTerms}
                                        {getStaticEquipId}
                                        {getEquipRarity}
                                        {getEquipTier}
                                        {getStatIcon}
                                        charDetails={selectedCharDetails}
                                        charLocale={selectedCharLocale}
                                        weaponDetails={selectedWeaponDetails}
                                    />
                                {/key}
                            {/if}
                        </div>
                    </div>

                </div>
            {:else}
                <div class="{!profile?.background ? 'bg-white dark:bg-[#383838] border border-white/10' : 'bg-white/5 border dark:bg-[#383838]/5 dark:border-[#444444]/20 border-white/20'} rounded-2xl p-12 text-center backdrop-blur-sm text-gray-500 dark:text-gray-400 font-mono text-sm shadow-sm leading-relaxed" in:fade>
                    {$t("profile.no_connected_accounts")}
                </div>
            {/if}
        </div>
    {/if}

    <Modal isOpen={showFullAvatarModal} on:close={() => showFullAvatarModal = false}>
        <div class="relative max-w-[90vw] max-h-[90vh] flex flex-col items-center select-none">
            <button
                on:click={() => showFullAvatarModal = false}
                class="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors bg-black/40 p-2 rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FFE145]"
                aria-label="Close"
            >
                <Icon name="close" class="w-6 h-6" />
            </button>
            <img
                src={getAvatarUrl(profile?.picture)}
                alt="Avatar Fullsize"
                class="max-w-full max-h-[80vh] rounded-2xl border border-white/20 shadow-2xl object-contain select-text"
            />
        </div>
    </Modal>
</div>

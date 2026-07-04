<script>
    import { onMount } from "svelte";
    import { t } from "$lib/i18n.js";
    import { user, login, logout } from "$lib/stores/cloudStore.js";
    import { getUserProfile, registerProfile, syncGameAccount, uploadAvatar, deleteGameAccount } from "$lib/api.js";
    import { addNotification } from "$lib/stores/notifications.js";
    import { fade, fly } from "svelte/transition";
    import { characters } from "$lib/data/characters.js";
    import { weapons } from "$lib/data/weapons.js";
    import { equipment } from "$lib/data/items/equipment.js";
    import { getImagePath } from "$lib/utils/imageUtils.js";
    import { getRarityColor, getGradientColorByElement } from "$lib/utils/colorUtils.js";
    import ruEquip from "$lib/locales/ru/equipment.json";
    import enEquip from "$lib/locales/en/equipment.json";
    import { currentLocale } from "$lib/stores/locale.js";
    import { formatContractDescription } from "$lib/utils/richText.js";
    import { accountStore } from "$lib/stores/accounts.js";

    import Icon from "$lib/components/Icon.svelte";
    import Button from "$lib/components/Button.svelte";
    import Modal from "$lib/components/modals/Modal.svelte";
    import ConfirmationModal from "$lib/components/modals/ConfirmationModal.svelte";
    import Checkbox from "$lib/components/Checkbox.svelte";
    import OperatorCard from "$lib/components/cards/OperatorCard.svelte";
    import Image from "$lib/components/Image.svelte";
    import PotentialIcon from "$lib/components/operators/PotentialIcon.svelte";
    import AsscentionIcon from "$lib/components/operators/AscensionIcon.svelte";
    import Tooltip from "$lib/components/Tooltip.svelte";
    import ContractLevelTag from "$lib/components/profile/ContractLevelTag.svelte";
    import CropModal from "$lib/components/profile/CropModal.svelte";
    import SettingsModal from "$lib/components/profile/SettingsModal.svelte";
    import SyncModal from "$lib/components/profile/SyncModal.svelte";
    import RatingCard from "$lib/components/records/RatingCard.svelte";
    import Select from "$lib/components/Select.svelte";
    import ContractCard from "$lib/components/profile/ContractCard.svelte";
    import OperatorDetailsCard from "$lib/components/profile/OperatorDetailsCard.svelte";
    import AccountSummary from "$lib/components/profile/AccountSummary.svelte";

    const { accounts } = accountStore;

    let profile = null;
    let linkCopied = false;
    let copiedUid = null;
    let loading = true;
    let needsRegistration = false;
    let syncModalOpen = false;
    let settingsModalOpen = false;
    let showCropModal = false;
    let showFullAvatarModal = false;
    let cropImageSrc = "";
    let cropModal;
    let isEditingName = false;
    let newProfileName = "";
    let showNameWarning = false;
    let warningTimeout = null;

    function handleNameInput(e) {
        const inputVal = e.target.value;
        const sanitized = inputVal.replace(/[^a-zA-Z0-9_]/g, "");
        if (inputVal !== sanitized) {
            showNameWarning = true;
            if (warningTimeout) clearTimeout(warningTimeout);
            warningTimeout = setTimeout(() => {
                showNameWarning = false;
            }, 3000);
        }
        newProfileName = sanitized;
        e.target.value = sanitized;
    }
    let avatarInput;
    let isPrivate = false;

    let bgSearchQuery = "";
    $: availableBackgrounds = Object.values(characters || {})
        .filter(char => char.id && char.id !== "endministrator1" && char.id !== "endministrator2")
        .flatMap(char => [
            { id: `${char.id}_potential1`, name: char.name, pot: 1 },
            { id: `${char.id}_potential3`, name: char.name, pot: 3 },
            { id: `${char.id}_potential5`, name: char.name, pot: 5 }
        ]);

    $: primaryAccountOptions = [
        { value: "", label: $t("profile.settings_primary_account_none") },
        ...($accounts || []).filter(a => a.serverUid).map(a => ({
            value: a.serverUid,
            label: a.name,
            subLabel: getServerLabel(a.serverId || "3")
        }))
    ];

    $: filteredBackgrounds = availableBackgrounds.filter(bg => {
        if (!bgSearchQuery) return true;
        const query = bgSearchQuery.toLowerCase();
        const localizedName = ($t(`characters.${bg.id.split('_')[0]}`) || bg.name).toLowerCase();
        return bg.name.toLowerCase().includes(query) || localizedName.includes(query);
    });

    async function handleSelectBackground(bgId) {
        try {
            const token = await $user.getIdToken();
            const data = await registerProfile(token, profile.name, profile.picture, profile.is_private, bgId || null, profile.records_uid);
            profile.background = data.background;
            addNotification("success", $t("profile.background_updated") || "Profile background updated!");
        } catch (e) {
            addNotification("error", e.message);
        }
    }

    async function handleSelectRecordsUid(recordsUid) {
        if (!activeAccount) return;
        try {
            const token = await $user.getIdToken();
            const data = await registerProfile(
                token,
                profile.name,
                profile.picture,
                profile.is_private,
                profile.background,
                recordsUid || null,
                activeAccount.game_uid
            );
            const details = (data.details || []).map(d => {
                try {
                    return { ...d, info: typeof d.account_info === 'string' ? JSON.parse(d.account_info) : d.account_info };
                } catch (e) {
                    return { ...d, info: {} };
                }
            });
            profile = { ...profile, details };
            addNotification("success", $t("profile.primary_account_updated") || "Primary game account updated!");
        } catch (e) {
            console.error("[handleSelectRecordsUid] Error:", e);
            addNotification("error", e.message);
        }
    }

    const charactersById = Object.values(characters || {}).reduce((acc, char) => {
        if (char && char.id) acc[char.id] = char;
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
        const staticData = charactersById[svelteId];
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

        // Переделать (говно)
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

    function getEquipIcon(equip) {
        if (!equip) return "";
        const staticId = getStaticEquipId(equip.equipData) || equip.id;
        if (staticId) {
            return getImagePath(staticId, "equipment");
        }
        return equip.icon || (equip.equipData?.iconUrl || "");
    }

    let equipmentNames = {};
    $: if (typeof window !== 'undefined' && $currentLocale) {
        loadEquipmentNames($currentLocale);
    }
    async function loadEquipmentNames(lang) {
        try {
            const safeLang = (lang || "en").toLowerCase().replace("-", "");
            const mod = await import(`../../lib/locales/${safeLang}/equipment.json`);
            equipmentNames = mod.default || mod;
        } catch (e) {
            try {
                const mod = await import(`../../lib/locales/en/equipment.json`);
                equipmentNames = mod.default || mod;
            } catch (err) {}
        }
    }

    $: if (profile) {
        isPrivate = profile.is_private === 1;
    }

    async function handleTogglePrivate() {
        try {
            const token = await $user.getIdToken();
            const nextPrivateVal = isPrivate ? 0 : 1;
            const data = await registerProfile(token, profile.name, profile.picture, nextPrivateVal, profile.background, profile.records_uid);
            profile.is_private = data.is_private;
            isPrivate = data.is_private === 1;
            addNotification("success", $t("profile.privacy_settings_updated") || "Privacy settings updated!");
        } catch (e) {
            addNotification("error", e.message);
        }
    }
    let testEmptySlot = false;
    let selectedGameUid = null;
    $: activeAccount = profile?.details?.find(d => d.game_uid === selectedGameUid) || profile?.details?.[0];
    $: contractChars = (() => {
        const chars = activeAccount?.info?.contract?.chars || [];
        let list = [...chars];
        if (testEmptySlot && list.length > 0) {
            list[list.length - 1] = null;
        }
        while (list.length < 4) {
            list.push(null);
        }
        return list;
    })();
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
        if (svelteId) {
            import(`../../lib/data/charactersData/${svelteId}.json`)
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
        if (svelteId) {
            import(`../../lib/locales/${lang}/characters/${svelteId}.json`)
                .then(mod => {
                    if (currentLocaleFetchId === svelteId && currentLocaleFetchLang === lang) {
                        selectedCharLocale = mod.default || mod;
                    }
                })
                .catch(err => {
                    if (lang !== "en") {
                        import(`../../lib/locales/en/characters/${svelteId}.json`)
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
        const mappings = {
            "equip_attr_wisd": "Wisdom",
            "equip_attr_str": "Strength",
            "equip_attr_agi": "Agility",
            "equip_attr_will": "Willpower",
            "equip_attr_def": "Defense",
            "equip_attr_maxhp": "HP",
            "equip_attr_ultimate_sp_gain_scalar": "SP Gain",
            "equip_attr_atk": "Attack",
            "equip_attr_ultimate_sp_gain": "SP Gain",
            "equip_attr_heal_scalar": "Healing",
            "equip_attr_spell_vulnerable": "Vulnerability"
        };
        const key = propKey?.toLowerCase() || "";
        const transKey = `stats.${propKey?.replace("equip_attr_", "")}`;
        const trans = $t(transKey);
        if (trans && trans !== transKey) return trans;
        for (const [k, v] of Object.entries(mappings)) {
            if (key.includes(k)) return v;
        }
        return propKey?.replace("equip_attr_", "").toUpperCase() || "Stat";
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

        if (equipment[equipData.id]) return equipData.id;
        return null;
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

    let localAvatar = "";

    onMount(async () => {
        if (typeof window !== 'undefined') {
            localAvatar = localStorage.getItem("goyfield_local_avatar") || "";
        }
        
        const unsubscribe = user.subscribe(async (u) => {
            if (u) {
                loading = true;
                const data = await getUserProfile(u.uid);
                if (data) {
                    profile = data;
                    if (profile.details) {
                        profile.details = profile.details.map(d => {
                            try {
                                return { ...d, info: typeof d.account_info === 'string' ? JSON.parse(d.account_info) : d.account_info };
                            } catch (e) {
                                return { ...d, info: {} };
                            }
                        });
                        if (profile.details.length > 0) {
                            selectedGameUid = profile.details[0].game_uid;
                        }
                    }
                    newProfileName = profile.name || "";
                    needsRegistration = false;
                } else {
                    needsRegistration = true;
                }
                loading = false;
            } else {
                profile = null;
                needsRegistration = false;
                loading = false;
            }
        });

        return () => {
            unsubscribe();
        };
    });

    async function handleGoogleLogin() {
        try {
            await login();
        } catch (e) {
            addNotification("error", $t("profile.login_failed") || "Login failed");
        }
    }

    async function handleRegister() {
        const trimmed = newProfileName.trim();
        if (!trimmed) {
            addNotification("error", $t("profile.name_empty_error") || "Username cannot be empty");
            return;
        }
        if (trimmed.length < 3 || trimmed.length > 20) {
            addNotification("error", $t("profile.name_length_error") || "Username must be between 3 and 20 characters long."); 
            return;
        }
        if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
            addNotification("error", $t("profile.name_invalid_error") || "Invalid character! Only English letters, numbers, and _ are allowed.");
            return;
        }
        try {
            loading = true;
            const token = await $user.getIdToken();
            
            const data = await registerProfile(token, trimmed, null);
            profile = { ...data, details: [] };
            needsRegistration = false;
            
            if (localAvatar) {
                try {
                    const uploadResult = await uploadAvatar(token, localAvatar, "avatar.webp");
                    if (uploadResult.nsfw) {
                        profile = {
                            ...profile,
                            picture: null,
                            avatar_strike: 1
                        };
                        localStorage.setItem("goyfield_local_avatar", localAvatar);
                        addNotification("warning", $t("profile.strike_warning"));
                    } else {
                        localAvatar = "";
                        localStorage.removeItem("goyfield_local_avatar");
                        await registerProfile(token, trimmed, uploadResult.picture);
                        profile = {
                            ...profile,
                            picture: uploadResult.picture,
                            avatar_strike: 0
                        };
                    }
                } catch (uploadErr) {
                    console.error("Failed to upload avatar after registration:", uploadErr);
                    addNotification("error", "Profile created, but failed to upload avatar: " + uploadErr.message);
                }
            }
            
            addNotification("success", $t("profile.profile_created") || "Profile created successfully");
        } catch (e) {
            const errMsg = e.message === "Username is already taken."
                ? ($t("profile.username_taken") || "Username is already taken")
                : e.message;
            addNotification("error", errMsg);
        } finally {
            loading = false;
        }
    }

    async function handleUpdateName() {
        const trimmed = newProfileName.trim();
        if (!trimmed) return;
        if (trimmed === profile.name) {
            isEditingName = false;
            return;
        }
        if (trimmed.length < 3 || trimmed.length > 20) {
            addNotification("error", $t("profile.name_length_error") || "Username must be between 3 and 20 characters long");
            return;
        }
        if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
            addNotification("error", $t("profile.name_validation_error") || "Invalid character! Only English letters, numbers, and _ are allowed");
            return;
        }
        try {
            const token = await $user.getIdToken();
            const data = await registerProfile(token, trimmed, profile.picture, profile.is_private, profile.background, profile.records_uid);
            profile.name = data.name;
            isEditingName = false;
            addNotification("success", $t("profile.username_updated") || "Username updated");
        } catch (e) {
            const errMsg = e.message === "Username is already taken."
                ? ($t("profile.username_taken") || "Username is already taken")
                : e.message;
            addNotification("error", errMsg);
        }
    }

    function handleCancelEditName() {
        newProfileName = profile ? (profile.name || "") : "";
        isEditingName = false;
        showNameWarning = false;
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

    function getLastSyncText(updatedAt) {
        if (!updatedAt) return "";
        const diff = Date.now() - new Date(updatedAt).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return $t("profile.last_sync", { time: $t("profile.time_just_now") });
        const hours = Math.floor(mins / 60);
        if (hours < 1) return $t("profile.last_sync", { time: $t("profile.time_mins", { n: mins }) });
        const days = Math.floor(hours / 24);
        if (days < 1) return $t("profile.last_sync", { time: $t("profile.time_hours", { n: hours }) });
        return $t("profile.last_sync", { time: $t("profile.time_days", { n: days }) });
    }


    function processAndUploadImage(file) {
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/avif"];
        if (!allowedTypes.includes(file.type)) {
            addNotification("error", $t("profile.image_format_error"));
            return;
        }

        const reader = new FileReader();
        reader.onload = function (event) {
            const img = new globalThis.Image();
            img.onload = function () {
                if (img.width < 128 || img.height < 128) {
                    addNotification("error", $t("profile.image_size_error"));
                    return;
                }

                cropImageSrc = event.target.result;
                cropModal.reset(img);
                showCropModal = true;
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }

    async function handleCropSave(e) {
        const webpBase64 = e.detail;
        showCropModal = false;

        if (needsRegistration) {
            localAvatar = webpBase64;
            return;
        }

        try {
            loading = true;
            const token = await $user.getIdToken();
            const uploadResult = await uploadAvatar(token, webpBase64, "avatar.webp");

            if (uploadResult.nsfw) {
                localAvatar = webpBase64;
                localStorage.setItem("goyfield_local_avatar", webpBase64);
                if (profile) {
                    profile = {
                        ...profile,
                        picture: null,
                        avatar_strike: 1
                    };
                }
                addNotification("warning", $t("profile.strike_warning"));
            } else {
                localAvatar = "";
                localStorage.removeItem("goyfield_local_avatar");
                if (profile) {
                    profile = {
                        ...profile,
                        picture: uploadResult.picture,
                        avatar_strike: 0
                    };
                }
                addNotification("success", $t("profile.avatar_success") || "Image set successfully");
            }
        } catch (err) {
            addNotification("error", err.message);
        } finally {
            loading = false;
        }
    }

    function handleFileChange(e) {
        const file = e.target.files[0];
        if (file) {
            processAndUploadImage(file);
        }
    }

    let syncModal;

    async function handleSync(e) {
        const { token: gameToken, server, onSuccess, onError } = e.detail;
        try {
            const authToken = await $user.getIdToken();
            const accounts = await syncGameAccount(authToken, gameToken, null, server);
            profile = {
                ...profile,
                details: accounts.map(d => ({
                    ...d,
                    info: d.account_info
                }))
            };
            if (profile.details.length > 0) {
                selectedGameUid = profile.details[0].game_uid;
            }
            syncModalOpen = false;
            addNotification("success", $t("profile.sync_success") || "Game account synced successfully");
            onSuccess?.(false);
        } catch (err) {
            addNotification("error", err.message);
            onError?.();
        }
    }

    let showDeleteAccountModal = false;
    let accountToDeleteUid = null;

    function triggerDeleteAccount(gameUid) {
        accountToDeleteUid = gameUid;
        showDeleteAccountModal = true;
    }

    async function confirmDeleteAccount() {
        showDeleteAccountModal = false;
        if (!accountToDeleteUid) return;
        try {
            const token = await $user.getIdToken();
            await deleteGameAccount(token, accountToDeleteUid);
            profile = {
                ...profile,
                details: profile.details.filter(d => d.game_uid !== accountToDeleteUid)
            };
            if (selectedGameUid === accountToDeleteUid) {
                selectedGameUid = profile.details.length > 0 ? profile.details[0].game_uid : null;
            }
            addNotification("success", $t("profile.unlink_success"));
        } catch (e) {
            addNotification("error", e.message);
        } finally {
            accountToDeleteUid = null;
        }
    }

    function getServerLabel(serverId) {
        return serverId === "2" ? "Asia" : "Americas / Europe";
    }

    function getAvatarUrl(pictureId) {
        if (localAvatar) return localAvatar;
        if (pictureId) return `http://localhost:3001/uploads/${pictureId}.webp`;
        return "";
    }
</script>

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
    {:else if !$user}
        <div class="flex items-center justify-center min-h-[70vh] relative z-10" in:fade>
            <div class="bg-white/5 border border-white/10 p-8 rounded-2xl max-w-lg text-center backdrop-blur-md shadow-2xl flex flex-col items-center">
                <h2 class="text-2xl font-bold dark:text-white text-gray-900 mb-4 font-sdk">
                    {$t("profile.sync_title")}
                </h2>
                <p class="text-sm dark:text-gray-400 text-gray-600 mb-6 leading-relaxed">
                    {$t("profile.register_subtitle")}
                </p>
                <button
                    on:click={handleGoogleLogin}
                    class="flex items-center gap-3 px-6 py-3 border border-gray-300 dark:border-[#444444] dark:bg-[#424242] dark:text-[#E4E4E4] rounded-lg hover:bg-gray-100 transition-all font-bold text-gray-700 bg-white"
                >
                    <Icon name="google" class="w-5 h-5" />
                    {$t("profile.sync_btn")}
                </button>
            </div>
        </div>
    {:else if needsRegistration}
        <div class="flex items-center justify-center min-h-[70vh] relative z-10" in:fade>
            <div class="bg-white/5 border border-white/10 p-8 rounded-2xl w-full max-w-md backdrop-blur-md shadow-2xl flex flex-col items-center">
                <h2 class="text-2xl font-bold dark:text-white text-gray-900 mb-6 font-sdk">
                    {$t("profile.register_title")}
                </h2>
                <div class="relative group mb-6 w-28 h-28">
                    {#if localAvatar}
                        <button
                            type="button"
                            class="w-full h-full rounded-xl border-2 border-[#FFE145] overflow-hidden cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-[#FFE145]"
                            on:click={() => showFullAvatarModal = true}
                            aria-label="View avatar"
                        >
                            <img src={localAvatar} alt="Local Avatar" class="w-full h-full object-cover" />
                        </button>
                        <button
                            type="button"
                            class="absolute bottom-1.5 right-1.5 w-7 h-7 bg-[#FFE145] hover:bg-[#ebd03e] text-gray-900 rounded-full flex items-center justify-center shadow-md transition-all scale-0 group-hover:scale-100 opacity-0 group-hover:opacity-100 z-10 cursor-pointer focus:scale-100 focus:opacity-100 outline-none"
                            on:click|stopPropagation={() => avatarInput.click()}
                            aria-label="Change avatar"
                        >
                            <Icon name="pen" class="w-3.5 h-3.5" />
                        </button>
                    {:else}
                        <button
                            type="button"
                            class="w-full h-full rounded-xl bg-white/10 border-2 border-white/20 hover:border-[#FFE145] transition-colors flex items-center justify-center text-white/50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FFE145]"
                            on:click={() => avatarInput.click()}
                            aria-label="Upload avatar"
                        >
                            <span class="text-4xl">+</span>
                        </button>
                    {/if}
                    <input type="file" accept="image/*" class="hidden" bind:this={avatarInput} on:change={handleFileChange} />
                </div>

                <div class="w-full mb-6 mt-2 relative pb-6">
                    <label class="block text-sm dark:text-gray-400 text-gray-600 font-bold mb-2" for="reg-username">
                        {$t("profile.register_name")}
                    </label>
                    <input
                        id="reg-username"
                        type="text"
                        value={newProfileName}
                        on:input={handleNameInput}
                        placeholder="e.g. user69"
                        class="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3 outline-none focus:border-[#FFE145] transition-colors font-mono"
                    />
                    {#if showNameWarning}
                        <p class="absolute text-xs text-orange-400 font-sans w-full mt-2" transition:fade>
                            {$t("profile.name_validation_error") || "Invalid character! Only English letters, numbers, and _ are allowed."}
                        </p>
                    {:else}
                        <p class="absolute text-xs text-gray-400 font-sans w-full mt-2">
                            {$t("profile.name_validation_hint") || "Only English letters, numbers, and underscores (_) are allowed."}
                        </p>
                    {/if}
                </div>

                <Button
                    variant="yellow"
                    color="gray"
                    onClick={handleRegister}
                    className="w-full !p-3 !h-12 !px-0 flex items-center justify-center font-nums mt-2"
                >
                    <div slot="icon">
                        <Icon name="save" class="w-6 h-6" />
                    </div>
                    {$t("profile.register_btn")}
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
                            class="w-full h-full rounded-md border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#FFE145] transition-all overflow-hidden {getAvatarUrl(profile.picture) || localAvatar ? 'cursor-zoom-in' : 'cursor-pointer'}"
                            on:click={() => {
                                if (getAvatarUrl(profile.picture) || localAvatar) {
                                    showFullAvatarModal = true;
                                } else {
                                    avatarInput.click();
                                }
                            }}
                            aria-label="View avatar"
                        >
                            {#if getAvatarUrl(profile.picture) || localAvatar}
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
                        {#if getAvatarUrl(profile.picture) || localAvatar}
                            <button
                                type="button"
                                class="absolute bottom-1.5 right-1.5 w-7 h-7 bg-[#FFE145] hover:bg-[#ebd03e] text-gray-900 rounded-full flex items-center justify-center shadow-md transition-all scale-0 group-hover:scale-100 opacity-0 group-hover:opacity-100 z-10 cursor-pointer focus:scale-100 focus:opacity-100 outline-none"
                                on:click|stopPropagation={() => avatarInput.click()}
                                aria-label="Change avatar"
                            >
                                <Icon name="pen" class="w-3.5 h-3.5" />
                            </button>
                        {/if}
                    </div>
                    <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" class="hidden" bind:this={avatarInput} on:change={handleFileChange} />

                    <div class="flex flex-col gap-1 relative">
                        {#if isEditingName}
                            <div class="flex items-center gap-1">
                                <input
                                    type="text"
                                    value={newProfileName}
                                    on:input={handleNameInput}
                                    class="bg-white/10 border border-white/20 text-white rounded px-2 py-1 outline-none font-mono text-xl"
                                    on:keydown={(e) => { if (e.key === "Enter") handleUpdateName(); else if (e.key === "Escape") handleCancelEditName(); }}
                                />
                                <Tooltip text={$t("settings.account.cancel") || "Cancel"}>
                                    <button
                                        on:click={handleCancelEditName}
                                        class="w-8 h-8 rounded text-gray-500 bg-[#323232] hover:bg-[#343434] flex items-center justify-center transition-colors"
                                    >
                                        <Icon name="close" class="w-4 h-4" />
                                    </button>
                                </Tooltip>
                                <Tooltip text={$t("settings.account.save") || "Save"}>
                                    <button
                                        on:click={handleUpdateName}
                                        class="w-8 h-8 ml-1 rounded bg-[#FFE145] hover:bg-[#ebd03e] text-gray-900 flex items-center justify-center transition-colors"
                                    >
                                        <Icon name="save" class="w-4 h-4" />
                                    </button>
                                </Tooltip>
                            </div>
                            {#if showNameWarning}
                                <p class="absolute top-full left-0 text-[10px] text-orange-400 mt-0.5 font-sans whitespace-nowrap z-10" transition:fade>
                                    {$t("profile.name_validation_error") || "Invalid character! Only English letters, numbers, and _ are allowed."}
                                </p>
                            {/if}
                        {:else}
                            <div class="flex items-center gap-2">
                                <h1 class="text-3xl font-bold dark:text-white text-gray-900 font-sdk">
                                    {profile.name}
                                </h1>
                                <Tooltip text={$t("profile.edit_nickname") || "Edit nickname"}>
                                    <button on:click={() => { newProfileName = profile.name || ""; isEditingName = true; }} class="text-gray-400 hover:text-white transition-colors flex items-center justify-center w-6 h-6">
                                        <Icon name="pen" class="w-4 h-4" />
                                    </button>
                                </Tooltip>
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
                        {/if}
                        {#if profile.avatar_strike === 1}
                            <span class="text-[10px] text-orange-400 font-bold flex items-center gap-1 mt-1">
                                <Icon name="warning" class="w-3.5 h-3.5" />
                                {$t("profile.strike_warning")}
                            </span>
                        {/if}
                    </div>
                </div>

                <div class="flex flex-wrap items-center gap-4">
                    {#if profile.details && profile.details.length > 0}
                        {#each profile.details as d}
                            <div
                                on:click={() => selectedGameUid = d.game_uid}
                                on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') selectedGameUid = d.game_uid; }}
                                role="button"
                                tabindex="0"
                                class="{!profile?.background ? 'bg-gray-100/80' : 'bg-gray-100/25'}  dark:bg-black/20 backdrop-blur-md border text-left p-3 rounded-xl flex items-center gap-4 w-[285px] hover:bg-gray-400/15 dark:hover:bg-black/35 transition-all relative group cursor-pointer select-none outline-none focus-visible:ring-1 focus-visible:ring-[#FFE145]
                                {selectedGameUid === d.game_uid ? 'border-2 border-[#FFE145]' : 'border-2 border-white/10 dark:border-gray-400/20'}"
                            >
                                <Tooltip
                                    text={$t("profile.unlink_account") || "Unlink account"}
                                    class="absolute -top-1.5 -right-1.5 z-20 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <button
                                        on:click|stopPropagation={() => triggerDeleteAccount(d.game_uid)}
                                        class="bg-red-900/95 border border-red-500/50 hover:bg-red-600 hover:border-red-400 p-1.5 rounded-lg text-white shadow-md active:scale-95 flex items-center justify-center cursor-pointer"
                                    >
                                        <Icon name="trash" class="w-3.5 h-3.5" />
                                    </button>
                                </Tooltip>

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
                                                    <Icon name="success" class="w-3 h-3 text-yellow-400" />
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

                    <div class="flex flex-col items-end shrink-0">
                        <div class="flex items-center gap-2">
                            <div class="relative flex flex-col items-center shrink-0">
                                <Button variant="round" color="white" onClick={() => syncModalOpen = true}>
                                    <div class="flex items-center gap-2 px-2 py-1 font-sdk">
                                        <Icon name="refresh" class="w-4 h-4" />
                                        <span>{$t("profile.update_btn")}</span>
                                    </div>
                                </Button>
                                {#if profile.updated_at}
                                    <span class="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-[10px] text-gray-400 font-sans font-medium text-center whitespace-nowrap">
                                        {getLastSyncText(profile.updated_at)}
                                    </span>
                                {/if}
                            </div>
                            <Button
                                variant="round"
                                color="gray"
                                onClick={() => settingsModalOpen = true}
                                className="w-10 h-10 !p-0 !h-10 !px-0 flex items-center justify-center"
                            >
                                <Icon name="settings" class="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {#if activeAccount}
                <div class="grid grid-cols-1 xl:grid-cols-[320px_435px_1fr] gap-6" in:fade>
                    
                    <div class="space-y-6">
                        <AccountSummary 
                            stats={activeAccount.info?.stats || {}} 
                            totalCharsCount={Object.keys(charactersById).length} 
                            profileBackground={!profile?.background}
                        />

                        <div class="min-w-0 flex flex-col">
                            {#if activeAccount?.records_uid}
                                <RatingCard customGameUid={activeAccount.records_uid} isProfile={true} hideBorders={!!profile?.background} />
                            {:else}
                                <div class="{!profile?.background ? 'bg-white dark:bg-[#383838] border border-white/10' : 'bg-white/5 border dark:bg-[#383838]/5 dark:border-[#444444]/20 border-white/20'} rounded-xl p-5 min-w-0 flex flex-col backdrop-blur-sm shadow-sm">
                                    <h2 class="text-xl font-bold text-[#21272C] dark:text-[#FDFDFD] mb-4 font-sdk border-b {!profile?.background ? 'border-gray-100 dark:border-[#444444]' : 'border-gray-100/30 dark:border-[#444444]/30'} pb-3">
                                        {$t("profile.stats")}
                                    </h2>
                                    <div class="flex flex-col items-center h-40 justify-center text-center border border-gray-100/50 dark:border-[#444444]/50 rounded-lg bg-gray-50/20 dark:bg-[#2e2e2e]/20 font-mono text-xs text-gray-500 dark:text-gray-400 backdrop-blur-sm px-4">
                                        <Icon name="noData" class="w-8 h-8 mb-2 opacity-30" />
                                        <div class="">
                                            {$t("profile.bind_to_view_luck")}
                                        </div>
                                    </div>
                                </div>
                            {/if}
                        </div>
                    </div>

                    <div>
                        <div class="{!profile?.background ? 'bg-white dark:bg-[#383838] border border-white/10' : 'bg-white/5 border dark:bg-[#383838]/5 dark:border-[#444444]/20 border-white/20'} rounded-2xl p-6 backdrop-blur-sm shadow-sm flex flex-col">
                            <div class="flex items-center justify-between border-b {!profile?.background ? 'border-gray-100 dark:border-[#444444]' : 'border-gray-100/30 dark:border-[#444444]/30'} pb-2 mb-4">
                                <div class="flex items-center gap-2">
                                    <Icon name="contract" class="w-7 h-7 text-[#21272C] dark:text-[#FDFDFD]" />
                                    <h2 class="text-xl font-bold text-[#21272C] dark:text-[#FDFDFD] font-sdk">
                                        {$t("profile.crisis_contract")}
                                    </h2>
                                </div>
                            </div>

                            {#if activeAccount.info?.contract && activeAccount.info.contract.level > 0}
                                <div class="flex items-center justify-between mb-4">
                                    <div class="text-sm font-medium dark:text-gray-400 text-gray-600">
                                        {$t("profile.clear_time_label")} 
                                        <span class="dark:text-white text-gray-900 font-bold text-lg ml-1 font-nums">
                                            {$t("leaderboard.sec", { time: activeAccount.info.contract.clearTime })}
                                        </span>
                                    </div>
                                    <ContractLevelTag level={activeAccount.info.contract.level || 0} />
                                </div>

                                <div class="flex flex-row justify-center gap-4 flex-wrap">
                                    {#each contractChars as char}
                                        <ContractCard
                                            {char}
                                            {getOperatorData}
                                            {getWeaponData}
                                            {getWeaponIcon}
                                            {getEquipIcon}
                                            {getStaticEquipId}
                                            {equipmentNames}
                                        />
                                    {/each}
                                </div>

                                <div class="grid grid-cols-[repeat(auto-fill,56px)] gap-1.5 mt-4 border-t border-white/10 pt-4 justify-center">
                                    {#each activeAccount.info.contract.indicators || [] as ind}
                                        {@const tagId = typeof ind === 'object' ? ind.id : ind}
                                        {@const tagName = $t(`contractTagNames.${tagId}`) || (typeof ind === 'object' ? ind.name : tagId)}
                                        {@const tagDesc = formatContractDescription(tagId, $t(`contractTagDesc.${tagId}`) || (typeof ind === 'object' ? ind.desc : ''))}
                                        {@const cleanDesc = tagDesc ? tagDesc.replace(/<[^>]*>/g, "") : ""}
                                        <Tooltip text={tagName + (cleanDesc ? ": " + cleanDesc : "")}>
                                            <div class="w-12 h-12 bg-black/90 border border-white/10 rounded-lg p-1.5 flex items-center justify-center cursor-pointer hover:border-white/30 transition-all">
                                                <img src={getImagePath(tagId, "contract-tag-icon")} alt={tagName} class="w-full h-full object-contain" on:error={(e) => e.target.src = (typeof ind === 'object' ? ind.icon : '')} />
                                            </div>
                                        </Tooltip>
                                    {/each}
                                </div>
                            {:else}
                                <div class="text-center py-10 text-gray-400 italic flex flex-col items-center bg-gray-50/20 dark:bg-[#2C2C2C]/20 rounded-2xl border border-gray-100/50 dark:border-[#444444]/50 w-full backdrop-blur-sm">
                                    <Icon name="noData" class="w-8 h-8 mb-2 opacity-30" />
                                    <p class="text-sm">
                                        {$t("emptyState.noData") || "No records found"}
                                    </p>
                                </div>
                            {/if}
                        </div>
                    </div>

                    <div class="w-full min-w-0 overflow-hidden">
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

    <SyncModal bind:this={syncModal} isOpen={syncModalOpen} on:close={() => syncModalOpen = false} on:sync={handleSync} on:error={(e) => addNotification("error", e.detail)} />

    <SettingsModal
        isOpen={settingsModalOpen}
        {isPrivate}
        {profile}
        {activeAccount}
        {primaryAccountOptions}
        {filteredBackgrounds}
        bind:bgSearchQuery
        on:close={() => settingsModalOpen = false}
        on:togglePrivate={handleTogglePrivate}
        on:selectRecordsUid={(e) => handleSelectRecordsUid(e.detail)}
        on:selectBackground={(e) => handleSelectBackground(e.detail)}
        on:logout={async () => { await logout(); settingsModalOpen = false; addNotification("success", "Logged out successfully!"); }}
    />

    <CropModal bind:this={cropModal} isOpen={showCropModal} imageSrc={cropImageSrc} on:save={handleCropSave} on:close={() => showCropModal = false} on:error={(e) => addNotification("error", e.detail)} />


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
                src={localAvatar || getAvatarUrl(profile?.picture)}
                alt="Avatar Fullsize"
                class="max-w-full max-h-[80vh] rounded-2xl border border-white/20 shadow-2xl object-contain select-text"
            />
        </div>
    </Modal>

    <ConfirmationModal
        isOpen={showDeleteAccountModal}
        title={$t("profile.confirm_unlink") || "Unlink Account?"}
        confirmText={$t("settings.account.deleteAccount") || "Unlink"}
        isDestructive={true}
        on:confirm={confirmDeleteAccount}
        on:close={() => (showDeleteAccountModal = false)}
    />

</div>

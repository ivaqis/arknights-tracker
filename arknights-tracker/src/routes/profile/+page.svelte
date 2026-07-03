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
    import { getRarityColor } from "$lib/utils/colorUtils.js";
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

    const { accounts } = accountStore;

    const elementColors = {
        physical: "#5E5D5D",
        cryo: "#21C4CE",
        ice: "#21C4CE",
        cryst: "#21C4CE",
        nature: "#AABD00",
        natural: "#AABD00",
        electric: "#FFBF00",
        pulse: "#FFBF00",
        heat: "#FF613D",
        fire: "#FF613D",
    };

    const elementGradients = {
        physical: "from-gray-500/30 to-transparent",
        cryo: "from-[#21C4CE]/30 to-transparent",
        nature: "from-[#76C104]/30 to-transparent",
        electric: "from-[#FFBF00]/30 to-transparent",
        heat: "from-[#FF613D]/30 to-transparent",
    };

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

    const charactersByApiId = Object.values(characters || {}).reduce((acc, char) => {
        if (char && char.apiId) acc[char.apiId] = char;
        return acc;
    }, {});

    function getSvelteCharId(char) {
        if (!char) return "";
        const charId = char.charData?.id || char.id || char.charId || "";

        if (charId && charactersByApiId[charId]) {
            return charactersByApiId[charId].id;
        }

        const rawName = char.charData?.name || char.name || "";
        const nameLower = rawName.toLowerCase().trim();

        const ruMapping = {
            "эндминистратор": "endministrator1",
            "перлика": "perlica",
            "арделия": "ardelia",
            "пограничник": "pogranichnik",
            "арклайт": "arclight",
            "авивенна": "avywenna",
            "светоснежка": "snowshine",
            "чэнь цяньюй": "chenQianyu",
            "да пан": "daPan",
            "алеш": "alesh",
            "эстелла": "estella",
            "кэтчер": "catcher",
            "флюорит": "fluorite",
            "акэкури": "akekuri",
            "антал": "antal",
            "лейватейн": "laevatain",
            "ивонн": "yvonne",
            "джилберта": "gilberta",
            "эмбер": "ember",
            "ласт райт": "lastRite",
            "лифэн": "lifeng",
            "вулфгард": "wulfgard",
            "ксайхи": "xaihi",
            "ксаихи": "xaihi",
            "тангтанг": "tangtang",
            "росси": "rossi",
            "чжуань фаньи": "zhuangfy",
            "ми фу": "mifu"
        };

        if (ruMapping[nameLower]) {
            return ruMapping[nameLower];
        }

        return charId;
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

    const weaponIdMap = {
        "wpn_sword_0012": "thermiteCutter",
        "wpn_greatsword_0010": "industry01",
        "wpn_greatsword_0006": "exemplar",
        "wpn_greatsword_0007": "formerFinery",
        "wpn_greatsword_0008": "thunderberge",
        "wpn_greatsword_0009": "sunderedPrince",
        "wpn_greatsword_0011": "quencher"
    };

    function getWeaponData(weapon) {
        if (!weapon) return null;
        const skillKey = weapon.weaponData?.skills?.find(s => s.key?.startsWith("sk_wpn_"))?.key;
        const gameId = skillKey ? skillKey.replace("sk_", "") : (weapon.id || weapon.weaponData?.id);
        const mappedId = weaponIdMap[gameId];
        const staticData = (mappedId && weapons[mappedId]) || Object.values(weapons || {}).find(w => w.id === gameId || w.gameId === gameId);
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
        if (mapped && mapped.id && !mapped.id.startsWith("wpn_")) {
            return getImagePath(mapped.id, "weapon-icon");
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

    function getEquipIcon(equip) {
        if (!equip) return "";
        if (equip.id) {
            return getImagePath(equip.id, "equipment");
        }
        return equip.icon || "";
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

    let selectedGameUid = null;
    $: activeAccount = profile?.details?.find(d => d.game_uid === selectedGameUid) || profile?.details?.[0];
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
    $: if (sortedChars && sortedChars.length > 0 && !selectedOperatorId) {
        selectedOperatorId = sortedChars[0].id;
    }
    $: selectedChar = sortedChars.find(c => c.id === selectedOperatorId) || sortedChars[0];
    $: selectedDetailedChar = selectedChar ? getDetailedChar(selectedChar.id) : null;
    let selectedCharDetails = null;
    $: if (selectedChar) {
        const svelteId = getSvelteCharId(selectedChar);
        if (svelteId) {
            import(`../../lib/data/charactersData/${svelteId}.json`)
                .then(mod => {
                    selectedCharDetails = mod.default || mod;
                })
                .catch(err => {
                    console.warn("Failed to load details for", svelteId, err);
                    selectedCharDetails = null;
                });
        } else {
            selectedCharDetails = null;
        }
    }
    $: talentsList = selectedChar ? getTalents(selectedChar, selectedDetailedChar, selectedCharDetails) : [];
    $: opData = selectedChar ? getOperatorData(selectedChar) : null;
    $: detailedChar = selectedDetailedChar;
    $: svelteId = selectedChar ? getSvelteCharId(selectedChar) : "";
    $: targetCharData = detailedChar?.charData || selectedChar?.charData;
    $: elementColor = opData ? (elementGradients[opData.element] || "from-white/5 to-transparent") : "from-white/5 to-transparent";

    function getDetailedChar(charId) {
        if (!activeAccount?.info?.detail?.chars) return null;
        return activeAccount.info.detail.chars.find(c => c.charData?.id === charId || c.id === charId);
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

    function getTalents(char, detailedChar, staticDetails = null) {
        if (!char?.charData) return [];
        const svelteId = getSvelteCharId(char);
        const combatNodes = char.charData.combatTalents || [];
        const groupedCombat = {};
        groupedCombat.latestPassiveSkillNodes = detailedChar?.talent?.latestPassiveSkillNodes || [];
        combatNodes.forEach(node => {
            if (!groupedCombat[node.name]) {
                groupedCombat[node.name] = [];
            }
            groupedCombat[node.name].push(node);
        });
        
        const talents = [];
        let combatIdx = 1;
        Object.entries(groupedCombat).forEach(([name, nodes]) => {
            if (name === "latestPassiveSkillNodes") return;
            nodes.sort((a, b) => a.id.localeCompare(b.id));
            const levelsCount = nodes.length;
            const activeNode = groupedCombat.latestPassiveSkillNodes.find(id => nodes.some(n => n.id === id)) 
                || nodes[0]?.id;
            const activeIndex = nodes.findIndex(n => n.id === activeNode);
            const currentLevel = activeIndex !== -1 ? activeIndex + 1 : 1;
            const nodeData = nodes[activeIndex !== -1 ? activeIndex : 0] || {};
            
            talents.push({
                name: nodeData.name,
                iconUrl: nodeData.iconUrl,
                localImageId: `${svelteId}_talent${combatIdx}`,
                desc: nodeData.desc,
                descParams: nodeData.descParams,
                type: 'combat',
                currentLevel,
                levelsCount
            });
            combatIdx++;
        });

        const cultNodes = char.charData.cultivationTalents || [];
        const groupedCult = {};
        groupedCult.latestSpaceshipSkillNodes = detailedChar?.talent?.latestSpaceshipSkillNodes || [];
        cultNodes.forEach(node => {
            const baseName = node.name.replace(/\s*[αβγ]\s*$/, "").trim();
            if (!groupedCult[baseName]) {
                groupedCult[baseName] = [];
            }
            groupedCult[baseName].push(node);
        });

        Object.entries(groupedCult).forEach(([baseName, nodes]) => {
            if (baseName === "latestSpaceshipSkillNodes") return;
            nodes.sort((a, b) => a.id.localeCompare(b.id));
            const levelsCount = nodes.length;
            const activeNode = groupedCult.latestSpaceshipSkillNodes.find(id => nodes.some(n => n.id === id))
                || nodes[0]?.id;
            const activeIndex = nodes.findIndex(n => n.id === activeNode);
            const currentLevel = activeIndex !== -1 ? activeIndex + 1 : 1;
            const nodeData = nodes[activeIndex !== -1 ? activeIndex : 0] || {};

            let localImageId = "";
            if (nodeData.id) {
                const parts = nodeData.id.split('_');
                if (parts.length >= 2) {
                    const skillIdx = parts[parts.length - 2];
                    const levelIdx = parts[parts.length - 1];
                    const facSkillKey = `facSkill${skillIdx}_${levelIdx}`;
                    localImageId = staticDetails?.facSkills?.[facSkillKey]?.name || "";
                }
            }

            talents.push({
                name: nodeData.name,
                iconUrl: nodeData.iconUrl,
                localImageId: localImageId,
                desc: nodeData.desc,
                descParams: nodeData.descParams,
                type: 'cultivation',
                currentLevel,
                levelsCount,
                nodes
            });
        });

        return talents;
    }

    let localAvatar = "";

    onMount(async () => {
        if (typeof window !== 'undefined') {
            localAvatar = localStorage.getItem("goyfield_local_avatar") || "";
        }
        
        user.subscribe(async (u) => {
            if (u) {
                loading = true;
                const data = await getUserProfile(u.uid);
                if (data) {
                    profile = data;
                    if (profile.details) {
                        profile.details = profile.details.map(d => {
                            try {
                                return { ...d, info: JSON.parse(d.account_info) };
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
            const data = await registerProfile(token, trimmed, localAvatar || null);
            profile = { ...data, details: [] };
            needsRegistration = false;
            addNotification("success", $t("profile.profile_created") || "Profile created successfully");
        } catch (e) {
            addNotification("error", e.message);
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
            addNotification("error", e.message);
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
            <div class="w-full h-full object-cover opacity-45 dark:opacity-35 transform scale-105">
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
            <div class="bg-white/5 dark:bg-[#383838]/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
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
                                class="bg-white/40 dark:bg-black/20 backdrop-blur-md border text-left p-3 rounded-xl flex items-center gap-4 w-[285px] hover:bg-white/60 dark:hover:bg-black/35 transition-all relative group cursor-pointer select-none outline-none focus-visible:ring-1 focus-visible:ring-[#FFE145]
                                {selectedGameUid === d.game_uid ? 'border-2 border-[#FFE145]' : 'border-2 border-white/10 dark:border-white/5'}"
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
                                    <div class="text-[10px] text-gray-400 font-mono truncate flex items-center gap-1">
                                        <span>UID: {d.game_uid}</span>
                                        <Tooltip text={$t("profile.copy_uid") || "Copy UID"}>
                                            <button 
                                                on:click|stopPropagation={() => handleCopyUid(d.game_uid)} 
                                                class="text-gray-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center p-0.5"
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
                        <div class="bg-white/5 dark:bg-[#383838]/5 dark:border-[#444444] rounded-xl p-5 shadow-xl border border-gray-100/50 min-w-0 flex flex-col backdrop-blur-sm">
                            <h2 class="text-xl font-bold text-[#21272C] dark:text-[#FDFDFD] mb-2 font-sdk border-b border-gray-100 dark:border-[#444444] pb-3">
                                {$t("profile.overview")}
                            </h2>
                            <div class="space-y-1 px-1">
                                <div class="flex justify-between items-center py-1.5 dark:border-[#444444]">
                                    <span class="text-gray-700 dark:text-[#E4E4E4] font-medium">{$t("profile.operators_count")}</span>
                                    <span class="font-bold text-[#21272C] dark:text-[#FDFDFD] font-nums">{activeAccount.info?.stats?.charCount || 0} / {Object.keys(charactersById).length}</span>
                                </div>
                                <div class="flex justify-between items-center py-1.5 dark:border-[#444444]">
                                    <span class="text-gray-700 dark:text-[#E4E4E4] font-medium">{$t("profile.exploration_level")}</span>
                                    <span class="font-bold text-[#21272C] dark:text-[#FDFDFD] font-nums">{activeAccount.info?.stats?.explorationLevel || 0}</span>
                                </div>
                                <div class="flex justify-between items-center py-1.5 dark:border-[#444444]">
                                    <span class="text-gray-700 dark:text-[#E4E4E4] font-medium">{$t("profile.weapons")}</span>
                                    <span class="font-bold text-[#21272C] dark:text-[#FDFDFD] font-nums">{activeAccount.info?.stats?.weaponCount || 0}</span>
                                </div>
                                <div class="flex justify-between items-center py-1.5 dark:border-[#444444]">
                                    <span class="text-gray-700 dark:text-[#E4E4E4] font-medium">{$t("profile.files")}</span>
                                    <span class="font-bold text-[#21272C] dark:text-[#FDFDFD] font-nums">{activeAccount.info?.stats?.fileCount || 0}</span>
                                </div>
                                <div class="flex justify-between items-center py-1.5 dark:border-[#444444]">
                                    <span class="text-gray-700 dark:text-[#E4E4E4] font-medium">{$t("profile.awake_day")}</span>
                                    <span class="font-bold text-[#21272C] dark:text-[#FDFDFD] font-nums">{activeAccount.info?.stats?.awakeDay || "-"}</span>
                                </div>
                                <div class="flex justify-between items-center py-1.5 dark:border-[#444444]">
                                    <span class="text-gray-700 dark:text-[#E4E4E4] font-medium">{$t("profile.sanity")}</span>
                                    <span class="font-bold text-[#21272C] dark:text-[#FDFDFD] font-nums">{activeAccount.info?.stats?.sanity || 0} / {activeAccount.info?.stats?.maxSanity || 358}</span>
                                </div>
                                <div class="flex justify-between items-center py-1.5 dark:border-[#444444]">
                                    <span class="text-gray-700 dark:text-[#E4E4E4] font-medium">{$t("profile.protopass")}</span>
                                    <span class="font-bold text-[#21272C] dark:text-[#FDFDFD] font-nums">{activeAccount.info?.stats?.protoPass || 0} / {activeAccount.info?.stats?.protoPassMax || 60}</span>
                                </div>
                                <div class="flex justify-between items-center py-1.5 dark:border-[#444444]">
                                    <span class="text-gray-700 dark:text-[#E4E4E4] font-medium">{$t("profile.weekly_routine")}</span>
                                    <span class="font-bold text-[#21272C] dark:text-[#FDFDFD] font-nums">{activeAccount.info?.stats?.weeklyRoutine || 0} / {activeAccount.info?.stats?.weeklyRoutineMax || 10}</span>
                                </div>
                                <div class="flex justify-between items-center py-1.5 dark:border-[#444444]">
                                    <span class="text-gray-700 dark:text-[#E4E4E4] font-medium">{$t("profile.activity_points")}</span>
                                    <span class="font-bold text-[#21272C] dark:text-[#FDFDFD] font-nums">{activeAccount.info?.stats?.activityPoints || 0} / {activeAccount.info?.stats?.activityPointsMax || 100}</span>
                                </div>
                            </div>
                        </div>

                        <div class="min-w-0 flex flex-col">
                            {#if activeAccount?.records_uid}
                                <RatingCard customGameUid={activeAccount.records_uid} isProfile={true} />
                            {:else}
                                <div class="bg-white/5 dark:bg-[#383838]/5 dark:border-[#444444] rounded-xl p-5 border border-gray-100/50 min-w-0 flex flex-col backdrop-blur-sm shadow-xl">
                                    <h2 class="text-xl font-bold text-[#21272C] dark:text-[#FDFDFD] mb-4 font-sdk border-b border-gray-100 dark:border-[#444444] pb-3">
                                        {$t("profile.stats")}
                                    </h2>
                                    <div class="flex flex-col items-center h-40 justify-center text-center border border-gray-100/50 dark:border-[#444444]/50 rounded-lg bg-gray-50/20 dark:bg-[#2e2e2e]/20 font-mono text-xs text-gray-500 dark:text-gray-400 backdrop-blur-sm px-4">
                                        <Icon name="noData" class="w-8 h-8 mb-2 opacity-30" />
                                        <p>
                                            {$t("profile.bind_to_view_luck")}
                                        </p>
                                    </div>
                                </div>
                            {/if}
                        </div>
                    </div>

                    <div>
                        <div class="bg-white/5 dark:bg-[#383838]/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm shadow-xl flex flex-col">
                            <div class="flex items-center justify-between border-b border-gray-100 dark:border-[#444444] pb-2 mb-4">
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
                                    {#each activeAccount.info.contract.chars as char}
                                        {@const opData = getOperatorData(char)}
                                        <div class="flex flex-col border border-white/10 rounded-[4px] min-w-0 w-[84px] max-w-[84px] shrink-0 shadow-md relative">
                                            <a href="/operators/{opData.id}" class="relative w-full h-[190px] bg-white/3 overflow-hidden shrink-0 block group cursor-pointer">
                                                <div class="w-full h-full transition-transform duration-300 group-hover:scale-105">
                                                    <Image id={opData.id} variant="operator-preview" className="w-full h-full object-cover" />
                                                </div>
                                                <div class="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#111111] to-transparent z-20 pointer-events-none"></div>
                                                
                                                <!-- svelte-ignore a11y-click-events-have-key-events -->
                                                <!-- svelte-ignore a11y-no-static-element-interactions -->
                                                <div class="absolute top-1 right-1 z-30" on:click|stopPropagation|preventDefault>
                                                    <Tooltip text="P{Math.max(1, (char.potential || 1)) - 1}">
                                                        <PotentialIcon pot={Math.max(0, (char.potential || 1) - 1)} size={32} />
                                                    </Tooltip>
                                                </div>

                                                <div class="absolute bottom-2 left-2 z-30 flex flex-col items-start leading-none select-none">
                                                    <span class="text-[8px] font-black text-white/70 uppercase tracking-wider" style="text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">LV</span>
                                                    <span class="text-[24px] font-black text-white leading-none tracking-tighter" style="text-shadow: 1px 1px 3px rgba(0,0,0,0.9);">{char.level}</span>
                                                </div>
                                            </a>

                                            {#if char.weapon}
                                                {@const weaponData = getWeaponData(char.weapon)}
                                                {@const weaponName = $t(`weaponsList.${weaponData?.id}`) !== `weaponsList.${weaponData?.id}` ? $t(`weaponsList.${weaponData?.id}`) : (weaponData?.name || char.weapon.id)}
                                                <Tooltip text={`${weaponName} R${char.weapon.refineLevel !== undefined ? char.weapon.refineLevel + 1 : 1}`}>
                                                    <a href="/weapons/{weaponData.id}?level={char.weapon.level}&refine={char.weapon.refineLevel !== undefined ? char.weapon.refineLevel : 0}&skills={char.weapon.weaponTerms ? char.weapon.weaponTerms.join(',') : ''}" class="relative w-[96px] h-[55px] flex items-center justify-between p-1 overflow-hidden shrink-0 z-20 ml-[-12px] transition-transform duration-200 hover:scale-105 cursor-pointer block"
                                                         style="border: 1px solid transparent; background: linear-gradient(to right, #363634, #111111) padding-box, linear-gradient(to right, #464644, #1b1b1a) border-box;">
                                                        
                                                        <img 
                                                            src={getWeaponIcon(char.weapon)} 
                                                            alt="Weapon" 
                                                            class="absolute left-[45%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 object-contain pointer-events-none"
                                                            on:error={(e) => e.target.src = char.weapon.icon}
                                                        />
                                                        
                                                        <div class="flex flex-col justify-between h-full z-10 items-start">
                                                            <PotentialIcon pot={char.weapon.refineLevel !== undefined ? char.weapon.refineLevel : 0} size={20} />
                                                            <div class="flex flex-col items-start leading-none">
                                                                <span class="text-[7px] text-white/50 font-black">LV</span>
                                                                <span class="text-[16px] text-white font-nums font-black leading-none" style="text-shadow: 1px 1px 0 #111;">
                                                                    {char.weapon.level}
                                                                </span>
                                                                <div class="w-6 h-[2px] mt-0.5 rounded" style="background-color: {getRarityColor(char.weapon.rarity)}"></div>
                                                            </div>
                                                        </div>

                                                        <div class="flex flex-col gap-0.5 z-10 items-end justify-center h-full pr-0.5">
                                                            {#each char.weapon.weaponTerms || [] as term}
                                                                <div class="flex items-center gap-0.5 px-1 py-0.5 rounded-[2px]" style="background: linear-gradient(to right, #1C1C1C, #2D2D2B);">
                                                                    <div class="w-[4px] h-[10px] rounded-full transform rotate-[40deg] border-[1.5px] transition-all duration-200 outline-none shrink-0 flex items-center justify-center bg-[#FFE145] border-[#FFE145] dark:bg-[#FFE145] dark:border-[#FFE145] shadow-sm"></div>
                                                                    <span class="pl-0.5 text-[9px] font-black text-[#FFE145] font-nums leading-none">{term}</span>
                                                                </div>
                                                            {/each}
                                                        </div>
                                                    </a>
                                                </Tooltip>
                                            {/if}

                                            <div class="grid grid-cols-2 gap-1 p-1 bg-[#111111] rounded-b-[4px]">
                                                {#each ['bodyEquip', 'armEquip', 'firstAccessory', 'secondAccessory'] as eqKey}
                                                    {@const equip = char.equips?.[eqKey]}
                                                    {#if equip}
                                                        {@const tier = Math.max(0, (equip.enhanceStatus || 1) - 1)}
                                                        {@const eqData = equipment[equip.id]}
                                                        <Tooltip text={equipmentNames[equip.id]?.name || equip.id}>
                                                            <a href="/equipment/{equip.id}" class="relative flex items-center justify-end w-[38px] h-[28px] py-0.5 pl-0.5 min-w-0 transition-transform duration-200 hover:scale-110 hover:z-20 cursor-pointer block"
                                                                 style="border: 1px solid transparent; background: linear-gradient(to right, #101010, #1A4558) padding-box, linear-gradient(to right, #3D3F3A, #194457) border-box;">
                                                                
                                                                <div class="absolute top-0.5 left-0.5 w-[14px] h-[8px] flex items-center justify-center shrink-0">
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

                                                                <img 
                                                                    src={getEquipIcon(equip)} 
                                                                    alt={eqKey} 
                                                                    class="-mr-1 w-[30px] h-[30px] object-contain pointer-events-none shrink-0"
                                                                    on:error={(e) => e.target.src = equip.icon}
                                                                />
                                                                
                                                                <div class="left-0.5 w-[14px] h-[1.5px] bg-[#E3A000] absolute bottom-0.5 rounded"></div>
                                                            </a>
                                                        </Tooltip>
                                                    {:else}
                                                        <div class="bg-[#101010]/60 border border-white/5 w-[38px] h-[28px] min-w-0"></div>
                                                    {/if}
                                                {/each}
                                            </div>
                                        </div>
                                    {/each}
                                </div>

                                <div class="grid grid-cols-[repeat(auto-fill,56px)] gap-1.5 mt-4 border-t border-white/10 pt-4 justify-center">
                                    {#each activeAccount.info.contract.indicators || [] as ind}
                                        {@const tagName = $t(`contractTagNames.${ind.id}`) || ind.name}
                                        {@const tagDesc = formatContractDescription(ind.id, $t(`contractTagDesc.${ind.id}`) || ind.desc)}
                                        {@const cleanDesc = tagDesc ? tagDesc.replace(/<[^>]*>/g, "") : ""}
                                        <Tooltip text={tagName + (cleanDesc ? ": " + cleanDesc : "")}>
                                            <div class="w-12 h-12 bg-black/90 border border-white/10 rounded-lg p-1.5 flex items-center justify-center cursor-pointer hover:border-white/30 transition-all">
                                                <img src={getImagePath(ind.id, "contract-tag-icon")} alt={tagName} class="w-full h-full object-contain" on:error={(e) => e.target.src = ind.icon} />
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
                        <div class="bg-white/5 dark:bg-[#383838]/5 dark:border-[#444444] rounded-xl p-5 border border-gray-100/50 flex flex-col w-full mx-auto backdrop-blur-sm shadow-xl min-w-0 overflow-hidden">
                            <div class="flex items-center justify-between border-b border-gray-100 dark:border-[#444444] pb-3 mb-3">
                                <div class="flex gap-2">
                                    <Icon name="operators" class="w-6 h-6 text-[#21272C] dark:text-[#FDFDFD]" />
                                    <h2 class="text-xl font-bold text-[#21272C] dark:text-[#FDFDFD] font-sdk">
                                        {$t("profile.operators_title")}
                                    </h2>
                                </div>
                            </div>
                            <div class="flex gap-3.5 overflow-x-auto pb-2.5 custom-scrollbar whitespace-nowrap max-w-full justify-start items-center">
                                {#each sortedChars as char}
                                    {@const opData = getOperatorData(char)}
                                    {@const isSelected = char.id === selectedOperatorId}
                                    <div class="relative w-12 h-12 shrink-0 flex items-center justify-center">
                                        <button
                                            on:click={() => selectedOperatorId = char.id}
                                            class="w-11 h-11 rounded-full border-2 transition-all duration-300 outline-none cursor-pointer
                                            {isSelected ? 'ring-2 ring-white shadow-md' : 'border-[#FF6600]/80 hover:opacity-85'}"
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
                                    <div class="w-full overflow-x-auto custom-scrollbar pb-1">
                                        <div in:fade={{ duration: 200 }} class="w-[950px] h-[447px] mx-auto relative bg-black/30 dark:bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-2xl transition-all duration-300 text-left mt-3 overflow-hidden">
                                            
                                            <div class="absolute inset-0 bg-gradient-to-br {elementColor} pointer-events-none z-0 rounded-2xl"></div>
                                            <div class="absolute left-[-25px] top-2 pointer-events-none z-0 select-none opacity-90" style="width: 50%; height: 100%; transform: scale(1.5); transform-origin: left center;">
                                                <Image id={opData.id} variant="operator-splash" className="w-full h-full object-contain object-center" />
                                            </div>

                                            <div class="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                                                <div class="lg:col-span-7 relative flex flex-col rounded-xl justify-between">
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
                                                                            <Icon name="strokeStar" class="w-10 h-10" style="color: white; stroke-opacity: 20%" />
                                                                        {/each}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="flex justify-between items-end mt-auto z-10">
                                                            <div class="flex flex-row items-end gap-3">
                                                            <div class="flex flex-col gap-1.5">
                                                                {#each ["basicAttack", "battleSkill", "comboSkill", "ultimate"] as skillKey, idx}
                                                                    {@const skillMeta = Array.isArray(targetCharData?.skills)
                                                                        ? targetCharData.skills[idx]
                                                                        : targetCharData?.skills?.[skillKey]}
                                                                    {#if skillMeta}
                                                                        {@const skillLvl = detailedChar?.userSkills?.[skillMeta.id]?.level || 1}
                                                                        {@const skillImageId = skillKey === "basicAttack" ? (opData?.weapon || "sword") : `${svelteId}_${skillKey}`}
                                                                        {@const currentElement = targetCharData?.property?.key?.replace("char_property_", "") || opData?.element || "physical"}
                                                                        {@const currentColor = elementColors[currentElement] || "#5E5D5D"}
                                                                        {@const isUltimate = skillKey === "ultimate"}
                                                                        
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
                                                                                        <div
                                                                                            class="absolute inset-0"
                                                                                            style="background-color: {currentColor}"
                                                                                        ></div>
                                                                                    {:else}
                                                                                        <div
                                                                                            class="absolute inset-0"
                                                                                            style="background-color: {currentColor}; 
                                                                                            clip-path: polygon(50% 50%, -100% 100%, 200% 100%);"
                                                                                        ></div>
                                                                                    {/if}

                                                                                    <div class="relative z-10 w-[85%] h-[85%] flex items-center justify-center">
                                                                                        <Image id={skillImageId} variant="skill-icon" className="w-full h-full object-contain filter drop-shadow" />
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            
                                                                            <div class="absolute left-16 top-1/2 -translate-y-1/2 bg-black/95 text-white px-2 py-1 rounded text-[10px] hidden group-hover:block z-30 border border-white/10 whitespace-nowrap shadow-xl">
                                                                                <span class="font-bold">{$t(`menu.${skillKey}`) || skillKey}:</span> {skillMeta.name || "Skill"}
                                                                            </div>

                                                                            <div class="flex items-center justify-center select-none mt-[-10px]">
                                                                                {#if skillLvl >= 10}
                                                                                    <div class="w-6 h-6 rounded-full bg-black/60 border border-white/10 flex flex-col items-center justify-center scale-95 shadow-md z-10 relative">
                                                                                        <div class="flex flex-col items-center mt-[-1px]">
                                                                                            <svg width="7" height="7" viewBox="0 0 24 24">
                                                                                                <path d="M12 2L21 7V17L12 22L3 17V7L12 2Z" fill={(skillLvl - 9) > 0 ? "#FFFFFF" : "rgba(255,255,255,0.1)"} stroke={(skillLvl - 9) > 0 ? "#FFFFFF" : "rgba(255,255,255,0.25)"} stroke-width="2.5" />
                                                                                            </svg>
                                                                                            <div class="flex ">
                                                                                                <svg width="7" height="7" viewBox="0 0 24 24">
                                                                                                    <path d="M12 2L21 7V17L12 22L3 17V7L12 2Z" fill={(skillLvl - 9) > 1 ? "#FFFFFF" : "rgba(255,255,255,0.1)"} stroke={(skillLvl - 9) > 1 ? "#FFFFFF" : "rgba(255,255,255,0.25)"} stroke-width="2.5" />
                                                                                                </svg>
                                                                                                <svg width="7" height="7" viewBox="0 0 24 24">
                                                                                                    <path d="M12 2L21 7V17L12 22L3 17V7L12 2Z" fill={(skillLvl - 9) > 2 ? "#FFFFFF" : "rgba(255,255,255,0.1)"} stroke={(skillLvl - 9) > 2 ? "#FFFFFF" : "rgba(255,255,255,0.25)"} stroke-width="2.5" />
                                                                                                </svg>
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
                                                                    {/if}
                                                                {/each}
                                                            </div>

                                                            <div class="flex flex-row items-end gap-3 shrink-0">
                                                                <div class="flex flex-col items-start select-none justify-end pb-1">
                                                                    <div class="flex items-baseline gap-1.5">
                                                                        <span class="text-[11px] font-bold text-white/50 uppercase tracking-wider" style="text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">Lv.</span>
                                                                        <span class="text-[42px] font-light text-white leading-none tracking-tighter font-nums" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.9);">{selectedChar.level}<span class="text-[22px] text-white/40 font-normal">/90</span></span>
                                                                    </div>
                                                                </div>
                                                                <!--<AsscentionIcon ascension={Math.min(4, Math.floor(selectedChar.level / 20))} size={46} className="" />-->
                                                            </div>
                                                            </div>

                                                            <div class="flex flex-col gap-3 items-end justify-center">
                                                                {#if talentsList && talentsList.length > 0}
                                                                    {#each talentsList as talent}
                                                                        <Tooltip text={talent.name + ": " + talent.desc}>
                                                                            <div class="group relative cursor-pointer transition-transform duration-200 hover:scale-105 select-none">
                                                                                {#if talent.type === "cultivation"}
                                                                                    <div class="w-[35px] h-[35px] flex items-center justify-center">
                                                                                        <Image
                                                                                            id={talent.localImageId || talent.iconUrl}
                                                                                            interactive={true}
                                                                                            variant="fac-skill"
                                                                                            className="max-w-full max-h-full object-contain"
                                                                                        />
                                                                                    </div>
                                                                                    {#if talent.name}
                                                                                        {@const match = talent.name.match(/[αβγ]\s*$/)}
                                                                                        {@const label = match ? match[0] : ""}
                                                                                        {#if label}
                                                                                            <div class="absolute -bottom-1 -right-1.5 z-10 text-white font-black font-serif text-[15px] select-none" style="text-shadow: 1px 1px 2px #000, -1px -1px 2px #000, 1px -1px 2px #000, -1px 1px 2px #000;">
                                                                                                {label}
                                                                                            </div>
                                                                                        {/if}
                                                                                    {/if}
                                                                                {:else}
                                                                                    <div class="w-[35px] h-[35px] rounded-full bg-[#F3CE00] border-[3px] border-[#D5B500] overflow-hidden flex items-center justify-center shadow-sm p-[2px]">
                                                                                        <Image
                                                                                            id={talent.localImageId || talent.iconUrl}
                                                                                            interactive={true}
                                                                                            variant="skill-icon"
                                                                                            className="w-full h-full object-cover rounded-full"
                                                                                        />
                                                                                    </div>
                                                                                    {#if talent.levelsCount > 1}
                                                                                        <div class="absolute -bottom-1.5 -right-1.5 z-10 flex gap-[2px] pb-1 items-center pointer-events-none select-none">
                                                                                            {#each Array(talent.levelsCount) as _, i}
                                                                                                {@const isActive = (i + 1) <= talent.currentLevel}
                                                                                                <div
                                                                                                    class="w-[4px] h-[10px] rounded-full transform rotate-[30deg] border-[1px] shrink-0
                                                                                                    {isActive
                                                                                                        ? 'border-[#FFE145] bg-[#FFE145] shadow-sm'
                                                                                                        : 'border-gray-500 bg-transparent'}"
                                                                                                ></div>
                                                                                            {/each}
                                                                                        </div>
                                                                                    {/if}
                                                                                {/if}
                                                                            </div>
                                                                        </Tooltip>
                                                                    {/each}
                                                                {/if}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div class="lg:col-span-5 flex flex-col gap-2 justify-between">
                                                    
                                                    {#if detailedChar?.weapon}
                                                        {@const wpn = detailedChar.weapon}
                                                        {@const wpnStatic = getWeaponData(wpn)}
                                                        {@const wpnName = $t(`weaponsList.${wpnStatic?.id}`) !== `weaponsList.${wpnStatic?.id}` ? $t(`weaponsList.${wpnStatic?.id}`) : (wpnStatic?.name || wpn.id)}
                                                        {@const wpnTerms = getWeaponTerms(wpn)}
                                                        
                                                        <div class="relative pl-8 pr-3 py-3 flex flex-row items-stretch justify-between gap-3 rounded-xl max-h-[140px]"
                                                             style="background: linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(20,20,20,0.85) 100%) padding-box, linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.15)) border-box;">
                                                            
                                                            <div class="flex flex-col justify-end items-start shrink-0">
                                                                <div class="flex flex-col items-start leading-none select-none">
                                                                    <span class="text-[9px] font-black text-white/50 uppercase tracking-wider" style="text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">Lv.</span>
                                                                    <span class="text-[36px] font-black text-white leading-none tracking-tighter" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.9);">{wpn.level}</span>
                                                                    <div class="w-12 h-[4px] mt-1 rounded" style="background-color: {getRarityColor(wpnStatic?.rarity || wpn.rarity || 5)};"></div>
                                                                </div>
                                                            </div>

                                                            <div class="flex flex-col gap-2 flex-1 min-w-0 ml-1">
                                                                <div class="flex flex-col items-end w-full min-w-0">
                                                                    <a href="/weapons/{wpnStatic?.id}?level={wpn.level}&refine={wpn.refineLevel}" class="flex flex-row-reverse overflow-visible w-full">
                                                                    <h4 class="text-md font-black text-white leading-tight text-nowrap shrink-0 mr-[-32px]" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.85);">
                                                                        {wpnName}
                                                                    </h4>
                                                                </a>
                                                                    <div class="flex items-center mt-2 select-none -space-x-1.5 mr-[-35px]">
                                                                        {#each Array(wpnStatic?.rarity || wpn.rarity || 5) as _}
                                                                            <Icon name="strokeStar" class="shrink-0 w-7 h-7 text-white" />
                                                                        {/each}
                                                                    </div>
                                                                </div>
                                                                
                                                                <div class="flex items-center gap-1.5 mt-8 select-none ml-[-6px] justify-start z-30">
                                                                    {#each ['atk', 'def', 'maxhp'] as statKey}
                                                                        {@const calculatedStat = statKey === 'atk' ? Math.round(80 + wpn.level * 2.5) : (statKey === 'def' ? Math.round(20 + wpn.level * 0.8) : Math.round(150 + wpn.level * 4))}
                                                                        <div class="flex items-center gap-1.5 text-[13px] font-black text-white font-nums bg-black/30 px-2 py-1 rounded leading-none border border-white/5 w-fit">
                                                                            <Icon name={statKey} class="w-3.5 h-3.5 text-white/90" />
                                                                            <span>+{calculatedStat}</span>
                                                                        </div>
                                                                    {/each}
                                                                </div>
                                                            </div>

                                                            <div class="flex items-center shrink-0 ml-2">
                                                                <div class="relative w-[120px] h-[120px] flex items-center justify-center shrink-0">
                                                                    <div class="absolute top-0 right-0 z-10">
                                                                        <Tooltip text="R{wpn.refineLevel !== undefined ? wpn.refineLevel : 0}">
                                                                            <PotentialIcon pot={wpn.refineLevel !== undefined ? wpn.refineLevel : 0} size={30} />
                                                                        </Tooltip>
                                                                    </div>
                                                                    <img 
                                                                        src={getWeaponIcon(wpn) || wpn.weaponData?.iconUrl || ''} 
                                                                        alt="Weapon" 
                                                                        class="w-full h-full object-contain pointer-events-none"
                                                                        on:error={(e) => { 
                                                                            if (wpn.weaponData?.iconUrl && e.target.src !== wpn.weaponData.iconUrl) { 
                                                                                e.target.src = wpn.weaponData.iconUrl; 
                                                                            } 
                                                                        }} 
                                                                    />
                                                                </div>
                                                                
                                                                {#if wpnTerms && wpnTerms.length > 0}
                                                                    <div class="flex flex-col gap-1 shrink-0 items-center justify-center ml-2 select-none">
                                                                        <div class="flex flex-col gap-1 w-full">
                                                                            {#each wpnTerms as term}
                                                                                <div class="flex items-center gap-1.5 px-2 py-1 rounded shadow-sm w-full justify-center" style="background: linear-gradient(to right, #1C1C1C, #2D2D2B);">
                                                                                    <div class="w-[5px] h-[12px] rounded-full transform rotate-[40deg] bg-[#FFE145] border-[#FFE145] shrink-0"></div>
                                                                                    <span class="text-[12px] font-black text-[#FFE145] font-nums leading-none">{term}</span>
                                                                                </div>
                                                                            {/each}
                                                                        </div>
                                                                        
                                                                        <div class="mt-1 flex items-center justify-center">
                                                                            {#if wpn.gem && wpn.gem.gemData}
                                                                                {@const gemRarity = wpn.gem.gemData.templateId === "item_gem_rarity_5" ? 5 : (wpn.gem.gemData.templateId === "item_gem_rarity_4" ? 4 : 3)}
                                                                                {@const gemColor = getRarityColor(gemRarity)}
                                                                                <Tooltip text={wpn.gem.gemData.name}>
                                                                                    <div class="relative w-8 h-8 rounded-md border-b flex items-center justify-center bg-black/40 shadow-inner overflow-hidden transition-transform cursor-pointer" 
                                                                                         style="border-color: {gemColor}; box-shadow: 0 0 4px {gemColor}33;">
                                                                                        {#if wpn.gem.gemData.icon}
                                                                                            <img src={wpn.gem.gemData.icon} alt={wpn.gem.gemData.name} referrerpolicy="no-referrer" class="w-7 h-7 object-contain" />
                                                                                        {:else}
                                                                                            <div class="w-1.5 h-1.5 rounded-full" style="background-color: {gemColor}"></div>
                                                                                        {/if}
                                                                                    </div>
                                                                                </Tooltip>
                                                                            {:else}
                                                                                <Tooltip text={$t("profile.no_essence") || "No essence"}>
                                                                                    <div class="relative w-8 h-8 rounded-md border border-dashed border-white/20 bg-black/20 flex items-center justify-center text-white/20 hover:border-white/40 hover:text-white/40 transition-colors cursor-pointer">
                                                                                        <Icon name="noData" class="shrink-0 w-3 h-3" />
                                                                                    </div>
                                                                                </Tooltip>
                                                                            {/if}
                                                                        </div>
                                                                    </div>
                                                                {/if}
                                                            </div>
                                                            
                                                        </div>
                                                    {:else}
                                                        <div class="flex flex-col gap-2 items-center justify-center bg-gradient-to-r from-transparent to-[#1a1a1a] border border-white/5 rounded-xl p-6 text-xs text-white/40 italic flex items-center justify-center min-h-[150px]">
                                                            <Icon name="noData" class="shrink-0 w-6 h-6" />
                                                            {$t("profile.no_weapon") || "No weapon"}
                                                        </div>
                                                    {/if}

                                                    <div class="grid grid-cols-2 gap-2 flex-1">
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
                                                                        list.push({
                                                                            propKey: "equip_attr_def",
                                                                            statIcon: "def",
                                                                            statVal: staticDefAttr.values[tier] || staticDefAttr.values[0]
                                                                        });
                                                                    } else {
                                                                        list.push({
                                                                            propKey: "equip_attr_def",
                                                                            statIcon: "def",
                                                                            statVal: 10 + tier * 5
                                                                        });
                                                                    }
                                                                    
                                                                    const subProperties = (equip.equipData.properties || []).filter(p => !p.toLowerCase().includes("def"));
                                                                    for (const propKey of subProperties) {
                                                                        const statIcon = getStatIcon(propKey);
                                                                        const displayAttr = staticEquip?.displayAttr?.find(a => a.attrType === propKey.replace("equip_attr_", "").toUpperCase() || propKey.toLowerCase().includes(a.attrType.toLowerCase()));
                                                                        const statVal = displayAttr ? displayAttr.values[tier] || displayAttr.values[0] : null;
                                                                        list.push({
                                                                            propKey,
                                                                            statIcon,
                                                                            statVal
                                                                        });
                                                                    }
                                                                    return list;
                                                                })()}
                                                                
                                                                <a href="/equipment/{staticId || equip.equipId}" 
                                                                   class="relative flex items-center justify-between p-2 rounded-xl pl-5 hover:bg-white/5 transition-all cursor-pointer min-h-[32px] min-w-0"
                                                                   style="background: linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(20,20,20,0.85) 100%) padding-box, linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.15)) border-box;">
                                                                    
                                                                    <div class="flex flex-col items-center justify-between shrink-0 h-full">
                                                                        <div class="w-9 h-5 select-none self-start">
                                                                            <svg class="w-full h-full filter drop-shadow-[0_2px_2px_rgba(0,0,0,0.7)]" viewBox="0 0 54 30" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                                                                        
                                                                        <div class="relative w-20 h-20 flex items-center justify-center -my-1">
                                                                            <img src={staticId ? getImagePath(staticId, 'equipment') : (equip.equipData?.iconUrl || '')} alt="Equip" class="w-[110%] h-full object-contain pointer-events-none shadow-md" on:error={(e) => { if (equip.equipData?.iconUrl) e.target.src = equip.equipData.iconUrl; }} />
                                                                        </div>
                                                                        
                                                                        <div class="w-12 h-[3px] rounded" style="background-color: {rarityColor};"></div>
                                                                    </div>
                                                                    
                                                                    <div class="flex flex-col items-end gap-1 flex-1 select-none overflow-hidden justify-center h-full">
                                                                        {#each statsToRender as stat}
                                                                            <div class="flex items-center gap-1.5 text-[13px] font-black text-white font-nums bg-black/30 px-2 py-1 rounded leading-none border border-white/5 w-fit">
                                                                                {#if stat.statIcon}
                                                                                    <Icon name={stat.statIcon} class="w-3.5 h-3.5 text-white/90" />
                                                                                {/if}
                                                                                <span>
                                                                                    {#if stat.statVal !== null && stat.statVal !== undefined}
                                                                                        {#if Math.abs(stat.statVal) > 0 && Math.abs(stat.statVal) < 1}
                                                                                            {Math.round(stat.statVal * 100)}%
                                                                                        {:else}
                                                                                            +{Math.round(stat.statVal)}
                                                                                        {/if}
                                                                                    {:else}
                                                                                        +{10 + tier * 5}
                                                                                    {/if}
                                                                                </span>
                                                                            </div>
                                                                        {/each}
                                                                        
                                                                        {#if statsToRender.length < 4}
                                                                            {#each Array(4 - statsToRender.length) as _}
                                                                                <div class="h-[22px] w-2"></div>
                                                                            {/each}
                                                                        {/if}
                                                                    </div>
                                                                </a>
                                                            {:else}
                                                                <div class="flex items-center justify-center bg-[#202020]/40 border border-dashed border-white/10 rounded-xl min-h-[84px] text-[10px] text-white/30 uppercase select-none">
                                                                    Empty Slot
                                                                </div>
                                                            {/if}
                                                        {/each}
                                                    </div>

                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                {/key}
                            {/if}
                        </div>
                    </div>

                </div>
            {:else}
                <div class="bg-white/5 dark:bg-[#383838]/5 border border-white/5 rounded-2xl p-12 text-center backdrop-blur-sm text-gray-500 font-mono text-sm shadow-xl leading-relaxed" in:fade>
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

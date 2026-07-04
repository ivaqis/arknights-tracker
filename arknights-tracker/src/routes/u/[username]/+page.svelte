<script>
    import { page } from "$app/stores";
    import { t } from "$lib/i18n.js";
    import { getUserProfileByName } from "$lib/api.js";
    import { fade } from "svelte/transition";
    import Icon from "$lib/components/Icon.svelte";
    import OperatorCard from "$lib/components/cards/OperatorCard.svelte";
    import Image from "$lib/components/Image.svelte";
    import PotentialIcon from "$lib/components/operators/PotentialIcon.svelte";
    import Tooltip from "$lib/components/Tooltip.svelte";
    import { characters } from "$lib/data/characters.js";
    import { weapons } from "$lib/data/weapons.js";
    import { equipment } from "$lib/data/items/equipment.js";
    import { getImagePath } from "$lib/utils/imageUtils.js";
    import { currentLocale } from "$lib/stores/locale.js";
    import { formatContractDescription } from "$lib/utils/richText.js";
    import ContractLevelTag from "$lib/components/profile/ContractLevelTag.svelte";
    import ruEquip from "$lib/locales/ru/equipment.json";
    import enEquip from "$lib/locales/en/equipment.json";

    $: username = $page.params.username;

    let profile = null;
    let loading = true;
    let errorMsg = "";
    let selectedGameUid = null;

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
        const gameId = weapon.id;
        const mappedId = weaponIdMap[gameId];
        const staticData = (mappedId && weapons[mappedId]) || Object.values(weapons || {}).find(w => w.id === gameId || w.gameId === gameId);
        if (staticData) {
            return staticData;
        }
        return {
            id: gameId,
            name: weapon.name || gameId,
            rarity: Number(weapon.rarity?.value || weapon.rarity || 4),
            type: weapon.type || "sword"
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
                        selectedGameUid = profile.details[0].game_uid;
                    }
                }
            }
        } catch (e) {
            errorMsg = e.message || "Failed to load profile";
        } finally {
            loading = false;
        }
    }

    $: activeAccount = profile?.details?.find(d => d.game_uid === selectedGameUid) || profile?.details?.[0];

    function getServerLabel(serverId) {
        return serverId === "2" ? "Asia" : "Americas / Europe";
    }



    function getAvatarUrl(pictureId) {
        if (pictureId) return `http://localhost:3001/uploads/${pictureId}.webp`;
        return "";
    }
</script>

<svelte:head>
    <title>{username ? `${username} - Profile | Goyfield` : 'Player Profile | Goyfield'}</title>
</svelte:head>

<div class="container mx-auto px-4 py-8 select-text">
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
        <div class="flex items-center justify-center min-h-[50vh] relative z-10">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFE145]"></div>
        </div>
    {:else if errorMsg}
        <div class="flex flex-col items-center justify-center min-h-[50vh] text-center relative z-10" in:fade>
            <div class="bg-white/5 border border-white/10 p-8 rounded-2xl max-w-md backdrop-blur-md shadow-2xl">
                <Icon name="warning" class="w-16 h-16 text-red-500 mb-4 mx-auto" />
                <h3 class="text-xl font-bold dark:text-white text-gray-900 mb-2 font-sdk">
                    {errorMsg === "Profile not found" ? "Профиль не найден" : "Профиль скрыт"}
                </h3>
                <p class="text-sm dark:text-gray-400 text-gray-600 font-mono">
                    {errorMsg === "Profile not found" 
                        ? `Пользователь с именем "${username}" не зарегистрирован.` 
                        : "Этот пользователь скрыл свои данные в настройках приватности."}
                </p>
                <a href="/leaderboard" class="mt-6 inline-block px-6 py-2.5 bg-[#FFE145] hover:bg-[#ebd03e] text-gray-900 font-bold rounded-lg transition-colors font-sdk text-sm">
                    Вернуться к лидерборду
                </a>
            </div>
        </div>
    {:else if profile}
        <!-- Read-Only Profile view -->
        <div class="space-y-6 relative z-10" in:fade>
            <!-- Top Header user card -->
            <div class="bg-white/80 dark:bg-[#383838]/75 border border-gray-200 dark:border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div class="flex items-center gap-4">
                    <!-- Read-Only Avatar -->
                    <div class="shrink-0">
                        {#if getAvatarUrl(profile.picture)}
                            <img
                                src={getAvatarUrl(profile.picture)}
                                alt="User Avatar"
                                class="w-20 h-20 rounded-xl border-2 border-white/20 object-cover"
                            />
                        {:else}
                            <div class="w-20 h-20 rounded-xl bg-white/10 border-2 border-white/20 flex items-center justify-center text-white/50 text-2xl font-bold">
                                {profile.name ? profile.name[0].toUpperCase() : "?"}
                            </div>
                        {/if}
                    </div>

                    <!-- Display Name -->
                    <div class="flex flex-col gap-1">
                        <h1 class="text-2xl font-bold dark:text-white text-gray-900 font-sdk">
                            {profile.name}
                        </h1>
                    </div>
                </div>

                <!-- Game account cards inside header -->
                <div class="flex flex-wrap items-center gap-4">
                    {#if profile.details && profile.details.length > 0}
                        {#each profile.details as d}
                            <div
                                on:click={() => selectedGameUid = d.game_uid}
                                on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') selectedGameUid = d.game_uid; }}
                                role="button"
                                tabindex="0"
                                class="bg-white/40 dark:bg-black/20 backdrop-blur-md border text-left p-3 rounded-xl flex items-center gap-4 w-[285px] hover:bg-white/60 dark:hover:bg-black/35 transition-all cursor-pointer select-none outline-none focus-visible:ring-1 focus-visible:ring-[#FFE145]
                                {selectedGameUid === d.game_uid ? 'border-2 border-[#FFE145]' : 'border-2 border-white/10 dark:border-white/5'}"
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
                                    <div class="text-[10px] text-gray-400 font-mono truncate">UID: {d.game_uid}</div>
                                    <div class="bg-gray-200 text-gray-600 dark:bg-[#383838] dark:text-[#B0B0B0] px-1.5 py-0.5 rounded text-[9px] font-medium font-sans w-fit truncate">
                                        {getServerLabel(d.info?.base?.serverId)}
                                    </div>
                                </div>
                                <div class="flex flex-col items-center justify-center shrink-0 min-w-[36px] border-l border-white/10 pl-3">
                                    <span class="bg-gray-800 text-white dark:bg-white dark:text-black font-black text-[9px] px-1 rounded-[2px] tracking-tighter uppercase leading-none mb-0.5 select-none">Lv.</span>
                                    <span class="text-2xl font-black dark:text-white text-gray-900 font-mono leading-none">{d.info?.base?.level || 1}</span>
                                </div>
                            </div>
                        {/each}
                    {/if}
                </div>
            </div>

            <!-- Profile Content Grid (3 Columns) -->
            {#if activeAccount}
                <div class="grid grid-cols-1 xl:grid-cols-3 gap-6" in:fade>
                    
                    <!-- COLUMN 1: Overview and Gacha statistics -->
                    <div class="space-y-6">
                        <!-- Overview Card -->
                        <div class="bg-white/80 dark:bg-[#383838]/75 border border-gray-200 dark:border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-xl">
                            <h2 class="text-xl font-bold dark:text-white text-gray-900 mb-6 font-sdk border-b border-white/10 pb-3">
                                {$t("profile.overview")}
                            </h2>
                            <div class="space-y-4 font-mono text-sm">
                                <div class="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-white/5">
                                    <span class="text-gray-700 dark:text-gray-200 font-medium">{$t("profile.operators_count")}</span>
                                    <span class="dark:text-white text-gray-900 font-bold">{activeAccount.info?.stats?.charCount || 0} / {Object.keys(charactersById).length}</span>
                                </div>
                                <div class="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-white/5">
                                    <span class="text-gray-700 dark:text-gray-200 font-medium">{$t("profile.exploration_level")}</span>
                                    <span class="dark:text-white text-gray-900 font-bold">{activeAccount.info?.stats?.explorationLevel || 0}</span>
                                </div>
                                <div class="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-white/5">
                                    <span class="text-gray-700 dark:text-gray-200 font-medium">{$t("profile.weapons")}</span>
                                    <span class="dark:text-white text-gray-900 font-bold">{activeAccount.info?.stats?.weaponCount || 0}</span>
                                </div>
                                <div class="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-white/5">
                                    <span class="text-gray-700 dark:text-gray-200 font-medium">{$t("profile.files")}</span>
                                    <span class="dark:text-white text-gray-900 font-bold">{activeAccount.info?.stats?.fileCount || 0}</span>
                                </div>
                                <div class="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-white/5">
                                    <span class="text-gray-700 dark:text-gray-200 font-medium">{$t("profile.awake_day")}</span>
                                    <span class="dark:text-white text-gray-900 font-bold">{activeAccount.info?.stats?.awakeDay || "-"}</span>
                                </div>
                                <div class="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-white/5">
                                    <span class="text-gray-700 dark:text-gray-200 font-medium">{$t("profile.sanity")}</span>
                                    <span class="dark:text-white text-gray-900 font-bold">{activeAccount.info?.stats?.sanity || 0} / {activeAccount.info?.stats?.maxSanity || 358}</span>
                                </div>
                                <div class="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-white/5">
                                    <span class="text-gray-700 dark:text-gray-200 font-medium">{$t("profile.protopass")}</span>
                                    <span class="dark:text-white text-gray-900 font-bold">{activeAccount.info?.stats?.protoPass || 0} / {activeAccount.info?.stats?.protoPassMax || 60}</span>
                                </div>
                                <div class="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-white/5">
                                    <span class="text-gray-700 dark:text-gray-200 font-medium">{$t("profile.weekly_routine")}</span>
                                    <span class="dark:text-white text-gray-900 font-bold">{activeAccount.info?.stats?.weeklyRoutine || 0} / {activeAccount.info?.stats?.weeklyRoutineMax || 10}</span>
                                </div>
                                <div class="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-white/5">
                                    <span class="text-gray-700 dark:text-gray-200 font-medium">{$t("profile.activity_points")}</span>
                                    <span class="dark:text-white text-gray-900 font-bold">{activeAccount.info?.stats?.activityPoints || 0} / {activeAccount.info?.stats?.activityPointsMax || 100}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Statistics Mock Card -->
                        <div class="bg-white/80 dark:bg-[#383838]/75 border border-gray-200 dark:border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-xl">
                            <h2 class="text-xl font-bold dark:text-white text-gray-900 mb-4 font-sdk border-b border-white/10 pb-3">
                                {$t("profile.stats")}
                            </h2>
                            <div class="h-40 flex items-center justify-center border border-white/10 rounded-xl bg-white/5 font-mono text-xs text-gray-500">
                                Global Rank Percentile: Top 5.2%
                            </div>
                        </div>
                    </div>

                    <!-- COLUMN 2: Crisis Contract details -->
                    <div>
                        <div class="bg-white/80 dark:bg-[#383838]/75 border border-gray-200 dark:border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-xl h-full flex flex-col">
                            <div class="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                                <div class="flex items-center gap-2">
                                    <Icon name="contract" class="w-6 h-6 text-[#FFE145]" />
                                    <h2 class="text-xl font-bold dark:text-white text-gray-900 font-sdk">
                                        {$t("profile.crisis_contract")}
                                    </h2>
                                </div>
                            </div>

                            {#if activeAccount.info?.contract && activeAccount.info.contract.level > 0}
                                <div class="flex items-center justify-between mb-4">
                                    <div class="text-sm font-sdk dark:text-gray-400 text-gray-600">
                                        {$t("profile.clear_time_label")} 
                                        <span class="dark:text-white text-gray-900 font-bold text-lg ml-1 font-mono">
                                            {activeAccount.info.contract.clearTime} сек.
                                        </span>
                                    </div>
                                    <ContractLevelTag level={activeAccount.info.contract.level || 0} />
                                </div>

                                <div class="flex flex-row justify-center gap-2 flex-wrap">
                                    {#each activeAccount.info.contract.chars as char}
                                        {@const opData = getOperatorData(char)}
                                        <div class="flex flex-col bg-[#111111] border border-white/10 rounded-b-[4px] min-w-0 w-[84px] max-w-[84px] shrink-0 shadow-md relative">
                                            <a href="/operators/{opData.id}" class="relative w-full h-[150px] bg-white/5 overflow-hidden shrink-0 block group cursor-pointer">
                                                <div class="w-full h-full transition-transform duration-300 group-hover:scale-105">
                                                    <Image id={opData.id} variant="operator-preview" className="w-full h-full object-cover" />
                                                </div>
                                                <div class="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#111111] to-transparent z-20 pointer-events-none"></div>
                                                
                                                <!-- svelte-ignore a11y-click-events-have-key-events -->
                                                <!-- svelte-ignore a11y-no-static-element-interactions -->
                                                <div class="absolute top-1 right-1 z-30" on:click|stopPropagation|preventDefault>
                                                    <Tooltip text="P{(char.potential || 1) - 1}">
                                                        <PotentialIcon pot={(char.potential || 1) - 1} size={32} />
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
                                                    <a href="/weapons/{weaponData.id}?level={char.weapon.level}&refine={char.weapon.refineLevel !== undefined ? char.weapon.refineLevel : 0}&skills={char.weapon.weaponTerms ? char.weapon.weaponTerms.join(',') : ''}" class="relative w-[96px] h-[68px] flex items-center justify-between p-1 overflow-hidden shrink-0 z-20 ml-[-12px] transition-transform duration-200 hover:scale-105 cursor-pointer block"
                                                         style="border: 1px solid transparent; background: linear-gradient(to right, #363634, #111111) padding-box, linear-gradient(to right, #464644, #1b1b1a) border-box;">
                                                        
                                                        <img 
                                                            src={getWeaponIcon(char.weapon)} 
                                                            alt="Weapon" 
                                                            class="absolute left-[40%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 object-contain opacity-50 pointer-events-none rotate-[-15deg]"
                                                            on:error={(e) => e.target.src = char.weapon.icon}
                                                        />
                                                        
                                                        <div class="flex flex-col justify-between h-full z-10 items-start">
                                                            <PotentialIcon pot={char.weapon.refineLevel !== undefined ? char.weapon.refineLevel : 0} size={20} />
                                                            <div class="flex flex-col items-start leading-none">
                                                                <span class="text-[7px] text-white/50 font-black">LV</span>
                                                                <span class="text-[16px] text-white font-nums font-black leading-none" style="text-shadow: 1px 1px 0 #111;">
                                                                    {char.weapon.level}
                                                                </span>
                                                                <div class="w-6 h-[2px] bg-[#E3A000] mt-0.5"></div>
                                                            </div>
                                                        </div>

                                                        <div class="flex flex-col gap-0.5 z-10 items-end justify-center h-full pr-1">
                                                            {#each char.weapon.weaponTerms || [] as term}
                                                                <div class="flex items-center gap-0.5 px-1 py-0.5 rounded-[2px]" style="background: linear-gradient(to right, #111111, #2D2D2B);">
                                                                    <svg class="w-2.5 h-1.5 rotate-[-25deg]" viewBox="0 0 16 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                        <path d="M2 2C2 0.9 2.9 0 4 0H10L14 5L10 10H4C2.9 10 2 9.1 2 8V2Z" fill="#FFE145" />
                                                                    </svg>
                                                                    <span class="text-[9px] font-black text-[#FFE145] font-nums leading-none">{term}</span>
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
                                                        {@const staticId = getStaticEquipId(equip.equipData) || equip.id}
                                                        {@const tier = Math.max(0, (equip.enhanceStatus || 1) - 1)}
                                                        <Tooltip text={equipmentNames[staticId]?.name || equip.equipData?.name || staticId}>
                                                            <a href="/equipment/{staticId}" class="relative flex items-center justify-between w-[38px] h-[28px] p-0.5 min-w-0 transition-transform duration-200 hover:scale-110 hover:z-20 cursor-pointer block"
                                                                 style="border: 1px solid transparent; background: linear-gradient(to right, #101010, #1A4558) padding-box, linear-gradient(to right, #3D3F3A, #194457) border-box;">
                                                                
                                                                <div class="relative w-[14px] h-[8px] flex items-center justify-center shrink-0 ml-0.5">
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
                                                                    class="w-[22px] h-[22px] object-contain pointer-events-none mr-0.5 shrink-0"
                                                                    on:error={(e) => { if (equip.equipData?.iconUrl) e.target.src = equip.equipData.iconUrl; else if (equip.icon) e.target.src = equip.icon; }}
                                                                />
                                                                
                                                                <div class="left-0.5 w-[14px] h-[1.5px] bg-[#E3A000] absolute bottom-0.5"></div>
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
                                <div class="text-center py-10 text-gray-400 italic flex flex-col items-center bg-gray-50 dark:bg-[#2C2C2C] rounded-2xl border border-dashed border-gray-200 dark:border-[#333] w-full">
                                    <Icon name="noData" class="w-8 h-8 mb-2 opacity-30" />
                                    <p class="text-sm">
                                        {$t("emptyState.noData") || "No records found"}
                                    </p>
                                </div>
                            {/if}
                        </div>
                    </div>

                    <!-- COLUMN 3: Operator Grid -->
                    <div>
                        <div class="bg-white/80 dark:bg-[#383838]/75 border border-gray-200 dark:border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-xl h-full flex flex-col">
                            <div class="flex items-center justify-between border-b border-white/10 pb-3 mb-6">
                                <h2 class="text-xl font-bold dark:text-white text-gray-900 font-sdk">
                                    {$t("profile.operators_title")}
                                </h2>
                            </div>

                            <div class="grid grid-cols-[repeat(auto-fill,120px)] gap-3 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar flex-1 justify-center">
                                {#each activeAccount.info?.chars || [] as char}
                                    {@const opData = getOperatorData(char)}
                                    <OperatorCard
                                        operator={opData}
                                        level={char.level}
                                        potential={(char.potential || 1) - 1}
                                        owned={true}
                                    />
                                {/each}
                            </div>
                        </div>
                    </div>

                </div>
            {:else}
                <div class="bg-white/5 border border-white/10 rounded-2xl p-12 text-center backdrop-blur-md text-gray-500 font-mono text-sm leading-relaxed" in:fade>
                    No connected game accounts.
                </div>
            {/if}
        </div>
    {/if}
</div>

<style>
    .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.02);
        border-radius: 3px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 3px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.2);
    }
</style>

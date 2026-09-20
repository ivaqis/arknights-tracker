<script>
    import { onMount } from "svelte";
    import { browser } from "$app/environment";
    import { t } from "$lib/i18n.js";
    import { currentLocale } from "$lib/stores/locale.js";
    import { fetchLeaderboard, fetchLeaderboardRun, getAvatarUrl } from "$lib/api.js";
    import { user } from "$lib/stores/cloudStore.js";
    import { addNotification } from "$lib/stores/notifications.js";
    import { fade, fly } from "svelte/transition";
    import { characters } from "$lib/data/characters.js";
    import { weapons } from "$lib/data/weapons.js";
    import { enemies } from "$lib/data/enemies.js";
    import { getRarityColor } from "$lib/utils/colorUtils.js";
    import { parseRichText } from "$lib/utils/richText.js";
    import { monumentGroups } from "$lib/data/monuments.js";
    import { warEchoesSeasons } from "$lib/data/warEchoes.js";

    import Icon from "$lib/components/Icon.svelte";
    import Button from "$lib/components/Button.svelte";
    import ContractLevelTag from "$lib/components/profile/ContractLevelTag.svelte";
    import CrisisContract from "$lib/components/profile/ContractContainer.svelte";
    import Select from "$lib/components/Select.svelte";
    import Modal from "$lib/components/modals/Modal.svelte";
    import Tooltip from "$lib/components/Tooltip.svelte";
    import WeaponCard from "$lib/components/cards/WeaponCard.svelte";
    import MiniOperatorCard from "$lib/components/cards/MiniOperatorCard.svelte";

    const dungeonModules = import.meta.glob('/src/lib/locales/*/dungeons.json');
    let dungeonLocales = {};

    $: {
        const loader = dungeonModules[`/src/lib/locales/${$currentLocale}/dungeons.json`] || dungeonModules['/src/lib/locales/en/dungeons.json'];
        if (loader) {
            loader().then(mod => {
                dungeonLocales = mod.default || mod;
            });
        }
    }

    $: serverOptions = [
        { value: 'all', label: $t('leaderboard.filter_all') },
        { value: '3', label: 'Americas/Europe' },
        { value: '2', label: 'Asia' }
    ];

    $: monumentGroupOptions = monumentGroups.map(g => ({
        value: g.id,
        label: $t(`monument.${g.id}`),
        iconId: g.id
    }));

    function formatDateRange(startTime, endTime, locale) {
        if (!startTime || !endTime) return "";
        try {
            const start = new Date(startTime.replace(" ", "T"));
            const end = new Date(endTime.replace(" ", "T"));
            const opt = { day: "2-digit", month: "2-digit", year: "numeric" };
            const loc = locale === "ru" ? "ru-RU" : (locale === "en" ? "en-US" : locale);
            return `${start.toLocaleDateString(loc, opt)} - ${end.toLocaleDateString(loc, opt)}`;
        } catch {
            return `${startTime.slice(0, 10)} - ${endTime.slice(0, 10)}`;
        }
    }

    $: warEchoesSeasonOptions = warEchoesSeasons.map(s => ({
        value: s.id,
        label: $t(`warEchoesSeasons.${s.id}`),
        subLabel: formatDateRange(s.startTime, s.endTime, $currentLocale)
    }));

    let entries = [];
    let loading = true;
    let selectedEvent = (browser && typeof localStorage !== "undefined" && localStorage.getItem("leaderboard_event"))
        || "monument";
    let selectedMonumentGroup = (browser && typeof localStorage !== "undefined" && localStorage.getItem("leaderboard_monument_group"))
        || "indie_group_h06";
    let selectedStageId = (browser && typeof localStorage !== "undefined" && localStorage.getItem("leaderboard_stage_id"))
        || "indie_hard025";
    let isAgony = (browser && typeof localStorage !== "undefined" && localStorage.getItem("leaderboard_is_agony") !== null)
        ? localStorage.getItem("leaderboard_is_agony") === "true"
        : true;
    let selectedWarEchoesSeason = (browser && typeof localStorage !== "undefined" && localStorage.getItem("leaderboard_we_season"))
        || (warEchoesSeasons[0]?.id)
        || "4";
    let selectedWarEchoesCycle = (browser && typeof localStorage !== "undefined" && localStorage.getItem("leaderboard_we_cycle"))
        || "1";
    let selectedWarEchoesDifficulty = (browser && typeof localStorage !== "undefined" && localStorage.getItem("leaderboard_we_diff"))
        || "brutal";
    let selectedWarEchoesStageId = (browser && typeof localStorage !== "undefined" && localStorage.getItem("leaderboard_we_stage"))
        || (warEchoesSeasons[0]?.weeks?.[0]?.stages?.[0]?.id)
        || "indie_battletower012";
    let serverFilter = (browser && typeof localStorage !== "undefined" && localStorage.getItem("leaderboard_server"))
        || "all";
    let teamSizeFilter = (browser && typeof localStorage !== "undefined" && localStorage.getItem("leaderboard_team_size"))
        ? Number(localStorage.getItem("leaderboard_team_size"))
        : null;

    $: if (browser && typeof localStorage !== "undefined") {
        localStorage.setItem("leaderboard_event", selectedEvent);
    }
    $: if (browser && typeof localStorage !== "undefined") {
        localStorage.setItem("leaderboard_monument_group", selectedMonumentGroup);
    }
    $: if (browser && typeof localStorage !== "undefined" && selectedStageId) {
        localStorage.setItem("leaderboard_stage_id", selectedStageId);
    }
    $: if (browser && typeof localStorage !== "undefined") {
        localStorage.setItem("leaderboard_we_season", selectedWarEchoesSeason);
    }
    $: if (browser && typeof localStorage !== "undefined") {
        localStorage.setItem("leaderboard_we_cycle", selectedWarEchoesCycle);
    }
    $: if (browser && typeof localStorage !== "undefined") {
        localStorage.setItem("leaderboard_we_diff", selectedWarEchoesDifficulty);
    }
    $: if (browser && typeof localStorage !== "undefined" && selectedWarEchoesStageId) {
        localStorage.setItem("leaderboard_we_stage", selectedWarEchoesStageId);
    }
    $: if (browser && typeof localStorage !== "undefined") {
        localStorage.setItem("leaderboard_server", serverFilter);
    }
    $: if (browser && typeof localStorage !== "undefined") {
        if (teamSizeFilter !== null) {
            localStorage.setItem("leaderboard_team_size", String(teamSizeFilter));
        } else {
            localStorage.removeItem("leaderboard_team_size");
        }
    }

    $: currentGroup = monumentGroups.find(g => g.id === selectedMonumentGroup) || monumentGroups[0];

    $: currentCoverPath = currentStage?.picPath || "dung_high_difficulty_s6_01";

    $: if (currentGroup && !currentGroup.stages.some(s => s.id === selectedStageId)) {
        selectedStageId = currentGroup.stages[0]?.id || "indie_hard025";
    }

    $: currentStage = currentGroup?.stages?.find(s => s.id === selectedStageId) || currentGroup?.stages?.[0];

    $: currentSeason = warEchoesSeasons.find(s => s.id === selectedWarEchoesSeason) || warEchoesSeasons[0];

    $: if (currentSeason && !currentSeason.weeks.some(w => w.id === selectedWarEchoesCycle)) {
        selectedWarEchoesCycle = currentSeason.weeks[0]?.id || "1";
    }

    $: currentCycle = currentSeason?.weeks?.find(w => w.id === selectedWarEchoesCycle) || currentSeason?.weeks?.[0];

    $: if (currentCycle && !currentCycle.stages.some(s => s.id === selectedWarEchoesStageId)) {
        selectedWarEchoesStageId = currentCycle.stages[0]?.id || "indie_battletower001";
    }

    $: currentWarEchoesStage = currentCycle?.stages?.find(s => s.id === selectedWarEchoesStageId) || currentCycle?.stages?.[0];

    $: currentDungeonId = selectedEvent === 'monument'
        ? (isAgony ? (currentStage?.hardId || `${selectedStageId}_s`) : selectedStageId)
        : (selectedWarEchoesDifficulty === 'normal'
            ? (currentWarEchoesStage?.id || selectedWarEchoesStageId)
            : (selectedWarEchoesDifficulty === 'hard'
                ? (currentWarEchoesStage?.hardId || `${selectedWarEchoesStageId}_s`)
                : (currentWarEchoesStage?.brutalId || `${selectedWarEchoesStageId}_ex`)));

    $: currentDungeonLocale = dungeonLocales[currentDungeonId]
        || dungeonLocales[selectedEvent === 'monument' ? selectedStageId : selectedWarEchoesStageId]
        || {};

    $: currentEnemies = (selectedEvent === 'monument'
        ? (currentStage?.enemyIds || []).map((rawId, idx) => {
            const cleanId = rawId.replace(/_hdg\d+$/, "").replace(/_(sluggish|yujidian|notele)$/, "");
            const baseEnemy = enemies[cleanId] || enemies[rawId] || {};
            const level = isAgony ? 90 : (currentStage?.enemyLevels?.[idx] || 60);
            return {
                id: cleanId,
                rawId,
                rarity: baseEnemy.rarity || 4,
                level,
                name: cleanId
            };
        })
        : (currentWarEchoesStage?.enemyIds || []).map((rawId, idx) => {
            const cleanId = rawId.replace(/(_tower\d*|_race\d*|_hdg\d*|_hard\d*|_nearspecial\d*).*$/, "");
            const baseEnemy = enemies[cleanId] || enemies[rawId] || {};
            let level = 60;
            if (selectedWarEchoesDifficulty === 'normal') {
                level = currentWarEchoesStage?.enemyLevels?.[idx] || 60;
            } else if (selectedWarEchoesDifficulty === 'hard') {
                level = currentWarEchoesStage?.hardEnemyLevels?.[idx] || 75;
            } else {
                level = currentWarEchoesStage?.brutalEnemyLevels?.[idx] || 90;
            }
            return {
                id: cleanId,
                rawId,
                rarity: baseEnemy.rarity || 4,
                level,
                name: cleanId
            };
        }));

    const weaponsById = Object.values(weapons || {}).reduce((acc, w) => {
        if (w && w.id) acc[w.id] = w;
        if (w && w.gameId) acc[w.gameId] = w;
        return acc;
    }, {});

    function getWeaponData(weapon) {
        if (!weapon) return null;
        const wpnId = weapon.id;
        return weaponsById[wpnId] || { name: weapon.id || "Weapon" };
    }

    function getDungeonName(id) {
        if (!id) return "";
        if (selectedEvent === 'echoesOfWar') {
            return $t(`warEchoesStages.${id}`) || id;
        }
        const baseId = id.replace(/_s$/, "");
        for (const group of monumentGroups) {
            const stage = group.stages.find(s => s.id === baseId);
            if (stage) {
                const groupName = $t(`monument.${group.id}`);
                const stageName = $t(`monumentStages.${stage.id}`);
                return `${groupName} - ${stageName}${id.endsWith('_s') ? ` (${$t("leaderboard.agony")})` : ""}`;
            }
        }
        return id;
    }

    function toggleAgony() {
        isAgony = !isAgony;
        if (browser && typeof localStorage !== "undefined") {
            localStorage.setItem("leaderboard_is_agony", isAgony.toString());
        }
    }

    let selectedEntry = null;
    let selectedRunDetails = null;
    let runDetailsLoading = false;
    let sortField = "default";
    let sortAsc = true;

    let prevEvent = selectedEvent;
    let prevDungeon = currentDungeonId;
    let prevServer = serverFilter;
    let prevTeamSize = teamSizeFilter;

    async function selectEntry(entry) {
        if (!entry) {
            selectedEntry = null;
            selectedRunDetails = null;
            return;
        }
        selectedEntry = entry;
        selectedRunDetails = null;
        runDetailsLoading = true;
        try {
            const data = await fetchLeaderboardRun(entry.id, selectedEvent);
            if (data) {
                selectedRunDetails = data;
            }
        } catch (e) {
            console.error("Failed to load run details:", e);
        } finally {
            runDetailsLoading = false;
        }
    }

    function handleSort(field) {
        if (sortField === field) {
            if (field === "level" || field === "contractLevel") {
                if (!sortAsc) {
                    sortAsc = true;
                } else {
                    sortField = "default";
                }
            } else if (field === "time") {
                if (sortAsc) {
                    sortAsc = false;
                } else {
                    sortField = "default";
                }
            }
        } else {
            sortField = field;
            if (field === "level" || field === "contractLevel") {
                sortAsc = false;
            } else if (field === "time") {
                sortAsc = true;
            }
        }
        loadLeaderboard();
    }

    async function loadLeaderboard() {
        if (selectedEvent === 'echoesOfWar') {
            entries = [];
            loading = false;
            return;
        }
        loading = true;
        try {
            entries = await fetchLeaderboard({
                event: selectedEvent,
                dungeonId: selectedEvent === 'monument' ? currentDungeonId : undefined,
                serverId: serverFilter,
                charCountFilter: teamSizeFilter ? String(teamSizeFilter) : '',
                sortField: sortField === "default" ? undefined : sortField,
                sortOrder: sortAsc ? "asc" : "desc"
            });
        } catch (e) {
            addNotification("error", $t("leaderboard.load_failed"));
        } finally {
            loading = false;
        }
    }

    $: if (selectedEvent !== prevEvent) {
        prevEvent = selectedEvent;
        sortField = "default";
        loadLeaderboard();
    }

    $: if (currentDungeonId !== prevDungeon) {
        prevDungeon = currentDungeonId;
        loadLeaderboard();
    }

    $: if (serverFilter !== prevServer) {
        prevServer = serverFilter;
        loadLeaderboard();
    }

    $: if (teamSizeFilter !== prevTeamSize) {
        prevTeamSize = teamSizeFilter;
        loadLeaderboard();
    }

    onMount(() => {
        loadLeaderboard();
    });

    $: filteredEntries = (() => {
        let list = entries.filter(e => {
            if (serverFilter === "all") return true;
            return String(e.serverId) === serverFilter;
        });

        if (teamSizeFilter !== null) {
            list = list.filter(e => (e.chars?.length || 0) === teamSizeFilter);
        }

        list = [...list];

        if (sortField === "level") {
            list.sort((a, b) => {
                const diff = (a.level || 0) - (b.level || 0);
                return sortAsc ? diff : -diff;
            });
        } else if (sortField === "contractLevel") {
            list.sort((a, b) => {
                const diff = (a.contractLevel || 0) - (b.contractLevel || 0);
                return sortAsc ? diff : -diff;
            });
        } else if (sortField === "time") {
            list.sort((a, b) => {
                const diff = (a.clear_time || 0) - (b.clear_time || 0);
                return sortAsc ? diff : -diff;
            });
        } else {
            if (selectedEvent === "contract") {
                list.sort((a, b) => {
                    if (b.contractLevel !== a.contractLevel) {
                        return b.contractLevel - a.contractLevel;
                    }
                    if (a.clear_time !== b.clear_time) {
                        return a.clear_time - b.clear_time;
                    }
                    return String(a.id || "").localeCompare(String(b.id || ""));
                });
            } else {
                list.sort((a, b) => {
                    if (a.clear_time !== b.clear_time) {
                        return a.clear_time - b.clear_time;
                    }
                    if (b.level !== a.level) {
                        return b.level - a.level;
                    }
                    return String(a.id || "").localeCompare(String(b.id || ""));
                });
            }
        }

        return list;
    })();

    function formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return "0s";
        const m = Math.floor(seconds / 60);
        const s = Math.round(seconds % 60);
        if (m > 0) {
            return `${m}m ${s}s`;
        }
        return `${s}s`;
    }

    function formatRelativeTime(updatedAt) {
        if (!updatedAt) return "";
        const parsed = typeof updatedAt === "number" ? updatedAt : new Date(String(updatedAt).replace(" ", "T")).getTime();
        if (isNaN(parsed)) return "";
        const diff = Date.now() - parsed;
        if (diff < 0) return $t("profile.time_just_now");
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return $t("profile.time_just_now");
        const hours = Math.floor(mins / 60);
        if (hours < 1) return $t("profile.time_mins", { n: mins });
        const days = Math.floor(hours / 24);
        if (days < 1) return $t("profile.time_hours", { n: hours });
        return $t("profile.time_days", { n: days });
    }

    function getServerName(serverId) {
        return serverId === "2" ? "Asia" : "Americas/Europe";
    }

    function getSvelteCharId(char) {
        if (!char) return "";
        const raw = typeof char === "string" ? char : (char.id || char.charId || char.charData?.id || "");
        const found = characters[raw] || Object.values(characters).find(c => c.gameId === raw || c.apiId === raw || c.id === raw);
        return found ? found.id : raw;
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

    function getOperatorName(opData) {
        if (!opData) return "";
        const key = `characters.${opData.id}`;
        const trans = $t(key);
        return trans !== key ? trans : opData.name;
    }

    function getWeaponName(wpnData, charWeapon) {
        if (!wpnData) return charWeapon?.id || "Weapon";
        const key = `weaponsList.${wpnData.id}`;
        const trans = $t(key);
        return trans !== key ? trans : wpnData.name;
    }
</script>

<svelte:head>
    <title>{$t("pages.leaderboard")} - Goyfield</title>
    <meta name="description" content={$t("seo.descriptions.leaderboard")} />
    <meta property="og:title" content={`${$t("pages.leaderboard")} - Goyfield`} />
    <meta property="og:description" content={$t("seo.descriptions.leaderboard")} />
</svelte:head>

<div class="max-w-[1600px] mx-auto w-full pb-10">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6 font-sdk">
        <div class="flex flex-wrap items-center gap-4">
            <h2 class="text-3xl md:text-5xl tracking-wide text-[#21272C] dark:text-[#FDFDFD]">
                {$t("leaderboard.title")}
            </h2>

            <div class="flex bg-gray-100 dark:bg-black/30 p-1 rounded-xl max-w-full overflow-x-auto no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden shrink-0">
                <button
                    type="button"
                    on:click={() => selectedEvent = "monument"}
                    class="px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold font-sdk transition-colors flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 {selectedEvent === 'monument' ? 'bg-[#FFE145] text-gray-900' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:dark:text-gray-300'}"
                >
                    <Icon name="monument" class="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                    {$t("leaderboard.monument")}
                </button>
                <button
                    type="button"
                    on:click={() => selectedEvent = "echoesOfWar"}
                    class="px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold font-sdk transition-colors flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 {selectedEvent === 'echoesOfWar' ? 'bg-[#FFE145] text-gray-900' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:dark:text-gray-300'}"
                >
                    <Icon name="echoesOfWar" class="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                    {$t("leaderboard.echoesOfWar")}
                </button>
            </div>
        </div>

        {#if !$user}
            <div class="bg-white/5 border border-white/10 px-4 py-2 rounded-xl max-w-sm flex items-center gap-3">
                <Icon name="info" class="w-5 h-5 text-[#FFE145] shrink-0" />
                <div class="text-xs text-gray-300 leading-normal">
                    {$t("leaderboard.not_synced_desc")}
                    <a href="/profile" class="text-[#FFE145] hover:underline block font-bold mt-1">
                        {$t("leaderboard.not_synced_btn")} &rarr;
                    </a>
                </div>
            </div>
        {/if}
    </div>

    <div class="flex flex-col lg:flex-row gap-6 items-start">
        <div class="w-full lg:w-[320px] xl:w-[340px] shrink-0 bg-white dark:bg-[#383838] border border-gray-200 dark:border-white/10 rounded-2xl p-5 shadow-sm flex flex-col gap-5">
            {#if selectedEvent === 'monument'}
                <div class="flex flex-col gap-1.5">
                    <span class="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300">
                        {$t("leaderboard.monument_filter")}
                    </span>
                    <Select
                        options={monumentGroupOptions}
                        bind:value={selectedMonumentGroup}
                        iconVariant="monument-icon"
                        className="w-full"
                        variant="gray"
                    />
                </div>
            {:else if selectedEvent === 'echoesOfWar'}
                <div class="flex flex-col gap-1.5">
                    <span class="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300">
                        {$t("events.echoesOfWar")}
                    </span>
                    <Select
                        options={warEchoesSeasonOptions}
                        bind:value={selectedWarEchoesSeason}
                        className="w-full"
                        variant="gray"
                    />
                </div>
            {/if}

            <div class="flex flex-col gap-1.5">
                <span class="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300">
                    {$t("leaderboard.server")}
                </span>
                <Select
                    options={serverOptions}
                    bind:value={serverFilter}
                    className="w-full"
                    variant="gray"
                />
            </div>

            {#if selectedEvent === 'monument'}
                <div class="flex flex-col gap-1.5">
                    <span class="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300">
                        {$t("leaderboard.difficulty")}
                    </span>
                    <div class="flex items-center">
                        <Button
                            variant="round"
                            color={isAgony ? "red" : "gray"}
                            onClick={toggleAgony}
                            className="!h-9 !px-4 text-xs sm:text-sm font-bold shrink-0 select-none"
                        >
                            <div class="flex items-center gap-2">
                                <Icon name="agony" class="w-4 h-4" />
                                <span>{$t("leaderboard.agony")}</span>
                            </div>
                        </Button>
                    </div>
                </div>
            {:else if selectedEvent === 'echoesOfWar'}
                <div class="flex flex-col gap-1.5">
                    <span class="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300">
                        {$t("leaderboard.difficulty")}
                    </span>
                    <div class="flex items-center gap-1.5 bg-gray-100 dark:bg-black/30 p-1 rounded-xl">
                        <button
                            type="button"
                            on:click={() => selectedWarEchoesDifficulty = "normal"}
                            class="flex-1 py-1.5 px-2 rounded-lg text-xs font-bold font-sdk transition-all text-center cursor-pointer {selectedWarEchoesDifficulty === 'normal' ? 'bg-[#FFE145] text-gray-900 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}"
                        >
                            {$t("warEchoesDiff.normal")}
                        </button>
                        <button
                            type="button"
                            on:click={() => selectedWarEchoesDifficulty = "hard"}
                            class="flex-1 py-1.5 px-2 rounded-lg text-xs font-bold font-sdk transition-all text-center cursor-pointer {selectedWarEchoesDifficulty === 'hard' ? 'bg-[#FFE145] text-gray-900 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}"
                        >
                            {$t("warEchoesDiff.hard")}
                        </button>
                        <button
                            type="button"
                            on:click={() => selectedWarEchoesDifficulty = "brutal"}
                            class="flex-1 py-1.5 px-2 rounded-lg text-xs font-bold font-sdk transition-all text-center cursor-pointer {selectedWarEchoesDifficulty === 'brutal' ? 'bg-[#FFE145] text-gray-900 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}"
                        >
                            {$t("warEchoesDiff.brutal")}
                        </button>
                    </div>
                </div>
            {/if}

            {#if selectedEvent === 'monument' && currentGroup?.stages?.length}
                <div class="flex flex-col gap-1.5">
                    <span class="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300">
                        {$t("leaderboard.room")}
                    </span>
                    <div class="flex flex-wrap gap-2">
                        {#each currentGroup.stages as stage}
                            <button
                                type="button"
                                on:click={() => selectedStageId = stage.id}
                                class="px-3 py-1.5 rounded-xl text-xs font-bold font-sdk transition-all cursor-pointer border {selectedStageId === stage.id
                                    ? 'bg-[#FFE145] border-[#FFE145] text-gray-900 shadow-sm'
                                    : 'bg-white dark:bg-[#383838] border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-white/20'}"
                            >
                                {$t(`monumentStages.${stage.id}`)}
                            </button>
                        {/each}
                    </div>
                </div>
            {:else if selectedEvent === 'echoesOfWar' && currentSeason?.weeks?.length}
                <div class="flex flex-col gap-1.5">
                    <span class="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300">
                        {$t(`warEchoesSeasons.${selectedWarEchoesSeason}`)}
                    </span>
                    <div class="flex flex-wrap gap-2">
                        {#each currentSeason.weeks as week}
                            <button
                                type="button"
                                on:click={() => selectedWarEchoesCycle = week.id}
                                class="px-3 py-1.5 rounded-xl text-xs font-bold font-sdk transition-all cursor-pointer border {selectedWarEchoesCycle === week.id
                                    ? 'bg-[#FFE145] border-[#FFE145] text-gray-900 shadow-sm'
                                    : 'bg-white dark:bg-[#383838] border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-white/20'}"
                            >
                                {$t(`warEchoesCycles.${selectedWarEchoesSeason}_${week.id}`)}
                            </button>
                        {/each}
                    </div>
                </div>

                {#if currentCycle?.stages?.length}
                    <div class="flex flex-col gap-1.5">
                        <span class="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300">
                            {$t("leaderboard.room")}
                        </span>
                        <div class="flex flex-wrap gap-2">
                            {#each currentCycle.stages as stage}
                                <button
                                    type="button"
                                    on:click={() => selectedWarEchoesStageId = stage.id}
                                    class="px-3 py-1.5 rounded-xl text-xs font-bold font-sdk transition-all cursor-pointer border {selectedWarEchoesStageId === stage.id
                                        ? 'bg-[#FFE145] border-[#FFE145] text-gray-900 shadow-sm'
                                        : 'bg-white dark:bg-[#383838] border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-white/20'}"
                                >
                                    {dungeonLocales[stage.id]?.name ? dungeonLocales[stage.id].name.replace(/:\s*(Normal|Hard|Brutal|обычная|сложная|жестокая).*$/i, '').trim() : stage.name}
                                </button>
                            {/each}
                        </div>
                    </div>
                {/if}
            {/if}

            <div class="flex flex-col gap-1.5">
                <span class="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300">
                    {$t("leaderboard.operators_in_team")}
                </span>
                <div class="flex items-center gap-2">
                    {#each [1, 2, 3, 4] as size}
                        <button
                            type="button"
                            on:click={() => teamSizeFilter = teamSizeFilter === size ? null : size}
                            class="w-8 h-8 rounded-xl font-bold text-xs sm:text-sm font-nums transition-colors flex items-center justify-center border {teamSizeFilter === size
                                ? 'bg-[#FFE145] border-[#FFE145] text-gray-900 shadow-sm'
                                : 'bg-white dark:bg-[#383838] border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-white/20'}"
                        >
                            {size}
                        </button>
                    {/each}
                </div>
            </div>
        </div>

        <div class="flex-1 min-w-0 w-full flex flex-col gap-4">
            {#if selectedEvent === 'monument' && currentStage}
                <div class="relative bg-[#262626] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm min-h-[220px]">
                    {#if currentCoverPath}
                        <div class="absolute right-0 top-0 bottom-0 w-full sm:w-3/4 md:w-3/5 lg:w-1/2 pointer-events-none overflow-hidden">
                            <img
                                src={`/images/umbralMonument/cover/${currentCoverPath}.png`}
                                alt={currentStage.name}
                                class="w-full h-full object-cover scale-120 translate-x-8"
                                on:error={(e) => {
                                    if (!e.currentTarget.src.includes('dung_high_difficulty_s6_01')) {
                                        e.currentTarget.src = '/images/umbralMonument/cover/dung_high_difficulty_s6_01.png';
                                    }
                                }}
                            />
                            <div class="absolute inset-0 bg-gradient-to-r from-[#262626] via-[#262626]/20 to-transparent"></div>
                            <div class="absolute inset-0 bg-gradient-to-t from-[#262626]/30 via-transparent to-transparent"></div>
                        </div>
                    {/if}

                    <div class="relative z-10 p-5 sm:p-6 flex flex-col md:flex-row justify-between gap-6">
                        <div class="max-w-xl flex flex-col gap-2">
                            <h3 class="text-lg sm:text-xl font-bold text-white font-sdk tracking-wide">
                                {currentDungeonLocale.name || $t(`monumentStages.${selectedStageId}`)}
                            </h3>

                            {#if currentDungeonLocale.featureDesc}
                                <div class="text-xs sm:text-sm text-gray-300 whitespace-pre-line leading-relaxed font-sans">
                                    {@html parseRichText(currentDungeonLocale.featureDesc)}
                                </div>
                            {/if}
                        </div>

                        <div class="flex flex-col justify-between items-start md:items-end gap-4 min-w-0 md:max-w-md">
                            {#if currentDungeonLocale.description}
                                <p class="text-xs sm:text-sm text-gray-300 italic text-left md:text-right font-sans leading-snug">
                                    {currentDungeonLocale.description}
                                </p>
                            {/if}

                            {#if currentEnemies.length > 0}
                                <div class="flex flex-wrap items-center gap-2.5 mt-auto pt-2">
                                    {#each currentEnemies as enemy}
                                        <WeaponCard
                                            weapon={enemy}
                                            isEnemy={true}
                                            variant="small"
                                            isStatic={true}
                                            hidePot={true}
                                            hideDarkness={true}
                                            className="w-[72px] h-[72px] sm:w-[80px] sm:h-[80px]"
                                        />
                                    {/each}
                                </div>
                            {/if}
                        </div>
                    </div>
                </div>
            {:else if selectedEvent === 'echoesOfWar' && currentWarEchoesStage}
                <div class="relative bg-[#262626] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm min-h-[220px]">
                    <div class="relative z-10 p-5 sm:p-6 flex flex-col md:flex-row justify-between gap-6">
                        <div class="max-w-xl flex flex-col gap-2">
                            <h3 class="text-lg sm:text-xl font-bold text-white font-sdk tracking-wide">
                                {currentDungeonLocale.name || currentWarEchoesStage.name}
                            </h3>

                            {#if currentDungeonLocale.featureDesc}
                                <div class="text-xs sm:text-sm text-gray-300 whitespace-pre-line leading-relaxed font-sans">
                                    {@html parseRichText(currentDungeonLocale.featureDesc)}
                                </div>
                            {/if}
                        </div>

                        <div class="flex flex-col justify-between items-start md:items-end gap-4 min-w-0 md:max-w-md">
                            {#if currentDungeonLocale.description}
                                <p class="text-xs sm:text-sm text-gray-300 italic text-left md:text-right font-sans leading-snug">
                                    {currentDungeonLocale.description}
                                </p>
                            {/if}

                            {#if currentEnemies.length > 0}
                                <div class="flex flex-wrap items-center gap-2.5 mt-auto pt-2">
                                    {#each currentEnemies as enemy}
                                        <WeaponCard
                                            weapon={enemy}
                                            isEnemy={true}
                                            variant="small"
                                            isStatic={true}
                                            hidePot={true}
                                            hideDarkness={true}
                                            className="w-[72px] h-[72px] sm:w-[80px] sm:h-[80px]"
                                        />
                                    {/each}
                                </div>
                            {/if}
                        </div>
                    </div>
                </div>
            {/if}

            {#if loading}
                <div class="flex items-center justify-center min-h-[40vh]">
                    <Icon name="loading" class="w-10 h-10 text-[#FFE145] animate-spin" />
                </div>
            {:else if filteredEntries.length === 0}
                <div class="text-center py-20 text-gray-400 italic flex flex-col items-center justify-center bg-gray-50 dark:bg-[#2C2C2C] rounded-2xl border border-dashed border-gray-200 dark:border-[#444]">
                    <Icon name="noData" class="w-10 h-10 mb-3 opacity-30" />
                    <p class="text-sm font-medium">
                        {$t("leaderboard.no_entries")}
                    </p>
                </div>
            {:else}
                <div class="bg-white dark:bg-[#383838] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm" in:fade>
                    <div class="hidden md:block overflow-x-auto">
                        <table class="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr class="border-b border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-[#FDFDFD] text-xs">
                                    <th class="py-3 px-5 w-20">{$t("leaderboard.rank")}</th>
                                    <th class="py-3 px-3 min-w-[200px]">{$t("leaderboard.operator")}</th>
                                    <th 
                                        class="py-3 px-3 w-24 cursor-pointer select-none hover:bg-white/5 transition-colors group"
                                        on:click={() => handleSort('level')}
                                    >
                                        <div class="flex items-center gap-1.5">
                                            <span>{$t("leaderboard.level")}</span>
                                            {#if sortField === 'level'}
                                                <Icon name="arrowDown" class="w-3 h-3 text-[#FFE145] transition-transform duration-200 shrink-0 {!sortAsc ? '' : 'rotate-180'}" />
                                            {/if}
                                        </div>
                                    </th>
                                    {#if selectedEvent === 'contract'}
                                        <th 
                                            class="py-3 px-3 w-32 cursor-pointer select-none hover:bg-white/5 transition-colors group"
                                            on:click={() => handleSort('contractLevel')}
                                        >
                                            <div class="flex items-center gap-1.5">
                                                <span>{$t("leaderboard.contract_level")}</span>
                                                {#if sortField === 'contractLevel'}
                                                    <Icon name="arrowDown" class="w-3 h-3 text-[#FFE145] transition-transform duration-200 shrink-0 {!sortAsc ? '' : 'rotate-180'}" />
                                                {/if}
                                            </div>
                                        </th>
                                    {/if}
                                    <th 
                                        class="py-3 px-3 w-32 cursor-pointer select-none hover:bg-white/5 transition-colors group"
                                        on:click={() => handleSort('time')}
                                    >
                                        <div class="flex items-center gap-1.5">
                                            <span>{$t("leaderboard.time")}</span>
                                            {#if sortField === 'time'}
                                                <Icon name="arrowDown" class="w-3 h-3 text-[#FFE145] transition-transform duration-200 shrink-0 {sortAsc ? 'rotate-180' : ''}" />
                                            {:else if sortField === 'default'}
                                                <Icon name="arrowDown" class="w-3 h-3 text-[#FFE145] transition-transform duration-200 shrink-0 rotate-180" />
                                            {/if}
                                        </div>
                                    </th>
                                    <th class="py-3 px-3 w-44">{$t("leaderboard.last_update")}</th>
                                    <th class="py-3 px-3">{$t("leaderboard.team")}</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-white/5">
                                {#each filteredEntries as entry, index}
                                    <tr
                                        on:click={() => selectEntry(entry)}
                                        class="hover:bg-white/5 transition-colors cursor-pointer"
                                    >
                                        <td class="py-2.5 px-5">
                                            {#if index === 0}
                                                <span class="w-7 h-7 rounded-full bg-[#FFE145] text-gray-900 font-black flex items-center justify-center border-2 border-white/10 text-xs" title="1st Place">
                                                    1
                                                </span>
                                            {:else if index === 1}
                                                <span class="w-7 h-7 rounded-full bg-[#C0C0C0] text-gray-900 font-black flex items-center justify-center border-2 border-white/10 text-xs" title="2nd Place">
                                                    2
                                                </span>
                                            {:else if index === 2}
                                                <span class="w-7 h-7 rounded-full bg-[#CD7F32] text-white font-black flex items-center justify-center border-2 border-white/10 text-xs" title="3rd Place">
                                                    3
                                                </span>
                                            {:else}
                                                <span class="text-gray-600 dark:text-gray-400 font-bold pl-2">{index + 1}</span>
                                            {/if}
                                        </td>

                                        <td class="py-2.5 px-3">
                                            <div class="flex items-center gap-2.5 whitespace-nowrap shrink-0 w-fit">
                                                <div class="flex items-center gap-2.5 group/user shrink-0">
                                                    {#if entry.user.picture && entry.user.avatar_strike === 0}
                                                        <a href="/u/{entry.user.name}" class="shrink-0" on:click|stopPropagation>
                                                            <img
                                                                src={getAvatarUrl(entry.user.picture)}
                                                                alt={entry.user.name}
                                                                class="w-9 h-9 rounded-md object-cover border border-white/10 shrink-0 group-hover/user:opacity-85 transition-opacity"
                                                            />
                                                        </a>
                                                    {:else}
                                                        <a href="/u/{entry.user.name}" class="shrink-0" on:click|stopPropagation>
                                                            <div class="w-9 h-9 rounded-md bg-gray-200 border-gray-300 dark:bg-white/10 border dark:border-white/20 flex items-center justify-center text-gray-500 dark:text-white/70 font-bold text-xs shrink-0 select-none group-hover/user:bg-white/20 transition-colors">
                                                                {entry.user.name ? entry.user.name[0].toUpperCase() : "?"}
                                                            </div>
                                                        </a>
                                                    {/if}
                                                    <div class="flex items-center gap-1 shrink-0">
                                                        <a href="/u/{entry.user.name}" class="group font-bold text-gray-600 dark:text-white group-hover/user:text-[#FFE145] group-hover/user:dark:text-[#FFE145] transition-colors inline-flex items-center gap-1 shrink-0" on:click|stopPropagation>
                                                            <span>{entry.user.name}</span>
                                                            <Icon name="sendToLink" class="w-3 h-3 text-gray-600 dark:text-white group-hover/user:text-[#FFE145] group-hover/user:dark:text-[#FFE145] group-hover:text-[#FFE145] group-hover:dark:text-[#FFE145] transition-transform duration-200 shrink-0" />
                                                        </a>
                                                    </div>
                                                </div>
                                                {#if serverFilter === 'all'}
                                                    <span class="bg-gray-200 text-gray-600 dark:bg-[#303030] dark:text-[#B0B0B0] px-1.5 py-0.5 rounded text-[9px] font-medium font-sans select-none shrink-0">
                                                        {getServerName(entry.serverId)}
                                                    </span>
                                                {/if}
                                            </div>
                                        </td>

                                        <td class="py-2.5 px-3 text-gray-600 dark:text-gray-300">
                                            {entry.level}
                                        </td>

                                        {#if selectedEvent === 'contract'}
                                            <td class="py-2.5 px-3">
                                                <ContractLevelTag className="max-w-[80px]" level={entry.contractLevel || 0} />
                                            </td>
                                        {/if}

                                        <td class="py-2.5 px-3 font-bold text-[#e8cc3c] dark:text-[#FFE145]">
                                            {formatTime(entry.clear_time)}
                                        </td>

                                        <td class="py-2.5 px-3 text-gray-600 dark:text-gray-300">
                                            {formatRelativeTime(entry.updatedAt)}
                                        </td>

                                        <td class="py-2.5 px-3">
                                            <div class="flex items-center gap-1.5">
                                                {#each (entry.chars || []).slice(0, 4) as char}
                                                    {@const opData = getOperatorData(char)}
                                                    {@const wpnData = getWeaponData(char.weapon)}
                                                    {@const wpnRarity = wpnData?.rarity || char.weapon?.rarity || 4}
                                                    <Tooltip text={`${getOperatorName(opData)} (LV. ${char.level || 1})${char.weapon ? ` • ${getWeaponName(wpnData, char.weapon)}` : ''}`}>
                                                        <div class="relative">
                                                            <img
                                                                src={opData.id.startsWith('http') ? opData.id : `/images/operators/icons/${opData.id}.png`}
                                                                alt={opData.name}
                                                                class="w-9 h-9 rounded bg-white/10 border border-gray-200 dark:border-white/10 object-cover shrink-0 cursor-pointer"
                                                                on:error={(e) => e.target.src = '/images/operators/icons/endministrator1.png'}
                                                            />
                                                            {#if char.weapon}
                                                                <img
                                                                    src={`/images/weapons/${wpnData?.id || char.weapon.id}.png`}
                                                                    alt={wpnData?.name || ''}
                                                                    class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border bg-black object-contain pointer-events-none"
                                                                    style="border-color: {getRarityColor(wpnRarity)}80;"
                                                                    on:error={(e) => e.target.style.display = 'none'}
                                                                />
                                                            {/if}
                                                        </div>
                                                    </Tooltip>
                                                {/each}
                                            </div>
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>

                    <div class="block md:hidden divide-y divide-gray-200 dark:divide-white/10">
                        {#each filteredEntries as entry, index}
                            <div 
                                on:click={() => selectEntry(entry)}
                                on:keydown={(e) => e.key === 'Enter' && selectEntry(entry)}
                                role="button"
                                tabindex="0"
                                class="p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer flex flex-col gap-1.5"
                            >
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-3">
                                        {#if index === 0}
                                            <span class="w-6 h-6 rounded-full bg-[#FFE145] text-gray-900 font-black flex items-center justify-center text-xs" title="1st Place">
                                                1
                                            </span>
                                        {:else if index === 1}
                                            <span class="w-6 h-6 rounded-full bg-[#C0C0C0] text-gray-900 font-black flex items-center justify-center text-xs" title="2nd Place">
                                                2
                                            </span>
                                        {:else if index === 2}
                                            <span class="w-6 h-6 rounded-full bg-[#CD7F32] text-white font-black flex items-center justify-center text-xs" title="3rd Place">
                                                3
                                            </span>
                                        {:else}
                                            <span class="text-gray-500 dark:text-gray-400 font-bold text-sm w-6 text-center">{index + 1}</span>
                                        {/if}

                                        <div class="flex items-center gap-2">
                                            {#if entry.user.picture && entry.user.avatar_strike === 0}
                                                <img
                                                    src={getAvatarUrl(entry.user.picture)}
                                                    alt={entry.user.name}
                                                    class="w-8 h-8 rounded object-cover border border-gray-200 dark:border-white/10"
                                                />
                                            {:else}
                                                <div class="w-8 h-8 rounded bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 flex items-center justify-center text-gray-700 dark:text-white/70 font-bold text-xs select-none">
                                                    {entry.user.name ? entry.user.name[0].toUpperCase() : "?"}
                                                </div>
                                            {/if}
                                            <div class="flex flex-col">
                                                <span class="font-bold text-gray-900 dark:text-white text-sm">{entry.user.name}</span>
                                                <span class="text-[10px] text-gray-500 dark:text-gray-400">
                                                    Lvl {entry.level}{#if serverFilter === 'all'} &bull; {getServerName(entry.serverId)}{/if}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="flex flex-col items-end gap-1">
                                        <span class="text-amber-600 dark:text-[#FFE145] font-black text-sm">
                                            {formatTime(entry.clear_time)}
                                        </span>
                                        {#if selectedEvent === 'contract'}
                                            <ContractLevelTag className="scale-90 origin-right" level={entry.contractLevel || 0} />
                                        {/if}
                                    </div>
                                </div>

                                <div class="flex items-center justify-between mt-1">
                                    <div class="flex items-center gap-1.5">
                                        {#each (entry.chars || []).slice(0, 4) as char}
                                            {@const opData = getOperatorData(char)}
                                            <div class="relative">
                                                <img
                                                    src={opData.id.startsWith('http') ? opData.id : `/images/operators/icons/${opData.id}.png`}
                                                    alt={opData.name}
                                                    class="w-9 h-9 rounded bg-white/10 border border-gray-200 dark:border-white/10 object-cover"
                                                    on:error={(e) => e.target.src = '/images/operators/icons/endministrator1.png'}
                                                />
                                                {#if char.weapon}
                                                    {@const wpnData = getWeaponData(char.weapon)}
                                                    {@const wpnRarity = wpnData?.rarity || char.weapon.rarity || 4}
                                                    <img
                                                        src={`/images/weapons/${wpnData?.id || char.weapon.id}.png`}
                                                        alt={wpnData?.name || ''}
                                                        class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border bg-black object-contain pointer-events-none"
                                                        style="border-color: {getRarityColor(wpnRarity)}80;"
                                                        on:error={(e) => e.target.style.display = 'none'}
                                                    />
                                                {/if}
                                            </div>
                                        {/each}
                                    </div>

                                    <span class="text-[10px] text-gray-500 dark:text-gray-400">
                                        {formatRelativeTime(entry.updatedAt)}
                                    </span>
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>
            {/if}
        </div>
    </div>

    <Modal isOpen={!!selectedEntry} on:close={() => selectEntry(null)}>
        {#if selectedEntry}
            <div class="bg-white dark:bg-[#383838] border border-gray-200 dark:border-[#444444] rounded-2xl p-6 md:p-8 w-full max-w-lg shadow-2xl relative cursor-auto" transition:fly={{ y: 50 }}>
                <button
                    on:click={() => selectEntry(null)}
                    class="absolute top-4 right-4 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    <Icon name="close" class="w-6 h-6" />
                </button>

                <div class="border-b border-gray-200 dark:border-white/10 pb-3 mb-3">
                    <a href="/u/{selectedEntry.user.name}" class="inline-flex items-center gap-4 group">
                        {#if selectedEntry.user.picture && selectedEntry.user.avatar_strike === 0}
                            <img
                                src={getAvatarUrl(selectedEntry.user.picture)}
                                alt={selectedEntry.user.name}
                                class="w-14 h-14 rounded-xl object-cover border border-gray-200 dark:border-white/10 group-hover:opacity-85 transition-opacity"
                            />
                        {:else}
                            <div class="w-14 h-14 rounded-xl bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 flex items-center justify-center text-gray-700 dark:text-white/70 font-bold text-lg select-none group-hover:bg-gray-200 group-hover:dark:bg-white/20 transition-colors">
                                {selectedEntry.user.name ? selectedEntry.user.name[0].toUpperCase() : "?"}
                            </div>
                        {/if}
                        <div>
                            <h4 class="text-xl font-bold text-gray-900 dark:text-white font-sdk group-hover:text-[#d9a009] group-hover:dark:text-[#FFE145] transition-colors inline-flex items-center gap-1">
                                <span>{selectedEntry.user.name}</span>
                                <Icon name="sendToLink" class="w-4 h-4 text-gray-400 group-hover:text-[#d9a009] group-hover:dark:text-[#FFE145] transition-colors shrink-0" />
                            </h4>
                            <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Level {selectedEntry.level} &bull; {getServerName(selectedEntry.serverId)}
                            </div>
                        </div>
                    </a>
                </div>

                {#if runDetailsLoading}
                    <div class="flex flex-col items-center justify-center py-12 gap-3">
                        <Icon name="loading" class="w-8 h-8 text-[#d9a009] dark:text-[#FFE145] animate-spin" />
                        <span class="text-xs text-gray-500 dark:text-gray-400">{$t("leaderboard.loading_details")}</span>
                    </div>
                {:else if selectedRunDetails}
                    {#if selectedEvent === 'contract'}
                        <CrisisContract
                            contract={selectedRunDetails}
                            chars={selectedRunDetails.chars || selectedEntry.chars}
                            hideHeader={true}
                            hasBackground={false}
                            transparent={true}
                            charHrefGenerator={(char) => {
                                const op = getOperatorData(char);
                                return (selectedEntry && op) ? `/u/${selectedEntry.user.name}?char=${op.id}${selectedEntry.serverId ? `&server=${selectedEntry.serverId}` : ''}` : null;
                            }}
                        />
                    {:else}
                        <div class="flex flex-col gap-1.5 mb-3 pb-3 border-b border-gray-200 dark:border-white/10">
                            <div class="text-sm font-medium dark:text-gray-400 text-gray-600">
                                {$t("leaderboard.stage")}:
                                <span class="text-gray-900 dark:text-white font-bold font-sdk ml-1">
                                    {selectedEvent === 'monument' ? getDungeonName(selectedRunDetails?.dungeonId || currentDungeonId) : $t(`leaderboard.${selectedEvent}`)}
                                </span>
                            </div>
                            <div class="text-sm font-medium dark:text-gray-400 text-gray-600">
                                {$t("profile.clear_time_label")} 
                                <span class="dark:text-white text-gray-900 font-bold text-lg ml-1 font-nums">
                                    {$t("leaderboard.sec", { time: selectedRunDetails?.passTs !== undefined ? selectedRunDetails.passTs : selectedEntry.clear_time })}
                                </span>
                            </div>
                        </div>

                        <h5 class="text-sm text-gray-500 dark:text-gray-400 font-black mb-3">
                            {$t("leaderboard.team")}
                        </h5>
                        
                        {@const teamChars = (() => {
                            const list = [...(selectedRunDetails.chars || selectedEntry.chars || []).slice(0, 4)];
                            while (list.length < 4) {
                                list.push(null);
                            }
                            return list;
                        })()}
                        <div class="grid grid-cols-2 justify-items-center min-[450px]:flex min-[450px]:flex-row min-[450px]:justify-center gap-2 sm:gap-3 max-w-max mx-auto">
                            {#each teamChars as char}
                                {@const op = char ? getOperatorData(char) : null}
                                {@const charHref = (selectedEntry && op) ? `/u/${selectedEntry.user.name}?char=${op.id}${selectedEntry.serverId ? `&server=${selectedEntry.serverId}` : ''}` : null}
                                <MiniOperatorCard {char} {getOperatorData} href={charHref} />
                            {/each}
                        </div>
                    {/if}
                {:else}
                    <div class="text-center py-10 text-gray-500 dark:text-gray-400 flex flex-col items-center justify-center gap-2">
                        <Icon name="noData" class="w-8 h-8 opacity-40" />
                        <span class="text-sm font-medium">{$t("emptyState.noData")}</span>
                    </div>
                {/if}
            </div>
        {/if}
    </Modal>
</div>

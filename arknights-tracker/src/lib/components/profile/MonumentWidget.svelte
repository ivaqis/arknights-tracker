<script>
    import { browser } from "$app/environment";
    import { t } from "$lib/i18n";
    import Icon from "$lib/components/Icon.svelte";
    import Button from "$lib/components/Button.svelte";
    import Select from "$lib/components/Select.svelte";
    import DungeonRunCard from "$lib/components/profile/DungeonRunCard.svelte";
    import { monumentGroups } from "$lib/data/monuments.js";
    import { isEventStarted } from "$lib/utils/dateUtils";

    export let activeAccount = null;
    export let hasBackground = false;

    const now = new Date();

    $: serverId = activeAccount?.serverId || activeAccount?.info?.base?.serverId || 'all';
    $: visibleMonumentGroups = monumentGroups.filter(g => isEventStarted(g, serverId, now));

    let selectedMonumentGroup = (browser && typeof localStorage !== "undefined" && localStorage.getItem("profile_monument_group"))
        || (monumentGroups[0]?.id || "");
    let isAgony = false;

    if (browser && typeof localStorage !== "undefined") {
        isAgony = localStorage.getItem("profile_monument_is_agony") === "true";
    }

    $: if (visibleMonumentGroups.length > 0 && (!selectedMonumentGroup || !visibleMonumentGroups.some(g => g.id === selectedMonumentGroup))) {
        selectedMonumentGroup = visibleMonumentGroups[0].id;
    }

    function toggleAgony() {
        isAgony = !isAgony;
        if (browser && typeof localStorage !== "undefined") {
            localStorage.setItem("profile_monument_is_agony", isAgony.toString());
        }
    }

    function handleGroupChange(val) {
        selectedMonumentGroup = val;
        if (browser && typeof localStorage !== "undefined") {
            localStorage.setItem("profile_monument_group", val);
        }
    }

    $: if (selectedMonumentGroup && browser && typeof localStorage !== "undefined") {
        localStorage.setItem("profile_monument_group", selectedMonumentGroup);
    }

    $: monumentGroupOptions = visibleMonumentGroups.map(group => ({
        value: group.id,
        label: $t(`monument.${group.id}`),
        iconId: group.id
    }));

    $: currentGroup = visibleMonumentGroups.find(g => g.id === selectedMonumentGroup) || visibleMonumentGroups[0] || monumentGroups[0];

    $: userRuns = activeAccount?.info?.monument || activeAccount?.monument || [];
    $: accountChars = activeAccount?.info?.chars || activeAccount?.chars || [];
</script>

<div class="{!hasBackground ? 'bg-white dark:bg-[#383838] border border-gray-200 dark:border-white/10' : 'bg-white/15 border dark:bg-[#383838]/5 dark:border-[#444444]/20 border-white/20'} rounded-2xl p-5 flex flex-col w-full backdrop-blur-[7px] shadow-sm min-w-0">
    <h2 class="text-2xl font-bold text-[#21272C] dark:text-white font-sdk">
        {$t("leaderboard.monument")}
    </h2>

    <div class="flex flex-wrap items-center justify-between gap-3 mt-4 mb-4">
        <Select
            options={monumentGroupOptions}
            bind:value={selectedMonumentGroup}
            onChange={handleGroupChange}
            iconVariant="monument-icon"
            className="w-full sm:w-64"
            variant="gray"
        />
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

    <div class="flex flex-col gap-2.5">
        {#if currentGroup?.stages?.length}
            {#each currentGroup.stages as stage, i}
                {@const targetId = isAgony ? (stage.hardId || `${stage.id}_s`) : stage.id}
                {@const stageRun = userRuns.find(r => r.dungeonId === targetId || (r.isHard === isAgony && (r.dungeonId === stage.id || r.dungeonId === stage.hardId)))}
                <DungeonRunCard
                    index={i + 1}
                    title={$t(`monumentStages.${stage.id}`)}
                    run={stageRun}
                    {hasBackground}
                    leaderboardUrl={`/leaderboard?event=monument&group=${currentGroup.id}&stage=${stage.id}&agony=${isAgony}`}
                />
            {/each}
        {:else}
            <div class="text-center py-8 text-gray-400 italic text-sm">
                {$t("leaderboard.no_entries")}
            </div>
        {/if}
    </div>
</div>

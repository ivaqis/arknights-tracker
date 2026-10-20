<script>
    import { browser } from "$app/environment";
    import { t } from "$lib/i18n";
    import Select from "$lib/components/Select.svelte";
    import DungeonRunCard from "$lib/components/profile/DungeonRunCard.svelte";
    import { warEchoesSeasons } from "$lib/data/warEchoes.js";

    export let activeAccount = null;
    export let hasBackground = false;

    const now = new Date();

    function parseWithServerOffset(dateStr, serverId = "3") {
        if (!dateStr) return new Date(0);
        if (dateStr.includes("Z") || (dateStr.includes("T") && dateStr.includes("+"))) {
            return new Date(dateStr);
        }
        const offset = serverId === "2" ? 8 : -5;
        const sign = offset >= 0 ? "+" : "-";
        const pad = (n) => String(Math.abs(n)).padStart(2, "0");
        const iso = dateStr.replace(" ", "T") + `${sign}${pad(offset)}:00`;
        return new Date(iso);
    }

    function isEventStarted(item, serverId = "all") {
        if (!item) return true;
        if (serverId === '2') {
            const str = item.startTimeAsia || item.startTime;
            if (!str) return true;
            return now >= parseWithServerOffset(str, '2');
        }
        if (serverId === '3') {
            const str = item.startTime;
            if (!str) return true;
            return now >= parseWithServerOffset(str, '3');
        }
        const westStr = item.startTime;
        const asiaStr = item.startTimeAsia || item.startTime;
        const westDate = westStr ? parseWithServerOffset(westStr, '3') : null;
        const asiaDate = asiaStr ? parseWithServerOffset(asiaStr, '2') : null;
        if (!westDate && !asiaDate) return true;
        if (westDate && asiaDate) {
            return now >= westDate || now >= asiaDate;
        }
        return now >= (westDate || asiaDate);
    }

    $: serverId = activeAccount?.serverId || activeAccount?.info?.base?.serverId || 'all';
    $: visibleWarEchoesSeasons = warEchoesSeasons.filter(s => isEventStarted(s, serverId));

    let selectedWarEchoesSeason = "";

    if (browser && typeof localStorage !== "undefined") {
        const savedSeason = localStorage.getItem("profile_warechoes_season");
        if (savedSeason) {
            selectedWarEchoesSeason = savedSeason;
        }
    }

    $: if (visibleWarEchoesSeasons.length > 0 && (!selectedWarEchoesSeason || !visibleWarEchoesSeasons.some(s => s.id === selectedWarEchoesSeason))) {
        selectedWarEchoesSeason = visibleWarEchoesSeasons[0].id;
    }

    function formatSeasonDates(season) {
        if (!season?.startTime || !season?.endTime) return "";
        const start = season.startTime.split(" ")[0].split("-").reverse().join(".");
        const end = season.endTime.split(" ")[0].split("-").reverse().join(".");
        return `${start} - ${end}`;
    }

    function handleSeasonChange(val) {
        selectedWarEchoesSeason = val;
        if (browser && typeof localStorage !== "undefined") {
            localStorage.setItem("profile_warechoes_season", val);
        }
    }

    $: if (selectedWarEchoesSeason && browser && typeof localStorage !== "undefined") {
        localStorage.setItem("profile_warechoes_season", selectedWarEchoesSeason);
    }

    $: warEchoesSeasonOptions = visibleWarEchoesSeasons.map(season => ({
        value: season.id,
        label: $t(`warEchoesSeasons.${season.id}`),
        subLabel: formatSeasonDates(season)
    }));

    $: currentSeason = visibleWarEchoesSeasons.find(s => s.id === selectedWarEchoesSeason) || visibleWarEchoesSeasons[0];

    $: userRuns = activeAccount?.info?.warEchoes || activeAccount?.warEchoes || [];
    $: accountChars = activeAccount?.info?.chars || activeAccount?.chars || [];

    function findWarEchoesRun(dungeonId, difficulty, weekId) {
        const fullGroupId = `s${selectedWarEchoesSeason}_w${weekId}`;
        return userRuns.find(r =>
            (r.dungeonId === dungeonId || (r.difficulty === difficulty && r.dungeonId && r.dungeonId.startsWith(dungeonId.replace(/(_s|_ex)$/, '')))) &&
            (!r.groupId || r.groupId === fullGroupId || r.groupId === weekId)
        );
    }

    function getWarEchoesStars(normalRun, hardRun, brutalRun) {
        if (brutalRun) {
            return ['yellow', 'yellow', 'yellow'];
        }
        if (hardRun) {
            return ['white', 'white', 'empty'];
        }
        if (normalRun) {
            return ['white', 'empty', 'empty'];
        }
        return ['empty', 'empty', 'empty'];
    }

    function cleanStageName(name) {
        if (!name) return "";
        return name.replace(/[:—\-\u00a0·]+\s*(Normal|Hard|Brutal|обычная|сложная|жестокая|обычный|сложный|жестокий|普通|困难|残酷|困難|殘酷).*$/i, '').trim();
    }
</script>

<div class="{!hasBackground ? 'bg-white dark:bg-[#383838] border border-gray-200 dark:border-white/10' : 'bg-white/15 border dark:bg-[#383838]/5 dark:border-[#444444]/20 border-white/20'} rounded-2xl p-5 flex flex-col w-full backdrop-blur-[6px] shadow-sm min-w-0">
    <h2 class="text-2xl font-bold text-[#21272C] dark:text-white font-sdk">
        {$t("leaderboard.echoesOfWar")}
    </h2>

    <div class="mt-4 mb-4 w-full sm:w-64">
        <Select
            options={warEchoesSeasonOptions}
            bind:value={selectedWarEchoesSeason}
            onChange={handleSeasonChange}
            className="w-full"
            variant="gray"
        />
    </div>

    <div class="flex flex-col gap-6">
        {#if currentSeason?.weeks?.length}
            {#each currentSeason.weeks as week}
                <div class="flex flex-col gap-2.5">
                    <span class="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 font-sdk">
                        {$t(`warEchoesCycles.${selectedWarEchoesSeason}_${week.id}`)}
                    </span>

                    <div class="flex flex-col gap-2.5">
                        {#each (week.stages || []) as stage, i}
                            {@const normalRun = findWarEchoesRun(stage.id, 'normal', week.id)}
                            {@const hardRun = findWarEchoesRun(stage.hardId, 'hard', week.id)}
                            {@const brutalRun = findWarEchoesRun(stage.brutalId, 'brutal', week.id)}
                            {@const stars = getWarEchoesStars(normalRun, hardRun, brutalRun)}
                            {@const bestRun = brutalRun || hardRun || normalRun}
                            {@const runDiff = brutalRun ? 'brutal' : (hardRun ? 'hard' : (normalRun ? 'normal' : 'brutal'))}
                            <DungeonRunCard
                                index={i + 1}
                                title={cleanStageName($t(`warEchoesStages.${stage.id}`))}
                                run={bestRun}
                                {stars}
                                {hasBackground}
                                leaderboardUrl={`/leaderboard?event=echoesOfWar&season=${selectedWarEchoesSeason}&cycle=${week.id}&stage=${stage.id}&diff=${runDiff}`}
                            />
                        {/each}
                    </div>
                </div>
            {/each}
        {:else}
            <div class="text-center py-8 text-gray-400 italic text-sm">
                {$t("leaderboard.no_entries")}
            </div>
        {/if}
    </div>
</div>

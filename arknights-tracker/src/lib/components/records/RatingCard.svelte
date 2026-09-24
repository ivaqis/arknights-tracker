<script>
    import { browser } from "$app/environment";
    import { fetchRankingRate } from "$lib/api.js";
    import { bannerTypes } from "$lib/data/bannerTypes.js";
    import { t } from "$lib/i18n.js";
    import { accountStore } from "$lib/stores/accounts.js";
    import { currentUiLocale, normalizeLocale } from "$lib/stores/locale.js";
    import { pullData } from "$lib/stores/pulls.js";
    import { getWeaponCategory } from "$lib/utils/importUtils";
    import Button from "../Button.svelte";
    import Icon from "../Icon.svelte";

    export let customGameUid = undefined;
    export let isProfile = false;
    export let hideBorders = false;
    export let activeTab = "total";
    export let showTabs = true;
    export let profileStats = undefined;

    const { accounts, selectedId } = accountStore;

    $: currentAccount = $accounts.find(a => a.id === $selectedId);
    $: gameUid = customGameUid || currentAccount?.serverUid;

    const totalTab = {
        id: "total",
        i18nKey: "page.rating.totalRaiting",
        order: -1
    };

    $: ratingTabs = [
        totalTab,
        ...[...bannerTypes]
            .filter((b) => b.showInRating)
            .sort((a, b) => a.order - b.order)
    ];

    $: currentProfileStat = (() => {
        const statsObj = profileStats || currentAccount?.pulls?.stats || currentAccount?.pulls;
        if (!statsObj) return null;
        if (activeTab === "total") return statsObj.all || statsObj.stats?.all || null;
        return statsObj[activeTab] || statsObj.stats?.[activeTab] || null;
    })();

    $: localStats = (() => {
        if (activeTab === "total") {
            let total = 0;
            let count5 = 0;
            let count6 = 0;
            let sumPity6 = 0;
            let sumPity5 = 0;
            let total5050 = 0;
            let won5050 = 0;

            for (const key of Object.keys($pullData || {})) {
                const store = $pullData[key];
                if (!store) continue;
                const count = store.pulls?.length || 0;
                const st = store.stats || {};
                total += count;
                count5 += (st.count5 || 0);
                count6 += (st.count6 || 0);
                if (st.avg6 && st.count6) {
                    sumPity6 += parseFloat(st.avg6) * st.count6;
                }
                if (st.avg5 && st.count5) {
                    sumPity5 += parseFloat(st.avg5) * st.count5;
                }
                total5050 += (st.winRate?.total || 0);
                won5050 += (st.winRate?.won || 0);
            }

            return {
                total,
                count5,
                count6,
                avg6: count6 > 0 ? (sumPity6 / count6).toFixed(1) : "0.0",
                avg5: count5 > 0 ? (sumPity5 / count5).toFixed(1) : "0.0",
                total5050,
                won5050,
                winRate: total5050 > 0 ? ((won5050 / total5050) * 100).toFixed(1) : "0.0"
            };
        }

        if (activeTab.includes("weap")) {
            let total = 0;
            let count5 = 0;
            let count6 = 0;
            let sumPity6 = 0;
            let sumPity5 = 0;
            let total5050 = 0;
            let won5050 = 0;

            for (const key of Object.keys($pullData || {})) {
                if (getWeaponCategory(key) !== activeTab) continue;
                const store = $pullData[key];
                if (!store) continue;
                const count = store.pulls?.length || 0;
                const st = store.stats || {};
                total += count;
                count5 += (st.count5 || 0);
                count6 += (st.count6 || 0);
                if (st.avg6 && st.count6) {
                    sumPity6 += parseFloat(st.avg6) * st.count6;
                }
                if (st.avg5 && st.count5) {
                    sumPity5 += parseFloat(st.avg5) * st.count5;
                }
                total5050 += (st.winRate?.total || 0);
                won5050 += (st.winRate?.won || 0);
            }

            return {
                total,
                count5,
                count6,
                avg6: count6 > 0 ? (sumPity6 / count6).toFixed(1) : "0.0",
                avg5: count5 > 0 ? (sumPity5 / count5).toFixed(1) : "0.0",
                total5050,
                won5050,
                winRate: total5050 > 0 ? ((won5050 / total5050) * 100).toFixed(1) : "0.0"
            };
        }

        const store = $pullData?.[activeTab] || { pulls: [], stats: {} };
        const st = store.stats || {};
        const pulls = store.pulls || [];
        return {
            total: pulls.length,
            count5: st.count5 || 0,
            count6: st.count6 || 0,
            avg6: st.avg6 || "0.0",
            avg5: st.avg5 || "0.0",
            total5050: st.winRate?.total || 0,
            won5050: st.winRate?.won || 0,
            winRate: st.winRate?.percent !== undefined ? st.winRate.percent : "0.0"
        };
    })();

    let serverData = null;
    let lastFetchKey = "";

    $: if (currentProfileStat) {
        serverData = currentProfileStat;
    } else if (browser && activeTab) {
        const queryType = activeTab === "total" ? "all" : activeTab;
        const fetchKey = `${queryType}_${localStats.total}_${localStats.count6}_${localStats.count5}_${localStats.total5050}_${localStats.won5050}`;
        if (fetchKey !== lastFetchKey) {
            lastFetchKey = fetchKey;
            loadRankings(queryType, localStats);
        }
    }

    async function loadRankings(bannerType, stats) {
        if (!browser || !stats || stats.total === 0) {
            serverData = null;
            return;
        }
        try {
            const isEvent = bannerType === "all" || ["special", "joint", "rerun", "weap-special", "weap-standard", "weapon_rerun", "weap-rerun"].includes(bannerType);
            const params = {
                bannerType,
                totalPulls: stats.total,
                total5Pulls: Math.min(stats.count5, stats.total),
                total6Pulls: Math.min(stats.count6, stats.total),
                countMe: true
            };
            if (isEvent) {
                params.total5050 = stats.total5050 ?? 0;
                params.won5050 = Math.min(stats.won5050 ?? 0, params.total5050);
            }
            const res = await fetchRankingRate(params);
            serverData = res;
        } catch (e) {
            serverData = null;
        }
    }

    const parseRating = (val) => {
        if (!val) return null;
        if (typeof val === "object" && typeof val.from === "number" && typeof val.to === "number") {
            return ((val.from + val.to) / 2) * 100;
        }
        const num = parseFloat(val);
        return isNaN(num) ? null : num;
    };

    $: rankTotal = parseRating(serverData?.totalPulls?.rating ?? serverData?.rankTotal);
    $: rankLuck6 = parseRating(serverData?.luck6?.rating ?? serverData?.rankLuck6);
    $: rank5050 = parseRating(serverData?.luck5050?.rating ?? serverData?.rank5050);
    $: rankLuck5 = parseRating(serverData?.luck5?.rating ?? serverData?.rankLuck5);
    $: totalUsers = serverData?.totalUsers || 0;

    $: displayTotal = serverData?.totalPulls?.count ?? serverData?.myStats?.total ?? localStats.total;
    $: displayAvg6 = serverData?.luck6?.avg ?? serverData?.myStats?.avg6 ?? localStats.avg6;
    $: displayAvg5 = serverData?.luck5?.avg ?? serverData?.myStats?.avg5 ?? localStats.avg5;
    $: displayWinRate = serverData?.luck5050?.winRate !== undefined && serverData?.luck5050?.winRate !== null
        ? (serverData.luck5050.winRate * 100).toFixed(1)
        : (serverData?.myStats?.winRate ?? localStats.winRate);

    const getRankValue = (rank) => {
        if (rank === null) return null;
        const val = rank > 50 ? (100 - rank) : rank;
        if (val < 1) return Math.max(val, 0.01).toFixed(2);
        return val.toFixed(0);
    };

    const getComparisonValue = (rank) => {
        if (rank === null) return null;
        const val = rank > 50 ? rank : (100 - rank);
        if (val > 99) return Math.min(val, 99.99).toFixed(2);
        return val.toFixed(0);
    };

    const getRankLabel = (rank) => {
        if (rank === null) return "page.rating.top";
        return rank > 50 ? "page.rating.top" : "page.rating.bottom";
    };

    function formatVal(val) {
        if (val === null || val === undefined) return "0";
        const num = Number(val);
        if (isNaN(num)) return "0";
        return num.toFixed(1);
    }
</script>

<div
    class="rounded-xl p-6 shadow-sm h-full min-w-0 border
  {hideBorders 
    ? 'bg-white/5 dark:bg-[#383838]/5 border-white/10 backdrop-blur-sm' 
    : 'bg-white dark:bg-[#383838] dark:border-[#444444] border-gray-100 dark:border-[#444444]'}"
>
    <div class="flex justify-between items-center mb-4 relative z-20">
        <h3 class="text-xl font-bold dark:text-[#FDFDFD] font-sdk text-[#21272C]">
            {isProfile ? $t("profile.pulls_rating") : $t("page.rating.ratingTitle")}
        </h3>

        <div class="group relative flex items-center py-1 pl-4 text-gray-400/90 dark:text-[#7A7A7A]">
            <Icon
                class="w-5 h-5 text-gray-300 hover:text-gray-400 dark:text-[#666] dark:hover:text-[#888] transition-colors cursor-default"
                name="info"
            />

            <div class="absolute right-0 top-full mt-1 w-[240px] p-3 bg-white dark:bg-[#252525] rounded-lg shadow-sm border border-gray-100 dark:border-[#383838] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 text-left">

                <div class="mb-3">
                    <div class="font-bold text-xs text-gray-900 dark:text-[#E0E0E0]">
                        {$t("page.rating.info.wonTitle")}
                    </div>
                    <div class="font-mono text-[10px] text-gray-500 dark:text-[#999] my-0.5">
                        Win% = (Won5050 / Total5050) × 100
                    </div>
                    <div class="text-[10px] text-gray-400 dark:text-[#777] leading-tight">
                        {$t("page.rating.info.wonDesc")}
                    </div>
                </div>

                <div class="mb-3">
                    <div class="font-bold text-xs text-gray-900 dark:text-[#E0E0E0] flex items-center gap-1">
                        {$t("page.rating.info.luck")} 6
                        <Icon
                            class="w-3 h-3"
                            name="star"
                        />
                    </div>
                    <div class="font-mono text-[10px] text-gray-500 dark:text-[#999] my-0.5">
                        Avg6 = ∑ Pity6 / Count6
                    </div>
                    <div class="text-[10px] text-gray-400 dark:text-[#777] leading-tight">
                        {$t("page.rating.info.luckDesc")}
                    </div>
                </div>

                <div class="mb-3">
                    <div class="font-bold text-xs text-gray-900 dark:text-[#E0E0E0] flex items-center gap-1">
                        {$t("page.rating.info.luck")} 5
                        <Icon
                            class="w-3 h-3"
                            name="star"
                        />
                    </div>
                    <div class="font-mono text-[10px] text-gray-500 dark:text-[#999] my-0.5">
                        Avg5 = ∑ Pity5 / Count5
                    </div>
                    <div class="text-[10px] text-gray-400 dark:text-[#777] leading-tight">
                        {$t("page.rating.info.luckDesc")}
                    </div>
                </div>

                {#if totalUsers > 0}
                    <div class="pt-2 mt-2 border-t border-gray-100 dark:border-[#333]">
                        <div class="text-[10px] text-gray-400 dark:text-[#666] italic text-center">
                            {$t("page.rating.info.basedOn", { n: totalUsers })}
                        </div>
                    </div>
                {/if}

            </div>
        </div>
    </div>

    <div class="space-y-6">

        {#if activeTab !== 'new-player'}
            <div class="flex justify-between items-center border-b dark:border-[#444444] {hideBorders ? 'border-gray-100/20' : 'border-gray-100'} pb-4 h-[72px]">
                <div class="flex flex-col justify-center">
                    <div class="font-medium text-[#21272C] dark:text-[#FDFDFD]">{$t("page.rating.luckyTotal")}</div>
                    {#if rankTotal !== null}
                        <div class="text-xs text-gray-400 dark:text-[#B7B6B3] mt-1">
                            {#if rankTotal < 50}
                                {$t("page.rating.luckyLessThan", { n: getComparisonValue(rankTotal) })}
                            {:else}
                                {$t("page.rating.luckyMoreThan", { n: getComparisonValue(rankTotal) })}
                            {/if}
                        </div>
                    {/if}
                </div>
                <div class="text-right flex flex-col justify-center h-full">
                    {#if rankTotal !== null}
                        <div class="text-2xl font-black dark:text-[#FDFDFD] text-gray-900 font-nums whitespace-nowrap">
                            {$t(getRankLabel(rankTotal))} {getRankValue(rankTotal)}%
                        </div>
                        <div class="text-sm text-gray-400 dark:text-[#B7B6B3] font-semibold">
                            {Number(displayTotal).toLocaleString(normalizeLocale($currentUiLocale))}
                        </div>
                    {:else}
                        <div class="flex items-center gap-2 opacity-50 justify-end">
                            <span class="text-sm font-medium text-gray-700 dark:text-[#B7B6B3]">{$t("page.rating.noData")}</span>
                            <Icon
                                name="noData"
                                class="w-4 h-4 text-[#A0A0A0]"
                            />
                        </div>
                    {/if}
                </div>
            </div>
        {/if}

        {#if activeTab !== 'standard' && activeTab !== 'new-player' && activeTab !== 'joint'}
            <div class="flex justify-between items-center border-b dark:border-[#444444] {hideBorders ? 'border-gray-100/20' : 'border-gray-100'} pb-4 h-[72px]">
                <div class="flex flex-col justify-center">
                    <div class="font-medium text-[#21272C] dark:text-[#FDFDFD]">
                        {#if activeTab.includes('weap')}
                            {$t("page.rating.lucky2575")}{:else}
                            {$t("page.rating.lucky5050")}
                        {/if}
                    </div>

                    {#if rank5050 !== null}
                        <div class="text-xs text-gray-400 dark:text-[#B7B6B3] mt-1">
                            {#if rank5050 < 50}
                                {$t("page.rating.luckyLessLuckierThan", { n: getComparisonValue(rank5050) })}
                            {:else}
                                {$t("page.rating.luckyLuckierThan", { n: getComparisonValue(rank5050) })}
                            {/if}
                        </div>
                    {/if}
                </div>
                <div class="text-right flex flex-col justify-center h-full">
                    {#if rank5050 !== null}
                        <div class="text-2xl font-black dark:text-[#FDFDFD] text-[#21272C] font-nums whitespace-nowrap">
                            {$t(getRankLabel(rank5050))} {getRankValue(rank5050)}%
                        </div>
                        <div class="text-sm text-gray-400 dark:text-[#B7B6B3] font-semibold">
                            {formatVal(displayWinRate)}%
                        </div>
                    {:else}
                        <div class="flex items-center gap-2 opacity-50 justify-end">
                            <span class="text-sm font-medium text-gray-700 dark:text-[#B7B6B3]">{$t("page.rating.noData")}</span>
                            <Icon
                                name="noData"
                                class="w-4 h-4 text-[#A0A0A0]"
                            />
                        </div>
                    {/if}
                </div>
            </div>
        {/if}

        <div class="flex justify-between items-center border-b dark:border-[#444444] {hideBorders ? 'border-gray-100/20' : 'border-gray-100'} pb-4 h-[72px]">
            <div class="flex flex-col justify-center">
                <div class="font-medium text-[#21272C] dark:text-[#FDFDFD] flex items-center gap-1">
                    {$t("page.rating.lucky6")} 6
                    <Icon
                        class="w-4 h-4"
                        name="star"
                    />
                </div>
                {#if rankLuck6 !== null}
                    <div class="text-xs dark:text-[#B7B6B3] text-gray-400 mt-1">
                        {#if rankLuck6 < 50}
                            {$t("page.rating.luckyLessLuckierThan", { n: getComparisonValue(rankLuck6) })}
                        {:else}
                            {$t("page.rating.luckyLuckierThan", { n: getComparisonValue(rankLuck6) })}
                        {/if}
                    </div>
                {/if}
            </div>
            <div class="text-right flex flex-col justify-center h-full">
                {#if rankLuck6 !== null}
                    <div class="text-2xl font-black dark:text-[#D97D48] text-[#D97D48] font-nums whitespace-nowrap">
                        {$t(getRankLabel(rankLuck6))} {getRankValue(rankLuck6)}%
                    </div>
                    <div class="text-sm font-semibold text-[#D97D48] dark:text-[#D97D48]">
                        {formatVal(displayAvg6)}
                        <span class="text-[#D97D48] dark:text-[#D97D48] font-semibold">{$t("page.rating.avg")}</span>
                    </div>
                {:else}
                    <div class="flex items-center gap-2 opacity-50 justify-end">
                        <span class="text-sm font-medium text-gray-700 dark:text-[#B7B6B3]">{$t("page.rating.noData")}</span>
                        <Icon
                            name="noData"
                            class="w-4 h-4 text-[#A0A0A0]"
                        />
                    </div>
                {/if}
            </div>
        </div>

        <div class="flex justify-between items-center {showTabs ? 'dark:border-[#444444] border-b pb-4 h-[72px]' : ' h-[62px]'} {hideBorders ? 'border-gray-100/20' : 'border-gray-100'}">
            <div class="flex flex-col justify-center">
                <div class="font-medium text-[#21272C] dark:text-[#FDFDFD] flex items-center gap-1">
                    {$t("page.rating.lucky5")} 5
                    <Icon
                        class="w-4 h-4"
                        name="star"
                    />
                </div>
                {#if rankLuck5 !== null}
                    <div class="text-xs dark:text-[#B7B6B3] text-gray-400 mt-1">
                        {#if rankLuck5 < 50}
                            {$t("page.rating.luckyLessLuckierThan", { n: getComparisonValue(rankLuck5) })}
                        {:else}
                            {$t("page.rating.luckyLuckierThan", { n: getComparisonValue(rankLuck5) })}
                        {/if}
                    </div>
                {/if}
            </div>
            <div class="text-right flex flex-col justify-center h-full">
                {#if rankLuck5 !== null}
                    <div class="text-2xl font-black dark:text-[#E3BC55] text-[#E3BC55] whitespace-nowrap">
                        {$t(getRankLabel(rankLuck5))} {getRankValue(rankLuck5)}%
                    </div>
                    <div class="text-sm font-semibold dark:text-[#E3BC55] text-[#E3BC55]">
                        {formatVal(displayAvg5)}
                        <span class="dark:text-[#E3BC55] text-[#E3BC55] font-semibold">{$t("page.rating.avg")}</span>
                    </div>
                {:else}
                    <div class="flex items-center gap-2 opacity-50 justify-end">
                        <span class="text-sm font-medium text-gray-700 dark:text-[#B7B6B3]">{$t("page.rating.noData")}</span>
                        <Icon
                            name="noData"
                            class="w-4 h-4 text-[#A0A0A0]"
                        />
                    </div>
                {/if}
            </div>
        </div>

        {#if showTabs}
            <div class="flex flex-wrap gap-2 mt-2">
                {#each ratingTabs as tab}
                    <Button
                        variant="roundSmall"
                        color={activeTab === tab.id ? "black" : "gray"}
                        className={
              (activeTab === tab.id ? "shadow-md " : "opacity-70 hover:opacity-100 ")
            }
                        onClick={() => (activeTab = tab.id)}
                    >
                        {$t(tab.i18nKey)}
                    </Button>
                {/each}
            </div>
        {/if}
    </div>
</div>
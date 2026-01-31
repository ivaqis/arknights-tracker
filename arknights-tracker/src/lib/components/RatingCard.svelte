<script>
  import { t } from "$lib/i18n";
  import { pullData } from "$lib/stores/pulls";
  import { bannerTypes } from "$lib/data/bannerTypes";
  import { fetchGlobalStats } from "$lib/api";
  import { browser } from "$app/environment";
  import { currentUid } from "$lib/stores/auth";
  import Button from "./Button.svelte";
  import Icon from "./Icons.svelte";

  // --- ТАБЫ ---
  $: ratingTabs = [...bannerTypes]
    .filter((b) => b.showInRating)
    .sort((a, b) => a.order - b.order);

  let activeTab = ratingTabs?.[0]?.id ?? "special";
  
  // --- ЛОКАЛЬНЫЕ ДАННЫЕ ---
  $: localStore = $pullData[activeTab] || { pulls: [], stats: {} };
  $: localStats = localStore.stats || {};
  
  $: localTotal = localStore.pulls?.length || 0;
  $: localAvg6 = localStats.avg6 ? parseFloat(localStats.avg6) : 0;
  $: localAvg5 = localStats.avg5 ? parseFloat(localStats.avg5) : 0;
  $: localWinRate = localStats.winRate?.percent ? parseFloat(localStats.winRate.percent) : 0;

  // --- ДАННЫЕ С СЕРВЕРА ---
  let serverData = null;

  $: displayTotal = serverData?.myStats?.total ?? localTotal;
  $: displayAvg6 = serverData?.myStats?.avg6 ? parseFloat(serverData.myStats.avg6) : localAvg6;
  $: displayWinRate = serverData?.myStats?.winRate ? parseFloat(serverData.myStats.winRate) : localWinRate;

  // --- ПАРСИНГ ---
  const safeParse = (val) => {
      if (val === null || val === undefined) return null;
      const num = parseFloat(val);
      return isNaN(num) ? null : num;
  };

  $: rankTotal = safeParse(serverData?.rankTotal);
  $: rankLuck6 = safeParse(serverData?.rankLuck6);
  $: rank5050 = safeParse(serverData?.rank5050);
  $: rankLuck5 = safeParse(serverData?.rankLuck5);

  // --- ХЕЛПЕРЫ ---
  const getPercentile = (rank) => rank !== null ? rank.toFixed(0) : "---";
  
  const getRankValue = (rank) => {
      if (rank === null) return "---";
      return (rank > 50 ? (100 - rank) : rank).toFixed(0);
  };

  const getRankLabel = (rank) => {
      if (rank === null) return "page.rating.top";
      return rank > 50 ? "page.rating.top" : "page.rating.bottom";
  };

  const getComparisonValue = (rank) => {
      if (rank === null) return "---";
      return (rank > 50 ? rank : (100 - rank)).toFixed(0);
  };

  function formatVal(val) {
    return val !== null && val !== undefined && !isNaN(val) ? val : "0";
  }

  // --- ЗАГРУЗКА ---
  $: if (browser && activeTab) {
      if ($currentUid) {
          loadRankings(activeTab, $currentUid);
      } else {
          serverData = null; 
      }
  }

  async function loadRankings(poolId, uid) {
    if (!browser || !uid) return;
    serverData = null; 
    try {
      const response = await fetchGlobalStats(uid, poolId);
      if (uid !== $currentUid) return; 

      if (response && (response.code === 0 || response.found)) {
         serverData = response.data || response;
      } else {
         serverData = null;
      }
    } catch (e) {
      console.error("Fetch Failed", e);
      serverData = null;
    }
  }
</script>

<div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-full min-w-[320px]">
  <h3 class="text-xl font-bold mb-6 font-sdk text-[#21272C]">
    {$t("page.rating.ratingTitle")}
  </h3>

  <div class="space-y-6">
    
    {#if activeTab !== 'new-player'}
      <div class="flex justify-between items-center border-b border-gray-100 pb-4">
        <div>
          <div class="font-medium text-gray-700">{$t("page.rating.luckyTotal")}</div>
          <div class="text-xs text-gray-400 mt-1">
             {#if rankTotal !== null}
                {#if rankTotal < 50}
                   {$t("page.rating.luckyLessThan", { n: getComparisonValue(rankTotal) })}
                {:else}
                   {$t("page.rating.luckyMoreThan", { n: getComparisonValue(rankTotal) })}
                {/if}
             {:else}
                ---
             {/if}
          </div>
        </div>
        <div class="text-right">
          <div class="text-2xl font-black text-gray-900 font-nums whitespace-nowrap">
             {$t(getRankLabel(rankTotal))} {getRankValue(rankTotal)}%
          </div>
          <div class="text-sm font-bold text-gray-900 font-nums">
            {displayTotal.toLocaleString("ru-RU")}
          </div>
        </div>
      </div>
    {/if}

    {#if activeTab !== 'standard' && activeTab !== 'new-player'}
      <div class="flex justify-between items-center border-b border-gray-100 pb-4">
        <div>
          <div class="font-medium text-gray-700">{$t("page.rating.lucky5050")}</div>
          <div class="text-xs text-gray-400 mt-1">
             {#if rank5050 !== null}
                {#if rank5050 < 50}
                   {$t("page.rating.luckyLessLuckierThan", { n: getComparisonValue(rank5050) })}
                {:else}
                   {$t("page.rating.luckyLuckierThan", { n: getComparisonValue(rank5050) })}
                {/if}
             {:else}
                ---
             {/if}
          </div>
        </div>
        <div class="text-right">
          <div class="text-2xl font-black text-[#21272C] font-nums whitespace-nowrap">
             {$t(getRankLabel(rank5050))} {getRankValue(rank5050)}%
          </div>
          <div class="text-sm font-bold text-gray-900 font-nums">
            {formatVal(displayWinRate)}%
          </div>
        </div>
      </div>
    {/if}

    <div class="flex justify-between items-center border-b border-gray-100 pb-4">
      <div>
        <div class="font-medium text-[#21272C] flex items-center gap-1">
          {$t("page.rating.lucky6")} 6 <Icon name="star" class="w-4 h-4" />
        </div>
        <div class="text-xs text-gray-400 mt-1">
           {#if rankLuck6 !== null}
              {#if rankLuck6 < 50}
                 {$t("page.rating.luckyLessLuckierThan", { n: getComparisonValue(rankLuck6) })}
              {:else}
                 {$t("page.rating.luckyLuckierThan", { n: getComparisonValue(rankLuck6) })}
              {/if}
           {:else}
              ---
           {/if}
        </div>
      </div>
      <div class="text-right">
        <div class="text-2xl font-black text-gray-900 font-nums whitespace-nowrap">
           {$t(getRankLabel(rankLuck6))} {getRankValue(rankLuck6)}%
        </div>
        <div class="text-sm font-bold text-gray-900 font-nums">
          {formatVal(displayAvg6)} <span class="text-gray-400 font-normal">avg</span>
        </div>
      </div>
    </div>

    <div class="flex justify-between items-center border-b border-gray-100 pb-4">
      <div>
        <div class="font-medium text-[#21272C] flex items-center gap-1">
          {$t("page.rating.lucky5")} 5 <Icon name="star" class="w-4 h-4" />
        </div>
        <div class="text-xs text-gray-400 mt-1">
           {#if rankLuck5 !== null}
              {#if rankLuck5 < 50}
                 {$t("page.rating.luckyLessLuckierThan", { n: getComparisonValue(rankLuck5) })}
              {:else}
                 {$t("page.rating.luckyLuckierThan", { n: getComparisonValue(rankLuck5) })}
              {/if}
           {:else}
              ---
           {/if}
        </div>
      </div>
      <div class="text-right">
        <div class="text-2xl font-black text-[#21272C] font-nums whitespace-nowrap">
           {$t(getRankLabel(rankLuck5))} {getRankValue(rankLuck5)}%
        </div>
        <div class="text-sm font-bold text-gray-900 font-nums">
          {formatVal(serverData?.myStats?.avg5 ?? localAvg5)} <span class="text-gray-400 font-normal">avg</span>
        </div>
      </div>
    </div>

    <div class="flex flex-wrap gap-2 mt-4 pt-2">
      {#each ratingTabs as tab}
        <Button
          variant="roundSmall"
          color={activeTab === tab.id ? "black" : "gray"}
          className={activeTab === tab.id ? "shadow-md" : "opacity-70 hover:opacity-100"}
          onClick={() => (activeTab = tab.id)}
        >
          {$t(tab.i18nKey)}
        </Button>
      {/each}
    </div>
  </div>
</div>
<script>
  import { t } from "$lib/i18n";
  import { pullData } from "$lib/stores/pulls";
  import { bannerTypes } from "$lib/data/bannerTypes";
  import { fetchGlobalStats } from "$lib/api";
  import { browser } from "$app/environment";
  import { accountStore } from "$lib/stores/accounts";
  import Button from "./Button.svelte";
  import Icon from "./Icons.svelte";
  import Tooltip from "./Tooltip.svelte";

  const { accounts, selectedId } = accountStore;
  
  $: currentAccount = $accounts.find(a => a.id === $selectedId);
  $: gameUid = currentAccount?.serverUid; 

  $: ratingTabs = [...bannerTypes]
    .filter((b) => b.showInRating)
    .sort((a, b) => a.order - b.order);

  let activeTab = ratingTabs?.[0]?.id ?? "special";
  
  $: localStore = $pullData[activeTab] || { pulls: [], stats: {} };
  $: localStats = localStore.stats || {};
  $: localTotal = localStore.pulls?.length || 0;
  $: localAvg6 = localStats.avg6 ? parseFloat(localStats.avg6) : 0;
  $: localAvg5 = localStats.avg5 ? parseFloat(localStats.avg5) : 0;
  $: localWinRate = localStats.winRate?.percent ? parseFloat(localStats.winRate.percent) : 0;
  
  let serverData = null;
  
  $: displayTotal = serverData?.myStats?.total ?? localTotal;
  $: displayAvg6 = serverData?.myStats?.avg6 ? parseFloat(serverData.myStats.avg6) : localAvg6;
  $: displayWinRate = serverData?.myStats?.winRate ? parseFloat(serverData.myStats.winRate) : localWinRate;

  const safeParse = (val) => {
      if (val === null || val === undefined) return null;
      const num = parseFloat(val);
      return isNaN(num) ? null : num;
  };

  $: rankTotal = safeParse(serverData?.rankTotal);
  $: rankLuck6 = safeParse(serverData?.rankLuck6);
  $: rank5050 = safeParse(serverData?.rank5050);
  $: rankLuck5 = safeParse(serverData?.rankLuck5);

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
    return val !== null && val !== undefined && !isNaN(val) ? val : "0";
  }

  $: if (browser && activeTab) {
      if (gameUid) {
          loadRankings(activeTab, gameUid);
      } else {
          serverData = null; 
      }
  }

  async function loadRankings(poolId, uid) {
    if (!browser || !uid) return;
    try {
      const response = await fetchGlobalStats(uid, poolId);
      if (uid !== gameUid) return; 
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

<div class="bg-white dark:bg-[#383838] dark:border-[#444444] rounded-xl p-6 shadow-sm border border-gray-100 h-full min-w-[320px]">
  <div class="flex justify-between items-center mb-6 relative z-20">
    <h3 class="text-xl font-bold dark:text-[#FDFDFD] font-sdk text-[#21272C]">
      {$t("page.rating.ratingTitle")}
    </h3>

    <div class="group relative flex items-center py-1 pl-4 text-gray-400/90 dark:text-[#7A7A7A]">
      <Icon name="info" class="w-5 h-5 text-gray-300 hover:text-gray-400 dark:text-[#666] dark:hover:text-[#888] transition-colors cursor-default" />

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
            {$t("page.rating.info.luck")} 6 <Icon name="star" class="w-3 h-3" />
          </div>
          <div class="font-mono text-[10px] text-gray-500 dark:text-[#999] my-0.5">
            Avg6 = ∑ Pity6 / Count6
          </div>
          <div class="text-[10px] text-gray-400 dark:text-[#777] leading-tight">
            {$t("page.rating.info.luckDesc")}
          </div>
        </div>

        <div>
          <div class="font-bold text-xs text-gray-900 dark:text-[#E0E0E0] flex items-center gap-1">
            {$t("page.rating.info.luck")} 5 <Icon name="star" class="w-3 h-3" />
          </div>
          <div class="font-mono text-[10px] text-gray-500 dark:text-[#999] my-0.5">
            Avg5 = ∑ Pity5 / Count5
          </div>
          <div class="text-[10px] text-gray-400 dark:text-[#777] leading-tight">
            {$t("page.rating.info.luckDesc")}
          </div>
        </div>

      </div>
    </div>
  </div>

  <div class="space-y-6">
    
    {#if activeTab !== 'new-player'}
      <div class="flex justify-between items-center border-b dark:border-[#444444] border-gray-100 pb-4 h-[72px]">
        <div class="flex flex-col justify-center">
          <div class="font-medium dark:text-[#FDFDFD] text-gray-700">{$t("page.rating.luckyTotal")}</div>
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
                {displayTotal.toLocaleString("ru-RU")}
              </div>
          {:else}
              <div class="flex items-center gap-2 opacity-50 justify-end">
                  <span class="text-sm font-medium text-gray-500 dark:text-[#B7B6B3]">{$t("page.rating.noData") || "Нет данных"}</span>
                  <Icon name="noData" class="w-4 h-4 text-gray-400 dark:text-[#7A7A7A]" />
              </div>
          {/if}
        </div>
      </div>
    {/if}

    {#if activeTab !== 'standard' && activeTab !== 'new-player'}
      <div class="flex justify-between items-center border-b dark:border-[#444444] border-gray-100 pb-4 h-[72px]">
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
                  <span class="text-sm font-medium text-gray-500 dark:text-[#B7B6B3]">{$t("page.rating.noData") || "Нет данных"}</span>
                  <Icon name="noData" class="w-4 h-4 text-gray-400 dark:text-[#7A7A7A]" />
              </div>
          {/if}
        </div>
      </div>
    {/if}

    <div class="flex justify-between items-center border-b dark:border-[#444444] border-gray-100 pb-4 h-[72px]">
      <div class="flex flex-col justify-center">
        <div class="font-medium text-[#21272C] dark:text-[#FDFDFD] flex items-center gap-1">
          {$t("page.rating.lucky6")} 6 <Icon name="star" class="w-4 h-4" />
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
            <div class="text-2xl font-black dark:text-[#FDFDFD] text-[#21272C] font-nums whitespace-nowrap">
               {$t(getRankLabel(rankLuck6))} {getRankValue(rankLuck6)}%
            </div>
            <div class="text-sm font-semibold text-gray-400 dark:text-[#B7B6B3]">
              {formatVal(displayAvg6)} <span class="text-gray-400 dark:text-[#B7B6B3] font-semibold">{$t("page.rating.avg")}</span>
            </div>
        {:else}
            <div class="flex items-center gap-2 opacity-50 justify-end">
                <span class="text-sm font-medium text-gray-500 dark:text-[#B7B6B3]">{$t("page.rating.noData") || "Нет данных"}</span>
                <Icon name="noData" class="w-4 h-4 text-gray-400 dark:text-[#7A7A7A]" />
            </div>
        {/if}
      </div>
    </div>

    <div class="flex justify-between items-center dark:border-[#444444] border-b border-gray-100 pb-4 h-[72px]">
      <div class="flex flex-col justify-center">
        <div class="font-medium text-[#21272C] dark:text-[#FDFDFD] flex items-center gap-1">
          {$t("page.rating.lucky5")} 5 <Icon name="star" class="w-4 h-4" />
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
            <div class="text-2xl font-black text-[#21272C] dark:text-[#FDFDFD] whitespace-nowrap">
               {$t(getRankLabel(rankLuck5))} {getRankValue(rankLuck5)}%
            </div>
            <div class="text-sm font-semibold dark:text-[#B7B6B3] text-gray-400">
              {formatVal(serverData?.myStats?.avg5 ?? localAvg5)} <span class="text-gray-400 dark:text-[#B7B6B3] font-semibold">{$t("page.rating.avg")}</span>
            </div>
        {:else}
            <div class="flex items-center gap-2 opacity-50 justify-end">
                <span class="text-sm font-medium text-gray-500 dark:text-[#B7B6B3]">{$t("page.rating.noData") || "Нет данных"}</span>
                <Icon name="noData" class="w-4 h-4 text-gray-400 dark:text-[#7A7A7A]" />
            </div>
        {/if}
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
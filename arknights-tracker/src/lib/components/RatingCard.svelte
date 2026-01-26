<script>
  import { t } from "$lib/i18n";
  import { pullData } from "$lib/stores/pulls";
  import { bannerTypes } from "$lib/data/bannerTypes";
  import { fetchGlobalStats } from "$lib/api";
  import { browser } from "$app/environment";
  import Button from "./Button.svelte";
  import Icon from "./Icons.svelte";

  $: ratingTabs = [...bannerTypes]
    .filter((b) => b.showInRating)
    .sort((a, b) => a.order - b.order);

  let activeTab = ratingTabs?.[0]?.id ?? "special";

  $: currentStats = $pullData[activeTab] || {
    pulls: [],
    total: 0,
    pity6: 0,
    pity5: 0,
  };
  $: totalPulls = currentStats.total;

  $: avgPity6 = (() => {
    const sixStars = currentStats.pulls.filter((p) => p.rarity === 6);
    if (sixStars.length === 0) return null;
    return (totalPulls / sixStars.length).toFixed(1);
  })();

  $: winRate5050 = null;
  $: total5050 = null;

  $: avgPity5 = (() => {
    const fiveStars = currentStats.pulls.filter((p) => p.rarity === 5);
    if (fiveStars.length === 0) return null;
    return (totalPulls / fiveStars.length).toFixed(1);
  })();

  let rankTotal = null;
  let rankLuck6 = null;
  let rank5050 = null;
  let rankLuck5 = null;

  $: if (browser && activeTab) {
    loadRankings(activeTab);
  }

  async function loadRankings(poolId) {
    rankTotal = null;
    const uid = localStorage.getItem("user_uid");
    if (!uid) return;
    const data = await fetchGlobalStats(uid, poolId);
  }

  function formatVal(val) {
    return val !== null && val !== undefined ? val : "---";
  }
</script>

<div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
  <h3 class="text-xl font-bold mb-6 font-sdk text-[#21272C]">
    {$t("page.rating.ratingTitle")}
  </h3>

  <div class="space-y-6">
    <div class="flex justify-between items-end border-b border-gray-100 pb-4">
      <div>
        <div class="font-medium text-gray-700">
          {$t("page.rating.luckyTotal")}
        </div>
        <div class="text-xs text-gray-400 mt-1">
          {$t("page.rating.luckyMoreThan", {
            n: rankTotal !== null ? rankTotal : "...",
          })}
        </div>
      </div>
      <div class="text-right">
        <div class="text-2xl font-black text-gray-900 font-nums">
          {rankTotal !== null ? `Top ${100 - rankTotal}%` : "..."}
        </div>
        <div class="text-sm font-bold text-gray-900 font-nums">
          {totalPulls > 0 ? totalPulls.toLocaleString("ru-RU") : "---"}
        </div>
      </div>
    </div>

    <div class="flex justify-between items-end border-b border-gray-100 pb-4">
      <div>
        <div class="font-medium text-gray-700">
          {$t("page.rating.lucky5050")}
        </div>
        <div class="text-xs text-gray-400 mt-1">
          {$t("page.rating.luckyLuckierThan", {
            n: rank5050 !== null ? rank5050 : "...",
          })}
        </div>
      </div>
      <div class="text-right">
        <div class="text-2xl font-black text-gray-900 font-nums">
          {rank5050 !== null ? `Top ${100 - rank5050}%` : "..."}
        </div>
        <div class="text-sm font-bold text-gray-900 font-nums">
          {formatVal(winRate5050)} / {formatVal(total5050)}
        </div>
      </div>
    </div>

    <div class="flex justify-between items-end border-b border-gray-100 pb-4">
      <div>
        <div class="font-medium text-gray-700 flex items-center gap-1">
          {$t("page.rating.lucky6")}
          6 <Icon name="star" class="w-4 h-4" />
        </div>
        <div class="text-xs text-gray-400 mt-1">
          {$t("page.rating.luckyLuckierThan", {
            n: rankLuck6 !== null ? rankLuck6 : "...",
          })}
        </div>
      </div>
      <div class="text-right">
        <div class="text-2xl font-black text-gray-900 font-nums">
          {rankLuck6 !== null ? `Top ${100 - rankLuck6}%` : "..."}
        </div>
        <div class="text-sm font-bold text-gray-900 font-nums">
          {formatVal(avgPity6)}
          {$t("page.rating.avg")}
        </div>
      </div>
    </div>

    <div class="flex justify-between items-end border-b border-gray-100 pb-4">
      <div>
        <div class="font-medium text-gray-700 flex items-center gap-1">
          {$t("page.rating.lucky5")}
          5 <Icon name="star" class="w-4 h-4" />
        </div>
        <div class="text-xs text-gray-400 mt-1">
          {$t("page.rating.luckyLessLuckierThan", { n: rankLuck5 || "..." })}
        </div>
      </div>
      <div class="text-right">
        <div class="text-2xl font-black text-gray-900 font-nums">
          {$t("page.rating.luckyTopPercent", { n: rankLuck5 || "..." })}
        </div>
        <div class="text-sm font-bold text-gray-900 font-nums">
          {formatVal(avgPity5)}
          {$t("page.rating.avg")}
        </div>
      </div>
    </div>

    <div class="flex flex-wrap gap-2 mt-4">
      {#each ratingTabs as tab}
        <Button
          variant="roundSmall"
          color={activeTab === tab.id ? "black" : "gray"}
          className={activeTab === tab.id
            ? "shadow-md"
            : "opacity-70 hover:opacity-100"}
          onClick={() => (activeTab = tab.id)}
        >
          {$t(tab.i18nKey)}
        </Button>
      {/each}
    </div>
  </div>
</div>

<script>
  import { t } from "$lib/i18n";
  import { pullData } from "$lib/stores/pulls";
  import { bannerTypes } from "$lib/data/bannerTypes";
  import { fetchGlobalStats } from "$lib/api";
  import { browser } from "$app/environment";
  import Button from "./Button.svelte";
  import Icon from "./Icons.svelte";

  // --- НАСТРОЙКА ТАБОВ ---
  $: ratingTabs = [...bannerTypes]
    .filter((b) => b.showInRating)
    .sort((a, b) => a.order - b.order);

  let activeTab = ratingTabs?.[0]?.id ?? "special";

  // --- ЛОКАЛЬНЫЕ ДАННЫЕ ---
  $: localStore = $pullData[activeTab] || { pulls: [], stats: {} };
  $: localStats = localStore.stats || {};
  
  // Безопасное получение локальных данных
  $: localTotal = localStats.total || 0;
  $: localAvg6 = localStats.avg6 ? parseFloat(localStats.avg6) : 0;
  $: localAvg5 = localStats.avg5 ? parseFloat(localStats.avg5) : 0;
  $: localWinRate = localStats.winRate?.percent ? parseFloat(localStats.winRate.percent) : 0;

  let serverData = null;

  // --- ДАННЫЕ ДЛЯ ОТОБРАЖЕНИЯ (Сервер > Локальные) ---
  $: displayTotal = serverData?.myStats?.total ?? localTotal;
  
  // Парсим строки "80.0" в числа для корректного отображения
  $: displayAvg6 = serverData?.myStats?.avg6 ? parseFloat(serverData.myStats.avg6) : localAvg6;
  $: displayWinRate = serverData?.myStats?.winRate ? parseFloat(serverData.myStats.winRate) : localWinRate;

  // --- РЕЙТИНГИ (Парсим в числа) ---
  // Хелпер для парсинга, превращает "67" -> 67, null -> null
  const parseRank = (val) => {
    if (val === null || val === undefined) return null;
    const num = parseFloat(val);
    return isNaN(num) ? null : num;
  }

  $: rankTotal = parseRank(serverData?.rankTotal);
  $: rankLuck6 = parseRank(serverData?.rankLuck6);
  $: rank5050 = parseRank(serverData?.rank5050);
  // rankLuck5 нет в API, поэтому он всегда будет null, если не добавить его на бэкенде
  $: rankLuck5 = parseRank(serverData?.rankLuck5); 

  // --- ЗАГРУЗКА ---
  $: if (browser && activeTab) {
    loadRankings(activeTab);
  }

  async function loadRankings(poolId) {
    serverData = null; // Сброс перед загрузкой
    const uid = localStorage.getItem("user_uid");
    if (!uid) return;

    try {
      const response = await fetchGlobalStats(uid, poolId);
      console.log("Rankings response:", response); // Дебаг в консоль

      if (response && response.code === 0 && response.data) {
        serverData = response.data;
      }
    } catch (e) {
      console.error("Failed to load rankings:", e);
    }
  }

  function formatVal(val) {
    return val !== null && val !== undefined && !isNaN(val) ? val : "---";
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
            n: rankTotal !== null ? rankTotal : "..."
          })}
        </div>
      </div>
      <div class="text-right">
        <div class="text-2xl font-black text-gray-900 font-nums">
            {rankTotal !== null ? `Top ${(100 - rankTotal).toFixed(0)}%` : "..."}
        </div>
        <div class="text-sm font-bold text-gray-900 font-nums">
          {displayTotal > 0 ? displayTotal.toLocaleString("ru-RU") : "---"}
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
            n: rank5050 !== null ? rank5050 : "..."
          })}
        </div>
      </div>
      <div class="text-right">
        <div class="text-2xl font-black text-[#21272C] font-nums">
          {rank5050 !== null ? `Top ${(100 - rank5050).toFixed(0)}%` : "..."}
        </div>
        <div class="text-sm font-bold text-gray-900 font-nums">
          {formatVal(displayWinRate)}%
        </div>
      </div>
    </div>

    <div class="flex justify-between items-end border-b border-gray-100 pb-4">
      <div>
        <div class="font-medium text-[#21272C] flex items-center gap-1">
          {$t("page.rating.lucky6")}
          6 <Icon name="star" class="w-4 h-4" />
        </div>
        <div class="text-xs text-gray-400 mt-1">
          {$t("page.rating.luckyLuckierThan", {
            n: rankLuck6 !== null ? rankLuck6 : "..."
          })}
        </div>
      </div>
      <div class="text-right">
        <div class="text-2xl font-black text-gray-900 font-nums">
          {rankLuck6 !== null ? `Top ${(100 - rankLuck6).toFixed(0)}%` : "..."}
        </div>
        <div class="text-sm font-bold text-gray-900 font-nums">
          {formatVal(displayAvg6)}
          {$t("page.rating.avg")}
        </div>
      </div>
    </div>

    <div class="flex justify-between items-end border-b border-gray-100 pb-4">
      <div>
        <div class="font-medium text-[#21272C] flex items-center gap-1">
          {$t("page.rating.lucky5")}
          5 <Icon name="star" class="w-4 h-4" />
        </div>
        <div class="text-xs text-gray-400 mt-1">
            {$t("page.rating.luckyLessLuckierThan", { n: rankLuck5 !== null ? rankLuck5 : "..." })}
        </div>
      </div>
      <div class="text-right">
        <div class="text-2xl font-black text-[#21272C] font-nums">
            {rankLuck5 !== null ? `Top ${(100 - rankLuck5).toFixed(0)}%` : "..."}
        </div>
        <div class="text-sm font-bold text-gray-900 font-nums">
          {formatVal(localAvg5)}
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
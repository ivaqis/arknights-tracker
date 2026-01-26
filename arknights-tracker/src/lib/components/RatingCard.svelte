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

  // --- ЛОКАЛЬНЫЕ ДАННЫЕ (Считаем прямо в браузере) ---
  $: localStore = $pullData[activeTab] || { pulls: [], stats: {} };

  // Берем готовые статы из стора (они там уже посчитаны)
  $: localStats = localStore.stats || {};

  $: localTotal = localStats.total || 0;
  $: localAvg6 = localStats.avg6 || "0.0";
  $: localAvg5 = localStats.avg5 || "0.0";

  // Для 50/50 берем из локальной статистики
  $: localWinRate = localStats.winRate?.percent || "0";
  $: localTotal5050 = localStats.winRate?.total || 0;
  $: localWon5050 = localStats.winRate?.won || 0;

  // --- СЕРВЕРНЫЕ ДАННЫЕ (Приходят асинхронно) ---
  let serverData = null; // Здесь будет лежать ответ API

  // --- ИТОГОВЫЕ ПЕРЕМЕННЫЕ ДЛЯ ОТОБРАЖЕНИЯ ---
  // Логика: Если сервер ответил данными, берем их. Если нет — показываем локальные.

  $: displayTotal = serverData?.myStats?.total ?? localTotal;
  $: displayAvg6 = serverData?.myStats?.avg6 ?? localAvg6;
  $: displayAvg5 = "---"; // API обычно не возвращает avg5 для рейтинга, но если вернет - добавь сюда

  // 50/50: Сервер может вернуть winRate просто числом/строкой
  $: displayWinRate = serverData?.myStats?.winRate ?? localWinRate;

  // Рейтинги (Top X%) - они есть только на сервере
  $: rankTotal = serverData?.rankTotal ?? null;
  $: rankLuck6 = serverData?.rankLuck6 ?? null;
  $: rank5050 = serverData?.rank5050 ?? null;
  $: rankLuck5 = serverData?.rankLuck5 ?? null;

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
      if (response && response.code === 0 && response.data) {
        serverData = response.data;
      }
    } catch (e) {
      console.error("Failed to load rankings:", e);
    }
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
            n: rank5050 !== null ? rank5050 : "...",
          })}
        </div>
      </div>
      <div class="text-right">
        <div class="text-2xl font-black text-[#21272C] font-nums">
          {rank5050 !== null ? `Top ${100 - rank5050}%` : "..."}
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
            n: rankLuck6 !== null ? rankLuck6 : "...",
          })}
        </div>
      </div>
      <div class="text-right">
        <div class="text-2xl font-black text-gray-900 font-nums">
          {rankLuck6 !== null ? `Top ${100 - rankLuck6}%` : "..."}
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
          {$t("page.rating.luckyLessLuckierThan", { n: rankLuck5 || "..." })}
        </div>
      </div>
      <div class="text-right">
        <div class="text-2xl font-black text-[#21272C] font-nums">
          {$t("page.rating.luckyTopPercent", { n: rankLuck5 || "..." })}
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

<!-- src/lib/components/BannerModal.svelte -->
<script>
  import { createEventDispatcher, onMount } from "svelte";
  import { t } from "$lib/i18n";
  import { characters } from "$lib/data/characters";
  import { banners } from "$lib/data/banners";
  import { pullData } from "$lib/stores/pulls";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { replaceState } from "$app/navigation";
  import Icon from "$lib/components/Icons.svelte";
  import OperatorCard from "$lib/components/OperatorCard.svelte";
  import Tooltip from "$lib/components/Tooltip.svelte";
  import Images from "$lib/components/Images.svelte";

  // Входные данные: объект баннера
  export let banner = null;
  const dispatch = createEventDispatcher();

  onMount(() => {
    if (banner && typeof window !== "undefined") {
      replaceState(`#banner-${banner.id}`, {});
    }
  });

  function close() {
    if (typeof window !== "undefined" && window.location.hash) {
      replaceState(window.location.pathname + window.location.search, {});
    }
    dispatch("close");
  }

  // Находим полные данные персонажей по ID из списков featured6 и featured5
  $: featuredOperators = (() => {
    if (!banner) return [];
    const ids = [...(banner.featured6 || []), ...(banner.featured5 || [])];
    return ids.map((id) => characters[id]).filter(Boolean);
  })();

  // --- BANNER STATISTICS ---
  const normalize = (str) => str?.toLowerCase().replace(/\s+/g, "") || "";

  const charMap = Object.values(characters).reduce((acc, char) => {
    if (char.name) acc[normalize(char.name)] = char;
    acc[normalize(char.id)] = char;
    return acc;
  }, {});

  $: bannerData = (() => {
    if (!banner || !$pullData) return { total: 0, pulls: [] };

    // 1. Берем общую кучу круток по типу (например, 'special')
    const categoryData = $pullData[banner.type] || { pulls: [] };
    const allPullsInType = categoryData.pulls || [];

    // 2. Если это обычный баннер (standard), фильтрация не нужна
    if (banner.type === "standard") return categoryData;

    // 3. Для лимитированных баннеров фильтруем по времени
    const bannerStart = new Date(banner.startTime).getTime();
    const bannerEnd = banner.endTime
      ? new Date(banner.endTime).getTime()
      : Infinity;

    const filteredPulls = allPullsInType.filter((pull) => {
      const pullTime = new Date(pull.time).getTime();
      return pullTime >= bannerStart && pullTime <= bannerEnd;
    });

    return {
      total: filteredPulls.length,
      pulls: filteredPulls,
    };
  })();

  // Оставляем эти строки без изменений, они подхватят результат функции выше
  $: pulls = bannerData.pulls || [];
  $: total = bannerData.total || 0;

  $: isSpecialBanner = banner?.type === "special";
  $: featured6List = banner?.featured6 || [];
  $: featured5List = banner?.featured5 || [];

  // Count by rarity
  $: count6 = pulls.filter((p) => p.rarity === 6).length;
  $: count5 = pulls.filter((p) => p.rarity === 5).length;

  // Average Pity for 6*
  $: avgPity6 = (() => {
    if (count6 === 0) return 0;
    let pitySum = 0;
    let currentCounter = 0;
    for (const pull of pulls) {
      currentCounter++;
      if (pull.rarity === 6) {
        pitySum += currentCounter;
        currentCounter = 0;
      }
    }
    return (pitySum / count6).toFixed(1);
  })();

  // Average Pity for 5*
  $: avgPity5 = (() => {
    if (count5 === 0) return 0;
    let pitySum = 0;
    let currentCounter = 0;
    for (const pull of pulls) {
      currentCounter++;
      if (pull.rarity === 5) {
        pitySum += currentCounter;
        currentCounter = 0;
      }
    }
    return (pitySum / count5).toFixed(1);
  })();

  // 50/50 win rate for 6*
  $: winRate6 = (() => {
    if (count6 === 0) return { won: 0, total: 0, percent: 0 };

    let won = 0;
    let total = 0;
    let lastWasFeatured = true;

    for (const pull of pulls) {
      if (pull.rarity === 6) {
        const normName = normalize(pull.name);
        const isFeatured = featured6List.some((featuredId) => {
          const featuredChar = characters[featuredId];
          return featuredChar && normalize(featuredChar.name) === normName;
        });

        if (lastWasFeatured) {
          total++;
          if (isFeatured) won++;
        }

        lastWasFeatured = isFeatured;
      }
    }

    return {
      won,
      total,
      percent: total > 0 ? ((won / total) * 100).toFixed(0) : 0,
    };
  })();

  // 50/50 win rate for 5*
  $: winRate5 = (() => {
    if (count5 === 0) return { won: 0, total: 0, percent: 0 };

    let won = 0;
    let total = 0;
    let lastWasFeatured = true;

    for (const pull of pulls) {
      if (pull.rarity === 5) {
        const normName = normalize(pull.name);
        const isFeatured = featured5List.some((featuredId) => {
          const featuredChar = characters[featuredId];
          return featuredChar && normalize(featuredChar.name) === normName;
        });

        if (lastWasFeatured) {
          total++;
          if (isFeatured) won++;
        }

        lastWasFeatured = isFeatured;
      }
    }

    return {
      won,
      total,
      percent: total > 0 ? ((won / total) * 100).toFixed(0) : 0,
    };
  })();

  // Statistics table
  $: stats = [
    {
      label: "6",
      count: count6,
      percent: total > 0 ? ((count6 / total) * 100).toFixed(2) : "0.00",
      avg: avgPity6,
      winRate: winRate6,
    },
    {
      label: "5",
      count: count5,
      percent: total > 0 ? ((count5 / total) * 100).toFixed(2) : "0.00",
      avg: avgPity5,
      winRate: winRate5,
    },
  ];

  // Recent 6* characters
  $: icons = pulls
    .filter((p) => p.rarity === 6)
    .slice(0, 6)
    .map((p) => {
      const lookupKey = normalize(p.name);
      const charData = charMap[lookupKey];
      return {
        // We don't need 'src' here anymore because <Images> handles it,
        // but we MUST pass the ID.
        id: charData?.id || p.id || normalize(p.name),
        pity: p.pity || "?",
        name: p.name,
      };
    });

  function getPityColor(pity) {
    if (pity >= 1 && pity <= 20) return "#5DBE5A";
    if (pity > 20 && pity <= 30) return "#3CAF38";
    if (pity > 30 && pity <= 50) return "#D4AD3D";
    if (pity > 50 && pity <= 70) return "#C55E2F";
    if (pity > 70 && pity <= 80) return "#9A3404";
    return "#21272C";
  }

  // --- ЛОГИКА ДАТ (вычисляем при изменении banner) ---
  $: now = new Date();
  $: start = banner ? new Date(banner.startTime) : new Date();
  $: end = banner && banner.endTime ? new Date(banner.endTime) : null;
  $: isEnded = end && now > end;
  $: isActive = now >= start && (!end || now <= end);
  $: isUpcoming = now < start;

  // Форматирование времени
  const formatTime = (d) =>
    d.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  // Расчет дней/часов для таймера
  $: diff = (() => {
    if (!banner) return 0;
    if (!end && isActive) return now - start;
    if (isActive && end) return end - now;
    if (isEnded && end) return now - end;
    if (isUpcoming) return start - now;
    return 0;
  })();

  $: timeData = (() => {
    if (!diff) return { days: 0, hours: 0 };
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    };
  })();

  // Determine variant for Images component
  // If type is 'web' or 'ingame', it's an event -> check 'events' folder
  // Otherwise it's a banner -> check 'banners' folder
  $: imageVariant = (banner?.type === 'web' || banner?.type === 'ingame') 
      ? 'event-icon' 
      : 'banner-icon';
</script>

<!-- РАЗМЕТКА -->
{#if banner}
  <!-- Backdrop -->
  <div
    class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200"
    on:click|self={close}
    on:keydown={(e) => e.key === "Escape" && close()}
    role="presentation"
    tabindex="-1"
  >
    <!-- Content -->
    <div
      class="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative animate-in zoom-in-95 duration-200 flex flex-col"
    >
      <!-- Кнопка закрытия -->
      <button
        class="absolute top-3 right-3 z-20 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full transition-colors backdrop-blur-md"
        on:click={close}
      >
        <Icon name="close" class="w-5 h-5" />
      </button>

      <!-- Картинка -->
      <div class="aspect-[21/9] w-full relative bg-gray-100 group">
        <Images 
            item={banner} 
            variant={imageVariant} 
            className="w-full h-full transition-transform duration-700 group-hover:scale-105"
            alt={banner.name}
            style="object-fit: cover;"
        />
        <div
          class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"
        ></div>

        <div class="absolute bottom-0 left-0 right-0 p-5">
          <!-- Название -->
          <h3
            class="text-white font-bold text-2xl leading-tight drop-shadow-lg mb-1"
          >
            {banner.name ||
              (banner.title ? $t(banner.title) : null) ||
              $t(`banners.${banner.id}`) ||
              banner.id}
          </h3>

          <!-- Статус (Бейдж) -->
          <div
            class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md border border-white/10 shadow-sm
            {isActive ? 'bg-green-500/20 text-green-300' : ''}
            {isEnded ? 'bg-gray-500/40 text-gray-300' : ''}
            {isUpcoming ? 'bg-blue-500/20 text-blue-300' : ''}"
          >
            <span
              class="w-1.5 h-1.5 rounded-full {isActive
                ? 'bg-green-400 animate-pulse'
                : isEnded
                  ? 'bg-gray-400'
                  : 'bg-blue-400'}"
            ></span>
            {#if isActive}
              {$t("status.active") || "Active"}
            {:else if isEnded}
              {$t("status.ended") || "Ended"}
            {:else}
              {$t("status.upcoming") || "Upcoming"}
            {/if}
          </div>
        </div>
      </div>

      <!-- Инфо -->
      <div class="p-6 space-y-6">
        <!-- Даты и Таймер -->
        <div class="space-y-3">
          <!-- Даты -->
          <div class="flex justify-between items-start text-sm">
            <div class="flex flex-col gap-0.5">
              <span
                class="text-gray-400 text-xs font-bold uppercase tracking-wide"
                >{$t("systemNames.start") || "Start"}</span
              >
              <span class="font-nums font-medium text-gray-900"
                >{formatTime(start)}</span
              >
            </div>
            <div class="flex flex-col gap-0.5 text-right">
              <span
                class="text-gray-400 text-xs font-bold uppercase tracking-wide"
                >{$t("systemNames.end") || "End"}</span
              >
              <span class="font-nums font-medium text-gray-900">
                {end ? formatTime(end) : "∞"}
              </span>
            </div>
          </div>

          <!-- Таймер / Итог -->
          <div
            class="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center"
          >
            {#if !end}
              <!-- Бесконечный баннер -->
              <div class="text-gray-500 text-xs mb-0.5">
                {$t("systemNames.status")}
              </div>
              <div
                class="text-blue-600 font-bold font-nums text-lg leading-none"
              >
                <!-- Было: "Ongoing ({timeData.days} days active)" -->
                <!-- Стало: передаем только число n -->
                {$t("timer.ongoing_active", { n: timeData.days })}
              </div>
            {:else if isActive}
              <!-- Активный -->
              <div class="text-gray-500 text-xs mb-0.5">
                {$t("systemNames.timeRemaining")}
              </div>
              <div
                class="text-green-600 font-bold font-nums text-lg leading-none"
              >
                <!-- Было: куча проверок на буквы -->
                <!-- Стало: передаем дни (d) и часы (h) -->
                {$t("timer.left_d_h", { d: timeData.days, h: timeData.hours })}
              </div>
            {:else if isEnded}
              <!-- Завершенный -->
              <div class="text-gray-500 text-xs mb-0.5">
                {$t("status.ended") || "Ended"}
              </div>
              <div
                class="text-gray-400 font-bold font-nums text-base leading-none"
              >
                {#if timeData.days > 0}
                  {$t("timer.days_ago", { n: timeData.days })}
                {:else if timeData.hours > 0}
                  {$t("timer.hours_ago", { n: timeData.hours })}
                {:else}
                  {$t("timer.just_now")}
                {/if}
              </div>
            {:else if isUpcoming}
              <!-- Будущий -->
              <div class="text-gray-500 text-xs mb-0.5">
                {$t("systemNames.startsIn")}
              </div>
              <div
                class="text-blue-600 font-bold font-nums text-lg leading-none"
              >
                {#if timeData.days > 0}
                  {$t("timer.starts_in_d_h", {
                    d: timeData.days,
                    h: timeData.hours,
                  })}
                {:else if timeData.hours > 0}
                  {$t("timer.starts_in_hours", { n: timeData.hours })}
                {:else}
                  {$t("timer.starts_soon")}
                {/if}
              </div>
            {/if}
          </div>
        </div>

        <!-- Ссылка на источник -->
        {#if banner.url}
          <a
            href={banner.url}
            target="_blank"
            rel="noopener noreferrer"
            class="group flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 hover:border-[#D0926E] hover:bg-[#fff9f5] transition-all duration-200"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-[#D0926E]/10 flex items-center justify-center text-gray-500 group-hover:text-[#D0926E] transition-colors"
              >
                <Icon name="sendToLink" class="w-4 h-4" />
              </div>
              <div class="flex flex-col">
                <span
                  class="font-bold text-sm text-gray-900 group-hover:text-[#D0926E] transition-colors"
                >
                  {$t("page.openOfficialSource") || "Official Announcement"}
                </span>
                <span class="text-xs text-gray-400">
                  {$t("page.detailsOfficialSource") ||
                    "View details on official site"}
                </span>
              </div>
            </div>
            <Icon
              name="arrow-right"
              class="w-4 h-4 text-gray-300 group-hover:text-[#D0926E] -translate-x-1 group-hover:translate-x-0 transition-all"
            />
          </a>
        {/if}

        <!-- Featured Characters -->
        {#if featuredOperators.length > 0}
          <div class="space-y-3">
            <div class="flex items-center gap-2">
              <span
                class="text-gray-400 text-[10px] font-bold uppercase tracking-widest"
              >
                {$t("systemNames.featuredCharacters") || "Featured"}
              </span>
              <div class="h-px flex-1 bg-gray-100"></div>
            </div>

            <div class="flex flex-wrap gap-2 justify-center">
              {#each featuredOperators as op}
                <div
                  class="w-[90px] h-[90px] overflow-hidden rounded-lg border border-gray-100 shadow-sm relative group cursor-pointer"
                >
                  <div class="scale-[0.6] w-[80px] origin-top-left">
                    <OperatorCard operator={op} />
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {/if}

        <!-- BANNER STATISTICS -->
        {#if total > 0}
          <div class="space-y-4">
            <div class="flex items-center gap-2">
              <span
                class="text-gray-400 text-[10px] font-bold uppercase tracking-widest"
              >
                {$t("page.banner.stats") || "Statistics"}
              </span>
              <div class="h-px flex-1 bg-gray-100"></div>
            </div>

            <!-- Stats Table -->
            <div>
              <!-- Table header -->
              <div
                class="grid grid-cols-4 text-xs text-gray-500 mb-1 font-medium"
              >
                <div>{$t("page.banner.rarity")}</div>
                <div class="text-right">{$t("page.banner.count")}</div>
                <div class="text-right">{$t("page.banner.percent")}</div>
                <div class="text-right">{$t("page.banner.avg")}</div>
              </div>

              <!-- Table rows -->
              {#each stats as row}
                <div class="border-b border-gray-50 last:border-0">
                  <!-- Main row -->
                  <div class="grid grid-cols-4 text-sm items-center py-1">
                    <div
                      class="font-bold text-gray-700 flex items-center gap-1 font-nums"
                    >
                      {row.label}
                      <Icon name="star" class="w-4 h-4" />
                    </div>
                    <div class="text-right font-bold font-nums text-[#21272C]">
                      {row.count}
                    </div>
                    <div class="text-right text-gray-600 font-nums">
                      {row.percent}%
                    </div>
                    <div class="text-right font-bold font-nums text-[#1D6F42]">
                      {row.avg}
                    </div>
                  </div>

                  <!-- Win rate sub-row (only for special banners) -->
                  {#if isSpecialBanner && row.winRate.total > 0}
                    <div class="grid grid-cols-4 text-sm items-center py-1">
                      <div class="text-gray-600 text-xs pl-6">
                        {$t("page.banner.won5050")}
                      </div>
                      <div class="text-right font-nums text-[#21272C]">
                        {row.winRate.won}
                      </div>
                      <div class="text-right text-gray-600 font-nums">
                        {row.winRate.percent}%
                      </div>
                      <div class="text-right"></div>
                    </div>
                  {/if}
                </div>
              {/each}
            </div>

            <!-- Pulled 6* operators -->
            {#if icons.length > 0}
              <div class="space-y-2">
                <h4
                  class="text-xs font-bold text-[#21272C] flex items-center gap-1"
                >
                  <span>{$t("page.banner.pulled")}</span>
                  <span>6</span>
                  <Icon name="star" class="w-3 h-3" />
                  <span>{$t("page.banner.operators")}</span>
                </h4>

                <div class="flex flex-wrap gap-2">
                  {#each icons as icon}
                    <Tooltip
                      text={$t(
                        `characters.${charMap[normalize(icon.name)]?.id || normalize(icon.name)}`,
                      ) || icon.name}
                    >
                      <div
                        class="relative w-12 h-12 rounded-full bg-gray-100 border-2 border-[#D0926E]
                           hover:scale-110 transition-transform cursor-pointer shadow-sm"
                      >
                        <div class="w-full h-full overflow-hidden rounded-full">
                          <Images
                            id={icon.id}
                            variant="operator-icon"
                            size="100%"
                            alt={icon.name}
                          />
                        </div>

                        <!-- Pity badge -->
                        <div
                          class="absolute -bottom-1 -right-1 min-w-7 px-2 py-1 rounded font-nums leading-none font-bold shadow-lg pointer-events-none"
                          style="font-size: 0.85rem; min-width: 1.7rem;"
                        >
                          <div
                            class="absolute inset-0 rounded opacity-75"
                            style="background-color: {getPityColor(icon.pity)};"
                          ></div>
                          <span class="relative text-white z-10"
                            >{icon.pity}</span
                          >
                        </div>
                      </div>
                    </Tooltip>
                  {/each}
                </div>
              </div>
            {/if}
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

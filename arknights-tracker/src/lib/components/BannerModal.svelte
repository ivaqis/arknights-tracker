<script>
  import { createEventDispatcher, onMount } from "svelte";
  import { t } from "$lib/i18n";
  import { pullData } from "$lib/stores/pulls";
  import { replaceState } from "$app/navigation";
  
  import Icon from "$lib/components/Icons.svelte";
  import OperatorCard from "$lib/components/OperatorCard.svelte";
  import Images from "$lib/components/Images.svelte";
  import BannerStats from "$lib/components/BannerStats.svelte"; 
  import { characters } from "$lib/data/characters";

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

  $: imageVariant = (banner?.type === 'web' || banner?.type === 'ingame') 
      ? 'event-icon' 
      : 'banner-icon';

  const normalize = (str) => str?.toLowerCase().replace(/\s+/g, "") || "";
  const charMap = Object.values(characters).reduce((acc, char) => {
    if (char.name) acc[normalize(char.name)] = char;
    acc[normalize(char.id)] = char;
    return acc;
  }, {});

  // --- Featured Characters ---
  $: featuredOperators = (() => {
    if (!banner) return [];
    const ids = [...(banner.featured6 || []), ...(banner.featured5 || [])];
    return ids.map((id) => characters[id]).filter(Boolean);
  })();

  // --- ГЛАВНЫЙ РАСЧЕТ ДАННЫХ ---
  $: bannerPulls = (() => {
    if (!banner || !$pullData) return [];
    
    // 1. Берем ВСЕ крутки этого типа (Global History)
    const categoryData = $pullData[banner.type] || { pulls: [] };
    const allPullsInType = [...categoryData.pulls];

    // 2. Сортируем (Старые -> Новые)
    allPullsInType.sort((a, b) => new Date(a.time) - new Date(b.time));

    // 3. Расчет Pity и Free
    let p6 = 0;
    let p5 = 0;
    let bannerCounts = {}; 

    // Используем даты текущего баннера для определения "свой/чужой" при проходе истории
    const bStart = new Date(banner.startTime).getTime();
    const bEnd = banner.endTime ? new Date(banner.endTime).getTime() : Infinity;

    const processed = allPullsInType.map(pull => {
        const p = { ...pull };
        
        // Определяем, относится ли крутка к ЭТОМУ баннеру (для подсчета Free 30-40)
        const pTime = new Date(p.time).getTime();
        const isTargetBanner = (pTime >= bStart && pTime <= bEnd);
        
        // Счетчик для конкретного bannerId (упрощенно по датам)
        // Если крутка попадает в диапазон баннера, считаем её частью его истории Free
        let currentBid = isTargetBanner ? banner.id : "other"; 
        
        if (!bannerCounts[currentBid]) bannerCounts[currentBid] = 0;
        
        let isFree = false;
        // Логика Free: Только Special, только внутри дат этого баннера, с 31 по 40 крутку
        if (banner.type === "special" && isTargetBanner) {
             if (bannerCounts[currentBid] >= 30 && bannerCounts[currentBid] < 40) {
                 isFree = true;
             }
             bannerCounts[currentBid]++;
        }
        p.isFree = isFree;

        // Логика Pity
        if (!isFree) {
            if (p.rarity === 6) {
                p.realPity = p6 + 1;
                p6 = 0;
                // [FIX] Сбрасываем 5* при выпадении 6*, чтобы среднее значение 5* было корректным (<10)
                // Это соответствует механике "Гарантированный 5* или ВЫШЕ за 10 круток"
                p5 = 0; 
            } else if (p.rarity === 5) {
                p.realPity = p5 + 1;
                p5 = 0;
                p6++;
            } else {
                p6++;
                p5++;
                p.realPity = 1; 
            }
        } else {
            p.realPity = null; // Free крутки не имеют Pity
        }

        return p;
    });

    // 4. Фильтруем и отдаем только крутки ТЕКУЩЕГО баннера
    return processed.filter((pull) => {
      const pullTime = new Date(pull.time).getTime();
      return pullTime >= bStart && pullTime <= bEnd;
    });
  })();

  // --- Таймеры ---
  $: now = new Date();
  $: start = banner ? new Date(banner.startTime) : new Date();
  $: end = banner && banner.endTime ? new Date(banner.endTime) : null;
  $: isEnded = end && now > end;
  $: isActive = now >= start && (!end || now <= end);
  $: isUpcoming = now < start;
  const formatTime = (d) => d.toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  $: diff = (() => {
    if (!banner) return 0;
    if (!end && isActive) return now - start;
    if (isActive && end) return end - now;
    if (isEnded && end) return now - end;
    if (isUpcoming) return start - now;
    return 0;
  })();
  $: timeData = diff ? { days: Math.floor(diff / (86400000)), hours: Math.floor((diff / 3600000) % 24) } : { days: 0, hours: 0 };
</script>

{#if banner}
  <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200 cursor-default" role="button" tabindex="0" on:click|self={close} on:keydown={(e) => (e.key === 'Escape' || e.key === 'Enter') && close()}>
    <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative animate-in zoom-in-95 duration-200 flex flex-col cursor-auto">
      <button class="absolute top-3 right-3 z-20 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full transition-colors backdrop-blur-md cursor-pointer" on:click={close}>
        <Icon name="close" class="w-5 h-5" />
      </button>

      <div class="aspect-[21/9] w-full relative bg-gray-100">
        <Images item={banner} variant={imageVariant} className="w-full h-full" alt={banner.name} style="object-fit: cover;" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
        <div class="absolute bottom-0 left-0 right-0 p-5">
          <h3 class="text-white font-bold text-2xl leading-tight drop-shadow-lg mb-1">
            {banner.name || (banner.title ? $t(banner.title) : null) || $t(`banners.${banner.id}`) || banner.id}
          </h3>
          <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md border border-white/10 shadow-sm {isActive ? 'bg-green-500/20 text-green-300' : ''} {isEnded ? 'bg-gray-500/40 text-gray-300' : ''} {isUpcoming ? 'bg-blue-500/20 text-blue-300' : ''}">
            <span class="w-1.5 h-1.5 rounded-full {isActive ? 'bg-green-400 animate-pulse' : isEnded ? 'bg-gray-400' : 'bg-blue-400'}"></span>
            {#if isActive}{$t("status.active") || "Active"}{:else if isEnded}{$t("status.ended") || "Ended"}{:else}{$t("status.upcoming") || "Upcoming"}{/if}
          </div>
        </div>
      </div>

      <div class="p-6 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
        
        <div class="space-y-3">
            <div class="flex justify-between items-start text-sm">
                <div class="flex flex-col gap-0.5">
                    <span class="text-gray-400 text-xs font-bold uppercase tracking-wide">{$t("systemNames.start")}</span>
                    <span class="font-nums font-medium text-gray-900">{formatTime(start)}</span>
                </div>
                <div class="flex flex-col gap-0.5 text-right">
                    <span class="text-gray-400 text-xs font-bold uppercase tracking-wide">{$t("systemNames.end")}</span>
                    <span class="font-nums font-medium text-gray-900">{end ? formatTime(end) : "∞"}</span>
                </div>
            </div>
            
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
        {#if featuredOperators.length > 0}
            <div class="space-y-3">
                <div class="flex items-center gap-2">
                    <span class="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{$t("systemNames.featuredCharacters")}</span>
                    <div class="h-px flex-1 bg-gray-100"></div>
                </div>
                <div class="flex flex-wrap gap-2 justify-center">
                    {#each featuredOperators as op}
                        <div class="w-[90px] h-[90px] rounded-lg border border-gray-100 shadow-sm relative overflow-hidden group cursor-pointer">
                            <div class="scale-[0.6] w-[80px] origin-top-left">
                                <OperatorCard operator={op} />
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        {/if}

        {#if bannerPulls.length > 0}
            <BannerStats pulls={bannerPulls} {banner} />
        {/if}

      </div>
    </div>
  </div>
{/if}
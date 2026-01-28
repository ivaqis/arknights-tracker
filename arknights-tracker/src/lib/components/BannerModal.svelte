<script>
  import { createEventDispatcher, onMount } from "svelte";
  import { t } from "$lib/i18n";
  import { pullData } from "$lib/stores/pulls";
  import { replaceState } from "$app/navigation";
  import { characters } from "$lib/data/characters";
  import { weapons } from "$lib/data/weapons";
  
  import Icon from "$lib/components/Icons.svelte";
  import OperatorCard from "$lib/components/OperatorCard.svelte";
  import Images from "$lib/components/Images.svelte";
  import BannerStats from "$lib/components/BannerStats.svelte";

  export let banner = null;
  export let pageContext = null; 

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

  // 1. Определение типа картинки (Ивент или Баннер)
  $: isEvent = 
      banner?.type === 'web' || 
      banner?.type === 'ingame' || 
      banner?.originalType === 'ingame' || 
      banner?.originalType === 'web' ||
      (typeof banner?.id === 'string' && banner?.id.startsWith('ev'));

  $: imageVariant = isEvent ? 'event-icon' : 'banner-icon';

  // 2. Определение, является ли баннер оружейным
  $: isWeaponBanner = 
      banner?.type === 'weapon' || 
      banner?.originalType === 'weapon' || 
      banner?.id?.includes('weap') || 
      banner?.id?.includes('wepon');

  const itemMap = { ...characters, ...weapons };
  
  // 3. Featured предметы
  $: featuredItems = (() => {
    if (!banner) return [];
    const ids = [...(banner.featured6 || []), ...(banner.featured5 || [])];
    return ids.map((id) => {
        const item = itemMap[id];
        if (!item) return null;
        return { ...item, isWeapon: !!weapons[id] };
    }).filter(Boolean);
  })();

  // [FIXED] Финальная версия поиска данных
  $: bannerPulls = (() => {
    if (!banner || !$pullData) return [];
    
    // 1. Если это Ивент — статистики нет
    if (isEvent) return [];

    // 2. Собираем ключи для поиска
    let possibleKeys = [];

    // А. Самый главный приоритет: Ищем данные прямо по ID баннера
    // (Это решит твою проблему, так как в базе есть ключ 'weponbox_1_0_1')
    if (banner.id) possibleKeys.push(banner.id);
    
    // Б. Контекст страницы
    if (pageContext) possibleKeys.push(pageContext);

    // В. Если баннер Оружейный, добавляем варианты категорий
    if (isWeaponBanner) {
        possibleKeys.push('weap-standard'); 
        possibleKeys.push('weapon');        
        possibleKeys.push('wepon');         
    } else {
        // Г. Для остальных типов
        if (banner.originalType) possibleKeys.push(banner.originalType);
        if (banner.type) possibleKeys.push(banner.type);
        
        // Fallback на стандарт
        possibleKeys.push('standard'); 
    }

    // Убираем дубликаты
    possibleKeys = [...new Set(possibleKeys)];

    // 3. Ищем данные
    let allPullsInType = [];

    for (const key of possibleKeys) {
        if (key === 'banner') continue; 

        const data = $pullData[key];
        if (data && Array.isArray(data.pulls) && data.pulls.length > 0) {
            allPullsInType = [...data.pulls];
            break; // Нашли данные — выходим
        }
    }

    if (allPullsInType.length === 0) return [];

    // 4. Обработка статистики (Pity, Win/Loss)
    allPullsInType.sort((a, b) => new Date(a.time) - new Date(b.time));

    let p6 = 0;
    let p5 = 0;
    let bannerCounts = {}; 

    const bStart = new Date(banner.startTime).getTime();
    const bEnd = banner.endTime ? new Date(banner.endTime).getTime() : Infinity;

    const processed = allPullsInType.map(pull => {
        const p = { ...pull };
        const pTime = new Date(p.time).getTime();
        const isTargetBanner = (pTime >= bStart && pTime <= bEnd);
        
        let currentBid = isTargetBanner ? banner.id : "other"; 
        if (!bannerCounts[currentBid]) bannerCounts[currentBid] = 0;
        
        let isFree = false;
        if (banner.type === "special" && isTargetBanner) {
             if (bannerCounts[currentBid] >= 30 && bannerCounts[currentBid] < 40) {
                 isFree = true;
             }
             bannerCounts[currentBid]++;
        }
        p.isFree = isFree;

        if (!isFree) {
            if (p.rarity === 6) {
                p.realPity = p6 + 1;
                p6 = 0;
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
            p.realPity = null; 
        }
        return p;
    });

    return processed.filter((pull) => {
      const pullTime = new Date(pull.time).getTime();
      return pullTime >= bStart && pullTime <= bEnd;
    });
  })();

  // Таймеры
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

  function getWeaponBg(rarity) {
        if (rarity === 6) return "bg-gradient-to-t from-[#591C00] to-[#BD896E]"; 
        if (rarity === 5) return "bg-gradient-to-t from-[#261E00] to-[#E3BC55]";
        return "bg-gradient-to-t from-[#1a1a1a] to-[#666666]";
  }
  function getRarityColor(rarity) {
        if (rarity === 6) return "#D0926E";
        if (rarity === 5) return "#E3BC55";
        return "#888";
  }
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
            {$t(`banners.${banner.id}`) !== `banners.${banner.id}` 
                ? $t(`banners.${banner.id}`) 
                : (banner.name || banner.id)
            }
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
            
            <div class="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
                 {#if !end}
                      <div class="text-gray-500 text-xs mb-0.5">{$t("systemNames.status")}</div>
                      <div class="text-blue-600 font-bold font-nums text-lg leading-none">{$t("timer.ongoing_active", { n: timeData.days })}</div>
                 {:else if isActive}
                      <div class="text-gray-500 text-xs mb-0.5">{$t("systemNames.timeRemaining")}</div>
                      <div class="text-green-600 font-bold font-nums text-lg leading-none">{$t("timer.left_d_h", { d: timeData.days, h: timeData.hours })}</div>
                 {:else if isEnded}
                      <div class="text-gray-500 text-xs mb-0.5">{$t("status.ended") || "Ended"}</div>
                      <div class="text-gray-400 font-bold font-nums text-base leading-none">{$t("timer.days_ago", { n: timeData.days })}</div>
                 {:else if isUpcoming}
                      <div class="text-gray-500 text-xs mb-0.5">{$t("systemNames.startsIn")}</div>
                      <div class="text-blue-600 font-bold font-nums text-lg leading-none">{$t("timer.starts_soon")}</div>
                 {/if}
            </div>
        </div>

        {#if banner.url}
             <a href={banner.url} target="_blank" rel="noopener noreferrer" class="group flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 hover:border-[#D0926E] hover:bg-[#fff9f5] transition-all duration-200">
                <div class="flex items-center gap-3">
                   <div class="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-[#D0926E]/10 flex items-center justify-center text-gray-500 group-hover:text-[#D0926E] transition-colors"><Icon name="sendToLink" class="w-4 h-4" /></div>
                   <div class="flex flex-col">
                       <span class="font-bold text-sm text-gray-900 group-hover:text-[#D0926E] transition-colors">{$t("page.openOfficialSource")}</span>
                       <span class="text-xs text-gray-400">{$t("page.detailsOfficialSource")}</span>
                   </div>
                </div>
                <Icon name="arrow-right" class="w-4 h-4 text-gray-300 group-hover:text-[#D0926E] -translate-x-1 group-hover:translate-x-0 transition-all" />
             </a>
        {/if}

        {#if featuredItems.length > 0}
            <div class="space-y-3">
                <div class="flex items-center gap-2">
                    <span class="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                        {#if isWeaponBanner}
                             {$t("page.banner.featuredWeapons") || "Featured Weapons"}
                        {:else}
                             {$t("systemNames.featuredCharacters")}
                        {/if}
                    </span>
                    <div class="h-px flex-1 bg-gray-100"></div>
                </div>
                
                <div class="flex flex-wrap gap-2 justify-center">
                    {#each featuredItems as item}
                        {#if item.isWeapon}
                            <div class="w-[90px] h-[90px] flex items-center justify-center relative group cursor-pointer" title={item.name}>
                                <div 
                                    class="w-[70px] h-[70px] rounded-full overflow-hidden border-2 shadow-sm relative 
                                    {getWeaponBg(item.rarity)}" 
                                    style="border-color: {getRarityColor(item.rarity)}"
                                >
                                    <Images 
                                        id={item.id} 
                                        variant="weapon-icon" 
                                        alt={item.name} 
                                        className="w-full h-full object-cover transform scale-[1.3]" 
                                    />
                                </div>
                                <div class="absolute -bottom-2 text-[10px] font-bold bg-white/90 px-2 py-0.5 rounded shadow-sm text-gray-600 border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                    {item.name}
                                </div>
                            </div>
                        {:else}
                            <div class="w-[90px] h-[90px] rounded-lg border border-gray-100 shadow-sm relative overflow-hidden group cursor-pointer">
                                <div class="scale-[0.6] w-[80px] origin-top-left">
                                    <OperatorCard operator={item} />
                                </div>
                            </div>
                        {/if}
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
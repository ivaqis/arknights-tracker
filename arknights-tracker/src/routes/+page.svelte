<script>
  import { onMount, onDestroy } from "svelte";
  import { t } from "$lib/i18n";
  import { currentLocale } from "$lib/stores/locale";
  import { goto } from "$app/navigation";
  import { banners } from "$lib/data/banners.js";
  import { promocodes } from "$lib/data/promocodes.js";
  import { currencies } from "$lib/data/items/currencies";
  import { progression } from "$lib/data/items/progression";
  import { fade } from "svelte/transition";

  import Icon from "$lib/components/Icons.svelte";
  import Images from "$lib/components/Images.svelte";
  import Button from "$lib/components/Button.svelte";
  import BannerModal from "$lib/components/BannerModal.svelte";
  import Tooltip from "$lib/components/Tooltip.svelte";

  let now = new Date();
  let timer;
  let currentServerId = "3";

  const allItems = [...currencies, ...progression];

  function parseWithServerOffset(dateStr) {
    if (!dateStr) return new Date(9999, 11, 31); 

    if (dateStr.includes("Z") || (dateStr.includes("T") && dateStr.includes("+"))) {
        return new Date(dateStr);
    }

    const offset = currentServerId === "2" ? 8 : -5;
    const sign = offset >= 0 ? "+" : "-";
    const pad = (n) => String(Math.abs(n)).padStart(2, '0');
    const iso = dateStr.replace(" ", "T") + `${sign}${pad(offset)}:00`;
    return new Date(iso);
  }

  function formatTimeLeft(endTimeStr) {
      const end = parseWithServerOffset(endTimeStr);
      const diff = end - now;
      
      if (diff <= 0) return null;

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) return $t("timer.left_d_h", { d: days, h: hours });
      if (hours > 0) return $t("timer.left_h_m", { h: hours, m: minutes });
      return $t("timer.left_m", { m: minutes });
  }

  function getRarityStyle(id) {
    const item = allItems.find((i) => i.id === id);
    const rarity = item?.rarity || 3;
    switch (rarity) {
      case 5: case 6: return "bg-amber-50 border-amber-300 text-amber-800 hover:border-amber-500 dark:bg-amber-900/40 dark:border-amber-700 dark:text-amber-200 dark:hover:border-amber-400";
      case 4: return "bg-purple-50 border-purple-300 text-purple-800 hover:border-purple-500 dark:bg-purple-900/40 dark:border-purple-700 dark:text-purple-200 dark:hover:border-purple-400";
      case 3: return "bg-blue-50 border-blue-300 text-blue-800 hover:border-blue-500 dark:bg-blue-900/40 dark:border-blue-700 dark:text-blue-200 dark:hover:border-blue-400";
      default: return "bg-gray-100 border-gray-300 text-gray-700 hover:border-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-400";
    }
  }

  $: activeBanners = banners
    .filter((b) => {
      const _ = currentServerId;
      const start = parseWithServerOffset(b.startTime);
      const end = b.endTime ? parseWithServerOffset(b.endTime) : new Date(9999, 11, 31);
      
      const isTime = now >= start && now <= end;
      return isTime && b.showOnMain === true;
    })
    .sort((a, b) => {
      const priority = { special: 1, weapon: 2 };
      return (priority[a.type] || 99) - (priority[b.type] || 99);
    });

  let currentBannerIndex = 0;
  let bannerInterval;

  function startBannerRotation() {
    if (activeBanners.length <= 1) return;
    stopBannerRotation();
    bannerInterval = setInterval(() => {
      currentBannerIndex = (currentBannerIndex + 1) % activeBanners.length;
    }, 5000);
  }

  function stopBannerRotation() {
    if (bannerInterval) clearInterval(bannerInterval);
  }

  function setBanner(index) {
    currentBannerIndex = index;
    stopBannerRotation();
    startBannerRotation();
  }

  let selectedBanner = null;

  $: currentBannerTimeLeft = (() => {
    const b = activeBanners[currentBannerIndex];
    if (!b || !b.endTime) return "";
    return formatTimeLeft(b.endTime) || ""; 
  })();

  $: activePromocodes = (() => {
      const _ = currentServerId;
      return promocodes.filter((p) => {
        const end = parseWithServerOffset(p.endTime);
        return now <= end;
      });
  })();

function getFormattedDate(dateStr) {
    const end = parseWithServerOffset(dateStr);
    const dateOptions = { month: "short", day: "numeric" };
    return end.toLocaleDateString($currentLocale, dateOptions);
  }

  function getPromoTimeLabel(dateStr) {
      const text = formatTimeLeft(dateStr);
      if (!text) return "";
      return `(${text})`;
  }

  function sortRewards(rewards) {
    return [...rewards].sort((a, b) => {
      const itemA = allItems.find((i) => i.id === a.id);
      const itemB = allItems.find((i) => i.id === b.id);
      const rarityA = itemA?.rarity || 0;
      const rarityB = itemB?.rarity || 0;
      if (rarityB !== rarityA) return rarityB - rarityA;
      return b.count - a.count;
    });
  }

  let copiedCode = null;
  async function copyCode(code) {
    try {
      await navigator.clipboard.writeText(code);
      copiedCode = code;
      setTimeout(() => (copiedCode = null), 2000);
    } catch (err) { console.error(err); }
  }

  onMount(() => {
    if (typeof localStorage !== 'undefined') {
        const savedServer = localStorage.getItem("ark_server_id");
        if (savedServer) currentServerId = savedServer;
    }
    timer = setInterval(() => { now = new Date(); }, 1000 * 60);
    startBannerRotation();
  });

  onDestroy(() => {
    clearInterval(timer);
    clearInterval(bannerInterval);
  });
</script>

<div
  class="min-h-screen w-full relative flex flex-col items-center py-10 px-4 sm:px-8 font-sans text-[#21272C] dark:text-[#FDFDFD]"
>
  <div class="fixed inset-0 -z-10 bg-[#F5F5F7] dark:bg-[#2C2C2C]">
    <div
      class="absolute inset-0 bg-[url('/images/ui/grid_pattern.png')] opacity-[0.03]"
    ></div>
  </div>

  <div class="mb-12 transition-opacity hover:opacity-80">
    <Icon name="siteLogo2" className="h-16 w-auto" />
  </div>

  <div class="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
    <div
      class="lg:col-span-5 bg-white/80 dark:bg-[#383838]/80 backdrop-blur-md rounded-xl shadow-sm border border-gray-100 dark:border-[#444444] overflow-hidden flex flex-col h-full max-h-[500px]"
    >
      <div
        class="flex items-center gap-2 bg-white border-b border-gray-200 dark:border-[#444444] dark:bg-[#424242] py-3 px-4 text-xs font-bold text-gray-700 dark:text-[#FDFDFD]"
      >
        <div class="w-1/3">{$t("home.promocodes")}</div>
        <div class="flex-1">{$t("home.rewards")}</div>
        <div class="w-auto text-right whitespace-nowrap">{$t("home.duration")}</div>
      </div>

      <div class="overflow-y-auto custom-scrollbar flex-1 p-2">
        {#if activePromocodes.length === 0}
          <div class="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-[#7A7A7A]">
            <div class="mb-3 opacity-60">
                <Icon name="noData" className="w-10 h-10" />
            </div>
            
            <div class="text-sm font-medium">
                {$t("home.noActiveCodes")}
            </div>
          </div>
        {:else}
          {#each activePromocodes as promo}
            <div
              class="flex items-center gap-2 py-3 px-2 border-gray-100 dark:border-[#444444] last:border-0 hover:bg-gray-50 hover:dark:bg-[#343434] transition-colors rounded-lg group"
            >
              <div class="w-1/3 pr-2 min-w-0">
                <div class="flex items-center gap-2">
                  <div class="min-w-0 shrink-1 truncate">
                    {#if promo.url}
                      <a
                        href={promo.url}
                        target="_blank"
                        class="block font-mono font-bold text-[#21272C] hover:text-[#FACC15] transition-colors truncate underline decoration-gray-300 underline-offset-2 hover:decoration-[#FACC15]"
                        title="Open Link"
                      >
                        {promo.code}
                      </a>
                    {:else}
                      <span
                        class="block font-mono font-bold text-[#21272C] dark:text-[#FDFDFD] truncate select-all"
                      >
                        {promo.code}
                      </span>
                    {/if}
                  </div>

                  <button
                    on:click={() => copyCode(promo.code)}
                    class="flex items-center justify-center p-1.5 rounded-md hover:bg-gray-200 hover:dark:bg-[#373737] text-gray-400 hover:text-[#21272C] hover:dark:text-[#B7B6B3] transition-colors shrink-0"
                  >
                    {#if copiedCode === promo.code}
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#FACC15"
                        stroke-width="3"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="text-green-500"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    {:else}
                      <Icon name="copy" className="w-3.5 h-3.5" />
                    {/if}
                  </button>

                  {#if promo.condition}
                    <Tooltip text={$t(promo.condition)}>
                      <div
                        class="text-[#FACC15] hover:text-yellow-600 transition-colors flex items-center justify-center p-1"
                      >
                        <Icon name="info" className="w-3 h-3" />
                      </div>
                    </Tooltip>
                  {/if}
                </div>
              </div>

              <div class="flex-1 flex flex-wrap gap-2 items-center min-w-0">
                {#each sortRewards(promo.rewards) as reward}
                  <Tooltip text={$t(`items.${reward.id}`)}>
                    <div
                      class="flex items-center rounded-full px-2 py-0.5 border transition-colors {getRarityStyle(
                        reward.id,
                      )}"
                    >
                      <span class="text-xs font-bold mr-1">
                        {reward.count}
                      </span>

                      <Images
                        id={reward.id}
                        variant="item"
                        size={20}
                        className="object-contain"
                      />
                    </div>
                  </Tooltip>
                {/each}
              </div>

              <div class="w-auto text-right shrink-0 pl-2 flex flex-col justify-center">
                <span class="text-xs font-bold text-gray-700 dark:text-[#E0E0E0] whitespace-nowrap leading-tight">
                  {$t("home.until")} {getFormattedDate(promo.endTime)}
                </span>
                <span class="text-[10px] font-medium text-gray-400 dark:text-[#9CA3AF] whitespace-nowrap leading-tight">
                  {getPromoTimeLabel(promo.endTime)}
                </span>
              </div>
            </div>
          {/each}
        {/if}
      </div>
    </div>

    <div class="lg:col-span-7 flex flex-col gap-4">
      <div class="flex items-center justify-between px-1">
        <h2 class="text-lg font-bold text-[#21272C] dark:text-[#FDFDFD] flex items-center gap-2">
          <span class="w-2 h-2 bg-[#FACC15] rounded-full"></span>
          {$t("home.current_banners")}
        </h2>

        <div class="flex gap-2">
          {#each activeBanners as _, i}
            <button
              aria-label="Switch to banner {i + 1}"
              on:click={() => setBanner(i)}
              class="w-8 h-1 rounded-full transition-all duration-300 {currentBannerIndex ===
              i
                ? 'bg-[#21272C] dark:bg-[#FDFDFD]'
                : 'bg-gray-300 hover:bg-gray-400 dark:bg-[#1E1E1E] '}"
            ></button>
          {/each}
        </div>
      </div>

      <div
        role="button"
        tabindex="0"
        class="relative w-full aspect-[21/9] bg-gray-200 rounded-xl overflow-hidden shadow-2xl group cursor-pointer border border-white/50 dark:border-[#444444] outline-none focus:ring-4 focus:ring-[#FACC15] select-none"
        on:click={() => (selectedBanner = activeBanners[currentBannerIndex])}
        on:keydown={(e) =>
          (e.key === "Enter" || e.key === " ") &&
          (selectedBanner = activeBanners[currentBannerIndex])}
        
        on:mouseenter={stopBannerRotation} 
        on:mouseleave={startBannerRotation}
      >
        {#if activeBanners.length > 0}
          {#key currentBannerIndex}
          <div 
            class="absolute inset-0"
            in:fade={{ duration: 200 }} 
            out:fade={{ duration: 200 }}
          >
            <Images
              id={activeBanners[currentBannerIndex].icon}
              variant="banner-icon"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity pointer-events-none"
            ></div>

            {#if currentBannerTimeLeft}
                <div class="absolute bottom-3 left-3 sm:bottom-5 sm:left-5 z-20 pointer-events-none">
                    <div class="inline-flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md border border-white/20 rounded-full shadow-lg">
                        <span class="w-1.5 h-1.5 rounded-full bg-[#FACC15] animate-pulse"></span>
                        <span class="text-xs font-bold text-white font-nums tracking-wide leading-none drop-shadow-md">
                            {currentBannerTimeLeft}
                        </span>
                    </div>
                </div>
            {/if}
          </div>
        {/key}

          <button
            type="button"
            class="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-black/30 hover:bg-[#FACC15] text-white hover:text-[#21272C] backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 hover:scale-110"
            on:click|stopPropagation={() => {
              currentBannerIndex =
                (currentBannerIndex - 1 + activeBanners.length) %
                activeBanners.length;
            }}
          >
            <Icon name="chevronLeft" style="width: 24px; height: 24px;" />
          </button>

          <button
            type="button"
            class="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-black/30 hover:bg-[#FACC15] text-white hover:text-[#21272C] backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 hover:scale-110"
            on:click|stopPropagation={() => {
              currentBannerIndex =
                (currentBannerIndex + 1) % activeBanners.length;
            }}
          >
            <Icon name="chevronRight" style="width: 24px; height: 24px;" />
          </button>
        {:else}
          <div
            class="absolute inset-0 flex items-center justify-center dark:text-[#FDFDFD] text-gray-400 font-bold tracking-widest"
          >
            {$t("home.noActiveBanners")}
          </div>
        {/if}
      </div>

      <div
        class="mt-2 text-xs text-gray-400 dark:text-[#B7B6B3] text-justify leading-relaxed px-2 border-l-2 border-gray-200 dark:border-[#B7B6B3]"
      >
        {$t("home.disclaimer")}
      </div>
    </div>
  </div>

  <div class="w-full flex justify-center mb-10">
    <Button
      onClick={() => goto("/records")}
      variant="yellow"
      className="px-10 py-3 text-sm shadow-xl font-nums w-auto min-w-[200px] max-w-[400px] whitespace-nowrap"
    >
      <div slot="icon">
        <Icon name="arrowRight" style="width: 30px; height: 30px;" />
      </div>
      {$t("home.go_to_tracker")}
    </Button>
  </div>
</div>

<BannerModal banner={selectedBanner} on:close={() => (selectedBanner = null)} />

<style>
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #e5e7eb;
    border-radius: 20px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: #d1d5db;
  }
</style>
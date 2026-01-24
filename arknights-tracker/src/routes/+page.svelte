<script>
  import { onMount, onDestroy } from "svelte";
  import { t } from "$lib/i18n";
  import { goto } from "$app/navigation";
  import { banners } from "$lib/data/banners.js";
  import { promocodes } from "$lib/data/promocodes.js";
  import { currencies } from "$lib/data/items/currencies";
  import { progression } from "$lib/data/items/progression";

  import Icon from "$lib/components/Icons.svelte";
  import Images from "$lib/components/Images.svelte";
  import Button from "$lib/components/Button.svelte";
  import BannerModal from "$lib/components/BannerModal.svelte";
  import Tooltip from "$lib/components/Tooltip.svelte";

  // --- ЛОГИКА БАННЕРОВ ---
  let now = new Date();
  let timer;

  const allItems = [...currencies, ...progression];

  function getRarityStyle(id) {
        // Находим предмет в базе
        const item = allItems.find(i => i.id === id);
        
        // Если не нашли или рарити нет — считаем, что это обычный (3★ или ниже)
        const rarity = item?.rarity || 3;

        // Arknights цвета:
        // 5 = Золотой (Легендарный)
        // 4 = Фиолетовый (Эпический)
        // 3 = Синий (Редкий)
        // 1-2 = Серый/Зеленый (Обычный)

        switch (rarity) {
            case 5:
            case 6: // На всякий случай, если будут 6★ предметы
                return "bg-amber-50 border-amber-300 text-amber-800 hover:border-amber-500";
            
            case 4:
                return "bg-purple-50 border-purple-300 text-purple-800 hover:border-purple-500";
            
            case 3:
                return "bg-blue-50 border-blue-300 text-blue-800 hover:border-blue-500";
            
            default:
                // Серый для 1-2 рарити
                return "bg-gray-100 border-gray-300 text-gray-700 hover:border-gray-400";
        }
    }

    

  // Фильтруем и сортируем активные баннеры
  $: activeBanners = banners
    .filter((b) => {
      const start = new Date(b.startTime);
      const end = b.endTime ? new Date(b.endTime) : new Date(9999, 11, 31);
      const isTime = now >= start && now <= end;

      // Исключаем стандартные и для новичков
      // Проверь точно, как называются типы в твоем banners.js (beginner или new-player)
      const isHiddenType = ["standard", "new-player", "beginner"].includes(
        b.type,
      );

      return isTime && !isHiddenType;
    })
    .sort((a, b) => {
      // Приоритет сортировки: Special -> Weapon -> Остальные
      const priority = { special: 1, weapon: 2 };
      const pA = priority[a.type] || 99;
      const pB = priority[b.type] || 99;
      return pA - pB;
    });

  let currentBannerIndex = 0;
  let bannerInterval;

  function startBannerRotation() {
    if (activeBanners.length <= 1) return;
    bannerInterval = setInterval(() => {
      currentBannerIndex = (currentBannerIndex + 1) % activeBanners.length;
    }, 5000);
  }

  function setBanner(index) {
    currentBannerIndex = index;
    clearInterval(bannerInterval);
    startBannerRotation();
  }

  let selectedBanner = null;

  // --- ЛОГИКА ПРОМОКОДОВ ---

  $: activePromocodes = promocodes.filter((p) => {
    const end = p.endTime ? new Date(p.endTime) : new Date(9999, 11, 31);
    return now <= end;
  });

  function formatDuration(dateStr) {
    const end = new Date(dateStr);
    const diff = end - now;

    if (diff <= 0) return "";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    const dateOptions = { month: "short", day: "numeric" };
    // Используем undefined для авто-выбора языка
    const endDateFormatted = end.toLocaleDateString(undefined, dateOptions);

    return `${$t("home.until")} ${endDateFormatted} (${days > 0 ? days + " " + $t("home.days") : ""} ${hours} ${$t("home.hours")})`;
  }

  function sortRewards(rewards) {
        return [...rewards].sort((a, b) => {
            // 1. Находим объекты предметов в нашей базе (allItems)
            const itemA = allItems.find(i => i.id === a.id);
            const itemB = allItems.find(i => i.id === b.id);

            // 2. Получаем рарити (если не нашли, считаем 0)
            const rarityA = itemA?.rarity || 0;
            const rarityB = itemB?.rarity || 0;

            // 3. Сравнение по РЕДКОСТИ (от большего к меньшему)
            if (rarityB !== rarityA) {
                return rarityB - rarityA;
            }

            // 4. (Дополнительно) Если редкость одинаковая — сортируем по КОЛИЧЕСТВУ
            // Например: 2000 LMD будут выше, чем 5 каких-то карт опыта той же редкости
            if (b.count !== a.count) {
                return b.count - a.count;
            }
            
            // 5. Если и это одинаковое — оставляем как есть
            return 0;
        });
    }

  let copiedCode = null;
  async function copyCode(code) {
    try {
      await navigator.clipboard.writeText(code);
      copiedCode = code;
      setTimeout(() => (copiedCode = null), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  }

  onMount(() => {
    timer = setInterval(() => {
      now = new Date();
    }, 1000 * 60);
    startBannerRotation();
  });

  onDestroy(() => {
    clearInterval(timer);
    clearInterval(bannerInterval);
  });
</script>

<div
  class="min-h-screen w-full relative flex flex-col items-center py-10 px-4 sm:px-8 font-sans text-[#21272C]"
>
  <div class="fixed inset-0 -z-10 bg-[#F5F5F7]">
    <div
      class="absolute inset-0 bg-[url('/images/ui/grid_pattern.png')] opacity-[0.03]"
    ></div>
  </div>

  <div class="mb-12 transition-opacity hover:opacity-80">
    <Icon name="siteLogo2" className="h-16 w-auto text-[#21272C]" />
  </div>

  <div class="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
    <div
      class="lg:col-span-5 bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-gray-100 overflow-hidden flex flex-col h-full max-h-[500px]"
    >
      <div
        class="grid grid-cols-12 bg-gray-50 border-b border-gray-200 py-3 px-4 text-xs font-bold text-gray-500"
      >
        <div class="col-span-5">{$t("home.promocodes")}</div>
        <div class="col-span-4">{$t("home.rewards")}</div>
        <div class="col-span-3 text-right">{$t("home.duration")}</div>
      </div>

      <div class="overflow-y-auto custom-scrollbar flex-1 p-2">
        {#if activePromocodes.length === 0}
          <div class="text-center py-10 text-gray-400 text-sm">
            No active codes
          </div>
        {:else}
          {#each activePromocodes as promo}
            <div
              class="grid grid-cols-12 items-center py-3 px-2 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors rounded-lg group"
            >
              <div class="col-span-5 pr-2">
                <div class="flex items-center gap-2">
                  <div class="min-w-0 shrink-1">
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
                        class="block font-mono font-bold text-[#21272C] truncate select-all"
                      >
                        {promo.code}
                      </span>
                    {/if}
                  </div>

                  <button
                    on:click={() => copyCode(promo.code)}
                    class="flex items-center justify-center p-1.5 rounded-md hover:bg-gray-200 text-gray-400 hover:text-[#21272C] transition-colors shrink-0"
                    title="Copy Code"
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

              <div class="col-span-4 flex flex-wrap gap-2 items-center">
    {#each sortRewards(promo.rewards) as reward}
        <Tooltip text={$t(`items.${reward.id}`)}>
            
            <div 
                class="flex items-center rounded-full px-2 py-0.5 border transition-colors {getRarityStyle(reward.id)}"
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

              <div class="col-span-3 text-right">
                <span class="text-xs font-medium text-gray-500 block">
                  {formatDuration(promo.endTime)}
                </span>
              </div>
            </div>
          {/each}
        {/if}
      </div>
    </div>

    <div class="lg:col-span-7 flex flex-col gap-4">
      <div class="flex items-center justify-between px-1">
        <h2 class="text-lg font-bold text-[#21272C] flex items-center gap-2">
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
                ? 'bg-[#21272C]'
                : 'bg-gray-300 hover:bg-gray-400'}"
            ></button>
          {/each}
        </div>
      </div>

      <div
        role="button"
        tabindex="0"
        class="relative w-full aspect-[21/9] bg-gray-200 rounded-xl overflow-hidden shadow-2xl group cursor-pointer border border-white/50 outline-none focus:ring-4 focus:ring-[#FACC15]"
        on:click={() => (selectedBanner = activeBanners[currentBannerIndex])}
        on:keydown={(e) =>
          (e.key === "Enter" || e.key === " ") &&
          (selectedBanner = activeBanners[currentBannerIndex])}
      >
        {#if activeBanners.length > 0}
          {#key currentBannerIndex}
            <div class="absolute inset-0 transition-opacity duration-500">
              <Images
                id={activeBanners[currentBannerIndex].icon}
                variant="banner-icon"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"
              ></div>
            </div>
          {/key}
        {:else}
          <div
            class="absolute inset-0 flex items-center justify-center text-gray-400 font-bold tracking-widest"
          >
            NO ACTIVE BANNERS
          </div>
        {/if}
      </div>

      <div
        class="mt-2 text-xs text-gray-400 text-justify leading-relaxed px-2 border-l-2 border-gray-200"
      >
        {$t("home.disclaimer")}
      </div>
    </div>
  </div>

  <div class="w-full flex justify-center mb-10">
    <Button
      onClick={() => goto("/records")}
      variant="yellow"
      className="px-10 py-3 text-sm shadow-xl font-nums w-auto min-w-[200px] max-w-[400px]"
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

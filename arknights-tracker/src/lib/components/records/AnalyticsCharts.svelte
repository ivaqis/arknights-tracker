<script>
  import { t } from "$lib/i18n";
  import { banners } from "$lib/data/banners";
  import { getWeaponCategory } from "$lib/utils/importUtils";

  import Icon from "$lib/components/Icon.svelte";
  import Tooltip from "$lib/components/Tooltip.svelte";
  import BannerModal from "$lib/components/modals/BannerModal.svelte";
  import RatingCard from "$lib/components/records/RatingCard.svelte";

  export let rawPulls = [];
  export let bannerType = "";

  $: isWeapon = bannerType.toLowerCase().includes("weap") || bannerType.toLowerCase().includes("wepon");
  $: isGroup = ["special", "standard", "weap-special", "weap-standard", "joint", "new-player"].includes(bannerType);
  $: showHistoryGraph = 
      (bannerType !== "standard" && 
      bannerType !== "new-player" && 
      !bannerType.includes("new") && 
      !isWeapon) || 
      (bannerType === "weap-special" || bannerType === "weap-standard");
  $: totalCount = rawPulls.length;
  $: count4 = rawPulls.filter((p) => p.rarity === 4).length;
  $: count5 = rawPulls.filter((p) => p.rarity === 5).length;
  $: pct4 = totalCount > 0 ? (count4 / totalCount) * 100 : 0;
  $: pct5 = totalCount > 0 ? (count5 / totalCount) * 100 : 0;
  $: pieGradient = `conic-gradient(
        #9B83BE 0% ${pct4}%, 
        #E3BC55 ${pct4}% ${pct4 + pct5}%, 
        #D0926E ${pct4 + pct5}% 100%
    )`;
  $: timelineData = (() => {
    const relevantBanners = banners.filter((b) => {
      if (bannerType === "weap-special" || bannerType === "weap-standard") {
        return getWeaponCategory(b.id) === bannerType;
      }
      return b.type === bannerType;
    });
    const grouped = {};
    const sortedPulls = [...rawPulls].sort(
      (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
    );

    sortedPulls.forEach((p) => {
      const pullTime = new Date(p.time).getTime();
      let matchedBanner = banners.find((b) => b.id === p.rawPoolId);
      if (!matchedBanner) {
          matchedBanner = relevantBanners.find((b) => {
            const start = new Date(b.startTime).getTime();
            const end = b.endTime ? new Date(b.endTime).getTime() : Infinity;
            return pullTime >= start && pullTime <= end;
          });
      }

      let bannerId = matchedBanner ? matchedBanner.id : (p.rawPoolId || p.bannerId || "Unknown");
      let displayName = matchedBanner ? matchedBanner.name : bannerId;
      const genericIds = ['special', 'standard', 'weapon', 'new-player', 'unknown'];
      if (genericIds.includes(bannerId.toLowerCase())) {
        const d = new Date(p.time);
        const month = String(d.getMonth() + 1).padStart(2, '0');
        bannerId = `generic_${p.bannerId}_${d.getFullYear()}_${month}`;
        displayName = `Unknown ${p.bannerId} (${month}.${d.getFullYear()})`;
      }

      if (!grouped[bannerId]) {
        grouped[bannerId] = {
          id: bannerId,
          name: displayName,
          total: 0,
          c6: 0,
          c5: 0,
          c4: 0,
          startTime: matchedBanner ? matchedBanner.startTime : p.time,
        };
      }
      
      grouped[bannerId].total++;
      if (p.rarity === 6) grouped[bannerId].c6++;
      else if (p.rarity === 5) grouped[bannerId].c5++;
      else grouped[bannerId].c4++;
    });

    return Object.values(grouped).sort((a, b) => {
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    });
  })();
  $: maxBarValue =
    timelineData.length > 0
      ? Math.ceil(Math.max(...timelineData.map((d) => d.total)) / 10) * 10
      : 10;

  $: yTicks = [
    0,
    Math.round(maxBarValue * 0.33),
    Math.round(maxBarValue * 0.66),
    maxBarValue,
  ];

  let isPieHovered = false;
  let hoveredBarIdx = null;

  function handleBarHover(idx) {
    hoveredBarIdx = idx;
  }

  function handleBarLeave() {
    hoveredBarIdx = null;
  }

  function getBannerImage(id) {
    const b = banners.find((x) => x.id === id);
    if (b && b.miniIcon) {
      return `/images/banners/miniIcon/${b.miniIcon}`;
    }
    if (id.includes("constant")) {
      const num = id.replace(/[^0-9]/g, "");
      const cleanNum = parseInt(num, 10);
      return `/images/banners/miniIcon/weaponbox_constant_${cleanNum}.png`;
    }
    if (b) {
      return `/images/banners/miniIcon/${b.id}.png`;
    }
    return null;
  }

  let selectedBanner = null;

  function handleBarClick(id) {
    const banner = banners.find((b) => b.id === id);
    if (banner) {
      selectedBanner = banner;
    }
  }

  function hasBanner(id) {
    return banners.some((b) => b.id === id);
  }
</script>

<div class="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
  <!-- Pie Chart -->
  <div
    class="xl:col-span-1 bg-white rounded-xl shadow-sm border dark:bg-[#383838] dark:border-[#444444] border-gray-100 p-4"
  >
    <h3 class="text-sm font-bold text-gray-800 text-start mb-2 dark:text-[#FDFDFD]">
      {$t("page.bannerTypes.pieGraph")}
    </h3>
    
    <div
      class="relative flex flex-col items-center justify-center w-full py-1"
    >
      {#if totalCount > 0}
        <Tooltip
          class="w-40 max-w-full aspect-square rounded-full relative z-10"
          on:mouseenter={() => (isPieHovered = true)}
          on:mouseleave={() => (isPieHovered = false)}
        >
          <div
            class="w-full h-full rounded-full shadow-inner cursor-pointer transition-transform duration-200 ease-out"
            style="background: {pieGradient};"
            role="img"
          ></div>

          <div slot="content" class="min-w-[160px] py-1 text-xs text-start">
            <div class="space-y-1.5 font-nums text-white">
              <!-- 6 Stars -->
              <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-1.5 text-[#D0926E] font-bold">
                  <div class="w-2.5 h-2.5 flex items-center justify-center">
                    <Icon name="star" class="w-4 h-4" />
                  </div>
                  <span>6</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="font-bold text-white">
                    {rawPulls.filter((p) => p.rarity === 6).length}
                  </span>
                  <span
                    class="text-[10px] text-white/60 w-8 text-right"
                  >
                    {(
                      (rawPulls.filter((p) => p.rarity === 6).length /
                        totalCount) *
                      100
                    ).toFixed(1)}%
                  </span>
                </div>
              </div>

              <!-- 5 Stars -->
              <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-1.5 text-[#E3BC55] font-bold">
                  <div class="w-2.5 h-2.5 flex items-center justify-center">
                    <Icon name="star" class="w-4 h-4" />
                  </div>
                  <span>5</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="font-bold text-white">{count5}</span>
                  <span
                    class="text-[10px] text-white/60 w-8 text-right"
                  >
                    {pct5.toFixed(1)}%
                  </span>
                </div>
              </div>

              <!-- 4 Stars -->
              <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-1.5 text-[#9B83BE] font-bold">
                  <div class="w-2.5 h-2.5 flex items-center justify-center">
                    <Icon name="star" class="w-4 h-4" />
                  </div>
                  <span>4</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="font-bold text-white">{count4}</span>
                  <span
                    class="text-[10px] text-white/60 w-8 text-right"
                  >
                    {pct4.toFixed(1)}%
                  </span>
                </div>
              </div>

              <!-- Total -->
              <div
                class="border-t border-white/15 mt-2 pt-1.5 text-white/60 flex justify-between items-center text-xs"
              >
                <span>{$t("systemNames.total")}</span>
                <span class="font-bold text-white"
                  >{totalCount}</span
                >
              </div>
            </div>
          </div>
        </Tooltip>
      {:else}
        <div
          class="w-40 h-40 rounded-full border-4 border-gray-100 dark:border-[#404040] bg-gray-50 dark:bg-[#393939] flex items-center justify-center relative z-10"
        >
          <span class="text-xs text-gray-400 flex flex-col items-center">
            <Icon name="noData" class="w-4 h-4" />
            {$t("emptyState.noData")}
          </span>
        </div>
      {/if}
    </div>
  </div>

  <!-- Bar Chart -->
  {#if showHistoryGraph}
    <div class="xl:col-span-2 flex flex-col gap-6">
      <div
        class="bg-white dark:bg-[#383838] dark:border-[#444444] rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col min-w-0 h-[450px] relative z-0"
      >
      <h3 class="font-bold text-sm text-start text-gray-800 dark:text-[#FDFDFD] mb-2 px-2 flex-shrink-0">
        {$t("page.bannerTypes.bannerHistoryGraph")}
      </h3>

      {#if timelineData.length > 0}
        <div class="flex-grow relative w-full flex flex-col mt-4">
          
          <div
            class="absolute left-0 top-0 bottom-[90px] w-8 z-10 bg-transparent dark:border-[#7A7A7A] border-r border-gray-100 pointer-events-none"
          >
            <div class="relative w-full h-full">
              {#each yTicks as tick}
                <div
                  class="absolute left-0 right-0 flex items-center justify-end pr-2 h-0"
                  style="bottom: {(tick / maxBarValue) * 100}%;"
                >
                  <span class="absolute transform -translate-y-1/2 text-xs text-gray-400 dark:text-[#E0E0E0] font-nums">
                    {tick}
                  </span>
                </div>
              {/each}
            </div>
          </div>

          <div
            class="ml-8 h-full overflow-x-auto overflow-y-hidden custom-scrollbar relative"
          >
            <div class="h-full min-w-max relative flex flex-col pr-4">
              <!-- Столбцы -->
              <div
                class="relative pl-4 flex-grow border-b dark:border-[#7A7A7A] border-gray-200 flex items-end gap-3 z-10 pb-[1px]"
              >
                <div
                  class="absolute inset-0 w-full h-full pointer-events-none z-0"
                >
                  {#each yTicks as tick}
                    {#if tick !== 0}
                      <div
                        class="absolute left-0 right-0 dark:border-[#7A7A7A] border-b border-gray-100 border-dashed"
                        style="bottom: {(tick / maxBarValue) * 100}%;"
                      ></div>
                    {/if}
                  {/each}
                </div>

                {#each timelineData as item, idx}
                  <div
                    class="relative h-full flex flex-col justify-end w-6 group z-10"
                  >
                    <!-- svelte-ignore a11y-no-static-element-interactions -->
                    <div
                      class="w-full transition-all duration-200 rounded-t-sm overflow-hidden {hoveredBarIdx !== null && hoveredBarIdx !== idx ? 'opacity-40' : ''} {hoveredBarIdx === idx ? 'brightness-115 shadow-md' : ''} {hasBanner(item.id) ? 'cursor-pointer' : 'cursor-default'}"
                      style="height: {(item.total / maxBarValue) *
                        100}%; z-index: {hoveredBarIdx === idx ? 50 : 10};"
                      on:click={() => handleBarClick(item.id)}
                      on:keydown={(e) => e.key === 'Enter' && handleBarClick(item.id)}
                    >
                      <Tooltip
                        class="w-full h-full flex flex-col-reverse {hasBanner(item.id) ? 'cursor-pointer' : 'cursor-default'}"
                        on:mouseenter={() => handleBarHover(idx)}
                        on:mouseleave={handleBarLeave}
                        on:focus={() => handleBarHover(idx)}
                        on:blur={handleBarLeave}
                      >
                        <div
                          class="w-full transition-all hover:brightness-110 {hasBanner(item.id) ? 'cursor-pointer' : 'cursor-default'}"
                          style="background-color: #9B83BE; flex: {item.c4} 1 0%;"
                        ></div>
                        <div
                          class="w-full transition-all hover:brightness-110 {hasBanner(item.id) ? 'cursor-pointer' : 'cursor-default'}"
                          style="background-color: #E3BC55; flex: {item.c5} 1 0%;"
                        ></div>
                        <div
                          class="w-full transition-all hover:brightness-110 {hasBanner(item.id) ? 'cursor-pointer' : 'cursor-default'}"
                          style="background-color: #D0926E; flex: {item.c6} 1 0%;"
                        ></div>

                        <div slot="content" class="min-w-[160px] py-1 text-xs text-start">
                          <div class="flex flex-col items-center gap-1 mb-2 border-b border-white/15 pb-2">
                            {#if getBannerImage(item.id) || item.id.includes("generic")}
                              <div class="w-20 h-11 rounded overflow-hidden border border-white/10 shadow-sm flex-shrink-0 bg-gray-900">
                                <img
                                  src={getBannerImage(item.id) || "/images/banners/unknown.jpg"}
                                  alt={item.name}
                                  class="w-full h-full object-cover"
                                  on:error={(e) => (e.target.style.display = "none")}
                                />
                              </div>
                            {/if}
                            <div class="font-bold text-white text-center text-[11px] leading-tight truncate max-w-[170px]" title={$t(`banners.${item.id}`) || item.name}>
                              {$t(`banners.${item.id}`) || item.name}
                            </div>
                          </div>

                          <div class="space-y-1 font-nums text-white">
                            <div class="flex justify-between items-center gap-3">
                              <div class="flex items-center gap-1 text-[#D0926E] font-bold">
                                <div class="w-2.5 h-2.5 flex items-center justify-center">
                                  <Icon name="star" class="w-4 h-4" />
                                </div>
                                <span>6</span>
                              </div>
                              <div class="flex items-center gap-2">
                                <span class="font-bold text-white">{item.c6}</span>
                                <span class="text-[10px] text-white/60 w-8 text-right">
                                  {item.total > 0
                                    ? ((item.c6 / item.total) * 100).toFixed(1)
                                    : 0}%
                                </span>
                              </div>
                            </div>

                            <div class="flex justify-between items-center gap-3">
                              <div class="flex items-center gap-1 text-[#E3BC55] font-bold">
                                <div class="w-2.5 h-2.5 flex items-center justify-center">
                                  <Icon name="star" class="w-4 h-4" />
                                </div>
                                <span>5</span>
                              </div>
                              <div class="flex items-center gap-2">
                                <span class="font-bold text-white">{item.c5}</span>
                                <span class="text-[10px] text-white/60 w-8 text-right">
                                  {item.total > 0
                                    ? ((item.c5 / item.total) * 100).toFixed(1)
                                    : 0}%
                                </span>
                              </div>
                            </div>

                            <div class="flex justify-between items-center gap-3">
                              <div class="flex items-center gap-1 text-[#9B83BE] font-bold">
                                <div class="w-2.5 h-2.5 flex items-center justify-center">
                                  <Icon name="star" class="w-4 h-4" />
                                </div>
                                <span>4</span>
                              </div>
                              <div class="flex items-center gap-2">
                                <span class="font-bold text-white">{item.c4}</span>
                                <span class="text-[10px] text-white/60 w-8 text-right">
                                  {item.total > 0
                                    ? ((item.c4 / item.total) * 100).toFixed(1)
                                    : 0}%
                                </span>
                              </div>
                            </div>

                            <div
                              class="border-t border-white/15 font-normal mt-2 pt-1 text-white/60 flex justify-between items-center text-xs"
                            >
                              <span>{$t("systemNames.total")}</span>
                              <span class="font-bold text-white">{item.total}</span>
                            </div>
                          </div>
                        </div>
                      </Tooltip>
                    </div>
                  </div>
                {/each}
              </div>

              <div
                class="h-[90px] flex items-start gap-3 flex-shrink-0 relative pt-3 pl-4 overflow-visible"
              >
                {#each timelineData as item}
                  <div class="w-6 relative overflow-visible">
                    <span
                      class="absolute top-0 left-0 text-[9px] leading-tight dark:text-[#E0E0E0] text-gray-400 font-medium whitespace-nowrap transform rotate-45 origin-top-left translate-x-[12px] translate-y-[4px] block transition-colors group-hover:text-gray-900 cursor-default text-left w-28 max-w-none"
                      title={$t(`banners.${item.id}`) || item.name}
                    >
                      {$t(`banners.${item.id}`) || item.name}
                    </span>
                  </div>
                {/each}
              </div>
            </div>
          </div>
        </div>
      {:else}
        <div
          class="h-full flex flex-col items-center justify-center text-gray-400"
        >
          <Icon name="noData" class="w-4 h-4" />
          <p class="text-sm">{$t("emptyState.noData")}</p>
        </div>
      {/if}
      </div>
      {#if isGroup}
        <RatingCard activeTab={bannerType} showTabs={false} />
      {/if}
    </div>
  {:else}
    <div class="xl:col-span-2">
      {#if isGroup}
        <RatingCard activeTab={bannerType} showTabs={false} />
      {/if}
    </div>
  {/if}
</div>

<BannerModal
  banner={selectedBanner}
  pageContext={bannerType}
  on:close={() => (selectedBanner = null)}
/>



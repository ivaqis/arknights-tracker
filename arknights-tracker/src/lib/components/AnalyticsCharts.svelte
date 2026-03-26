<!-- src/lib/components/AnalyticsCharts.svelte -->
<script>
  import { t } from "$lib/i18n";
  import { banners } from "$lib/data/banners";
  import Icon from "$lib/components/Icons.svelte";

  export let rawPulls = [];
  export let bannerType = "";

  $: isWeapon = bannerType.toLowerCase().includes("weap") || bannerType.toLowerCase().includes("wepon");
  $: showHistoryGraph = 
      bannerType !== "standard" && 
      bannerType !== "new-player" && 
      !bannerType.includes("new") && 
      !isWeapon;
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
    const relevantBanners = banners.filter((b) => b.type === bannerType);
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
  let hoveredBarPosition = { x: 0, y: 0 };

  $: hoveredItem = hoveredBarIdx !== null ? timelineData[hoveredBarIdx] : null;

  function handleBarHover(event, idx) {
    hoveredBarIdx = idx;
    const rect = event.currentTarget.getBoundingClientRect();
    hoveredBarPosition = {
      x: rect.left + rect.width / 2,
      y: rect.top,
    };
  }

  function handleBarLeave() {
    hoveredBarIdx = null;
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
        <div
          class="w-40 max-w-full aspect-square rounded-full shadow-inner cursor-pointer transition-transform duration-200 ease-out relative z-10 {isPieHovered
            ? 'scale-105'
            : ''}"
          style="background: {pieGradient};"
          role="img"
          on:mouseenter={() => (isPieHovered = true)}
          on:mouseleave={() => (isPieHovered = false)}
        ></div>

        {#if isPieHovered}
          <div
          class="absolute 
                 z-50 min-w-[160px] p-3 rounded-xl border backdrop-blur-sm shadow-xl
                 bg-white/95 border-gray-200 
                 dark:bg-[#383838] dark:border-[#444444] 
                 pointer-events-none animate-in fade-in zoom-in-95 duration-200
                 left-1/2 -translate-x-1/2 top-[100%] mt-4
                 xl:left-[85%] xl:top-1/2 xl:-translate-y-1/2 xl:translate-x-0 xl:mt-0 xl:ml-2"
        >
            <div class="space-y-1.5">
              <div class="flex items-center justify-between gap-3 text-xs">
                <div class="flex items-center gap-1.5 text-[#D0926E] font-bold">
                  <div class="w-2.5 h-2.5 flex items-center justify-center">
                    <Icon name="star" class="w-4 h-4" />
                  </div>
                  <span>6</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="font-nums font-bold text-gray-700 dark:text-[#E0E0E0]">
                    {rawPulls.filter((p) => p.rarity === 6).length}
                  </span>
                  <span
                    class="font-nums text-[10px] text-gray-400 dark:text-[#B7B6B3] w-8 text-right"
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
              <div class="flex items-center justify-between gap-3 text-xs">
                <div class="flex items-center gap-1.5 text-[#E3BC55] font-bold">
                  <div class="w-2.5 h-2.5 flex items-center justify-center">
                    <Icon name="star" class="w-4 h-4" />
                  </div>
                  <span>5</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="font-nums font-bold text-gray-700 dark:text-[#E0E0E0]">{count5}</span
                  >
                  <span
                    class="font-nums text-[10px] text-gray-400 dark:text-[#B7B6B3] w-8 text-right"
                  >
                    {pct5.toFixed(1)}%
                  </span>
                </div>
              </div>

              <!-- 4 Stars -->
              <div class="flex items-center justify-between gap-3 text-xs">
                <div class="flex items-center gap-1.5 text-[#9B83BE] font-bold">
                  <div class="w-2.5 h-2.5 flex items-center justify-center">
                    <Icon name="star" class="w-4 h-4" />
                  </div>
                  <span>4</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="font-nums font-bold text-gray-700 dark:text-[#E0E0E0]">{count4}</span
                  >
                  <span
                    class="font-nums text-[10px] text-gray-400 dark:text-[#B7B6B3] w-8 text-right"
                  >
                    {pct4.toFixed(1)}%
                  </span>
                </div>
              </div>

              <!-- Total -->
              <div
                class="border-t dark:border-[#444444] border-gray-100 mt-2 pt-1.5 dark:text-[#B7B6B3] text-gray-500 flex justify-between items-center text-xs"
              >
                <span>{$t("systemNames.total")}</span>
                <span class="font-bold text-gray-800 dark:text-[#E0E0E0] font-nums"
                  >{totalCount}</span
                >
              </div>
            </div>
          </div>
        {/if}
      {:else}
        <div
          class="w-40 h-40 rounded-full  border-4 border-gray-100 bg-gray-50 flex items-center justify-center relative z-10"
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
    <div
      class="xl:col-span-2 bg-white dark:bg-[#383838] dark:border-[#444444] rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col min-w-0 h-[450px] relative z-0"
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
                class="relative pl-4 flex-grow border-b dark:border-[#7A7A7A] border-gray-200 flex items-end gap-4 z-10 pb-[1px]"
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
                    <div
                      class="w-full flex flex-col-reverse transition-all duration-200 rounded-t-sm overflow-hidden cursor-pointer outline-none {hoveredBarIdx ===
                      idx
                        ? 'opacity-90 scale-110'
                        : ''}"
                      style="height: {(item.total / maxBarValue) *
                        100}%; z-index: {hoveredBarIdx === idx ? 50 : 10};"
                      role="button"
                      tabindex="0"
                      on:mouseenter={(e) => handleBarHover(e, idx)}
                      on:mouseleave={handleBarLeave}
                      on:focus={(e) => handleBarHover(e, idx)}
                      on:blur={handleBarLeave}
                    >
                      <div
                        class="w-full transition-all hover:brightness-110"
                        style="background-color: #9B83BE; flex: {item.c4} 1 0%;"
                      ></div>
                      <div
                        class="w-full transition-all hover:brightness-110"
                        style="background-color: #E3BC55; flex: {item.c5} 1 0%;"
                      ></div>
                      <div
                        class="w-full transition-all hover:brightness-110"
                        style="background-color: #D0926E; flex: {item.c6} 1 0%;"
                      ></div>
                    </div>
                  </div>
                {/each}
              </div>

              <div
                class="h-[90px] flex items-start gap-4 flex-shrink-0 relative pt-3 overflow-visible"
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
  {/if}
</div>

{#if hoveredItem}
  <div
    class="fixed bg-white/95 dark:bg-[#383838] dark:border-[#444444] backdrop-blur-sm border border-gray-200 rounded-xl p-3 text-xs z-[9999] whitespace-nowrap min-w-[160px] pointer-events-none"
    style="left: {hoveredBarPosition.x}px; top: {hoveredBarPosition.y}px; transform: translate(-50%, -100%) translateY(-12px);"
  >
    <div
      class="font-bold mb-2 dark:border-[#444444] dark:text-[#E0E0E0] text-xs border-b border-gray-100 pb-1 text-gray-800 text-center truncate max-w-[170px]"
    >
      {$t(`banners.${hoveredItem.id}`) || hoveredItem.name}
    </div>

    <div class="space-y-1 font-nums">
      <div class="flex justify-between items-center gap-3">
        <div class="flex items-center gap-1 text-[#D0926E] font-bold">
          <div class="w-2.5 h-2.5 flex items-center justify-center">
            <Icon name="star" class="w-4 h-4" />
          </div>
          <span>6</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="font-bold text-gray-700 dark:text-[#E0E0E0]">{hoveredItem.c6}</span>
          <span class="text-[10px] text-gray-400 dark:text-[#B7B6B3] w-8 text-right">
            {hoveredItem.total > 0
              ? ((hoveredItem.c6 / hoveredItem.total) * 100).toFixed(1)
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
          <span class="font-bold text-gray-700 dark:text-[#E0E0E0]">{hoveredItem.c5}</span>
          <span class="text-[10px] text-gray-400 dark:text-[#B7B6B3] w-8 text-right">
            {hoveredItem.total > 0
              ? ((hoveredItem.c5 / hoveredItem.total) * 100).toFixed(1)
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
          <span class="font-bold text-gray-700 dark:text-[#E0E0E0]">{hoveredItem.c4}</span>
          <span class="text-[10px] text-gray-400 dark:text-[#B7B6B3] w-8 text-right">
            {hoveredItem.total > 0
              ? ((hoveredItem.c4 / hoveredItem.total) * 100).toFixed(1)
              : 0}%
          </span>
        </div>
      </div>

      <div
        class="border-t border-gray-100 font-normal dark:border-[#444444] mt-2 pt-1 dark:text-[#B7B6B3] text-gray-500 flex justify-between items-center text-xs"
      >
        <span>{$t("systemNames.total")}</span>
        <span class="font-bold text-gray-800 dark:text-[#E0E0E0]">{hoveredItem.total}</span>
      </div>
    </div>
  </div>
{/if}

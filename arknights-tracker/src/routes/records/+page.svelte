<script>
  import { t } from "$lib/i18n";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { pullData } from "$lib/stores/pulls";
  import { bannerTypes } from "$lib/data/bannerTypes";
  import { banners } from "$lib/data/banners";
  import { currencies } from "$lib/data/items/currencies.js";
  import { user, checkSync, syncStatus } from "$lib/stores/cloudStore";
  import { currentLocale } from "$lib/stores/locale";
  import { flip } from "svelte/animate";

  import BannerCard from "$lib/components/BannerCard.svelte";
  import SettingsModal from "$lib/components/SettingsModal.svelte";
  import Button from "$lib/components/Button.svelte";
  import RatingCard from "$lib/components/RatingCard.svelte";
  import Icon from "$lib/components/Icons.svelte";
  import Images from "$lib/components/Images.svelte";
  import {
    recordsExcludedBannerTypes,
    recordsExcludedBanners,
    recordsShowMonthlyChart,
    recordsShowRating,
    recordsShowTotalCost,
    recordsMaxCols,
    recordsEnableDragDrop,
    recordsCardsOrder
  } from "$lib/stores/filterStore";

  $: pullsStats = (() => {
    let allPulls = [];
    Object.entries($pullData).forEach(([boxId, data]) => {
      if (!data || !data.pulls) return;
      data.pulls.forEach((p) => {
        allPulls.push({
          ...p,
          boxId: boxId,
          timeMs: new Date(p.time).getTime(),
        });
      });
    });

    allPulls.sort((a, b) => a.timeMs - b.timeMs);

    let total = 0;
    let billable = 0;
    let billableChar = 0;
    let bannerCounts = {};

    allPulls.forEach((p) => {
      const specificBanner = banners.find((b) => {
        const start = new Date(b.startTime).getTime();
        const end = b.endTime ? new Date(b.endTime).getTime() : 4102444800000;
        if (p.timeMs < start || p.timeMs > end) return false;
        const bType = (b.type || "").toLowerCase();
        const pBox = p.boxId.toLowerCase();
        if (pBox.includes("special") && bType === "special") return true;
        if (pBox.includes("weap") && bType === "weapon") return true;
        if (pBox.includes("new") && bType === "new-player") return true;
        if (
          pBox.includes("standard") &&
          (bType === "standard" || bType === "constant")
        )
          return true;

        return false;
      });

      const bid = specificBanner ? specificBanner.id : p.boxId;
      const bType = specificBanner
        ? specificBanner.type
        : p.boxId.includes("weap")
          ? "weapon"
          : "special";
      const isWeapon =
        bType === "weapon" ||
        p.boxId.includes("weap") ||
        p.boxId.includes("wepon");
      const isNewPlayer = bType === "new-player" || p.boxId.includes("new");
      const isSpecial = bType === "special" && !isWeapon && !isNewPlayer;
      if (!bannerCounts[bid]) bannerCounts[bid] = 0;
      let isFree = false;
      if (isSpecial && bannerCounts[bid] >= 30 && bannerCounts[bid] < 40) {
        isFree = true;
      }

      bannerCounts[bid]++;
      total++;

      if (!isNewPlayer && !isWeapon) {
        if (!isFree) {
          billable++;
          billableChar++;
        }
      }
    });

    return { total, billable, billableChar };
  })();

  $: totalPulls = pullsStats.total;
  $: billablePulls = pullsStats.billable;
  $: charPullsOnly = pullsStats.billableChar;
  $: homeBanners = [...bannerTypes]
    .filter((b) => b.showOnHome)
    .sort((a, b) => a.order - b.order);

  let isSettingsOpen = false;

  const oroberyl = currencies.find((c) => c.id === "oroberyl");

  function openImport() {
    goto("/records/import");
  }

  function openGlobal() {
    goto("/records/global");
  }

  function getBanner(partialId) {
    return homeBanners.find((b) => b.id.includes(partialId));
  }

  $: bSpecialChar = getBanner("special");
  $: bStandardChar = getBanner("standard");
  $: bNewPlayer = getBanner("new-player");
  $: bSpecialWeap = getBanner("weap-special");
  $: bStandardWeap = getBanner("weap-standard");
  $: bJoint = getBanner("joint");

  onMount(() => {
    if ($user && $syncStatus !== "checking") {
      checkSync($user);
    }
  });

  let hoverIndex = -1;

  $: monthlyData = (() => {
    let allPulls = [];
    Object.values($pullData).forEach(data => {
      if (data && data.pulls) allPulls.push(...data.pulls);
    });
    if (allPulls.length === 0) return [];

    allPulls.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

    const grouped = {};
    const minDate = new Date(allPulls[0].time);
    const maxDate = new Date(allPulls[allPulls.length - 1].time);

    let curr = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    const end = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);

    while (curr <= end) {
      const yy = String(curr.getFullYear()).slice(-2);
      const mm = String(curr.getMonth() + 1).padStart(2, '0');
      grouped[`${yy}-${mm}`] = { 
        dateStr: `${yy}-${mm}`, 
        dateObj: new Date(curr),
        total: 0, five: 0, six: 0 
      };
      curr.setMonth(curr.getMonth() + 1);
    }

    allPulls.forEach(p => {
      const d = new Date(p.time);
      const yy = String(d.getFullYear()).slice(-2);
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const key = `${yy}-${mm}`;
      if (grouped[key]) {
        grouped[key].total++;
        if (p.rarity === 5) grouped[key].five++;
        if (p.rarity === 6) grouped[key].six++;
      }
    });

    return Object.values(grouped);
  })();

  $: maxMonthlyPulls = Math.max(...monthlyData.map(d => d.total), 10);

  function getSmoothLine(data, key, maxY) {
    if (!data || data.length === 0) return "";
    if (data.length === 1) {
      const y = 100 - (data[0][key]/maxY)*100;
      return `M 0,${y} L 100,${y}`;
    }

    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - (d[key] / maxY) * 100;
      return [x, y];
    });

    let d = `M ${points[0][0]},${points[0][1]}`;
    const tension = 7;
    
    for (let i = 0; i < points.length - 1; i++) {
      const [x0, y0] = i > 0 ? points[i - 1] : points[0];
      const [x1, y1] = points[i];
      const [x2, y2] = points[i + 1];
      const [x3, y3] = i !== points.length - 2 ? points[i + 2] : points[i + 1];

      const cp1x = x1 + (x2 - x0) / tension;
      const cp1y = y1 + (y2 - y0) / tension;
      const cp2x = x2 - (x3 - x1) / tension;
      const cp2y = y2 - (y3 - y1) / tension;

      d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${x2},${y2}`;
    }
    return d;
  }

  $: xAxisTicks = (() => {
    const len = monthlyData.length;
    if (len === 0) return [];
    if (len === 1) return [{ label: monthlyData[0].dateStr, pos: 0 }];
    if (len <= 7) {
      return monthlyData.map((d, i) => ({
        label: d.dateStr,
        pos: (i / (len - 1)) * 100
      }));
    }
    
    const ticks = [];
    const step = (len - 1) / 5;
    for (let i = 0; i <= 5; i++) {
      const idx = Math.round(i * step);
      ticks.push({
        label: monthlyData[idx].dateStr,
        pos: (idx / (len - 1)) * 100
      });
    }
    return ticks;
  })();

  function formatTooltipMonth(dateObj, loc) {
      if (!dateObj) return "";
      try {
          const month = new Intl.DateTimeFormat(loc || 'ru', { month: 'long' }).format(dateObj);
          const year = dateObj.getFullYear();
          return month.charAt(0).toUpperCase() + month.slice(1) + " " + year;
      } catch (e) {
          return "";
      }
  }

  let windowWidth = 1200;

  $: activeCols = (() => {
    if (typeof window === "undefined") return 3;
    const cols = Math.max(1, Math.min($recordsMaxCols, Math.floor((windowWidth - 32) / 380)));
    return cols;
  })();

  $: columnsData = (() => {
    const cols = Array.from({ length: activeCols }, () => []);
    
    const cards = [];
    if (bSpecialChar && !$recordsExcludedBannerTypes.includes("special")) {
      cards.push({ id: 'specialChar', type: "banner", bannerId: bSpecialChar.id, titleKey: bSpecialChar.i18nKey });
    }
    if (bSpecialWeap && !$recordsExcludedBannerTypes.includes("weap-special")) {
      cards.push({ id: 'specialWeap', type: "banner", bannerId: bSpecialWeap.id, titleKey: bSpecialWeap.i18nKey });
    }
    if (bJoint && !$recordsExcludedBannerTypes.includes("joint")) {
      cards.push({ id: 'joint', type: "banner", bannerId: bJoint.id, titleKey: bJoint.i18nKey });
    }
    if (bStandardChar && !$recordsExcludedBannerTypes.includes("standard")) {
      cards.push({ id: 'standardChar', type: "banner", bannerId: bStandardChar.id, titleKey: bStandardChar.i18nKey });
    }
    if (bStandardWeap && !$recordsExcludedBannerTypes.includes("weap-standard")) {
      cards.push({ id: 'standardWeap', type: "banner", bannerId: bStandardWeap.id, titleKey: bStandardWeap.i18nKey });
    }
    if (monthlyData.length > 0 && $recordsShowMonthlyChart) {
      cards.push({ id: 'monthlyChart', type: "chart" });
    }
    if (bNewPlayer && !$recordsExcludedBannerTypes.includes("new-player")) {
      cards.push({ id: 'newPlayer', type: "banner", bannerId: bNewPlayer.id, titleKey: bNewPlayer.i18nKey });
    }
    if ($recordsShowRating) {
      cards.push({ id: 'rating', type: "rating" });
    }
    if ($recordsShowTotalCost) {
      cards.push({ id: 'totalCost', type: "cost" });
    }

    const order = $recordsCardsOrder || [];
    cards.sort((a, b) => {
      let indexA = order.indexOf(a.id);
      let indexB = order.indexOf(b.id);
      if (indexA === -1) indexA = 999;
      if (indexB === -1) indexB = 999;
      return indexA - indexB;
    });

    cards.forEach((card, idx) => {
      cols[idx % activeCols].push(card);
    });

    return cols;
  })();

  let draggedCardId = null;

  function handleDragStart(event, cardId) {
    draggedCardId = cardId;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', cardId);
  }

  function handleDragOver(event) {
    event.preventDefault();
  }

  function handleDragEnter(event, targetCardId) {
    event.preventDefault();
    if (!draggedCardId || draggedCardId === targetCardId) return;

    const defaultOrder = [
      'specialChar', 'specialWeap', 'joint', 'standardChar', 
      'standardWeap', 'monthlyChart', 'newPlayer', 'rating', 'totalCost'
    ];

    let currentOrder = [...($recordsCardsOrder || [])];
    if (currentOrder.length === 0) {
      currentOrder = [...defaultOrder];
    }

    if (!currentOrder.includes(draggedCardId)) currentOrder.push(draggedCardId);
    if (!currentOrder.includes(targetCardId)) currentOrder.push(targetCardId);

    const sourceIndex = currentOrder.indexOf(draggedCardId);
    const targetIndex = currentOrder.indexOf(targetCardId);

    if (sourceIndex !== -1 && targetIndex !== -1 && sourceIndex !== targetIndex) {
      currentOrder.splice(sourceIndex, 1);
      currentOrder.splice(targetIndex, 0, draggedCardId);
      $recordsCardsOrder = currentOrder;
    }
  }

  function handleDrop(event) {
    event.preventDefault();
    draggedCardId = null;
  }

  function handleDragEnd() {
    draggedCardId = null;
  }
</script>

<svelte:window bind:innerWidth={windowWidth} />

<SettingsModal
  isOpen={isSettingsOpen}
  onClose={() => (isSettingsOpen = false)}
/>

<div class="w-full" style="max-width: max(1400px, calc(400px * {activeCols} + 6rem));">
  <div class="flex flex-wrap justify-left items-center mb-8 gap-6">
    <h2
      class="font-sdk text-5xl tracking-wide text-[#21272C] dark:text-[#FDFDFD] shrink-0"
    >
      {$t("page.title")}
    </h2>

    <div class="flex flex-col md:flex-row gap-4 w-full xl:w-auto">
      <div class="w-full md:w-auto">
        <Button
          variant="yellow"
          onClick={openImport}
          className="w-full justify-center"
        >
          <div slot="icon">
            <Icon name="import" style="width: 30px; height: 30px;" />
          </div>
          <span class="whitespace-nowrap px-2">
            {$t("page.importBtn")}
          </span>
        </Button>
      </div>

      <div class="w-full md:w-auto">
        <Button
          variant="black2"
          onClick={openGlobal}
          className="w-full justify-center"
        >
          <div slot="icon">
            <Icon name="globe" style="width: 30px; height: 30px;" />
          </div>
          <span class="whitespace-nowrap px-2">
            {$t("page.globalBtn")}
          </span>
        </Button>
      </div>

      <div class="w-full md:w-auto">
        <Button
          variant="black2"
          onClick={() => (isSettingsOpen = true)}
          className="w-full justify-center"
        >
          <div slot="icon">
            <Icon name="settings" style="width: 25px; height: 25px;" />
          </div>
          <span class="whitespace-nowrap px-2">
            {$t("page.settingsBtn")}
          </span>
        </Button>
      </div>
    </div>
  </div>
  {#if columnsData.every(col => col.length === 0)}
    <div class="flex flex-col items-center justify-center py-20 px-4 text-center w-full min-h-[350px]">
      <img src="/images/empty.png" alt="Empty" class="w-56 h-auto object-contain mb-5 opacity-90 dark:opacity-85 select-none pointer-events-none" />
      <div class="flex items-center gap-3 text-lg font-bold text-gray-500 dark:text-gray-400 select-none">
        <Icon name="noData" class="w-6 h-6 text-gray-400 dark:text-gray-500" />
        <span>Как же тут пусто</span>
        <Icon name="noData" class="w-6 h-6 text-gray-400 dark:text-gray-500" />
      </div>
    </div>
  {:else}
    <div
      class="grid gap-6 items-start w-full"
      style="grid-template-columns: repeat({activeCols}, minmax(0, 1fr)); max-width: calc(400px * {activeCols} + 1.5rem * ({activeCols} - 1));"
    >
      {#each columnsData as column}
        <div class="flex flex-col gap-6 w-full" role="list">
          {#each column as card (card.id)}
            <div
              animate:flip={{ duration: 250 }}
              role="listitem"
              draggable={$recordsEnableDragDrop}
              on:dragstart={(e) => handleDragStart(e, card.id)}
              on:dragover={handleDragOver}
              on:dragenter={(e) => handleDragEnter(e, card.id)}
              on:drop={handleDrop}
              on:dragend={handleDragEnd}
              class="relative w-full transition-all duration-200 { $recordsEnableDragDrop ? 'cursor-grab active:cursor-grabbing border-2 border-dashed border-transparent' : '' } { draggedCardId === card.id ? 'opacity-40 scale-95' : '' }"
            >
              {#if $recordsEnableDragDrop}
                <div class="absolute top-3 left-3 z-30 cursor-grab active:cursor-grabbing p-1 bg-white/90 dark:bg-[#2c2c2c]/90 backdrop-blur-sm rounded-lg border border-black/5 dark:border-white/10 text-gray-500 dark:text-gray-400 shadow-md">
                  <Icon name="dragDots" class="w-4 h-4" />
                </div>
              {/if}

              {#if card.type === "banner"}
                <BannerCard
                  bannerId={card.bannerId}
                  titleKey={card.titleKey}
                />
              {:else if card.type === "chart"}
                <div class="bg-white dark:bg-[#383838] dark:border-[#444444] rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col min-h-[280px] w-full">
                  
                  <div class="flex justify-between items-start mb-4">
                    <h3 class="text-xl font-bold font-sdk text-[#21272C] dark:text-[#FDFDFD]">
                      {$t("page.activityChart") || "Активность"}
                    </h3>
                  </div>

                  <div class="relative w-full h-[180px] flex">
                    <div class="w-8 h-[calc(100%-20px)] flex flex-col justify-between items-end pr-2 text-[10px] text-gray-400 dark:text-[#787878] font-nums font-bold select-none border-r border-gray-200 dark:border-[#444] shrink-0">
                      <span class="transform -translate-y-1.5">{maxMonthlyPulls}</span>
                      <span class="transform translate-y-0.5">{Math.round(maxMonthlyPulls / 2)}</span>
                      <span class="transform translate-y-1.5">0</span>
                    </div>

                    <div class="flex-1 relative h-full">
                      
                      <div class="absolute inset-0 w-full h-[calc(100%-20px)] pointer-events-none z-0">
                        <div class="absolute w-full border-t border-dashed border-gray-300 dark:border-[#555] opacity-50" style="top: 0%;"></div>
                        <div class="absolute w-full border-t border-dashed border-gray-300 dark:border-[#555] opacity-50" style="top: 50%;"></div>
                        <div class="absolute w-full border-t border-dashed border-gray-300 dark:border-[#555] opacity-50" style="top: 100%;"></div>
                        
                        {#each xAxisTicks as tick}
                          {#if tick.pos > 0 && tick.pos < 100}
                            <div class="absolute h-full border-l border-dashed border-gray-300 dark:border-[#555] opacity-50" style="left: {tick.pos}%;"></div>
                          {/if}
                        {/each}
                      </div>

                      <svg viewBox="0 0 100 100" preserveAspectRatio="none" class="absolute top-0 left-0 w-full h-[calc(100%-20px)] overflow-visible pointer-events-none z-10">
                        <defs>
                          <linearGradient id="gradTotal" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stop-color="#4ADE80" stop-opacity="0.3" />
                            <stop offset="100%" stop-color="#4ADE80" stop-opacity="0" />
                          </linearGradient>
                          <linearGradient id="gradFive" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stop-color="#E3BC55" stop-opacity="0.35" />
                            <stop offset="100%" stop-color="#E3BC55" stop-opacity="0" />
                          </linearGradient>
                          <linearGradient id="gradSix" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stop-color="#D0926E" stop-opacity="0.4" />
                            <stop offset="100%" stop-color="#D0926E" stop-opacity="0" />
                          </linearGradient>
                        </defs>

                        <path d="{getSmoothLine(monthlyData, 'total', maxMonthlyPulls)} L 100,100 L 0,100 Z" fill="url(#gradTotal)" stroke="none" />
                        <path d="{getSmoothLine(monthlyData, 'five', maxMonthlyPulls)} L 100,100 L 0,100 Z" fill="url(#gradFive)" stroke="none" />
                        <path d="{getSmoothLine(monthlyData, 'six', maxMonthlyPulls)} L 100,100 L 0,100 Z" fill="url(#gradSix)" stroke="none" />

                        <path d={getSmoothLine(monthlyData, 'total', maxMonthlyPulls)} fill="none" stroke="#4ADE80" stroke-width="2.5" vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round" />
                        <path d={getSmoothLine(monthlyData, 'five', maxMonthlyPulls)} fill="none" stroke="#E3BC55" stroke-width="2.5" vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round" />
                        <path d={getSmoothLine(monthlyData, 'six', maxMonthlyPulls)} fill="none" stroke="#D0926E" stroke-width="2.5" vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>

                      <div class="absolute top-0 left-0 w-full h-[calc(100%-20px)] z-20 cursor-default"
                           role="application"
                           on:mousemove={(e) => {
                             const rect = e.currentTarget.getBoundingClientRect();
                             if (rect.width === 0) return;
                             const x = (e.clientX - rect.left) / rect.width;
                             hoverIndex = Math.min(Math.max(0, Math.round(x * (monthlyData.length - 1))), monthlyData.length - 1);
                           }}
                           on:mouseleave={() => hoverIndex = -1}>
                      </div>

                      {#if hoverIndex !== -1 && monthlyData[hoverIndex]}
                        {@const point = monthlyData[hoverIndex]}
                        {@const leftPos = (hoverIndex / (monthlyData.length - 1)) * 100}
                        
                        <div class="absolute top-0 left-0 z-30 pointer-events-none w-full h-[calc(100%-20px)]">
                          <div class="absolute top-0 bottom-0 w-px bg-gray-300 dark:bg-[#666] border-r border-dashed border-gray-400 dark:border-[#888]" style="left: {leftPos}%;"></div>

                          <div class="absolute w-2.5 h-2.5 rounded-full bg-[#4ADE80] border-2 border-white dark:border-[#383838] shadow-sm transform -translate-x-1/2 -translate-y-1/2" style="left: {leftPos}%; top: {100 - (point.total / maxMonthlyPulls) * 100}%;"></div>
                          <div class="absolute w-2.5 h-2.5 rounded-full bg-[#E3BC55] border-2 border-white dark:border-[#383838] shadow-sm transform -translate-x-1/2 -translate-y-1/2" style="left: {leftPos}%; top: {100 - (point.five / maxMonthlyPulls) * 100}%;"></div>
                          <div class="absolute w-2.5 h-2.5 rounded-full bg-[#D0926E] border-2 border-white dark:border-[#383838] shadow-sm transform -translate-x-1/2 -translate-y-1/2" style="left: {leftPos}%; top: {100 - (point.six / maxMonthlyPulls) * 100}%;"></div>

                          <div class="absolute top-0 transition-transform duration-75 ease-out" style="left: {leftPos}%; transform: translateX({leftPos > 60 ? '-105%' : '5%'});">
                            <div class="bg-white/95 dark:bg-[#2C2C2C]/95 backdrop-blur-sm text-xs rounded-lg p-2.5 shadow-lg border border-black/5 dark:border-white/10 mt-1 min-w-[90px]">
                              <div class="text-gray-400 dark:text-[#A0A0A0] font-bold text-[10px] mb-1.5 border-b border-gray-100 dark:border-[#444] pb-1">
                                {formatTooltipMonth(point.dateObj, $currentLocale)}
                              </div>
                              <div class="flex flex-col gap-1 font-nums text-[11px]">
                                <div class="flex justify-between gap-3 text-[#4ADE80]"><span class="font-medium text-gray-600 dark:text-[#E4E4E4]">{$t("systemNames.total")}</span> <span class="font-bold">{point.total}</span></div>
                                <div class="flex justify-between gap-3 text-[#E3BC55]"><span class="font-medium text-gray-600 dark:text-[#E4E4E4] flex items-center gap-0.5">5<Icon name="star" class="w-2.5 h-2.5"/></span> <span class="font-bold">{point.five}</span></div>
                                <div class="flex justify-between gap-3 text-[#D0926E]"><span class="font-medium text-gray-600 dark:text-[#E4E4E4] flex items-center gap-0.5">6<Icon name="star" class="w-2.5 h-2.5"/></span> <span class="font-bold">{point.six}</span></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      {/if}

                      <div class="absolute bottom-0 left-0 w-full h-5 text-[9px] font-bold text-gray-400 dark:text-[#787878] select-none">
                        {#each xAxisTicks as tick}
                          <div class="absolute bottom-0 whitespace-nowrap" style="left: {tick.pos}%; transform: translateX({tick.pos === 0 ? '0' : tick.pos === 100 ? '-100%' : '-50%'});">
                            <span class="block transform translate-y-1">{tick.label}</span>
                          </div>
                        {/each}
                      </div>
                    </div>
                  </div>
                </div>
              {:else if card.type === "rating"}
                <RatingCard />
              {:else if card.type === "cost"}
                <div
                  class="bg-white dark:bg-[#383838] dark:border-[#444444] rounded-xl p-6 shadow-sm border border-gray-100 min-w-[320px] w-full"
                >
                  <h3
                    class="text-xl font-bold mb-4 font-sdk text-[#21272C] dark:text-[#FDFDFD]"
                  >
                    {$t("page.totalCost")}
                  </h3>
                  <div
                    class="text-3xl font-black text-[#21272C] dark:text-[#FDFDFD] flex items-center gap-2 font-nums"
                  >
                    <Images id="oroberyl" variant="currency" size={32} />
                    {(billablePulls * 500).toLocaleString("ru-RU")}
                  </div>
                  <div
                    class="text-xs text-gray-400 dark:text-[#B7B6B3] mt-2 font-medium flex items-center"
                  >
                    ≈ <Images id="origeometry" variant="currency" size={20} />
                    {((charPullsOnly * 500) / 75).toFixed(0)}
                    {$t("page.banner.origeometry")}
                  </div>
                </div>
              {/if}
            </div>
          {/each}
        </div>
      {/each}
    </div>
  {/if}
</div>

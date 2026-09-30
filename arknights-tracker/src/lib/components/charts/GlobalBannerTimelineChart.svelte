<script lang="ts">
    import type {
        GlobalTimelineGenericData
    } from "$lib/api/globalBannerStats/contracts/timeline/GlobalTimelineGenericData";
    import { ChartLine } from "$lib/classes/charts/ChartLine";
    import Icon from "$lib/components/Icon.svelte";
    import { t } from "$lib/i18n";
    import { currentLocale, currentUiLocale } from "$lib/stores/locale";
    import { getMap } from "$lib/utils/collectionUtils";
    import { getDateFromISOString, getISODate, formatRate } from "$lib/utils/textUtils";
    import { onMount } from "svelte";
    import { slide } from "svelte/transition";

    export let values: GlobalTimelineGenericData[];
    export let minDate: `${number}-${number}-${number}` | string;
    export let maxDate: `${number}-${number}-${number}` | string;

    const ALL_PRESETS = [
        { id: "48h", labelKey: "global.preset_48h", days: 2 },
        { id: "1w", labelKey: "global.preset_1w", days: 7 },
        { id: "1m", labelKey: "global.preset_1m", days: 30 },
        { id: "3m", labelKey: "global.preset_3m", days: 90 },
        { id: "6m", labelKey: "global.preset_6m", days: 180 },
        { id: "1y", labelKey: "global.preset_1y", days: 365 },
        { id: "3y", labelKey: "global.preset_3y", days: 1095 },
        { id: "6y", labelKey: "global.preset_6y", days: 2190 },
        { id: "9y", labelKey: "global.preset_9y", days: 3285 },
        { id: "12y", labelKey: "global.preset_12y", days: 4380 }
    ];

    let allTimelineData: GlobalTimelineGenericData[] = [];
    let rangeStartIndex: number = 0;
    let rangeEndIndex: number = 0;
    let activePresetId: string = "max";
    let lastDataLength: number = 0;
    let isPresetDropdownOpen: boolean = false;
    let presetDropdownContainer: HTMLDivElement | null = null;

    function handleWindowClick(event: MouseEvent): void {
        if (isPresetDropdownOpen && presetDropdownContainer && !presetDropdownContainer.contains(event.target as Node)) {
            isPresetDropdownOpen = false;
        }
    }

    $: effectiveLocale = $currentUiLocale || $currentLocale || "en";

    $: {
        const todayISO = getISODate(new Date());
        let effectiveMin = minDate ? String(minDate).slice(0, 10) : todayISO;
        let effectiveMax = maxDate ? String(maxDate).slice(0, 10) : todayISO;

        if (effectiveMax > todayISO) {
            effectiveMax = todayISO;
        }
        if (effectiveMin > effectiveMax) {
            effectiveMin = effectiveMax;
        }

        allTimelineData = buildAllTimelineData(values, effectiveMin, effectiveMax);

        if (allTimelineData.length !== lastDataLength) {
            lastDataLength = allTimelineData.length;
            rangeStartIndex = 0;
            rangeEndIndex = Math.max(0, allTimelineData.length - 1);
            activePresetId = "max";
        }
    }

    function buildAllTimelineData(
        rawValues: GlobalTimelineGenericData[] | null,
        minIso: string,
        maxIso: string
    ): GlobalTimelineGenericData[] {
        if (!rawValues) return [];

        const map = getMap(rawValues, (v) => v.date);
        const result: GlobalTimelineGenericData[] = [];

        let cur = getDateFromISOString(minIso as `${number}-${number}-${number}`);
        const max = getDateFromISOString(maxIso as `${number}-${number}-${number}`);

        while (cur.getTime() <= max.getTime()) {
            const iso = getISODate(cur);
            const found = map.get(iso);
            if (found) {
                result.push(found);
            } else {
                result.push({
                    date: iso,
                    totalPulls: 0,
                    rate: 0
                });
            }
            cur = new Date(cur.getTime() + 24 * 60 * 60 * 1000);
        }

        return result;
    }

    $: totalDays = allTimelineData.length;

    $: availablePresets = [
        ...ALL_PRESETS.filter((p) => p.days < totalDays),
        { id: "max", labelKey: "global.preset_max", days: totalDays }
    ];

    function applyPreset(presetId: string, days: number): void {
        activePresetId = presetId;
        if (presetId === "max" || days >= totalDays) {
            rangeStartIndex = 0;
            rangeEndIndex = Math.max(0, totalDays - 1);
        } else {
            rangeEndIndex = Math.max(0, totalDays - 1);
            rangeStartIndex = Math.max(0, rangeEndIndex - days + 1);
        }
    }

    $: visibleValues = allTimelineData.slice(rangeStartIndex, rangeEndIndex + 1);

    $: mainLine = visibleValues.length > 0
        ? new ChartLine(visibleValues.map((v) => v.totalPulls))
        : null;

    $: mainSmoothPath = mainLine?.getSvgPath(100, 100, 8) ?? null;
    $: mainMaxValue = mainLine?.getMaxValue() ?? 1;

    $: miniLine = allTimelineData.length > 0
        ? new ChartLine(allTimelineData.map((v) => v.totalPulls))
        : null;

    $: miniSmoothPath = miniLine?.getSvgPath(40, 100, 4) ?? null;

    $: leftPct = totalDays > 1 ? (rangeStartIndex / (totalDays - 1)) * 100 : 0;
    $: rightPct = totalDays > 1 ? (rangeEndIndex / (totalDays - 1)) * 100 : 100;

    $: displayedAxisDates = getDynamicAxisDates(visibleValues, effectiveLocale, 5);
    $: navigatorDates = getDynamicAxisDates(allTimelineData, effectiveLocale, 4);

    function getDynamicAxisDates(
        items: GlobalTimelineGenericData[],
        locale: string,
        targetCount: number = 5
    ): { text: string; leftPct: number }[] {
        if (!items || items.length === 0) return [];
        if (items.length === 1) {
            return [{ text: formatDateShort(items[0].date, items.length, locale), leftPct: 50 }];
        }

        const count = Math.min(targetCount, items.length);
        const step = (items.length - 1) / (count - 1);
        const result: { text: string; leftPct: number }[] = [];

        for (let i = 0; i < count; i++) {
            const idx = Math.round(i * step);
            const item = items[idx];
            if (item) {
                const text = formatDateShort(item.date, items.length, locale);
                const pct = (idx / (items.length - 1)) * 100;
                result.push({ text, leftPct: pct });
            }
        }

        return result;
    }

    function formatDateShort(dateStr: string, totalSpan: number, locale: string): string {
        try {
            const d = getDateFromISOString(dateStr as `${number}-${number}-${number}`);
            if (totalSpan > 700) {
                return new Intl.DateTimeFormat(locale, { year: "numeric" }).format(d);
            }
            if (totalSpan > 60) {
                return new Intl.DateTimeFormat(locale, { month: "short", year: "numeric" }).format(d);
            }
            return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(d);
        } catch {
            return dateStr;
        }
    }

    function formatFullTooltipDate(dateStr: string, locale: string): string {
        try {
            const d = getDateFromISOString(dateStr as `${number}-${number}-${number}`);
            return new Intl.DateTimeFormat(locale, {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric"
            }).format(d);
        } catch {
            return dateStr;
        }
    }

    function formatYAxisValue(val: number, locale: string): string {
        if (val >= 1_000_000) {
            const num = val / 1_000_000;
            return `${num >= 10 ? Math.round(num) : num.toFixed(1).replace(/\.0$/, "")}M`;
        }
        if (val >= 10_000) {
            const num = val / 1_000;
            return `${num >= 100 ? Math.round(num) : num.toFixed(1).replace(/\.0$/, "")}k`;
        }
        return Math.round(val).toLocaleString(locale);
    }

    let hoveredIndex: number | null = null;

    function onMouseMove(e: MouseEvent & { currentTarget: HTMLDivElement }): void {
        if (!visibleValues || visibleValues.length === 0) return;

        const rect = e.currentTarget.getBoundingClientRect();
        if (rect.width === 0) return;

        const x = e.clientX - rect.left;
        const idx = Math.floor((x / rect.width) * visibleValues.length);
        hoveredIndex = Math.min(Math.max(0, idx), visibleValues.length - 1);
    }

    let navTrackEl: HTMLDivElement | null = null;
    let dragMode: "left" | "right" | "move" | null = null;
    let dragStartX: number = 0;
    let dragStartStartIndex: number = 0;
    let dragStartEndIndex: number = 0;

    function updateActivePresetState(): void {
        if (totalDays > 0 && rangeStartIndex === 0 && rangeEndIndex === totalDays - 1) {
            activePresetId = "max";
        } else {
            activePresetId = "";
        }
    }

    function startDrag(mode: "left" | "right" | "move", e: MouseEvent | TouchEvent): void {
        e.preventDefault();
        e.stopPropagation();
        dragMode = mode;
        const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
        dragStartX = clientX;
        dragStartStartIndex = rangeStartIndex;
        dragStartEndIndex = rangeEndIndex;
        updateActivePresetState();
    }

    function onWindowPointerMove(e: MouseEvent | TouchEvent): void {
        if (!dragMode || !navTrackEl || totalDays <= 1) return;

        const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
        const rect = navTrackEl.getBoundingClientRect();
        if (rect.width === 0) return;

        const deltaPx = clientX - dragStartX;
        const deltaFraction = deltaPx / rect.width;
        const deltaIndices = Math.round(deltaFraction * (totalDays - 1));

        if (dragMode === "left") {
            const newStart = Math.max(0, Math.min(dragStartStartIndex + deltaIndices, rangeEndIndex - 1));
            rangeStartIndex = newStart;
        } else if (dragMode === "right") {
            const newEnd = Math.min(totalDays - 1, Math.max(dragStartEndIndex + deltaIndices, rangeStartIndex + 1));
            rangeEndIndex = newEnd;
        } else if (dragMode === "move") {
            const windowLen = dragStartEndIndex - dragStartStartIndex;
            let newStart = dragStartStartIndex + deltaIndices;
            let newEnd = dragStartEndIndex + deltaIndices;

            if (newStart < 0) {
                newStart = 0;
                newEnd = windowLen;
            } else if (newEnd > totalDays - 1) {
                newEnd = totalDays - 1;
                newStart = Math.max(0, totalDays - 1 - windowLen);
            }

            rangeStartIndex = newStart;
            rangeEndIndex = newEnd;
        }

        updateActivePresetState();
    }

    function onWindowPointerUp(): void {
        if (dragMode) {
            updateActivePresetState();
            dragMode = null;
        }
    }

    function onTrackClick(e: MouseEvent): void {
        if (dragMode || !navTrackEl || totalDays <= 1) return;
        const rect = navTrackEl.getBoundingClientRect();
        if (rect.width === 0) return;

        const clickX = e.clientX - rect.left;
        const clickPct = (clickX / rect.width) * 100;

        if (clickPct < leftPct || clickPct > rightPct) {
            const windowLen = rangeEndIndex - rangeStartIndex;
            const targetCenterIdx = Math.round((clickX / rect.width) * (totalDays - 1));
            let newStart = Math.round(targetCenterIdx - windowLen / 2);
            let newEnd = newStart + windowLen;

            if (newStart < 0) {
                newStart = 0;
                newEnd = Math.min(totalDays - 1, windowLen);
            } else if (newEnd > totalDays - 1) {
                newEnd = totalDays - 1;
                newStart = Math.max(0, totalDays - 1 - windowLen);
            }

            rangeStartIndex = newStart;
            rangeEndIndex = newEnd;
            updateActivePresetState();
        }
    }

    onMount(() => {
        const handleMove = (e: MouseEvent | TouchEvent) => onWindowPointerMove(e);
        const handleUp = () => onWindowPointerUp();

        window.addEventListener("mousemove", handleMove);
        window.addEventListener("mouseup", handleUp);
        window.addEventListener("touchmove", handleMove, { passive: false });
        window.addEventListener("touchend", handleUp);

        return () => {
            window.removeEventListener("mousemove", handleMove);
            window.removeEventListener("mouseup", handleUp);
            window.removeEventListener("touchmove", handleMove);
            window.removeEventListener("touchend", handleUp);
        };
    });

    function getLocalizedPullsTitle(count: number): string {
        const loc = $currentLocale || "ru";
        const keySuffix = new Intl.PluralRules(loc).select(count);
        const fullKey = `global.pull_${keySuffix}`;
        return $t(fullKey) === fullKey ? $t("global.pulls") : $t(fullKey);
    }
</script>

<svelte:window on:click={handleWindowClick} />

<div
    role="figure"
    class="bg-white dark:bg-[#383838] dark:border-[#444444] rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4 relative group overflow-visible"
>
    <div class="flex items-center justify-between gap-3 shrink-0 relative z-5">
        <div class="text-md font-bold text-gray-800 dark:text-[#FDFDFD] z-0">
            {$t("global.pullsPerDay")}
        </div>

        {#if availablePresets.length > 1}
            <div class="hidden sm:flex items-center gap-1 flex-wrap bg-gray-100 dark:bg-[#2b2b2b] p-1 rounded-xl border border-gray-200/80 dark:border-[#444]">
                {#each availablePresets as preset (preset.id)}
                    <button
                        type="button"
                        class="px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer {activePresetId === preset.id
                            ? 'bg-[#FACC15] text-black shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'}"
                        on:click={() => applyPreset(preset.id, preset.days)}
                    >
                        {$t(preset.labelKey)}
                    </button>
                {/each}
            </div>

            <div class="sm:hidden relative z-50" bind:this={presetDropdownContainer}>
                <button
                    type="button"
                    class="bg-gray-100 dark:bg-[#2b2b2b] text-gray-800 dark:text-white text-xs font-bold px-2.5 py-1.5 rounded-lg border border-gray-200/80 dark:border-[#444] flex items-center gap-2 cursor-default select-none shadow-sm transition-colors hover:bg-gray-200 dark:hover:bg-[#383838]"
                    on:click|stopPropagation={() => (isPresetDropdownOpen = !isPresetDropdownOpen)}
                >
                    <span>
                        {#if availablePresets.some((p) => p.id === activePresetId)}
                            {$t(availablePresets.find((p) => p.id === activePresetId)?.labelKey ?? "")}
                        {:else}
                            ---
                        {/if}
                    </span>
                    <Icon name="arrowDown" class="w-3 h-3 text-gray-500 dark:text-gray-400 transition-transform duration-200 {isPresetDropdownOpen ? 'rotate-180' : ''}" />
                </button>

                {#if isPresetDropdownOpen}
                    <div
                        transition:slide={{ duration: 150 }}
                        class="absolute right-0 top-full mt-1.5 z-50 bg-white dark:bg-[#2b2b2b] border border-gray-200 dark:border-[#444] rounded-xl shadow-xl p-1 min-w-[90px] flex flex-col gap-0.5 select-none"
                    >
                        {#each availablePresets as preset (preset.id)}
                            <button
                                type="button"
                                class="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-default {activePresetId === preset.id
                                    ? 'bg-[#FACC15] text-black shadow-sm'
                                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#383838]'}"
                                on:click={() => {
                                    applyPreset(preset.id, preset.days);
                                    isPresetDropdownOpen = false;
                                }}
                            >
                                {$t(preset.labelKey)}
                            </button>
                        {/each}
                    </div>
                {/if}
            </div>
        {/if}
    </div>

    <div class="w-full h-[220px] relative flex flex-col min-h-0 z-0">
        {#if mainSmoothPath && visibleValues.length > 0}
            <div class="flex-1 w-full relative min-h-0">
                <svg
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    class="absolute inset-0 w-full h-full block overflow-visible pointer-events-none z-10"
                >
                    <defs>
                        <linearGradient id="chartGradientMain" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stop-color="#FACC15" stop-opacity="0.45" />
                            <stop offset="100%" stop-color="#FACC15" stop-opacity="0.02" />
                        </linearGradient>
                    </defs>

                    <line x1="0" y1="31" x2="100" y2="31" stroke="currentColor" class="text-gray-200 dark:text-[#444]" stroke-dasharray="2 2" stroke-width="0.5" />
                    <line x1="0" y1="54" x2="100" y2="54" stroke="currentColor" class="text-gray-200 dark:text-[#444]" stroke-dasharray="2 2" stroke-width="0.5" />
                    <line x1="0" y1="77" x2="100" y2="77" stroke="currentColor" class="text-gray-200 dark:text-[#444]" stroke-dasharray="2 2" stroke-width="0.5" />

                    <path
                        d="{mainSmoothPath} V 100 H 0 Z"
                        fill="url(#chartGradientMain)"
                        stroke="none"
                    />

                    <path
                        d={mainSmoothPath}
                        fill="none"
                        stroke="#FACC15"
                        stroke-width="2"
                        vector-effect="non-scaling-stroke"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                </svg>

                <div
                    class="absolute inset-0 w-full h-full z-20 bg-transparent cursor-default"
                    role="application"
                    aria-label="Interactive chart showing pulls history"
                    on:mousemove={onMouseMove}
                    on:mouseleave={() => (hoveredIndex = null)}
                ></div>

                {#if mainMaxValue > 0}
                    <div class="absolute right-1.5 inset-y-0 pointer-events-none select-none text-[9px] font-medium text-gray-400/80 dark:text-[#777] z-10">
                        <span class="absolute right-0 -translate-y-1/2" style="top: 31%;">
                            {formatYAxisValue(mainMaxValue * 0.75, effectiveLocale)}
                        </span>
                        <span class="absolute right-0 -translate-y-1/2" style="top: 54%;">
                            {formatYAxisValue(mainMaxValue * 0.50, effectiveLocale)}
                        </span>
                        <span class="absolute right-0 -translate-y-1/2" style="top: 77%;">
                            {formatYAxisValue(mainMaxValue * 0.25, effectiveLocale)}
                        </span>
                    </div>
                {/if}

                {#if hoveredIndex !== null && visibleValues[hoveredIndex]}
                    {@const hoveredData = visibleValues[hoveredIndex]}
                    {@const leftPos = visibleValues.length > 1 ? (hoveredIndex / (visibleValues.length - 1)) * 100 : 50}
                    {@const topPos = 100 - (hoveredData.totalPulls / mainMaxValue) * 92}

                    <div class="absolute inset-0 z-30 pointer-events-none">
                        <div
                            class="absolute top-0 bottom-0 w-px bg-gray-300 dark:bg-gray-600 border-r border-dashed border-gray-400"
                            style="left: {leftPos}%;"
                        ></div>

                        <div
                            class="absolute w-3 h-3 rounded-full border-2 border-white dark:border-[#383838] bg-[#FACC15] transform -translate-x-1/2 -translate-y-1/2 shadow"
                            style="left: {leftPos}%; top: {topPos}%;"
                        ></div>

                        <div
                            class="absolute z-50 pointer-events-none"
                            style="left: {leftPos}%; top: {Math.max(8, topPos)}%; transform: translate({leftPos > 75 ? '-100%' : leftPos < 25 ? '0%' : '-50%'}, -100%); margin-top: -8px;"
                        >
                            <div class="relative px-3 py-1.5 bg-gray-900 dark:bg-[#1E1E1E] text-white text-xs rounded-lg shadow-xl whitespace-nowrap flex flex-col gap-0.5 leading-tight">
                                <div class="text-gray-400 text-[10px]">
                                    {formatFullTooltipDate(hoveredData.date, effectiveLocale)}
                                </div>
                                <div class="flex items-center gap-1.5 text-xs">
                                    <span class="font-bold text-white">
                                        {hoveredData.totalPulls.toLocaleString(effectiveLocale)}
                                    </span>
                                    <span class="text-[#FACC15] font-semibold text-[11px]">
                                        {getLocalizedPullsTitle(hoveredData.totalPulls)}
                                    </span>
                                    {#if hoveredData.rate !== undefined && hoveredData.rate > 0}
                                        <span class="text-gray-400 text-[10px] ml-1">
                                            ({formatRate(hoveredData.rate, 2, effectiveLocale)})
                                        </span>
                                    {/if}
                                </div>

                                <span
                                    class="absolute top-full -mt-px border-4 border-transparent border-t-gray-900 dark:border-t-[#1E1E1E]"
                                    style="left: {leftPos > 75 ? '85%' : leftPos < 25 ? '15%' : '50%'}; transform: translateX(-50%);"
                                ></span>
                            </div>
                        </div>
                    </div>
                {/if}
            </div>

            <div class="h-6 mt-1.5 relative w-full text-[10px] font-medium text-gray-400 dark:text-[#888] select-none border-t border-dashed border-gray-100 dark:border-[#444] pt-1 shrink-0">
                {#each displayedAxisDates as d, i}
                    <span
                        class="absolute whitespace-nowrap {i === 0 ? 'text-left' : i === displayedAxisDates.length - 1 ? 'text-right' : 'text-center'} {i % 2 === 1 ? 'hidden sm:block' : ''}"
                        style="left: {d.leftPct}%; transform: translateX({i === 0 ? '0%' : i === displayedAxisDates.length - 1 ? '-100%' : '-50%'});"
                    >
                        {d.text}
                    </span>
                {/each}
            </div>
        {:else}
            <div class="absolute inset-0 flex flex-col items-center justify-center text-gray-300 dark:text-[#666]">
                <Icon name="noData" class="w-8 h-8 mb-2 opacity-30" />
                <span class="text-xs font-medium opacity-50">
                    {$t("global.noData")}
                </span>
            </div>
        {/if}
    </div>

    {#if allTimelineData.length > 2}
        <div class="flex flex-col gap-1 pt-1">
            <div
                bind:this={navTrackEl}
                class="w-full h-11 border border-gray-200 dark:border-[#444] relative overflow-hidden bg-transparent cursor-default"
                on:click={onTrackClick}
                on:keydown={(e) => {
                    if (e.key === "ArrowLeft") {
                        rangeStartIndex = Math.max(0, rangeStartIndex - 1);
                        rangeEndIndex = Math.max(rangeStartIndex + 1, rangeEndIndex - 1);
                        updateActivePresetState();
                    } else if (e.key === "ArrowRight") {
                        rangeEndIndex = Math.min(totalDays - 1, rangeEndIndex + 1);
                        rangeStartIndex = Math.min(rangeEndIndex - 1, rangeStartIndex + 1);
                        updateActivePresetState();
                    }
                }}
                role="slider"
                tabindex="0"
                aria-label="Timeline range navigator"
                aria-valuenow={rangeStartIndex}
                aria-valuemin={0}
                aria-valuemax={totalDays - 1}
            >
                {#if miniSmoothPath}
                    <svg
                        viewBox="0 0 100 40"
                        preserveAspectRatio="none"
                        class="absolute inset-0 w-full h-full block opacity-40 pointer-events-none"
                    >
                        <path
                            d="{miniSmoothPath} V 40 H 0 Z"
                            fill="#FACC15"
                            fill-opacity="0.25"
                            stroke="none"
                        />
                        <path
                            d={miniSmoothPath}
                            fill="none"
                            stroke="#FACC15"
                            stroke-width="1.5"
                            vector-effect="non-scaling-stroke"
                        />
                    </svg>
                {/if}

                <div
                    class="absolute top-0 bottom-0 bg-[#FACC15]/15 dark:bg-[#54a5ff]/15 cursor-default"
                    style="left: calc({leftPct}% - {leftPct * 0.12}px); width: calc({rightPct - leftPct}% + {(leftPct - rightPct) * 0.12 + 12}px);"
                    on:mousedown={(e) => startDrag("move", e)}
                    on:touchstart={(e) => startDrag("move", e)}
                    role="button"
                    tabindex="0"
                    aria-label="Drag selection window"
                ></div>

                <div
                    class="absolute top-0 bottom-0 w-3 flex items-center justify-center bg-[#FACC15] dark:bg-[#3884d8] border border-white/40 dark:border-black/30 z-20 shadow-md cursor-ew-resize"
                    style="left: calc({leftPct}% - {leftPct * 0.12}px);"
                    on:mousedown={(e) => startDrag("left", e)}
                    on:touchstart={(e) => startDrag("left", e)}
                    role="slider"
                    tabindex="0"
                    aria-label="Drag left range handle"
                    aria-valuenow={rangeStartIndex}
                >
                    <div class="flex gap-[1px]">
                        <div class="w-[1px] h-3 bg-black/70 dark:bg-white/90 rounded-full"></div>
                        <div class="w-[1px] h-3 bg-black/70 dark:bg-white/90 rounded-full"></div>
                    </div>
                </div>

                <div
                    class="absolute top-0 bottom-0 w-3 flex items-center justify-center bg-[#FACC15] dark:bg-[#3884d8] border border-white/40 dark:border-black/30 z-20 shadow-md cursor-ew-resize"
                    style="left: calc({rightPct}% - {rightPct * 0.12}px);"
                    on:mousedown={(e) => startDrag("right", e)}
                    on:touchstart={(e) => startDrag("right", e)}
                    role="slider"
                    tabindex="0"
                    aria-label="Drag right range handle"
                    aria-valuenow={rangeEndIndex}
                >
                    <div class="flex gap-[1px]">
                        <div class="w-[1px] h-3 bg-black/70 dark:bg-white/90 rounded-full"></div>
                        <div class="w-[1px] h-3 bg-black/70 dark:bg-white/90 rounded-full"></div>
                    </div>
                </div>
            </div>

            <div class="h-4 relative w-full text-[9px] font-medium text-gray-400 dark:text-[#787878] select-none mt-1">
                {#each navigatorDates as d, i}
                    <span
                        class="absolute whitespace-nowrap {i === 0 ? 'text-left' : i === navigatorDates.length - 1 ? 'text-right' : 'text-center'} {i > 0 && i < navigatorDates.length - 1 ? 'hidden sm:block' : ''}"
                        style="left: {d.leftPct}%; transform: translateX({i === 0 ? '0%' : i === navigatorDates.length - 1 ? '-100%' : '-50%'});"
                    >
                        {d.text}
                    </span>
                {/each}
            </div>
        </div>
    {/if}
</div>
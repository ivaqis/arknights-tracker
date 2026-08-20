<script lang="ts">
    import type {
        GlobalTimelineGenericData
    } from "$lib/api/globalBannerStats/contracts/timeline/GlobalTimelineGenericData";
    import { ChartLine } from "$lib/classes/charts/ChartLine";
    import Icon from "$lib/components/Icon.svelte";
    import { t } from "$lib/i18n";
    import { currentLocale } from "$lib/stores/locale";
    import { getMap } from "$lib/utils/collectionUtils";
    import { getDateFromISOString, getISODate } from "$lib/utils/textUtils";

    export let values: GlobalTimelineGenericData[] | null;

    export let minDate: `${number}-${number}-${number}`;
    export let maxDate: `${number}-${number}-${number}`;

    export let maxDisplayedDatesCount: number = 5;

    let displayedValues: GlobalTimelineGenericData[] | null;
    let line: ChartLine | null;
    let smoothPath: string | null;
    let maxValue: number;
    let displayedDates: string[];

    $: {
        displayedValues = getDisplayedValues(values, minDate, maxDate);
        line = displayedValues === null ? null : new ChartLine(displayedValues.map(item => item.totalPulls));
        smoothPath = line?.getSvgPath(100, 100) ?? null;
        maxValue = line?.getMaxValue() ?? 1;
        displayedDates = getDisplayedDates(displayedValues?.map(item => item.date) ?? []);
    }

    function getDisplayedValues(values: GlobalTimelineGenericData[] | null, min: `${number}-${number}-${number}`, max: `${number}-${number}-${number}`): GlobalTimelineGenericData[] | null {
        if (!values || !values.length) {
            return null;
        }

        const map: Map<string, GlobalTimelineGenericData> = getMap(values, v => v.date);

        const result: GlobalTimelineGenericData[] = [];

        for (let i = min; i <= max; i = getISODate(new Date(getDateFromISOString(i).getTime() + 1000 * 60 * 60 * 24))) {
            const value = map.get(i);

            if (value) {
                result.push(value);
            } else {
                result.push({
                    date: i,
                    totalPulls: 0,
                    rate: 0
                });
            }
        }

        return result;
    }

    function getDisplayedDates(dates: string[]): string[] {
        if (dates.length <= maxDisplayedDatesCount) {
            return dates;
        }

        const step = (dates.length - 1) / (maxDisplayedDatesCount - 1);

        return Array.from({ length: maxDisplayedDatesCount }, (_, i) => {
            const index = Math.round(i * step);
            const item = dates[index] || dates[dates.length - 1];
            return item ? item : "";
        });
    }

    let hoveredIndex: number | null = null;

    function onMouseMove(e: MouseEvent & { currentTarget: (EventTarget & HTMLDivElement) }): void {
        if (!displayedValues) {
            return;
        }

        const rect = e.currentTarget.getBoundingClientRect();

        const x = e.clientX - rect.left;

        if (rect.width === 0) {
            return;
        }

        const idx = Math.floor((x / rect.width) * displayedValues.length,);

        hoveredIndex = Math.min(
            Math.max(0, idx),
            displayedValues.length - 1,
        );
    }

    function getLocalizedPullsTitle(count: number): string {
        const loc = $currentLocale || "ru";

        const keySuffix = new Intl.PluralRules(loc).select(count);
        const fullKey = `global.pull_${keySuffix}`;

        return $t(fullKey) === fullKey
            ? $t("global.pulls")
            : $t(fullKey);
    }
</script>

<div
    role="figure"
    class="bg-white dark:bg-[#383838] dark:border-[#444444] rounded-xl p-5 shadow-sm border border-gray-100 h-[240px] flex flex-col relative group overflow-visible"
>

    <div class="flex justify-between items-center mb-4 shrink-0 relative z-10">

        <div class="text-xs font-bold text-gray-800 dark:text-[#FDFDFD]">
            {$t("global.pullsPerDay")}
        </div>

    </div>

    <div class="flex-1 flex flex-col min-h-0 relative">

        <div class="flex-1 w-full relative min-h-0">

            {#if smoothPath && displayedValues}

                <svg
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    class="absolute inset-0 w-full h-full block overflow-visible pointer-events-none z-10"
                >

                    <defs>
                        <linearGradient
                            id="chartGradient"
                            x1="0"
                            x2="0"
                            y1="0"
                            y2="1"
                        >

                            <stop
                                offset="0%"
                                stop-color="#FACC15"
                                stop-opacity="0.4"
                            />

                            <stop
                                offset="100%"
                                stop-color="#FACC15"
                                stop-opacity="0"
                            />

                        </linearGradient>
                    </defs>

                    <path
                        d="{smoothPath} V 100 H 0 Z"
                        fill="url(#chartGradient)"
                        stroke="none"
                    />

                    <path
                        d={smoothPath}
                        fill="none"
                        stroke="#FACC15"
                        stroke-width="2"
                        vector-effect="non-scaling-stroke"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />

                </svg>

                <div
                    class="absolute inset-0 w-full h-full z-20 bg-transparent"
                    role="application"
                    aria-label="Interactive chart showing pulls history per day"
                    on:mousemove={onMouseMove}
                    on:mouseleave={() => hoveredIndex = null}
                ></div>

                {#if hoveredIndex !== null && displayedValues[hoveredIndex]}

                    {@const hoveredData = displayedValues[hoveredIndex]}
                    {@const leftPos = (hoveredIndex / (displayedValues.length - 1)) * 100}
                    {@const topPos = 100 - (hoveredData.totalPulls / maxValue) * 100}

                    <div class="absolute inset-0 z-30 pointer-events-none">

                        <div
                            class="absolute top-0 bottom-0 w-px bg-gray-300 dark:bg-gray-600 border-r border-dashed border-gray-400"
                            style="left: {leftPos}%;"
                        ></div>

                        <div
                            class="absolute w-3 h-3 rounded-full border-2 border-white dark:border-[#383838] bg-[#FACC15] transform -translate-x-1/2 -translate-y-1/2"
                            style="left: {leftPos}%; top: {topPos}%;"
                        ></div>

                        <div
                            class="absolute top-0 transition-transform duration-75 ease-out"
                            style="left: {leftPos}%; transform: translateX({leftPos > 60  ? '-105%' : '5%'});"
                        >

                            <div class="bg-white/95 dark:bg-[#2C2C2C]/95 backdrop-blur-sm text-xs rounded-md p-2 shadow-lg border border-black/5 dark:border-white/10 mt-1 min-w-[70px]">

                                <div class="text-gray-400 font-medium mb-0.5 text-[10px] uppercase tracking-wide">
                                    {hoveredData.date}
                                </div>

                                <div class="flex items-center gap-1.5">

                                    <span class="font-black text-[#21272C] dark:text-[#FDFDFD] font-nums leading-none">
                                        {hoveredData.totalPulls}
                                    </span>

                                    <span class="text-[#FACC15] font-bold text-[10px] leading-none mt-0.5">
                                        {getLocalizedPullsTitle(hoveredData.totalPulls)}
                                    </span>

                                </div>

                            </div>

                        </div>

                    </div>

                {/if}

            {:else}

                <div class="absolute inset-0 flex flex-col items-center justify-center text-gray-300 dark:text-[#666]">

                    <Icon
                        name="noData"
                        className="w-8 h-8 mb-2 opacity-30"
                    />

                    <span class="text-xs font-medium opacity-50">
                        {$t("global.noData") || "No Data"}
                    </span>

                </div>

            {/if}

        </div>

        <div class="h-5 mt-1 flex justify-between items-center text-[9px] font-medium text-gray-400 dark:text-[#787878] select-none border-t border-dashed border-gray-100 dark:border-[#444] pt-1 shrink-0 z-0">

            {#each displayedDates as date}

                <span>
                    {date}
                </span>

            {/each}

        </div>

    </div>

</div>
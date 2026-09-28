<script lang="ts">
    import type {
        GlobalPityDistributionData
    } from "$lib/api/globalBannerStats/contracts/pityDistribution/GlobalPityDistributionData";
    import type { Rarity } from "$lib/classes/Rarity";
    import { t } from "$lib/i18n";
    import { getMap } from "$lib/utils/collectionUtils";
    import Icon from "$lib/components/Icon.svelte";
    import Tooltip from "$lib/components/Tooltip.svelte";
    import { formatRate } from "$lib/utils/textUtils";
    import { currentLocale, currentUiLocale } from "$lib/stores/locale";

    export let values: GlobalPityDistributionData[];
    export let rarity: Rarity;
    export let maxPity: number;

    let displayedValues: GlobalPityDistributionData[] | null;
    let displayedPities: string[];

    $: effectiveLocale = $currentUiLocale || $currentLocale || "en";

    $: {
        displayedValues = getDisplayedValues(values, maxPity);
        displayedPities = getDisplayedPities(maxPity);
    }

    function getDisplayedValues(values: GlobalPityDistributionData[], maxPity: number): GlobalPityDistributionData[] | null {
        const filtered = values.filter(v => 1 <= v.pity && v.pity <= maxPity);

        if (filtered.length === 0) {
            return null;
        }

        const map = getMap(filtered, item => item.pity);

        const result: GlobalPityDistributionData[] = [];

        for (let i = 1; i <= maxPity; i++) {
            const item = map.get(i);

            if (item) {
                result.push(item);
            } else {
                result.push({
                    pity: i,
                    count: 0,
                    rate: 0
                });
            }
        }

        return result;
    }

    function getDisplayedPities(maxPity: number): string[] {
        if (maxPity <= 5) {
            const result: string[] = [];

            for (let i = 1; i <= maxPity; i++) {
                result.push(String(i));
            }

            return result;
        }

        return [
            "1",
            String(Math.floor(maxPity / 4)),
            String(Math.floor(maxPity / 2)),
            String(Math.floor(maxPity / 4 * 3)),
            String(maxPity)
        ];
    }

    function getMaxValue(list: GlobalPityDistributionData[]): number {
        return list.reduce((max, item) => item.count > max ? item.count : max, 1);
    }
</script>

<div class="bg-white dark:bg-[#383838] dark:border-[#444444] rounded-xl p-5 shadow-sm border border-gray-100 h-[220px] flex flex-col z-0">
    <div class="text-md font-bold text-gray-800 dark:text-[#FDFDFD] mb-4 flex items-center gap-0.5">
        {$t("global.pityDist")}
        {rarity}
        <Icon
            name="star"
            class="w-3.5 h-3.5 text-gray-800 dark:text-[#FDFDFD]"
        />
    </div>

    <div class="flex-1 w-full relative flex items-end gap-[1px]">
        {#if displayedValues}
            {@const maxValue = getMaxValue(displayedValues)}

            {#each displayedValues as data (data.pity)}
                {@const height = (data.count / maxValue) * 100}

                <div
                    class="flex-1 bg-gray-100 dark:bg-[#2C2C2C] relative flex items-end rounded-t-sm h-full"
                >
                    {#if data.count > 0}
                        <Tooltip class="w-full h-full flex items-end">
                            <div
                                class="w-full bg-[#D4BE48] hover:bg-[#FACC15] transition-all duration-200 cursor-default"
                                style="height: {height}%;"
                            ></div>

                            <div slot="content" class="flex flex-col gap-0.5 text-[11px] font-mono leading-tight whitespace-nowrap">
                                <div class="text-gray-300">
                                    {$t("global.roll")} <span class="text-white font-bold">{data.pity}</span>
                                </div>
                                <div class="text-gray-300">
                                    {$t("global.total")} <span class="text-white font-bold">{data.count.toLocaleString(effectiveLocale)}</span>
                                </div>
                                <div class="text-gray-300">
                                    {$t("global.percent")} <span class="text-[#FACC15] font-bold">{formatRate(data.rate, 2, effectiveLocale)}</span>
                                </div>
                            </div>
                        </Tooltip>
                    {/if}
                </div>
            {/each}
        {:else}
            <div class="w-full h-full flex flex-col items-center justify-center text-gray-300 dark:text-[#666]">
                <Icon
                    name="noData"
                    class="w-8 h-8 mb-2 opacity-50"
                />
                <span class="text-xs">
                    {$t("global.noData")}
                </span>
            </div>
        {/if}
    </div>

    <div class="flex justify-between text-[10px] text-gray-400 dark:text-[#B7B6B3] mt-2 px-1">
        {#each displayedPities as pity}
            <span>
                {pity}
            </span>
        {/each}
    </div>
</div>
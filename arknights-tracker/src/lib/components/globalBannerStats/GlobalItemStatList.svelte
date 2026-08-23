<script lang="ts">
    import type { GlobalItemStatData } from "$lib/api/globalBannerStats/contracts/items/GlobalItemStatData";
    import type { Banner } from "$lib/classes/banners/Banner";
    import { Character } from "$lib/classes/characters/Character";
    import type { Rarity } from "$lib/classes/Rarity";
    import { Weapon } from "$lib/classes/weapons/Weapon";
    import Icon from "$lib/components/Icon.svelte";
    import Image from "$lib/components/Image.svelte";
    import { t } from "$lib/i18n";
    import { formatCount, formatRate } from "$lib/utils/textUtils";

    export let items: GlobalItemStatData[];

    export let rarity: Rarity;
    export let banner: Banner;

    let displayedData: DisplayedItemData[] | null;
    let headerColor: string;

    $: displayedData = getDisplayedItemData(items, banner);
    $: headerColor = getHeaderColor(rarity);

    function getDisplayedItemData(items: GlobalItemStatData[], banner: Banner): DisplayedItemData[] | null {
        if (items.length === 0) {
            return null;
        }

        const result: DisplayedItemData[] = [];

        for (const data of items) {
            const item = Character.getByGameId(data.itemId)
                ?? Weapon.getByGameId(data.itemId);

            if (!item) {
                continue;
            }

            result.push({
                item,
                count: data.count,
                rate: data.rate,
                isFeatured: banner.isFeatured(data.itemId)
            });
        }

        result.sort((a, b) => b.count - a.count);

        return result;
    }

    function getHeaderColor(rarity: Rarity): string {
        switch (rarity) {
            case 6:
                return "#D0926E";
            default:
                return "#E3BC55";
        }
    }

    function getItemColor(rarity: Rarity): string {
        switch (rarity) {
            case 6:
                return "#D84C38";
            default:
                return "#E3BC55";
        }
    }

    interface DisplayedItemData {
        item: Character | Weapon;
        count: number;
        rate: number;
        isFeatured: boolean;
    }

</script>


<div class="bg-white dark:bg-[#383838] dark:border-[#444444] rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col h-auto">

    <div class="p-4 border-b border-gray-100 dark:border-[#444] flex items-center justify-center gap-2 shrink-0 bg-white dark:bg-[#383838]">

        <h3 class="font-bold text-[{headerColor}] text-lg flex items-center gap-1">

            {rarity}

            <Icon
                name="star"
                class="w-4 h-4"
            />

            {$t("global.list")}

        </h3>

    </div>

    <div class="w-full">

        <table class="w-full text-sm text-left">

            <thead class="text-xs text-gray-500 dark:text-[#B7B6B3] uppercase bg-gray-50 dark:bg-[#2C2C2C]">

            <tr>

                <th class="px-4 py-3 font-bold">
                    {$t("global.name")}
                </th>

                <th class="px-4 py-3 font-bold text-right">
                    {$t("global.total")}
                </th>

                <th class="px-4 py-3 font-bold text-right">
                    %
                </th>

            </tr>

            </thead>

            <tbody class="divide-y divide-gray-100 dark:divide-[#444]">

            {#if displayedData}

                {#each displayedData as data}

                    {@const itemColor = getItemColor(data.item.rarity)}

                    <tr class="hover:bg-gray-50 dark:hover:bg-[#444] transition-colors group">

                        <td class="px-4 py-2 font-medium text-gray-900 dark:text-[#FDFDFD] flex items-center gap-3 relative">

                            {#if data.isFeatured}

                                <div
                                    class="absolute left-0 top-0 bottom-0 w-1"
                                    style="background-color: {itemColor};"
                                ></div>

                            {/if}

                            <div
                                class="w-10 h-10 rounded-full bg-gray-200 dark:bg-[#1E1E1E] overflow-hidden border-2 shrink-0"
                                style="border-color: {itemColor};"
                            >

                                <Image
                                    id={data.item.iconId}
                                    variant={data.item.imageVariant}
                                    className="w-full h-full object-cover transform scale-110"
                                    alt={data.item.name}
                                />

                            </div>

                            <span title={data.item.name}>
                                {$t(data.item.i18nKey)}
                            </span>

                        </td>

                        <td class="px-4 py-2 text-right font-nums font-bold text-gray-900 dark:text-[#FDFDFD]">
                            {formatCount(data.count)}
                        </td>

                        <td class="px-4 py-2 text-right font-nums text-gray-500 dark:text-[#B7B6B3]">
                            {formatRate(data.rate, 2)}
                        </td>

                    </tr>

                {/each}

            {:else}

                <tr>

                    <td
                        colspan="3"
                        class="px-4 py-10"
                    >

                        <div class="flex flex-col items-center justify-center gap-2 text-gray-300 dark:text-[#666]">

                            <Icon
                                name="noData"
                                className="w-8 h-8 opacity-50"
                            />

                            <span class="text-xs">
                                {$t("global.noData")}
                            </span>

                        </div>

                    </td>

                </tr>

            {/if}

            </tbody>

        </table>

    </div>

</div>
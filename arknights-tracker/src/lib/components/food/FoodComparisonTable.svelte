<script lang="ts">
    import { FieldValueComparator } from "$lib/classes/comparators/FieldValueComparator";
    import { EquipableItemConditionType } from "$lib/classes/gameData/items/equipable/EquipableItemConditionType";
    import type { IFood } from "$lib/classes/gameData/items/food/IFood";
    import type { IFoodBuff } from "$lib/classes/gameData/items/food/IFoodBuff";
    import type { IItem } from "$lib/classes/gameData/items/IItem";
    import type { SortDirection } from "$lib/classes/SortDirection";
    import { CardSize } from "$lib/components/cards/CardSize";
    import ItemStackCard from "$lib/components/cards/ItemStackCard.svelte";
    import FoodComparisonTableSortButton from "$lib/components/food/FoodComparisonTableSortButton.svelte";
    import { t } from "$lib/i18n";
    import { splitEquipmentView } from "$lib/stores/settings";

    type CondType = EquipableItemConditionType | "null";
    type SortFieldType = "name" | "buff" | "tactical";
    type SortTacticalField =
        | "condType"
        | "castTime"
        | "castCount"
        | "castToMainCount"
        | "cooldown"
        | "recoverTime"
        | "recoverUpperCount";
    type DisplayedBuffValueTitle = { key: string; i18nKey: string };
    type DisplayedBuffTitle = { buffId: string; i18nKey: string; values: DisplayedBuffValueTitle[] };

    export let foodList: readonly IFood[];
    export let buffList: readonly string[];
    export let condTypeOrderList: readonly CondType[];
    export let selectItemFn: (item: IItem) => void;
    export let selectedItem: IFood | null = null;

    const sortTacticalFieldOrder: { key: SortTacticalField; i18nKey: string }[] = [
        {
            key: "condType",
            i18nKey: "tacticalTitle.condType"
        },
        {
            key: "castTime",
            i18nKey: "tacticalTitle.castTime"
        },
        {
            key: "castCount",
            i18nKey: "tacticalTitle.castCount"
        },
        {
            key: "castToMainCount",
            i18nKey: "tacticalTitle.castToMainCountShort"
        },
        {
            key: "cooldown",
            i18nKey: "tacticalTitle.cooldown"
        },
        {
            key: "recoverTime",
            i18nKey: "tacticalTitle.recoverTime"
        },
        {
            key: "recoverUpperCount",
            i18nKey: "tacticalTitle.recoverUpperCount"
        }
    ];

    let sortDirection: SortDirection = "desc";
    let sortFieldType: SortFieldType = "name";
    let sortBuffId: string | null = null;
    let sortBuffValue: "null" | string | null = null;
    let sortTacticalField: SortTacticalField | null = null;

    let condTypeComparator = new FieldValueComparator<IFood, CondType>(item => item.tactical?.condType ?? "null");

    $: if (condTypeOrderList) {
        condTypeComparator.setValueOrder(condTypeOrderList);
    }

    let sortedItems: IFood[];

    $: sortedItems = getSortedItems(foodList, condTypeOrderList, sortFieldType, sortBuffId, sortBuffValue, sortTacticalField, sortDirection);

    function toggleNameSort(currentDirection: SortDirection | null) {
        sortFieldType = "name";

        if (currentDirection === null || currentDirection === "asc") {
            sortDirection = "desc";
        } else {
            sortDirection = "asc";
        }
    }

    function toggleBuffSort(buffId: string, buffValue: string, currentDirection: SortDirection | null) {
        sortFieldType = "buff";
        sortBuffId = buffId;
        sortBuffValue = buffValue;

        if (currentDirection === null || currentDirection === "asc") {
            sortDirection = "desc";
        } else {
            sortDirection = "asc";
        }
    }

    function toggleTacticalSort(field: SortTacticalField, currentDirection: SortDirection | null) {
        sortFieldType = "tactical";
        sortTacticalField = field;

        if (currentDirection === null || currentDirection === "asc") {
            sortDirection = "desc";
        } else {
            sortDirection = "asc";
        }
    }

    function getSortedItems(items: readonly IFood[],
                            condTypeOrderList: readonly CondType[],
                            sortFieldType: SortFieldType,
                            sortBuffId: string | null,
                            sortBuffValue: "null" | string | null,
                            sortTacticalField: SortTacticalField | null,
                            sortDirection: SortDirection
    ): IFood[] {
        const reverseMultiplier = sortDirection === "asc" ? -1 : 1;

        return items.toSorted((a, b) => {
            if (sortFieldType === "name") {
                return $t(a.i18nKey).localeCompare($t(b.i18nKey)) * reverseMultiplier;
            }

            if (sortFieldType === "buff" && sortBuffId && sortBuffValue) {
                if (sortBuffValue === "null") {
                    const hasA = a.hasBuff(sortBuffId);
                    const hasB = b.hasBuff(sortBuffId);

                    return (Number(hasB) - Number(hasA)) * reverseMultiplier;
                }

                const valueA = a.getBuff(sortBuffId)?.getBBEntry(sortBuffValue)?.value;
                const valueB = b.getBuff(sortBuffId)?.getBBEntry(sortBuffValue)?.value;

                if (valueA === undefined) {
                    return 1 * reverseMultiplier;
                }
                if (valueB === undefined) {
                    return -1 * reverseMultiplier;
                }

                return (valueB - valueA) * reverseMultiplier;
            }

            if (sortFieldType === "tactical" && sortTacticalField) {
                if (sortTacticalField === "condType") {
                    return condTypeComparator.compare(a, b) * reverseMultiplier;
                }

                const tacticalA = a.tactical;
                const tacticalB = b.tactical;

                if (tacticalA === null) {
                    return 1 * reverseMultiplier;
                }

                if (tacticalB === null) {
                    return -1 * reverseMultiplier;
                }

                let valueA = tacticalA[sortTacticalField];
                let valueB = tacticalB[sortTacticalField];

                if (sortTacticalField === "castToMainCount" || sortTacticalField === "castCount") {
                    if (valueA === 0) {
                        valueA = +Infinity;
                    }
                    if (valueB === 0) {
                        valueB = +Infinity;
                    }
                }

                return (valueB - valueA) * reverseMultiplier;
            }

            return 0;
        });
    }

    let displayedBuffTitles: DisplayedBuffTitle[] = [];

    $: displayedBuffTitles = getDisplayedBuffTitles(foodList, buffList);

    function getDisplayedBuffTitles(foodList: readonly IFood[], buffList: readonly string[]): DisplayedBuffTitle[] {
        const result: DisplayedBuffTitle[] = [];

        for (const buffId of buffList) {
            let buff: IFoodBuff | null = null;

            for (const food of foodList) {
                const containingBuff = food.getBuff(buffId);

                if (containingBuff) {
                    buff = containingBuff;

                    break;
                }
            }

            if (!buff) {
                continue;
            }

            result.push(getDisplayedBuffTitle(buff));
        }

        return result;
    }

    function getDisplayedBuffTitle(buff: IFoodBuff): DisplayedBuffTitle {
        return {
            buffId: buff.buffId,
            i18nKey: buff.i18nKey,
            values: buff.blackboard
                .filter(entry => entry.displayable)
                .map(entry => ({
                    key: entry.key,
                    i18nKey: `buffsShort.${buff.buffId}.${entry.key}`
                }))
        };
    }

</script>


<table class="rounded-xl min-w-full">

    <thead class="bg-gray-200 dark:bg-[#424242] font-sdk font-bold text-sm text-gray-700 dark:text-[#FDFDFD] sticky top-0 z-50">

    <tr>
        <th
            class="relative p-0"
            rowspan="2"
            style="min-width: 250px; min-height: 500px;"
        >
            <div class="absolute inset-0">
                <FoodComparisonTableSortButton
                    onClick={(cur) => toggleNameSort(cur)}
                    sortDirection={sortFieldType === "name" ? sortDirection : null}
                >
                    {$t("page.food.table.name")}
                </FoodComparisonTableSortButton>
            </div>
        </th>

        {#each displayedBuffTitles as buffTitle}

            <th colspan="{buffTitle.values.length}">
                <div class="px-4 py-2">
                    {$t(buffTitle.i18nKey)}
                </div>
            </th>

        {/each}

        {#each sortTacticalFieldOrder as entry}

            <th rowspan="2">
                <FoodComparisonTableSortButton
                    sortDirection={(sortFieldType === "tactical" && sortTacticalField === entry.key) ? sortDirection : null}
                    onClick={cur => toggleTacticalSort(entry.key, cur)}
                >
                    {$t(entry.i18nKey)}
                </FoodComparisonTableSortButton>
            </th>

        {/each}

    </tr>

    <tr>

        {#each displayedBuffTitles as buff}

            {#if buff.values.length > 0}

                {#each buff.values as buffValue}

                    <th>
                        <FoodComparisonTableSortButton
                            sortDirection={(sortFieldType === "buff" && sortBuffId === buff.buffId && sortBuffValue === buffValue.key) ? sortDirection : null}
                            onClick={(cur) => toggleBuffSort(buff.buffId, buffValue.key, cur)}
                        >
                            {$t(buffValue.i18nKey)}
                        </FoodComparisonTableSortButton>
                    </th>

                {/each}

            {:else}

                <th>
                    <FoodComparisonTableSortButton
                        sortDirection={(sortFieldType === "buff" && sortBuffId === buff.buffId && sortBuffValue === "null") ? sortDirection : null}
                        onClick={(cur) => toggleBuffSort(buff.buffId, "null", cur)}
                    >
                        {$t("page.food.table.hasBuff")}
                    </FoodComparisonTableSortButton>
                </th>

            {/if}

        {/each}


    </tr>

    </thead>

    <tbody class="bg-white dark:bg-[#383838] font-sdk text-sm text-gray-700 dark:text-[#FDFDFD]">

    {#each sortedItems as food}

        {@const tactical = food.tactical}

        <tr class="odd:bg-white dark:odd:bg-[#363636] even:bg-gray-100 dark:even:bg-[#393939]">

            <td>
                <div class="flex flex-row items-center gap-2 p-2">

                    {#if $splitEquipmentView}

                        <button
                            tabindex="0"
                            on:click|preventDefault|stopPropagation={() => selectItemFn(food)}
                        >

                            <ItemStackCard
                                item={food}
                                size={CardSize.MICRO}
                                showHoverEffect={true}
                                highlight={selectedItem?.gameId === food.gameId}
                            />

                        </button>

                    {:else}

                        <ItemStackCard
                            item={food}
                            size={CardSize.MICRO}
                            showHoverEffect={true}
                            highlight={selectedItem?.gameId === food.gameId}
                            url="/food/{food.gameId}"
                        />

                    {/if}

                    <div class="text-center flex-1">
                        {$t(food.i18nKey)}
                    </div>

                </div>
            </td>

            {#each displayedBuffTitles as buffTitle}

                {@const buff = food.getBuff(buffTitle.buffId)}

                {#if buffTitle.values.length > 0}

                    {#each buffTitle.values as buffValue}

                        {@const entry = buff?.getBBEntry(buffValue.key) ?? null}

                        <td>

                            {#if entry}

                                <div class="p-2 text-right">
                                    {entry.getFormattedValue($t)}
                                </div>

                            {:else}

                                {""}

                            {/if}

                        </td>

                    {/each}

                {:else}

                    <td>

                        {#if buff}
                            {$t("page.food.table.y")}
                        {:else}
                            {$t("page.food.table.n")}
                        {/if}

                    </td>

                {/if}

            {/each}

            {#if tactical === null}

                {#each new Array(7) as _}

                    <td>
                        {""}
                    </td>

                {/each}

            {:else}

                <td>
                    {tactical.formatCondType($t)}
                </td>

                <td>
                    <div class="p-2 text-right">
                        {tactical.formatCastTime($t)}
                    </div>
                </td>

                <td>
                    <div class="p-2 text-right">
                        {tactical.formatCastCount($t)}
                    </div>
                </td>

                <td>
                    <div class="p-2 text-right">
                        {tactical.formatCastToMainCount($t)}
                    </div>
                </td>

                <td>
                    <div class="p-2 text-right">
                        {tactical.formatCooldown($t)}
                    </div>
                </td>

                <td>
                    <div class="p-2 text-right">
                        {tactical.formatRecoverTime($t)}
                    </div>
                </td>

                <td>
                    <div class="p-2 text-right">
                        {tactical.formatRecoverUpperCount($t)}
                    </div>
                </td>

            {/if}


        </tr>

    {/each}

    </tbody>

</table>

<style>
    tr {
        min-height: 20px;
    }

    th {
        overflow: hidden;
        text-overflow: ellipsis;
        min-width: 150px;
        height: 50px;
        white-space: nowrap;
    }

    td {
        text-align: center;
    }
</style>
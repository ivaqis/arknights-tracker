<script lang="ts">
    import { FieldValueComparator } from "$lib/classes/comparators/FieldValueComparator";
    import { EquipableItemConditionType } from "$lib/classes/gameData/items/equipable/EquipableItemConditionType";
    import type { IFood } from "$lib/classes/gameData/items/food/IFood";
    import type { IFoodBuff } from "$lib/classes/gameData/items/food/IFoodBuff";
    import type { IItem } from "$lib/classes/gameData/items/IItem";
    import { UsableTargetType } from "$lib/classes/gameData/items/usable/UsableTargetType";
    import type { ISelector } from "$lib/classes/selectors/ISelector";
    import type { SortDirection } from "$lib/classes/SortDirection";
    import { CardSize } from "$lib/components/cards/CardSize";
    import ItemStackCard from "$lib/components/cards/ItemStackCard.svelte";
    import GroupTitle from "$lib/components/dataToolbarV2/GroupTitle.svelte";
    import ResetButton from "$lib/components/dataToolbarV2/ResetButton.svelte";
    import TextParamBox from "$lib/components/dataToolbarV2/paramBoxes/TextParamBox.svelte";
    import FoodComparisonTableSortButton from "$lib/components/food/FoodComparisonTableSortButton.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import ParamSelector from "$lib/components/selectors/ParamSelector.svelte";
    import { t } from "$lib/i18n";
    import { splitEquipmentView } from "$lib/stores/settings";

    type CondType = EquipableItemConditionType | "null";
    type SortFieldType = "name" | "buff" | "tactical" | "condParam" | "food";
    type SortTacticalField =
        | "condType"
        | "castTime"
        | "castCount"
        | "castToMainCount"
        | "cooldown"
        | "recoverTime"
        | "recoverUpperCount";
    type SortFoodField =
        | "targetType";
    type DisplayedBuffValueTitle = { key: string; i18nKey: string };
    type DisplayedBuffTitle = { buffId: string; i18nKey: string; values: DisplayedBuffValueTitle[] };
    type DisplayedCondParamTitle = { key: string; i18nKey: string; index: number };
    type DisplayedCondTypeTitle = {
        condType: EquipableItemConditionType;
        i18nKey: string;
        params: DisplayedCondParamTitle[]
    };

    export let foodList: readonly IFood[];
    export let buffList: readonly string[];
    export let condTypeOrderList: readonly CondType[];
    export let targetTypeOrderList: readonly UsableTargetType[];
    export let condTypeSelector: ISelector<CondType>;
    export let targetTypeSelector: ISelector<UsableTargetType>;
    export let selectItemFn: (item: IItem) => void;
    export let selectedItem: IFood | null = null;

    const sortTacticalFieldOrder: { key: SortTacticalField; i18nKey: string }[] = [
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

    const condParamFieldOrder: Record<string, DisplayedCondTypeTitle> = {
        char_hp: {
            condType: EquipableItemConditionType.CHAR_HP,
            i18nKey: EquipableItemConditionType.getI18nKey(EquipableItemConditionType.CHAR_HP),
            params: [
                {
                    key: "param2",
                    i18nKey: "tacticalCondParamTitle.char_hp.param2",
                    index: 1
                },
                {
                    key: "param1",
                    i18nKey: "tacticalCondParamTitle.char_hp.param1",
                    index: 0
                }
            ]
        },
        ult_energy: {
            condType: EquipableItemConditionType.ULT_ENERGY,
            i18nKey: EquipableItemConditionType.getI18nKey(EquipableItemConditionType.ULT_ENERGY),
            params: [
                {
                    key: "param2",
                    i18nKey: "tacticalCondParamTitle.ult_energy.param2",
                    index: 1
                },
                {
                    key: "param1",
                    i18nKey: "tacticalCondParamTitle.ult_energy.param1",
                    index: 0
                }
            ]
        },
        damage: {
            condType: EquipableItemConditionType.DAMAGE_TAKEN,
            i18nKey: EquipableItemConditionType.getI18nKey(EquipableItemConditionType.DAMAGE_TAKEN),
            params: [
                {
                    key: "param1",
                    i18nKey: "tacticalCondParamTitle.damage.param1",
                    index: 0
                },
                {
                    key: "param2",
                    i18nKey: "tacticalCondParamTitle.damage.param2",
                    index: 1
                }
            ]
        }
    };

    let sortDirection: SortDirection = "desc";
    let sortFieldType: SortFieldType = "name";
    let sortBuffId: string | null = null;
    let sortBuffValue: "null" | string | null = null;
    let sortTacticalField: SortTacticalField | null = null;
    let sortCondType: EquipableItemConditionType | null = null;
    let sortCondParam: string | null = null;
    let sortFoodField: SortFoodField | null = null;

    let condTypeComparator = new FieldValueComparator<IFood, CondType>(item => item.tactical?.condType ?? "null");
    let targetTypeComparator = new FieldValueComparator<IFood, UsableTargetType>(item => item.targetType);

    $: if (condTypeOrderList) {
        condTypeComparator.setValueOrder(condTypeOrderList);
    }
    $: if (targetTypeOrderList) {
        targetTypeComparator.setValueOrder(targetTypeOrderList);
    }

    let sortedItems: IFood[];

    $: sortedItems = getSortedItems(foodList, condTypeOrderList, sortFieldType, sortBuffId, sortBuffValue, sortTacticalField, sortCondType, sortCondParam, sortDirection);

    function toggleNameSort(currentDirection: SortDirection | null) {
        sortFieldType = "name";

        toggleSortDirection(currentDirection);
    }

    function toggleBuffSort(buffId: string, buffValue: string, currentDirection: SortDirection | null) {
        sortFieldType = "buff";
        sortBuffId = buffId;
        sortBuffValue = buffValue;

        toggleSortDirection(currentDirection);
    }

    function toggleTacticalSort(field: SortTacticalField, currentDirection: SortDirection | null) {
        sortFieldType = "tactical";
        sortTacticalField = field;

        toggleSortDirection(currentDirection);
    }

    function toggleCondParam(condType: EquipableItemConditionType, param: string, currentDirection: SortDirection | null) {
        sortFieldType = "condParam";
        sortCondType = condType;
        sortCondParam = param;

        toggleSortDirection(currentDirection);
    }

    function toggleFoodSort(field: SortFoodField, currentDirection: SortDirection | null) {
        sortFieldType = "food";
        sortFoodField = field;

        toggleSortDirection(currentDirection);
    }

    function toggleSortDirection(currentDirection: SortDirection | null, defaultSortDirection: SortDirection = "desc") {
        if (currentDirection === null || currentDirection !== defaultSortDirection) {
            sortDirection = defaultSortDirection;
        } else {
            sortDirection = defaultSortDirection === "desc" ? "asc" : "desc";
        }
    }

    function getSortedItems(items: readonly IFood[],
                            condTypeOrderList: readonly CondType[],
                            sortFieldType: SortFieldType,
                            sortBuffId: string | null,
                            sortBuffValue: "null" | string | null,
                            sortTacticalField: SortTacticalField | null,
                            sortCondType: EquipableItemConditionType | null,
                            sortCondParam: string | null,
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

            if (sortFieldType === "condParam" && sortCondType && sortCondParam) {
                const tacticalA = a.tactical;
                const tacticalB = b.tactical;

                if (tacticalA === null || tacticalA.condType !== sortCondType) {
                    return 1 * reverseMultiplier;
                }

                if (tacticalB === null || tacticalB.condType !== sortCondType) {
                    return -1 * reverseMultiplier;
                }

                let valueA = tacticalA.getValue(sortCondParam);
                let valueB = tacticalB.getValue(sortCondParam);

                if (isNaN(valueA) || isNaN(valueB)) {
                    return tacticalB.formatCondParam(sortCondParam, $t).localeCompare(tacticalA.formatCondParam(sortCondParam, $t));
                }

                return (valueB - valueA) * reverseMultiplier;
            }

            if (sortFieldType === "food" && sortFoodField) {
                if (sortFoodField === "targetType") {
                    return targetTypeComparator.compare(a, b) * reverseMultiplier;
                }
            }

            return 0;
        });
    }

    let displayedBuffTitles: DisplayedBuffTitle[] = [];
    let displayedCondTypeTitles: DisplayedCondTypeTitle[] = [];

    $: displayedBuffTitles = getDisplayedBuffTitles(foodList, buffList);
    $: displayedCondTypeTitles = getDisplayedCondTypeTitles(condTypeOrderList, $condTypeSelector);

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

    function getDisplayedCondTypeTitles(condTypeOrderList: readonly CondType[], condTypeSelector: ISelector<CondType>): DisplayedCondTypeTitle[] {
        return condTypeOrderList
            .map(condType => condParamFieldOrder[condType])
            .filter(entry => entry !== undefined && condTypeSelector.isSelected(entry.condType));
    }

    let isTargetTypeOpen = false;
    let isCondTypeOpen = false;

    let targetTypeContainer: HTMLElement;
    let condTypeContainer: HTMLElement;

    function toggleTargetType() {
        isCondTypeOpen = false;
        isTargetTypeOpen = !isTargetTypeOpen;
    }

    function toggleCondType() {
        isTargetTypeOpen = false;
        isCondTypeOpen = !isCondTypeOpen;
    }

    function closeAllFilterDropdowns() {
        isTargetTypeOpen = false;
        isCondTypeOpen = false;
    }

    function handleWindowClick(e: MouseEvent) {
        const target = e.target as Node;
        if (isTargetTypeOpen && targetTypeContainer && !targetTypeContainer.contains(target)) {
            isTargetTypeOpen = false;
        }
        if (isCondTypeOpen && condTypeContainer && !condTypeContainer.contains(target)) {
            isCondTypeOpen = false;
        }
    }

    function getEquipCondLocale(equipCond: CondType): string {
        return $t(EquipableItemConditionType.getI18nKey(equipCond));
    }

</script>

<svelte:window on:click={handleWindowClick} />

<table class="min-w-full border-collapse">

    <thead class="bg-gray-200 dark:bg-[#424242] font-sdk font-bold text-sm text-gray-700 dark:text-[#FDFDFD] sticky top-0 z-50">

    <tr class="bg-inherit">
        <th
            class="p-0 xl:sticky left-0 z-10 bg-inherit"
            rowspan="2"
            style="min-width: 250px;"
        >
                <FoodComparisonTableSortButton
                    onClick={(cur) => toggleNameSort(cur)}
                    sortDirection={sortFieldType === "name" ? sortDirection : null}
                >
                    {$t("page.food.table.name")}
                </FoodComparisonTableSortButton>
        </th>

        {#each displayedBuffTitles as buffTitle}

            <th colspan="{buffTitle.values.length}">
                <div class="px-4 py-2">
                    {$t(buffTitle.i18nKey)}
                </div>
            </th>

        {/each}

        <th rowspan="2" class="overflow-visible">
            <div class="flex items-center justify-between h-full min-w-[150px]">
                <div class="flex-1 h-full">
                    <FoodComparisonTableSortButton
                        onClick={cur => toggleFoodSort("targetType", cur)}
                        sortDirection={(sortFieldType === "food" && sortFoodField === "targetType") ? sortDirection : null}
                    >
                        {$t("usableTitle.targetType")}
                    </FoodComparisonTableSortButton>
                </div>

                <div bind:this={targetTypeContainer} class="relative shrink-0 mr-2  ">
                    <button
                        type="button"
                        class="p-1.5 rounded-lg transition-colors cursor-pointer relative {
                            !$targetTypeSelector.isEmpty
                                ? 'bg-[#F9B90C] text-black hover:bg-[#E5AA0B]'
                                : 'text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white hover:bg-gray-300 dark:hover:bg-[#505050]'
                        }"
                        on:click={toggleTargetType}
                        title={$t("sort.filters")}
                        aria-label={$t("sort.filters")}
                    >
                        <Icon
                            name="filter"
                            class="w-4 h-4 pointer-events-none"
                        />
                    </button>

                    {#if isTargetTypeOpen}
                        <button
                            type="button"
                            aria-label="Close"
                            class="fixed inset-0 z-[90] sm:hidden bg-black/40 cursor-default border-none p-0"
                            on:click={closeAllFilterDropdowns}
                        ></button>

                        <div
                            class="z-[100] fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-2rem)] max-w-[320px] sm:absolute sm:top-full sm:right-0 sm:left-auto sm:translate-x-0 sm:translate-y-0 sm:w-[320px] mt-2 dark:bg-[#383838] dark:border-[#444444] bg-[#F2F2F2] rounded-2xl shadow-2xl border border-gray-200 p-4 flex flex-col gap-3 font-sdk text-left normal-case select-none whitespace-normal"
                            role="dialog"
                            aria-modal="true"
                            tabindex="-1"
                        >
                            <div class="flex justify-between items-center">
                                <GroupTitle
                                    asButton={true}
                                    onClick={() => targetTypeSelector.toggleAll()}
                                >
                                    {$t("sort.targetType")}
                                </GroupTitle>

                                <ResetButton
                                    onClick={() => targetTypeSelector.clear()}
                                />
                            </div>

                            <ParamSelector
                                selector={targetTypeSelector}
                                paramBox={TextParamBox}
                                getLocaleFn={param => $t(UsableTargetType.getI18nKey(param))}
                            />
                        </div>
                    {/if}
                </div>
            </div>
        </th>

        <th rowspan="2" class="overflow-visible">
            <div class="flex items-center justify-between h-full min-w-[160px]">
                <div class="flex-1 h-full">
                    <FoodComparisonTableSortButton
                        onClick={cur => toggleTacticalSort("condType", cur)}
                        sortDirection={(sortFieldType === "tactical" && sortTacticalField === "condType") ? sortDirection : null}
                    >
                        {$t("tacticalTitle.condType")}
                    </FoodComparisonTableSortButton>
                </div>

                <div bind:this={condTypeContainer} class="relative shrink-0 mr-2">
                    <button
                        type="button"
                        class="p-1.5 rounded-lg transition-colors cursor-pointer relative {
                            !$condTypeSelector.isEmpty
                                ? 'bg-[#F9B90C] text-black hover:bg-[#E5AA0B]'
                                : 'text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white hover:bg-gray-300 dark:hover:bg-[#505050]'
                        }"
                        on:click={toggleCondType}
                        title={$t("sort.filters")}
                        aria-label={$t("sort.filters")}
                    >
                        <Icon
                            name="filter"
                            class="w-4 h-4 pointer-events-none"
                        />
                    </button>

                    {#if isCondTypeOpen}
                        <button
                            type="button"
                            aria-label="Close"
                            class="fixed inset-0 z-[90] sm:hidden bg-black/40 cursor-default border-none p-0"
                            on:click={closeAllFilterDropdowns}
                        ></button>

                        <div
                            class="z-[100] fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-2rem)] max-w-[320px] sm:absolute sm:top-full sm:right-0 sm:left-auto sm:translate-x-0 sm:translate-y-0 sm:w-[320px] mt-2 dark:bg-[#383838] dark:border-[#444444] bg-[#F2F2F2] rounded-2xl shadow-2xl border border-gray-200 p-4 flex flex-col gap-3 font-sdk text-left normal-case select-none whitespace-normal"
                            role="dialog"
                            aria-modal="true"
                            tabindex="-1"
                        >
                            <div class="flex justify-between items-center">
                                <GroupTitle
                                    asButton={true}
                                    onClick={() => condTypeSelector.toggleAll()}
                                >
                                    {$t("sort.equipCondTitle")}
                                </GroupTitle>

                                <ResetButton
                                    onClick={() => condTypeSelector.clear()}
                                />
                            </div>

                            <ParamSelector
                                selector={condTypeSelector}
                                paramBox={TextParamBox}
                                getLocaleFn={param => getEquipCondLocale(param)}
                            />
                        </div>
                    {/if}
                </div>
            </div>
        </th>

        {#each displayedCondTypeTitles as condTypeTitle}

            <th colspan="{condTypeTitle.params.length}">
                <div class="px-4 py-2">
                    {$t(condTypeTitle.i18nKey)}
                </div>
            </th>

        {/each}

        {#each sortTacticalFieldOrder as entry, i}

            <th rowspan="2" class="{i === sortTacticalFieldOrder.length - 1 ? '!border-r-0' : ''}">
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

        {#each displayedCondTypeTitles as condTypeTitle}
            {#each condTypeTitle.params as condParamTitle}

                <th>
                    <FoodComparisonTableSortButton
                        sortDirection={(sortFieldType === "condParam" && sortCondType === condTypeTitle.condType && sortCondParam === condParamTitle.key) ? sortDirection : null}
                        onClick={(cur) => toggleCondParam(condTypeTitle.condType, condParamTitle.key, cur)}
                    >
                        {$t(condParamTitle.i18nKey)}
                    </FoodComparisonTableSortButton>
                </th>

            {/each}
        {/each}

    </tr>

    </thead>

    <tbody class="bg-white dark:bg-[#383838] font-sdk text-sm text-gray-700 dark:text-[#FDFDFD]">

    {#each sortedItems as food}

        {@const tactical = food.tactical}

        <tr class="odd:bg-white dark:odd:bg-[#363636] even:bg-gray-100 dark:even:bg-[#393939]">

            <td class="xl:sticky left-0 z-10 bg-inherit">
                <div class="flex flex-row items-center gap-2.5 p-0.5">

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

                    <div class="text-left flex-1">
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

                                <div class="p-2 text-center">
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

            <td>
                {$t(UsableTargetType.getI18nKey(food.targetType))}
            </td>

            {#if tactical === null}

                {@const
                    condParamColumnCount = displayedCondTypeTitles.reduce((sum, entry) => sum + entry.params.length, 0)}

                {#each new Array(7 + condParamColumnCount) as _}

                    <td>
                        {""}
                    </td>

                {/each}

            {:else}

                <td>
                    {tactical.formatCondType($t)}
                </td>

                {#each displayedCondTypeTitles as condTypeTitle}

                    {#if tactical.condType === condTypeTitle.condType}

                        {#each condTypeTitle.params as condParamTitle}

                            <td>
                                <div class="p-2 text-center">
                                    {tactical.formatCondParam(condParamTitle.key, $t)}
                                </div>
                            </td>

                        {/each}

                    {:else}

                        {#each new Array(condTypeTitle.params.length) as _}

                            <td>
                                {""}
                            </td>

                        {/each}

                    {/if}

                {/each}

                <td>
                    <div class="p-2 text-center">
                        {tactical.formatCastTime($t)}
                    </div>
                </td>

                <td>
                    <div class="p-2 text-center">
                        {tactical.formatCastCount($t)}
                    </div>
                </td>

                <td>
                    <div class="p-2 text-center">
                        {tactical.formatCastToMainCount($t)}
                    </div>
                </td>

                <td>
                    <div class="p-2 text-center">
                        {tactical.formatCooldown($t)}
                    </div>
                </td>

                <td>
                    <div class="p-2 text-center">
                        {tactical.formatRecoverTime($t)}
                    </div>
                </td>

                <td>
                    <div class="p-2 text-center">
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

    table {
        border-collapse: collapse;
    }

    th {
        text-overflow: ellipsis;
        min-width: 150px;
        height: 50px;
        white-space: nowrap;
        border-right: 1px solid rgba(0, 0, 0, 0.12);
    }

    :global(.dark) th {
        border-right: 1px solid #444;
    }

    td {
        text-align: center;
        border-right: 1px solid rgba(0, 0, 0, 0.08);
    }

    :global(.dark) td {
        border-right: 1px solid #444;
    }

    td:last-child {
        border-right: none;
    }
</style>
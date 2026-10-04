<script lang="ts">
    import { FoodFieldComparatorName } from "$lib/classes/comparators/items/FoodFieldComparatorName";
    import { EquipableItemConditionType } from "$lib/classes/gameData/items/equipable/EquipableItemConditionType";
    import { UsableTargetType } from "$lib/classes/gameData/items/usable/UsableTargetType";
    import DropdownTemplate from "$lib/components/dataToolbarV2/DropdownTemplate.svelte";
    import SelectableParamList from "$lib/components/dataToolbarV2/filterDropdowns/SelectableParamList.svelte";
    import GroupTitle from "$lib/components/dataToolbarV2/GroupTitle.svelte";
    import RarityParamBox from "$lib/components/dataToolbarV2/paramBoxes/RarityParamBox.svelte";
    import TextParamBox from "$lib/components/dataToolbarV2/paramBoxes/TextParamBox.svelte";
    import { t } from "$lib/i18n";
    import type { FoodFilterGroup, FoodFilterValue } from "$lib/stores/filters/food/FoodFilterValueMap";
    import type { FoodSelectedFilterMap } from "$lib/stores/filters/food/FoodSelectedFilterMap";
    import type { FoodSortParamMap } from "$lib/stores/filters/food/FoodSortParamMap";

    export let filters: FoodSortParamMap;

    export let selectedFilters: FoodSelectedFilterMap;

    export let onFilterReset: () => void;

    function toggleFilterGroup<K extends FoodFilterGroup>(groupName: K) {
        if (!selectedFilters[groupName]) {
            selectedFilters[groupName] = new Set() as FoodSelectedFilterMap[K];
        }

        const set = selectedFilters[groupName]!;
        const filterParams = filters[groupName] as FoodFilterValue<K>[];

        if (set.size === 0) {
            for (const filter of filterParams) {
                set.add(filter);
            }
        } else {
            set.clear();
        }

        forceFiltersUpdate();
    }

    function forceFiltersUpdate() {
        selectedFilters = selectedFilters;
    }

    function getBuffLocale(buffId: string): string {
        return $t(`buffNames.${buffId}`);
    }

    function getEquipCondLocale(equipCond: EquipableItemConditionType | "null"): string {
        return $t(EquipableItemConditionType.getI18nKey(equipCond));
    }

</script>

<DropdownTemplate
    showResetButton={true}
    onResetButton={onFilterReset}
>

    <div class="flex flex-col items-start gap-2">

        <GroupTitle
            asButton={true}
            onClick={() => toggleFilterGroup(FoodFieldComparatorName.RARITY)}
        >
            {$t("sort.rarity")}
        </GroupTitle>

        <SelectableParamList
            paramList={filters.rarity}
            paramBox={RarityParamBox}
            bind:selectedParamSet={selectedFilters.rarity}
        />

    </div>

    <div class="flex flex-col items-start gap-2">

        <GroupTitle
            asButton={true}
            onClick={() => toggleFilterGroup(FoodFieldComparatorName.TARGET_TYPE)}
        >
            {$t("sort.targetType")}
        </GroupTitle>

        <SelectableParamList
            paramList={filters.targetType}
            paramBox={TextParamBox}
            getLocaleFunc={param => $t(UsableTargetType.getI18nKey(param as UsableTargetType))}
            bind:selectedParamSet={selectedFilters.targetType}
        />

    </div>

    <div class="flex flex-col items-start gap-2">

        <GroupTitle
            asButton={true}
            onClick={() => toggleFilterGroup(FoodFieldComparatorName.EQUIP_COND)}
        >
            {$t("sort.equipCondTitle")}
        </GroupTitle>

        <SelectableParamList
            paramList={filters.equipCond}
            paramBox={TextParamBox}
            getLocaleFunc={param => getEquipCondLocale(param as EquipableItemConditionType | "null")}
            bind:selectedParamSet={selectedFilters.equipCond}
        />

    </div>

    <div class="flex flex-col items-start gap-2">

        <GroupTitle
            asButton={true}
            onClick={() => toggleFilterGroup(FoodFieldComparatorName.BUFF)}
        >
            {$t("sort.buffTitle")}
        </GroupTitle>

        <SelectableParamList
            paramList={filters.buff}
            paramBox={TextParamBox}
            getLocaleFunc={buffId => getBuffLocale(buffId as string)}
            bind:selectedParamSet={selectedFilters.buff}
        />

    </div>

</DropdownTemplate>
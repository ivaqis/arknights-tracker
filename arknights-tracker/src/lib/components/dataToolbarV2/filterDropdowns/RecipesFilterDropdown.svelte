<script lang="ts">
    import { ItemFieldComparatorName } from "$lib/classes/comparators/items/ItemFieldComparatorName";
    import { FactoryEvent } from "$lib/classes/events/legacy/FactoryEvent.js";
    import DropdownTemplate from "$lib/components/dataToolbarV2/DropdownTemplate.svelte";
    import SelectableParamList from "$lib/components/dataToolbarV2/filterDropdowns/SelectableParamList.svelte";
    import GroupTitle from "$lib/components/dataToolbarV2/GroupTitle.svelte";
    import RarityParamBox from "$lib/components/dataToolbarV2/paramBoxes/RarityParamBox.svelte";
    import TextParamBox from "$lib/components/dataToolbarV2/paramBoxes/TextParamBox.svelte";
    import { t } from "$lib/i18n";
    import type { RecipeFilterGroup, RecipeFilterValue } from "$lib/stores/filters/recipes/RecipeFilterValueMap";
    import type { RecipeSelectedFilterMap } from "$lib/stores/filters/recipes/RecipeSelectedFilterMap";
    import type { RecipeSortParamMap } from "$lib/stores/filters/recipes/RecipeSortParamMap";

    export let filters: RecipeSortParamMap;

    export let selectedFilters: RecipeSelectedFilterMap = {};

    export let onFilterReset = () => { selectedFilters = {} };

    function toggleFilterGroup<K extends RecipeFilterGroup>(groupName: K) {
        if (!selectedFilters[groupName]) {
            selectedFilters[groupName] = new Set() as RecipeSelectedFilterMap[K];
        }

        const set = selectedFilters[groupName]!;
        const filterParams = filters[groupName] as RecipeFilterValue<K>[];

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

</script>

<DropdownTemplate
    showResetButton={true}
    onResetButton={onFilterReset}
>

    <div class="flex flex-col items-start gap-2">

        <GroupTitle
            asButton={true}
            onClick={() => toggleFilterGroup(ItemFieldComparatorName.RARITY)}
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
            onClick={() => toggleFilterGroup(ItemFieldComparatorName.EVENT)}
        >
            {$t("sort.eventsTitle")}
        </GroupTitle>

        <SelectableParamList
            paramList={filters.events}
            paramBox={TextParamBox}
            getLocaleFunc={(param) => $t(FactoryEvent.getEvent(param)?.title ?? "sort.events.nonEvent")}
            bind:selectedParamSet={selectedFilters.events}
        />

    </div>

    <div class="flex flex-col items-start gap-2">

        <GroupTitle
            asButton={true}
            onClick={() => toggleFilterGroup(ItemFieldComparatorName.ITEM_GROUP)}
        >
            {$t("sort.itemGroup")}
        </GroupTitle>

        <SelectableParamList
            paramList={filters.itemGroups}
            paramBox={TextParamBox}
            getLocaleFunc={(param) => $t(`sort.itemGroups.${param}`)}
            bind:selectedParamSet={selectedFilters.itemGroups}
        />

    </div>

    <div class="flex flex-col items-start gap-2">

        <GroupTitle
            asButton={true}
            onClick={() => toggleFilterGroup(ItemFieldComparatorName.ITEM_TYPE)}
        >
            {$t("sort.itemTypesTitle")}
        </GroupTitle>

        <SelectableParamList
            paramList={filters.itemTypes}
            paramBox={TextParamBox}
            getLocaleFunc={(param) => $t(`sort.itemTypes.${param}`)}
            bind:selectedParamSet={selectedFilters.itemTypes}
        />

    </div>

    <div class="flex flex-col items-start gap-2">

        <GroupTitle
            asButton={true}
            onClick={() => toggleFilterGroup(ItemFieldComparatorName.ITEM_MATERIAL)}
        >
            {$t("sort.itemMaterialsTitle")}
        </GroupTitle>

        <SelectableParamList
            paramList={filters.itemMaterials}
            paramBox={TextParamBox}
            getLocaleFunc={(param) => $t(`sort.itemMaterials.${param}`)}
            bind:selectedParamSet={selectedFilters.itemMaterials}
        />

    </div>

</DropdownTemplate>
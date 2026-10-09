<script lang="ts">
    import type { IGroupedFilterSelector } from "$lib/classes/filters/IGroupedFilterSelector";
    import DropdownTemplate from "$lib/components/dataToolbarV2/DropdownTemplate.svelte";
    import CategorySelector from "$lib/components/dataToolbarV2/filterDropdowns/CategorySelector.svelte";
    import GroupTitle from "$lib/components/dataToolbarV2/GroupTitle.svelte";
    import EquipSkillParamBox from "$lib/components/dataToolbarV2/paramBoxes/EquipSkillParamBox.svelte";
    import EquipTypeParamBox from "$lib/components/dataToolbarV2/paramBoxes/EquipTypeParamBox.svelte";
    import RarityParamBox from "$lib/components/dataToolbarV2/paramBoxes/RarityParamBox.svelte";
    import TextParamBox from "$lib/components/dataToolbarV2/paramBoxes/TextParamBox.svelte";
    import GroupedParamSelector from "$lib/components/selectors/GroupedParamSelector.svelte";
    import ParamSelector from "$lib/components/selectors/ParamSelector.svelte";
    import { t } from "$lib/i18n";
    import type { EquipmentFilters } from "$lib/stores/filters/equipment/EquipmentFilters";

    type Category = "any" | 1 | 2 | 3;

    export let filters: EquipmentFilters;

    export let selectedAttrType: Category = "any";

    export let onFilterReset: () => void;

    let stats_any: IGroupedFilterSelector<any>;
    let stats_1: IGroupedFilterSelector<any>;
    let stats_2: IGroupedFilterSelector<any>;
    let stats_3: IGroupedFilterSelector<any>;

    $: {
        stats_any = filters.stats_any;
        stats_1 = filters.stats_1;
        stats_2 = filters.stats_2;
        stats_3 = filters.stats_3;
    }

    function resetStatsFilter() {
        resetStatsAny();
        resetStatsNumerable();

        selectedAttrType = "any";
    }

    function resetStatsAny() {
        filters.stats_any.clear();
    }

    function resetStatsNumerable() {
        filters.stats_1.clear();
        filters.stats_2.clear();
        filters.stats_3.clear();
    }

    function getCategoryLocale(category: Category) {
        switch (category) {
            case "any": return $t("essencesPage.anyAttr");
            case 1: return $t("sort.mainAttribute");
            case 2: return $t("sort.subAttribute");
            case 3: return $t("sort.specialAttribute");
        }
    }

    $: isAnySelected = !$stats_any.isEmpty;

    $: isNumerableSelected = !$stats_1.isEmpty
        || !$stats_2.isEmpty
        || !$stats_3.isEmpty;

    $: if (isAnySelected) {
        resetStatsNumerable();
    }

    $: if (isNumerableSelected) {
        resetStatsAny();
    }

    $: highlighted = (() => {
        const list = [];

        if (!$stats_any.isEmpty) {
            list.push("any");
        }

        if (!$stats_1.isEmpty) {
            list.push(1);
        }

        if (!$stats_2.isEmpty) {
            list.push(2);
        }

        if (!$stats_3.isEmpty) {
            list.push(3);
        }

        return list;
    })();

</script>

<DropdownTemplate
    showResetButton={true}
    onResetButton={onFilterReset}
>

    <div class="flex flex-col items-start gap-2">

        <GroupTitle
            asButton={true}
            onClick={() => filters.rarity.toggleAll()}
        >
            {$t("sort.rarity")}
        </GroupTitle>

        <ParamSelector
            paramBox={RarityParamBox}
            selector={filters.rarity}
        />

    </div>

    <div class="flex flex-col items-start gap-2">

        <GroupTitle
            asButton={true}
            onClick={() => filters.partType.toggleAll()}
        >
            {$t("systemNames.equipmentType")}
        </GroupTitle>


        <ParamSelector
            paramBox={EquipTypeParamBox}
            selector={filters.partType}
            getLocaleFn={(paramId) => $t(`equipmentTypes.${paramId}`)}
        />

    </div>

    <div class="flex flex-col items-start gap-2">

        <GroupTitle
            asButton={true}
            onClick={resetStatsFilter}
        >
            {$t("sort.stats")}
        </GroupTitle>

        <CategorySelector
            categoryList={["any", 1, 2, 3]}
            highlightedCategoryList={highlighted}
            getLocaleFunc={getCategoryLocale}
            bind:selectedCategory={selectedAttrType}
        />

        {#if selectedAttrType === "any"}

            <GroupedParamSelector
                selector={stats_any}
                paramBox={EquipSkillParamBox}
            />

        {:else if selectedAttrType === 1}

            <GroupedParamSelector
                selector={stats_1}
                paramBox={EquipSkillParamBox}
            />

        {:else if selectedAttrType === 2}

            <GroupedParamSelector
                selector={stats_2}
                paramBox={EquipSkillParamBox}
            />

        {:else if selectedAttrType === 3}

            <GroupedParamSelector
                selector={stats_3}
                paramBox={EquipSkillParamBox}
            />

        {/if}

    </div>

    <div class="flex flex-col items-start gap-2">

        <GroupTitle
            asButton={true}
            onClick={() => filters.pack.toggleAll()}
        >
            {$t("sort.pack")}
        </GroupTitle>

        <ParamSelector
            paramBox={TextParamBox}
            selector={filters.pack}
            getLocaleFn={(pack) => $t(`packs.${pack}`)}
        />

    </div>

</DropdownTemplate>
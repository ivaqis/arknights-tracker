<script>
    import DropdownTemplate from "$lib/components/dataToolbarV2/DropdownTemplate.svelte";
    import CategorySelector from "$lib/components/dataToolbarV2/filterDropdowns/CategorySelector.svelte";
    import GroupedSelectableParamList
        from "$lib/components/dataToolbarV2/filterDropdowns/GroupedSelectableParamList.svelte";
    import SelectableParamList from "$lib/components/dataToolbarV2/filterDropdowns/SelectableParamList.svelte";
    import GroupTitle from "$lib/components/dataToolbarV2/GroupTitle.svelte";
    import EquipSkillParamBox from "$lib/components/dataToolbarV2/paramBoxes/EquipSkillParamBox.svelte";
    import EquipTypeParamBox from "$lib/components/dataToolbarV2/paramBoxes/EquipTypeParamBox.svelte";
    import RarityParamBox from "$lib/components/dataToolbarV2/paramBoxes/RarityParamBox.svelte";
    import TextParamBox from "$lib/components/dataToolbarV2/paramBoxes/TextParamBox.svelte";
    import { t } from "$lib/i18n.js";

    export let filters = {};

    export let selectedFilters = {};
    export let selectedAttrType = "any";

    export let onFilterReset = () => {
        selectedFilters = {};
        selectedAttrType = "any";
    };

    function toggleFilterGroup(groupName) {
        if (!selectedFilters[groupName]) {
            selectedFilters[groupName] = new Set();
        }

        let set = selectedFilters[groupName];

        if (set.size === 0) {

            for (let filter of filters[groupName]) {
                set.add(filter);
            }

        } else {
            set.clear();
        }

        forceFiltersUpdate();
    }

    function resetStatsFilter() {
        resetStatsAny();
        resetStatsNumerable();

        selectedAttrType = "any";
    }

    function resetStatsAny() {
        selectedFilters.stats_any = new Set();
    }

    function resetStatsNumerable() {
        selectedFilters.stats_1 = new Set();
        selectedFilters.stats_2 = new Set();
        selectedFilters.stats_3 = new Set();
    }

    function forceFiltersUpdate() {
        selectedFilters = selectedFilters;
    }

    function getCategoryLocale(category) {
        switch (category) {
            case "any": return $t("essencesPage.anyAttr");
            case 1: return $t("essencesPage.attr1");
            case 2: return $t("essencesPage.attr2");
            case 3: return $t("essencesPage.attr3");
        }
    }



    $: isAnySelected = selectedFilters.stats_any?.size > 0;

    $: isNumerableSelected = selectedFilters.stats_1?.size > 0
        || selectedFilters.stats_2?.size > 0
        || selectedFilters.stats_3?.size > 0;

    $: if (isAnySelected) {
        resetStatsNumerable();
    }

    $: if (isNumerableSelected) {
        resetStatsAny();
    }

    $: highlighted = (() => {
        const list = [];

        if (selectedFilters.stats_any?.size > 0) {
            list.push("any");
        }

        if (selectedFilters.stats_1?.size > 0) {
            list.push(1);
        }

        if (selectedFilters.stats_2?.size > 0) {
            list.push(2);
        }

        if (selectedFilters.stats_3?.size > 0) {
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
            onClick={() => toggleFilterGroup("rarity")}
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
            onClick={() => toggleFilterGroup("partType")}
        >
            {$t("systemNames.equipmentType")}
        </GroupTitle>

        <SelectableParamList
            paramBox={EquipTypeParamBox}
            paramList={filters.partType}
            bind:selectedParamSet={selectedFilters.partType}
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

            <GroupedSelectableParamList
                paramBox={EquipSkillParamBox}
                paramGroups={filters.stats}
                bind:selectedParamSet={selectedFilters.stats_any}
            />

        {:else if selectedAttrType === 1}

            <GroupedSelectableParamList
                paramBox={EquipSkillParamBox}
                paramGroups={filters.stats}
                bind:selectedParamSet={selectedFilters.stats_1}
            />

        {:else if selectedAttrType === 2}

            <GroupedSelectableParamList
                paramBox={EquipSkillParamBox}
                paramGroups={filters.stats}
                bind:selectedParamSet={selectedFilters.stats_2}
            />

        {:else if selectedAttrType === 3}

            <GroupedSelectableParamList
                paramBox={EquipSkillParamBox}
                paramGroups={filters.stats}
                bind:selectedParamSet={selectedFilters.stats_3}
            />

        {/if}

    </div>

    <div class="flex flex-col items-start gap-2">

        <GroupTitle
            asButton={true}
            onClick={() => toggleFilterGroup("pack")}
        >
            {$t("sort.pack")}
        </GroupTitle>

        <SelectableParamList
            paramBox={TextParamBox}
            paramList={filters.pack}
            getLocaleFunc={(pack) => $t(`packs.${pack}`)}
            bind:selectedParamSet={selectedFilters.pack}
        />

    </div>

</DropdownTemplate>
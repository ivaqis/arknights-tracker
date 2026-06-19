<script>
    import DropdownTemplate from "$lib/components/dataToolbarV2/DropdownTemplate.svelte";
    import SelectableParamList from "$lib/components/dataToolbarV2/filterDropdowns/SelectableParamList.svelte";
    import GroupTitle from "$lib/components/dataToolbarV2/GroupTitle.svelte";
    import RarityParamBox from "$lib/components/dataToolbarV2/paramBoxes/RarityParamBox.svelte";
    import { t } from "$lib/i18n";

    export let filters = {};

    export let selectedFilters = {};

    export let onFilterReset = () => selectedFilters = {};

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

</DropdownTemplate>
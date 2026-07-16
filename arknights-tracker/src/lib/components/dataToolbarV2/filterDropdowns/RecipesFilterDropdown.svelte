<script>
    import { FactoryEvent } from "$lib/classes/events/FactoryEvent.js";
    import DropdownTemplate from "$lib/components/dataToolbarV2/DropdownTemplate.svelte";
    import SelectableParamList from "$lib/components/dataToolbarV2/filterDropdowns/SelectableParamList.svelte";
    import GroupTitle from "$lib/components/dataToolbarV2/GroupTitle.svelte";
    import RarityParamBox from "$lib/components/dataToolbarV2/paramBoxes/RarityParamBox.svelte";
    import TextParamBox from "$lib/components/dataToolbarV2/paramBoxes/TextParamBox.svelte";
    import { t } from "$lib/i18n";

    export let filters = {};

    export let selectedFilters = {};

    export let onFilterReset = () => {selectedFilters = {}};

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

    <div class="flex flex-col items-start gap-2">

        <GroupTitle
            asButton={true}
            onClick={() => toggleFilterGroup("events")}
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
            onClick={() => toggleFilterGroup("itemGroups")}
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
            onClick={() => toggleFilterGroup("itemTypes")}
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
            onClick={() => toggleFilterGroup("itemMaterials")}
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
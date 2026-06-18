<script>
    import { FactoryEvent } from "$lib/classes/events/FactoryEvent.js";
    import DropdownTemplate from "$lib/components/dataToolbarV2/DropdownTemplate.svelte";
    import SelectableParamList from "$lib/components/dataToolbarV2/filterDropdowns/SelectableParamList.svelte";
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

    <div>

        <button
            class="text-sm dark:text-[#E0E0E0] font-bold text-gray-800 mb-2 hover:opacity-70"
            on:click={() => {toggleFilterGroup("rarity")}}
        >
            {$t("sort.rarity")}
        </button>

        <SelectableParamList
            paramList={filters.rarity}
            paramBox={RarityParamBox}
            bind:selectedParamSet={selectedFilters.rarity}
        />

    </div>

    <div>

        <button
            class="text-sm dark:text-[#E0E0E0] font-bold text-gray-800 mb-2 hover:opacity-70"
            on:click={() => {toggleFilterGroup("events")}}
        >
            {$t("sort.eventsTitle")}
        </button>

        <SelectableParamList
            paramList={filters.events}
            paramBox={TextParamBox}
            getLocaleFunc={(param) => $t(FactoryEvent.getEvent(param)?.title ?? "sort.events.nonEvent")}
            bind:selectedParamSet={selectedFilters.events}
        />

    </div>

    <div>

        <button
            class="text-sm dark:text-[#E0E0E0] font-bold text-gray-800 mb-2 hover:opacity-70"
            on:click={() => {toggleFilterGroup("itemGroups")}}
        >
            {$t("sort.itemGroup")}
        </button>

        <SelectableParamList
            paramList={filters.itemGroups}
            paramBox={TextParamBox}
            getLocaleFunc={(param) => $t(`sort.itemGroups.${param}`)}
            bind:selectedParamSet={selectedFilters.itemGroups}
        />

    </div>

    <div>

        <button
            class="text-sm dark:text-[#E0E0E0] font-bold text-gray-800 mb-2 hover:opacity-70"
            on:click={() => {toggleFilterGroup("itemTypes")}}
        >
            {$t("sort.itemTypesTitle")}
        </button>

        <SelectableParamList
            paramList={filters.itemTypes}
            paramBox={TextParamBox}
            getLocaleFunc={(param) => $t(`sort.itemTypes.${param}`)}
            bind:selectedParamSet={selectedFilters.itemTypes}
        />

    </div>

    <div>

        <button
            class="text-sm dark:text-[#E0E0E0] font-bold text-gray-800 mb-2 hover:opacity-70"
            on:click={() => {toggleFilterGroup("itemMaterials")}}
        >
            {$t("sort.itemMaterialsTitle")}
        </button>

        <SelectableParamList
            paramList={filters.itemMaterials}
            paramBox={TextParamBox}
            getLocaleFunc={(param) => $t(`sort.itemMaterials.${param}`)}
            bind:selectedParamSet={selectedFilters.itemMaterials}
        />

    </div>

</DropdownTemplate>
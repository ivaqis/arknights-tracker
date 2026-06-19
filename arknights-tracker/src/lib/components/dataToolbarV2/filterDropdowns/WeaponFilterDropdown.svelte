<script>
    import DropdownTemplate from "$lib/components/dataToolbarV2/DropdownTemplate.svelte";
    import SelectableParamList from "$lib/components/dataToolbarV2/filterDropdowns/SelectableParamList.svelte";
    import GroupTitle from "$lib/components/dataToolbarV2/GroupTitle.svelte";
    import RarityParamBox from "$lib/components/dataToolbarV2/paramBoxes/RarityParamBox.svelte";
    import SkillParamBox from "$lib/components/dataToolbarV2/paramBoxes/SkillParamBox.svelte";
    import WeaponTypeParamBox from "$lib/components/dataToolbarV2/paramBoxes/WeaponTypeParamBox.svelte";
    import SwitchButton from "$lib/components/SwitchButton.svelte";
    import { t } from "$lib/i18n";

    export let filters = {};

    export let selectedFilters = {};
    export let showOwnedOnly;

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

    <div
        slot="top"
        class="flex items-center gap-3"
    >

        <span class="text-sm font-bold dark:text-[#E0E0E0] text-gray-800">
            {$t("sort.ownedOnly")}
        </span>

        <SwitchButton
            bind:isActive={showOwnedOnly}
        />

    </div>

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
            onClick={() => toggleFilterGroup("type")}
        >
            {$t("sort.type")}
        </GroupTitle>

        <SelectableParamList
            paramBox={WeaponTypeParamBox}
            paramList={filters.type}
            bind:selectedParamSet={selectedFilters.type}
        />

    </div>

    <div class="flex flex-col items-start gap-2">

        <GroupTitle
            asButton={true}
            onClick={() => toggleFilterGroup("attr1")}
        >
            {$t("sort.attribute1")}
        </GroupTitle>

        <SelectableParamList
            paramBox={SkillParamBox}
            paramList={filters.attr1}
            bind:selectedParamSet={selectedFilters.attr1}
        />

    </div>

    <div class="flex flex-col items-start gap-2">

        <GroupTitle
            asButton={true}
            onClick={() => toggleFilterGroup("attr2")}
        >
            {$t("sort.attribute2")}
        </GroupTitle>

        <SelectableParamList
            paramBox={SkillParamBox}
            paramList={filters.attr2}
            bind:selectedParamSet={selectedFilters.attr2}
        />

    </div>

    <div class="flex flex-col items-start gap-2">

        <GroupTitle
            asButton={true}
            onClick={() => toggleFilterGroup("attr3")}
        >
            {$t("sort.attribute3")}
        </GroupTitle>

        <SelectableParamList
            paramBox={SkillParamBox}
            paramList={filters.attr3}
            bind:selectedParamSet={selectedFilters.attr3}
        />

    </div>

</DropdownTemplate>
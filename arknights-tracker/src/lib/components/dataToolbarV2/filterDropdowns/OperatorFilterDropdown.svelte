<script>
    import DropdownTemplate from "$lib/components/dataToolbarV2/DropdownTemplate.svelte";
    import CategorySelector from "$lib/components/dataToolbarV2/filterDropdowns/CategorySelector.svelte";
    import SelectableParamList from "$lib/components/dataToolbarV2/filterDropdowns/SelectableParamList.svelte";
    import GroupTitle from "$lib/components/dataToolbarV2/GroupTitle.svelte";
    import ElementParamBox from "$lib/components/dataToolbarV2/paramBoxes/ElementParamBox.svelte";
    import ItemLegacyParamBox from "$lib/components/dataToolbarV2/paramBoxes/ItemLegacyParamBox.svelte";
    import OperatorClassParamBox from "$lib/components/dataToolbarV2/paramBoxes/OperatorClassParamBox.svelte";
    import RarityParamBox from "$lib/components/dataToolbarV2/paramBoxes/RarityParamBox.svelte";
    import WeaponTypeParamBox from "$lib/components/dataToolbarV2/paramBoxes/WeaponTypeParamBox.svelte";
    import SwitchButton from "$lib/components/SwitchButton.svelte";
    import { t } from "$lib/i18n";

    export let filters = {};

    export let selectedFilters = {};
    export let showOwnedOnly;
    export let selectedSkillMaterialType;

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

    function resetFilterGroup(groupName) {
        if (!selectedFilters[groupName]) {
            selectedFilters[groupName] = new Set();
        }

        let set = selectedFilters[groupName];

        set.clear();

        forceFiltersUpdate();
    }

    function forceFiltersUpdate() {
        selectedFilters = selectedFilters;
    }

    function getSkillMaterialTypeLocale(skillMaterialType) {
        switch (skillMaterialType) {
            case "any":
                return $t("sort.any");

            case "basic_combo":
                return `${$t("menu.basicAttack")} + ${$t("menu.comboSkill")}`;

            case "battle_ultimate":
                return `${$t("menu.battleSkill")} + ${$t("menu.ultimate")}`;

            case "ascension":
                return $t("stats.ascension");
        }
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
            onClick={() => toggleFilterGroup("class")}
        >
            {$t("sort.class")}
        </GroupTitle>

        <SelectableParamList
            paramBox={OperatorClassParamBox}
            paramList={filters.class}
            bind:selectedParamSet={selectedFilters.class}
        />

    </div>

    <div class="flex flex-col items-start gap-2">

        <GroupTitle
            asButton={true}
            onClick={() => toggleFilterGroup("element")}
        >
            {$t("sort.element")}
        </GroupTitle>

        <SelectableParamList
            paramBox={ElementParamBox}
            paramList={filters.element}
            bind:selectedParamSet={selectedFilters.element}
        />

    </div>

    <div class="flex flex-col items-start gap-2">

        <GroupTitle
            asButton={true}
            onClick={() => toggleFilterGroup("weapon")}
        >
            {$t("sort.weapon")}
        </GroupTitle>

        <SelectableParamList
            paramBox={WeaponTypeParamBox}
            paramList={filters.weapon}
            bind:selectedParamSet={selectedFilters.weapon}
        />

    </div>

    <div class="flex flex-col items-start gap-2">

        <GroupTitle
            asButton={true}
            onClick={() => resetFilterGroup("skillMaterial")}
        >
            {$t("stats.materials")}
        </GroupTitle>

        <CategorySelector
            categoryList={filters.skillMaterialType}
            getLocaleFunc={getSkillMaterialTypeLocale}
            bind:selectedCategory={selectedSkillMaterialType}
        />

        <SelectableParamList
            paramBox={ItemLegacyParamBox}
            paramList={filters.skillMaterial}
            maxSelectedParams={1}
            bind:selectedParamSet={selectedFilters.skillMaterial}
        />

    </div>

</DropdownTemplate>
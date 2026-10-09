<script lang="ts">
    import DropdownTemplate from "$lib/components/dataToolbarV2/DropdownTemplate.svelte";
    import GroupTitle from "$lib/components/dataToolbarV2/GroupTitle.svelte";
    import RarityParamBox from "$lib/components/dataToolbarV2/paramBoxes/RarityParamBox.svelte";
    import TextParamBox from "$lib/components/dataToolbarV2/paramBoxes/TextParamBox.svelte";
    import ParamSelector from "$lib/components/selectors/ParamSelector.svelte";
    import { factoryEventStorage } from "$lib/dataStorages/events/factoryEventStorage";
    import { t } from "$lib/i18n";
    import type { RecipeFilters } from "$lib/stores/filters/recipes/RecipeFilters";

    export let filters: RecipeFilters;

    export let onFilterReset: () => void;

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
            selector={filters.rarity}
            paramBox={RarityParamBox}
        />

    </div>

    <div class="flex flex-col items-start gap-2">

        <GroupTitle
            asButton={true}
            onClick={() => filters.events.toggleAll()}
        >
            {$t("sort.eventsTitle")}
        </GroupTitle>

        <ParamSelector
            selector={filters.events}
            paramBox={TextParamBox}
            getLocaleFn={(param) => $t(factoryEventStorage.byId.get(String(param))?.title ?? "sort.events.nonEvent")}
        />

    </div>

    <div class="flex flex-col items-start gap-2">

        <GroupTitle
            asButton={true}
            onClick={() => filters.itemGroups.toggleAll()}
        >
            {$t("sort.itemGroup")}
        </GroupTitle>

        <ParamSelector
            selector={filters.itemGroups}
            paramBox={TextParamBox}
            getLocaleFn={(param) => $t(`sort.itemGroups.${param}`)}
        />

    </div>

    <div class="flex flex-col items-start gap-2">

        <GroupTitle
            asButton={true}
            onClick={() => filters.itemTypes.toggleAll()}
        >
            {$t("sort.itemTypesTitle")}
        </GroupTitle>

        <ParamSelector
            selector={filters.itemTypes}
            paramBox={TextParamBox}
            getLocaleFn={(param) => $t(`sort.itemTypes.${param}`)}
        />

    </div>

    <div class="flex flex-col items-start gap-2">

        <GroupTitle
            asButton={true}
            onClick={() => filters.itemMaterials.toggleAll()}
        >
            {$t("sort.itemMaterialsTitle")}
        </GroupTitle>

        <ParamSelector
            selector={filters.itemMaterials}
            paramBox={TextParamBox}
            getLocaleFn={(param) => $t(`sort.itemMaterials.${param}`)}
        />

    </div>

</DropdownTemplate>
<script lang="ts">
    import type { Rarity } from "$lib/classes/Rarity";
    import DropdownTemplate from "$lib/components/dataToolbarV2/DropdownTemplate.svelte";
    import RarityParamBox from "$lib/components/dataToolbarV2/paramBoxes/RarityParamBox.svelte";
    import TextParamBox from "$lib/components/dataToolbarV2/paramBoxes/TextParamBox.svelte";
    import AlphabeticSortSelector from "$lib/components/dataToolbarV2/sortDropdowns/AlphabeticSortSelector.svelte";
    import DraggableParamList from "$lib/components/dataToolbarV2/sortDropdowns/DraggableParamList.svelte";
    import DraggableSortGroups from "$lib/components/dataToolbarV2/sortDropdowns/DraggableSortGroups.svelte";
    import { factoryEventStorage } from "$lib/dataStorages/events/factoryEventStorage";
    import { t } from "$lib/i18n";
    import type { RecipeSortFieldParamGroup } from "$lib/stores/filters/recipes/RecipeSortParamMap";
    import type { RecipeSortParams } from "$lib/stores/filters/recipes/RecipeSortParams";
    import { getDefaultItemSortParams } from "$lib/stores/filterStore.js";

    export let sortParams: RecipeSortParams;

    export let onSortReset = () => {
        sortParams = getDefaultItemSortParams();
    };

    function sortReset() {
        onSortReset();
    }

    function getSortFieldLocale(sortFieldName: RecipeSortFieldParamGroup) {
        switch (sortFieldName) {
            case "itemGroups":
                return $t("sort.itemGroup");
            case "events":
                return $t("sort.eventsTitle");
            case "itemTypes":
                return $t("sort.itemTypesTitle");
            case "itemMaterials":
                return $t("sort.itemMaterialsTitle");
            case "localeName":
                return $t("sort.localeNameTitle");
            default:
                return $t(`sort.${sortFieldName}`);
        }
    }

    function getFilterNameLocale(sortFieldName: RecipeSortFieldParamGroup, filterName: typeof sortFieldName extends "rarity" ? Rarity : string): string {
        if (sortFieldName === "rarity") {
            return String(filterName);
        }

        if (sortFieldName === "events") {
            if (filterName === "nonEvent") {
                return $t("sort.events.nonEvent");
            }

            return $t(factoryEventStorage.byId.getOrThrow(filterName).i18nKey);
        }

        return $t(`sort.${sortFieldName}.${filterName}`);
    }

    let openedSortField: RecipeSortFieldParamGroup | null = null;

</script>

<DropdownTemplate
    showResetButton={true}
    onResetButton={sortReset}
>

    <DraggableSortGroups
        openableGroups={true}
        getLocaleFunc={getSortFieldLocale}
        bind:groupList={sortParams.sortFieldOrder}
        bind:openedGroup={openedSortField}
    >

        {#if openedSortField === "rarity"}

            <DraggableParamList
                paramBox={RarityParamBox}
                getLocaleFunc={(rarity) => String(rarity)}
                bind:paramList={sortParams.sortFieldParams.rarity}
            />

        {:else if openedSortField === "localeName"}

            <AlphabeticSortSelector
                bind:selectedSort={sortParams.sortFieldParams.localeName}
            />

        {:else if openedSortField}

            <DraggableParamList
                bind:paramList={sortParams.sortFieldParams[openedSortField]}
                paramBox={TextParamBox}
                getLocaleFunc={(param) => getFilterNameLocale(openedSortField as Exclude<RecipeSortFieldParamGroup, "rarity" | "localeName">, param as string)}
            />

        {/if}

    </DraggableSortGroups>

</DropdownTemplate>
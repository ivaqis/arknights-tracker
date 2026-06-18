<script>
    import { FactoryEvent } from "$lib/classes/events/FactoryEvent.js";
    import DropdownTemplate from "$lib/components/dataToolbarV2/DropdownTemplate.svelte";
    import RarityParamBox from "$lib/components/dataToolbarV2/paramBoxes/RarityParamBox.svelte";
    import TextParamBox from "$lib/components/dataToolbarV2/paramBoxes/TextParamBox.svelte";
    import AlphabeticSortSelector from "$lib/components/dataToolbarV2/sortDropdowns/AlphabeticSortSelector.svelte";
    import DraggableParamList from "$lib/components/dataToolbarV2/sortDropdowns/DraggableParamList.svelte";
    import DraggableSortGroups from "$lib/components/dataToolbarV2/sortDropdowns/DraggableSortGroups.svelte";
    import { t } from "$lib/i18n";
    import { getDefaultItemSortParams } from "$lib/stores/filterStore.js";

    export let sortParams = {};

    export let onSortReset = () => {
        sortParams = getDefaultItemSortParams();
    };

    function sortReset() {
        onSortReset();
    }

    function getSortFieldLocale(sortFieldName) {
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

    function getFilterNameLocale(sortFieldName, filterName) {
        if (sortFieldName === "rarity") {
            return filterName;
        }

        if (sortFieldName === "events") {
            if (filterName === "nonEvent") {
                return $t("sort.events.nonEvent");
            }

            return $t(FactoryEvent.getEvent(filterName)?.title);
        }

        return $t(`sort.${sortFieldName}.${filterName}`);
    }

    let openedSortField = null;

    $: isSortFieldOpen = (sortFieldName) => sortFieldName === openedSortField;

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
                getLocaleFunc={(rarity) => rarity}
                bind:paramList={sortParams.sortFieldParams.rarity}
            />

        {:else if openedSortField === "localeName"}

            <AlphabeticSortSelector
                bind:selectedSort={sortParams.sortFieldParams.localeName}
            />

        {:else}

            <DraggableParamList
                paramBox={TextParamBox}
                getLocaleFunc={(param) => getFilterNameLocale(openedSortField, param)}
                bind:paramList={sortParams.sortFieldParams[openedSortField]}
            />

        {/if}

    </DraggableSortGroups>

</DropdownTemplate>
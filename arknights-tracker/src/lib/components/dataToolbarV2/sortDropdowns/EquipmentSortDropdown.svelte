<script lang="ts">
    import { EquipmentComparatorName } from "$lib/classes/comparators/names/EquipmentComparatorName";
    import DropdownTemplate from "$lib/components/dataToolbarV2/DropdownTemplate.svelte";
    import EquipTypeParamBox from "$lib/components/dataToolbarV2/paramBoxes/EquipTypeParamBox.svelte";
    import RarityParamBox from "$lib/components/dataToolbarV2/paramBoxes/RarityParamBox.svelte";
    import TextParamBox from "$lib/components/dataToolbarV2/paramBoxes/TextParamBox.svelte";
    import AlphabeticSortSelector from "$lib/components/dataToolbarV2/sortDropdowns/AlphabeticSortSelector.svelte";
    import DraggableParamList from "$lib/components/dataToolbarV2/sortDropdowns/DraggableParamList.svelte";
    import DraggableSortGroups from "$lib/components/dataToolbarV2/sortDropdowns/DraggableSortGroups.svelte";
    import NumericSortSelector from "$lib/components/dataToolbarV2/sortDropdowns/NumericSortSelector.svelte";
    import { t } from "$lib/i18n";
    import type { EquipmentSortParams } from "$lib/stores/filters/equipment/EquipmentSortParams";

    export let sortParams: EquipmentSortParams;

    export let onSortReset: () => void;

    function resetSort() {
        onSortReset();
    }

    function getSortFieldLocale(name: EquipmentComparatorName): string {
        switch (name) {
            case EquipmentComparatorName.RARITY:
                return $t("sort.rarity");
            case EquipmentComparatorName.LOCALE_NAME:
                return $t("sort.localeNameTitle");
            case EquipmentComparatorName.LEVEL:
                return $t("sort.level");
            case EquipmentComparatorName.PACK:
                return $t("sort.pack");
            case EquipmentComparatorName.PART_TYPE:
                return $t("systemNames.equipmentType");
        }
    }

    let openedSortField: EquipmentComparatorName | null = null;

</script>

<DropdownTemplate
    onResetButton={resetSort}
    showResetButton={true}
>

    <DraggableSortGroups
        bind:groupList={sortParams.sortFieldOrder}
        bind:openedGroup={openedSortField}
        getLocaleFunc={getSortFieldLocale}
        openableGroups={true}
    >

        {#if openedSortField === EquipmentComparatorName.RARITY}

            <DraggableParamList
                paramBox={RarityParamBox}
                getLocaleFunc={rarity => String(rarity)}
                bind:paramList={sortParams.sortFieldParams.rarity}
            />

        {:else if openedSortField === EquipmentComparatorName.LOCALE_NAME}

            <AlphabeticSortSelector
                bind:selectedSort={sortParams.sortFieldParams.localeName}
            />

        {:else if openedSortField === EquipmentComparatorName.LEVEL}

            <NumericSortSelector
                bind:selectedDirection={sortParams.sortFieldParams.level}
            />

        {:else if openedSortField === EquipmentComparatorName.PART_TYPE}

            <DraggableParamList
                paramBox={EquipTypeParamBox}
                getLocaleFunc={(paramId) => $t(`equipmentTypes.${paramId}`)}
                bind:paramList={sortParams.sortFieldParams.partType}
            />

        {:else if openedSortField === EquipmentComparatorName.PACK}

            <DraggableParamList
                paramBox={TextParamBox}
                getLocaleFunc={(paramId) => $t(`packs.${paramId}`)}
                bind:paramList={sortParams.sortFieldParams.pack}
            />

        {/if}

    </DraggableSortGroups>

</DropdownTemplate>
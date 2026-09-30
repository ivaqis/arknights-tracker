<script lang="ts">
    import { FoodFieldComparatorName } from "$lib/classes/comparators/items/FoodFieldComparatorName";
    import { EquipableItemConditionType } from "$lib/classes/gameData/items/equipable/EquipableItemConditionType";
    import DropdownTemplate from "$lib/components/dataToolbarV2/DropdownTemplate.svelte";
    import RarityParamBox from "$lib/components/dataToolbarV2/paramBoxes/RarityParamBox.svelte";
    import TextParamBox from "$lib/components/dataToolbarV2/paramBoxes/TextParamBox.svelte";
    import AlphabeticSortSelector from "$lib/components/dataToolbarV2/sortDropdowns/AlphabeticSortSelector.svelte";
    import DraggableParamList from "$lib/components/dataToolbarV2/sortDropdowns/DraggableParamList.svelte";
    import DraggableSortGroups from "$lib/components/dataToolbarV2/sortDropdowns/DraggableSortGroups.svelte";
    import { t } from "$lib/i18n";
    import type { FoodSortFieldParamGroup } from "$lib/stores/filters/food/FoodSortParamMap";
    import type { FoodSortParams } from "$lib/stores/filters/food/FoodSortParams";

    export let sortParams: FoodSortParams;

    export let onSortReset: () => void;

    function resetSort() {
        onSortReset();
    }

    function getSortFieldLocale(name: FoodSortFieldParamGroup): string {
        switch (name) {
            case FoodFieldComparatorName.RARITY:
                return $t("sort.rarity");
            case FoodFieldComparatorName.LOCALE:
                return $t("sort.localeNameTitle");
            case FoodFieldComparatorName.BUFF:
                return $t("sort.buffTitle");
            case FoodFieldComparatorName.EQUIP_COND:
                return $t("sort.equipCondTitle");
        }
    }

    function getBuffLocale(buffId: string): string {
        return $t(`buffNames.${buffId}`);
    }

    function getEquipCondLocale(equipCond: EquipableItemConditionType | "null"): string {
        return $t(EquipableItemConditionType.getI18nKey(equipCond));
    }

    let openedSortField: FoodSortFieldParamGroup | null = null;

</script>

<DropdownTemplate
    showResetButton={true}
    onResetButton={resetSort}
>

    <DraggableSortGroups
        openableGroups={true}
        getLocaleFunc={getSortFieldLocale}
        bind:groupList={sortParams.sortFieldOrder}
        bind:openedGroup={openedSortField}
    >

        {#if openedSortField === FoodFieldComparatorName.RARITY}

            <DraggableParamList
                paramBox={RarityParamBox}
                getLocaleFunc={rarity => String(rarity)}
                bind:paramList={sortParams.sortFieldParams.rarity}
            />

        {:else if openedSortField === FoodFieldComparatorName.LOCALE}

            <AlphabeticSortSelector
                bind:selectedSort={sortParams.sortFieldParams.locale}
            />

        {:else if openedSortField === FoodFieldComparatorName.BUFF}

            <DraggableParamList
                paramBox={TextParamBox}
                getLocaleFunc={buffId => getBuffLocale(buffId as string)}
                bind:paramList={sortParams.sortFieldParams.buff}
            />

        {:else if openedSortField === FoodFieldComparatorName.EQUIP_COND}

            <DraggableParamList
                paramBox={TextParamBox}
                getLocaleFunc={cond => getEquipCondLocale(cond as EquipableItemConditionType | "null")}
                bind:paramList={sortParams.sortFieldParams.equipCond}
            />

        {/if}

    </DraggableSortGroups>

</DropdownTemplate>
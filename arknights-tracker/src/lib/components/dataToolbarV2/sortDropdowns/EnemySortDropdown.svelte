<script lang="ts">
    import { EnemyComparatorName } from "$lib/classes/comparators/names/EnemyComparatorName";
    import DropdownTemplate from "$lib/components/dataToolbarV2/DropdownTemplate.svelte";
    import EnemyGroupParamBox from "$lib/components/dataToolbarV2/paramBoxes/EnemyGroupParamBox.svelte";
    import RarityParamBox from "$lib/components/dataToolbarV2/paramBoxes/RarityParamBox.svelte";
    import AlphabeticSortSelector from "$lib/components/dataToolbarV2/sortDropdowns/AlphabeticSortSelector.svelte";
    import DraggableParamList from "$lib/components/dataToolbarV2/sortDropdowns/DraggableParamList.svelte";
    import DraggableSortGroups from "$lib/components/dataToolbarV2/sortDropdowns/DraggableSortGroups.svelte";
    import { t } from "$lib/i18n";
    import type { EnemySortParams } from "$lib/stores/filters/enemies/EnemySortParams";

    export let sortParams: EnemySortParams;

    export let onSortReset: () => void;

    function getSortFieldLocale(name: EnemyComparatorName): string {
        switch (name) {
            case EnemyComparatorName.LOCALE:
                return $t("sort.localeNameTitle");
            case EnemyComparatorName.RARITY:
                return $t("sort.rarity");
            case EnemyComparatorName.GROUP_ID:
                return $t("sort.enemyGroupTitle");
        }
    }

    let openedSortField: EnemyComparatorName | null = null;

</script>

<DropdownTemplate
    onResetButton={onSortReset}
    showResetButton={true}
>

    <DraggableSortGroups
        bind:groupList={sortParams.sortFieldOrder}
        bind:openedGroup={openedSortField}
        getLocaleFunc={getSortFieldLocale}
        openableGroups={true}
    >

        {#if openedSortField === EnemyComparatorName.RARITY}

            <DraggableParamList
                paramBox={RarityParamBox}
                getLocaleFunc={String}
                bind:paramList={sortParams.sortFieldParams[EnemyComparatorName.RARITY]}
            />

        {:else if openedSortField === EnemyComparatorName.GROUP_ID}

            <DraggableParamList
                paramBox={EnemyGroupParamBox}
                getLocaleFunc={k => $t(`enemiesGroups.${k}`)}
                bind:paramList={sortParams.sortFieldParams[EnemyComparatorName.GROUP_ID]}
            />

        {:else if openedSortField === EnemyComparatorName.LOCALE}

            <AlphabeticSortSelector
                bind:selectedSort={sortParams.sortFieldParams[EnemyComparatorName.LOCALE]}
            />

        {/if}

    </DraggableSortGroups>

</DropdownTemplate>
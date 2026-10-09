<script lang="ts">
    import { EnemyComparatorName } from "$lib/classes/comparators/names/EnemyComparatorName";
    import DropdownTemplate from "$lib/components/dataToolbarV2/DropdownTemplate.svelte";
    import GroupTitle from "$lib/components/dataToolbarV2/GroupTitle.svelte";
    import EnemyGroupParamBox from "$lib/components/dataToolbarV2/paramBoxes/EnemyGroupParamBox.svelte";
    import RarityParamBox from "$lib/components/dataToolbarV2/paramBoxes/RarityParamBox.svelte";
    import ParamSelector from "$lib/components/selectors/ParamSelector.svelte";
    import { t } from "$lib/i18n";
    import type { EnemyFilters } from "$lib/stores/filters/enemies/EnemyFilters";

    export let filters: EnemyFilters;

    export let onFilterReset: () => void;

</script>

<DropdownTemplate
    showResetButton={true}
    onResetButton={onFilterReset}
>

    <div class="flex flex-col items-start gap-2">

        <GroupTitle
            asButton={true}
            onClick={() => filters[EnemyComparatorName.RARITY].toggleAll()}
        >
            {$t("sort.rarity")}
        </GroupTitle>

        <ParamSelector
            paramBox={RarityParamBox}
            selector={filters[EnemyComparatorName.RARITY]}
        />

    </div>

    <div class="flex flex-col items-start gap-2">

        <GroupTitle
            asButton={true}
            onClick={() => filters[EnemyComparatorName.GROUP_ID].toggleAll()}
        >
            {$t("sort.enemyGroupTitle")}
        </GroupTitle>

        <ParamSelector
            paramBox={EnemyGroupParamBox}
            selector={filters[EnemyComparatorName.GROUP_ID]}
        />

    </div>

</DropdownTemplate>
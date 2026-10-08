<script lang="ts">
    import { EquipableItemConditionType } from "$lib/classes/gameData/items/equipable/EquipableItemConditionType";
    import { UsableTargetType } from "$lib/classes/gameData/items/usable/UsableTargetType";
    import DropdownTemplate from "$lib/components/dataToolbarV2/DropdownTemplate.svelte";
    import GroupTitle from "$lib/components/dataToolbarV2/GroupTitle.svelte";
    import RarityParamBox from "$lib/components/dataToolbarV2/paramBoxes/RarityParamBox.svelte";
    import TextParamBox from "$lib/components/dataToolbarV2/paramBoxes/TextParamBox.svelte";
    import ParamSelector from "$lib/components/selectors/ParamSelector.svelte";
    import { t } from "$lib/i18n";
    import type { FoodFilters } from "$lib/stores/filters/food/FoodFilters";

    export let filters: FoodFilters;

    export let onFilterReset: () => void;

    function getBuffLocale(buffId: string): string {
        return $t(`buffNames.${buffId}`);
    }

    function getEquipCondLocale(equipCond: EquipableItemConditionType | "null"): string {
        return $t(EquipableItemConditionType.getI18nKey(equipCond));
    }

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
            onClick={() => filters.targetType.toggleAll()}
        >
            {$t("sort.targetType")}
        </GroupTitle>

        <ParamSelector
            selector={filters.targetType}
            paramBox={TextParamBox}
            getLocaleFn={(param) => $t(UsableTargetType.getI18nKey(param))}
        />

    </div>

    <div class="flex flex-col items-start gap-2">

        <GroupTitle
            asButton={true}
            onClick={() => filters.equipCond.toggleAll()}
        >
            {$t("sort.equipCondTitle")}
        </GroupTitle>

        <ParamSelector
            selector={filters.equipCond}
            paramBox={TextParamBox}
            getLocaleFn={param => getEquipCondLocale(param)}
        />

    </div>

    <div class="flex flex-col items-start gap-2">

        <GroupTitle
            asButton={true}
            onClick={() => filters.buff.toggleAll()}
        >
            {$t("sort.buffTitle")}
        </GroupTitle>

        <ParamSelector
            selector={filters.buff}
            paramBox={TextParamBox}
            getLocaleFn={param => getBuffLocale(param)}
        />

    </div>

</DropdownTemplate>
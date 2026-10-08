<script lang="ts">
    import { EquipableItemConditionType } from "$lib/classes/gameData/items/equipable/EquipableItemConditionType";
    import { UsableTargetType } from "$lib/classes/gameData/items/usable/UsableTargetType";
    import type { ISelector } from "$lib/classes/selectors/ISelector";
    import GroupTitle from "$lib/components/dataToolbarV2/GroupTitle.svelte";
    import TextParamBox from "$lib/components/dataToolbarV2/paramBoxes/TextParamBox.svelte";
    import ParamSelector from "$lib/components/selectors/ParamSelector.svelte";
    import { t } from "$lib/i18n";

    export let condTypeSelector: ISelector<CondType>;
    export let buffSelector: ISelector<string>;
    export let targetTypeSelector: ISelector<UsableTargetType>;

    type CondType = EquipableItemConditionType | "null";

    function getBuffLocale(buffId: string): string {
        return $t(`buffNames.${buffId}`);
    }

    function getEquipCondLocale(equipCond: CondType): string {
        return $t(EquipableItemConditionType.getI18nKey(equipCond));
    }

</script>

<div class="flex flex-col gap-3 p-5 dark:bg-[#383838] dark:border-[#444444] bg-[#F2F2F2] rounded-3xl shadow-2xl border border-gray-200">

    <div class="flex flex-col items-start gap-2">

        <GroupTitle
            asButton={true}
            onClick={() => targetTypeSelector.toggleAll()}
        >
            {$t("sort.targetType")}
        </GroupTitle>

        <ParamSelector
            selector={targetTypeSelector}
            paramBox={TextParamBox}
            getLocaleFn={param => $t(UsableTargetType.getI18nKey(param))}
        />

    </div>

    <div class="flex flex-col items-start gap-2">

        <GroupTitle
            asButton={true}
            onClick={() => condTypeSelector.toggleAll()}
        >
            {$t("sort.equipCondTitle")}
        </GroupTitle>

        <ParamSelector
            selector={condTypeSelector}
            paramBox={TextParamBox}
            getLocaleFn={param => getEquipCondLocale(param)}
        />

    </div>

    <div class="flex flex-col items-start gap-2">

        <GroupTitle
            asButton={true}
            onClick={() => buffSelector.toggleAll()}
        >
            {$t("sort.buffTitle")}
        </GroupTitle>

        <ParamSelector
            selector={buffSelector}
            paramBox={TextParamBox}
            getLocaleFn={buffId => getBuffLocale(buffId)}
        />

    </div>

</div>
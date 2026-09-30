<script lang="ts">
    import { EquipableItemConditionType } from "$lib/classes/gameData/items/equipable/EquipableItemConditionType";
    import SelectableParamList from "$lib/components/dataToolbarV2/filterDropdowns/SelectableParamList.svelte";
    import GroupTitle from "$lib/components/dataToolbarV2/GroupTitle.svelte";
    import TextParamBox from "$lib/components/dataToolbarV2/paramBoxes/TextParamBox.svelte";
    import { t } from "$lib/i18n";

    export let condTypeList: CondType[];
    export let buffList: string[];

    export let selectedCondTypeSet: Set<CondType>;
    export let selectedBuffSet: Set<string>;

    type CondType = EquipableItemConditionType | "null";

    function toggleCondTypeList() {
        if (selectedCondTypeSet.size === 0) {
            condTypeList.forEach(item => selectedCondTypeSet.add(item));
        } else {
            selectedCondTypeSet.clear();
        }

        selectedCondTypeSet = selectedCondTypeSet;
    }

    function toggleBuffList() {
        if (selectedBuffSet.size === 0) {
            buffList.forEach(item => selectedBuffSet.add(item));
        } else {
            selectedBuffSet.clear();
        }

        selectedBuffSet = selectedBuffSet;
    }

    function getBuffLocale(buffId: string): string {
        return $t(`buffNames.${buffId}`);
    }

    function getEquipCondLocale(equipCond: CondType): string {
        return $t(EquipableItemConditionType.getI18nKey(equipCond));
    }

</script>

<div class="flex flex-col gap-3 p-5 dark:bg-[#383838] dark:border-[#444444] bg-[#F2F2F2] rounded-2xl shadow-2xl border border-gray-200">

    <div class="flex flex-col items-start gap-2">

        <GroupTitle
            asButton={true}
            onClick={toggleCondTypeList}
        >
            {$t("sort.equipCondTitle")}
        </GroupTitle>

        <SelectableParamList
            paramBox={TextParamBox}
            paramList={condTypeList}
            getLocaleFunc={param => getEquipCondLocale(param as CondType)}
            bind:selectedParamSet={selectedCondTypeSet}
        />

    </div>

    <div class="flex flex-col items-start gap-2">

        <GroupTitle
            asButton={true}
            onClick={toggleBuffList}
        >
            {$t("sort.buffTitle")}
        </GroupTitle>

        <SelectableParamList
            paramList={buffList}
            paramBox={TextParamBox}
            getLocaleFunc={buffId => getBuffLocale(buffId as string)}
            bind:selectedParamSet={selectedBuffSet}
        />

    </div>

</div>
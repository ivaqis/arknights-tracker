<script generics="T extends string " lang="ts">
    import type { ParamBoxStyle } from "$lib/components/dataToolbarV2/paramBoxes/ParamBoxStyle";
    import TextParamBoxTemplate from "$lib/components/dataToolbarV2/paramBoxes/TextParamBoxTemplate.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import { t } from "$lib/i18n";

    export let styleMode: ParamBoxStyle;

    export let paramId: T;
    export let getLocaleFunc: (param: T) => string = (param) => $t(`enemiesGroups.${param}`);
</script>

<TextParamBoxTemplate styleMode={styleMode}>

    <div
        slot="left"
        class="w-5 h-5 flex items-center justify-center pointer-events-none bg-[#2A2A2A] rounded-[4px]"
        class:hidden={paramId === "none"}
    >
        <Icon
            name={paramId.replace("wiki_group_monster_", "")}
            class="w-3.5 h-3.5 text-white"
        />
    </div>

    {getLocaleFunc(paramId)}

</TextParamBoxTemplate>
<script lang="ts" generics="T extends string | number">
    import type { ParamBoxStyle } from "$lib/components/dataToolbarV2/paramBoxes/ParamBoxStyle";
    import TextParamBoxTemplate from "$lib/components/dataToolbarV2/paramBoxes/TextParamBoxTemplate.svelte";

    export let styleMode: ParamBoxStyle;

    export let paramId: T;
    export let getLocaleFunc: (param: T) => string = (param) => String(param);
</script>

<TextParamBoxTemplate styleMode={styleMode}>

    {getLocaleFunc(paramId)}

</TextParamBoxTemplate>
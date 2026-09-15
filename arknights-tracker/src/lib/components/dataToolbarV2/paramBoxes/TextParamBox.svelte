<script lang="ts">
    import type { ParamBoxStyle } from "$lib/components/dataToolbarV2/paramBoxes/ParamBoxStyle";
    import type { ParamId } from "$lib/components/dataToolbarV2/paramBoxes/ParamId";
    import TextParamBoxTemplate from "$lib/components/dataToolbarV2/paramBoxes/TextParamBoxTemplate.svelte";

    export let styleMode: ParamBoxStyle;

    export let paramId: ParamId;
    export let getLocaleFunc: (param: ParamId) => string = (param) => String(param);
</script>

<TextParamBoxTemplate styleMode={styleMode}>

    {getLocaleFunc(paramId)}

</TextParamBoxTemplate>
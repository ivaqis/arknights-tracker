<script>
    import TextParamBoxTemplate from "$lib/components/dataToolbarV2/paramBoxes/TextParamBoxTemplate.svelte";

    export let styleMode;

    export let paramId;
    export let getLocaleFunc = (param) => param;
</script>

<TextParamBoxTemplate styleMode={styleMode}>

    {getLocaleFunc(paramId)}

</TextParamBoxTemplate>
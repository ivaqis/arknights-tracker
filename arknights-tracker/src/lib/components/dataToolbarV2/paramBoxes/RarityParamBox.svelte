<script>
    import ParamBoxTemplate from "$lib/components/dataToolbarV2/paramBoxes/ParamBoxTemplate.svelte";
    import Icon from "$lib/components/Icon.svelte";

    export let styleMode = "default";
</script>

<ParamBoxTemplate styleMode={styleMode}>

    <span class="font-bold pointer-events-none">
        <slot />
    </span>

    <Icon
        name="star"
        class="w-3 h-3 text-current pointer-events-none"
    />

</ParamBoxTemplate>
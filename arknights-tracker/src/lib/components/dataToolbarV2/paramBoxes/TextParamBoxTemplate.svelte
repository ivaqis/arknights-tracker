<script>
    import ParamBoxTemplate from "$lib/components/dataToolbarV2/paramBoxes/ParamBoxTemplate.svelte";

    export let styleMode = "default";
</script>

<ParamBoxTemplate styleMode={styleMode}>

    <slot name="left"/>

    <div class="text-xs font-bold pointer-events-none mx-0.5">

        <slot />

    </div>

    <slot name="right"/>

</ParamBoxTemplate>
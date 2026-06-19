<script>
    import ParamBoxTemplate from "$lib/components/dataToolbarV2/paramBoxes/ParamBoxTemplate.svelte";
    import Icon from "$lib/components/Icon.svelte";

    export let styleMode = "default";

    export let paramId;
</script>

<ParamBoxTemplate styleMode={styleMode}>

    <div class="flex flex-row items-center gap-1.5 mx-0.5">

        <span class="font-bold pointer-events-none">
            {paramId}
        </span>

        <Icon
            name="star"
            class="w-3.5 h-3.5 text-current pointer-events-none"
        />

    </div>

</ParamBoxTemplate>
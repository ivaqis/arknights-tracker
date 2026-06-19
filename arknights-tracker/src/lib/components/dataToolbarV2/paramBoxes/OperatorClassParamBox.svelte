<script>
    import TextParamBoxTemplate from "$lib/components/dataToolbarV2/paramBoxes/TextParamBoxTemplate.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import { t } from "$lib/i18n";

    export let styleMode;

    export let paramId;
    export let getLocaleFunc = (paramId) => $t(`classes.${paramId}`);
</script>

<TextParamBoxTemplate styleMode={styleMode}>

    <div
        slot="left"
        class="w-5 h-5 flex items-center justify-center pointer-events-none bg-[#2A2A2A] rounded-[4px]"
    >

        <Icon
            name={paramId}
            class="w-4 h-4 text-white"
        />

    </div>

    {getLocaleFunc(paramId)}

</TextParamBoxTemplate>
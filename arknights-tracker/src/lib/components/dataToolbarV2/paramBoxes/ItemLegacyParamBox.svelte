<script>
    import TextParamBoxTemplate from "$lib/components/dataToolbarV2/paramBoxes/TextParamBoxTemplate.svelte";
    import Image from "$lib/components/Image.svelte";
    import { t } from "$lib/i18n";

    export let styleMode;

    export let paramId;
    export let getLocaleFunc = (paramId) => $t(`items.${paramId}`);
</script>

<TextParamBoxTemplate styleMode={styleMode}>

    <div
        slot="left"
        class="w-5 h-5 flex items-center justify-center pointer-events-none"
    >

        <Image
            id="{paramId}"
            variant="item"
            className="w-full h-full object-contain"
        />

    </div>

    {getLocaleFunc(paramId)}

</TextParamBoxTemplate>
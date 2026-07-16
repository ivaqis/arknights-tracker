<script>
    import TextParamBoxTemplate from "$lib/components/dataToolbarV2/paramBoxes/TextParamBoxTemplate.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import { t } from "$lib/i18n";
    import { getTextColorByElement } from "$lib/utils/colorUtils.js";

    export let styleMode;

    export let paramId;
    export let getLocaleFunc = (paramId) => $t(`elements.${paramId}`);

    $: textColor = getTextColorByElement(paramId);
</script>

<TextParamBoxTemplate styleMode={styleMode}>

    <Icon
        slot="left"
        name={paramId}
        class="w-5 h-5 rounded-[4px] pointer-events-none {textColor}"
    />

    <span class="{textColor}">
        {getLocaleFunc(paramId)}
    </span>

</TextParamBoxTemplate>
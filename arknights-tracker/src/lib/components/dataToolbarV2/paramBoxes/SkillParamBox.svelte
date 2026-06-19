<script>
    import TextParamBoxTemplate from "$lib/components/dataToolbarV2/paramBoxes/TextParamBoxTemplate.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import { t } from "$lib/i18n";
    import { getTextColorByAttr } from "$lib/utils/colorUtils.js";
    import { getIconIdByAttr } from "$lib/utils/IconUtils.js";

    export let styleMode;

    export let paramId;
    export let getLocaleFunc = (paramId) => $t(`skills.${paramId}`);

    $: iconId = getIconIdByAttr(paramId);
    $: textColor = getTextColorByAttr(paramId);
</script>

<TextParamBoxTemplate styleMode={styleMode}>

    <div
        slot="left"
        class:hidden={!iconId}
    >

        {#if iconId}

            {#if textColor}

                <Icon
                    name={iconId}
                    class="w-5 h-5 rounded-[4px] pointer-events-none {textColor}"
                />

            {:else}

                <div class="w-5 h-5 flex items-center justify-center pointer-events-none bg-[#2A2A2A] rounded-[4px]">

                    <Icon
                        name={iconId}
                        class="w-3 h-3 text-white pointer-events-none"
                    />

                </div>

            {/if}

        {/if}

    </div>

    <span class="{textColor}">
        {getLocaleFunc(paramId)}
    </span>

</TextParamBoxTemplate>
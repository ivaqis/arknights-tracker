<script>
    import TextParamBoxTemplate from "$lib/components/dataToolbarV2/paramBoxes/TextParamBoxTemplate.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import { t } from "$lib/i18n";

    export let styleMode;

    export let paramId;
    export let getLocaleFunc = (paramId) => $t(`equipSkills.${paramId}`);

    $: statIconId = paramId.toLowerCase() === "maxhp"
        ? "hp"
        : paramId.toLowerCase()
</script>

<TextParamBoxTemplate styleMode={styleMode}>

    <div
        slot="left"
        class="w-5 h-5 bg-[#2A2A2A] rounded-[4px] flex items-center justify-center pointer-events-none"
    >

        <Icon
            name="{statIconId}"
            class="w-3 h-3 text-white pointer-events-none"
        />

    </div>

    {getLocaleFunc(paramId)}

</TextParamBoxTemplate>
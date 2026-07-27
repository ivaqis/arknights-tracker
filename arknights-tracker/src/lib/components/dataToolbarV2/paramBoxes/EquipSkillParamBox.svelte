<script>
    import TextParamBoxTemplate from "$lib/components/dataToolbarV2/paramBoxes/TextParamBoxTemplate.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import { t } from "$lib/i18n";

    export let styleMode;

    export let paramId;
    export let getLocaleFunc = (paramId) => $t(`equipSkills.${paramId}`);

    $: statIconId = paramId.toLowerCase() === "maxhp"
        ? "hp"
        : paramId.toLowerCase();

    $: firstElemIconId = getFirstElemIconId(paramId);
    $: secondElemIconId = getSecondElemIconId(paramId);

    function getFirstElemIconId(paramId) {
        switch (paramId) {
            case "FireAndNaturalDamageIncrease": return "heat";
            case "CrystAndPulseDamageIncrease": return "cryo";
            default: return "";
        }
    }

    function getSecondElemIconId(paramId) {
        switch (paramId) {
            case "FireAndNaturalDamageIncrease": return "nature";
            case "CrystAndPulseDamageIncrease": return "electric";
            default: return "";
        }
    }

</script>

<TextParamBoxTemplate styleMode={styleMode}>

    <div
        slot="left"
        class:hidden={paramId === "NoAttr"}
    >
        {#if paramId === "FireAndNaturalDamageIncrease" || paramId === "CrystAndPulseDamageIncrease"}

            <div class="relative w-5 h-5 rounded-[4px] pointer-events-none overflow-hidden">

                <div class="absolute top-0 left-0 w-2.5 h-5 overflow-hidden">

                    <Icon
                        name="{firstElemIconId}"
                        class="absolute w-5 h-5 top-0 left-0 text-white pointer-events-none"
                    />

                </div>

                <div class="absolute top-0 left-1/2 w-2.5 h-5 overflow-hidden">

                    <Icon
                        name="{secondElemIconId}"
                        class="absolute w-5 h-5 top-0 -left-2.5 text-white pointer-events-none"
                    />

                </div>

            </div>

        {:else}

            <div class="w-5 h-5 bg-[#2A2A2A] rounded-[4px] flex items-center justify-center pointer-events-none">

                <Icon
                    name="{statIconId}"
                    class="w-3 h-3 text-white pointer-events-none"
                />

            </div>

        {/if}

    </div>

    {getLocaleFunc(paramId)}

</TextParamBoxTemplate>
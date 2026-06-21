<script>
    import TextParamBoxTemplate from "$lib/components/dataToolbarV2/paramBoxes/TextParamBoxTemplate.svelte";
    import Image from "$lib/components/Image.svelte";

    export let styleMode;

    export let paramId;
    export let getLocaleFunc = (param) => param;

    const FILTER_ICON_MAP = {
        weaponMaterialEfficiency: "facskill_spaceship_manufacture_efficiency",
        operatorMaterialEfficiency: "facskill_spaceship_manufacture_efficiency",
        operatorClueCollectingEfficiency: "facskill_spaceship_guestroom_efficiency",
        fungiGrowthEfficiency: "facskill_spaceship_plant_fungus",
        vitrosGrowthEfficiency: "facskill_spaceship_plant_flower",
        mineralGrowthEfficiency: "facskill_spaceship_plant_mineral",
        moodRegen: "facskill_spaceship_physical_power",
        clueEfficiencyBoost: "facskill_spaceship_guestroom_clue",
        moodDropHour_manufacturingCabin: "facskill_spaceship_manufacture_power_consume",
        moodDropHour_receptionRoom: "facskill_spaceship_guestroom_power_consume",
        moodDropHour_growthChamber: "facskill_spaceship_plant_power_consume",
        moodDropHour_controlNexus: "facskill_spaceship_manufacture_power_consume"
    };

    $: iconId = FILTER_ICON_MAP[paramId] || paramId;
</script>

<TextParamBoxTemplate styleMode={styleMode}>

    <div
        slot="left"
        class="w-5 h-5 flex items-center justify-center pointer-events-none"
    >
        <Image
            id={iconId}
            variant="fac-skill"
            className="w-4 h-4 object-contain rounded-sm"
        />
    </div>

    {getLocaleFunc(paramId)}

</TextParamBoxTemplate>

<script>

    import { Building } from "$lib/classes/buildings/Building.js";
    import Icons from "$lib/components/Icons.svelte";
    import Images from "$lib/components/Images.svelte";
    import { t } from "$lib/i18n";

    export let formulaType;
    export let buildingId;
    export let craftTimeMs;

    export let highlight;

    $: building = Building.getBuilding(buildingId);

    $: isBuildingMode = formulaType === "machineCraft"
        || formulaType === "miningFormula"
        || formulaType === "pumpingFormula";
    $: isManualMode = formulaType === "manualCraft";
    $: isHubMode = formulaType === "hubCraft";

    $: svgIconName = isManualMode ? "recepies"
        : isHubMode ? "pba"
        : null;
    $: buildingIconId = isBuildingMode && building ? building.iconId : null;

    $: text = isBuildingMode ? $t(`buildingNames.${building?.id}`)
        : isManualMode ? $t("formulaSidebar.craftSource.manual")
        : isHubMode ? $t("formulaSidebar.craftSource.hub")
        : "";

    $: highlightRing = highlight ? "ring-4 ring-[#F9B90C]" : "";

</script>

<div
    class="relative flex flex-row items-center w-[350px] min-h-14 bg-[#1f1f1f] rounded-md p-3 gap-3 group {highlightRing} border border-[#444]">

    <div
        class="absolute inset-0 border-[2px] border-white rounded-[5px] z-30 pointer-events-none transition-opacity duration-200 opacity-0 group-hover:opacity-100"
    ></div>

    {#if buildingIconId}

        <div class="flex-shrink-0 flex justify-center items-center h-8 w-8">
            <Images
                id={buildingIconId}
                variant="building-icon"
                className="w-full h-full object-contain blur-[0.3px] rotate-[0.01deg] backface-hidden transform-gpu transition-all duration-300"
            />
        </div>

    {:else if svgIconName}

        <div class="flex-shrink-0 flex justify-center items-center h-8 w-8">
            <Icons
                name={svgIconName}
                class="text-[#FDFDFD] dark:text-[#FDFDFD] h-full w-full"
            />
        </div>

    {/if}

    <div class="flex-1 flex items-center w-full">
        <span class="font-sdk text-lg text-left text-[#FDFDFD] dark:text-[#FDFDFD]">
            {text}
        </span>
    </div>

    {#if craftTimeMs}

        <div class="flex-shrink-0 flex items-center">
            <span class="font-nums text-sm text-gray-400">
                {craftTimeMs / 1000}s
            </span>
        </div>

    {/if}

</div>
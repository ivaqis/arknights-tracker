<script>
    import Images from "$lib/components/Images.svelte";
    import Icon from "$lib/components/Icons.svelte";

    export let text;
    export let iconId; // only if iconVariant === "building-icon"
    export let buildingModeName; // only if iconVariant === "buildingMode"
    export let iconVariant; // "building-icon" | "manualCraft" | "hubCraft" | "buildingMode"

    $: svgIconName =
        iconVariant === "manualCraft" ? "recepies"
        : iconVariant === "hubCraft" ? "pba"
        : buildingModeName === "normal" ? "boxes"
        : buildingModeName === "liquid" ? "liquid"
        : "";

</script>

<div class="flex flex-row min-h-10 pl-2 gap-2 w-full items-center rounded-[6px] bg-[#1f1f1f] dark:bg-[#1f1f1f]">

    {#if (iconId && iconVariant)}
        <div class="flex justify-center items-center h-8 w-8">
            <Images
                id={iconId}
                interactive={true}
                variant={iconVariant}
                className="w-full h-full object-contain blur-[0.3px] rotate-[0.01deg] backface-hidden transform-gpu transition-all duration-300"
            />
        </div>
    {/if}

    {#if (iconVariant && svgIconName)}
        <div class="flex justify-center items-center h-8 w-8">
            <Icon
                name={svgIconName}
                class="text-[#FDFDFD] dark:text-[#FDFDFD] h-full w-full"
            />
        </div>
    {/if}

    <div class="flex items-center w-full">
        <span class="font-sdk text-lg text-[#FDFDFD] dark:text-[#FDFDFD]">
            {text}
        </span>
    </div>

</div>
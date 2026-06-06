<script>
    import { t } from "$lib/i18n";
    import { ResourcePoint } from "$lib/classes/items/ResourcePoint.js";
    
    import Tooltip from "$lib/components/Tooltip.svelte";
    import Images from "$lib/components/Images.svelte";

    export let itemId = "";

    export let size = "default"; // "default" | "small" | "micro"

    export let showTooltip = false;

    $: resourcePoint = ResourcePoint.getResourcePointFromItemId(itemId);
    $: item = resourcePoint?.getItem();

    $: iconId = item?.iconId;
    $: resourceIconId = resourcePoint?.bgIconId;

    $: tooltipText = showTooltip && resourcePoint ? $t(`resourcePointNames.${resourcePoint.id}`) : "";

    let boxSize = (() => {
        switch (size) {
            case "small": return "w-[80px] h-[80px]";
            case "micro": return "w-[60px] h-[60px]";

            case "default":
            default: return "w-[110px] h-[110px]";
        }
    })();

    let isHovered = false;
</script>

<Tooltip
    text={tooltipText}
>

    <div class="relative flex flex-col cursor-pointer select-none group flex-shrink-0 {boxSize} no-underline focus:outline-none focus:ring-2 focus:ring-[#F9B90C] rounded-[6px]"
         role="presentation"
         on:mouseenter={() => (isHovered = true)}
         on:mouseleave={() => (isHovered = false)}>

        <div
            class="absolute inset-0 border-[2px] border-white rounded-[6px] z-30 pointer-events-none transition-opacity duration-200 opacity-0 group-hover:opacity-100"
        ></div>

        <div class="relative w-full h-full rounded-[6px] overflow-hidden bg-[#777676]">

            <div class="absolute inset-0 flex items-center justify-center z-0">
                <Images
                    id={resourceIconId}
                    variant="item-icon-bg"
                    className="w-full h-full object-contain blur-[0.3px] rotate-[0.01deg] backface-hidden transform-gpu transition-all duration-300"
                />
            </div>

            {#if (iconId)}
                <div class="absolute inset-0 flex items-center justify-center z-0 left-[25%]">
                    <div class="w-2/3 h-2/3">
                        <Images
                            id={iconId}
                            variant="item-icon"
                            className="w-full h-full object-contain blur-[0.3px] rotate-[0.01deg] backface-hidden transform-gpu transition-all duration-300"
                        />
                    </div>
                </div>
            {/if}

        </div>

    </div>

</Tooltip>
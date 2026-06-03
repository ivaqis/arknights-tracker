<script>
    import { t } from "$lib/i18n";
    import Images from "$lib/components/Images.svelte";
    import {getRarityColor} from "$lib/utils/rarityUtils.js";
    import {FullBottle} from "$lib/classes/items/FullBottle.js";
    import {Item} from "$lib/classes/items/Item.js";
    import Icons from "$lib/components/Icons.svelte";
    import Tooltip from "$lib/components/Tooltip.svelte";

    export let itemId = "";
    export let amount = 0;
    export let tooltipText;

    export let size = "default"; // "default" | "small" | "micro"

    export let showAmount = true;
    export let highlight = false;
    export let showTooltip = false;

    $: item = Item.getItem(itemId);

    let tooltipFinalText;

    $: {
        if (showTooltip) {
            if (tooltipText) tooltipFinalText = tooltipText;
            else if (item) tooltipFinalText = $t(`itemNames.${itemId}`);
        }
    }

    let isFullBottle;
    let fullBottle;
    let liquid;
    let isEventItem;

    $: if (item) {
        isFullBottle = FullBottle.isFullBottle(item.id);

        fullBottle = FullBottle.getFullBottleFromItem(item);
        liquid = fullBottle?.liquidItem;

        isEventItem = item.isEventItem();
    }

    let boxSize = (() => {
        switch (size) {
            case "small": return "w-[80px] h-[80px]";
            case "micro": return "w-[60px] h-[60px]";

            case "default":
            default: return "w-[110px] h-[110px]";
        }
    })();

    let textSize = (() => {
        switch (size) {
            case "small": return "text-sm";
            case "micro": return "text-xs";

            case "default":
            default: return "text-sm"
        }
    })();

    $: highlightRing = highlight ? "ring-2 ring-[#F9B90C]" : "";

    let isHovered = false;
    $: rarityColor = getRarityColor(item?.rarity ?? 1);
</script>

<Tooltip
    text={tooltipFinalText}
>

    <div
        class="relative flex flex-col cursor-pointer select-none group flex-shrink-0 {boxSize} no-underline focus:outline-none focus:ring-2 focus:ring-[#F9B90C] rounded-[6px] {highlightRing}"
        role="presentation"
        on:mouseenter={() => (isHovered = true)}
        on:mouseleave={() => (isHovered = false)}
    >

        <div
            class="absolute inset-0 border-[2px] border-white rounded-[6px] z-30 pointer-events-none transition-opacity duration-200 opacity-0 group-hover:opacity-100"
        ></div>

        <div class="relative w-full h-full rounded-[6px] overflow-hidden bg-white dark:bg-[#2a2a2a]">
            <div
                class="absolute inset-0 bg-gradient-to-br from-[#4F4F4F] to-[#323232] dark:from-[#3a3a3a] dark:to-[#1a1a1a] transition-all duration-200
                group-hover:from-[#5E5E5E] group-hover:to-[#3E3E3E]
                dark:group-hover:from-[#404040] dark:group-hover:to-[#2C2C2C]"
            ></div>

            {#if (item)}

                <div class="absolute inset-0 flex items-center justify-center z-0 bottom-[6px]">
                    <Images
                        id={item.iconId}
                        interactive={true}
                        variant="item-icon"
                        className="w-full h-full object-contain blur-[0.3px] rotate-[0.01deg] backface-hidden transform-gpu transition-all duration-300"
                        alt={item.id}
                    />
                </div>

                {#if isFullBottle}
                    <div class="absolute inset-0 flex items-center justify-center z-0 bottom-[6px]">
                        <div class="w-2/3 h-2/3">
                            <Images
                                id={liquid.iconId}
                                variant="item-icon"
                                className="w-full h-full object-contain blur-[0.3px] rotate-[0.01deg] backface-hidden transform-gpu transition-all duration-300"
                            />
                        </div>
                    </div>
                {/if}

            {:else}

                <div class="absolute inset-0 flex items-center justify-center z-0 bottom-[6px]">
                    <Icons name="noData" class="w-1/2 h-1/2"/>
                </div>

            {/if}

            <div
                class="absolute bottom-0 left-0 w-full h-[6px] z-20"
                style:background-color={rarityColor}
            >
                <div
                    class="absolute bottom-full left-0 w-full h-[30px] pointer-events-none opacity-60"
                    style="--dot-color: {rarityColor}; background-image: radial-gradient(var(--dot-color) 30%, transparent 35%); background-size: 4px 4px; mask-image: linear-gradient(to top, rgba(0,0,0,1) 0%, transparent 100%); -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,1) 0%, transparent 100%);"
                ></div>
            </div>

            {#if showAmount}
                <div class="absolute bottom-[8px] left-0 right-0 z-30 flex justify-center px-0.5">
                    <span
                        class="text-white {textSize} mb-0.5 font-bold text-center leading-tight line-clamp-2 w-full block cursor-pointer"
                        style="text-shadow: 0 1px 3px rgba(0,0,0,0.95), 0 1px 1px rgba(0,0,0,0.95), 0 0 2px rgba(0,0,0,0.8);"
                    >
                        {amount.toLocaleString()}
                    </span>
                </div>
            {/if}

            <div
                class="absolute bottom-0 left-0 w-full h-[6px] z-10"
                style:background-color={rarityColor}
            ></div>
        </div>

        {#if isEventItem}
            <div class="absolute -top-2 -right-2 w-5 h-5 z-[35]">
                <Icons name="eventStar"/>
            </div>
        {/if}

    </div>

</Tooltip>
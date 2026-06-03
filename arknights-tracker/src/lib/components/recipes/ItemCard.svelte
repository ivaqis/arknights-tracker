<script>
    import Images from "$lib/components/Images.svelte";
    import {getRarityColor} from "$lib/utils/rarityUtils.js";
    import {FullBottle} from "$lib/classes/items/FullBottle.js";
    import Icons from "$lib/components/Icons.svelte";

    export let item = {};

    $: isFullBottle = FullBottle.isFullBottle(item.id);

    $: fullBottle = FullBottle.getFullBottleFromItem(item);
    $: liquid = fullBottle?.liquidItem;

    $: isEventItem = item.isEventItem();

    let isHovered = false;
    $: rarityColor = getRarityColor(item.rarity);
</script>

<div
    class="relative flex flex-col cursor-pointer select-none group flex-shrink-0 w-[110px] h-[110px] no-underline focus:outline-none focus:ring-2 focus:ring-[#F9B90C] rounded-[6px]"
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

        <div
            class="absolute inset-0 flex items-center justify-center z-0 bottom-[6px]"
        >
            <Images
                id={item.iconId}
                interactive={true}
                variant="item-icon"
                className="w-full h-full object-contain blur-[0.3px] rotate-[0.01deg] backface-hidden transform-gpu transition-all duration-300"
                alt={item.id}
            />
        </div>

        {#if isFullBottle}
            <div
                class="absolute inset-0 flex items-center justify-center z-0 bottom-[6px]"
            >
                <div class="w-2/3 h-2/3">
                    <Images
                        id={liquid.iconId}
                        variant="item-icon"
                        className="w-full h-full object-contain blur-[0.3px] rotate-[0.01deg] backface-hidden transform-gpu transition-all duration-300"
                    />
                </div>
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

        <div
            class="absolute bottom-0 left-0 w-full h-[6px] z-10"
            style:background-color={rarityColor}
        ></div>
    </div>

    {#if isEventItem}
        <div class="absolute -top-2 -right-2 w-6 h-6 z-[35]">
            <Icons name="eventStar"/>
        </div>
    {/if}

</div>
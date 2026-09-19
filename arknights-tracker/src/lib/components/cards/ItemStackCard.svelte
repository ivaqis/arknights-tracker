<script lang="ts">
    import type { IGameEvent } from "$lib/classes/events/IGameEvent";
    import type { IItem } from "$lib/classes/gameData/items/IItem";
    import { CardSize } from "$lib/components/cards/CardSize";
    import CardTemplate from "$lib/components/cards/CardTemplate.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import Image from "$lib/components/Image.svelte";
    import Tooltip from "$lib/components/Tooltip.svelte";
    import { t } from "$lib/i18n.js";
    import { currentUiLocale, normalizeLocale } from "$lib/stores/locale.js";
    import { getRarityColor } from "$lib/utils/colorUtils.js";

    export let item: IItem;
    export let event: IGameEvent | null = null;
    export let amount: number | null = null;
    export let url: string | null = null;
    export let highlight: boolean = false;
    export let tooltipText: string | null = null;

    export let showTooltip: boolean = false;
    export let showHoverEffect: boolean | undefined = undefined;
    export let size: CardSize = CardSize.DEFAULT;
    export let interactiveImages: boolean = true;

    let textSize: string;
    let eventStarSize: string;

    $: textSize = getTextSize(size);
    $: eventStarSize = getEventStarSize(size);

    function getTextSize(size: CardSize) {
        switch (size) {
            case CardSize.DEFAULT:
            case CardSize.SMALL:
                return "text-sm";
            case CardSize.MICRO:
                return "text-xs";
        }
    }

    function getEventStarSize(size: CardSize) {
        switch (size) {
            case CardSize.DEFAULT: return "h-7 w-7";
            case CardSize.SMALL: return "h-6 w-6";
            case CardSize.MICRO: return "h-5 w-5";
        }
    }

</script>

<CardTemplate
    rarity={item.rarity}
    tooltipText={showTooltip ? tooltipText ?? $t(item.i18nKey) : undefined}
    url={url}
    highlight={highlight}
    size={size}
    showHoverEffect={showHoverEffect}
>

    {#key item}

        {@const icon = item.icon}
        {@const subIcon = item.subIcon}

        <div class="absolute inset-0 flex items-center justify-center z-0 bottom-[6px]">
            <Image
                id={icon.iconId}
                variant={icon.imageVariant}
                alt={item.id}
                interactive={interactiveImages}
                className="w-full h-full object-contain blur-[0.3px] rotate-[0.01deg] backface-hidden transform-gpu transition-all duration-300"
            />
        </div>

        {#if subIcon}

            <div class="absolute inset-0 flex items-center justify-center z-0 bottom-[6px]">
                <div class="w-2/3 h-2/3">
                    <Image
                        id={subIcon.iconId}
                        variant={subIcon.imageVariant}
                        interactive={interactiveImages}
                        className="w-full h-full object-contain blur-[0.3px] rotate-[0.01deg] backface-hidden transform-gpu transition-all duration-300"
                    />
                </div>
            </div>

        {/if}

            {:else}

                <div class="absolute inset-0 flex items-center justify-center z-0 bottom-[6px]">
                    <Icon name="noData" class="w-1/2 h-1/2"/>
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
        slot="overflow"
        class="absolute -top-2 -right-2 {eventStarSize} z-[50]"
        class:hidden={!event}
    >
        <Icon
            name="eventStar"
            class="{eventStarSize}"
        />
    </div>

</CardTemplate>
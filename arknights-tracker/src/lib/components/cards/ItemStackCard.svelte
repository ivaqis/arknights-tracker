<script lang="ts">
    import type { IGameEvent } from "$lib/classes/events/IGameEvent";
    import type { IItem } from "$lib/classes/gameData/items/IItem";
    import { CardSize } from "$lib/components/cards/CardSize";
    import CardTemplate from "$lib/components/cards/CardTemplate.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import Image from "$lib/components/Image.svelte";
    import { t } from "$lib/i18n.js";

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
            case CardSize.DEFAULT:
                return "h-7 w-7";
            case CardSize.SMALL:
                return "h-6 w-6";
            case CardSize.MICRO:
                return "h-5 w-5";
        }
    }

</script>

<CardTemplate
    highlight={highlight}
    rarity={item.rarity}
    showHoverEffect={showHoverEffect}
    size={size}
    tooltipText={showTooltip ? tooltipText ?? $t(item.i18nKey) : undefined}
    url={url}
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

    {/key}

    {#if amount !== null}

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
        class="absolute -top-2 -right-2 {eventStarSize} z-[50]"
        class:hidden={!event}
        slot="overflow"
    >
        <Icon
            class="{eventStarSize}"
            name="eventStar"
        />
    </div>

</CardTemplate>
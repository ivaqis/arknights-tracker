<script lang="ts">
    import type { Rarity } from "$lib/classes/Rarity";
    import { CardSize } from "$lib/components/cards/CardSize";
    import Tooltip from "$lib/components/Tooltip.svelte";
    import { getRarityColor } from "$lib/utils/colorUtils";

    export let rarity: Rarity | undefined = undefined;
    export let tooltipText: string | null = null;
    export let url: string | null = null;
    export let highlight: boolean = false;

    export let size: CardSize = CardSize.DEFAULT;
    export let showHoverEffect: boolean = !!url;

    let boxSize: string;
    let highlightRing: string;

    $: boxSize = getBoxSize(size);
    $: highlightRing = highlight ? `ring-[#F9B90C] ${getRingSize(size)}` : "";

    function getBoxSize(size: CardSize) {
        switch (size) {
            case CardSize.DEFAULT:
                return "w-[110px] h-[110px]";
            case CardSize.SMALL:
                return "w-[80px] h-[80px]";
            case CardSize.MICRO:
                return "w-[60px] h-[60px]";
        }
    }



    function getRingSize(size: CardSize) {
        switch (size) {
            case CardSize.DEFAULT:
            case CardSize.SMALL:
                return "ring-4";
            case CardSize.MICRO:
                return "ring-2";
        }
    }

</script>

<Tooltip
    disabled={!tooltipText}
    text={tooltipText ?? undefined}
>

    <svelte:element
        this={url ? "a" : "div"}
        href={url ?? undefined}
        role={url ? "link" : "presentation"}
        class="relative flex flex-col select-none group flex-shrink-0 {boxSize} no-underline focus:outline-none rounded-[6px] {highlightRing}"
        class:cursor-pointer={showHoverEffect}
    >

        {#if showHoverEffect}
            <div
                class="absolute inset-0 border-[2px] border-white rounded-[6px] z-30 pointer-events-none transition-opacity duration-200 opacity-0 group-hover:opacity-100"
            ></div>
        {/if}

        <div class="relative w-full h-full rounded-[6px] overflow-hidden bg-white dark:bg-[#2a2a2a]">

            <div
                class="absolute inset-0 bg-gradient-to-br from-[#4F4F4F] to-[#323232] dark:from-[#3a3a3a] dark:to-[#1a1a1a] transition-all duration-200"
                class:group-hover:from-[#5E5E5E]={showHoverEffect}
                class:group-hover:to-[#3E3E3E]={showHoverEffect}
                class:dark:group-hover:from-[#404040]={showHoverEffect}
                class:dark:group-hover:to-[#2C2C2C]={showHoverEffect}
            ></div>

            <slot/>

            {#if rarity !== undefined}

                {@const rarityColor = getRarityColor(rarity)}

                <div
                    class="absolute bottom-0 left-0 w-full h-[6px] z-20"
                    style:background-color={rarityColor}
                >
                    <div
                        class="absolute bottom-full left-0 w-full h-[30px] pointer-events-none opacity-60 rarity-gradient"
                        style:--dot-color={rarityColor}
                    ></div>
                </div>

                <div
                    class="absolute bottom-0 left-0 w-full h-[6px] z-10"
                    style:background-color={rarityColor}
                ></div>

            {/if}

        </div>

        <slot name="overflow"/>

    </svelte:element>

</Tooltip>

<style>
    .rarity-gradient {
        background-image: radial-gradient(var(--dot-color) 30%, transparent 35%);
        background-size: 4px 4px;
        mask-image: linear-gradient(to top, rgba(0, 0, 0, 1) 0%, transparent 100%);
        -webkit-mask-image: linear-gradient(to top, rgba(0, 0, 0, 1) 0%, transparent 100%);
    }
</style>
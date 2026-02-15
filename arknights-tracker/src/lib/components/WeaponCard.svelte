<script>
    import { t } from "$lib/i18n";
    import Images from "$lib/components/Images.svelte";

    export let weapon = {};
    export let variant = "default"; // "default" | "small"
    export let className = "";

    let isHovered = false;

    export let hideName = false;

    function getRarityColor(rarity) {
        if (rarity === 6) return "#F4700C"; // Orange
        if (rarity === 5) return "#F9B90C"; // Gold
        if (rarity === 4) return "#9253F1"; // Purple
        if (rarity === 3) return "#25B9F9"; // Blue
        if (rarity === 2) return "#8F8F8F"; // Gray
        return "#8F8F8F";
    }

    $: safeRarity = weapon?.rarity || 1;
    $: rarityColor = getRarityColor(safeRarity);
    $: nameKey = weapon.id || weapon.name?.toLowerCase().replace(/\s+/g, "");
    $: rootClass =
        variant === "small"
            ? `relative flex flex-col cursor-pointer select-none group flex-shrink-0 ${className || "w-[80px] h-[80px]"}`
            : `relative flex flex-col cursor-pointer select-none group flex-shrink-0 ${className || "w-[100px] h-[100px]"}`;
</script>

{#if weapon && weapon.id}
    <div
        class={rootClass}
        on:mouseenter={() => (isHovered = true)}
        on:mouseleave={() => (isHovered = false)}
        role="button"
        tabindex="0"
    >
        <div
            class="absolute inset-0 border-[2px] border-white rounded-[6px] z-50 pointer-events-none transition-opacity duration-200 opacity-0 group-hover:opacity-100"
        ></div>

        <div
            class="
            relative w-full h-full rounded-[6px] overflow-hidden
            shadow-sm dark:shadow-sm
            bg-[#2a2a2a]
        "
        >
            <div
                class="absolute inset-0 bg-gradient-to-br from-[#3a3a3a] to-[#1a1a1a]"
            ></div>

            <div
                class="absolute inset-0 bottom-[6px] flex items-center justify-center z-0"
            >
                <Images
                    id={weapon.id}
                    variant="weapon-icon"
                    className="w-full h-full object-contain drop-shadow-md"
                    alt={weapon.name}
                />
            </div>
            {#if !hideName}
                <div
                    class="absolute bottom-[6px] left-0 right-0 h-[30px] z-10 pointer-events-none bg-gradient-to-t from-black/50 to-transparent"
                ></div>
            {/if}
            <div
                class="absolute bottom-0 left-0 w-full h-[6px] z-20"
                style:background-color={rarityColor}
            >
                <div
                    class="absolute bottom-full left-0 w-full h-[30px] pointer-events-none opacity-60"
                    style="
                        --dot-color: {rarityColor};
                        background-image: radial-gradient(var(--dot-color) 30%, transparent 35%);
                        background-size: 4px 4px;
                        mask-image: linear-gradient(to top, rgba(0,0,0,1) 0%, transparent 100%);
                        -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,1) 0%, transparent 100%);
                    "
                ></div>
            </div>
            {#if !hideName}
                <div
                    class="absolute bottom-[8px] left-0 right-0 z-30 pointer-events-none flex justify-center px-1"
                >
                    <div
                        class="text-white text-[9px] font-bold text-center leading-none line-clamp-1 drop-shadow-md opacity-90"
                    >
                        {$t(`weaponsList.${nameKey}`) || weapon.name}
                    </div>
                </div>
            {/if}
            <div
                class="absolute bottom-0 left-0 w-full h-[6px] z-10"
                style:background-color={rarityColor}
            ></div>
        </div>
    </div>
{/if}

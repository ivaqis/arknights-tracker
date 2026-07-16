<script>
    export let pot = 0;
    export let size = 34;
    export let showNumber = false;
    export let className = "";

    const potPaths = [
        "M49.8633 25.9639L52.5508 34.0273L18.6602 9.55078L16.7285 1.82324L49.8633 25.9639Z",
        "M35.3769 14.521L43.8763 14.4792L10.06 39.0583L2.11523 38.4865L35.3769 14.521Z",
        "M20.1176 23.9788L22.9078 15.9502L34.827 56.0203L31.6429 63.3215L20.1176 23.9788Z",
        "M24.2399 42.7944L17.3306 37.8443L59.1357 37.7639L65.2359 42.8858L24.2399 42.7944Z",
        "M44.879 41.6553L38.1667 46.8695L49.9912 6.77135L56.6378 2.38173L44.879 41.6553Z",
    ];

    $: isMaxPot = pot >= 5;
</script>

<div class="relative flex items-center justify-center shrink-0 {className}" style="width: {size}px; height: {size}px;">
    <svg width={size} height={size} viewBox="0 0 68 66" fill="none" class="transition-all duration-300 overflow-visible">
    {#each potPaths as d, i}
        {@const isActive = i < pot}
        {@const isNext = i === pot}
        {@const isYellowState = isNext}

        {@const fill = isMaxPot ? "#FEFEFE" : isYellowState ? "#FEDE28" : isActive ? "#FFFDFE" : "rgba(255, 255, 255, 0.35)"}
        {@const stroke = isMaxPot ? "#FDD835" : isYellowState ? "#FEDE28" : isActive ? "#FFFDFE" : "rgba(255, 255, 255, 0.65)"}
        {@const strokeWidth = isMaxPot ? "1.0" : "1.5"}

        {@const glowClass = isMaxPot
            ? 'drop-shadow-[0_0_8px_rgba(254,222,40,0.6)]'
            : isYellowState
                ? 'drop-shadow-[0_0_8px_rgba(254,222,40,0.8)]'
                : isActive
                    ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]'
                    : 'drop-shadow-none'}

        <path
            {d}
            {fill}
            {stroke}
            stroke-width={strokeWidth}
            class="transition-all duration-300 {glowClass}"
        />
    {/each}
</svg>
    
    {#if showNumber && pot > 0}
        <span 
            class="absolute text-white font-nums font-black text-center select-none"
            style="
                font-size: {Math.max(10, Math.round(size * 0.3))}px;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.9), -1px -1px 2px rgba(0,0,0,0.9), 1px -1px 2px rgba(0,0,0,0.9), -1px 1px 2px rgba(0,0,0,0.9);
                line-height: 1;
            "
        >
            {pot}
        </span>
    {/if}
</div>
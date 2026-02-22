<script>
    import { t } from "$lib/i18n";
    import { goto } from "$app/navigation";
    import { pullData } from "$lib/stores/pulls";
    import Icon from "$lib/components/Icons.svelte";
    import Tooltip from "$lib/components/Tooltip.svelte";
    import Images from "$lib/components/Images.svelte";

    export let operator = {};
    export let variant = "default"; // "default" | "small"
    export let className = ""; 

    $: totalPulls = (() => {
        if (!$pullData) return 0;
        let count = 0;
        
        Object.entries($pullData).forEach(([bannerName, banner]) => {
            const pulls = banner?.pulls || [];
            
            const matches = pulls.filter(p => 
                p.id === operator.id || 
                p.name === operator.id || 
                p.itemId === operator.id || 
                (p.name && operator.name && p.name.toLowerCase() === operator.name.toLowerCase())
            );
            
            count += matches.length;
        });
        
        return count;
    })();

    $: constCount = totalPulls > 0 ? Math.min(5, totalPulls - 1) : 0;
    $: isMaxPot = constCount === 5;

    const potPaths = [
        "M35.3769 14.521L43.8763 14.4792L10.06 39.0583L2.11523 38.4865L35.3769 14.521Z",
        "M20.1176 23.9788L22.9078 15.9502L34.827 56.0203L31.6429 63.3215L20.1176 23.9788Z",
        "M24.2399 42.7944L17.3306 37.8443L59.1357 37.7639L65.2359 42.8858L24.2399 42.7944Z",
        "M44.879 41.6553L38.1667 46.8695L49.9912 6.77135L56.6378 2.38173L44.879 41.6553Z",
        "M49.8633 25.9639L52.5508 34.0273L18.6602 9.55078L16.7285 1.82324L49.8633 25.9639Z"
    ];

    let isHovered = false;

    export let hideName = false;

    function getRarityColor(rarity) {
        if (rarity === 6) return "#F4700C";
        if (rarity === 5) return "#F9B90C";
        if (rarity === 4) return "#9253F1";
        return "#888";
    }

    $: safeRarity = operator?.rarity || 1;
    $: rarityColor = getRarityColor(safeRarity);
    $: nameKey = operator.id || operator.name?.toLowerCase().replace(/\s+/g, "");

    let nameElement;
    let isTruncated = false;

    function checkTruncation() {
        if (nameElement) {
            isTruncated = nameElement.scrollWidth > nameElement.clientWidth;
        }
    }

    function handleClick() {
        if (operator?.id) {
            goto(`/operators/${operator.id}`);
        }
    }

    $: cornerSize = variant === "small" ? "w-2 h-2" : "w-3 h-3";
    $: borderW = variant === "small" ? "2px" : "4px"; 
    $: rootClass = variant === "small"
        ? `relative cursor-pointer transition-all duration-300 select-none group bg-transparent flex-shrink-0 ${className || 'w-[80px] h-[110px]'}`
        : `relative w-[120px] h-[147px] cursor-pointer transition-all duration-300 select-none group bg-transparent flex-shrink-0 ${className}`;
    $: iconSize = variant === "small" ? "w-4 h-4" : "w-6 h-6";
    $: iconPadding = variant === "small" ? "pl-1 pt-1 gap-0.5" : "pl-0.5 pt-0.5 gap-0";

</script>

{#if operator && operator.id}
    <div
        class={rootClass}
        on:mouseenter={() => (isHovered = true)}
        on:mouseleave={() => (isHovered = false)}
        role="button"
        tabindex="0"
        on:click={handleClick}
        on:keydown={(e) => e.key === "Enter" && handleClick()}
    >
        {#if isHovered && variant != "small"}
        <div class="absolute -inset-[3px] z-40 pointer-events-none transition-all duration-100">
            <div class={`absolute top-0 left-0 ${cornerSize} border-[#FFF593] dark:border-[#FFD700] rounded-tl-md shadow-sm`} style={`border-top-width: ${borderW}; border-left-width: ${borderW};`}></div>
            <div class={`absolute top-0 right-0 ${cornerSize} border-[#FFF593] dark:border-[#FFD700] rounded-tr-md shadow-sm`} style={`border-top-width: ${borderW}; border-right-width: ${borderW};`}></div>
            <div class={`absolute bottom-0 left-0 ${cornerSize} border-[#FFF593] dark:border-[#FFD700] rounded-bl-md shadow-sm`} style={`border-bottom-width: ${borderW}; border-left-width: ${borderW};`}></div>
            <div class={`absolute bottom-0 right-0 ${cornerSize} border-[#FFF593] dark:border-[#FFD700] rounded-br-md shadow-sm`} style={`border-bottom-width: ${borderW}; border-right-width: ${borderW};`}></div>
        </div>
    {/if}

    <div class="absolute inset-0 border-[2px] border-white dark:border-white rounded-[6px] z-30 pointer-events-none transition-opacity duration-100 opacity-0 group-hover:opacity-100"></div>

        <div class="
        relative w-full h-full rounded-[6px] overflow-hidden transition-all duration-200
        shadow-sm dark:shadow-sm
        group-hover:shadow-md dark:group-hover:shadow-md
        bg-gradient-to-b from-gray-50 to-gray-200 
        group-hover:from-white group-hover:to-gray-100
        dark:bg-[#2C2C2C] dark:bg-none
        dark:group-hover:bg-[#353535]
    ">
            
            <div class="absolute inset-0 {variant === 'default' ? 'bottom-[21%]' : 'bottom-0'}">
                <Images
                    id={operator.id}
                    variant="operator-preview"
                    size="100%"
                    alt={operator.name}
                    className="w-full h-full object-cover"
                />
                
                {#if variant === "small" && !hideName}
                    <div class="absolute bottom-0 left-0 right-0 h-[60%] bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none"></div>
                {/if}
            </div>

            <div class="absolute inset-0 z-20 {iconPadding} flex flex-col items-start pointer-events-none">
                <div class="pointer-events-auto">
                    <Tooltip
                        textKey={`classes.${operator.class}`}
                        class={`flex items-center justify-center filter drop-shadow-md cursor-pointer ${iconSize}`}
                    >
                        <Icon name={operator.class} class="w-full h-full text-white" />
                    </Tooltip>
                </div>

                {#if operator.element}
                    <div class="pointer-events-auto">
                        <Tooltip
                            textKey={`elements.${operator.element}`}
                            class={`flex items-center justify-center filter drop-shadow-md cursor-pointer ${iconSize}`}
                        >
                            <Icon name={operator.element} class="w-full h-full text-white" />
                        </Tooltip>
                    </div>
                {/if}
            </div>

            

            {#if variant === "default"}
                <div class="absolute bottom-[24px] w-full flex justify-center items-center gap-[-2px] z-20">
                    {#each Array(safeRarity) as _}
                        <div class="relative w-[20px] h-[20px] flex items-center justify-center">
                            <div class="relative z-10 w-full h-full drop-shadow-sm" style:color={rarityColor}>
                                <Icon name="strokeStar" class="w-5 h-5 fill-current" />
                            </div>
                        </div>
                    {/each}
                </div>

                <div
                    class="
                        absolute bottom-0 left-0 w-full h-[32px] z-10 flex items-center justify-center px-2 pb-0.5 transition-colors duration-200
                        bg-white dark:bg-[#383838]
                        group-hover:bg-white dark:group-hover:bg-[#373737]
                    "
                    role="none"
                    on:mouseenter={checkTruncation}
                >
                    <div class="w-full relative z-20 pointer-events-auto">
                        <Tooltip
                            text={isTruncated ? $t(`characters.${nameKey}`) || operator.name : ""}
                            class="w-full block cursor-pointer"
                        >
                            <div
                                bind:this={nameElement}
                                class="font-bold pb-1.5 text-[#1d1e1f] dark:text-[#E0E0E0] text-[11px] leading-normal whitespace-nowrap overflow-hidden text-ellipsis text-center w-full"
                            >
                                {$t(`characters.${nameKey}`) || operator.name}
                            </div>
                        </Tooltip>
                    </div>
                    <div class="absolute bottom-0 left-0 w-full h-[7px]" style:background-color={rarityColor}></div>
                </div>
                <div class="absolute top-1 right-1.5 z-20 pointer-events-none drop-shadow-md shadow-black">
                <svg 
                    width={variant === 'small' ? '18' : '34'} 
                    height={variant === 'small' ? '18' : '34'} 
                    viewBox="0 0 68 66" 
                    fill="none" 
                    class="transition-all  duration-300 {isMaxPot ? 'drop-shadow-[0_0_8px_rgba(254,222,40,0.8)]' : 'drop-shadow-sm'}"
                >
                    {#each potPaths as d, i}
                        {@const isActive = i < constCount}
                        <path 
                            {d} 
                            fill={isActive ? "#FEDE28" : "black"} 
                            stroke={isMaxPot ? "white" : (isActive ? "#E5D32B" : "white")} 
                            stroke-width="1.5"
                            class="transition-colors duration-300"
                        />
                    {/each}
                </svg>
            </div>
            {/if}

            {#if variant === "small" && !hideName}
                 <div class="absolute bottom-0 left-0 right-0 z-20 pointer-events-none flex flex-col justify-end p-1.5 pb-1.5 h-full">
                     <div class="text-white text-[8px] font-bold leading-tight text-center drop-shadow-md line-clamp-2 break-words mb-1">
                         {$t(`characters.${nameKey}`) || operator.name}
                     </div>
                     <div class="h-[2px] w-full rounded-full opacity-90 shrink-0 shadow-sm" style:background-color={rarityColor}></div>
                 </div>
            {/if}
        </div>
    </div>
{/if}
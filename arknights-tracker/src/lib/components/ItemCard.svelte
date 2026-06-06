<script>
    import { t } from "$lib/i18n";

    import Images from "$lib/components/Images.svelte";

    export let item = {};
    export let amount = 0;
    export let customPath;
    export let hideAmount = false;
    
    function getRarityColor(rarity) {
        if (rarity === 5) return "#FFC107";
        if (rarity === 4) return "#A857FA";
        if (rarity === 3) return "#25B9F9";
        if (rarity === 2) return "#8F8F8F";
        return "#8F8F8F";
    }

    $: color = getRarityColor(item.rarity || 3);
    $: itemIdKey = item.id ? item.id.replace(/\s+/g, '') : "unknown";
    $: imageVariant = customPath?.toLowerCase().includes("itemname") ? "item-icon" : "item";
    $: translationPrefix = customPath?.toLowerCase().includes("itemname") ? "itemNames" : "items";
</script>

<div class="w-[80px] flex flex-col group select-none shadow-sm hover:shadow-md transition-shadow">
    
    <div class="relative w-full bg-[#E5E5E5] flex items-center justify-center overflow-visible">
        
        <Images 
            id={item.id} 
            variant={imageVariant}
            interactive={true}
            className="w-full h-full object-contain p-1" 
        />

        <div 
            class="absolute bottom-[-6px] right-[-2px] z-20 text-sm font-bold font-sdk leading-none text-white drop-shadow-[0_2px_0_rgba(0,0,0,1)] stroke-black paint-order-stroke"
            style="-webkit-text-stroke: 3px black; paint-order: stroke fill;"
        >
            {#if hideAmount === false}
                <span class="relative z-10">{amount.toLocaleString()}</span>
            {/if}
        </div>
    </div>

    <div class="relative w-full h-[6px] z-10 mt-[2px]" style:background-color={color}>
        <div 
            class="absolute bottom-full left-0 w-full h-[20px] pointer-events-none opacity-60"
            style="
                background-image: radial-gradient({color} 30%, transparent 35%);
                background-size: 4px 4px;
                mask-image: linear-gradient(to top, rgba(0,0,0,1) 0%, transparent 100%);
                -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,1) 0%, transparent 100%);
            "
        ></div>
    </div>

    <div class="bg-[#333] w-full min-h-[24px] flex items-center justify-center py-1 px-1 mt-[2px]">
        <span class="text-white text-[10px] font-bold text-center leading-tight break-words">
            {$t(`${translationPrefix}.${itemIdKey}`) || item.name}
        </span>
    </div>
</div>
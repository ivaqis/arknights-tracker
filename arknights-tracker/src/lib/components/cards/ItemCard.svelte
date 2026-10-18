<script>
    import { t } from "$lib/i18n";
    import { currentUiLocale, normalizeLocale } from "$lib/stores/locale";
    import { items } from "$lib/data/items/items";
    import { openItemModal } from "$lib/stores/itemModal";

    import { getRarityColor } from "$lib/utils/colorUtils.js";
    import Image from "$lib/components/Image.svelte";

    export let item = {};
    export let amount = 0;
    export let customPath = undefined;
    export let hideAmount = false;
    export let linkToRecipe = false;

    $: void customPath;
    $: void linkToRecipe;

    const equipmentMatToItemMap = {
        'origocrust': 'item_crystal_shell',
        'wood': 'item_plant_tundra_wood',
        'amethystComponent': 'item_equip_script_1',
        'ferriumComponent': 'item_equip_script_2',
        'crystonComponent': 'item_equip_script_3',
        'xiraniteComponent': 'item_equip_script_4',
        'cupriumComponent': 'item_equip_script_4_1',
        'hetoniteComponent': 'item_equip_script_4_2',
        'pyrroliteComponent': 'item_equip_script_4_3',
    };

    $: resolvedItemId = item.id ? (equipmentMatToItemMap[item.id] || item.id) : null;
    $: itemRarity = item.rarity || (resolvedItemId ? items[resolvedItemId]?.rarity : 3) || 3;
    $: color = getRarityColor(itemRarity);
    $: itemIdKey = resolvedItemId ? resolvedItemId.replace(/\s+/g, '') : (item.id ? item.id.replace(/\s+/g, '') : "unknown");
    $: imageVariant = "item";

    function handleClick() {
        if (resolvedItemId) {
            openItemModal(resolvedItemId);
        } else if (item.id) {
            openItemModal(item.id);
        }
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div 
    class="w-[80px] flex flex-col group select-none shadow-sm hover:shadow-md transition-shadow relative cursor-pointer h-fit"
    on:click={handleClick}
>
    
    <div class="relative w-full bg-[#E5E5E5] hover:bg-[#cccccc] transition-colors duration-200 flex items-center justify-center overflow-visible">
        
        <Image
            id={resolvedItemId || item.id} 
            variant={imageVariant}
            interactive={true}
            className="w-full h-full object-contain p-1" 
        />

        <div 
            class="absolute bottom-[-6px] right-[-2px] z-20 text-sm font-bold font-sdk leading-none text-white drop-shadow-[0_2px_0_rgba(0,0,0,1)] stroke-black paint-order-stroke"
            style="-webkit-text-stroke: 3px black; paint-order: stroke fill;"
        >
            {#if hideAmount === false}
                <span class="relative z-10">{amount.toLocaleString(normalizeLocale($currentUiLocale))}</span>
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
        <span class="text-white text-[10px] font-bold text-center leading-tight break-words select-text">
            {$t(`itemNames.${itemIdKey}`)}
        </span>
    </div>
</div>
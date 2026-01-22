<!-- src/lib/components/ItemCard.svelte -->
<script>
    import { t } from "$lib/i18n";
    import Icon from "$lib/components/Icons.svelte";

    // item: { id, name, rarity, icon }
    export let item = {};
    export let amount = 0;

    // Цвета редкости для предметов
    function getRarityColor(rarity) {
        if (rarity === 5) return "#FFC107"; // Gold
        if (rarity === 4) return "#A857FA"; // Purple
        if (rarity === 3) return "#25B9F9"; // Blue
        if (rarity === 2) return "#8F8F8F"; // Gray
        return "#8F8F8F";
    }

    $: color = getRarityColor(item.rarity || 3);
    $: itemIdKey = item.id ? item.id.replace(/\s+/g, '') : "unknown";
</script>

<!-- Контейнер с фиксированной шириной, но высота зависит от контента -->
<div class="w-[80px] flex flex-col group select-none">
    
    <!-- 1. Изображение -->
    <div class="relative w-full h-[80px] bg-[#E5E5E5] flex items-center justify-center overflow-visible">
        <!-- Фон/Картинка -->
        {#if item.icon}
            <img src={item.icon} alt={item.name} class="w-full h-full object-cover" />
        {:else}
            <!-- Заглушка, если нет картинки -->
            <div class="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                <!-- Если это валюта t_creds, покажем иконку -->
                {#if item.id === 't_creds'}
                    <span class="font-bold text-2xl">©</span>
                {:else}
                    <Icon name="cube" class="w-8 h-8 opacity-20" />
                {/if}
            </div>
        {/if}

        <!-- Количество (справа внизу, вылезает за край) -->
        <div 
            class="absolute bottom-[-6px] right-[-2px] z-20 text-sm font-bold font-sdk leading-none text-white drop-shadow-[0_2px_0_rgba(0,0,0,1)] stroke-black paint-order-stroke"
            style="-webkit-text-stroke: 3px black; paint-order: stroke fill;"
        >
            <!-- Было text-xl и "x{amount}", стало text-lg и "{amount}" -->
            <span class="relative z-10">{amount.toLocaleString()}</span>
        </div>
    </div>

    <!-- 2. Полоска редкости с градиентом вверх -->
    <div class="relative w-full h-[6px] z-10 mt-[2px]" style:background-color={color}>
        <!-- Градиент из точек (CSS Pattern) -->
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

    <!-- 3. Плашка с именем (растягивается) -->
    <div class="bg-[#333] w-full min-h-[24px] flex items-center justify-center py-1 px-1 mt-[2px]">
        <span class="text-white text-[10px] font-bold text-center leading-tight break-words">
            {$t(`items.${itemIdKey}`) || item.name}
        </span>
    </div>
</div>

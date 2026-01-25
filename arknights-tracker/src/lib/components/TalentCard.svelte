<script>
    import { t } from "$lib/i18n";
    import ItemCard from "$lib/components/ItemCard.svelte";
    import Images from "$lib/components/Images.svelte";

    export let charId = "";
    export let type = "talent"; 
    export let index = 0;       
    export let dataKey = "";    
    export let materials = []; // Может быть undefined
    export let localizedData = {}; // Может быть undefined
    
    // maxLevels теперь работает как "лимит", а не жесткое число
    export let maxLevels = 2; 

    // === ВЫЧИСЛЯЕМ КОЛИЧЕСТВО КНОПОК ===
    // Смотрим, сколько уровней в материалах ИЛИ в описаниях
    $: levelsCount = (() => {
        const matLength = materials?.length || 0;
        const descLength = localizedData?.levels?.length || 0;
        
        // Берем максимальное значение (вдруг материалов нет, а текст есть)
        // Но не меньше 1 (чтобы карточка не была пустой)
        let count = Math.max(matLength, descLength, 1);
        
        // Но не больше заданного лимита (на всякий случай)
        return Math.min(count, maxLevels);
    })();

    let currentLevel = 1;

    // Сбрасываем уровень на 1, если данные поменялись
    $: if (dataKey) currentLevel = 1;

    // === ЛОГИКА ===
    function getLevelLabel(lvl) {
        if (type === 'base') {
            if (index === 0) return lvl === 1 ? 'β' : 'γ';
            if (index === 1) return lvl === 1 ? 'α' : 'β';
        }
        return null; 
    }

    $: imageId = `${charId}_${dataKey}`;
    $: currentMaterials = (materials && materials[currentLevel - 1]) ? materials[currentLevel - 1] : [];
    $: name = localizedData?.name || dataKey; 
    $: description = localizedData?.levels?.[currentLevel - 1] || "No description";
</script>

<div class="bg-white rounded-xl p-5 shadow-sm border border-gray-200 w-full flex flex-col md:flex-row gap-6 transition-all hover:border-gray-300">
    
    <div class="flex-1 flex flex-col gap-4">
        
        <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-lg bg-gray-900 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                <Images 
                    id={imageId} 
                    variant="skill-icon" 
                    className="w-full h-full object-cover"
                />
            </div>
            
            <h3 class="text-lg font-bold text-[#21272C]">
                {name}
            </h3>
        </div>

        <div class="flex flex-wrap gap-2 pl-[56px] md:pl-0">
            {#each Array(levelsCount) as _, i}
                {@const lvl = i + 1}
                {@const isActive = currentLevel === lvl}
                {@const label = getLevelLabel(lvl)}

                <button 
                    on:click={() => currentLevel = lvl}
                    class="relative w-12 h-12 rounded-lg flex items-center justify-center border-2 transition-all duration-200 select-none
                    {isActive 
                        ? 'border-[#21272C] bg-[#21272C] text-white shadow-md scale-105 z-10' 
                        : 'border-gray-200 bg-gray-50 text-gray-400 hover:border-gray-300 hover:bg-white hover:text-gray-600'}"
                >
                    <div class="font-bold">
                        {#if type === 'base'}
                            <span class="font-serif italic text-2xl">{label}</span>
                        {:else}
                            <div class="flex gap-[3px]">
                                {#each Array(lvl) as _}
                                    <div class="w-[3px] h-4 rounded-full transform -skew-x-[20deg] 
                                        {isActive ? 'bg-[#FACC15]' : 'bg-gray-400'}"></div>
                                {/each}
                            </div>
                        {/if}
                    </div>

                    {#if isActive}
                        <div class="absolute bottom-0 right-0 w-0 h-0 border-l-[10px] border-l-transparent border-b-[10px] border-b-[#FACC15]"></div>
                    {/if}
                </button>
            {/each}
        </div>

        <div class="text-sm text-gray-700 leading-relaxed min-h-[40px] whitespace-pre-wrap mt-1">
            {description}
        </div>
    </div>

    <div class="h-px w-full bg-gray-100 md:hidden"></div>
    <div class="md:w-[240px] shrink-0 flex flex-col gap-2 md:border-l md:border-gray-100 md:pl-6">
        <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">
            {$t("stats.materials") || "Materials"}:
        </span>
        
        <div class="flex flex-wrap gap-2 items-start">
            {#if currentMaterials.length > 0}
                {#each currentMaterials as mat}
                    <div class="transform scale-90 origin-top-left">
                         <ItemCard 
                            item={{ id: mat.name }} 
                            amount={mat.amount} 
                         />
                    </div>
                {/each}
            {:else}
                <div class="w-full text-center py-4 bg-gray-50 rounded border border-dashed border-gray-200">
                    <span class="text-xs text-gray-400 italic">
                        {$t("systemNames.noMaterialsNeeded") || "No materials needed"}
                    </span>
                </div>
            {/if}
        </div>
    </div>
</div>
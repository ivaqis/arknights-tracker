<script>
    import { t } from "$lib/i18n";
    import Icon from "$lib/components/Icons.svelte";
    import ItemCard from "$lib/components/ItemCard.svelte";
    import Button from "$lib/components/Button.svelte";

    export let skillKey = "";
    export let skillData = {};
    export let skillValues = {};
    export let materialsData = {};
    export let itemsDb = [];

    // Состояние (по умолчанию 12)
    let level = 12;
    let isTableMode = false;

    // === ДЛЯ DRAG СЛАЙДЕРА ===
    let isDragging = false;
    let sliderContainer;

    function startDrag(lvl) {
        isDragging = true;
        level = lvl;
    }

    // Математический расчет позиции мыши
    function handleGlobalMouseMove(e) {
        if (!isDragging || !sliderContainer) return;

        const rect = sliderContainer.getBoundingClientRect();
        // Считаем относительно левого края именно слайдера
        const x = e.clientX - rect.left;
        
        // Ширина одного деления
        const stepWidth = rect.width / 12;

        let newLevel = Math.ceil(x / stepWidth);

        if (newLevel < 1) newLevel = 1;
        if (newLevel > 12) newLevel = 12;

        level = newLevel;
    }

    function stopDrag() {
        isDragging = false;
    }

    // === ЛОГИКА МАТЕРИАЛОВ ===
    $: neededMaterials = (() => {
        let mats = [];
        if (level < 10) {
            if (level > 1) mats = materialsData[`skillsRank${level}`] || [];
            else return [];
        } else {
            const specificKey = `${skillKey}Rank${level}`;
            mats = materialsData[specificKey] || [];
        }

        return mats
            .map((mat) => {
                const item = itemsDb.find((i) => i.id === mat.name) || {
                    id: mat.name,
                    name: mat.name,
                    rarity: 1,
                };
                return { ...item, amount: mat.amount };
            })
            .sort((a, b) => (a.id === "t_creds" ? -1 : a.rarity - b.rarity));
    })();

    function getValue(key, lvl) {
        const valObj = skillValues[key];
        if (!valObj || !valObj.data) return "-";
        const idx = Math.min(lvl - 1, valObj.data.length - 1);
        let raw = valObj.data[idx];
        if (valObj.dataType === "percent") return Math.round(raw * 100) + "%";
        return raw;
    }
    $: multiplierKeys = Object.keys(skillValues);
</script>

<svelte:window on:mouseup={stopDrag} on:mousemove={handleGlobalMouseMove} />

<div class="w-full max-w-[1200px] flex flex-col items-end">
    
    <div
        class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-6 w-full transition-all
        {isTableMode ? 'max-w-full' : 'max-w-[600px]'}"
    >
        <div class="flex items-start gap-4">
            <div class="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center shrink-0">
                <Icon name={skillKey} class="w-10 h-10 text-white" />
            </div>

            <div class="flex flex-col gap-2 w-full">
                <div>
                    <div class="flex items-center gap-2 mb-1">
                        <span class="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-bold uppercase text-gray-500 tracking-wider">
                            {skillKey.replace(/([A-Z])/g, " $1").trim()}
                        </span>
                    </div>
                    <h3 class="text-xl font-bold text-[#21272C] leading-tight flex items-baseline gap-2">
                        {skillData.name || "Unknown Skill"}
                        <span class="text-gray-400 font-normal text-sm font-nums">(RANK {level})</span>
                    </h3>
                </div>

                <div 
                    class="flex items-center select-none cursor-pointer w-[480px] outline-none" 
                    bind:this={sliderContainer}
                    role="slider"
                    tabindex="0"
                    aria-valuenow={level}
                    aria-valuemin="1"
                    aria-valuemax="12"
                    on:mousedown={(e) => {
                        const rect = sliderContainer.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const stepWidth = rect.width / 12;
                        let newLevel = Math.ceil(x / stepWidth);
                        if(newLevel < 1) newLevel = 1;
                        if(newLevel > 12) newLevel = 12;
                        startDrag(newLevel);
                    }}
                >
                    {#each Array(12) as _, i}
                        {@const lvl = i + 1}
                        {@const isHex = lvl >= 10}
                        {@const isActive = lvl <= level}
                        {@const isCurrent = lvl === level}
                        
                        <div 
                            class="relative flex-1 py-2 flex justify-center group"
                            data-lvl={lvl}
                        >
                            <div class="pointer-events-none">
                                {#if isHex}
                                    <svg width="20" height="20" viewBox="0 0 24 24" class="transition-transform duration-150 {isCurrent ? 'scale-125 drop-shadow-sm' : ''}">
                                        <path d="M12 2L21 7V17L12 22L3 17V7L12 2Z" fill={isActive ? (isCurrent ? '#FFC107' : '#333') : 'transparent'} stroke={isActive ? 'none' : '#D1D5DB'} stroke-width="2" stroke-linejoin="round"/>
                                    </svg>
                                {:else}
                                    <div class="h-2 w-8 rounded-sm transition-all duration-150 {isActive ? (isCurrent ? 'bg-[#FFC107] scale-110 shadow-sm' : 'bg-[#333]') : 'border border-gray-300 bg-transparent'}"></div>
                                {/if}
                            </div>
                        </div>
                        {#if lvl % 3 === 0 && lvl < 12} <div class="w-3 pointer-events-none"></div> {/if}
                    {/each}
                </div>
            </div>
        </div>  

        <div class="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap mt-2">
            {skillData.description || "No description"}
        </div>

        <div class="border-t border-gray-100 pt-4">
            {#if !isTableMode}
                <div class="flex flex-col gap-2">
                    {#each multiplierKeys as key}
                        <div class="flex justify-between items-center text-sm border-b border-gray-50 pb-1 last:border-0">
                            <span class="font-bold text-gray-600">
                                {(skillData[skillKey] && skillData[skillKey][key]) || skillData[key] || key.replace(/([A-Z])/g, " $1").trim()}
                            </span>
                            <span class="font-nums font-bold text-[#21272C] text-base">
                                {getValue(key, level)}
                            </span>
                        </div>
                    {/each}
                </div>
            {:else}
                <div class="relative w-full rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm animate-fadeIn">
                    <div class="overflow-x-auto custom-scrollbar">
                        <table class="w-full text-sm border-collapse min-w-max">
                            <thead class="bg-[#21272C] text-white">
                                <tr>
                                    <th class="sticky left-0 z-20 bg-[#21272C] px-4 py-3 text-left font-bold border-r border-gray-600 min-w-[150px]">
                                        {$t("stats.level") || "Level"}
                                    </th>
                                    {#each Array(12) as _, i}
                                        {@const lvl = i + 1}
                                        <th class="px-3 py-3 font-nums text-center font-bold border-r border-gray-600/50 last:border-0 cursor-pointer hover:bg-white/10 transition-colors {level === lvl ? 'bg-[#FACC15] text-[#21272C]' : ''}" on:click={() => level = lvl}>
                                            {lvl}
                                        </th>
                                    {/each}
                                </tr>
                            </thead>
                            <tbody class="text-gray-700">
                                {#each multiplierKeys as key}
                                    <tr class="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                                        <td class="sticky left-0 z-10 bg-white px-4 py-2 font-bold text-gray-600 border-r border-gray-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                            {(skillData[skillKey] && skillData[skillKey][key]) || skillData[key] || key.replace(/([A-Z])/g, " $1").trim()}
                                        </td>
                                        {#each Array(12) as _, i}
                                            {@const lvl = i + 1}
                                            <td class="px-2 py-2 text-center font-nums border-r border-gray-100 last:border-0 whitespace-nowrap cursor-pointer {level === lvl ? 'bg-yellow-50 font-bold text-black' : ''}" on:click={() => level = lvl}>
                                                {getValue(key, lvl)}
                                            </td>
                                        {/each}
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                </div>
            {/if}
        </div>

        <div class="flex justify-start">
            <Button
                variant="roundSmall"
                onClick={() => (isTableMode = !isTableMode)}
                active={isTableMode}
                className={isTableMode ? "!bg-[#21272C] !text-white !border-[#21272C] ring-2 ring-gray-200" : ""}
            >
                {$t("stats.table") || "Table"}
            </Button>
        </div>

        <div class="bg-[#F0F2F4] rounded-xl p-4 flex gap-4 overflow-x-auto pb-6 justify-center mt-4 w-full">
            {#if neededMaterials.length > 0}
                {#each neededMaterials as mat (mat.id)}
                    <ItemCard item={mat} amount={mat.amount} />
                {/each}
            {:else}
                <div class="w-full text-center text-gray-400 text-xs py-2 italic">
                    {$t("systemNames.noMaterialsNeeded") || "No materials needed"}
                </div>
            {/if}
        </div>
    </div>
</div>
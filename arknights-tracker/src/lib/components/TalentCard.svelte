<script>
    import { t } from "$lib/i18n";
    import ItemCard from "$lib/components/ItemCard.svelte";
    import Images from "$lib/components/Images.svelte";

    export let charId = "";
    export let type = "talent"; 
    export const weaponType = "";
    export let index = 0;       
    export let blackboard = {};
    export let dataKey = "";    
    export let materials = [];
    export let localizedData = {};
    export let maxLevels = 2; 
    export let indicatorType = "";
    export let facSkillImage = "";
    export let postfixes = [];

    $: levelsCount = (() => {
        const matLength = materials?.length || 0;
        const descLength = localizedData?.levels?.length || 0;
        let count = Math.max(matLength, descLength, 1);
        return Math.min(count, maxLevels);
    })();

    $: skillImageId = (() => {
        if (type === 'base') {
            return facSkillImage; 
        }
        if (type === 'indicator') {
            return `icon_attribute_${indicatorType}`; 
        }
        return `${charId}_${dataKey}`;
    })();

    $: imageVariant = (() => {
        if (type === 'base') return 'fac-skill';
        if (type === 'indicator') return 'attribute-icon';
        return 'skill-icon';
    })();

    let currentLevel = 1;
    $: hasMaterials = materials && materials.some(levelMats => levelMats && levelMats.length > 0);

    $: if (dataKey) currentLevel = 1;

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

    function parseRichText(text) {
        if (!text) return "";

        const styles = {
            'ba.natur': 'text-[#4ADE80] font-bold', // Природный
            'ba.fire': 'text-[#F87171] font-bold',  // Огненный
            'ba.cryst': 'text-[#67E8F9] font-bold', // Кристаллический
            'ba.pulse': 'text-[#C084FC] font-bold', // Электрический
            'ba.phy': 'text-[#A3A3A3] font-bold',   // Физический
            'ba.poise': 'text-[#FBBF24] font-bold', // Ошеломление
            'ba.vup': 'text-[#38BDF8] font-bold',   // Повышение
            'ba.key': 'text-[#E3BC55] font-bold',   // Ключевые термины
            'ba.conduct': 'text-[#C084FC] font-bold', // Электризация
            'ba.spelldmg': 'text-[#E3BC55] font-bold' // Урон от искусств
        };

        return text.replace(/<([@#])([^>]+)>([\s\S]*?)<\/>/g, (match, type, tag, content) => {
            if (tag === 'profile.key') return content;

            let styleClass = styles[tag] || 'text-[#E3BC55] font-bold'; 
            
            if (type === '#') {
                styleClass += ' underline decoration-dashed decoration-current underline-offset-4';
            }

            return `<span class="${styleClass}">${content}</span>`;
        });
    }

    function interpolateBlackboard(text, bb) {
        if (!text) return "";
        if (!bb || Object.keys(bb).length === 0) return text;

        return text.replace(/\{([^}]+)\}/g, (match, content) => {
            let [expr, format] = content.split(':');
            let mathStr = expr;
            
            for (const key in bb) {
                const regex = new RegExp(`\\b${key}\\b`, 'g');
                mathStr = mathStr.replace(regex, `(${bb[key]})`);
            }

            if (/[a-zA-Z_]/.test(mathStr)) return match;

            let result = 0;
            try {
                result = new Function('return ' + mathStr)();
            } catch(e) {
                return match;
            }
            if (format) {
                if (format.includes('%')) {
                    result = parseFloat((result * 100).toFixed(2)) + '%';
                } else if (format === '0') {
                    result = Math.round(result);
                } else {
                    result = parseFloat(Number(result).toFixed(2));
                }
            }
            return `<span class="text-[#38BDF8] font-bold drop-shadow-sm">${result}</span>`;
        });
    }

    $: bbKey = `${dataKey}_${currentLevel}`;
    $: currentBlackboard = blackboard?.[bbKey] || blackboard?.[dataKey] || {};
</script>

<div class="bg-white rounded-xl p-5 shadow-sm dark:bg-[#383838] dark:border-[#444444] border border-gray-200 w-full flex flex-col md:flex-row gap-2 transition-all hover:border-gray-300">
    
    <div class="flex-1 flex flex-col gap-2">
        
        <div class="flex items-center gap-4">
            <div class="shrink-0">
                {#if type === 'base'}
                    <div class="w-[52px] h-[52px] flex items-center  justify-center">
                         <Images 
                            id={skillImageId} 
                            variant={imageVariant} 
                            className="max-w-full max-h-full object-contain"
                        />
                    </div>
                {:else}
                    <div class="w-[52px] h-[52px] rounded-full bg-[#FFD800] border-[3px] border-[#9A8722]/70 overflow-hidden flex items-center justify-center shadow-sm p-[3px]">
                        <Images 
                            id={skillImageId} 
                            variant={imageVariant} 
                            className="w-full h-full object-cover rounded-full"
                        />
                    </div>
                {/if}
            </div>
            
            <div class="flex flex-col gap-1 w-full justify-center">
                <h3 class="text-xl font-black text-[#21272C] dark:text-[#E4E4E4] leading-none tracking-tight">
                    {name}
                </h3>

                {#if levelsCount > 1 && (type === 'base' || hasMaterials)}
                    <div class="flex gap-[6px] items-center mt-1">
                        {#each Array(levelsCount) as _, i}
    {@const lvl = i + 1}
    {@const isFilled = lvl <= currentLevel}
    {@const isCurrent = lvl === currentLevel}
    {@const label = postfixes[i] || getLevelLabel(lvl)}

    <button 
        on:click={() => currentLevel = lvl}
        class="transition-all duration-200 outline-none flex items-center justify-center shrink-0
            {type === 'base'
                ? 'w-7 h-7 rounded border-[2px] font-serif font-bold text-sm ' + 
                  (isFilled 
                    ? 'border-[#FACC15] bg-[#FACC15] text-black ' + (isCurrent ? 'scale-110 shadow-sm' : '') 
                    : 'border-gray-400 text-gray-500 hover:border-gray-600 hover:bg-gray-50')
                
                : 'w-[12px] h-[22px] rounded-full border-[1.5px] transform rotate-[30deg] ' + 
                  (isFilled 
                    ? 'border-[#FACC15] bg-[#FACC15] ' + (isCurrent ? 'scale-110 shadow-sm' : '') 
                    : 'border-gray-500 bg-transparent hover:border-gray-700 hover:bg-gray-50')
            }"
    >
        {#if type === 'base'}
            <span class="not-italic">{label}</span>
        {/if}
    </button>
{/each}
                    </div>
                {/if}
            </div>
        </div>

        <div class="text-sm text-gray-700 dark:text-[#E4E4E4] leading-relaxed min-h-[25px] whitespace-pre-wrap mt-1">
            {@html parseRichText(interpolateBlackboard(description, currentBlackboard))}
        </div>
    </div>

    <div class="h-px w-full bg-gray-100 dark:bg-[#444444] md:hidden"></div>
    <div class="md:w-[240px] shrink-0 flex flex-col gap-2 md:border-l md:border-gray-100 md:dark:border-[#444444] md:pl-6">
        <span class="text-xs font-bold text-gray-400 dark:text-[#B7B6B3]">
            {$t("stats.materials") || "Materials"}
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
                <div class="w-full text-center dark:bg-[#343434] py-4 bg-gray-50 rounded border border-gray-200 dark:border-[#444444]">
                    <span class="text-xs text-gray-400 italic">
                        {$t("systemNames.noMaterialsNeeded") || "No materials needed"}
                    </span>
                </div>
            {/if}
        </div>
    </div>
</div>
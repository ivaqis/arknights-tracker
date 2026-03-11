<script>
    import { t } from "$lib/i18n";
    import Icon from "$lib/components/Icons.svelte";
    import ItemCard from "$lib/components/ItemCard.svelte";
    import Button from "$lib/components/Button.svelte";
    import Images from "$lib/components/Images.svelte";

    export let charId = "";
    export let skillKey = "";
    export let skillData = {};
    export let skillValues = {};
    export let materialsData = {};
    export let weaponType = "";
    export let itemsDb = [];
    export let element = "";

    const elementColors = {
        physical: "#5E5D5D",
        cryo: "#21C4CE",
        nature: "#AABD00",
        electric: "#FFBF00",
        heat: "#FF613D",
    };

    $: currentColor = elementColors[element] || "#5E5D5D";
    $: isUltimate = skillKey === "ultimate";

    $: skillImageId = (() => {
        if (
            skillKey === "basicAttack" ||
            skillKey === "normalAttack" ||
            skillKey === "base"
        ) {
            return weaponType;
        }
        return `${charId}_${skillKey}`;
    })();

    $: console.log(
        "Key:",
        skillKey,
        "Weapon:",
        weaponType,
        "Result ID:",
        skillImageId,
    );

    let level = 12;
    let isTableMode = false;

    let isDragging = false;
    let sliderContainer;

    function startDrag(lvl) {
        isDragging = true;
        level = lvl;
    }

    function handleGlobalMouseMove(e) {
        if (!isDragging || !sliderContainer) return;

        const rect = sliderContainer.getBoundingClientRect();
        const x = e.clientX - rect.left;

        const stepWidth = rect.width / 12;

        let newLevel = Math.ceil(x / stepWidth);

        if (newLevel < 1) newLevel = 1;
        if (newLevel > 12) newLevel = 12;

        level = newLevel;
    }

    function stopDrag() {
        isDragging = false;
    }

    $: neededMaterials = (() => {
        if (level <= 1) return [];
        const mats =
            materialsData[`skillLevel${level}`] ||
            materialsData[`skillLevel0${level}`] ||
            [];

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

    function parseRichText(text) {
        if (!text) return "";

        const styles = {
            "ba.natur": "text-[#4ADE80] font-bold", // Природный
            "ba.fire": "text-[#F87171] font-bold", // Огненный
            "ba.cryst": "text-[#67E8F9] font-bold", // Кристаллический
            "ba.pulse": "text-[#C084FC] font-bold", // Электрический
            "ba.phy": "text-[#A3A3A3] font-bold", // Физический
            "ba.poise": "text-[#FBBF24] font-bold", // Ошеломление
            "ba.vup": "text-[#38BDF8] font-bold", // Повышение
            "ba.key": "text-[#E3BC55] font-bold", // Ключевые термины
            "ba.conduct": "text-[#C084FC] font-bold", // Электризация
            "ba.spelldmg": "text-[#E3BC55] font-bold", // Урон от искусств
        };

        return text.replace(
            /<([@#])([^>]+)>([\s\S]*?)<\/>/g,
            (match, type, tag, content) => {
                if (tag === "profile.key") return content;

                let styleClass = styles[tag] || "text-[#E3BC55] font-bold";

                if (type === "#") {
                    styleClass +=
                        " underline decoration-dashed decoration-current underline-offset-4";
                }

                return `<span class="${styleClass}">${content}</span>`;
            },
        );
    }

    let isTableCopied = false;

    async function copySkillTable() {
        const headers = [$t("stats.level") || "Level", ...Array.from({ length: 12 }, (_, i) => i + 1)];
        let textData = headers.join("\t") + "\n";

        for (const key of multiplierKeys) {
            const rowLabel = (skillData[skillKey] && skillData[skillKey][key]) || skillData[key] || key.replace(/([A-Z])/g, " $1").trim();
            
            const row = [rowLabel];
            for (let i = 1; i <= 12; i++) {
                row.push(getValue(key, i));
            }
            textData += row.join("\t") + "\n";
        }

        try {
            await navigator.clipboard.writeText(textData);
            isTableCopied = true;
            setTimeout(() => {
                isTableCopied = false;
            }, 2000);
        } catch (err) {
            console.error("Failed to copy", err);
        }
    }
</script>

<svelte:window on:mouseup={stopDrag} on:mousemove={handleGlobalMouseMove} />

<div class="w-full max-w-[1200px] flex flex-col items-start 2xl:items-end">
    <div
        class="bg-white p-6 rounded-2xl shadow-sm border dark:bg-[#383838] dark:border-[#444444] border-gray-100 flex flex-col gap-4 w-full transition-all
        {isTableMode ? 'max-w-full' : 'max-w-[600px]'}"
    >
        <div class="flex items-start gap-4">
            <div class="w-20 h-20 shrink-0 flex items-center justify-center relative">
                <div
                    class="absolute inset-0 rounded-full border-[3px] border-transparent"
                    style="background: conic-gradient(from 225deg, #d1d5db 270deg, transparent 0deg) border-box;
                mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
                -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
                -webkit-mask-composite: destination-out;
                mask-composite: exclude;"
                ></div>

                <div class="w-[82%] h-[82%] rounded-full bg-black/30 relative overflow-hidden flex items-center justify-center shadow-lg border border-white/5">
                    {#if isUltimate}
                        <div
                            class="absolute inset-0 opacity-90"
                            style="background-color: {currentColor}"
                        ></div>
                    {:else}
                        <div
                            class="absolute inset-0 opacity-95"
                            style="background-color: {currentColor}; 
            clip-path: polygon(50% 50%, -100% 100%, 200% 100%);"
                        ></div>
                    {/if}

                    <div class="relative z-10 w-[70%] h-[70%] flex items-center justify-center">
                        <Images
                            id={skillImageId}
                            variant="skill-icon"
                            className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
                        />
                    </div>
                </div>
            </div>

            <div class="flex flex-col w-full">
                <div>
                    <div class="flex items-center gap-2 mb-1">
                        <span class="px-2 py-0.5 bg-gray-100 dark:text-[#E4E4E4] dark:bg-[#2C2C2C] rounded text-[10px] font-bold uppercase text-gray-500 tracking-wider">
                            {skillKey.replace(/([A-Z])/g, " $1").trim()}
                        </span>
                    </div>
                    <h3 class="text-xl font-bold text-[#21272C] dark:text-[#E4E4E4] leading-tight flex flex-wrap items-baseline gap-2">
                        {skillData.name || "Unknown Skill"}
                        <span class="text-gray-400 font-normal dark:text-[#B7B6B3] text-sm font-nums whitespace-nowrap">(RANK {level})</span>
                    </h3>
                </div>
<div class="block md:hidden w-full mt-3 mb-2 pr-2">
                    <input
                        type="range"
                        min="1"
                        max="12"
                        step="1"
                        bind:value={level}
                        class="w-full h-2 bg-gray-200 dark:bg-[#2C2C2C] rounded-lg appearance-none cursor-pointer accent-[#FFC107]"
                    />
                    <div class="flex justify-between text-[10px] text-gray-400 dark:text-gray-500 mt-1.5 font-nums font-bold">
                        <span>Lv. 1</span>
                        <span>Lv. 12</span>
                    </div>
                </div>

                <div class="hidden md:flex items-center select-none cursor-pointer w-full max-w-[480px] outline-none mt-1"
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
                        if (newLevel < 1) newLevel = 1;
                        if (newLevel > 12) newLevel = 12;
                        startDrag(newLevel);
                    }}
                >
                    {#each Array(12) as _, i}
                        {@const lvl = i + 1}
                        {@const isHex = lvl >= 10}
                        {@const isActive = lvl <= level}
                        {@const isCurrent = lvl === level}

                        <div class="relative flex-1 py-2 flex justify-center group" data-lvl={lvl}>
                            <div class="pointer-events-none {lvl === 10 ? 'translate-x-3' : lvl === 12 ? '-translate-x-3' : ''}">
                                {#if isHex}
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        class="transition-transform duration-150 {isCurrent ? 'scale-125 drop-shadow-sm' : ''}"
                                    >
                                        <path
                                            d="M12 2L21 7V17L12 22L3 17V7L12 2Z"
                                            class={isActive
                                                ? isCurrent
                                                    ? "fill-[#FFC107] stroke-transparent"
                                                    : "fill-[#333] dark:fill-gray-300 stroke-transparent"
                                                : "fill-transparent stroke-gray-300 dark:stroke-gray-600"}
                                            stroke-width="2"
                                            stroke-linejoin="round"
                                        />
                                    </svg>
                                {:else}
                                    <div
                                        class="h-2 w-8 shrink-0 rounded-sm transition-all duration-150 border {isActive
                                            ? isCurrent
                                                ? 'bg-[#FFC107] border-transparent scale-110 shadow-sm'
                                                : 'bg-[#333] dark:bg-gray-300 border-transparent'
                                            : 'bg-transparent border-gray-300 dark:border-gray-600'}"
                                    ></div>
                                {/if}
                            </div>
                        </div>
                        {#if lvl % 3 === 0 && lvl < 9}
                            <div class="w-3 pointer-events-none"></div>
                        {/if}
                    {/each}
                </div>
            </div>
        </div>

        <div class="text-sm text-gray-700 dark:text-[#E4E4E4] leading-relaxed whitespace-pre-wrap mt-2">
            {@html parseRichText(skillData.description) || "No description"}
        </div>

        <div class="pt-2">
            {#if !isTableMode}
                <div class="flex flex-col gap-2">
                    {#each multiplierKeys as key}
                        <div class="flex justify-between items-center text-sm border-b border-gray-50 dark:border-[#444444]/70 pb-1 last:border-0">
                            <span class="font-bold text-gray-600 dark:text-[#E4E4E4]">
                                {(skillData[skillKey] &&
                                    skillData[skillKey][key]) ||
                                    skillData[key] ||
                                    key.replace(/([A-Z])/g, " $1").trim()}
                            </span>
                            <span class="font-nums font-bold text-[#21272C] dark:text-[#E4E4E4]">
                                {getValue(key, level)}
                            </span>
                        </div>
                    {/each}
                </div>
            {:else}
                <div class="relative w-full rounded-xl border border-gray-200 dark:border-[#444444] overflow-hidden bg-white shadow-sm animate-fadeIn">
                    <div class="overflow-x-auto custom-scrollbar">
                        <table class="w-full text-sm border-collapse min-w-max">
                            <thead class="bg-[#21272C] text-white">
                                <tr>
                                    <th class="sticky left-0 z-20 bg-[#21272C] px-4 py-3 dark:bg-[#343434] text-left font-bold border-r border-gray-600 min-w-[150px] dark:border-[#444444]">
                                        {$t("stats.level") || "Level"}
                                    </th>
                                    {#each Array(12) as _, i}
                                        {@const lvl = i + 1}
                                        <th
                                            class="px-3 py-3 font-nums text-center dark:bg-[#343434] font-bold border-r border-gray-600/50 last:border-0 cursor-pointer hover:bg-white/10 transition-colors {level === lvl ? 'bg-[#FACC15] dark:bg-[#FACC15] text-[#21272C]' : ''}"
                                            on:click={() => (level = lvl)}
                                        >
                                            {lvl}
                                        </th>
                                    {/each}
                                </tr>
                            </thead>
                            <tbody class="text-gray-700">
                                {#each multiplierKeys as key}
                                    <tr class="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                                        <td class="sticky left-0 z-10 bg-white px-4 py-2 font-bold text-gray-600 border-r border-gray-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                            {(skillData[skillKey] &&
                                                skillData[skillKey][key]) ||
                                                skillData[key] ||
                                                key.replace(/([A-Z])/g, " $1").trim()}
                                        </td>
                                        {#each Array(12) as _, i}
                                            {@const lvl = i + 1}
                                            <td
                                                class="px-2 py-2 text-center font-nums border-r border-gray-100 last:border-0 whitespace-nowrap cursor-pointer {level === lvl ? 'bg-yellow-50 font-bold text-black' : ''}"
                                                on:click={() => (level = lvl)}
                                            >
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

        <div class="flex justify-start items-center gap-3">
            <Button
                variant="roundSmall"
                onClick={() => (isTableMode = !isTableMode)}
                active={isTableMode}
                className={isTableMode
                    ? "!border-[#21272C] ring-2 ring-[#FDFD1F] dark:ring-[#FDFD1F]"
                    : ""}
            >
                {$t("stats.table") || "Table"}
            </Button>

            {#if isTableMode}
                <button
                    on:click={copySkillTable}
                    class="flex items-center justify-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-[#444444] dark:hover:bg-[#555] rounded-md transition-colors text-gray-700 dark:text-[#E4E4E4] text-sm font-bold border border-gray-200 dark:border-transparent shrink-0 shadow-sm animate-fadeIn"
                >
                    {#if isTableCopied}
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#FACC15"
                            stroke-width="3"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            class="animate-fadeIn"
                        >
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    {:else}
                        <Icon name="copy" class="w-4 h-4" />
                    {/if}
                    <span>{$t("common.copy") || "Copy"}</span>
                </button>
            {/if}
        </div>

        <div class="bg-[#F0F2F4] rounded-xl p-4 dark:bg-[#343434] flex gap-4 overflow-x-auto materials-scroll pb-3 md:justify-center justify-start mt-4 w-full snap-x">
            {#if neededMaterials.length > 0}
                {#each neededMaterials as mat (mat.id)}
                    <div class="shrink-0 snap-start">
                        <ItemCard item={mat} amount={mat.amount} />
                    </div>
                {/each}
            {:else}
                <div class="w-full text-center text-gray-400 text-xs py-2 italic shrink-0">
                    {$t("systemNames.noMaterialsNeeded") || "No materials needed"}
                </div>
            {/if}
        </div>
    </div>
</div>

<style>
    .materials-scroll::-webkit-scrollbar {
        height: 6px;
    }
    .materials-scroll::-webkit-scrollbar-track {
        background: transparent;
    }
    .materials-scroll::-webkit-scrollbar-thumb {
        background-color: #cbd5e1; /* Серый для светлой темы */
        border-radius: 10px;
    }
    .materials-scroll::-webkit-scrollbar-thumb:hover {
        background-color: #9ca3af;
    }
    
    /* Стили для темной темы через :global, чтобы Tailwind подхватил */
    :global(.dark) .materials-scroll::-webkit-scrollbar-thumb {
        background-color: #525252; /* Темно-серый для темной темы */
    }
    :global(.dark) .materials-scroll::-webkit-scrollbar-thumb:hover {
        background-color: #737373;
    }
</style>
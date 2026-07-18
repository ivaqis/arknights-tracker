<script>
    import { t } from "$lib/i18n.js";
    import { onMount } from "svelte";
    import { preferredSkillMode } from "$lib/stores/settings.js";
    
    import Icon from "$lib/components/Icon.svelte";
    import ItemCard from "$lib/components/cards/ItemCard.svelte";
    import Button from "$lib/components/Button.svelte";
    import Image from "$lib/components/Image.svelte";
    import { parseRichText, hyperlinkAction } from "$lib/utils/richText.js";

    export let charId = "";
    export let skillKey = "";
    export let skillData = {};
    export let skillValues = {};
    export let blackboard = {};
    export let materialsData = {};
    export let weaponType = "";
    export let itemsDb = [];
    export let element = "";
    export let charLevel = 100;
    export let charDetails = {};

    const elementColors = {
        physical: "#5E5D5D",
        cryo: "#21C4CE",
        nature: "#AABD00",
        electric: "#FFBF00",
        heat: "#FF613D",
    }; //Поменять

    $: currentElement = skillValues.elementType || element;
    $: currentColor = elementColors[currentElement] || "#5E5D5D";
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

    let level = 12;
    let isTableMode = false;

    onMount(() => {
        isTableMode = $preferredSkillMode === "table";
    });

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
        let valObj = skillValues[key];

        if (!valObj) {
            for (const k of Object.keys(skillValues)) {
                if (k.startsWith("condition") && skillValues[k] && typeof skillValues[k] === "object") {
                    if (skillValues[k][key]) {
                        valObj = skillValues[k][key];
                        break;
                    }
                }
            }
        }

        if (!valObj) return "-";

        const rawArray = Array.isArray(valObj) ? valObj : valObj.data;
        if (!rawArray || !Array.isArray(rawArray)) return "-";

        const idx = Math.min(lvl - 1, rawArray.length - 1);
        let raw = rawArray[idx];

        if (valObj.dataType === "percent")
            return parseFloat((raw * 100).toFixed(2)) + "%";
        return raw;
    }

    function formatDescriptionString(text) {
        if (!text || typeof text !== "string") return "";
        let formatted = text.replace(/\{([^{}]+)\}/g, (match, content) => {
            const parts = content.split(":");
            if (parts[0] === "floor" && (parts[1] === "deck_wisd" || parts[1] === "deck_will")) {
                const statKey = parts[1] === "deck_wisd" ? "int" : "will";
                const format = parts[2];
                let val = 0;
                if (charDetails && Array.isArray(charDetails[statKey])) {
                    const idx = Math.min(charLevel - 1, charDetails[statKey].length - 1);
                    val = charDetails[statKey][idx] || 0;
                }
                let result = Math.floor(val);
                if (format === "0") {
                    result = Math.round(result);
                } else if (format === "0.0") {
                    result = result.toFixed(1);
                }
                return `<span class="text-[#38BDF8] font-bold drop-shadow-sm">${result}</span>`;
            }

            let rawKey = parts[0];
            let format = parts[1];
            const isNegative = rawKey.startsWith("-");
            const cleanKey = isNegative ? rawKey.substring(1) : rawKey;
            const lowerKey = cleanKey.toLowerCase();

            let foundRaw = null;
            if (skillValues) {
                const fk = Object.keys(skillValues).find(
                    (k) => k.toLowerCase() === lowerKey,
                );
                if (fk) foundRaw = skillValues[fk];
            }
            if (foundRaw === null || foundRaw === undefined) {
                if (blackboard) {
                    for (const subSkill of Object.values(blackboard)) {
                        if (subSkill && typeof subSkill === "object") {
                            const fk = Object.keys(subSkill).find(
                                (k) => k.toLowerCase() === lowerKey,
                            );
                            if (fk) {
                                foundRaw = subSkill[fk];
                                break;
                            }
                        }
                    }
                }
            }
            if (foundRaw === null || foundRaw === undefined) return match;
            let num = 0;
            let isPercentData = false;
            if (
                typeof foundRaw === "object" &&
                !Array.isArray(foundRaw) &&
                Array.isArray(foundRaw.data)
            ) {
                const idx = Math.min(level - 1, foundRaw.data.length - 1);
                num = parseFloat(foundRaw.data[idx]);
                if (foundRaw.dataType === "percent") isPercentData = true;
            } else if (Array.isArray(foundRaw)) {
                const idx = Math.min(level - 1, foundRaw.length - 1);
                num = parseFloat(foundRaw[idx]);
            } else {
                num = parseFloat(foundRaw);
            }
            if (isNaN(num)) return match;
            if (isNegative) num = -num;
            let result = num;
            if (format) {
                if (format.includes("%"))
                    result = Math.round(num * 100) + "%";
                else if (format === "0") result = Math.round(num);
                else if (format === "0.0") result = num.toFixed(1);
                else result = parseFloat(num.toFixed(2));
            } else {
                if (isPercentData)
                    result = parseFloat((num * 100).toFixed(2)) + "%";
                else result = parseFloat(num.toFixed(2));
            }

            return `<span class="text-[#38BDF8] font-bold drop-shadow-sm">${result}</span>`;
        });
        return parseRichText(formatted);
    }

    $: parsedDescription = (() => {
        if (!skillData || !skillData.description) return "";
        if (typeof skillData.description === "object") {
            return formatDescriptionString(skillData.description.main || "");
        }
        return formatDescriptionString(skillData.description);
    })();

    $: subDescriptions = (() => {
        if (!skillData || typeof skillData.description !== "object") return [];
        const descObj = skillData.description;
        const list = [];
        for (let i = 1; ; i++) {
            const nameKey = `conditionName${i}`;
            if (!(nameKey in descObj)) break;

            let condDesc = descObj[`conditionDesc${i}`] || "";
            condDesc = condDesc.replace(/^\/\*/, "").replace(/\*\/$/, "").trim();

            let iconName = "";
            const condKey = `condition${i}`;
            if (skillData[condKey] && typeof skillData[condKey] === "object") {
                iconName = skillData[condKey].icon || "";
            }

            list.push({
                name: descObj[nameKey],
                desc: condDesc,
                postDesc: descObj[`conditionPostDesc${i}`] || "",
                inactiveDesc: (descObj[`conditionDescInactive${i}`] || "").replace(/^\/\*/, "").replace(/\*\/$/, "").trim(),
                icon: iconName,
            });
        }
        return list;
    })();

    $: groupedMultipliers = (() => {
        if (!skillValues) return { base: [], conditions: [] };

        const subData = skillData ? skillData[skillKey] : null;
        const searchSource = subData || skillData || {};

        const conditionGroups = [];
        const usedKeys = new Set();

        for (const k of Object.keys(searchSource)) {
            const match = k.match(/^condition(\d+)$/);
            if (match && typeof searchSource[k] === "object") {
                const condIndex = parseInt(match[1]);
                const condObj = searchSource[k];
                const condKeys = Object.keys(condObj);

                let matchingKeys = [];
                if (skillValues[k] && typeof skillValues[k] === "object") {
                    matchingKeys = Object.keys(skillValues[k]).filter(
                        (vKey) => vKey !== "elementType" && !vKey.startsWith("condition")
                    );
                } else {
                    matchingKeys = Object.keys(skillValues).filter(
                        (vKey) => vKey !== "elementType" &&
                                 !vKey.startsWith("condition") &&
                                 condKeys.some((ck) => ck.toLowerCase() === vKey.toLowerCase())
                    );
                }

                if (matchingKeys.length > 0) {
                    let condName = "";
                    if (skillData && typeof skillData.description === "object") {
                        condName = skillData.description[`conditionName${condIndex}`] || "";
                    }
                    if (!condName) {
                        condName = `Condition ${condIndex}`;
                    }

                    conditionGroups.push({
                        index: condIndex,
                        name: condName,
                        keys: matchingKeys
                    });

                    matchingKeys.forEach((vKey) => usedKeys.add(vKey));
                }
            }
        }

        conditionGroups.sort((a, b) => a.index - b.index);

        const baseKeys = Object.keys(skillValues).filter(
            (vKey) => vKey !== "elementType" && !vKey.startsWith("condition") && !usedKeys.has(vKey)
        );

        return {
            base: baseKeys,
            conditions: conditionGroups
        };
    })();

    $: multiplierKeys = [
        ...groupedMultipliers.base,
        ...groupedMultipliers.conditions.flatMap((g) => g.keys)
    ];


    let isTableCopied = false;

    function getLocalizedLabel(key) {
        if (!skillData) return null;
        const subData = skillData[skillKey];
        if (subData) {
            if (subData[key]) return subData[key];
            const lowerKey = key.toLowerCase();
            const foundKey = Object.keys(subData).find((k) => k.toLowerCase() === lowerKey);
            if (foundKey) return subData[foundKey];
        }
        if (skillData[key]) return skillData[key];
        const lowerKey = key.toLowerCase();
        const foundKey = Object.keys(skillData).find((k) => k.toLowerCase() === lowerKey);
        if (foundKey) return skillData[foundKey];

        for (const k of Object.keys(skillData)) {
            if (k.startsWith("condition") && typeof skillData[k] === "object") {
                const condObj = skillData[k];
                if (condObj[key]) return condObj[key];
                const foundCondKey = Object.keys(condObj).find((ck) => ck.toLowerCase() === lowerKey);
                if (foundCondKey) return condObj[foundCondKey];
            }
        }

        if (subData) {
            for (const k of Object.keys(subData)) {
                if (k.startsWith("condition") && typeof subData[k] === "object") {
                    const condObj = subData[k];
                    if (condObj[key]) return condObj[key];
                    const foundCondKey = Object.keys(condObj).find((ck) => ck.toLowerCase() === lowerKey);
                    if (foundCondKey) return condObj[foundCondKey];
                }
            }
        }

        return null;
    }

    function getLabel(key) {
        const localized = getLocalizedLabel(key);
        if (localized) return localized;
        const translated = $t(`stats.${key}`);
        if (translated && translated !== `stats.${key}`) return translated;
        return key.replace(/([A-Z])/g, " $1").trim();
    }

    async function copySkillTable() {
        const headers = [
            $t("stats.level") || "Level",
            ...Array.from({ length: 12 }, (_, i) => i + 1),
        ];
        let textData = headers.join("\t") + "\n";

        for (const key of multiplierKeys) {
            const rowLabel = getLabel(key);
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

<div
    class="bg-white/90 backdrop-blur-md dark:bg-[#383838]/90 p-6 rounded-2xl shadow-sm border dark:border-[#444444] border-gray-100 flex flex-col gap-4 transition-all duration-300
    {isTableMode ? 'w-full md:max-w-full is-table-mode' : 'w-full md:w-[calc(50%-10px)] md:max-w-[550px]'}"
>
    <div class="flex items-start gap-4">
        <div
            class="w-20 h-20 shrink-0 flex items-center justify-center relative"
        >
            <div
                class="absolute inset-0 rounded-full border-[3px] border-transparent"
                style="background: conic-gradient(from 225deg, #d1d5db 270deg, transparent 0deg) border-box;
                mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
                -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
                -webkit-mask-composite: destination-out;
                mask-composite: exclude;"
            ></div>

            <div
                class="w-[82%] h-[82%] rounded-full bg-black/30 relative overflow-hidden flex items-center justify-center shadow-lg border border-white/5"
            >
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

                <div
                    class="relative z-10 w-[85%] h-[85%] flex items-center justify-center"
                >
                    <Image
                        id={skillImageId}
                        interactive={true}
                        variant="skill-icon"
                        className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
                    />
                </div>
            </div>
        </div>

        <div class="flex flex-col w-full">
            <div>
                <div class="flex items-center gap-2 mb-1">
                    <span
                        class="px-2 py-0.5 bg-gray-100 dark:text-[#E4E4E4] dark:bg-[#2C2C2C] rounded text-[10px] font-bold uppercase text-gray-500 tracking-wider"
                    >
                        {$t(`menu.${skillKey}`) || skillKey.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                </div>
                <h3
                    class="text-xl font-bold text-[#21272C] dark:text-[#E4E4E4] leading-tight flex flex-wrap items-baseline gap-2"
                >
                    {skillData.name || "Unknown Skill"}
                    <span
                        class="text-gray-400 font-normal dark:text-[#B7B6B3] text-sm font-nums whitespace-nowrap"
                        >(RANK {level})</span
                    >
                </h3>
            </div>
            <div class="block md:hidden w-full mt-2 md:mt-3 mb-1 pr-2 max-w-full min-w-0">
                <input
                    type="range"
                    min="1"
                    max="12"
                    step="1"
                    bind:value={level}
                    class="w-full h-2 bg-gray-200 dark:bg-[#2C2C2C] rounded-lg appearance-none cursor-pointer accent-[#FFC107] outline-none touch-none"
                />
                <div
                    class="flex justify-between text-[10px] text-gray-400 dark:text-gray-500 mt-1.5 font-nums font-bold"
                >
                    <span>Lv. 1</span>
                    <span>Lv. 12</span>
                </div>
            </div>

            <div
                class="hidden md:flex items-center select-none w-full outline-none mt-1 h-10 relative max-w-[500px]"
                role="slider"
                tabindex="0"
                aria-valuenow={level}
                aria-valuemin="1"
                aria-valuemax="12"
            >
                <div class="absolute inset-0 flex w-ful z-10">
                    {#each Array(12) as _, i}
                        {@const lvl = i + 1}

                        <div
                            class="{lvl >= 10 ? 'w-5 shrink-0' : 'flex-1'} h-full cursor-pointer"
                            role="slider"
                            tabindex="0"
                            aria-valuenow={lvl}
                            aria-valuemin="1"
                            aria-valuemax="12"
                            on:mousedown={() => startDrag(lvl)}
                            on:mouseenter={() => {
                                if (isDragging) level = lvl;
                            }}
                        ></div>

                        {#if lvl === 3 || lvl === 6 || lvl === 9}
                            <div class="w-3 shrink-0"></div>
                        {/if}
                    {/each}
                </div>

                <div
                    class="flex items-center justify-between w-full pointer-events-none"
                >
                    {#each Array(12) as _, i}
                        {@const lvl = i + 1}
                        {@const isHex = lvl >= 10}
                        {@const isActive = lvl <= level}
                        {@const isCurrent = lvl === level}

                        <div
                            class="flex justify-center items-center {isHex
                                ? 'w-5 shrink-0'
                                : 'flex-1'}"
                        >
                            {#if isHex}
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    class="transition-transform duration-150 {isCurrent
                                        ? 'scale-125 drop-shadow-sm'
                                        : ''}"
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
                                    class="h-2 w-full mx-0.5 rounded-sm transition-all duration-150 border {isActive
                                        ? isCurrent
                                            ? 'bg-[#FFC107] border-transparent scale-[1.05] shadow-sm'
                                            : 'bg-[#333] dark:bg-gray-300 border-transparent'
                                        : 'bg-transparent border-gray-300 dark:border-gray-600'}"
                                ></div>
                            {/if}
                        </div>

                        {#if lvl === 3 || lvl === 6 || lvl === 9}
                            <div class="w-3 shrink-0"></div>
                        {/if}
                    {/each}
                </div>
            </div>
        </div>
    </div>

    <div class="flex flex-col gap-4 mt-2">
        {#if parsedDescription}
            <div
                class="text-sm text-gray-700 dark:text-[#E4E4E4] leading-relaxed whitespace-pre-wrap"
                use:hyperlinkAction
            >
                {@html parsedDescription}
            </div>
        {:else if subDescriptions.length === 0}
            <div class="text-sm text-gray-400 dark:text-gray-500 italic">
                No description
            </div>
        {/if}

        {#if subDescriptions.length > 0}
            <div class="flex flex-col gap-3 pt-2 border-t border-gray-100 dark:border-[#444444]/50">
                {#each subDescriptions as sub}
                    <div class="flex items-start gap-3 bg-gray-200/55 dark:bg-white/[0.02] p-3.5 rounded-xl border border-gray-100/80 dark:border-[#444444]/40">
                        <div class="flex items-center justify-center shrink-0 w-8 h-8 rounded-lg overflow-hidden mt-0.5 border border-gray-200 dark:border-[#444444]/60 bg-black/20 dark:bg-[#2C2C2C]">
                            {#if sub.icon}
                                <Image
                                    id={sub.icon}
                                    interactive={true}
                                    variant="skill-icon"
                                    className="w-[85%] h-[85%] object-contain"
                                />
                            {:else}
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-yellow-600 dark:text-yellow-400">
                                    <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" fill="currentColor" fill-opacity="0.1"/>
                                    <circle cx="12" cy="12" r="3" fill="currentColor"/>
                                </svg>
                            {/if}
                        </div>

                        <div class="flex flex-col gap-1 w-full min-w-0">
                            <h4 class="font-bold text-sm text-[#21272C] dark:text-[#E4E4E4]">
                                {sub.name}
                            </h4>
                            {#if sub.desc}
                                <div class="text-[11px] text-gray-500 dark:text-[#B7B6B3] leading-relaxed bg-gray-700/5 dark:bg-[#2C2C2C]/50 px-2 py-0.5 rounded w-fit" use:hyperlinkAction>
                                    {@html formatDescriptionString(sub.desc)}
                                </div>
                            {/if}
                            {#if sub.postDesc}
                                <div class="text-xs text-gray-600 dark:text-[#C5C5C5] leading-relaxed whitespace-pre-wrap mt-1" use:hyperlinkAction>
                                    {@html formatDescriptionString(sub.postDesc)}
                                </div>
                            {/if}
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    </div>

    <div class="pt-2">
        {#if !isTableMode}
            <div class="flex flex-col gap-2">
                {#each groupedMultipliers.base as key}
                    <div
                        class="flex justify-between items-center text-sm border-b border-gray-100 dark:border-[#444444]/70 pb-1 last:border-0"
                    >
                        <span
                            class="font-bold text-gray-600 dark:text-[#E4E4E4]"
                        >
                            {getLabel(key)}
                        </span>
                        <span
                            class="font-nums font-bold text-[#21272C] dark:text-[#E4E4E4]"
                        >
                            {getValue(key, level)}
                        </span>
                    </div>
                {/each}

                {#each groupedMultipliers.conditions as group}
                    <div class="mt-3 first:mt-0">
                        <div class="text-xs font-bold text-yellow-600 dark:text-yellow-400 uppercase tracking-wider mb-2 pb-1 border-b border-gray-100 dark:border-[#444444]/70">
                            {group.name}
                        </div>
                        <div class="flex flex-col gap-2">
                            {#each group.keys as key}
                                <div
                                    class="flex justify-between items-center text-sm border-b border-gray-100 dark:border-[#444444]/70 last:border-0 pb-1"
                                >
                                    <span
                                        class="font-bold text-gray-600 dark:text-[#E4E4E4]"
                                    >
                                        {getLabel(key)}
                                    </span>
                                    <span
                                        class="font-nums font-bold text-[#21272C] dark:text-[#E4E4E4]"
                                    >
                                        {getValue(key, level)}
                                    </span>
                                </div>
                            {/each}
                        </div>
                    </div>
                {/each}
            </div>
        {:else}
            <div
                class="relative w-full rounded-xl border border-gray-200 dark:border-[#444444] overflow-hidden bg-white dark:bg-[#383838] shadow-sm animate-fadeIn"
            >
                <div class="overflow-x-auto custom-scrollbar">
                    <table class="w-full text-sm border-collapse min-w-max">
                        <thead class="bg-[#21272C] text-white dark:bg-[#2C2C2C] dark:text-[#E4E4E4]">
                            <tr>
                                <th
                                    class="static md:sticky md:left-0 md:z-20 bg-[#21272C] dark:bg-[#2C2C2C] pl-4 pr-2 py-2 text-left font-bold border-r border-gray-700 dark:border-[#444444]/40 min-w-[150px]"
                                >
                                    {$t("stats.level") || "Level"}
                                </th>
                                {#each Array(12) as _, i}
                                    {@const lvl = i + 1}
                                    <th
                                        class="px-2.5 py-2 font-nums text-center dark:bg-[#2C2C2C] font-bold border-r border-gray-700 dark:border-[#444444]/40 last:border-0 cursor-pointer hover:bg-white/10 transition-colors {level ===
                                        lvl
                                            ? 'bg-[#FACC15] dark:bg-[#FACC15] text-[#21272C] dark:text-black'
                                            : ''}"
                                        on:click={() => (level = lvl)}
                                    >
                                        {lvl}
                                    </th>
                                {/each}
                            </tr>
                        </thead>
                        <tbody class="text-gray-700 dark:text-gray-300">
                            {#each groupedMultipliers.base as key}
                                <tr
                                    class="border-b border-gray-100 dark:border-[#444444]/30 last:border-0 hover:bg-gray-50 dark:hover:bg-white/[0.01] transition-colors"
                                >
                                    <td
                                        class="static md:sticky md:left-0 md:z-10 bg-white dark:bg-[#383838] pl-4 pr-2 py-2 font-bold text-gray-600 dark:text-[#B7B6B3] border-r border-gray-100 dark:border-[#444444]/30 md:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] max-w-[200px] break-words whitespace-normal"
                                    >
                                        {getLabel(key)}
                                    </td>
                                    {#each Array(12) as _, i}
                                        {@const lvl = i + 1}
                                        <td
                                            class="px-1.5 py-2 text-center font-nums border-r border-gray-100 dark:border-[#444444]/30 last:border-0 whitespace-nowrap cursor-pointer text-gray-700 dark:text-gray-400 {level ===
                                            lvl
                                                ? 'bg-yellow-50 dark:bg-yellow-500/10 font-bold text-black dark:text-yellow-400'
                                                : ''}"
                                            on:click={() => (level = lvl)}
                                        >
                                            {getValue(key, lvl)}
                                        </td>
                                    {/each}
                                </tr>
                            {/each}

                            {#each groupedMultipliers.conditions as group}
                                <tr class="bg-gray-50/50 dark:bg-[#2F2F2F]/40 border-b border-gray-100 dark:border-[#444444]/30">
                                    <td class="static md:sticky md:left-0 md:z-10 bg-gray-50 dark:bg-[#2F2F2F] pl-4 py-2 font-bold text-xs text-[#21272C] dark:text-[#E4E4E4] uppercase tracking-wider border-r border-gray-100 dark:border-[#444444]/30 md:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                        {group.name}
                                    </td>
                                    <td colspan="12" class="bg-gray-50 dark:bg-[#2F2F2F]"></td>
                                </tr>
                                {#each group.keys as key}
                                    <tr
                                        class="border-b border-gray-100 dark:border-[#444444]/30 last:border-0 hover:bg-gray-50 dark:hover:bg-white/[0.01] transition-colors"
                                    >
                                        <td
                                            class="static md:sticky md:left-0 md:z-10 bg-white dark:bg-[#383838] pl-4 pr-2 py-2 font-bold text-gray-600 dark:text-[#B7B6B3] border-r border-gray-100 dark:border-[#444444]/30 md:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] max-w-[200px] break-words whitespace-normal"
                                        >
                                            {getLabel(key)}
                                        </td>
                                        {#each Array(12) as _, i}
                                            {@const lvl = i + 1}
                                            <td
                                                class="px-1.5 py-2 text-center font-nums border-r border-gray-100 dark:border-[#444444]/30 last:border-0 whitespace-nowrap cursor-pointer text-gray-700 dark:text-gray-400 {level ===
                                                lvl
                                                    ? 'bg-yellow-50 dark:bg-yellow-500/10 font-bold text-black dark:text-yellow-400'
                                                    : ''}"
                                                on:click={() => (level = lvl)}
                                            >
                                                {getValue(key, lvl)}
                                            </td>
                                        {/each}
                                    </tr>
                                {/each}
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
                    <Icon name="success" class="w-3.5 h-3.5 text-yellow-400" />
                {:else}
                    <Icon name="copy" class="w-4 h-4" />
                {/if}
                <span>{$t("common.copy") || "Copy"}</span>
            </button>
        {/if}
    </div>

    <div
        class="bg-[#F0F2F4] rounded-xl p-4 dark:bg-[#343434] overflow-x-auto custom-scrollbar"
    >
        <div class="flex gap-2 w-max min-w-full justify-center">
            {#if neededMaterials.length > 0}
                {#each neededMaterials as mat (mat.id)}
                    <div class="shrink-0">
                        <ItemCard item={mat} amount={mat.amount} />
                    </div>
                {/each}
            {:else}
                <div
                    class="w-full text-center text-gray-400 text-xs py-2 italic shrink-0"
                >
                    {$t("systemNames.noMaterialsNeeded") || "No materials needed"}
                </div>
            {/if}
        </div>
    </div>
</div>

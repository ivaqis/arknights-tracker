<script>
    import { page } from "$app/stores";
    import { t } from "$lib/i18n";
    import { pullData } from "$lib/stores/pulls";
    import { currentLocale } from "$lib/stores/locale";
    import { progression } from "$lib/data/items/progression.js";
    import { currencies } from "$lib/data/items/currencies.js";
    import { weapons } from "$lib/data/weapons.js";
    import { manualPotentials } from "$lib/stores/potentials";
    import { accountStore } from "$lib/stores/accounts";

    import Icon from "$lib/components/Icons.svelte";
    import Tooltip from "$lib/components/Tooltip.svelte";
    import ItemCard from "$lib/components/ItemCard.svelte";
    import Button from "$lib/components/Button.svelte";
    import Images from "$lib/components/Images.svelte";

    function tOrFallback(key, fallback) {
        const translated = $t(key);
        return translated === key ? fallback : translated;
    }

    const localeModules = {
        en: import.meta.glob("/src/lib/locales/en/weapons.json"),
        ru: import.meta.glob("/src/lib/locales/ru/weapons.json"),
        de: import.meta.glob("/src/lib/locales/de/weapons.json"),
        es: import.meta.glob("/src/lib/locales/es/weapons.json"),
        fr: import.meta.glob("/src/lib/locales/fr/weapons.json"),
        id: import.meta.glob("/src/lib/locales/id/weapons.json"),
        it: import.meta.glob("/src/lib/locales/it/weapons.json"),
        ja: import.meta.glob("/src/lib/locales/ja/weapons.json"),
        ko: import.meta.glob("/src/lib/locales/ko/weapons.json"),
        pt: import.meta.glob("/src/lib/locales/pt/weapons.json"),
        th: import.meta.glob("/src/lib/locales/th/weapons.json"),
        vi: import.meta.glob("/src/lib/locales/vi/weapons.json"),
        zhcn: import.meta.glob("/src/lib/locales/zhcn/weapons.json"),
        zhtw: import.meta.glob("/src/lib/locales/zhtw/weapons.json")
    };

    const dataModules = import.meta.glob("/src/lib/data/weaponsData/*.json");

    $: id = $page.params.id;
    $: weaponBase = Object.values(weapons).find((w) => w.id === id) || { rarity: 5, type: "sword" };

    let weaponData = {};
    let weaponLocale = {};

    $: loadWeaponData(id, $currentLocale);

    async function loadWeaponData(targetId, lang) {
        if (!targetId) return;
        
        lang = lang || "en";

        const dataPath = `/src/lib/data/weaponsData/${targetId}.json`;
        if (dataModules[dataPath]) {
            const mod = await dataModules[dataPath]();
            weaponData = mod.default || mod;
        } else {
            console.warn(`Weapon data not found for ID: ${targetId}`);
            weaponData = {};
        }
        const localePath = `/src/lib/locales/${lang}/weapons.json`;
        const fallbackPath = `/src/lib/locales/en/weapons.json`;
        
        let localeLoader = localeModules[lang]?.[localePath];
        
        if (!localeLoader && lang !== "en") {
            localeLoader = localeModules["en"]?.[fallbackPath];
        }

        if (localeLoader) {
            const mod = await localeLoader();
            const allWeaponsLocale = mod.default || mod;
            weaponLocale = allWeaponsLocale[targetId] || {};
        } else {
            weaponLocale = {};
        }
    }

    $: weaponName = tOrFallback(`weaponsList.${id}`, weaponLocale.name || id);
    $: safeWeaponType = weaponBase?.weapon || "sword";
    $: weaponTypeLabel = tOrFallback(`weapons.${safeWeaponType}`, safeWeaponType);

    const { selectedId } = accountStore;
    $: currentAccountId = $selectedId;
    $: accountPots = $manualPotentials[currentAccountId] || {};
    
    $: gachaPulls = (() => {
        if (!$pullData) return 0;
        let count = 0;
        Object.entries($pullData).forEach(([_, banner]) => {
            const pulls = banner?.pulls || [];
            const matches = pulls.filter(p => 
                p.id === id || 
                p.name === id || 
                p.itemId === id || 
                (p.name && weaponLocale.name && p.name.toLowerCase() === weaponLocale.name.toLowerCase())
            );
            count += matches.length;
        });
        return count;
    })();

    $: basePot = gachaPulls > 0 ? gachaPulls - 1 : -1;
    
    $: currentPot = accountPots[id] !== undefined ? accountPots[id] : basePot;
    $: isOwned = currentPot >= 0;

    let isEditingPot = false;
    let draftPot = 0;

    function startEditing() {
        draftPot = currentPot;
        isEditingPot = true;
    }

    function changeDraft(delta) {
        let newPot = draftPot + delta;
        if (newPot < -1) newPot = -1; 
        if (newPot > 9999) newPot = 9999; 
        draftPot = newPot;
    }

    function savePot() {
        manualPotentials.update(pots => {
            const currentAccPots = pots[currentAccountId] || {};
            return { ...pots, [currentAccountId]: { ...currentAccPots, [id]: draftPot } };
        });
        isEditingPot = false;
    }

    function cancelEdit() {
        isEditingPot = false;
    }

    function resetPot() {
        manualPotentials.update(pots => {
            const currentAccPots = pots[currentAccountId] || {};
            const newAccPots = { ...currentAccPots };
            delete newAccPots[id];
            return { ...pots, [currentAccountId]: newAccPots };
        });
        isEditingPot = false;
    }

    function handleSelectPot(e) {
        let val = parseInt(e.target.value);
        manualPotentials.update(pots => {
            const currentAccPots = pots[currentAccountId] || {};
            return { ...pots, [currentAccountId]: { ...currentAccPots, [id]: val } };
        });
    }

    let level = 90;
    const maxLevel = 90;
    let showStatsTable = false;
    let isTableCopied = false;

    $: itemsDb = [...(progression || []), ...(currencies || [])];
    $: baseAtk = weaponData.levels?.baseAtk ? weaponData.levels.baseAtk[level - 1] || 0 : 0;

    $: effectivePot = isOwned ? Math.min(Math.max(0, currentPot), 5) : 0;
    $: potSkillIndex = weaponData.potSkill || 3;

    let previewPot = 0;
    let lastEffectivePot = -1;
    let isPotDropdownOpen = false;

    $: if (effectivePot !== lastEffectivePot) {
        previewPot = effectivePot;
        lastEffectivePot = effectivePot;
    }

    let manualSkillRanks = {};
    let lastLevel = -1;
    let lastPreviewPot = -1;

    $: {
        if (level !== lastLevel || previewPot !== lastPreviewPot) {
            manualSkillRanks = {};
            lastLevel = level;
            lastPreviewPot = previewPot;
        }
    }

    $: getSkillState = (skillIndex, currentLevel, currentPreviewPot, manualOverrides) => {
        const skillKey = `skill${skillIndex}`;
        const tiers = weaponData.skillLevels?.[skillKey];
        if (!tiers) return { rank: 1, upper: 3 };

        let activeTier = tiers[0];
        for (const t of tiers) {
            if (currentLevel >= t.level) activeTier = t;
        }

        let rank = activeTier.lower;
        let upper = activeTier.upper;
        
        if (skillIndex === potSkillIndex) {
            rank += currentPreviewPot;
            upper += currentPreviewPot; 
        }

        if (rank > upper) rank = upper;
        if (rank > 9) rank = 9;
        if (upper > 9) upper = 9;

        if (manualOverrides && manualOverrides[skillKey]) {
            rank = manualOverrides[skillKey];
        }

        return { rank, upper };
    };

    $: getSkillBb = (skillIndex, rank) => {
        const skillKey = `skill${skillIndex}`;
        if (!weaponData.blackboard || !weaponData.blackboard[skillKey]) return {};
        const bb = weaponData.blackboard[skillKey];
        const res = {};
        for (const [k, v] of Object.entries(bb)) {
            const index = Math.min(Math.max(0, rank - 1), v.length - 1);
            res[k] = v[index];
        }
        return res;
    };

    $: neededMaterials = (() => {
        if (!weaponData.materials) return [];
        const required = {};
        let phasesNeeded = [];

        if (level <= 20) phasesNeeded.push("breakthrough2");
        else if (level <= 40) phasesNeeded.push("breakthrough3");
        else if (level <= 60) phasesNeeded.push("breakthrough4");
        else phasesNeeded.push("breakthrough5");

        phasesNeeded.forEach((key) => {
            const mats = weaponData.materials[key];
            if (mats) {
                mats.forEach((mat) => {
                    if (!required[mat.name]) required[mat.name] = 0;
                    required[mat.name] += mat.amount;
                });
            }
        });

        return Object.entries(required)
            .map(([itemId, amount]) => {
                const itemData = itemsDb.find((i) => i.id === itemId) || { id: itemId, name: itemId, rarity: 1 };
                return { ...itemData, amount };
            })
            .sort((a, b) => {
                if (a.id === "t_creds") return -1;
                if (b.id === "t_creds") return 1;
                return (a.rarity || 1) - (b.rarity || 1);
            });
    })();

    function getRarityColors(rarity) {
        if (rarity === 6) return "#F87C32"; 
        if (rarity === 5) return "#F9B90C"; 
        if (rarity === 4) return "#9253F1"; 
        return "#888888"; 
    }
    $: rarityColor = getRarityColors(weaponBase.rarity);

    function parseRichText(text) {
        if (!text) return "";
        const styles = {
            "ba.natur": "text-[#4ADE80] font-bold",
            "ba.fire": "text-[#F87171] font-bold",
            "ba.vup": "text-[#38BDF8] font-bold",
            "ba.info": "text-gray-500 dark:text-[#A0A0A0] italic font-normal text-[13px]",
            "ba.heal": "text-[#4ADE80] font-bold",
        };
        return text.replace(/<([@#])([^>]+)>([\s\S]*?)<\/>/g, (match, type, tag, content) => {
            let styleClass = styles[tag] || "text-[#38BDF8] font-bold";
            if (type === "#") styleClass += " underline decoration-dashed decoration-current underline-offset-4 font-bold";
            return `<span class="${styleClass}">${content}</span>`;
        });
    }

    function interpolateBlackboard(text, bb) {
        if (!text || !bb) return text;
        return text.replace(/\{([^}]+)\}/g, (match, content) => {
            let [expr, format] = content.split(":");
            let mathStr = expr;
            for (const key in bb) {
                const regex = new RegExp(`\\b${key}\\b`, "g");
                mathStr = mathStr.replace(regex, `(${bb[key]})`);
            }
            if (/[a-zA-Z_]/.test(mathStr)) return match;
            try {
                let result = new Function("return " + mathStr)();
                if (format) {
                    if (format.includes("%")) result = parseFloat((result * 100).toFixed(1)) + "%";
                    else if (format === "0") result = Math.round(result);
                    else result = parseFloat(Number(result).toFixed(1));
                }
                return `<span class="text-[#38BDF8] font-bold">${result}</span>`;
            } catch (e) { return match; }
        });
    }

    async function copyStatsTable() {
        const headers = [tOrFallback("stats.level", "Level"), tOrFallback("stats.baseAtk", "Base ATK")];
        let textData = headers.join("\t") + "\n";
        for (let i = 0; i < 90; i++) {
            textData += `${i + 1}\t${weaponData.levels?.baseAtk ? weaponData.levels.baseAtk[i] : 0}\n`;
        }
        try {
            await navigator.clipboard.writeText(textData);
            isTableCopied = true;
            setTimeout(() => { isTableCopied = false; }, 2000);
        } catch (err) {}
    }
</script>

<svelte:window 
    on:keydown={(e) => { if (e.key === "Escape") showStatsTable = false; }} 
    on:click={(e) => { if (!e.target.closest('.pot-dropdown-container')) isPotDropdownOpen = false; }}
/>

<div class="min-h-screen p-4 md:p-8 font-sans transition-colors">
    
    <div class="w-full max-w-[1500px] mx-auto mb-6">
        <Button
                        variant="roundSmall"
                        color="white"
                        onClick={() => history.back()}
                    >
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"><path d="M15 18l-6-6 6-6" /></svg
                        >
                    </Button>
    </div>

    <div class="w-full max-w-[1500px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        <div class="col-span-1 xl:col-span-7 bg-white dark:bg-[#2b2b2b] rounded-3xl flex flex-col overflow-hidden border border-gray-200 dark:border-[#444] transition-colors">
            
            <div class="relative min-h-[210px] flex p-6 overflow-hidden bg-white dark:bg-[#2b2b2b]">
                <div class="absolute inset-0 z-0 pointer-events-none card-gradient" style="--rarity-color: {rarityColor};"></div>
                
                <div class="absolute right-[0px] top-1/2 -translate-y-1/2 w-[300px] h-[300px] pt-10 z-10 pointer-events-none">
                    <Images
                        id={id}
                        variant="weapon-icon"
                        className="w-full h-full object-contain drop-shadow-xl blur-[0.3px] rotate-[0.01deg] backface-hidden transform-gpu scale-100"
                        alt={weaponName}
                    />
                </div>
                
                <div class="relative z-20 flex flex-col gap-4 h-full w-[65%]">
                    <div class="flex items-center flex-wrap gap-x-4 gap-y-2">
                        <h1 class="font-sdk text-3xl md:text-4xl font-bold text-[#21272C] dark:text-[#FDFDFD] leading-none shrink drop-shadow-sm">
                            {weaponName}
                        </h1>

                        <div class="flex items-center shrink-0 self-center">
                            {#if !isEditingPot}
                                <div class="flex items-center gap-3">
                                    {#if isOwned}
                                        <div class="bg-gradient-to-br from-[#F9B90C] to-[#E3A000] text-white text-[13px] font-black px-2 py-0.5 rounded shadow-sm border border-white/20 leading-none">
                                            P{currentPot}
                                        </div>
                                    {/if}
                                    
                                    <Tooltip text={$t("stats.editPotential") || "Edit Potential"}>
                                        <button 
                                            on:click={startEditing}
                                            class="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-[#383838] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-[#444] hover:bg-gray-200 dark:hover:bg-[#444] transition-all"
                                        >
                                            <Icon name="pen" class="w-3.5 h-3.5 opacity-80" />
                                        </button>
                                    </Tooltip>
                                </div>
                            {:else}
                                <div class="flex items-center gap-1 bg-white dark:bg-[#383838] border border-gray-200 dark:border-[#444] p-1 rounded-md shadow-sm animate-fadeIn">
                                    {#if accountPots[id] !== undefined}
                                        <Tooltip text={$t("stats.reset") || "Reset"}>
                                            <button on:click={resetPot} class="w-6 h-6 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center justify-center transition-colors">
                                                <Icon name="refresh" class="w-3.5 h-3.5" /> 
                                            </button>
                                        </Tooltip>
                                        <div class="w-[1px] h-4 bg-gray-300 dark:bg-gray-600 mx-1"></div>
                                    {/if}

                                    <button on:click={() => changeDraft(-1)} class="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 dark:bg-[#444] dark:hover:bg-[#555] flex items-center justify-center transition-colors disabled:opacity-50 text-gray-700 dark:text-gray-300" disabled={draftPot === -1}>
                                        <span class="font-bold text-sm leading-none">-</span>
                                    </button>
                                    
                                    <span class="font-nums font-bold text-sm px-1 text-center text-[#21272C] dark:text-white uppercase tracking-wider">
                                        {draftPot === -1 ? '' : `P${draftPot}`}
                                    </span>

                                    <button on:click={() => changeDraft(1)} class="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 dark:bg-[#444] dark:hover:bg-[#555] flex items-center justify-center transition-colors disabled:opacity-50 text-gray-700 dark:text-gray-300" disabled={draftPot >= 9999}>
                                        <span class="font-bold text-sm leading-none">+</span>
                                    </button>

                                    <div class="w-[1px] h-4 bg-gray-300 dark:bg-gray-600 mx-1"></div>

                                    <Tooltip text={$t("settings.account.cancel") || "Cancel"}>
                                        <button on:click={cancelEdit} class="w-6 h-6 rounded text-gray-500 hover:bg-gray-200 dark:hover:bg-[#444] flex items-center justify-center transition-colors">
                                            <Icon name="close" class="w-3.5 h-3.5" />
                                        </button>
                                    </Tooltip>

                                    <Tooltip text={$t("settings.account.save") || "Save"}>
                                        <button on:click={savePot} class="w-6 h-6 ml-1 rounded bg-[#FFC107] hover:bg-[#F9B90C] text-black flex items-center justify-center transition-colors">
                                            <Icon name="save" class="w-3 h-3" />
                                        </button>
                                    </Tooltip>
                                </div>
                            {/if}
                        </div>
                    </div>

                    <div class="flex items-center gap-4">
                        <Tooltip text={weaponTypeLabel}>
                            <div class="w-9 h-9 rounded bg-[#21272C] flex items-center justify-center shadow-sm">
                                <Icon name={safeWeaponType} class="w-6 h-6 text-white" />
                            </div>
                        </Tooltip>
                        <div class="w-[2px] h-6 bg-gray-300 dark:bg-[#555] rounded"></div>
                        <div class="flex -space-x-1">
                            {#each Array(weaponBase.rarity || 5) as _}
                                <Icon name="strokeStar" class="w-8 h-8" style="color: {rarityColor}; stroke-opacity: 100%;" />
                            {/each}
                        </div>
                    </div>

                    <div class="flex items-center gap-3 mt-auto">
                        <div class="w-9 h-9 rounded bg-[#8F8F8F] flex items-center justify-center shadow-sm">
                            <Icon name="atk" class="w-5 h-5 text-white" />
                        </div>
                        <span class="text-[15px] font-bold text-[#21272C] dark:text-[#E4E4E4]">{tOrFallback("stats.baseAtk", "Базовая АТК")}</span>
                        <span class="text-3xl font-sdk font-bold text-[#21272C] dark:text-[#E4E4E4] leading-none ml-2 drop-shadow-sm">{baseAtk}</span>
                    </div>
                </div>
            </div>

            <div class="px-6 py-5 bg-white dark:bg-[#383838] flex flex-col md:flex-row items-start md:items-center gap-5 md:gap-4 border-t border-gray-200 dark:border-[#444] transition-colors">
                
                <div class="flex items-center gap-4 shrink-0 w-full md:w-auto justify-between md:justify-start">
                    <div class="bg-gray-200 dark:bg-[#4A4A4A] w-[75px] rounded-md px-3 py-1.5 flex items-baseline gap-1 shadow-sm shrink-0">
                        <span class="text-[28px] font-bold text-[#21272C] dark:text-white font-nums leading-none">{level}</span>
                        <span class="text-[11px] font-bold text-gray-500 dark:text-gray-300 uppercase tracking-widest">LV.</span>
                    </div>

                    <div class="relative pot-dropdown-container">
                        <button 
                            on:click={() => isPotDropdownOpen = !isPotDropdownOpen}
                            class="flex h-[40px] items-center gap-3 bg-gray-200 dark:bg-[#4A4A4A] text-[13px] font-bold rounded-md px-3 py-1.5 outline-none border border-gray-200 dark:border-transparent cursor-pointer hover:bg-gray-50 dark:hover:bg-[#555] transition-colors shadow-sm"
                        >
                            <span class="font-medium text-gray-500 dark:text-gray-300 font-sans">{tOrFallback("menu.potentials", "Потенциал")}</span>
                            <span class="font-medium text-[#21272C] dark:text-white">{previewPot}</span>
                            <Icon name="arrowDown" class="pt-0.5 w-3 h-3 text-[#21272C] dark:text-white transition-transform {isPotDropdownOpen ? 'rotate-180' : ''}" />
                        </button>

                        {#if isPotDropdownOpen}
                            <div class="absolute top-full right-0 md:left-0 mt-1 w-full min-w-[120px] bg-white dark:bg-[#2C2C2C] border border-gray-200 dark:border-[#444] rounded-md shadow-[0_8px_20px_rgba(0,0,0,0.3)] overflow-hidden z-[60] animate-fadeIn">
                                {#each Array(6) as _, i}
                                    <button 
                                        class="w-full text-left px-3 py-2 text-[13px] font-bold font-nums transition-colors hover:bg-gray-100 dark:hover:bg-[#4A4A4A] {previewPot === i ? 'bg-gray-50 dark:bg-[#383838] text-[#F9B90C]' : 'text-gray-700 dark:text-[#E4E4E4]'}"
                                        on:click={() => { previewPot = i; isPotDropdownOpen = false; }}
                                    >
                                        {i}
                                    </button>
                                {/each}
                            </div>
                        {/if}
                    </div>
                </div>

                <div class="flex items-center gap-4 w-full flex-1">
                    <div class="flex-1 relative flex items-center md:px-4">
                        <input
                            type="range" min="1" max={maxLevel} step="1"
                            bind:value={level}
                            class="w-full custom-slider outline-none"
                        />
                    </div>

                    <button 
                        on:click={() => (showStatsTable = true)}
                        class="shrink-0 flex items-center gap-1.5 bg-gray-200 dark:bg-[#4A4A4A] hover:bg-gray-300 dark:hover:bg-[#555] px-4 py-2 rounded-md text-[13px] text-[#21272C] dark:text-gray-200 font-medium transition-colors shadow-sm"
                    >
                        <Icon name="table" class="w-4 h-4" />
                        <span>{tOrFallback("stats.table", "Таблица")}</span>
                    </button>
                </div>

            </div>

            <div class="p-6 flex flex-col gap-3 bg-white dark:bg-[#383838] transition-colors">
                {#if weaponLocale.skills}
                    {#each weaponLocale.skills as skillData, index}
                        {@const skillIndex = index + 1}
                        {@const skillKey = `skill${skillIndex}`}
                        {@const state = getSkillState(skillIndex, level, previewPot, manualSkillRanks)}
                        {@const bb = getSkillBb(skillIndex, state.rank)}

                        <div class="flex flex-col gap-1">
                            <div class="flex items-center gap-2">
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" class="shrink-0 mt-0.5">
                                    <circle cx="6" cy="6" r="5" stroke="#888" stroke-width="2"/>
                                </svg>
                                
                                <h3 class="font-medium text-[#21272C] dark:text-[#E4E4E4] text-[15px]">{skillData.name}</h3>
                                
                                <div class="flex-1"></div>

                                <div class="flex items-center gap-3">
                                    <div class="flex gap-[4px] bg-gray-100 dark:bg-[#2b2b2b] px-3 py-1.5 rounded-full border border-gray-200 dark:border-[#444]">
                                        {#each Array(9) as _, i}
                                            <button 
                                                type="button"
                                                aria-label="Set level {i + 1}"
                                                title="Level {i + 1}"
                                                class="w-[8px] h-[13px] rounded-[4px] transform -skew-x-[25deg] border-[1.5px] transition-all duration-200 cursor-pointer outline-none hover:scale-110 hover:brightness-125 focus:ring-1 focus:ring-[#F9B90C]
                                                {i < state.rank ? 'bg-[#21272C] border-[#21272C] dark:bg-white dark:border-white shadow-sm' :
                                                 i < state.upper ? 'bg-gray-300 border-gray-300 dark:bg-[#555] dark:border-[#555]' :
                                                 'bg-transparent border-gray-300 dark:border-[#555]'}"
                                                on:click={() => manualSkillRanks = { ...manualSkillRanks, [skillKey]: i + 1 }}
                                            ></button>
                                        {/each}
                                    </div>
                                    <div class="text-gray-400 dark:text-[#555] text-xs font-bold pl-1">|</div>
                                    <span class="text-[14px] font-bold text-[#21272C] dark:text-white font-nums w-8 text-center">{state.rank}/{state.upper}</span>
                                </div>
                            </div>

                            <div class="text-[14px] text-gray-700 dark:text-[#A0A0A0] leading-relaxed pl-[20px] whitespace-pre-wrap">
                                {@html parseRichText(interpolateBlackboard(skillData.description, bb))}
                            </div>
                        </div>
                    {/each}
                {/if}
            </div>

            <div class="px-6 py-5 border-t border-gray-200 dark:border-[#444] bg-white dark:bg-[#383838] transition-colors">
                <p class="text-[13px] text-gray-500 dark:text-[#888] leading-relaxed text-justify">
                    {weaponLocale.decoDesc}
                </p>
            </div>
        </div>

        <div class="col-span-1 xl:col-span-5 flex flex-col gap-6">
            
            <div class="bg-white dark:bg-[#2b2b2b] p-6 rounded-3xl border border-gray-200 dark:border-[#444] flex flex-col gap-4 transition-colors">
                <h2 class="text-2xl font-bold text-[#21272C] dark:text-[#FDFDFD] font-sdk border-b border-gray-100 dark:border-[#444] pb-3">
                    {tOrFallback("stats.materials", "Материалы")}
                </h2>
                <div class="flex flex-wrap gap-4 pt-1">
                    {#if neededMaterials.length > 0}
                        {#each neededMaterials as mat (mat.id)}
                            <ItemCard item={mat} amount={mat.amount} />
                        {/each}
                    {:else}
                        <div class="w-full text-gray-500 dark:text-[#B7B6B3] text-sm py-4 italic">
                            {tOrFallback("systemNames.noMaterialsNeeded", "Достигнут максимальный уровень")}
                        </div>
                    {/if}
                </div>
            </div>

            <div class="bg-white dark:bg-[#2b2b2b] p-6 rounded-3xl border border-gray-200 dark:border-[#444] flex flex-col gap-4 transition-colors">
                <h2 class="text-2xl font-bold text-[#21272C] dark:text-[#FDFDFD] font-sdk border-b border-gray-100 dark:border-[#444] pb-3">
                    {tOrFallback("menu.description", "Описание")}
                </h2>
                <div class="text-gray-700 dark:text-[#A0A0A0] whitespace-pre-wrap text-[14.5px] leading-relaxed">
                    {weaponLocale.description}
                </div>
            </div>

        </div>
    </div>
</div>

{#if showStatsTable}
    <div
        role="dialog" tabindex="-1" aria-modal="true"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-sm p-4 animate-fadeIn outline-none"
        on:click|self={() => (showStatsTable = false)}
        on:keydown|self={(e) => {
            if (e.key === "Escape" || e.key === "Enter" || e.key === " ") showStatsTable = false;
        }}
    >
        <div class="bg-white dark:bg-[#2b2b2b] rounded-xl w-full max-w-sm max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-gray-200 dark:border-[#444]">
            <div class="flex items-center justify-between px-6 py-4 bg-gray-100 dark:bg-[#222] border-b border-gray-200 dark:border-[#444] shrink-0">
                <h3 class="font-bold text-[#21272C] dark:text-white text-lg">
                    {tOrFallback("stats.attributesTable", "Таблица параметров")}
                </h3>
                <div class="flex gap-2">
                    <button on:click={copyStatsTable} class="p-1.5 rounded-md bg-white dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-600 dark:text-white transition-colors flex items-center gap-2 px-3 text-sm font-bold border border-gray-200 dark:border-transparent shadow-sm dark:shadow-none">
                        {#if isTableCopied}
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FACC15" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="animate-fadeIn">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        {:else}
                            <Icon name="copy" class="w-4 h-4" />
                        {/if}
                        <span>{tOrFallback("common.copy", "Copy")}</span>
                    </button>
                    <button on:click={() => (showStatsTable = false)} class="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors">
                        <Icon name="close" class="w-6 h-6" />
                    </button>
                </div>
            </div>

            <div class="overflow-auto custom-scrollbar bg-white dark:bg-[#2b2b2b] p-0">
                <table class="w-full text-center border-collapse">
                    <thead class="bg-gray-50 dark:bg-[#383838] font-bold sticky top-0 shadow-sm text-sm text-gray-600 dark:text-[#E4E4E4]">
                        <tr>
                            <th class="py-3 px-4 border-b border-gray-200 dark:border-[#444]">{tOrFallback("stats.level", "Уровень")}</th>
                            <th class="py-3 px-4 border-b border-gray-200 dark:border-[#444]">{tOrFallback("stats.baseAtk", "Базовая АТК")}</th>
                        </tr>
                    </thead>
                    <tbody class="text-sm font-nums text-gray-800 dark:text-gray-300">
                        {#each Array(90) as _, i}
                            <tr class="hover:bg-gray-100 dark:hover:bg-[#3d3d3d] transition-colors border-b border-gray-100 dark:border-[#333] even:bg-gray-50/50 dark:even:bg-[#383838]/50">
                                <td class="py-2 px-4 text-gray-500 dark:text-gray-400">{i + 1}</td>
                                <td class="py-2 px-4 font-bold text-[#21272C] dark:text-white">
                                    {weaponData.levels?.baseAtk ? weaponData.levels.baseAtk[i] : 0}
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
{/if}

<style>
    /* Слайдер с поддержкой темной и светлой темы */
    .custom-slider {
        -webkit-appearance: none;
        appearance: none;
        width: 100%;
        height: 4px;
        background: #D1D5DB; 
        border-radius: 2px;
        cursor: pointer;
    }
    :global(.dark) .custom-slider {
        background: #555;
    }
    .custom-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 14px; 
        height: 14px;
        background: #21272C; 
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 0 4px rgba(0,0,0,0.3);
    }
    :global(.dark) .custom-slider::-webkit-slider-thumb {
        background: #E5E5E5; 
    }
    .custom-slider::-moz-range-thumb {
        width: 14px; 
        height: 14px;
        background: #21272C;
        border-radius: 50%;
        cursor: pointer;
        border: none;
        box-shadow: 0 0 4px rgba(0,0,0,0.3);
    }
    :global(.dark) .custom-slider::-moz-range-thumb {
        background: #E5E5E5; 
    }
    
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
    :global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #555; }

    .card-gradient {
        background: linear-gradient(to right, #FFFFFF 20%, var(--rarity-color) 100%);
        opacity: 0.9;
    }
    :global(.dark) .card-gradient {
        background: linear-gradient(to right, #383838 20%, var(--rarity-color) 100%); 
        opacity: 0.85;
    }
</style>
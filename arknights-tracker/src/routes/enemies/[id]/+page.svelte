<script>
    import { page } from "$app/stores";
    import { t } from "$lib/i18n";
    import { currentLocale } from "$lib/stores/locale";
    import { enemies } from "$lib/data/enemies.js";

    import Icon from "$lib/components/Icons.svelte";
    import ItemCard from "$lib/components/ItemCard.svelte";
    import Button from "$lib/components/Button.svelte";
    import Images from "$lib/components/Images.svelte";

    function tOrFallback(key, fallback) {
        const translated = $t(key);
        return translated === key ? fallback : translated;
    }

    const localeModules = {
        en: import.meta.glob("/src/lib/locales/en/enemies.json"),
        ru: import.meta.glob("/src/lib/locales/ru/enemies.json"),
        de: import.meta.glob("/src/lib/locales/de/enemies.json"),
        es: import.meta.glob("/src/lib/locales/es/enemies.json"),
        fr: import.meta.glob("/src/lib/locales/fr/enemies.json"),
        id: import.meta.glob("/src/lib/locales/id/enemies.json"),
        it: import.meta.glob("/src/lib/locales/it/enemies.json"),
        ja: import.meta.glob("/src/lib/locales/ja/enemies.json"),
        ko: import.meta.glob("/src/lib/locales/ko/enemies.json"),
        pt: import.meta.glob("/src/lib/locales/pt/enemies.json"),
        th: import.meta.glob("/src/lib/locales/th/enemies.json"),
        vi: import.meta.glob("/src/lib/locales/vi/enemies.json"),
        zhcn: import.meta.glob("/src/lib/locales/zhcn/enemies.json"),
        zhtw: import.meta.glob("/src/lib/locales/zhtw/enemies.json"),
    };

    let copiedImageId = null;

    $: resistances = [
        { key: "Physical", val: enemyData.PhysicalDamageTakenScalar, locKey: "physRez" },
        { key: "Fire", val: enemyData.FireDamageTakenScalar, locKey: "heatRez" },
        { key: "Pulse", val: enemyData.PulseDamageTakenScalar, locKey: "elecrtoRez" },
        { key: "Crystal", val: enemyData.CrystDamageTakenScalar, locKey: "cryoRez" },
        { key: "Natural", val: enemyData.NaturalDamageTakenScalar, locKey: "narureRez" }
    ].filter(r => r.val !== undefined);

    $: id = $page.params.id;
    $: enemyData = enemies[id] || {};
    $: maxLevel = enemyData.hp ? enemyData.hp.length : 1;
    let level = 90;
    $: if (level > maxLevel) level = maxLevel;
    $: currentHp = enemyData.hp ? enemyData.hp[level - 1] : 0;
    $: currentAtk = enemyData.atk ? enemyData.atk[level - 1] : 0;
    $: currentDef = enemyData.def ? enemyData.def[level - 1] : 0;
    let enemyLocale = {};
    $: loadEnemyData(id, $currentLocale);

    async function loadEnemyData(targetId, lang) {
        if (!targetId) return;
        lang = lang || "en";
        const safeLang = lang.toLowerCase().replace("-", "");

        const localePath = `/src/lib/locales/${safeLang}/enemies.json`;
        const fallbackPath = `/src/lib/locales/en/enemies.json`;

        let localeLoader = localeModules[safeLang]?.[localePath] || localeModules["en"]?.[fallbackPath];

        if (localeLoader) {
            const mod = await localeLoader();
            const allEnemiesLocale = mod.default || mod;
            enemyLocale = allEnemiesLocale[targetId] || {};
        } else {
            enemyLocale = {};
        }
    }

    $: enemyName = enemyLocale.name || id;
    $: enemyAbilities = enemyLocale.abilities || [];
    $: enemyDescription = enemyLocale.description || "";

    function getRarityColors(rarity) {
        if (rarity === 6) return "#F87C32";
        if (rarity === 5) return "#F9B90C";
        if (rarity === 4) return "#9253F1";
        if (rarity === 3) return "#25B9F9";
        return "#888888";
    }
    $: rarityColor = getRarityColors(enemyData.rarity || 4);
    $: advancedStats = [
        { key: "Stagger HP", val: enemyData.staggerHP },
        { key: "Stagger Rec.", val: enemyData.staggerRecovery },
        { key: "Finisher ATK Mult.", val: enemyData.finisherATKMultiplier },
        { key: "Attack Range", val: enemyData.AttackRange },
        { key: "Weight", val: enemyData.weight },
        { key: "Crit DMG Inc.", val: enemyData.CriticalDamageIncrease },
        { key: "Base Energy", val: enemyData.BaseEnergy },
        { key: "Init. Super Armor", val: enemyData.initialSuperArmor },
        { key: "Max Resilience", val: enemyData.maxResilience },
        { key: "Zero Poise Armor", val: enemyData.zeroPoiseSuperArmor },
        { key: "ATK vs Tower", val: enemyData.attackValueAgainstTower },
        { key: "Pushback Coeff.", val: enemyData.pushedBackCoefficient }
    ].filter(s => s.val !== undefined);
    
    let shiftPressed = false;
    let targetLevel = level;

    function handleKeydown(e) {
        if (e.key === "Shift") shiftPressed = true;
    }

    function handleKeyup(e) {
        if (e.key === "Shift") shiftPressed = false;
    }

    function handleInput(e) {
        const val = parseInt(e.target.value);
        if (shiftPressed) {
            const diff = val - level;
            if (Math.abs(diff) >= 5) {
                const change = diff > 0 ? 10 : -10;
                let nextLevel = Math.round(level / 10) * 10 + change;
                if (nextLevel < 1) nextLevel = 1;
                if (nextLevel > maxLevel) nextLevel = maxLevel;
                level = nextLevel;
            }
        } else {
            level = val;
        }
        targetLevel = val;
    }

    $: if (!shiftPressed) {
        targetLevel = level;
    }

    function setMinAll() {
        level = 1;
    }

    function setMaxAll() {
        level = maxLevel;
    }
</script>

<svelte:window on:keydown={handleKeydown} on:keyup={handleKeyup} />

<div class="min-h-screen md:px-8 md:py-3 font-sans transition-colors">
    <div class="w-full max-w-[1500px] mx-auto mb-6">
        <Button variant="roundSmall" color="white" onClick={() => history.back()}>
            <Icon name="arrowLeft" class="w-5 h-5" />
        </Button>
    </div>

    <div class="w-full max-w-[1500px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        <div class="col-span-1 xl:col-span-7 flex flex-col gap-6">
            
            <div class="bg-white dark:bg-[#2b2b2b] rounded-3xl flex flex-col overflow-hidden border border-gray-200 dark:border-[#444] transition-colors">
                <div class="relative min-h-[210px] flex p-6 overflow-hidden bg-white dark:bg-[#2b2b2b]">
                    <div class="pointer-events-none absolute inset-0 z-0 pointer-events-none card-gradient" style="--rarity-color: {rarityColor};"></div>

                    <div class="absolute right-[0px] top-1/2 -translate-y-1/2 w-[250px] h-[250px] z-10 pointer-events-none">
                        <Images {id} variant="enemy-icon" className="w-full h-full object-contain drop-shadow-xl" interactive={true} alt={enemyName} />
                    </div>

                    <div class="absolute top-4 right-4 z-20 flex flex-col gap-2">
                        <button
                            class="flex items-center justify-center w-8 h-8 bg-black/60 hover:bg-[#FFD800] text-white hover:text-black backdrop-blur rounded-full transition-all duration-300 shadow-md group/copy cursor-pointer"
                            title="Copy image"
                            on:click|stopPropagation={async () => {
                                try {
                                    const imageUrl = `/images/enemies/${id}.png`;
                                    const response = await fetch(imageUrl);
                                    const blob = await response.blob();
                                    await navigator.clipboard.write([
                                        new ClipboardItem({
                                            [blob.type]: blob,
                                        }),
                                    ]);

                                    copiedImageId = "icon";
                                    setTimeout(() => {
                                        if (copiedImageId === "icon")
                                            copiedImageId = null;
                                    }, 2000);
                                } catch (err) {
                                    console.error("Error copying:", err);
                                }
                            }}
                        >
                            {#if copiedImageId === "icon"}
                                <Icon name="success" class="w-3.5 h-3.5 text-yellow-400" />
                            {:else}
                                <Icon name="copy" class="w-3.5 h-3.5 transition-transform group-hover/copy:scale-110" />
                            {/if}
                        </button>

                        <button
                            class="flex items-center justify-center w-8 h-8 bg-black/60 hover:bg-[#FFD800] text-white hover:text-black backdrop-blur rounded-full transition-all duration-300 shadow-md group/down cursor-pointer"
                            title="Download Art"
                            on:click|stopPropagation={() => {
                                const link = document.createElement("a");
                                link.href = `/images/enemies/${id}.png`;
                                link.download = `${id}_enemy.png`;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                            }}
                        >
                            <Icon name="import" class="w-4 h-4 transition-transform group-hover/down:scale-110" />
                        </button>
                    </div>

                    <div class="relative z-20 flex flex-col gap-4 h-full w-[65%]">
                        <h1 class="font-sdk text-3xl md:text-4xl font-bold text-[#21272C] dark:text-[#FDFDFD] leading-tight drop-shadow-sm">
                            {enemyName}
                        </h1>

                        <div class="flex items-center gap-4">
                            {#if enemyData.groupId}
                                <div class="flex items-center gap-3">
                                    <div class="w-9 h-9 rounded bg-[#21272C] flex items-center justify-center shadow-sm min-w-[35px]">
                                        <Icon name={enemyData.groupId.replace('wiki_group_monster_', '')} class="w-6 h-6 text-white" />
                                    </div>
                                    <span class="text-[15px] font-bold text-[#21272C] dark:text-[#E4E4E4]">
                                        {$t(`enemiesGroups.${enemyData.groupId}`) || enemyData.groupId}
                                    </span>
                                </div>
                                <div class="w-[2px] h-6 bg-gray-300 dark:bg-[#555] rounded"></div>
                            {/if}
                            <div class="flex -space-x-1">
                                {#each Array(enemyData.rarity || 4) as _}
                                    <Icon name="strokeStar" class="w-9 h-9" style="color: {rarityColor}; stroke-opacity: 100%;" />
                                {/each}
                            </div>
                        </div>

                        <div class="flex flex-col gap-3 mt-auto">
                            <div class="flex items-center gap-3">
                                <div class="w-9 h-9 rounded bg-[#8F8F8F] flex items-center justify-center shadow-sm">
                                    <Icon name="hp" class="w-5 h-5 text-white" />
                                </div>
                                <span class="text-[15px] font-bold text-[#21272C] dark:text-[#E4E4E4]">
                                    {tOrFallback("stats.hp", "HP")}
                                </span>
                                <span class="text-3xl font-sdk font-bold text-[#21272C] dark:text-[#E4E4E4] leading-none ml-1 drop-shadow-sm">
                                    {currentHp}
                                </span>
                            </div>

                            <div class="flex items-center gap-3">
                                <div class="w-9 h-9 rounded bg-[#8F8F8F] flex items-center justify-center shadow-sm">
                                    <Icon name="atk" class="w-5 h-5 text-white" />
                                </div>
                                <span class="text-[15px] font-bold text-[#21272C] dark:text-[#E4E4E4]">
                                    {tOrFallback("stats.atk", "ATK")}
                                </span>
                                <span class="text-3xl font-sdk font-bold text-[#21272C] dark:text-[#E4E4E4] leading-none ml-1 drop-shadow-sm">
                                    {currentAtk}
                                </span>
                            </div>

                            <div class="flex items-center gap-3">
                                <div class="w-9 h-9 rounded bg-[#8F8F8F] flex items-center justify-center shadow-sm">
                                    <Icon name="def" class="w-5 h-5 text-white" />
                                </div>
                                <span class="text-[15px] font-bold text-[#21272C] dark:text-[#E4E4E4]">
                                    {tOrFallback("stats.def", "DEF")}
                                </span>
                                <span class="text-3xl font-sdk font-bold text-[#21272C] dark:text-[#E4E4E4] leading-none ml-1 drop-shadow-sm">
                                    {currentDef}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="px-6 pt-5 pb-5 bg-white dark:bg-[#383838] flex flex-col md:flex-row items-start md:items-center gap-5 md:gap-4 border-t border-gray-200 dark:border-[#444] transition-colors">
                    <div class="flex items-center gap-1 shrink-0 w-full md:w-auto justify-between md:justify-start">
                        <div class="flex items-center gap-1.5">
                            <div class="flex flex-col gap-1 shrink-0 h-full justify-center">
                                <button
                                    on:click={setMaxAll}
                                    class="text-[9px] font-bold px-2.5 py-[4px] bg-gray-200 dark:bg-[#4A4A4A] hover:bg-gray-300 dark:hover:bg-[#555] rounded text-gray-700 hover:text-black dark:text-gray-200 uppercase leading-none transition-colors border border-gray-200 dark:border-transparent shadow-sm cursor-pointer"
                                    >MAX</button
                                >
                                <button
                                    on:click={setMinAll}
                                    class="text-[9px] font-bold px-2.5 py-[4px] bg-gray-200 dark:bg-[#4A4A4A] hover:bg-gray-300 dark:hover:bg-[#555] rounded text-gray-700 hover:text-black dark:text-gray-200 uppercase leading-none transition-colors border border-gray-200 dark:border-transparent shadow-sm cursor-pointer"
                                    >MIN</button
                                >
                            </div>
                            <div class="bg-gray-200 dark:bg-[#4A4A4A] rounded-md px-3 py-1.5 flex items-baseline gap-1 shadow-sm shrink-0 {level === 100 ? 'w-[95px]' : 'w-[75px]'}">
                                <span class="text-[28px] font-bold text-[#21272C] dark:text-white font-nums leading-none">{level}</span>
                                <span class="text-[11px] font-bold text-gray-500 dark:text-gray-300 uppercase tracking-widest">LV.</span>
                            </div>
                        </div>
                    </div>
                    <input 
                        type="range" min="1" max={maxLevel} step="1" value={targetLevel}
                        on:input={handleInput}
                        class="touch-none w-full h-2 bg-gray-200 dark:bg-[#2C2C2C] rounded-lg appearance-none cursor-pointer accent-[#F9B90C] outline-none"
                    />
                </div>

                <div class="px-6 pb-6 bg-white dark:bg-[#383838] flex flex-col gap-3">
                    <div>
                        <h2 class="text-xl font-bold text-[#21272C] dark:text-[#FDFDFD] font-sdk pb-2 mb-2">
                            {tOrFallback("stats.vulnerable", "Vulnerability")}
                        </h2>
                        <div class="flex flex-wrap gap-x-8 gap-y-5">
                            {#each resistances as res}
                                {@const resPercent = Math.round(res.val * 100)}
                                {@const resLetter = resPercent >= 100 ? 'D' : (resPercent >= 70 ? 'C' : (resPercent >= 40 ? 'B' : 'A'))}
                                <div class="flex items-center gap-3">
                                    <Icon name={res.locKey} class="w-8 h-8 text-gray-700 dark:text-gray-300 shrink-0" />
                                    <div class="flex flex-col">
                                        <span class="text-[11px] text-gray-500 dark:text-[#A0A0A0] font-bold uppercase leading-none">
                                            {$t(`resitances.${res.locKey}`) || res.key}
                                        </span>
                                        <div class="flex items-baseline gap-1.5 mt-1.5">
                                            <span class="text-[16px] font-black {res.val < 1 ? 'text-green-500' : (res.val > 1 ? 'text-red-500' : 'text-[#21272C] dark:text-[#FDFDFD]')} leading-none">
                                                {resLetter}
                                            </span>
                                            <span class="text-[16px] font-bold {res.val < 1 ? 'text-green-500' : (res.val > 1 ? 'text-red-500' : 'text-[#21272C] dark:text-[#FDFDFD]')} leading-none">
                                                {resPercent}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    </div>

                    {#if enemyAbilities.length > 0}
                        <div>
                            <h2 class="text-xl font-bold text-[#21272C] dark:text-[#FDFDFD] font-sdk pb-2 mt-2">
                                {tOrFallback("stats.abilities", "Abilities")}
                            </h2>
                            <ul class="flex flex-col gap-2">
                                {#each enemyAbilities as ability}
                                    <li class="text-[14px] text-gray-700 dark:text-[#E0E0E0] leading-relaxed pl-4 relative before:content-[''] before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-[#F9B90C] before:rounded-full">
                                        {ability}
                                    </li>
                                {/each}
                            </ul>
                        </div>
                    {/if}

                    {#if enemyDescription}
                    <div>
                        <div class="text-[14px] text-gray-700 dark:text-[#A0A0A0] whitespace-pre-wrap leading-relaxed border-t border-gray-100 dark:border-[#444] pt-2">
                            {enemyDescription}
                        </div>
                    </div>
                {/if}
                </div>
            </div>

            <div class="bg-white dark:bg-[#2b2b2b] p-6 rounded-3xl border border-gray-200 dark:border-[#444] flex flex-col gap-6 transition-colors">
                <div>
                    <h2 class="text-2xl font-bold text-[#21272C] dark:text-[#FDFDFD] font-sdk border-b border-gray-100 dark:border-[#444] pb-3 mb-4">
                        {tOrFallback("stats.properties", "Properties")}
                    </h2>
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6">
                        {#each advancedStats as stat}
                            <div class="flex flex-col">
                                <span class="text-xs text-gray-500 dark:text-[#A0A0A0] font-bold uppercase">{stat.key}</span>
                                <span class="text-lg font-bold text-[#21272C] dark:text-[#FDFDFD]">{stat.val}</span>
                            </div>
                        {/each}
                    </div>
                </div>

                
            </div>
        </div>

        <div class="col-span-1 xl:col-span-5 flex flex-col gap-6">
            <div class="bg-white dark:bg-[#2b2b2b] p-6 rounded-3xl border border-gray-200 dark:border-[#444] flex flex-col gap-4 transition-colors">
                
                <div class="flex flex-col border-b border-gray-100 dark:border-[#444] pb-3 gap-4">
                    <h2 class="text-2xl font-bold text-[#21272C] dark:text-[#FDFDFD] font-sdk">
                        {tOrFallback("stats.drops", "Drops")}
                    </h2>
                </div>

                <div class="flex flex-wrap gap-2 pt-1">
                    {#if enemyData.drop && enemyData.drop.length > 0}
                        {#each enemyData.drop as dropId}
                            <ItemCard item={{id: dropId}} hideAmount=true customPath="itemNames" />
                        {/each}
                    {:else}
                        <div class="w-full text-center text-gray-500 dark:text-[#B7B6B3] text-sm py-4 italic">
                            {tOrFallback("emptyState.noData", "No data")}
                        </div>
                    {/if}
                </div>

            </div>
        </div>
    </div>
</div>
<style>
    .card-gradient {
        background: linear-gradient(
            to right,
            #ffffff 20%,
            var(--rarity-color) 100%
        );
        opacity: 0.9;
    }
    :global(.dark) .card-gradient {
        background: linear-gradient(
            to right,
            #383838 20%,
            var(--rarity-color) 100%
        );
        opacity: 0.85;
    }
</style>

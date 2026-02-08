<script>
    import { t } from "$lib/i18n";
    import { goto } from "$app/navigation";
    
    import Select from "$lib/components/Select.svelte";
    import Icon from "$lib/components/Icons.svelte";
    import Images from "$lib/components/Images.svelte"; 
    import Button from "$lib/components/Button.svelte";

    import { characters } from "$lib/data/characters";
    import { currencies } from "$lib/data/items/currencies";
    import { banners } from "$lib/data/banners";
    import { bannerTypes } from "$lib/data/bannerTypes";
    import { API_BASE } from "$lib/api";

    $: typeOptions = bannerTypes.map(bt => ({
        value: bt.id, 
        label: $t(bt.i18nKey) || bt.name
    }));

    let selectedType = bannerTypes[0]?.id || "special";

    $: bannerOptions = banners
        .filter(b => b.type === selectedType)
        .map(b => ({
            value: b.id,
            label: b.name
        }));

    let selectedBannerId = "";
    
    $: if (bannerOptions.length > 0) {
        if (!bannerOptions.find(o => o.value === selectedBannerId)) {
             selectedBannerId = bannerOptions[0].value;
        }
    } else {
        selectedBannerId = "";
    }

    $: currentBanner = banners.find(b => b.id === selectedBannerId);
    $: featuredCharId = currentBanner?.featured6?.[0];
    $: featuredChar = featuredCharId ? characters[featuredCharId] : null;

    const oroberyl = currencies.find((c) => c.id === "oroberyl");

    let stats = {
        totalUsers: 0,
        totalPulls: 0,
        median6: 0,
        winRate5050: 0,
        totalObtained: 0,
        rates: {
            sixStar: { percent: "0.00", count: 0 },
            fiveStar: { percent: "0.00", count: 0 }
        },
        timeline: [],
        pityDist: []
    };
    let isLoading = false;

    async function fetchStats(bannerId) {
        if (!bannerId) return;
        isLoading = true;
        try {
            const res = await fetch(`${API_BASE}/api/global/stats?bannerId=${bannerId}`);
            const json = await res.json();
            
            if (json.code === 0) {
                const d = json.data;
                const total = d.totalPulls || 0;
                
                const r6 = total > 0 ? (d.total6 / total * 100).toFixed(3) : "0.00";
                const r5 = total > 0 ? (d.total5 / total * 100).toFixed(3) : "0.00";
                
                let obtained = 0;
                if (featuredChar && d.items6) {
                    const charStat = d.items6.find(i => i.name === featuredChar.name); 
                    obtained = charStat ? charStat.count : 0;
                }

                // Win Rate рассчитываем как Лимитки / (Лимитки + Стандарт)
                const total5050 = (d.limitedCount + d.lost5050);
                const winRate = total5050 > 0 ? (d.limitedCount / total5050 * 100).toFixed(0) : 0;

                stats = {
                    totalUsers: d.totalUsers,
                    totalPulls: d.totalPulls,
                    median6: d.medianPity || 0,
                    winRate5050: winRate,
                    totalObtained: obtained,
                    rates: {
                        sixStar: { percent: r6, count: d.total6 },
                        fiveStar: { percent: r5, count: d.total5 }
                    },
                    timeline: d.timeline || [],
                    pityDist: d.pityDistribution || []
                };
            }
        } catch (e) {
            console.error("Failed to fetch stats", e);
        } finally {
            isLoading = false;
        }
    }

    $: if (selectedBannerId) {
        fetchStats(selectedBannerId);
    }

    const fmt = (num) => num ? num.toLocaleString('ru-RU') : "0";

    function getLinePath(data, width, height) {
        if (!data || data.length < 2) return "";
        const counts = data.map(d => d.count);
        const max = Math.max(...counts, 1);
        const step = width / (data.length - 1);
        
        let d = `M 0 ${height - (counts[0] / max * height)}`;
        for (let i = 1; i < data.length; i++) {
            const x = i * step;
            const y = height - (counts[i] / max * height);
            d += ` L ${x} ${y}`;
        }
        return d;
    }
</script>

<div class="w-full max-w-[1800px] px-6 pb-20">
    
    <div class="flex items-center gap-4 mb-8">
        <Button variant="roundSmall" color="white" onClick={() => goto("/records")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M15 18l-6-6 6-6" />
            </svg>
        </Button>
        <h2 class="font-sdk text-4xl md:text-5xl tracking-wide text-[#21272C] dark:text-[#FDFDFD]">
            {$t("global.title") || "Глобальная статистика"}
        </h2>
    </div>

    <div class="flex flex-col sm:flex-row gap-4 mb-8 max-w-2xl">
        <div class="w-full sm:w-1/2">
            <Select 
                options={typeOptions} 
                bind:value={selectedType} 
                variant="white"
                placeholder={$t("global.selectType") || "Выберите тип"}
            />
        </div>
        <div class="w-full sm:w-1/2">
            {#key selectedType}
                <Select 
                    options={bannerOptions} 
                    bind:value={selectedBannerId} 
                    variant="white"
                    placeholder={$t("global.selectBanner") || "Выберите баннер"}
                />
            {/key}
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <div class="lg:col-span-5 grid grid-cols-2 gap-4">
            
            <div class="col-span-1 bg-white dark:bg-[#383838] dark:border-[#444444] rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col justify-between h-[160px] relative overflow-hidden group">
                <div class="absolute left-0 top-0 bottom-0 w-1 bg-[#D84C38]"></div>
                
                {#if featuredChar}
                    <div class="flex items-start gap-3">
                        <div class="w-12 h-12 bg-gray-100 dark:bg-[#2C2C2C] dark:border-[#444444] rounded border border-gray-200 overflow-hidden shrink-0">
                             <Images item={featuredChar} variant="avatar" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <div class="font-bold text-sm text-[#21272C] dark:text-[#FDFDFD] leading-tight">{featuredChar.name}</div>
                            <div class="text-[10px] text-gray-400 dark:text-[#B7B6B3] mt-1">{$t("global.totalObtained") || "Всего получено"}</div>
                            <div class="font-nums font-bold text-xl text-[#21272C] dark:text-[#FDFDFD]">{fmt(stats.totalObtained)}</div>
                        </div>
                    </div>
                    <div class="mt-auto">
                         <div class="text-[10px] text-gray-500 dark:text-[#B7B6B3]">
                             <span class="font-bold">{stats.winRate5050}%</span> {$t("global.won5050Label") || "игроков выиграли 50/50"}
                         </div>
                         <div class="w-full h-1 bg-gray-100 dark:bg-[#444444] rounded-full mt-1 overflow-hidden">
                             <div class="h-full bg-[#D84C38]" style="width: {stats.winRate5050}%"></div>
                         </div>
                    </div>
                {/if}
            </div>

            <div class="col-span-1 bg-white dark:bg-[#383838] dark:border-[#444444] rounded-xl p-4 shadow-sm border border-gray-100 h-[160px] flex flex-col justify-center">
                <div class="text-xs font-bold text-gray-500 dark:text-[#B7B6B3] uppercase mb-2">
                    {$t("global.percent6") || "Процент 6*"}
                </div>
                <div class="text-3xl font-bold font-nums text-[#21272C] dark:text-[#FDFDFD] mb-1">
                    {stats.rates.sixStar.percent}%
                </div>
                <div class="text-[10px] text-gray-400 dark:text-[#888]">
                    {$t("global.total6") || "Всего 6*"}: <span class="font-nums">{fmt(stats.rates.sixStar.count)}</span>
                </div>
            </div>

            <div class="col-span-1 bg-white dark:bg-[#383838] dark:border-[#444444] rounded-xl p-4 shadow-sm border border-gray-100 h-[160px] flex flex-col justify-center gap-3 text-sm">
                 <div class="flex justify-between items-center">
                    <span class="text-gray-500 dark:text-[#B7B6B3] text-xs">{$t("global.median6") || "Медиана 6*"}</span>
                    <span class="font-bold font-nums text-[#21272C] dark:text-[#FDFDFD]">{stats.median6} <span class="text-[10px] font-normal text-gray-400">{$t("global.pullShort") || "кр."}</span></span>
                 </div>
                 <div class="flex justify-between items-center">
                    <span class="text-gray-500 dark:text-[#B7B6B3] text-xs">{$t("global.totalUsers") || "Всего пользователей"}</span>
                    <span class="font-bold font-nums text-[#21272C] dark:text-[#FDFDFD]">{fmt(stats.totalUsers)}</span>
                 </div>
                 <div class="flex justify-between items-center">
                    <span class="text-gray-500 dark:text-[#B7B6B3] text-xs">{$t("global.totalPulls") || "Всего круток"}</span>
                    <span class="font-bold font-nums text-[#21272C] dark:text-[#FDFDFD]">{fmt(stats.totalPulls)}</span>
                 </div>
                 <div class="flex justify-between items-center">
                    <span class="text-gray-500 dark:text-[#B7B6B3] text-xs">{$t("global.spent") || "Всего оберилла"}</span>
                    <div class="flex items-center gap-1 font-bold font-nums text-[#21272C] dark:text-[#FDFDFD]">
                        <Images item={oroberyl} category="currencies" size={14} />
                        {fmt(stats.totalPulls * 500)}
                    </div>
                 </div>
            </div>

            <div class="col-span-1 bg-white dark:bg-[#383838] dark:border-[#444444] rounded-xl p-4 shadow-sm border border-gray-100 h-[160px] flex flex-col justify-center">
                <div class="text-xs font-bold text-gray-500 dark:text-[#B7B6B3] uppercase mb-2">
                    {$t("global.percent5") || "Процент 5*"}
                </div>
                <div class="text-3xl font-bold font-nums text-[#21272C] dark:text-[#FDFDFD] mb-1">
                    {stats.rates.fiveStar.percent}%
                </div>
                <div class="text-[10px] text-gray-400 dark:text-[#888]">
                    {$t("global.total5") || "Всего 5*"}: <span class="font-nums">{fmt(stats.rates.fiveStar.count)}</span>
                </div>
            </div>

            <div class="col-span-2 bg-white dark:bg-[#383838] dark:border-[#444444] rounded-xl p-5 shadow-sm border border-gray-100 h-[200px] flex flex-col">
                <div class="text-xs font-bold text-gray-800 dark:text-[#FDFDFD] uppercase mb-4">{$t("global.pullsPerDay") || "Круток в день"}</div>
                <div class="flex-1 w-full relative">
                    {#if stats.timeline.length > 0}
                        <svg viewBox="0 0 100 100" class="w-full h-full overflow-visible" preserveAspectRatio="none">
                            <path 
                                d={getLinePath(stats.timeline, 100, 100)} 
                                fill="none" 
                                class="stroke-[#21272C] dark:stroke-[#FDFDFD]" 
                                stroke-width="2" 
                                vector-effect="non-scaling-stroke"
                            />
                            <path 
                                d="{getLinePath(stats.timeline, 100, 100)} V 100 H 0 Z" 
                                class="fill-[#21272C] dark:fill-[#FDFDFD]" 
                                fill-opacity="0.05" 
                                stroke="none" 
                            />
                            {#each stats.timeline as point, i}
                                <circle 
                                    cx={i * (100 / (stats.timeline.length - 1))} 
                                    cy={100 - (point.count / Math.max(...stats.timeline.map(t=>t.count), 1) * 100)} 
                                    r="3" 
                                    class="fill-[#21272C] dark:fill-[#FDFDFD] hover:scale-150 transition-transform cursor-pointer"
                                >
                                    <title>{point.date}: {point.count}</title>
                                </circle>
                            {/each}
                        </svg>
                        <div class="flex justify-between text-[10px] text-gray-400 dark:text-[#B7B6B3] mt-2">
                             <span>{stats.timeline[0]?.date}</span>
                             <span>{stats.timeline[stats.timeline.length - 1]?.date}</span>
                        </div>
                    {:else}
                        <div class="w-full h-full flex items-center justify-center text-gray-300 dark:text-[#666] text-xs">{$t("global.noData") || "Нет данных"}</div>
                    {/if}
                </div>
            </div>

            <div class="col-span-2 bg-white dark:bg-[#383838] dark:border-[#444444] rounded-xl p-5 shadow-sm border border-gray-100 h-[200px] flex flex-col">
                <div class="text-xs font-bold text-gray-800 dark:text-[#FDFDFD] uppercase mb-4">{$t("global.pityDist") || "6* персонажей за крутку"}</div>
                <div class="flex-1 w-full relative flex items-end gap-[1px]">
                     {#if stats.pityDist.length > 0}
                        {@const maxCount = Math.max(...stats.pityDist.map(p => p.count), 1)}
                        {#each Array(80) as _, i}
                            {@const pity = i + 1}
                            {@const data = stats.pityDist.find(p => p.pity === pity)}
                            {@const count = data ? data.count : 0}
                            {@const heightPct = (count / maxCount) * 100}
                            
                            <div class="flex-1 bg-gray-100 dark:bg-[#2C2C2C] relative group flex items-end rounded-t-sm overflow-hidden" style="height: 100%;">
                                {#if count > 0}
                                    <div 
                                        class="w-full bg-[#D4BE48] transition-all duration-500" 
                                        style="height: {heightPct}%;"
                                    ></div>
                                    <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-black text-white text-[10px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
                                        {pity}: {count}
                                    </div>
                                {/if}
                            </div>
                        {/each}
                     {:else}
                        <div class="w-full h-full flex items-center justify-center text-gray-300 dark:text-[#666] text-xs">{$t("global.noData") || "Нет данных"}</div>
                     {/if}
                </div>
                <div class="flex justify-between text-[10px] text-gray-400 dark:text-[#B7B6B3] mt-2 px-1">
                    {#each [1, 10, 20, 30, 40, 50, 60, 70, 80] as mark}
                        <span>{mark}</span>
                    {/each}
                </div>
            </div>

        </div>

        <div class="lg:col-span-7 h-full min-h-[600px] lg:h-auto">
             {#if currentBanner}
                <div class="w-full h-full bg-[#111] dark:bg-[#000] rounded-xl overflow-hidden shadow-lg relative">
                    <Images 
                        item={currentBanner} 
                        variant="banner-card"
                        className="absolute inset-0 w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity duration-700"
                        alt={currentBanner.name}
                    />
                    
                    <div class="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent pointer-events-none"></div>
                    
                    <div class="absolute bottom-8 left-8 text-white max-w-md drop-shadow-lg">
                        <div class="bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest w-fit mb-4 border border-white/20">
                            {currentBanner.type}
                        </div>
                        <h1 class="text-5xl font-sdk font-bold leading-none mb-2">
                            {$t(`banners.${currentBanner.id}`) || currentBanner.name}
                        </h1>
                        {#if currentBanner.featured6 && currentBanner.featured6.length}
                             <div class="text-xl opacity-80">{currentBanner.featured6.join(", ")}</div>
                        {/if}
                    </div>
                </div>
             {:else}
                <div class="w-full h-full bg-gray-100 dark:bg-[#2C2C2C] rounded-xl flex items-center justify-center text-gray-400 dark:text-[#666]">
                    {$t("global.selectBanner") || "Выберите баннер"}
                </div>
             {/if}
        </div>

    </div>
</div>
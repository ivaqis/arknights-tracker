<script>
    import { t } from "$lib/i18n";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";
    
    // COMPONENTS
    import Select from "$lib/components/Select.svelte";
    import Icon from "$lib/components/Icons.svelte";
    import Images from "$lib/components/Images.svelte"; 
    import Button from "$lib/components/Button.svelte";

    // DATA
    import { characters } from "$lib/data/characters";
    import { currencies } from "$lib/data/items/currencies";
    import { banners } from "$lib/data/banners";
    import { bannerTypes } from "$lib/data/bannerTypes";
    import { API_BASE } from "$lib/api"; // Убедись, что у тебя есть базовый URL API

    // --- ЛОГИКА ---

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
    
    // Автовыбор и сброс
    $: if (bannerOptions.length > 0) {
        const valid = bannerOptions.find(o => o.value === selectedBannerId);
        if (!valid) selectedBannerId = bannerOptions[0].value;
    } else {
        selectedBannerId = "";
    }

    $: currentBanner = banners.find(b => b.id === selectedBannerId);
    $: featuredCharId = currentBanner?.featured6?.[0];
    $: featuredChar = featuredCharId ? characters[featuredCharId] : null;

    const oroberyl = currencies.find((c) => c.id === "oroberyl");

    // --- STATE ДАННЫХ ---
    let stats = {
        totalUsers: 0,
        totalPulls: 0,
        median6: 0,
        winRate5050: 0,
        totalObtained: 0,
        rates: {
            sixStar: { percent: "0.00", count: 0 },
            fiveStar: { percent: "0.00", count: 0 }
        }
    };
    let isLoading = false;

    // --- ЗАГРУЗКА С БЭКЕНДА ---
    async function fetchStats(bannerId) {
        if (!bannerId) return;
        isLoading = true;
        try {
            // Запрос на твой сервер
            const res = await fetch(`${API_BASE}/api/global/stats?bannerId=${bannerId}`);
            const json = await res.json();
            
            if (json.code === 0) {
                const d = json.data;
                
                // Считаем проценты
                const r6 = d.totalPulls > 0 ? (d.count6 / d.totalPulls * 100).toFixed(3) : "0.00";
                const r5 = d.totalPulls > 0 ? (d.count5 / d.totalPulls * 100).toFixed(3) : "0.00";

                // Считаем WinRate и TotalObtained для featured персонажа
                let obtained = 0;
                let winRate = 0;
                
                if (featuredChar && d.sixStarNames) {
                    // Ищем имя персонажа в статистике (нужно точное совпадение имен!)
                    // В базе и в файле characters.js имена должны совпадать
                    const charName = featuredChar.name; 
                    obtained = d.sixStarNames[charName] || 0;
                    
                    // Winrate: (Featured Count / Total 6* Count) * 100
                    // Это упрощенная формула. Для честных 50/50 нужна сложная логика гарантов.
                    winRate = d.count6 > 0 ? (obtained / d.count6 * 100).toFixed(0) : 0;
                }

                stats = {
                    totalUsers: d.totalUsers,
                    totalPulls: d.totalPulls,
                    median6: d.median6,
                    winRate5050: winRate,
                    totalObtained: obtained,
                    rates: {
                        sixStar: { percent: r6, count: d.count6 },
                        fiveStar: { percent: r5, count: d.count5 }
                    }
                };
            }
        } catch (e) {
            console.error("Failed to fetch stats", e);
        } finally {
            isLoading = false;
        }
    }

    // Реактивно запускаем фетч при смене баннера
    $: if (selectedBannerId) {
        fetchStats(selectedBannerId);
    }

    const fmt = (num) => num ? num.toLocaleString('ru-RU') : "0";
</script>

<div class="max-w-[1600px] justify-start pb-20">
    
    <div class="flex items-center gap-4 mb-8">
        <Button variant="roundSmall" color="white" onClick={() => goto("/records")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M15 18l-6-6 6-6" />
            </svg>
        </Button>

        <h2 class="font-sdk text-5xl tracking-wide text-[#21272C]">
            {$t("global.title")}
        </h2>
    </div>

    <div class="flex flex-col md:flex-row gap-4 mb-8 max-w-2xl">
        <div class="w-full md:w-1/2">
            <Select 
                options={typeOptions} 
                bind:value={selectedType} 
                variant="white"
                placeholder={$t("global.selectType")}
            />
        </div>
        <div class="w-full md:w-1/2">
            {#key selectedType}
                <Select 
                    options={bannerOptions} 
                    bind:value={selectedBannerId} 
                    variant="white"
                    placeholder={$t("global.selectBanner")}
                />
            {/key}
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <div class="lg:col-span-3 space-y-4">
            
            {#if selectedType === 'special' && featuredChar}
                <div class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 relative overflow-hidden group">
                    <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-[#D84C38]"></div>
                    
                    <div class="w-16 h-16 bg-gray-100 rounded border border-gray-200 overflow-hidden shrink-0">
                         <img 
                            src={featuredChar.icon} 
                            alt={featuredChar.name} 
                            class="w-full h-full object-cover scale-110 group-hover:scale-125 transition-transform duration-500" 
                         />
                    </div>
                    
                    <div>
                        <h3 class="font-bold text-lg text-[#21272C] leading-none mb-1">{featuredChar.name}</h3>
                        <div class="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">
                            {$t("global.totalObtained")}
                        </div>
                        <div class="font-sdk text-2xl font-bold leading-none text-[#21272C]">
                            {isLoading ? "..." : fmt(stats.totalObtained)}
                        </div>
                    </div>
                </div>
            {/if}

            <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100 text-sm">
                
                <div class="flex justify-between items-center py-3 border-b border-gray-50">
                    <span class="font-medium text-gray-600">{$t("global.median6")}</span>
                    <span class="font-bold font-nums text-[#21272C]">{isLoading ? "..." : stats.median6} {$t("global.pull")}</span>
                </div>
                
                <div class="flex justify-between items-center py-3 border-b border-gray-50">
                    <span class="font-medium text-gray-600">{$t("global.totalUsers")}</span>
                    <span class="font-bold font-nums text-[#21272C]">{isLoading ? "..." : fmt(stats.totalUsers)}</span>
                </div>

                <div class="flex justify-between items-center py-3 border-b border-gray-50">
                    <span class="font-medium text-gray-600">{$t("global.totalPulls")}</span>
                    <span class="font-bold font-nums text-[#21272C]">{isLoading ? "..." : fmt(stats.totalPulls)}</span>
                </div>

                <div class="flex justify-between items-center py-3 border-b border-gray-50">
                    <span class="font-medium text-gray-600">{$t("global.spent")}</span>
                    <div class="flex items-center gap-2 font-bold font-nums text-[#21272C]">
                        <Images item={oroberyl} category="currencies" size={20} />
                        {isLoading ? "..." : fmt(stats.totalPulls * 500)}
                    </div>
                </div>

                {#if selectedType === 'special'}
                    <div class="flex justify-between items-center py-3 pt-3">
                        <span class="font-medium text-gray-600">{$t("global.winRate")}</span>
                        <span class="font-bold font-nums text-[#D0926E]">{isLoading ? "..." : stats.winRate5050}%</span>
                    </div>
                {/if}
            </div>

            <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100 h-40 flex flex-col justify-between">
                <div class="text-xs font-bold text-gray-800 uppercase tracking-wide">{$t("global.activity")}</div>
                <div class="flex-1 w-full flex items-end justify-between px-1 pb-1 pt-2">
                     <svg viewBox="0 0 100 40" class="w-full h-full overflow-visible" preserveAspectRatio="none">
                        <path d="M0,35 Q20,15 40,25 T80,10 T100,30" fill="none" stroke="#21272C" stroke-width="2" vector-effect="non-scaling-stroke" />
                        <path d="M0,35 Q20,15 40,25 T80,10 T100,30 V40 H0 Z" fill="#21272C" fill-opacity="0.05" stroke="none" />
                        <circle cx="0" cy="35" r="2" fill="#21272C" />
                        <circle cx="40" cy="25" r="2" fill="#21272C" />
                        <circle cx="80" cy="10" r="2" fill="#21272C" />
                        <circle cx="100" cy="30" r="2" fill="#21272C" />
                     </svg>
                </div>
            </div>
        </div>

        <div class="lg:col-span-2 space-y-4">
            <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 relative overflow-hidden h-fit">
                <div class="absolute right-0 top-0 p-3 opacity-10">
                    <Icon name="star" style="width: 60px; height: 60px;" />
                </div>
                <div class="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">
                    <div class="flex items-center gap-1">
                        <span>6</span>
                        <Icon name="star" class="w-3 h-3" />
                        <span>Rate</span>
                    </div>
                </div>
                <div class="flex items-baseline gap-2 mb-2">
                    <span class="text-3xl font-bold font-nums text-[#D84C38]">
                        {isLoading ? "..." : stats.rates.sixStar.percent}%
                    </span>
                </div>
                <div class="text-[10px] font-medium text-gray-400">
                    {$t("global.total")}: <span class="text-gray-600 font-nums">{isLoading ? "..." : fmt(stats.rates.sixStar.count)}</span>
                </div>
            </div>

            <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 relative overflow-hidden h-fit">
                <div class="absolute right-0 top-0 p-3 opacity-10">
                    <Icon name="star" style="width: 60px; height: 60px;" />
                </div>
                <div class="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">
                    <div class="flex items-center gap-1">
                        <span>5</span>
                        <Icon name="star" class="w-3 h-3" />
                        <span>Rate</span>
                    </div>
                </div>
                <div class="flex items-baseline gap-2 mb-2">
                    <span class="text-3xl font-bold font-nums text-[#FFC107]">
                         {isLoading ? "..." : stats.rates.fiveStar.percent}%
                    </span>
                </div>
                <div class="text-[10px] font-medium text-gray-400">
                    {$t("global.total")}: <span class="text-gray-600 font-nums">{isLoading ? "..." : fmt(stats.rates.fiveStar.count)}</span>
                </div>
            </div>
        </div>

        <div class="lg:col-span-7">
            {#if currentBanner}
                <div class="bg-[#21272C] rounded-xl overflow-hidden shadow-lg h-[600px] relative">
                    <img 
                        src={currentBanner.icon} 
                        alt={currentBanner.name} 
                        class="absolute inset-0 w-full h-full object-cover"
                    />
                </div>
            {/if}
        </div>

    </div>
</div>
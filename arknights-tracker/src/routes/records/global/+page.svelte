<script>
    import { onMount, onDestroy } from "svelte";
    import { t } from "$lib/i18n";
    import { goto } from "$app/navigation";
    import { fade } from "svelte/transition";
    
    import Select from "$lib/components/Select.svelte";
    import Icon from "$lib/components/Icons.svelte";
    import Images from "$lib/components/Images.svelte"; 
    import Button from "$lib/components/Button.svelte";
    import Tooltip from "$lib/components/Tooltip.svelte";
    import BannerModal from "$lib/components/BannerModal.svelte"; // Импорт модалки

    import { characters } from "$lib/data/characters";
    import { currencies } from "$lib/data/items/currencies";
    import { banners } from "$lib/data/banners";
    import { bannerTypes } from "$lib/data/bannerTypes";
    import { API_BASE } from "$lib/api";

    // --- ЛОГИКА ВРЕМЕНИ И ТАЙМЕРА ---
    let now = new Date();
    let timer;
    // Дефолтный сервер для глобальной статистики (обычно 3 - Global)
    const currentServerId = "3"; 

    function parseWithServerOffset(dateStr) {
        if (!dateStr) return null;
        if (dateStr.includes("Z") || (dateStr.includes("T") && dateStr.includes("+"))) {
            return new Date(dateStr);
        }
        const offset = currentServerId === "2" ? 8 : -5;
        const sign = offset >= 0 ? "+" : "-";
        const pad = (n) => String(Math.abs(n)).padStart(2, '0');
        const iso = dateStr.replace(" ", "T") + `${sign}${pad(offset)}:00`;
        return new Date(iso);
    }

    function formatTimeLeft(endTimeStr) {
        if (!endTimeStr) return null;
        const end = parseWithServerOffset(endTimeStr);
        const diff = end - now;
        if (diff <= 0) return null;

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) return $t("timer.left_d_h", { d: days, h: hours }) || `${days}d ${hours}h`;
        if (hours > 0) return $t("timer.left_h_m", { h: hours, m: minutes }) || `${hours}h ${minutes}m`;
        return $t("timer.left_m", { m: minutes }) || `${minutes}m`;
    }

    onMount(() => {
        timer = setInterval(() => { now = new Date(); }, 1000 * 60);
    });

    onDestroy(() => {
        clearInterval(timer);
    });

    $: sortedBannerTypes = [...bannerTypes].sort((a, b) => {
        if (a.id === 'special') return -1;
        if (b.id === 'special') return 1;
        return a.order - b.order;
    });

    $: typeOptions = sortedBannerTypes.map(bt => ({
        value: bt.id, 
        label: $t(bt.i18nKey) || bt.name
    }));

    let selectedType = "special";

    // Проверяем типы более гибко
    $: isSimpleType = selectedType === 'standard' || selectedType === 'new-player';
    // Считаем типом "Оружие" всё, что содержит 'weap' в названии типа (weapon, weap-standard и т.д.)
    $: isWeaponCategory = selectedType.toLowerCase().includes('weap');

    $: bannerOptions = banners
        .filter(b => {
            const bid = b.id.toLowerCase();
            const bType = b.type.toLowerCase(); // В твоих данных это всегда "weapon"
            
            // Получаем текущий выбранный тип
            const sType = selectedType;

            // --- ЛОГИКА ДЛЯ ОРУЖИЯ ---
            
            // 1. Если выбрали "Стандартные поставки" (Constant)
            if (sType === 'weapstandard' || sType === 'weap-standard' || sType === 'weapStandard') {
                // Это должно быть оружие И в ID должно быть слово 'constant'
                return bType === 'weapon' && bid.includes('constant');
            }
            
            // 2. Если выбрали "Специальные поставки" (Event Weapon)
            if (sType === 'weapspecial' || sType === 'weap-special' || sType === 'weapSpecial') {
                // Это должно быть оружие И в ID НЕ должно быть 'constant'
                return bType === 'weapon' && !bid.includes('constant');
            }

            // 3. Если вдруг выбран общий тип "weapon"
            if (sType === 'weapon') {
                return bType === 'weapon' || bid.includes('weapon');
            }

            // --- ЛОГИКА ДЛЯ ОСТАЛЬНЫХ (Персонажи) ---
            // Тут просто сравниваем типы (special, standard, new-player)
            return b.type === sType;
        })
        .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
        .map(b => ({
            value: b.id,
            label: $t(`banners.${b.id}`) || b.name
        }));

    let selectedBannerId = "";

    // Авто-выбор баннера
    $: {
        if (isSimpleType) {
            const found = banners.find(b => b.type === selectedType);
            if (found) selectedBannerId = found.id;
        } else if (bannerOptions.length > 0) {
            // Проверяем, есть ли текущий выбранный ID в новом списке
            const currentExists = bannerOptions.find(o => o.value === selectedBannerId);
            
            if (!currentExists) {
                // Ищем АКТИВНЫЙ баннер в текущем отфильтрованном списке
                const activeOption = bannerOptions.find(option => {
                    const b = banners.find(x => x.id === option.value);
                    if (!b) return false;
                    
                    const start = parseWithServerOffset(b.startTime);
                    const end = b.endTime ? parseWithServerOffset(b.endTime) : null;
                    
                    // Проверяем, идет ли баннер прямо сейчас
                    // Если end == null, считаем что он вечный
                    return start && now >= start && (!end || now <= end);
                });

                if (activeOption) {
                    // Если нашли активный — выбираем его
                    selectedBannerId = activeOption.value;
                } else {
                    // Если активных нет — берем самый новый (первый в списке)
                    selectedBannerId = bannerOptions[0].value;
                }
            }
        } else {
            selectedBannerId = "";
        }
    }

    // --- ДАННЫЕ БАННЕРА ---

    $: currentBannerRaw = banners.find(b => b.id === selectedBannerId);
    
    // Определяем, является ли текущий выбранный баннер оружейным
    $: currentIsWeapon = currentBannerRaw ? (currentBannerRaw.type === 'weapon' || currentBannerRaw.id.includes('weap')) : false;

    $: currentBanner = currentBannerRaw 
        ? { 
            ...currentBannerRaw, 
            id: currentBannerRaw.id, 
            icon: currentBannerRaw.icon || currentBannerRaw.id 
          } 
        : null;

    // Статусы баннера
    $: bannerStatus = (() => {
        if (!currentBanner) return null;
        const start = parseWithServerOffset(currentBanner.startTime);
        const end = currentBanner.endTime ? parseWithServerOffset(currentBanner.endTime) : null;
        if (now < start) return 'upcoming';
        if (end && now > end) return 'ended';
        return 'active';
    })();

    $: timeLeftString = currentBanner ? formatTimeLeft(currentBanner.endTime) : null;

    // 2. ИСПРАВЛЕННЫЙ СПИСОК ПРЕДМЕТОВ (Картинки)
    $: allFeaturedItems = (() => {
        if (!currentBanner?.featured6) return [];
        return currentBanner.featured6.map(id => {
            const char = characters[id];
            
            // Если мы в категории оружия ИЛИ персонаж не найден в базе characters -> это оружие
            const isWep = isWeaponCategory || !char; 
            
            return { 
                id: id, 
                // Если персонажа нет, используем ID как имя
                name: char ? char.name : id, 
                isWeapon: isWep, 
                rarity: 6
            };
        });
    })();

    // Показываем большую карточку, если это не Стандарт/Новичок и там всего 1 предмет (персонаж или оружие)
    $: mainFeatured = !isSimpleType && allFeaturedItems.length === 1 ? allFeaturedItems[0] : null;
    const oroberyl = currencies.find((c) => c.id === "oroberyl") || { id: "oroberyl" }; // Фолбек
    // --- СТАТИСТИКА ---

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
            const res = await fetch(`${API_BASE}/global/stats?bannerId=${bannerId}`);
            const json = await res.json();
            
            if (json.code === 0) {
                const d = json.data;
                const total = d.totalPulls || 0;
                
                const r6 = total > 0 ? (d.total6 / total * 100).toFixed(3) : "0.00";
                const r5 = total > 0 ? (d.total5 / total * 100).toFixed(3) : "0.00";
                
                let obtained = 0;
                if (mainFeatured && d.items6) {
                    const charStat = d.items6.find(i => i.name === mainFeatured.name); 
                    obtained = charStat ? charStat.count : 0;
                }

                const total5050 = (d.limitedCount + d.lost5050);
                const winRate = total5050 > 0 ? (d.limitedCount / total5050 * 100).toFixed(0) : 0;

                stats = {
                    totalUsers: d.totalUsers,
                    totalPulls: d.totalPulls,
                    median6: d.medianPity || 0,
                    winRate5050: winRate,
                    totalObtained: obtained,
                    rates: {
                        sixStar: { 
                            percent: r6, 
                            count: d.total6, 
                            items: d.items6 || [] // <--- ДОБАВИЛИ ITEMS
                        },
                        fiveStar: { 
                            percent: r5, 
                            count: d.total5, 
                            items: d.items5 || [] // <--- ДОБАВИЛИ ITEMS
                        }
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

    // --- МОДАЛКА БАННЕРА ---
    let isModalOpen = false;
    function openModal() {
        if (currentBanner) isModalOpen = true;
    }
</script>

{#if isModalOpen && currentBanner}
    <BannerModal 
        banner={currentBanner} 
        pageContext="global" 
        on:close={() => isModalOpen = false} 
    />
{/if}

<div class="w-full max-w-[1800px] px-6 pb-20">
    
    <div class="flex items-center gap-4 mb-8">
        <Button
        variant="roundSmall"
        color="white"
        onClick={() => goto("/records")}
    >
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
        >
            <path d="M15 18l-6-6 6-6" />
        </svg>
    </Button>
        <h2 class="font-sdk text-4xl md:text-5xl tracking-wide text-[#21272C] dark:text-[#FDFDFD]">
            {$t("global.title") || "Global Statistics"}
        </h2>
    </div>

    <div class="flex flex-col sm:flex-row gap-4 mb-8 max-w-2xl">
        <div class="w-full sm:w-1/2">
            <Select 
                options={typeOptions} 
                bind:value={selectedType} 
                variant="black"
                placeholder={$t("global.selectType") || "Select Type"}
            />
        </div>
        
        {#if !isSimpleType}
            <div class="w-full sm:w-1/2">
                {#key selectedType}
                    <Select 
                        options={bannerOptions} 
                        bind:value={selectedBannerId} 
                        variant="black"
                        placeholder={$t("global.selectBanner") || "Select Banner"}
                    />
                {/key}
            </div>
        {/if}
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <div class="lg:col-span-4 xl:col-span-3 flex flex-col gap-4">
            
            {#if mainFeatured}
                <div class="bg-white dark:bg-[#383838] dark:border-[#444444] rounded-xl p-5 shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div class="absolute left-0 top-0 bottom-0 w-1 bg-[#D84C38]"></div>
                    <div class="flex items-start gap-4">
                        <div class="w-16 h-16 bg-gray-100 dark:bg-[#2C2C2C] dark:border-[#444444] rounded-lg border border-gray-200 overflow-hidden shrink-0 shadow-inner flex items-center justify-center">
                             <Images 
                                id={mainFeatured.id} 
                                variant={mainFeatured.isWeapon ? "weapon-icon" : "operator-icon"} 
                                className="w-full h-full object-cover" 
                                size="100%"
                             />
                        </div>
                        <div class="flex flex-col justify-center h-16">
                            <div class="font-bold text-base text-[#21272C] dark:text-[#FDFDFD] leading-tight mb-0.5 line-clamp-2">
                                {$t(mainFeatured.isWeapon ? `weaponsList.${mainFeatured.id}` : `characters.${mainFeatured.id}`) || mainFeatured.name}
                            </div>
                            <div class="text-[10px] text-gray-500 dark:text-[#B7B6B3] uppercase tracking-wide">{$t("global.totalObtained") || "Total Obtained"}</div>
                            <div class="font-nums font-bold text-xl text-[#21272C] dark:text-[#FDFDFD] leading-none mt-0.5">{fmt(stats.totalObtained)}</div>
                        </div>
                    </div>
                </div>
            {/if}

            {#if (isSimpleType || isWeaponCategory || allFeaturedItems.length > 1) && allFeaturedItems.length > 0}
                 <div class="bg-white dark:bg-[#383838] dark:border-[#444444] rounded-xl p-5 shadow-sm border border-gray-100">
                    <h3 class="text-lg font-bold font-sdk text-[#21272C] dark:text-[#FDFDFD] mb-2">
                        {$t("global.featuredList") || "Featured Items"}
                    </h3>
                    
                    <div class="flex flex-wrap gap-2">
                        {#each allFeaturedItems as icon}
                            <Tooltip text={$t(icon.isWeapon ? `weaponsList.${icon.id}` : `characters.${icon.id}`) || icon.name}>
                                <div class="w-12 h-12 bg-gray-100 dark:bg-[#2C2C2C] rounded-lg border border-gray-200 dark:border-[#555] overflow-hidden hover:scale-105 transition-transform cursor-pointer shadow-sm relative group">
                                     <Images
                                          id={icon.id}
                                          variant={icon.isWeapon ? "weapon-icon" : "operator-icon"}
                                          size="100%"
                                          className="w-full h-full object-cover"
                                          alt={icon.name}
                                     />
                                </div>
                            </Tooltip>
                        {/each}
                    </div>
                 </div>
            {/if}

            <div class="bg-white dark:bg-[#383838] dark:border-[#444444] rounded-xl p-5 shadow-sm border border-gray-100">
                <div class="flex justify-between items-start mb-4">
                    <h3 class="text-lg font-bold font-sdk text-[#21272C] dark:text-[#FDFDFD]">
                        {$t("global.overview") || "Overview"}
                    </h3>
                </div>

                <div class="space-y-3">
                     <div class="flex justify-between items-center text-sm">
                        <span class="text-gray-600 dark:text-[#E4E4E4]">{$t("global.totalUsers") || "Total Users"}</span>
                        <span class="font-bold text-lg font-nums text-[#21272C] dark:text-[#FDFDFD]">{fmt(stats.totalUsers)}</span>
                     </div>
                     <div class="flex justify-between items-center text-sm">
                        <span class="text-gray-600 dark:text-[#E4E4E4]">{$t("global.totalPulls") || "Total Pulls"}</span>
                        <span class="font-bold text-lg font-nums text-[#21272C] dark:text-[#FDFDFD]">{fmt(stats.totalPulls)}</span>
                     </div>
                     <div class="flex justify-between items-center text-sm">
                        <span class="text-gray-600 dark:text-[#E4E4E4]">{$t("global.spent") || "Oroberyl Spent"}</span>
                        <span class="font-bold text-gray-900 dark:text-[#FDFDFD] flex items-center gap-1.5 font-nums text-lg">
                            <Images id="oroberyl" variant="currency" size={20} />
                            {fmt(stats.totalPulls * 500)}
                        </span>
                     </div>
                </div>
            </div>

            <div class="bg-white dark:bg-[#383838] dark:border-[#444444] rounded-xl p-5 shadow-sm border border-gray-100">
                 <div class="flex justify-between items-center mb-4">
                     <h3 class="text-lg font-bold font-sdk text-[#21272C] dark:text-[#FDFDFD] flex items-center gap-2">
                        6 <Icon name="star" class="w-5 h-5 text-[#D0926E]" /> {$t("global.stats") || "Stats"}
                     </h3>
                 </div>
                 
                 <div class="space-y-3">
                    <div class="flex justify-between items-center text-sm">
                        <span class="text-gray-600 dark:text-[#E4E4E4]">{$t("global.rate") || "Rate"}</span>
                        <span class="font-bold text-lg font-nums text-[#21272C] dark:text-[#FDFDFD]">{stats.rates.sixStar.percent}%</span>
                    </div>
                    <div class="flex justify-between items-center text-sm">
                        <span class="text-gray-600 dark:text-[#E4E4E4]">{$t("global.count") || "Count"}</span>
                        <span class="font-bold text-lg font-nums text-[#21272C] dark:text-[#FDFDFD]">{fmt(stats.rates.sixStar.count)}</span>
                    </div>
                    <div class="flex justify-between items-center text-sm">
                        <span class="text-gray-600 dark:text-[#E4E4E4]">{$t("global.median") || "Median Pity"}</span>
                        <span class="font-bold text-lg font-nums text-[#21272C] dark:text-[#FDFDFD]">{stats.median6}</span>
                    </div>
                    {#if !isSimpleType && stats.winRate5050 > 0}
                        <div class="flex justify-between items-center pt-3 mt-1 border-t border-gray-100 dark:border-[#444]">
                             <span class="text-gray-500 dark:text-[#B7B6B3] text-xs font-medium uppercase tracking-wide">
                                 {#if isWeaponCategory} Won 25:75 {:else} Won 50:50 {/if}
                             </span>
                             <span class="font-bold text-lg font-nums text-[#21272C] dark:text-[#FDFDFD]">{stats.winRate5050}%</span>
                        </div>
                    {/if}
                 </div>
            </div>

            <div class="bg-white dark:bg-[#383838] dark:border-[#444444] rounded-xl p-5 shadow-sm border border-gray-100">
                 <div class="flex justify-between items-center mb-4">
                     <h3 class="text-lg font-bold font-sdk text-[#21272C] dark:text-[#FDFDFD] flex items-center gap-2">
                        5 <Icon name="star" class="w-5 h-5 text-[#E3BC55]" /> {$t("global.stats") || "Stats"}
                     </h3>
                 </div>
                 <div class="space-y-3">
                    <div class="flex justify-between items-center text-sm">
                        <span class="text-gray-600 dark:text-[#E4E4E4]">{$t("global.rate") || "Rate"}</span>
                        <span class="font-bold text-lg font-nums text-[#21272C] dark:text-[#FDFDFD]">{stats.rates.fiveStar.percent}%</span>
                    </div>
                    <div class="flex justify-between items-center text-sm">
                        <span class="text-gray-600 dark:text-[#E4E4E4]">{$t("global.count") || "Count"}</span>
                        <span class="font-bold text-lg font-nums text-[#21272C] dark:text-[#FDFDFD]">{fmt(stats.rates.fiveStar.count)}</span>
                    </div>
                 </div>
            </div>

        </div>

        <div class="lg:col-span-8 xl:col-span-8 flex flex-col gap-6">
            
            {#if currentBanner}
                <div
                    role="button"
                    tabindex="0"
                    on:click={openModal}
                    on:keydown={(e) => (e.key === "Enter" || e.key === " ") && openModal()}
                    class="relative w-full aspect-[21/9] bg-gray-200 dark:bg-[#1E1E1E] rounded-xl overflow-hidden shadow-2xl group border border-white/50 dark:border-[#444444] select-none cursor-pointer outline-none focus:ring-4 focus:ring-[#FACC15] transition-all"
                >
                    {#key currentBanner.id}
                        <div 
                            class="absolute inset-0"
                            in:fade={{ duration: 300 }}
                        >
                            <Images 
                                id={currentBanner.icon || currentBanner.id} 
                                variant="banner-icon" 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                alt={currentBanner.name}
                            />
                            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90 pointer-events-none"></div>
                        </div>
                    {/key}
                    
                    {#if bannerStatus}
                        <div class="absolute bottom-6 left-6 right-6 z-20 pointer-events-none flex flex-col items-start gap-3">
                            <div class="inline-flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-md border border-white/20 rounded-full shadow-lg">
                                <span class="w-2 h-2 rounded-full {bannerStatus === 'active' ? 'bg-[#FACC15] animate-pulse' : bannerStatus === 'upcoming' ? 'bg-blue-400' : 'bg-gray-400'}"></span>
                                <span class="text-xs font-bold text-white font-nums tracking-wide leading-none uppercase">
                                    {#if bannerStatus === 'active' && timeLeftString}
                                        {timeLeftString}
                                    {:else}
                                        {$t(`status.${bannerStatus}`) || bannerStatus}
                                    {/if}
                                </span>
                            </div>
                            <div>
                                {#if !isSimpleType}
                                    <div class="text-xs font-bold text-white/70 uppercase tracking-widest mb-1">
                                        {$t(`bannerTypes.${currentBanner.type}`) || currentBanner.type}
                                    </div>
                                {/if}
                                <h1 class="text-2xl md:text-4xl font-sdk font-bold text-white leading-tight drop-shadow-lg">
                                    {$t(`banners.${currentBanner.id}`) || currentBanner.name}
                                </h1>
                            </div>
                        </div>
                    {/if}
                </div>
            {:else}
                 <div class="w-full aspect-[21/9] bg-gray-100 dark:bg-[#2C2C2C] rounded-xl flex items-center justify-center text-gray-400 dark:text-[#666] border border-dashed border-gray-300 dark:border-[#444]">
                    {$t("global.selectBanner") || "Select Banner"}
                </div>
            {/if}

            <div class="bg-white dark:bg-[#383838] dark:border-[#444444] rounded-xl p-5 shadow-sm border border-gray-100 h-[250px] flex flex-col">
                <div class="text-xs font-bold text-gray-800 dark:text-[#FDFDFD] uppercase mb-4">{$t("global.pullsPerDay") || "Pulls per Day"}</div>
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
                        <div class="w-full h-full flex flex-col items-center justify-center text-gray-300 dark:text-[#666]">
                            <Icon name="noData" className="w-8 h-8 mb-2 opacity-50" />
                            <span class="text-xs">{$t("global.noData") || "No Data"}</span>
                        </div>
                    {/if}
                </div>
            </div>

            <div class="bg-white dark:bg-[#383838] dark:border-[#444444] rounded-xl p-5 shadow-sm border border-gray-100 h-[250px] flex flex-col">
                <div class="text-xs font-bold text-gray-800 dark:text-[#FDFDFD] uppercase mb-4 flex items-center gap-1">
                    {$t("global.pityDist") || "Pity Distribution"} 
                    <Icon name="star" class="w-3 h-3 text-[#D0926E]" />
                </div>
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
                        <div class="w-full h-full flex flex-col items-center justify-center text-gray-300 dark:text-[#666]">
                            <Icon name="noData" className="w-8 h-8 mb-2 opacity-50" />
                            <span class="text-xs">{$t("global.noData") || "No Data"}</span>
                        </div>
                     {/if}
                </div>
                <div class="flex justify-between text-[10px] text-gray-400 dark:text-[#B7B6B3] mt-2 px-1">
                    {#each [1, 10, 20, 30, 40, 50, 60, 70, 80] as mark}
                        <span>{mark}</span>
                    {/each}
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div class="bg-white dark:bg-[#383838] dark:border-[#444444] rounded-xl overflow-hidden shadow-sm border border-gray-100">
                    <div class="p-4 border-b border-gray-100 dark:border-[#444] flex items-center justify-center gap-2">
                        <h3 class="font-bold text-[#D0926E] text-lg flex items-center gap-1">
                            6 <Icon name="star" class="w-4 h-4" /> {$t("global.list") || "List"}
                        </h3>
                    </div>
                    
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm text-left">
                            <thead class="text-xs text-gray-500 dark:text-[#B7B6B3] uppercase bg-gray-50 dark:bg-[#2C2C2C]">
                                <tr>
                                    <th class="px-4 py-3 font-bold">{$t("global.name") || "Name"}</th>
                                    <th class="px-4 py-3 font-bold text-right">{$t("global.total") || "Total"}</th>
                                    <th class="px-4 py-3 font-bold text-right">%</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100 dark:divide-[#444]">
                                {#if stats.rates.sixStar.items && stats.rates.sixStar.items.length > 0}
                                    {#each stats.rates.sixStar.items as item, i}
                                        {@const charId = Object.keys(characters).find(k => characters[k].name === item.name) || item.name}
                                        {@const isWeaponItem = !characters[charId]}
                                        
                                        <tr class="hover:bg-gray-50 dark:hover:bg-[#444] transition-colors group">
                                            <td class="px-4 py-2 font-medium text-gray-900 dark:text-[#FDFDFD] flex items-center gap-3 relative">
                                                {#if i === 0}
                                                    <div class="absolute left-0 top-0 bottom-0 w-1 bg-[#FACC15]"></div>
                                                {/if}

                                                <div class="w-10 h-10 rounded-full bg-gray-200 dark:bg-[#1E1E1E] overflow-hidden border border-gray-200 dark:border-[#555] shrink-0">
                                                     <Images 
                                                        id={charId} 
                                                        variant={isWeaponItem ? "weapon-icon" : "avatar"} 
                                                        className="w-full h-full object-cover transform scale-110" 
                                                        alt={item.name}
                                                     />
                                                </div>
                                                <span class="truncate max-w-[120px]" title={item.name}>{item.name}</span>
                                            </td>
                                            <td class="px-4 py-2 text-right font-nums font-bold text-gray-900 dark:text-[#FDFDFD]">
                                                {fmt(item.count)}
                                            </td>
                                            <td class="px-4 py-2 text-right font-nums text-gray-500 dark:text-[#B7B6B3]">
                                                {item.percent}%
                                            </td>
                                        </tr>
                                    {/each}
                                {:else}
                                    <tr>
                                        <td colspan="3" class="px-4 py-10">
                                            <div class="flex flex-col items-center justify-center gap-2 text-gray-300 dark:text-[#666]">
                                                <Icon name="noData" className="w-8 h-8 opacity-50" />
                                                <span class="text-xs">{$t("global.noData") || "No Data"}</span>
                                            </div>
                                        </td>
                                    </tr>
                                {/if}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="bg-white dark:bg-[#383838] dark:border-[#444444] rounded-xl overflow-hidden shadow-sm border border-gray-100">
                    <div class="p-4 border-b border-gray-100 dark:border-[#444] flex items-center justify-center gap-2">
                        <h3 class="font-bold text-[#E3BC55] text-lg flex items-center gap-1">
                            5 <Icon name="star" class="w-4 h-4" /> {$t("global.list") || "List"}
                        </h3>
                    </div>
                    
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm text-left">
                            <thead class="text-xs text-gray-500 dark:text-[#B7B6B3] uppercase bg-gray-50 dark:bg-[#2C2C2C]">
                                <tr>
                                    <th class="px-4 py-3 font-bold">{$t("global.name") || "Name"}</th>
                                    <th class="px-4 py-3 font-bold text-right">{$t("global.total") || "Total"}</th>
                                    <th class="px-4 py-3 font-bold text-right">%</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100 dark:divide-[#444]">
                                {#if stats.rates.fiveStar.items && stats.rates.fiveStar.items.length > 0}
                                    {#each stats.rates.fiveStar.items.slice(0, 10) as item, i}
                                        {@const charId = Object.keys(characters).find(k => characters[k].name === item.name) || item.name}
                                        {@const isWeaponItem = !characters[charId]}

                                        <tr class="hover:bg-gray-50 dark:hover:bg-[#444] transition-colors relative">
                                            <td class="px-4 py-2 font-medium text-gray-900 dark:text-[#FDFDFD] flex items-center gap-3 relative">
                                                {#if i === 0}
                                                    <div class="absolute left-0 top-0 bottom-0 w-1 bg-[#E3BC55]"></div>
                                                {/if}
                                                <div class="w-10 h-10 rounded-full bg-gray-200 dark:bg-[#1E1E1E] overflow-hidden border border-gray-200 dark:border-[#555] shrink-0">
                                                     <Images 
                                                        id={charId} 
                                                        variant={isWeaponItem ? "weapon-icon" : "avatar"} 
                                                        className="w-full h-full object-cover transform scale-110" 
                                                        alt={item.name}
                                                     />
                                                </div>
                                                <span class="truncate max-w-[120px]" title={item.name}>{item.name}</span>
                                            </td>
                                            <td class="px-4 py-2 text-right font-nums font-bold text-gray-900 dark:text-[#FDFDFD]">
                                                {fmt(item.count)}
                                            </td>
                                            <td class="px-4 py-2 text-right font-nums text-gray-500 dark:text-[#B7B6B3]">
                                                {item.percent}%
                                            </td>
                                        </tr>
                                    {/each}
                                    {#if stats.rates.fiveStar.items.length > 10}
                                        <tr>
                                            <td colspan="3" class="px-4 py-2 text-center text-xs text-gray-400 italic">
                                                ... and {stats.rates.fiveStar.items.length - 10} more
                                            </td>
                                        </tr>
                                    {/if}
                                {:else}
                                    <tr>
                                        <td colspan="3" class="px-4 py-10">
                                            <div class="flex flex-col items-center justify-center gap-2 text-gray-300 dark:text-[#666]">
                                                <Icon name="noData" className="w-8 h-8 opacity-50" />
                                                <span class="text-xs">{$t("global.noData") || "No Data"}</span>
                                            </div>
                                        </td>
                                    </tr>
                                {/if}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

        </div>

    </div>
</div>
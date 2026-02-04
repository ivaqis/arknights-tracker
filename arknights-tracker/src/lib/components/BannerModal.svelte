<script>
    import { createEventDispatcher, onMount } from "svelte";
    import { replaceState } from "$app/navigation";
    import { pullData } from "$lib/stores/pulls";
    import { characters } from "$lib/data/characters";
    import { weapons } from "$lib/data/weapons";
    import { banners } from "$lib/data/banners";
    import { browser } from "$app/environment";
    import { t } from "$lib/i18n";

    import Icon from "$lib/components/Icons.svelte";
    import OperatorCard from "$lib/components/OperatorCard.svelte";
    import Images from "$lib/components/Images.svelte";
    import BannerStats from "$lib/components/BannerStats.svelte";
    import Tooltip from "$lib/components/Tooltip.svelte";

    export const bannerId = undefined; 
    export let banner = null;
    export let pageContext = null;

    const dispatch = createEventDispatcher();

    // --- Helpers ---
    function normalize(str) {
        return String(str || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    }

    function formatTime(d) {
        if (!d) return "";
        return d.toLocaleString("ru-RU", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    function getWeaponBg(rarity) {
        if (rarity === 6) return "bg-gradient-to-t from-[#591C00] to-[#BD896E]";
        if (rarity === 5) return "bg-gradient-to-t from-[#261E00] to-[#E3BC55]";
        return "bg-gradient-to-t from-[#1a1a1a] to-[#666666]";
    }

    function getRarityColor(rarity) {
        if (rarity === 6) return "#D0926E";
        if (rarity === 5) return "#E3BC55";
        return "#888";
    }

    onMount(() => {
        if (banner && banner.id && typeof window !== "undefined") {
            replaceState(`#banner-${banner.id}`, {});
        }
    });

    function close() {
        if (typeof window !== "undefined" && window.location.hash) {
            replaceState(window.location.pathname + window.location.search, {});
        }
        dispatch("close");
    }

    $: isEvent =
        banner?.type === "web" ||
        banner?.type === "ingame" ||
        banner?.originalType === "ingame" ||
        banner?.originalType === "web" ||
        (typeof banner?.id === "string" && banner?.id.startsWith("ev"));

    $: imageVariant = isEvent ? "event-icon" : "banner-icon";

    $: isWeaponBanner = (() => {
        if (!banner) return false;
        const id = (banner.id || "").toLowerCase();
        const type = (banner.type || "").toLowerCase();
        const ctx = (pageContext || "").toLowerCase();
        return (
            type === 'weapon' || 
            id.includes('weap') || id.includes('wepon') ||
            ctx.includes('weap') || ctx.includes('wepon')
        );
    })();

    // --- 1. ГИБКИЙ ВЫБОР ДАННЫХ (Fix для оружия) ---
    $: categoryPulls = (() => {
        if (!banner || !$pullData) return [];
        
        let keysToCheck = [];
        
        const id = (banner.id || "").toLowerCase();
        const type = (banner.type || "").toLowerCase();

        if (isWeaponBanner) {
            // Если это Постоянный/Стандартный оружейный
            if (id.includes('constant') || id.includes('standard') || type === 'weap-standard') {
                keysToCheck = ['weap-standard', 'weapon-standard', 'wepon-standard', 'standard-weapon'];
            } 
            // Иначе считаем это Ивентовым/Специальным оружием
            else {
                keysToCheck = ['weap-special', 'weapon-special', 'wepon-special', 'special-weapon', 'weapon', 'wepon'];
            }
            
            // Добавляем ID самого баннера как фоллбэк
            if (banner.id) keysToCheck.push(banner.id);
        } 
        else {
            // Персонажи (тут строго, чтобы не смешивать)
            if (id === 'standard' || id.includes('standard') || type === 'standard') {
                keysToCheck = ['standard'];
            } else if (id.includes('new') || type === 'new-player') {
                keysToCheck = ['new-player', 'new'];
            } else {
                keysToCheck = ['special'];
            }
        }

        // Ищем первый ключ, в котором есть непустой массив
        for (const key of keysToCheck) {
            const data = $pullData[key];
            if (data && Array.isArray(data.pulls) && data.pulls.length > 0) {
                return data.pulls;
            }
        }
        return [];
    })();

    const itemMap = { ...characters, ...weapons };

    $: featuredItems = (() => {
        if (!banner) return [];
        const ids = [...(banner.featured6 || []), ...(banner.featured5 || [])];
        return ids
            .map((id) => {
                const item = itemMap[id];
                if (!item) return null;
                return { ...item, isWeapon: !!weapons[id] };
            })
            .filter(Boolean);
    })();

    $: featuredList = (() => {
        if (!banner) return [];
        return [...(banner.featured6 || []), ...(banner.featured5 || [])];
    })();

    const checkIsFeatured = (itemName) => {
        const normItem = normalize(itemName);
        return featuredList.some(fid => {
            const c = characters[fid];
            if (c && normalize(c.name) === normItem) return true;
            const w = weapons[fid];
            if (w && normalize(w.name) === normItem) return true;
            if (normalize(fid) === normItem) return true;
            return false;
        });
    };

    // --- РАСЧЕТ СТАТИСТИКИ ---
    $: bannerData = (() => {
        if (!banner || !categoryPulls.length || isEvent) {
            return { pulls: [], stats: {} };
        }

        const bStart = new Date(banner.startTime).getTime();
        const bEnd = banner.endTime ? new Date(banner.endTime).getTime() : Infinity;

        // 1. Сортируем ВСЮ историю
        const fullHistory = [...categoryPulls].sort((a, b) => {
            const tA = new Date(a.time).getTime();
            const tB = new Date(b.time).getTime();
            if (tA !== tB) return tA - tB;
            return (a.seqId || 0) - (b.seqId || 0);
        });

        // 2. Рассчитываем PITY
        let simPity5 = 0;
        let simPity6 = 0; // На случай отсутствия в базе

        const historyWithPity = fullHistory.map(pull => {
            const p = { ...pull };
            const isFree = p.isFree === true || String(p.isFree) === "true";

            // Увеличиваем Pity ТОЛЬКО если крутка платная
            if (!isFree) {
                simPity5++;
                simPity6++;
            }

            // 6*: Берем из базы, если есть. Иначе наш подсчет
            p.calculatedPity6 = (p.pity !== undefined && p.pity !== null) ? Number(p.pity) : simPity6;
            
            // 5*: Берем наш подсчет
            p.calculatedPity5 = simPity5;

            // Сброс
            if (p.rarity === 6) simPity6 = 0;
            if (p.rarity === 5) simPity5 = 0;

            return p;
        });

        // 3. Фильтруем по датам
        // ВАЖНО: Для Оружия мы не проверяем bannerId так строго, как для персонажей,
        // потому что в базе weapon bannerId часто просто "weapon" или "weap-special", без разделения на ID баннера
        const filtered = historyWithPity.filter((pull) => {
            const pullTime = new Date(pull.time).getTime();
            const timeMatch = pullTime >= bStart && pullTime <= bEnd;
            
            // Для Стандарта персонажей добавляем проверку, чтобы не лез Спешл
            if (!isWeaponBanner && banner.id === 'standard') {
                return timeMatch && (pull.bannerId === 'standard' || pull.bannerId === '1'); // 1 - часто ID стандарта
            }
            
            return timeMatch;
        });

        if (filtered.length === 0) return { pulls: [], stats: {} };

        // 4. Итоговый подсчет
        const hardPityLimit = isWeaponBanner ? 80 : 120;
        
        let count6 = 0, count5 = 0;
        let sumPity6 = 0, sumPity5 = 0;
        let total5050 = 0, won5050 = 0;
        let localRateUpCounter = 0; 

        const processed = filtered.map((pull) => {
            const p = { ...pull };
            const isFree = p.isFree === true || String(p.isFree) === "true";
            
            if (!isFree) {
                if (localRateUpCounter >= hardPityLimit - 1) {}
                localRateUpCounter++;
            }
            const isHardPityTriggered = (localRateUpCounter > hardPityLimit);

            if (p.rarity === 6) {
                count6++;
                sumPity6 += p.calculatedPity6; 
                p.realPity = p.calculatedPity6;

                const isFeatured = checkIsFeatured(p.name);
                if (isFeatured) {
                    if (!isHardPityTriggered) {
                        total5050++;
                        won5050++;
                    }
                    localRateUpCounter = 0;
                } else {
                    if (!isHardPityTriggered) {
                        total5050++;
                    }
                }
            } 
            else if (p.rarity === 5) {
                count5++;
                sumPity5 += p.calculatedPity5;
                p.realPity = p.calculatedPity5;
            } 
            else {
                p.realPity = 1;
            }

            return p;
        }).reverse(); // Новые сверху

        const total = processed.length;

        const localStats = {
            total,
            count6,
            count5,
            percent6: total > 0 ? ((count6 / total) * 100).toFixed(2) : "0.00",
            percent5: total > 0 ? ((count5 / total) * 100).toFixed(2) : "0.00",
            
            avg6: count6 > 0 ? (sumPity6 / count6).toFixed(1) : "0.0",
            avg5: count5 > 0 ? (sumPity5 / count5).toFixed(1) : "0.0",
            
            winRate: { 
                won: won5050, 
                total: total5050, 
                percent: total5050 > 0 ? ((won5050 / total5050) * 100).toFixed(0) : 0 
            }
        };

        return { pulls: processed, stats: localStats };
    })();

    $: bannerPulls = bannerData.pulls;
    $: bannerStats = bannerData.stats;

    // --- Time Data ---
    $: now = new Date();
    $: start = banner ? new Date(banner.startTime) : new Date();
    $: end = banner && banner.endTime ? new Date(banner.endTime) : null;
    $: isEnded = end && now > end;
    $: isActive = now >= start && (!end || now <= end);
    $: isUpcoming = now < start;

    $: diff = (() => {
        if (!banner) return 0;
        if (!end && isActive) return now - start;
        if (isActive && end) return end - now;
        if (isEnded && end) return now - end;
        if (isUpcoming) return start - now;
        return 0;
    })();

    $: timeData = diff
        ? {
              days: Math.floor(diff / 86400000),
              hours: Math.floor((diff / 3600000) % 24),
          }
        : { days: 0, hours: 0 };
</script>

{#if banner}
    <div
        class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200 cursor-default"
        role="button"
        tabindex="0"
        on:click|self={close}
        on:keydown={(e) => (e.key === "Escape" || e.key === "Enter") && close()}
    >
        <div
            class="bg-white dark:bg-[#383838]  rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative animate-in zoom-in-95 duration-200 flex flex-col cursor-auto"
        >
            <button
                class="hover:bg-[#FACC15] text-white hover:text-[#21272C] absolute top-3 right-3 z-20 p-2 bg-black/30 text-white rounded-full transition-colors backdrop-blur-md cursor-pointer"
                on:click={close}
            >
                <Icon name="close" class="w-5 h-5" />
            </button>

            <div class="aspect-[21/9]  w-full relative bg-gray-100">
                <Images
                    item={banner}
                    variant={imageVariant}
                    className="w-full h-full"
                    alt={banner.name}
                    style="object-fit: cover;"
                />
                <div
                    class="absolute  inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"
                ></div>
                <div class="absolute bottom-0 left-0 right-0 p-5">
                    <h3
                        class="text-white font-bold text-2xl leading-tight drop-shadow-lg mb-1"
                    >
                        {$t(`banners.${banner.id}`) !== `banners.${banner.id}`
                            ? $t(`banners.${banner.id}`)
                            : banner.name || banner.id}
                    </h3>
                    <div
                        class="inline-flex items-center gap-1.5 px-2.5 py-0.5  rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md border border-white/10 shadow-sm {isActive
                            ? 'bg-green-500/20 text-green-300'
                            : ''} {isEnded
                            ? 'bg-gray-500/40 text-gray-300'
                            : ''} {isUpcoming
                            ? 'bg-blue-500/20 text-blue-300'
                            : ''}"
                    >
                        <span
                            class="w-1.5 h-1.5 rounded-full {isActive
                                ? 'bg-green-400 animate-pulse'
                                : isEnded
                                  ? 'bg-gray-400'
                                  : 'bg-blue-400'}"
                        ></span>
                        {#if isActive}{$t("status.active") ||
                                "Active"}{:else if isEnded}{$t(
                                "status.ended",
                            ) || "Ended"}{:else}{$t("status.upcoming") ||
                                "Upcoming"}{/if}
                    </div>
                </div>
            </div>

            <div
                class="p-6 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar"
            >
                <div class="space-y-3">
                    <div class="flex justify-between items-start text-sm">
                        <div class="flex flex-col gap-0.5">
                            <span
                                class="text-gray-400 dark:text-[#B7B6B3] text-xs font-bold uppercase tracking-wide"
                                >{$t("systemNames.start")}</span
                            >
                            <span class="font-nums font-medium dark:text-[#E0E0E0] text-gray-900"
                                >{formatTime(start)}</span
                            >
                        </div>
                        <div class="flex flex-col gap-0.5 text-right">
                            <span
                                class="text-gray-400 dark:text-[#B7B6B3] text-xs font-bold uppercase tracking-wide"
                                >{$t("systemNames.end")}</span
                            >
                            <span class="font-nums font-medium dark:text-[#E0E0E0] text-gray-900"
                                >{end ? formatTime(end) : "∞"}</span
                            >
                        </div>
                    </div>

                    <div
                        class="p-3 bg-gray-50 rounded-xl border dark:border-[#444444] dark:bg-[#343434] border-gray-100 text-center"
                    >
                        {#if !end}
                            <div class="text-gray-500 text-xs mb-0.5">
                                {$t("systemNames.status")}
                            </div>
                            <div
                                class="text-blue-600  font-bold font-nums text-lg leading-none"
                            >
                                {$t("timer.ongoing_active", {
                                    n: timeData.days,
                                })}
                            </div>
                        {:else if isActive}
                            <div class="text-gray-500 dark:text-[#B7B6B3] text-xs mb-0.5">
                                {$t("systemNames.timeRemaining")}
                            </div>
                            <div
                                class="text-green-600 font-bold font-nums text-lg leading-none"
                            >
                                {$t("timer.left_d_h", {
                                    d: timeData.days,
                                    h: timeData.hours,
                                })}
                            </div>
                        {:else if isEnded}
                            <div class="text-gray-500 text-xs mb-0.5">
                                {$t("status.ended") || "Ended"}
                            </div>
                            <div
                                class="text-gray-400 font-bold font-nums text-base leading-none"
                            >
                                {$t("timer.days_ago", { n: timeData.days })}
                            </div>
                        {:else if isUpcoming}
                            <div class="text-gray-500 text-xs mb-0.5">
                                {$t("systemNames.startsIn")}
                            </div>
                            <div
                                class="text-blue-600 font-bold font-nums text-lg leading-none"
                            >
                                {$t("timer.starts_soon")}
                            </div>
                        {/if}
                    </div>
                </div>

                {#if banner.url}
                    <a
                        href={banner.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="group flex items-center justify-between px-4 py-3 rounded-xl border dark:border-[#444444] border-gray-200 hover:border-[#E9CF49] hover:dark:border-[#77776A] hover:dark:bg-[#4E4E45] hover:bg-[#fff9f5] transition-all duration-200"
                    >
                        <div class="flex items-center gap-3">
                            <div
                                class="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-[#E9CF49]/10 flex items-center justify-center text-gray-500 dark:text-[#E0E0E0] dark:bg-[#2C2C2C] group-hover:text-[#D4BE48] transition-colors"
                            >
                                <Icon name="sendToLink" class="w-4 h-4" />
                            </div>
                            <div class="flex flex-col">
                                <span
                                    class="font-bold text-sm text-gray-900 dark:text-[#FDFDFD] group-hover:text-[#E9CF49] transition-colors"
                                    >{$t("page.openOfficialSource")}</span
                                >
                                <span class="text-xs text-gray-400"
                                    >{$t("page.detailsOfficialSource")}</span
                                >
                            </div>
                        </div>
                    </a>
                {/if}

                {#if featuredItems.length > 0}
                    <div class="space-y-3">
                        <div class="flex items-center gap-2">
                            <span
                                class="text-gray-400  text-[10px] font-bold uppercase tracking-widest"
                            >
                                {#if isWeaponBanner}
                                    {$t("page.banner.featuredWeapons") ||
                                        "Featured Weapons"}
                                {:else}
                                    {$t("systemNames.featuredCharacters")}
                                {/if}
                            </span>
                            <div class="h-px flex-1 bg-gray-100 dark:bg-[#444444]"></div>
                        </div>

                        <div class="flex flex-wrap gap-2 justify-center">
                            {#each featuredItems as item}
                                <Tooltip
                                    text={$t(
                                        item.isWeapon
                                            ? `weaponsList.${item.id}`
                                            : `characters.${item.id}`,
                                    ) || item.name}
                                >
                                    {#if item.isWeapon}
                                        <div
                                            class="w-[90px] h-[90px] flex items-center justify-center relative group cursor-pointer"
                                        >
                                            <div
                                                class="w-[70px] h-[70px] rounded-full overflow-hidden border-2 shadow-sm relative
                                {getWeaponBg(item.rarity)}"
                                                style="border-color: {getRarityColor(
                                                    item.rarity,
                                                )}"
                                            >
                                                <Images
                                                    id={item.id}
                                                    variant="weapon-icon"
                                                    alt={item.name}
                                                    className="w-full h-full object-cover transform scale-[1.3]"
                                                />
                                            </div>
                                        </div>
                                    {:else}
                                        <div
                                            class="w-[90px] h-[90px] rounded-lg border border-gray-100 dark:border-[#444444] shadow-sm relative overflow-hidden group cursor-pointer"
                                        >
                                            <div
                                                class="scale-[0.6] w-[80px] origin-top-left"
                                            >
                                                <OperatorCard operator={item} />
                                            </div>
                                        </div>
                                    {/if}
                                </Tooltip>
                            {/each}
                        </div>
                    </div>
                {/if}

                {#if bannerPulls.length > 0}
                    <BannerStats pulls={bannerPulls} {banner} stats={bannerStats} />
                {/if}
            </div>
        </div>
    </div>
{/if}
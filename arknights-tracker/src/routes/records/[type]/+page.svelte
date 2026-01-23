<!-- src/routes/records/[type]/+page.svelte -->
<script>
    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import { t } from "$lib/i18n";
    import { pullData } from "$lib/stores/pulls";
    import { characters } from "$lib/data/characters";
    import { banners } from "$lib/data/banners";
    import { goto } from "$app/navigation";
    import { currencies } from "$lib/data/items/currencies";
    import Button from "$lib/components/Button.svelte";
    import Icon from "$lib/components/Icons.svelte";
    import Tooltip from "$lib/components/Tooltip.svelte";
    import BannerModal from "$lib/components/BannerModal.svelte";
    import AnalyticsCharts from "$lib/components/AnalyticsCharts.svelte";
    import Images from "$lib/components/Images.svelte";

    export let bannerId;

    const oroberyl = currencies.find((c) => c.id === "oroberyl");

    let selectedBanner = null; // переменная, которая открывает модалку

    // Функция для проверки хеша в URL
    $: {
        const hash = $page.url.hash;
        if (hash && hash.startsWith("#banner-")) {
            const id = hash.replace("#banner-", "");
            const found = banners.find((b) => b.id === id);
            if (found) {
                selectedBanner = found;
            }
        } else {
            // Это важно: если нажали "назад" и хеш исчез — закрываем модалку
            selectedBanner = null;
        }
    }

    $: if ($page.url.hash && banners) {
        const id = $page.url.hash.replace("#banner-", "");
        const found = banners.find((b) => b.id === id);
        if (found) {
            selectedBanner = found;
        }
    }

    $: bannerData = $pullData[bannerId] || {
        total: 0,
        legendary: 0,
        rare: 0,
        pulls: [],
    };

    $: pulls = bannerData.pulls || [];
    $: bannerType = $page.params.type;
    $: rawPulls = $pullData[bannerType]?.pulls || [];

    // --- Normalization ---
    // Safe normalization that handles undefined/null
    const normalize = (str) => str?.toLowerCase().replace(/\s+/g, "") || "";

    const charMap = Object.values(characters).reduce((acc, char) => {
        if (char.name) acc[normalize(char.name)] = char;
        acc[normalize(char.id)] = char;
        return acc;
    }, {});

    // --- Helper: Check if character is featured ---
    const isFeatured = (charName, banner, rarity) => {
        if (!banner) return false;

        // Берем массив согласно редкости (из вашего banners.js)
        const list = rarity === 6 ? banner.featured6 : banner.featured5;
        if (!list || !Array.isArray(list)) return false;

        const normName = normalize(charName);
        return list.some((f) => {
            const normF = normalize(f);
            // Сверяем с именем персонажа или его ID из базы characters.js
            return (
                normF === normName || normF === normalize(charMap[normName]?.id)
            );
        });
    };

    // --- Logic: Pity & Status Calculation ---
    $: tableData = (() => {
        const sorted = [...rawPulls].sort(
            (a, b) => new Date(a.time) - new Date(b.time),
        );

        let pity6 = 0;
        let pity5 = 0;
        let guaranteed6 = false;
        let guaranteed5 = false;

        const processed = sorted.map((pull, index) => {
            const p = { ...pull };
            // Получаем баннер, которому принадлежит эта крутка
            const banner = getBannerForPull(p.time, bannerType);

            // 1. Расчет Pity
            if (p.rarity === 6) {
                p.pity = pity6 + 1;
                pity6 = 0;
                pity5++;
            } else if (p.rarity === 5) {
                p.pity = pity5 + 1;
                pity5 = 0;
                pity6++;
            } else {
                pity6++;
                pity5++;
                p.pity = 1;
            }

            // 2. Логика статуса для 5* и 6*
            if (p.rarity >= 5) {
                if (bannerType === "standard" || bannerType === "new-player") {
                    p.status = "won";
                } else if (!banner) {
                    p.status = "won";
                } else {
                    // [НОВАЯ ЛОГИКА]
                    // Проверяем, есть ли вообще 5* в списке рейт-апа этого баннера
                    const hasFeatured5 = banner.featured5 && banner.featured5.length > 0;
                    
                    // Если это 5*, но у баннера нет списка 5* (пустой массив), то статус normal
                    if (p.rarity === 5 && !hasFeatured5) {
                        p.status = "normal";
                    } else {
                        // Иначе считаем как обычно (для 6* всегда, для 5* только если есть список)
                        const featured = isFeatured(p.name, banner, p.rarity);
                        const isG = p.rarity === 6 ? guaranteed6 : guaranteed5;

                        if (featured) {
                            p.status = isG ? "guaranteed" : "won";
                            if (p.rarity === 6) guaranteed6 = false;
                            else guaranteed5 = false;
                        } else {
                            p.status = "lost";
                            if (p.rarity === 6) guaranteed6 = true;
                            else guaranteed5 = true;
                        }
                    }
                }
            } else {
                p.status = "normal";
            }
            return p;
        });

        return processed.reverse();
    })();

    // --- Icons for Header (uses calculated tableData) ---
    $: icons = tableData
        .filter((p) => p.rarity === 6)
        .slice(0, 6)
        .map((p) => {
            const lookupKey = normalize(p.name);
            const charData = charMap[lookupKey];
            return {
                src: charData?.icon || "/images/avatars/default_6star.png",
                pity: p.pity || "?",
                name: p.name,
            };
        });

    $: totalCount = rawPulls.length;
    $: spent = (totalCount * 500).toLocaleString("ru-RU");

    // Stats
    $: count6 = rawPulls.filter((p) => p.rarity === 6).length;
    $: count5 = rawPulls.filter((p) => p.rarity === 5).length;
    $: count4 = rawPulls.filter((p) => p.rarity === 4).length;

    $: stats = [
        {
            label: "6",
            count: count6,
            percent:
                totalCount > 0
                    ? ((count6 / totalCount) * 100).toFixed(2)
                    : "0.00",
            avg: avgPity6,
            winRate: winRate6,
        },
        {
            label: "5",
            count: count5,
            percent:
                totalCount > 0
                    ? ((count5 / totalCount) * 100).toFixed(2)
                    : "0.00",
            avg: avgPity5,
            winRate: winRate5,
        },
    ];

    // Current Pity
    $: currentPity6 = (() => {
        if (rawPulls.length === 0) return 0;
        const sorted = [...rawPulls].sort(
            (a, b) => new Date(a.time) - new Date(b.time),
        );
        let count = 0;
        for (let i = sorted.length - 1; i >= 0; i--) {
            if (sorted[i].rarity === 6) break;
            count++;
        }
        return count;
    })();

    $: currentPity5 = (() => {
        if (rawPulls.length === 0) return 0;
        const sorted = [...rawPulls].sort(
            (a, b) => new Date(a.time) - new Date(b.time),
        );
        let count = 0;
        for (let i = sorted.length - 1; i >= 0; i--) {
            if (sorted[i].rarity >= 5) break;
            count++;
        }
        return count;
    })();

    $: avgPity6 = (() => {
        const won6 = tableData.filter((p) => p.rarity === 6);
        if (won6.length === 0) return 0;
        const sum = won6.reduce((acc, curr) => acc + (curr.pity || 0), 0);
        return (sum / won6.length).toFixed(1);
    })();

    // Average Pity for 5*
    $: avgPity5 = (() => {
        const won5 = tableData.filter((p) => p.rarity === 5);
        if (won5.length === 0) return 0;
        const sum = won5.reduce((acc, curr) => acc + (curr.pity || 0), 0);
        return (sum / won5.length).toFixed(1);
    })();

    // Get current banner info
    $: currentBanner = (() => {
        const candidates = banners.filter((b) => b.type === bannerType);
        return candidates.sort(
            (a, b) => new Date(b.startTime) - new Date(a.startTime),
        )[0];
    })();

    $: isSpecialBanner = bannerType === "special";
    $: featured6List = currentBanner?.featured6 || [];
    $: featured5List = currentBanner?.featured5 || [];

    // 6* guarantee for special banner
    $: guarantee6 = (() => {
        if (!isSpecialBanner || rawPulls.length === 0) return 0;

        const sorted = [...rawPulls].sort(
            (a, b) => new Date(a.time) - new Date(b.time),
        );
        let count = 0;

        for (let i = sorted.length - 1; i >= 0; i--) {
            const pull = sorted[i];

            if (pull.rarity === 6) {
                const normName = normalize(pull.name);
                const isFeatured = featured6List.some((featuredId) => {
                    const featuredChar = characters[featuredId];
                    return (
                        featuredChar &&
                        normalize(featuredChar.name) === normName
                    );
                });

                if (isFeatured) break;
            }
            count++;
        }
        return count;
    })();

    // 50/50 win rate for 6*
    $: winRate6 = (() => {
        if (count6 === 0) return { won: 0, total: 0, percent: 0 };

        let won = 0;
        let total = 0;
        let lastWasFeatured = true;

        const sorted = [...rawPulls].sort(
            (a, b) => new Date(a.time) - new Date(b.time),
        );

        for (const pull of sorted) {
            if (pull.rarity === 6) {
                const normName = normalize(pull.name);
                const isFeatured = featured6List.some((featuredId) => {
                    const featuredChar = characters[featuredId];
                    return (
                        featuredChar &&
                        normalize(featuredChar.name) === normName
                    );
                });

                if (lastWasFeatured) {
                    total++;
                    if (isFeatured) won++;
                }

                lastWasFeatured = isFeatured;
            }
        }

        return {
            won,
            total,
            percent: total > 0 ? ((won / total) * 100).toFixed(0) : 0,
        };
    })();

    // 50/50 win rate for 5*
    $: winRate5 = (() => {
        // [ИЗМЕНЕНИЕ] Если список featured5 пуст, не считаем статистику
        if (count5 === 0 || featured5List.length === 0) return { won: 0, total: 0, percent: 0 };

        let won = 0;
        let total = 0;
        let lastWasFeatured = true;

        const sorted = [...rawPulls].sort(
            (a, b) => new Date(a.time) - new Date(b.time),
        );

        for (const pull of sorted) {
            if (pull.rarity === 5) {
                // Здесь можно добавить доп. проверку на конкретный баннер крутки,
                // но для общей статистики обычно берется текущий контекст.
                // Если хочешь супер-точность по истории, нужно проверять баннер каждой крутки,
                // но пока оставим как есть, опираясь на featured5List текущего баннера.
                
                const normName = normalize(pull.name);
                const isFeatured = featured5List.some((featuredId) => {
                    const featuredChar = characters[featuredId];
                    return (
                        featuredChar &&
                        normalize(featuredChar.name) === normName
                    );
                });

                if (lastWasFeatured) {
                    total++;
                    if (isFeatured) won++;
                }

                lastWasFeatured = isFeatured;
            }
        }

        return {
            won,
            total,
            percent: total > 0 ? ((won / total) * 100).toFixed(0) : 0,
        };
    })();

    function getRarityColor(rarity) {
        if (rarity === 6) return "#D0926E";
        if (rarity === 5) return "#E3BC55";
        if (rarity === 4) return "#9C62F6";
        return "#888";
    }

    function getRarityBgColor(rarity) {
        if (rarity === 6) return "#D0926E33";
        if (rarity === 5) return "#E3BC5533";
        if (rarity === 4) return "#9C62F633";
        return "#F3F4F6";
    }

    function getRowBackground(rarity) {
        if (rarity === 6)
            return "linear-gradient(to left, rgba(208, 146, 110, 0.2) 0%, rgba(208, 146, 110, 0.0) 100%)";
        if (rarity === 5)
            return "linear-gradient(to left, rgba(227, 188, 85, 0.2) 0%, rgba(227, 188, 85, 0.0) 100%)";
        return "transparent";
    }

    // Updated banner finder
    function getBannerForPull(pullTime, type) {
        const pTime = new Date(pullTime).getTime();

        // Фильтруем баннеры по типу (special, standard и т.д.)
        const candidates = banners.filter((b) => b.type === type);

        // Сначала пытаемся найти строго по дате
        let found = candidates.find((b) => {
            const start = new Date(b.startTime).getTime();
            const end = b.endTime ? new Date(b.endTime).getTime() : Infinity;
            return pTime >= start && pTime <= end;
        });

        // Если по дате не нашли (например, крутка была между баннерами или даты не совпали),
        // берем самый актуальный баннер, который был ЗАПУЩЕН на момент крутки или ранее
        if (!found) {
            found = candidates
                .filter((b) => new Date(b.startTime).getTime() <= pTime)
                .sort(
                    (a, b) => new Date(b.startTime) - new Date(a.startTime),
                )[0];
        }

        return found;
    }
</script>

<div class="max-w-[1600px] justify-start min-h-screen">
    <!-- HEADER -->
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
        <h2
            class="font-sdk text-5xl tracking-wide text-[#21272C] flex items-center gap-3"
        >
            {$t("page.title")}
            <span class="text-gray-400 text-3xl font-normal">
                / {$t(`bannerTypes.${bannerType}`)}
            </span>
        </h2>
    </div>

    <!-- MAIN CONTAINER -->
    <div
        class="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_480px] 2xl:grid-cols-[minmax(0,1fr)_680px] gap-6 items-start"
    >
        <!-- ПРАВАЯ КОЛОНКА: СТАТИСТИКА -->
        <div class="flex flex-col gap-6 w-full order-1 xl:order-2 min-w-0">
            <!-- ВЕРХНИЕ КАРТОЧКИ (2 в ряд) -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- 1. ИНФО О КРУТКАХ -->
                <div
                    class="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
                >
                    <div class="space-y-3">
                        <div class="flex justify-between items-center">
                            <span class="text-gray-600"
                                >{$t("page.banner.total")}</span
                            >
                            <span
                                class="font-bold text-xl font-nums text-[#21272C]"
                                >{totalCount}</span
                            >
                        </div>

                        <div class="flex justify-between items-center">
                            <span class="text-gray-600"
                                >{$t("page.banner.spent")}</span
                            >
                            <span
                                class="font-bold text-gray-900 flex items-center gap-2 font-nums text-xl"
                            >
                                <Images
                                    id="oroberyl"
                                    variant="currency"
                                    size={25}
                                />
                                {spent}
                            </span>
                        </div>

                        <!-- 6★ Pity -->
                        <div class="flex justify-between items-center">
                            <div class="flex items-center gap-1 text-gray-600">
                                <span class="font-bold">6</span>
                                <Icon name="star" class="w-4 h-4" />
                                <span>{$t("page.banner.pity6")}</span>
                            </div>
                            <span
                                class="font-bold text-xl font-nums text-[#21272C]"
                            >
                                {currentPity6}<span
                                    class="text-sm text-gray-400">/80</span
                                >
                            </span>
                        </div>

                        <!-- 6★ Guarantee (special banner only) -->
                        {#if isSpecialBanner}
                            <div class="flex justify-between items-center">
                                <div
                                    class="flex items-center gap-1 text-gray-600"
                                >
                                    <span class="font-bold">6</span>
                                    <Icon name="star" class="w-4 h-4" />
                                    <span>{$t("page.banner.guarantee")}</span>
                                </div>
                                <span
                                    class="font-bold text-xl font-nums text-[#21272C]"
                                >
                                    {guarantee6}<span
                                        class="text-sm text-gray-400">/120</span
                                    >
                                </span>
                            </div>
                        {/if}

                        <!-- 5★ Pity -->
                        <div class="flex justify-between items-center">
                            <div class="flex items-center gap-1 text-gray-600">
                                <span class="font-bold">5</span>
                                <Icon name="star" class="w-4 h-4" />
                                <span>{$t("page.banner.pity5")}</span>
                            </div>
                            <span
                                class="font-bold text-xl font-nums text-[#21272C]"
                            >
                                {currentPity5}<span
                                    class="text-sm text-gray-400">/10</span
                                >
                            </span>
                        </div>
                    </div>
                </div>

                <!-- 2. ИНФО О РЕДКОСТИ -->
                <div
                    class="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
                >
                    <!-- Заголовок "Статистика" -->
                    <h4 class="font-bold text-sm mb-2 text-[#21272C]">
                        {$t("page.banner.stats")}
                    </h4>

                    <!-- Table header -->
                    <div
                        class="grid grid-cols-4 text-xs text-gray-500 mb-1 font-medium"
                    >
                        <div>{$t("page.banner.rarity")}</div>
                        <div class="text-right">{$t("page.banner.count")}</div>
                        <div class="text-right">
                            {$t("page.banner.percent")}
                        </div>
                        <div class="text-right">{$t("page.banner.avg")}</div>
                    </div>

                    <!-- Table rows -->
                    {#each stats as row}
                        <div class="border-b border-gray-50 last:border-0">
                            <!-- Main row -->
                            <div
                                class="grid grid-cols-4 text-sm items-center py-1"
                            >
                                <div
                                    class="font-bold text-gray-700 flex items-center gap-1 font-nums"
                                >
                                    {row.label}
                                    <Icon name="star" class="w-4 h-4" />
                                </div>
                                <div
                                    class="text-right font-bold font-nums text-[#21272C]"
                                >
                                    {row.count}
                                </div>
                                <div class="text-right text-gray-600 font-nums">
                                    {row.percent}%
                                </div>
                                <div
                                    class="text-right font-bold font-nums text-[#1D6F42]"
                                >
                                    {row.avg}
                                </div>
                            </div>

                            <!-- Win rate sub-row (only for special banners) -->
                            {#if isSpecialBanner && row.winRate.total > 0}
                                <div
                                    class="grid grid-cols-4 text-sm items-center py-1"
                                >
                                    <div class="text-gray-600 text-xs pl-2">
                                        {$t("page.banner.won5050")}
                                    </div>
                                    <div
                                        class="text-right font-nums text-[#21272C]"
                                    >
                                        {row.winRate.won}
                                    </div>
                                    <div
                                        class="text-right text-gray-600 font-nums"
                                    >
                                        {row.winRate.percent}%
                                    </div>
                                    <div class="text-right"></div>
                                </div>
                            {/if}
                        </div>
                    {/each}
                </div>
            </div>

            <!-- ГРАФИКИ (Charts) -->
            <!-- min-w-0 критически важен для адаптивности chart.js/echarts внутри grid/flex -->
            <div class="min-w-0">
                <AnalyticsCharts {rawPulls} {bannerType} />
            </div>
        </div>

        <!-- ЛЕВАЯ КОЛОНКА: ТАБЛИЦА -->
        <!-- order-2: Внизу на мобильных -->
        <!-- xl:order-1: Слева на десктопе -->
        <div
            class="w-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden order-2 xl:order-1"
        >
            <!-- Заголовок таблицы -->
            <div
                class="grid gap-2 px-4 py-3 border-b border-gray-100 bg-white text-sm font-bold text-gray-700"
                style="grid-template-columns: 40px 40px minmax(140px, 1fr) 60px 130px 80px;"
            >
                <div class="whitespace-nowrap text-center">
                    {$t("systemNames.pull")}
                </div>
                <Tooltip text={$t("systemNames.rarity")} class="justify-center">
                    <div
                        class="whitespace-nowrap flex items-center justify-center"
                        title={$t("systemNames.rarity")}
                    >
                        <Icon name="star" class="w-4 h-4" />
                    </div>
                </Tooltip>
                <div class="whitespace-nowrap">
                    {$t("systemNames.operator")}
                </div>
                <div class="flex items-center justify-center whitespace-nowrap">
                    {$t("systemNames.pity")}
                </div>
                <div class="whitespace-nowrap">{$t("systemNames.date")}</div>
                <div class="text-right whitespace-nowrap">
                    {$t("systemNames.banner")}
                </div>
            </div>

            <!-- Тело таблицы -->
            <div>
                {#if totalCount === 0}
                    <div class="h-64 flex flex-col items-center justify-center text-gray-400">
                        <Icon name="noData" class="w-4 h-4" />
                        <p class="text-sm">
                            {$t("emptyState.noData") || "Нет данных"}
                        </p>
                    </div>
                {:else}
                    {#each tableData as row, index}
                        {@const currentBanner = getBannerForPull(
                            row.time,
                            bannerType,
                        )}
                        {@const charData = charMap[normalize(row.name)]}

                        <div
                            class="grid gap-2 items-center px-4 py-2 text-sm border-b border-gray-50 last:border-0 hover:bg-gray-50 transition relative"
                            style="grid-template-columns: 40px 40px minmax(140px, 1fr) 60px 130px 80px; background: {getRowBackground(
                                row.rarity,
                            )}"
                        >
                            <div class="font-nums text-gray-400 text-xs text-center justify-center flex items-center">
                                {totalCount - index}
                            </div>

                            <div
                                class="text-lg flex items-center justify-center font-nums"
                                style="color: {getRarityColor(row.rarity)}"
                            >
                                {row.rarity}
                            </div>

                            <div class="flex items-center min-w-0 pr-2">
                                <div class="relative inline-flex items-center max-w-full">
                                    
                                    <div class="relative z-10 flex-shrink-0">
                                        <div
                                            class="w-10 h-10 rounded-full overflow-hidden border-2 bg-white shadow-sm relative group"
                                            style="border-color: {getRarityColor(row.rarity)}"
                                        >
                                            {#if charData?.icon}
                                                <img
                                                    src={charData.icon}
                                                    alt={row.name}
                                                    class="w-full h-full object-cover transform scale-110"
                                                    loading="lazy"
                                                />
                                            {:else}
                                                <div class="w-full h-full flex items-center justify-center text-xs text-gray-400 font-bold bg-gray-50">
                                                    {row.name ? row.name.charAt(0).toUpperCase() : "?"}
                                                </div>
                                            {/if}
                                        </div>

                                        {#if row.isNew}
                                            <div class="absolute -top-1 -right-1 bg-[#D84C38]/85 text-white text-[8px] leading-none font-bold px-1.5 py-0.5 rounded-md z-20 pointer-events-none backdrop-blur-[1px]">
                                                NEW
                                            </div>
                                        {/if}
                                    </div>

                                    <div
                                        class="relative bg-transparent -ml-5 pl-7 pr-3 rounded-r-full border-y-2 border-r-2 border-l-0 min-w-0 max-w-[150px] bg-white/50"
                                        style="border-color: {getRarityColor(row.rarity)}; height: 40px; display: flex; align-items: center;"
                                    >
                                        <span
                                            class="text-gray-800 text-sm font-medium leading-none block w-full pt-[1px] z-10 truncate"
                                            title={row.name}
                                        >
                                            {$t(`characters.${charData?.id || normalize(row.name)}`) || row.name}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div
                                class="flex items-center justify-center font-nums text-base gap-1"
                                style="color: {getRarityColor(row.rarity)}"
                            >
                                <span>{row.pity || 1}</span>

                                {#if row.rarity >= 5 && row.status && row.status !== "normal" && row.status !== "unknown"}
                                    {#if row.status === "won"}
                                        {#if bannerType !== "standard" && bannerType !== "new-player"}
                                            <Tooltip textKey="status.won">
                                                <span class="ml-1 flex-shrink-0 inline-flex">
                                                    <Icon name="star" class="w-4 h-4" />
                                                </span>
                                            </Tooltip>
                                        {/if}
                                    {:else if row.status === "lost"}
                                        <Tooltip textKey="status.lost">
                                            <span class="ml-1 flex-shrink-0 inline-flex">
                                                <Icon name="lost" class="w-4 h-4" />
                                            </span>
                                        </Tooltip>
                                    {:else if row.status === "guaranteed"}
                                        <Tooltip textKey="status.guaranteed">
                                            <span class="ml-1 flex-shrink-0 inline-flex">
                                                <Icon name="guaranteed" class="w-4 h-4" />
                                            </span>
                                        </Tooltip>
                                    {/if}
                                {/if}
                            </div>

                            <div class="text-gray-500 font-nums text-xs whitespace-nowrap">
                                {new Date(row.time).toLocaleString("ru-RU")}
                            </div>

                            <div class="flex justify-end">
                                {#if currentBanner}
                                    <button
                                        class="group relative h-10 w-20 rounded shadow-sm border border-gray-200 overflow-hidden hover:ring-2 hover:ring-[#D0926E] transition-all focus:outline-none"
                                        on:click={() => (selectedBanner = currentBanner)}
                                        title={$t(`banners.${currentBanner.id}`) || currentBanner.name}
                                    >
                                        <img
                                            src={currentBanner.miniIcon}
                                            alt={currentBanner.name}
                                            class="h-full w-full object-cover transition-transform group-hover:scale-110"
                                        />
                                        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                                    </button>
                                {:else}
                                    <div class="h-6 w-12 bg-gray-50 rounded border border-gray-100 flex items-center justify-center">
                                        <span class="text-[10px] text-gray-300">-</span>
                                    </div>
                                {/if}
                            </div>
                        </div>
                    {/each}
                {/if}
            </div>
        </div>
    </div>
</div>
<!-- Модалка Баннера -->
<BannerModal banner={selectedBanner} on:close={() => (selectedBanner = null)} />

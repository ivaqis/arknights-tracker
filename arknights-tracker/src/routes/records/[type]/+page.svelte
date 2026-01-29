<!-- src/routes/records/[type]/+page.svelte -->
<script>
    import { page } from "$app/stores";
    import { t } from "$lib/i18n";
    import { pullData } from "$lib/stores/pulls";
    import { bannerTypes } from "$lib/data/bannerTypes";
    import { characters } from "$lib/data/characters";
    import { weapons } from "$lib/data/weapons";
    import { banners } from "$lib/data/banners";
    import { goto } from "$app/navigation";
    import { currencies } from "$lib/data/items/currencies";
    import Button from "$lib/components/Button.svelte";
    import Icon from "$lib/components/Icons.svelte";
    import Tooltip from "$lib/components/Tooltip.svelte";
    import BannerModal from "$lib/components/BannerModal.svelte";
    import AnalyticsCharts from "$lib/components/AnalyticsCharts.svelte";
    import Images from "$lib/components/Images.svelte";

    $: bannerType = $page.params.type;
    let selectedBanner = null;
    $: bannerData = $pullData[bannerType] || { pulls: [], stats: {} };
    $: rawPulls = bannerData.pulls || [];
    $: stats = bannerData.stats || {};
    $: isNewPlayer = bannerType === "new-player" || bannerType === "new_player";
    $: isSpecialBanner = bannerType === "special";

    $: mileage = stats.mileage || {
        show: false,
        current: 0,
        max: 0,
        label: "",
    };

    // [NEW] Прогресс гаранта оружия (теперь он лежит в guarantee120, но только для оружия)
    $: weaponGuaranteeProgress = stats.guarantee120 || 0;
    $: hasReceivedRateUp = stats.hasReceivedRateUp || false;

    // [NEW] Хелпер для определения типа оружия (стандартное или нет)
    $: isStandardWeapon = bannerType.includes("constant");

    // [NEW] Функция перевода лейблов (копия из BannerCard)
    function getMileageLabel(label) {
        if (label === "selector_6") return $t("stats.selector") || "Selector";
        if (label === "guaranteed_6")
            return $t("stats.guaranteed") || "Guaranteed";
        if (label === "bonus_copy_6")
            return $t("stats.bonus_copy") || "Bonus Copy";
        return label;
    }

    // Определяем типы
    $: isWeaponType =
        bannerType.includes("weap") || bannerType.includes("wepon");
    $: hasRateUp =
        bannerType === "special" ||
        (isWeaponType && !bannerType.includes("constant"));
    $: maxPity6 = isNewPlayer ? 40 : 80;

    $: statsBannerStub = {
        id: "summary",
        type: bannerType, // special, standard, etc.
        featured6: [], // Для общей сводки сложно передать всех featured
        featured5: [],
    };

    const normalize = (str) => str?.toLowerCase().replace(/\s+/g, "") || "";

    const itemMap = { ...characters, ...weapons };

    const lookupMap = Object.values(itemMap).reduce((acc, item) => {
        if (item.name) acc[normalize(item.name)] = item;
        if (item.id) acc[normalize(item.id)] = item;
        return acc;
    }, {});

    $: totalCount = stats.total || rawPulls.length || 0;
    $: spent = (totalCount * 500).toLocaleString("ru-RU");
    $: currentPity6 = stats.pity6 || 0;
    $: currentPity5 = stats.pity5 || 0;
    $: guarantee6 = stats.guarantee120 || 0;
    $: progress120 = stats.guarantee120 || 0;
    $: left120 = Math.max(0, 120 - progress120);

    $: statsRows = [
        {
            label: "6",
            count: stats.count6 || 0,
            percent: stats.percent6 || "0.00",
            avg: stats.avg6 || "0.0",
            // Для 6* берем winRate из стора
            winRate: stats.winRate || { won: 0, total: 0, percent: 0 },
        },
        {
            label: "5",
            count: stats.count5 || 0,
            percent: stats.percent5 || "0.00",
            avg: stats.avg5 || "0.0",
            // Для 5* winRate обычно не так важен или не считается в сторе глобально,
            // можно оставить пустым или вернуть ручной расчет, если критично.
            winRate: { won: 0, total: 0, percent: 0 },
        },
    ];

    // [FIX] Контекстно-зависимый поиск
    function getBannerForPull(pullTime, pageType, itemName = null) {
        const pTime = new Date(pullTime).getTime();
        const pType = pageType.toLowerCase(); // ID страницы (например weaponbox_constant_3)

        // 1. Фильтры типов (как было)
        const isWeaponPage = pType.includes("weap") || pType.includes("wepon");
        const isNewPlayerPage =
            pType.includes("new-player") || pType.includes("new_player");
        const isStandardPage =
            (pType.includes("standard") || pType.includes("constant")) &&
            !isNewPlayerPage;

        const candidates = banners.filter((b) => {
            const bId = (b.id || "").toLowerCase();
            const bType = (b.type || "").toLowerCase();

            const isBannerWeapon =
                bType === "weapon" ||
                bId.includes("weap") ||
                bId.includes("wepon");
            if (isWeaponPage !== isBannerWeapon) return false;

            const isBannerNewPlayer =
                bType === "new-player" || bId.includes("new_player");
            if (isNewPlayerPage) return isBannerNewPlayer;
            if (isBannerNewPlayer) return false;

            const isBannerStandard =
                bType === "standard" ||
                bType === "constant" ||
                bId.includes("constant") ||
                bId.includes("standard");
            if (isStandardPage) return isBannerStandard;
            return !isBannerStandard;
        });

        // 2. Фильтр по времени
        let matches = candidates.filter((b) => {
            const start = new Date(b.startTime).getTime();
            const end = b.endTime ? new Date(b.endTime).getTime() : Infinity;
            return pTime >= start && pTime <= end;
        });

        // --- ЛОГИКА ВЫБОРА ---

        // Если найдено много баннеров (твой случай с 5 пушками)
        if (matches.length > 1) {
            // ШАГ 1: Пытаемся найти по уникальному 6* оружию
            if (itemName) {
                const normName = normalize(itemName);
                const itemObj = lookupMap[normName];
                const searchId = itemObj ? itemObj.id : normName;

                const exactMatch = matches.find((b) => {
                    if (!b.featured6) return false;
                    // Проверяем, есть ли этот предмет в featured6
                    return b.featured6.some((fid) => {
                        const nFid = normalize(fid);
                        const nSearch = normalize(searchId);
                        return (
                            nFid === nSearch ||
                            nFid.includes(nSearch) ||
                            nSearch.includes(nFid)
                        );
                    });
                });
                // Если выпала лега из конкретного баннера - показываем его
                if (exactMatch) return exactMatch;
            }

            // ШАГ 2 (FIX): Если точного предмета нет (это 3-4*),
            // проверяем, находимся ли мы прямо сейчас на странице одного из этих баннеров?
            // pageType = "weaponbox_constant_3", и этот ID есть в matches
            const contextMatch = matches.find((b) => b.id === pageType);
            if (contextMatch) {
                return contextMatch;
            }

            // ШАГ 3: Сортировка по умолчанию (если мы на странице "Все", а не конкретного)
            matches.sort((a, b) => {
                const durationA =
                    new Date(a.endTime || "2099-01-01").getTime() -
                    new Date(a.startTime).getTime();
                const durationB =
                    new Date(b.endTime || "2099-01-01").getTime() -
                    new Date(b.startTime).getTime();
                if (durationA !== durationB) return durationA - durationB;
                return new Date(b.startTime) - new Date(a.startTime);
            });
            return matches[0];
        }

        // Fallback для одного кандидата или когда время не совпало
        const pastBanners = candidates
            .filter((b) => new Date(b.startTime).getTime() <= pTime)
            .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

        return pastBanners[0];
    }
    // Helpers для стилей
    function getRarityColor(rarity) {
        if (rarity === 6) return "#D0926E";
        if (rarity === 5) return "#E3BC55";
        if (rarity === 4) return "#9C62F6";
        return "#888";
    }

    function getRowBackground(rarity) {
        if (rarity === 6)
            return "linear-gradient(to left, rgba(240, 130, 100, 0.2) 0%, rgba(208, 146, 110, 0.0) 100%)";
        if (rarity === 5)
            return "linear-gradient(to left, rgba(227, 188, 85, 0.2) 0%, rgba(227, 188, 85, 0.0) 100%)";
        return "transparent";
    }

    const isFeatured = (itemName, banner, rarity) => {
        if (!banner) return false;
        const list = rarity === 6 ? banner.featured6 : banner.featured5;
        if (!list || !Array.isArray(list)) return false;
        const normName = normalize(itemName);
        return list.some((f) => {
            const normF = normalize(f);
            // Ищем ID предмета по имени, если само имя не совпало
            return (
                normF === normName ||
                normF === normalize(lookupMap[normName]?.id)
            );
        });
    };

    // Генерация данных для таблицы (History Table)
    // Генерация данных для таблицы (History Table)
    $: tableData = (() => {
        // 1. Сортируем от старых к новым
        const sorted = [...rawPulls].sort(
            (a, b) => new Date(a.time) - new Date(b.time),
        );

        let p6 = 0,
            p5 = 0;
        let g6 = false,
            g5 = false;
        let bannerCounts = {};

        // Этап 1: Расчет Pity и статусов
        let processed = sorted.map((pull) => {
            const p = { ...pull };
            const banner = getBannerForPull(p.time, bannerType);
            const bid = banner ? banner.id : "other";

            // -- FREE PULL LOGIC --
            if (!bannerCounts[bid]) bannerCounts[bid] = 0;
            let isFree = false;
            if (
                banner &&
                banner.type === "special" &&
                bannerCounts[bid] >= 30 &&
                bannerCounts[bid] < 40
            ) {
                isFree = true;
            }
            p.isFree = isFree;
            bannerCounts[bid]++;

            // -- PITY CALCULATION --
            if (!isFree) {
                if (p.rarity === 6) {
                    p.pity = p6 + 1;
                    p6 = 0;
                    p5++;
                } else if (p.rarity === 5) {
                    p.pity = p5 + 1;
                    p5 = 0;
                    p6++;
                } else {
                    p6++;
                    p5++;
                    // [FIX] Для 3* и 4* всегда пишем 1
                    p.pity = 1;
                }
            } else {
                // Если бесплатно, пишем 1 (или можно "-", как хочешь)
                // Но ты просил "значения как было", так что для 3-4* это 1.
                p.pity = 1;
            }

            // -- STATUS --
            if (p.rarity >= 5) {
                if (bannerType === "standard" || bannerType === "new-player") {
                    p.status = "normal";
                } else if (!banner) {
                    p.status = "won";
                } else {
                    const hasFeatured5 =
                        banner.featured5 && banner.featured5.length > 0;
                    if (p.rarity === 5 && !hasFeatured5) {
                        p.status = "normal";
                    } else {
                        const featured = isFeatured(p.name, banner, p.rarity);
                        const isG = p.rarity === 6 ? g6 : g5;
                        if (featured) {
                            p.status = isG ? "guaranteed" : "won";
                            if (!isFree) {
                                if (p.rarity === 6) g6 = false;
                                else g5 = false;
                            }
                        } else {
                            p.status = "lost";
                            if (!isFree) {
                                if (p.rarity === 6) g6 = true;
                                else g5 = true;
                            }
                        }
                    }
                }
            } else {
                p.status = "normal";
            }

            return p;
        });

        // Этап 2: Группировка 10-пуллов (Batch)
        let batches = [];
        let currentBatch = [];

        processed.forEach((p, i) => {
            const prev = processed[i - 1];
            // Сравниваем время (строгое равенство)
            if (
                prev &&
                new Date(prev.time).getTime() !== new Date(p.time).getTime()
            ) {
                batches.push(currentBatch);
                currentBatch = [];
            }
            currentBatch.push(p);
        });
        if (currentBatch.length) batches.push(currentBatch);

        // Проставляем флаги
        batches.forEach((batch) => {
            // Считаем пачкой, если 10 элементов (или больше/меньше, если логика игры позволяет)
            // Обычно x10 это ровно 10, но поставим >= 2 для надежности группировки по времени
            if (batch.length >= 2) {
                const midIndex = Math.floor((batch.length - 1) / 2);
                batch.forEach((p, i) => {
                    p.isBatch = true;
                    // В хронологическом порядке:
                    // i=0 (Start) -> Это будет НИЗ в таблице (т.к. таблица reversed)
                    // i=max (End) -> Это будет ВЕРХ в таблице
                    p.batchStart = i === 0;
                    p.batchEnd = i === batch.length - 1;
                    p.showBatchLabel = i === midIndex;
                });
            }
        });

        return processed.reverse();
    })();

    function getWeaponBg(rarity) {
        if (rarity === 6) return "bg-gradient-to-t from-[#591C00] to-[#BD896E]"; // Твой цвет для 6*
        if (rarity === 5) return "bg-gradient-to-t from-[#261E00] to-[#E3BC55]"; // Темно-золотой для 5*
        if (rarity === 4) return "bg-gradient-to-t from-[#1A002E] to-[#9C62F6]"; // Темно-фиолетовый для 4*
        return "bg-gradient-to-t from-[#1a1a1a] to-[#666666]"; // Серый для 3*
    }

    $: homeBanners = [...bannerTypes]
        .filter((b) => b.showOnHome)
        .sort((a, b) => a.order - b.order);

    // [NEW] Хелпер для получения пути к картинке баннера (как в BannerCard)
    function getBannerImage(id) {
        const b = banners.find((x) => x.id === id);
        if (!b) return null;

        // --- 1. СПЕЦИФИЧЕСКИЕ ИСПРАВЛЕНИЯ (HARDCODE) ---

        // Исправление для Лаватейн (у тебя файл .jpg)
        if (id === "laevatain-banner") {
            return "/images/banners/miniIcon/laevatain-banner.jpg";
        }

        // Исправление для Стандартного Оружия
        // Если ID баннера содержит 'constant' (например 'weapon_constant_01')
        // А файлы называются 'weaponbox_constant_1.png'
        if (id.includes("constant")) {
            // Извлекаем цифру из ID (01 -> 1)
            const num = id.replace(/[^0-9]/g, "");
            const cleanNum = parseInt(num, 10); // Убираем ведущий ноль
            return `/images/banners/miniIcon/weaponbox_constant_${cleanNum}.png`;
        }

        // Исправление для Ивентового Оружия
        // Если это оружие, но не стандарт (например 'weponbox_1_0_1')
        // Ставим общую заглушку weapon_01.png, которая есть у тебя в папке
        if (id.includes("wepon") || id.includes("weapon")) {
            return "/images/banners/miniIcon/weapon_01.png";
        }

        // --- 2. ОБЫЧНАЯ ЛОГИКА ---

        // Если в конфиге banners.js уже прописано точное имя файла
        if (b.miniIcon) {
            return `/images/banners/miniIcon/${b.miniIcon}`;
        }

        // Fallback: Пробуем найти по ID + .png
        return `/images/banners/miniIcon/${b.id}.png`;
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
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                    class="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
                >
                    <div class="space-y-3">
    <div class="flex justify-between items-center">
        <span class="text-gray-600">{$t("page.banner.total")}</span>
        <span class="font-bold text-xl font-nums text-[#21272C]">
            {totalCount}
        </span>
    </div>

    {#if !isNewPlayer && !isWeaponType}
        <div class="flex justify-between items-center">
            <span class="text-gray-600">{$t("page.banner.spent")}</span>
            <span class="font-bold text-gray-900 flex items-center gap-2 font-nums text-xl">
                <Images
                    id="oroberyl"
                    variant="currency"
                    size={25}
                />
                {spent}
            </span>
        </div>
    {/if}

    <div class="flex justify-between items-center">
        <div class="flex items-center gap-1 text-gray-600">
            <span class="font-bold">6</span>
            <Icon name="star" class="w-4 h-4" />
            <span>{$t("page.banner.pity6")}</span>
        </div>
        <span class="font-bold text-xl font-nums text-[#21272C]">
            {currentPity6}<span class="text-sm text-gray-400">/{maxPity6}</span>
        </span>
    </div>

    {#if mileage.show}
        <div class="flex justify-between items-center">
            <div class="flex items-center gap-1 text-gray-600">
                <span class="font-bold">6</span>
                <Icon name="star" class="w-4 h-4" />
                <span>{getMileageLabel(mileage.label)}</span>
            </div>
            <span class="font-bold text-xl font-nums text-[#21272C]">
                {mileage.current}<span class="text-sm text-gray-400">/{mileage.max}</span>
            </span>
        </div>
    {/if}

    {#if isWeaponType && !hasReceivedRateUp}
        <div class="flex justify-between items-center">
            <div class="flex items-center gap-1 text-gray-600">
                <span class="font-bold">6</span>
                <Icon name="star" class="w-4 h-4" />
                <span>{$t("page.banner.guarantee_rateup")}</span>
            </div>
            <span class="font-bold text-xl font-nums text-[#21272C]">
                {weaponGuaranteeProgress}<span class="text-sm text-gray-400">/80</span>
            </span>
        </div>
    {/if}

    <div class="flex justify-between items-center">
        <div class="flex items-center gap-1 text-gray-600">
            <span class="font-bold">5</span>
            <Icon name="star" class="w-4 h-4" />
            <span>{$t("page.banner.pity5")}</span>
        </div>
        <span class="font-bold text-xl font-nums text-[#21272C]">
            {currentPity5}<span class="text-sm text-gray-400">/10</span>
        </span>
    </div>
</div>
                </div>

                <div
                    class="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
                >
                    <h4 class="font-bold text-sm mb-2 text-[#21272C]">
                        {$t("page.banner.stats")}
                    </h4>

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

                    {#each statsRows as row}
                        <div class="border-b border-gray-50 last:border-0">
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

                            {#if hasRateUp && row.winRate.total > 0}
                                <div
                                    class="grid grid-cols-4 text-sm items-center py-1"
                                >
                                    <div class="text-gray-600 text-xs pl-2">
                                        {$t("page.banner.won5050")}
                                    </div>

                                    <div
                                        class="text-right font-nums text-[#21272C]"
                                    >
                                        {row.winRate.won}/{row.winRate.total}
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
                class="grid gap-2 px-4 py-3 border-b border-gray-100 bg-white text-sm font-bold text-gray-700 pl-6"
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
                    <div
                        class="h-64 flex flex-col items-center justify-center text-gray-400"
                    >
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
                            row.name,
                        )}

                        {@const itemData = lookupMap[normalize(row.name)]}
                        {@const itemId = itemData?.id || normalize(row.name)}
                        {@const isWeapon =
                            (itemData && !!weapons[itemData.id]) ||
                            row.type === "weapon" ||
                            isWeaponType}
                        {@const bracketColor = row.isFree
                            ? "#5DBE5A"
                            : "#D0926E"}

                        <div class="relative group/row">
                            {#if row.isBatch}
                                {#if row.batchEnd}
                                    <div
                                        class="absolute left-[18px] top-1/2 bottom-0 w-[10px] border-l-2 border-t-2 z-20 pointer-events-none"
                                        style="border-color: {bracketColor};"
                                    ></div>
                                {:else if row.batchStart}
                                    <div
                                        class="absolute left-[18px] top-0 bottom-1/2 w-[10px] border-l-2 border-b-2 z-20 pointer-events-none"
                                        style="border-color: {bracketColor};"
                                    ></div>
                                {:else}
                                    <div
                                        class="absolute left-[18px] top-0 bottom-0 w-[10px] border-l-2 z-20 pointer-events-none"
                                        style="border-color: {bracketColor};"
                                    ></div>
                                {/if}

                                {#if row.showBatchLabel}
                                    <div
                                        class="absolute z-30 font-bold text-[10px] tracking-wider select-none pointer-events-none flex items-center justify-center whitespace-nowrap bg-white/90 backdrop-blur-[1px] py-1"
                                        style="
                                            left: 2px;
                                            top: 50%; 
                                            transform: translateY(-50%) rotate(180deg); 
                                            writing-mode: vertical-lr;
                                            color: {bracketColor};
                                            height: 120px;
                                            text-align: center;
                                        "
                                    >
                                        {row.isFree ? "FREE x10" : "x10"}
                                    </div>
                                {/if}
                            {/if}

                            <div
                                class="grid gap-2 items-center px-4 py-2 text-sm border-b border-gray-50 last:border-0 hover:bg-gray-50 transition relative pl-6"
                                style="grid-template-columns: 40px 40px minmax(140px, 1fr) 60px 130px 80px; background: {getRowBackground(
                                    row.rarity,
                                )}"
                            >
                                <div
                                    class="font-nums text-gray-400 text-xs text-center justify-center flex items-center"
                                >
                                    {totalCount - index}
                                </div>

                                <div
                                    class="text-lg flex items-center justify-center font-nums"
                                    style="color: {getRarityColor(row.rarity)}"
                                >
                                    {row.rarity}
                                </div>

                                <div class="flex items-center min-w-0 pr-2">
                                    <div
                                        class="relative inline-flex items-center max-w-full"
                                    >
                                        <div
                                            class="relative z-10 flex-shrink-0"
                                        >
                                            <div
                                                class="w-10 h-10 rounded-full overflow-hidden border-2 shadow-sm relative group
                                                {isWeapon
                                                    ? getWeaponBg(row.rarity)
                                                    : 'bg-white'}"
                                                style="border-color: {getRarityColor(
                                                    row.rarity,
                                                )}"
                                            >
                                                <Images
                                                    id={itemId}
                                                    variant={isWeapon
                                                        ? "weapon-icon"
                                                        : "operator-icon"}
                                                    alt={row.name}
                                                    className="w-full h-full object-cover transform {isWeapon
                                                        ? 'scale-[1.45]'
                                                        : 'scale-110'}"
                                                />
                                            </div>
                                            {#if row.isNew}
                                                <div
                                                    class="absolute -top-1 -right-1 bg-[#D84C38]/85 text-white text-[8px] leading-none font-bold px-1.5 py-0.5 rounded-md z-20 pointer-events-none backdrop-blur-[1px]"
                                                >
                                                    NEW
                                                </div>
                                            {/if}
                                        </div>
                                        <div
                                            class="relative bg-white/50 -ml-5 pl-7 pr-3 rounded-r-full border-y-2 border-r-2 border-l-0 min-w-0 max-w-[150px] flex items-center h-10"
                                            style="border-color: {getRarityColor(
                                                row.rarity,
                                            )}"
                                        >
                                            <span
                                                class="text-gray-800 text-sm font-medium leading-tight block w-full truncate"
                                                title={row.name}
                                            >
                                                {$t(
                                                    isWeapon
                                                        ? `weaponsList.${itemId}`
                                                        : `characters.${itemId}`,
                                                ) || row.name}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div
                                    class="flex items-center justify-center font-nums text-base gap-1"
                                    style="color: {getRarityColor(row.rarity)}"
                                >
                                    <span>{row.pity}</span>

                                    {#if row.rarity >= 5 && row.status && row.status !== "normal" && !row.isFree}
                                        {#if row.rarity === 6 || !isWeapon}
                                            {#if row.status === "won"}
                                                {#if !bannerType.includes("standard") && !bannerType.includes("new")}
                                                    <Tooltip
                                                        textKey="status.won"
                                                        ><Icon
                                                            name="star"
                                                            class="w-4 h-4 text-[#D0926E]"
                                                        /></Tooltip
                                                    >
                                                {/if}
                                            {:else if row.status === "lost"}
                                                <Tooltip textKey="status.lost"
                                                    ><Icon
                                                        name="lost"
                                                        class="w-4 h-4 text-[#D0926E]"
                                                    /></Tooltip
                                                >
                                            {:else if row.status === "guaranteed"}
                                                <Tooltip
                                                    textKey="status.guaranteed"
                                                    ><Icon
                                                        name="guaranteed"
                                                        class="w-4 h-4 text-[#D0926E]"
                                                    /></Tooltip
                                                >
                                            {/if}
                                        {/if}
                                    {/if}
                                </div>

                                <div
                                    class="text-gray-500 font-nums text-xs whitespace-nowrap"
                                >
                                    {new Date(row.time).toLocaleString("ru-RU")}
                                </div>

                                <div class="flex justify-end">
                                    {#if currentBanner}
                                        <button
                                            class="group relative h-10 w-20 rounded shadow-sm border border-gray-200 overflow-hidden hover:ring-2 hover:ring-[#D0926E] transition-all focus:outline-none bg-gray-100"
                                            on:click={() =>
                                                (selectedBanner =
                                                    currentBanner)}
                                            title={$t(
                                                `banners.${currentBanner.id}`,
                                            ) || currentBanner.name}
                                        >
                                            <img
                                                src={getBannerImage(
                                                    currentBanner.id,
                                                ) ||
                                                    "/images/banners/unknown.jpg"}
                                                alt={currentBanner.name}
                                                class="h-full w-full object-cover transition-transform group-hover:scale-110"
                                                on:error={(e) =>
                                                    (e.target.style.display =
                                                        "none")}
                                            />

                                            <div
                                                class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"
                                            ></div>
                                        </button>
                                    {:else}
                                        <div
                                            class="h-6 w-12 bg-gray-50 rounded border border-gray-100 flex items-center justify-center"
                                        >
                                            <span
                                                class="text-[10px] text-gray-300"
                                                >-</span
                                            >
                                        </div>
                                    {/if}
                                </div>
                            </div>
                        </div>
                    {/each}
                {/if}
            </div>
        </div>
    </div>
</div>
<!-- Модалка Баннера -->
<BannerModal
    banner={selectedBanner}
    pageContext={bannerType}
    on:close={() => (selectedBanner = null)}
/>

<!-- src/routes/records/[type]/+page.svelte -->
<script>
    import { page } from "$app/stores";
    import { t } from "$lib/i18n";
    import { pullData } from "$lib/stores/pulls";
    import { bannerTypes } from "$lib/data/bannerTypes";
    import { characters } from "$lib/data/characters";
    import { accountStore } from "$lib/stores/accounts";
    import { weapons } from "$lib/data/weapons";
    import { banners } from "$lib/data/banners";
    import { goto } from "$app/navigation";
    import { currencies } from "$lib/data/items/currencies";
    import { isDarkMode } from "$lib/stores/theme";
    import { onMount } from "svelte";
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
    $: weaponGuaranteeProgress = stats.guarantee120 || 0;
    $: hasReceivedRateUp = stats.hasReceivedRateUp || false;
    $: isStandardWeapon = bannerType.includes("constant");

    const { accounts, selectedId } = accountStore;

    $: currentAccount = $accounts.find((a) => a.id === $selectedId);
    $: currentServerId = currentAccount?.serverId || "3";
    $: serverOffset =
        currentServerId === "2" || currentServerId === "1" ? 8 : -5;

    function parseServerDate(dateStr) {
        if (!dateStr) return null;
        if (dateStr instanceof Date) return dateStr;
        if (dateStr.includes("Z") || dateStr.includes("+"))
            return new Date(dateStr);

        const offset = serverOffset;
        const sign = offset >= 0 ? "+" : "-";
        const pad = (n) => String(Math.abs(n)).padStart(2, "0");
        const isoStr = dateStr.replace(" ", "T") + `${sign}${pad(offset)}:00`;
        return new Date(isoStr);
    }

    onMount(() => {});
    function getMileageLabel(label) {
        if (label === "selector_6") return $t("stats.selector") || "Selector";
        if (label === "guaranteed_6")
            return $t("stats.guaranteed") || "Guaranteed";
        if (label === "bonus_copy_6")
            return $t("stats.bonus_copy") || "Bonus Copy";
        if (label === "arms_offering")
            return $t("stats.arms_offering") || "Arms Offering";
        if (label === "featured_guarantee")
            return $t("stats.featured_guarantee") || "Featured Wep.";
        return label;
    }

    $: isWeaponType =
        bannerType.includes("weap") || bannerType.includes("wepon");
    $: hasRateUp = bannerType === "special" || isWeaponType;
    $: maxPity6 = isNewPlayer ? 40 : 80;
    $: statsBannerStub = {
        id: "summary",
        type: bannerType,
        featured6: [],
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
    $: billableCount = tableData
        ? tableData.filter((p) => !p.isFree).length
        : 0;
    $: spent = (billableCount * 500).toLocaleString("ru-RU");
    $: currentPity6 = stats.pity6 || 0;
    $: currentPity5 = stats.pity5 || 0;
    $: guarantee6 = stats.guarantee120 || 0;
    $: progress120 = stats.guarantee120 || 0;
    $: left120 = Math.max(0, 120 - progress120);
    $: avg6 = stats.avg6 || "0.0";
    $: avg5 = stats.avg5 || "0.0";
    $: avg6Max = isWeaponType || isNewPlayer ? 40 : 80;
    $: avg5Max = 10;
    $: avgMax = 0;
    $: avg = 0;
    $: statsRows = [
        {
            label: "6",
            count: stats.count6 || 0,
            percent: stats.percent6 || "0.00",
            avg: avg6 || "0.0",
            winRate: stats.winRate || { won: 0, total: 0, percent: 0 },
            avgMax: avg6Max,
        },
        {
            label: "5",
            count: stats.count5 || 0,
            percent: stats.percent5 || "0.00",
            avg: avg5 || "0.0",
            winRate: { won: 0, total: 0, percent: 0 },
            avgMax: avg5Max,
        },
    ];

    function getBannerForPull(pullTime, pageType, itemName = null) {
        const pTime = new Date(pullTime).getTime();

        const pType = pageType.toLowerCase();
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

        let matches = candidates.filter((b) => {
            const start = parseServerDate(b.startTime).getTime();
            const end = b.endTime
                ? parseServerDate(b.endTime).getTime()
                : Infinity;

            return pTime >= start && pTime <= end;
        });

        if (matches.length > 1) {
            if (itemName) {
                const normName = normalize(itemName);
                const itemObj = lookupMap[normName];
                const searchId = itemObj ? itemObj.id : normName;
                const exactMatch = matches.find((b) => {
                    if (!b.featured6) return false;
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
                if (exactMatch) return exactMatch;
            }

            const contextMatch = matches.find((b) => b.id === pageType);
            if (contextMatch) return contextMatch;

            matches.sort((a, b) => {
                const durationA =
                    (a.endTime
                        ? parseServerDate(a.endTime).getTime()
                        : 4102444800000) -
                    parseServerDate(a.startTime).getTime();
                const durationB =
                    (b.endTime
                        ? parseServerDate(b.endTime).getTime()
                        : 4102444800000) -
                    parseServerDate(b.startTime).getTime();

                if (durationA !== durationB) return durationA - durationB;
                return (
                    parseServerDate(b.startTime) - parseServerDate(a.startTime)
                );
            });
            return matches[0];
        }

        const pastBanners = candidates
            .filter((b) => parseServerDate(b.startTime).getTime() <= pTime)
            .sort(
                (a, b) =>
                    parseServerDate(b.startTime) - parseServerDate(a.startTime),
            );

        return pastBanners[0];
    }

    function getRarityColor(rarity) {
        if (rarity === 6) return "#D97D48";
        if (rarity === 5) return "#E3BC55";
        if (rarity === 4) return "#9C62F6";
        return "#888";
    }

    $: getRowBackground = (rarity) => {
        if ($isDarkMode) {
            if (rarity === 6)
                return "linear-gradient(90deg, transparent 0%, rgba(255, 100, 0, 0.5) 100%)";
            if (rarity === 5)
                return "linear-gradient(90deg, transparent 0%, rgba(143, 114, 0, 1) 100%)";
        } else {
            if (rarity === 6)
                return "linear-gradient(90deg, transparent 0%, rgba(217, 98, 0, 0.27) 100%)";
            if (rarity === 5)
                return "linear-gradient(90deg, transparent 0%, rgba(255, 211, 89, 0.27) 100%)";
        }
        return "transparent";
    };

    function getAvgColor(val, max) {
        const num = parseFloat(val) || 0;
        const p = (num / max) * 100;
        if (p <= 35) return "#5DBE5A";
        if (p <= 50) return "#3CAF38";
        if (p <= 65) return "#D4AD3D";
        if (p <= 80) return "#C55E2F";
        return "#B03E09";
    }

    const isFeatured = (itemName, banner, rarity) => {
        if (!banner) return false;
        const list = rarity === 6 ? banner.featured6 : banner.featured5;
        if (!list || !Array.isArray(list)) return false;
        const normName = normalize(itemName);
        return list.some((f) => {
            const normF = normalize(f);
            return (
                normF === normName ||
                normF === normalize(lookupMap[normName]?.id)
            );
        });
    };

    $: tableData = (() => {
        const _ = serverOffset;
        const sorted = [...rawPulls].sort(
            (a, b) => new Date(a.time) - new Date(b.time),
        );
        let p6 = 0,
            p5 = 0;
        let bannerCounts = {};
        let rateUpCounter = 0;
        const isWeapon =
            bannerType.includes("weap") || bannerType.includes("wepon");
        const hardPityLimit = isWeapon ? 80 : 120;
        let processed = sorted.map((pull) => {
            const p = { ...pull };
            const banner = getBannerForPull(p.time, bannerType);
            const bid = banner ? banner.id : "other";

            if (!bannerCounts[bid]) bannerCounts[bid] = 0;

            let isFree = false;

                if (typeof p.isFree === 'boolean') {
                    isFree = p.isFree;
                } 
                else {
                    if (
                        banner &&
                        banner.type === "special" &&
                        !isWeapon &&
                        bannerCounts[bid] >= 30 &&
                        bannerCounts[bid] < 40
                    ) {
                        isFree = true;
                    }
                }
                
                p.isFree = isFree;

                bannerCounts[bid]++;
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
                    p.pity = 1;
                }
            } else {
                p.pity = 1;
            }
            let isHardPityTriggered = false;
            if (!isFree) {
                if (rateUpCounter >= hardPityLimit - 1) {
                    isHardPityTriggered = true;
                }
                rateUpCounter++;
            }

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

                        if (featured) {
                            if (isHardPityTriggered && p.rarity === 6) {
                                p.status = "guaranteed";
                            } else {
                                p.status = "won";
                            }
                            if (p.rarity === 6) {
                                rateUpCounter = 0;
                            }
                        } else {
                            p.status = "lost";
                        }
                    }
                }
            } else {
                p.status = "normal";
            }

            return p;
        });

        let batches = [];
        let currentBatch = [];

        processed.forEach((p, i) => {
            const prev = processed[i - 1];
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
        batches.forEach((batch) => {
            if (batch.length >= 2) {
                const midIndex = Math.floor((batch.length - 1) / 2);
                batch.forEach((p, i) => {
                    p.isBatch = true;
                    p.batchStart = i === 0;
                    p.batchEnd = i === batch.length - 1;
                    p.showBatchLabel = i === midIndex;
                });
            }
        });

        return processed.reverse();
    })();
    function getWeaponBg(rarity) {
        if (rarity === 6) return "bg-gradient-to-t from-[#591C00] to-[#BD896E]";
        if (rarity === 5) return "bg-gradient-to-t from-[#261E00] to-[#E3BC55]";
        if (rarity === 4) return "bg-gradient-to-t from-[#1A002E] to-[#9C62F6]";
        return "bg-gradient-to-t from-[#1a1a1a] to-[#666666]";
    }

    let selectedRarities = [6, 5, 4];

    function toggleRarity(rarity) {
        if (selectedRarities.length === 3) {
            selectedRarities = [rarity];
        } else if (selectedRarities.includes(rarity)) {
            if (selectedRarities.length === 1) {
                selectedRarities = [6, 5, 4];
            } else {
                selectedRarities = selectedRarities.filter((r) => r !== rarity);
            }
        } else {
            selectedRarities = [...selectedRarities, rarity];
        }
        if (selectedRarities.length === 0) selectedRarities = [6, 5, 4];
    }

    $: filteredTableData = (tableData || []).filter((row) =>
        selectedRarities.includes(row.rarity),
    );

    $: showBatches = selectedRarities.length === 3;

    $: homeBanners = [...bannerTypes]
        .filter((b) => b.showOnHome)
        .sort((a, b) => a.order - b.order);

    function getBannerImage(id) {
        const b = banners.find((x) => x.id === id);
        if (b && b.miniIcon) {
            return `/images/banners/miniIcon/${b.miniIcon}`;
        }
        if (id.includes("constant")) {
            const num = id.replace(/[^0-9]/g, "");
            const cleanNum = parseInt(num, 10);
            return `/images/banners/miniIcon/weaponbox_constant_${cleanNum}.png`;
        }
        if (b) {
            return `/images/banners/miniIcon/${b.id}.png`;
        }
        return null;
    }
</script>

<div class="max-w-[1600px] justify-start min-h-screen">
    <div class="flex items-center gap-4 mb-5">
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
            class="font-sdk text-[#21272C] dark:text-[#FDFDFD] flex flex-col items-start gap-0 md:flex-row md:items-center md:gap-3"
        >
            <span class="text-2xl md:text-5xl tracking-wide">
                {$t("page.title")}
            </span>

            <span
                class="text-gray-400 text-lg md:text-3xl font-normal whitespace-nowrap"
            >
                / {$t(`bannerTypes.${bannerType}`)}
            </span>
        </h2>
    </div>

    <!-- MAIN CONTAINER -->
    <div
        class="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_480px] 2xl:grid-cols-[minmax(0,1fr)_680px] gap-6 items-start"
    >
        <!-- СТАТИСТИКА -->
        <div class="flex mt-11  flex-col gap-6 w-full order-1 xl:order-2 min-w-0">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                    class="bg-white dark:bg-[#383838] dark:border-[#444444] rounded-xl shadow-sm border border-gray-100 p-5"
                >
                    <div class="space-y-2.5">
                        <div class="flex justify-between items-center">
                            <span class="text-gray-600 dark:text-[#E0E0E0]"
                                >{$t("page.banner.total")}</span
                            >
                            <span
                                class="font-bold text-xl font-nums text-[#21272C] dark:text-[#FDFDFD]"
                            >
                                {totalCount}
                            </span>
                        </div>

                        {#if !isNewPlayer && !isWeaponType}
                            <div class="flex justify-between items-center">
                                <span class="text-gray-600 dark:text-[#E0E0E0]"
                                    >{$t("page.banner.spent")}</span
                                >
                                <span
                                    class="font-bold text-gray-900 dark:text-[#FDFDFD] flex items-center gap-2 font-nums text-xl"
                                >
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
                            <div
                                class="flex items-center gap-1 text-gray-600 dark:text-[#E0E0E0]"
                            >
                                <span class="font-bold">6</span>
                                <Icon name="star" class="w-4 h-4" />
                                <span>{$t("page.banner.pity6")}</span>
                            </div>
                            <span
                                class="font-bold text-xl font-nums text-[#21272C] dark:text-[#FDFDFD]"
                            >
                                {currentPity6}<span
                                    class="text-sm text-gray-400 dark:text-[#787878]"
                                    >/{maxPity6}</span
                                >
                            </span>
                        </div>

                        {#if mileage.show}
                            <div class="flex justify-between items-center">
                                <div
                                    class="flex items-center gap-1 text-gray-600 dark:text-[#E0E0E0]"
                                >
                                    <span class="font-bold">6</span>
                                    <Icon name="star" class="w-4 h-4" />
                                    <span>{getMileageLabel(mileage.label)}</span
                                    >
                                </div>
                                <span
                                    class="font-bold text-xl font-nums text-[#21272C] dark:text-[#FDFDFD]"
                                >
                                    {mileage.current}<span
                                        class="text-sm text-gray-400 dark:text-[#787878]"
                                        >/{mileage.max}</span
                                    >
                                </span>
                            </div>
                        {/if}

                        {#if isWeaponType && !hasReceivedRateUp}
                            <div class="flex justify-between items-center">
                                <div
                                    class="flex items-center gap-1 text-gray-600 dark:text-[#E0E0E0]"
                                >
                                    <span class="font-bold">6</span>
                                    <Icon name="star" class="w-4 h-4" />
                                    <span
                                        >{$t(
                                            "page.banner.guarantee_rateup",
                                        )}</span
                                    >
                                </div>
                                <span
                                    class="font-bold text-xl font-nums text-[#21272C] dark:text-[#FDFDFD]"
                                >
                                    {weaponGuaranteeProgress}<span
                                        class="text-sm text-gray-400 dark:text-[#787878]"
                                        >/80</span
                                    >
                                </span>
                            </div>
                        {/if}

                        <div class="flex justify-between items-center">
                            <div
                                class="flex items-center gap-1 text-gray-600 dark:text-[#E0E0E0]"
                            >
                                <span class="font-bold">5</span>
                                <Icon name="star" class="w-4 h-4" />
                                <span>{$t("page.banner.pity5")}</span>
                            </div>
                            <span
                                class="font-bold text-xl font-nums text-[#21272C] dark:text-[#FDFDFD]"
                            >
                                {currentPity5}<span
                                    class="text-sm text-gray-400 dark:text-[#787878]"
                                    >/10</span
                                >
                            </span>
                        </div>
                    </div>
                </div>

                <div
                    class="bg-white dark:bg-[#383838] dark:border-[#444444] rounded-xl shadow-sm border border-gray-100 p-5"
                >
                    <h4
                        class="font-bold text-sm mb-2 dark:text-[#FDFDFD] text-[#21272C]"
                    >
                        {$t("page.banner.stats")}
                    </h4>

                    <div
                        class="grid grid-cols-4 text-xs dark:text-[#B7B6B3] text-gray-500 mb-1 font-medium"
                    >
                        <div>{$t("page.banner.rarity")}</div>
                        <div class="text-right">{$t("page.banner.count")}</div>
                        <div class="text-right">
                            {$t("page.banner.percent")}
                        </div>
                        <div class="text-right">{$t("page.banner.avg")}</div>
                    </div>

                    {#each statsRows as row}
                        <div
                            class="border-b dark:border-[#444444] border-gray-50 last:border-0"
                        >
                            <div
                                class="grid grid-cols-4 text-sm items-center py-1"
                            >
                                <div
                                    class="font-bold text-gray-700 dark:text-[#E0E0E0] flex items-center gap-1 font-nums"
                                >
                                    {row.label}
                                    <Icon name="star" class="w-4 h-4" />
                                </div>
                                <div
                                    class="text-right font-bold dark:text-[#E0E0E0] font-nums text-[#21272C]"
                                >
                                    {row.count}
                                </div>
                                <div
                                    class="text-right dark:text-[#B7B6B3] text-gray-600 font-nums"
                                >
                                    {row.percent}%
                                </div>
                                <div
                                    class="text-right font-bold font-nums text-[#1D6F42]"
                                    style="color: {getAvgColor(
                                        row.avg,
                                        row.avgMax,
                                    )}"
                                >
                                    {row.avg}
                                </div>
                            </div>

                            {#if hasRateUp && row.winRate.total > 0}
                                <div
                                    class="grid grid-cols-4 text-sm items-center py-1"
                                >
                                    <div
                                        class="text-gray-600 dark:text-[#E0E0E0] text-xs pl-2"
                                    >
                                        {#if isWeaponType}
                                            25:75
                                        {:else}
                                            50:50
                                        {/if}
                                    </div>

                                    <div
                                        class="text-right dark:text-[#E0E0E0] font-nums text-[#21272C]"
                                    >
                                        {row.winRate.won}/{row.winRate.total}
                                    </div>

                                    <div
                                        class="text-right dark:text-[#B7B6B3] text-gray-600 font-nums"
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

        <!-- ТАБЛИЦА -->
        <div class="flex flex-col gap-3 order-2 xl:order-1 min-w-0">
            <div class="flex gap-2">
                {#each [6, 5, 4] as rarity}
                    {@const isSelected = selectedRarities.includes(rarity)}
                    {@const color = getRarityColor(rarity)}
                    <button
                        on:click={() => toggleRarity(rarity)}
                        class="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold transition-all border shadow-sm select-none"
                        style="
                            background-color: {isSelected
                            ? color + '20'
                            : 'rgba(156, 163, 175, 0.1)'};
                            color: {isSelected ? color : '#9CA3AF'};
                            border-color: {isSelected ? color : 'transparent'};
                        "
                    >
                        <span>{rarity}</span>
                        <Icon name="star" class="w-3.5 h-3.5" />
                    </button>
                {/each}
            </div>
            <div
                class="w-full bg-white rounded-xl dark:border-[#444444] dark:bg-[#383838] shadow-sm border border-gray-100 overflow-hidden order-2 xl:order-1"
            >
                <div class="overflow-x-auto w-full">
                    <div class="min-w-[600px]">
                        <div
                            class="grid gap-2 px-4 py-3 border-b border-gray-100 bg-white dark:border-[#444444] dark:bg-[#424242] dark:text-[#FDFDFD] text-sm font-bold text-gray-700 pl-6"
                            style="grid-template-columns: 40px 40px minmax(140px, 1fr) 60px 130px 80px;"
                        >
                            <div class="whitespace-nowrap text-center">
                                {$t("systemNames.pull")}
                            </div>
                            <Tooltip
                                text={$t("systemNames.rarity")}
                                class="justify-center"
                            >
                                <div
                                    class="whitespace-nowrap flex items-center justify-center"
                                >
                                    <Icon name="star" class="w-4 h-4" />
                                </div>
                            </Tooltip>
                            <div class="whitespace-nowrap">
                                {$t("systemNames.operator")}
                            </div>
                            <div
                                class="flex items-center justify-center whitespace-nowrap"
                            >
                                {$t("systemNames.pity")}
                            </div>
                            <div class="whitespace-nowrap">
                                {$t("systemNames.date")}
                            </div>
                            <div class="text-right whitespace-nowrap">
                                {$t("systemNames.banner")}
                            </div>
                        </div>

                        <div>
                            {#if filteredTableData.length === 0}
                                <div
                                    class="h-64 flex flex-col items-center justify-center text-gray-400"
                                >
                                    <Icon name="noData" class="w-4 h-4" />
                                    <p class="text-sm">
                                        {$t("emptyState.noData") ||
                                            "Нет данных"}
                                    </p>
                                </div>
                            {:else}
                                {#each filteredTableData as row, index}
                                    {@const currentBanner = getBannerForPull(
                                        row.time,
                                        bannerType,
                                        row.name,
                                    )}

                                    {@const itemData =
                                        lookupMap[normalize(row.name)]}
                                    {@const itemId =
                                        itemData?.id || normalize(row.name)}
                                    {@const isWeapon =
                                        (itemData && !!weapons[itemData.id]) ||
                                        row.type === "weapon" ||
                                        isWeaponType}
                                    {@const bracketColor = row.isFree
                                        ? "#5DBE5A"
                                        : "#D0926E"}

                                    {@const translatedName =
                                        $t(
                                            isWeapon
                                                ? `weaponsList.${itemId}`
                                                : `characters.${itemId}`,
                                        ) || row.name}

                                    <div class="relative group/row">
                                        {#if showBatches && row.isBatch}
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
                                                    class="absolute z-30 font-bold text-[10px] tracking-wider select-none pointer-events-none flex items-center justify-center whitespace-nowrap bg-transparent backdrop-blur-[1px] py-1"
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
                                                    {row.isFree
                                                        ? "FREE x10"
                                                        : "x10"}
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
                                                class="font-nums text-gray-400 dark:text-[#B7B6B3] text-xs text-center justify-center flex items-center"
                                            >
                                                {totalCount - index}
                                            </div>

                                            <div
                                                class="text-lg flex items-center justify-center font-nums"
                                                style="color: {getRarityColor(
                                                    row.rarity,
                                                )}"
                                            >
                                                {row.rarity}
                                            </div>

                                            <div
                                                class="flex items-center min-w-0 pr-2"
                                            >
                                                <div
                                                    class="relative inline-flex items-center max-w-full"
                                                >
                                                    <div
                                                        class="relative z-10 flex-shrink-0"
                                                    >
                                                        <div
                                                            class="w-10 h-10 rounded-full overflow-hidden border-2 shadow-sm relative group
                {isWeapon ? getWeaponBg(row.rarity) : 'bg-transparent'}"
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
                                                        class="relative bg-transparent -ml-5 pl-7 pr-3 rounded-r-full border-y-2 border-r-2 border-l-0 min-w-0 w-full max-w-[280px] flex items-center h-10"
                                                        style="border-color: {getRarityColor(
                                                            row.rarity,
                                                        )}"
                                                    >
                                                        <span
                                                            class="text-gray-800 dark:text-[#E0E0E0] text-sm font-medium leading-tight block w-full truncate cursor-default"
                                                            title={translatedName}
                                                        >
                                                            {translatedName}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div
                                                class="flex items-center justify-center font-nums text-base gap-1"
                                                style="color: {getRarityColor(
                                                    row.rarity,
                                                )}"
                                            >
                                                <span>{row.pity}</span>

                                                {#if row.rarity >= 5 && row.status && row.status !== "normal" && !row.isFree}
                                                    {#if row.rarity === 6 || !isWeapon}
                                                        {#if row.status === "won"}
                                                            {#if !bannerType.includes("standard") && !bannerType.includes("new")}
                                                                <Tooltip
                                                                    textKey="status.won"
                                                                >
                                                                    <Icon
                                                                        name="star"
                                                                        class="w-4 h-4 text-[#D0926E]"
                                                                    />
                                                                </Tooltip>
                                                            {/if}
                                                        {:else if row.status === "lost"}
                                                            <Tooltip
                                                                textKey="status.lost"
                                                            >
                                                                <Icon
                                                                    name="lost"
                                                                    class="w-4 h-4 text-[#D0926E]"
                                                                />
                                                            </Tooltip>
                                                        {:else if row.status === "guaranteed"}
                                                            <Tooltip
                                                                textKey="status.guaranteed"
                                                            >
                                                                <Icon
                                                                    name="guaranteed"
                                                                    class="w-4 h-4 text-[#D0926E]"
                                                                />
                                                            </Tooltip>
                                                        {/if}
                                                    {/if}
                                                {/if}
                                            </div>

                                            <div
                                                class="text-gray-500 dark:text-[#B7B6B3] font-nums text-xs whitespace-nowrap"
                                            >
                                                {new Date(
                                                    row.time,
                                                ).toLocaleString("ru-RU")}
                                            </div>

                                            <div class="flex justify-end">
                                                {#if currentBanner}
                                                    <button
                                                        class="group relative h-10 w-20 rounded shadow-sm border border-gray-200 dark:border-[#7A7A7A] overflow-hidden hover:ring-2 hover:ring-[#e44e25] transition-all focus:outline-none bg-gray-100"
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
        </div>
    </div>
</div>
<BannerModal
    banner={selectedBanner}
    pageContext={bannerType}
    on:close={() => (selectedBanner = null)}
/>

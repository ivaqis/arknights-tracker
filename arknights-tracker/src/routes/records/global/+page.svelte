<script>
    import { onMount, onDestroy } from "svelte";
    import { t } from "$lib/i18n";
    import { goto } from "$app/navigation";
    import { fade } from "svelte/transition";
    import { currentLocale } from "$lib/stores/locale";

    import Select from "$lib/components/Select.svelte";
    import Icon from "$lib/components/Icons.svelte";
    import Images from "$lib/components/Images.svelte";
    import Button from "$lib/components/Button.svelte";
    import Tooltip from "$lib/components/Tooltip.svelte";
    import BannerModal from "$lib/components/BannerModal.svelte";
    import OperatorCard from "$lib/components/OperatorCard.svelte";
    import WeaponCard from "$lib/components/WeaponCard.svelte";

    import { characters } from "$lib/data/characters";
    import { weapons } from "$lib/data/weapons";
    import { currencies } from "$lib/data/items/currencies";
    import { banners } from "$lib/data/banners";
    import { bannerTypes } from "$lib/data/bannerTypes";
    import { API_BASE } from "$lib/api";

    const initialStats = {
        totalUsers: 0,
        totalPulls: 0,
        median6: 0,
        winRate5050: 0,
        totalObtained: 0,
        rates: {
            sixStar: { percent: "0.00", count: 0, items: [] },
            fiveStar: { percent: "0.00", count: 0, items: [] },
        },
        timeline: [],
        pityDist: [],
    };

    let stats = { ...initialStats };

    export let graphDates = [];

    $: chartData = stats.timeline || [];
    
    $: displayDates = graphDates || [];

    let hoveredIndex = -1;

    function getSmoothPath(data, width, height) {
        if (!data || data.length === 0) return "";
        if (data.length === 1) return `M 0,${height} L ${width},${height}`;

        const maxVal = Math.max(...data.map((d) => d.count), 1);
        const points = data.map((d, i) => {
            const x = (i / (data.length - 1)) * width;
            const y = height - (d.count / maxVal) * height;
            return [x, y];
        });

        let d = `M ${points[0][0]},${points[0][1]}`;
        for (let i = 0; i < points.length - 1; i++) {
            const [x0, y0] = i > 0 ? points[i - 1] : points[0];
            const [x1, y1] = points[i];
            const [x2, y2] = points[i + 1];
            const [x3, y3] =
                i !== points.length - 2 ? points[i + 2] : points[i + 1];

            const cp1x = x1 + (x2 - x0) / 6;
            const cp1y = y1 + (y2 - y0) / 6;
            const cp2x = x2 - (x3 - x1) / 6;
            const cp2y = y2 - (y3 - y1) / 6;

            d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${x2},${y2}`;
        }
        return d;
    }

    function getPluralKey(count, locale) {
        const rule = new Intl.PluralRules(locale).select(count);
        return `pull_${rule}`;
    }

    const normalize = (str) =>
        str?.toLowerCase().replace(/[^a-z0-9]/g, "") || "";

    const itemMap = { ...characters, ...weapons };
    const charIds = new Set(Object.values(characters).map((c) => c.id));
    const weaponIds = new Set(Object.values(weapons).map((w) => w.id));

    const lookupMap = Object.values(itemMap).reduce((acc, item) => {
        if (item.name) acc[normalize(item.name)] = item;
        if (item.id) acc[normalize(item.id)] = item;
        return acc;
    }, {});

    function resolveItem(name) {
        const normName = normalize(name);

        let itemData = lookupMap[normName];
        let itemId = itemData ? itemData.id : normName;

        let isWeapon = false;

        if (itemData) {
            if (weaponIds.has(itemData.id)) isWeapon = true;
            else if (
                !charIds.has(itemData.id) &&
                itemData.weapon &&
                !itemData.class
            )
                isWeapon = true;
        }

        return { id: itemId, isWeapon, name: itemData ? itemData.name : name };
    }

    let now = new Date();
    let timer;
    const currentServerId = "3";

    function parseWithServerOffset(dateStr) {
        if (!dateStr) return null;
        if (
            dateStr.includes("Z") ||
            (dateStr.includes("T") && dateStr.includes("+"))
        ) {
            return new Date(dateStr);
        }
        const offset = currentServerId === "2" ? 8 : -5;
        const sign = offset >= 0 ? "+" : "-";
        const pad = (n) => String(Math.abs(n)).padStart(2, "0");
        const iso = dateStr.replace(" ", "T") + `${sign}${pad(offset)}:00`;
        return new Date(iso);
    }

    function formatTimeLeft(endTimeStr) {
        if (!endTimeStr) return null;
        const end = parseWithServerOffset(endTimeStr);
        const diff = end - now;
        if (diff <= 0) return null;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
            (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        if (days > 0)
            return (
                $t("timer.left_d_h", { d: days, h: hours }) ||
                `${days}d ${hours}h`
            );
        if (hours > 0)
            return (
                $t("timer.left_h_m", { h: hours, m: minutes }) ||
                `${hours}h ${minutes}m`
            );
        return $t("timer.left_m", { m: minutes }) || `${minutes}m`;
    }

    onMount(() => {
        timer = setInterval(() => {
            now = new Date();
        }, 1000 * 60);
    });

    onDestroy(() => clearInterval(timer));

    $: sortedBannerTypes = [...bannerTypes].sort((a, b) => {
        if (a.id === "special") return -1;
        if (b.id === "special") return 1;
        return a.order - b.order;
    });

    $: typeOptions = sortedBannerTypes.map((bt) => ({
        value: bt.id,
        label: $t(bt.i18nKey) || bt.name,
    }));

    let selectedType = "special";

    $: isSimpleType =
        selectedType === "standard" || selectedType === "new-player";
    $: isBeginner = selectedType === "new-player";
    $: isWeaponCategory =
        selectedType.toLowerCase().includes("weap") ||
        selectedType === "weapon";

    $: maxPity = isWeaponCategory || selectedType === "new-player" ? 40 : 80;

    $: bannerOptions = banners
        .filter((b) => {
            const start = parseWithServerOffset(b.startTime);
            if (start && start > now) return false;

            const bid = b.id.toLowerCase();
            const bType = b.type.toLowerCase();
            const sType = selectedType.toLowerCase();

            if (sType === "new-player")
                return bType === "new-player" || bid === "beginner";
            if (sType.includes("standard") && sType.includes("weap"))
                return bid.includes("constant");
            if (sType.includes("special") && sType.includes("weap"))
                return (
                    (bType === "weapon" || bid.includes("weapon")) &&
                    !bid.includes("constant")
                );
            if (sType === "weapon")
                return bType === "weapon" || bid.includes("weapon");

            return b.type === selectedType;
        })
        .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
        .map((b) => ({
            value: b.id,
            label: $t(`banners.${b.id}`) || b.name,
            iconId: b.miniIcon ? b.miniIcon.replace(/\.[^/.]+$/, "") : b.id,
        }));

    let selectedBannerId = "";

    $: {
        let foundId = "";

        if (selectedType === "new-player") {
            const found = banners.find(
                (b) => b.id === "beginner" || b.type === "new-player",
            );
            if (found) foundId = found.id;
        } else if (isSimpleType) {
            const found = banners.find((b) => b.type === selectedType);
            if (found) foundId = found.id;
        }

        if (!foundId && bannerOptions.length > 0) {
            const currentExists = bannerOptions.find(
                (o) => o.value === selectedBannerId,
            );
            if (!currentExists) {
                const activeOption = bannerOptions.find((option) => {
                    const b = banners.find((x) => x.id === option.value);
                    if (!b) return false;
                    const start = parseWithServerOffset(b.startTime);
                    const end = b.endTime
                        ? parseWithServerOffset(b.endTime)
                        : null;
                    return start && now >= start && (!end || now <= end);
                });
                foundId = activeOption
                    ? activeOption.value
                    : bannerOptions[0].value;
            } else {
                foundId = selectedBannerId;
            }
        }

        if (foundId && foundId !== selectedBannerId) {
            selectedBannerId = foundId;
        }
    }

    $: currentBannerRaw = banners.find((b) => b.id === selectedBannerId);
    $: currentBanner = currentBannerRaw
        ? {
              ...currentBannerRaw,
              id: currentBannerRaw.id,
              icon: currentBannerRaw.icon || currentBannerRaw.id,
          }
        : null;

    $: bannerStatus = (() => {
        if (!currentBanner) return null;
        const start = parseWithServerOffset(currentBanner.startTime);
        const end = currentBanner.endTime
            ? parseWithServerOffset(currentBanner.endTime)
            : null;
        if (now < start) return "upcoming";
        if (end && now > end) return "ended";
        return "active";
    })();

    $: timeLeftString = currentBanner
        ? formatTimeLeft(currentBanner.endTime)
        : null;
    $: allFeaturedItems = (() => {
        if (!currentBanner?.featured6) return [];
        return currentBanner.featured6.map((id) => {
            const { id: resolvedId, isWeapon } = resolveItem(id);
            return {
                id: resolvedId,
                name: lookupMap[normalize(id)]?.name || id,
                isWeapon: isWeaponCategory || isWeapon,
                rarity: 6,
            };
        });
    })();

    $: mainFeatured =
        !isSimpleType && allFeaturedItems.length === 1
            ? allFeaturedItems[0]
            : null;

    const oroberyl = currencies.find((c) => c.id === "oroberyl") || {
        id: "oroberyl",
    };

    let isLoading = false;

    async function fetchStats(bannerId) {
        stats = { ...initialStats };
        if (!bannerId) return;

        const apiBannerId =
            bannerId === "new_player_01" ? "beginner" : bannerId;

        isLoading = true;
        try {
            const res = await fetch(
                `${API_BASE}/global/stats?bannerId=${apiBannerId}`,
            );
            const json = await res.json();

            if (json.code === 0) {
                const d = json.data;
                const total = d.totalPulls || 0;

                const r6 =
                    total > 0 ? ((d.total6 / total) * 100).toFixed(3) : "0.00";
                const r5 =
                    total > 0 ? ((d.total5 / total) * 100).toFixed(3) : "0.00";

                let obtained = 0;
                if (mainFeatured && d.items6) {
                    const foundItem = d.items6.find(
                        (i) =>
                            normalize(i.name) === normalize(mainFeatured.name),
                    );
                    obtained = foundItem ? foundItem.count : 0;
                }

                const total5050 = d.limitedCount + d.lost5050;
                const winRate =
                    total5050 > 0
                        ? ((d.limitedCount / total5050) * 100).toFixed(0)
                        : 0;

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
                            items: d.items6 || [],
                        },
                        fiveStar: {
                            percent: r5,
                            count: d.total5,
                            items: d.items5 || [],
                        },
                    },
                    timeline: d.timeline || [],
                    pityDist: d.pityDistribution || [],
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

    const fmt = (num) => (num ? num.toLocaleString("ru-RU") : "0");

    function getLinePath(data, width, height) {
        if (!data || data.length < 2) return "";
        const counts = data.map((d) => d.count);
        const max = Math.max(...counts, 1);
        const step = width / (data.length - 1);
        let d = `M 0 ${height - (counts[0] / max) * height}`;
        for (let i = 1; i < data.length; i++) {
            const x = i * step;
            const y = height - (counts[i] / max) * height;
            d += ` L ${x} ${y}`;
        }
        return d;
    }

    $: graphDates = (() => {
        if (!stats.timeline.length) return [];
        const count = 5;
        const step = (stats.timeline.length - 1) / (count - 1);
        return Array.from({ length: count }, (_, i) => {
            const index = Math.round(i * step);
            const item =
                stats.timeline[index] ||
                stats.timeline[stats.timeline.length - 1];
            return item ? item.date : "";
        });
    })();

    let isModalOpen = false;
    function openModal() {
        if (currentBanner) isModalOpen = true;
    }
</script>

{#if isModalOpen && currentBanner}
    <BannerModal
        banner={currentBanner}
        pageContext="global"
        on:close={() => (isModalOpen = false)}
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
        <h2
            class="font-sdk text-4xl md:text-5xl tracking-wide text-[#21272C] dark:text-[#FDFDFD]"
        >
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
                        placeholder={$t("global.selectBanner") ||
                            "Select Banner"}
                    />
                {/key}
            </div>
        {/if}
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div class="lg:col-span-4 xl:col-span-3 flex flex-col gap-4">
            {#if mainFeatured}
                {@const resolved = resolveItem(mainFeatured.name)}

                <div
                    class="bg-white dark:bg-[#383838] dark:border-[#444444] rounded-xl p-5 shadow-sm border border-gray-100 relative overflow-hidden"
                >
                    <div class="flex items-start gap-4">
                        <div class="shrink-0">
                            {#if resolved.isWeapon}
                                <WeaponCard
                                    weapon={{ ...resolved, rarity: 6 }}
                                    variant="small"
                                    hideName={true}
                                    className="w-[70px] h-[70px] shadow-sm"
                                />
                            {:else}
                                <OperatorCard
                                    operator={{ ...resolved, rarity: 6 }}
                                    variant="small"
                                    hideName={true}
                                    className="w-[70px] h-[70px] shadow-sm"
                                />
                            {/if}
                        </div>

                        <div
                            class="flex flex-col justify-center min-h-[70px] flex-1"
                        >
                            <div
                                class="font-bold text-[#21272C] dark:text-[#FDFDFD] leading-tight mb-1 line-clamp-2"
                            >
                                {$t(
                                    resolved.isWeapon
                                        ? `weaponsList.${resolved.id}`
                                        : `characters.${resolved.id}`,
                                ) || mainFeatured.name}
                            </div>
                            <div
                                class="text-[10px] text-gray-500 dark:text-[#B7B6B3] uppercase tracking-wide leading-none"
                            >
                                {$t("global.totalObtained") || "Total Obtained"}
                            </div>
                            <div
                                class="font-nums font-bold text-xl text-[#21272C] dark:text-[#FDFDFD] leading-none mt-1"
                            >
                                {fmt(stats.totalObtained)}
                            </div>
                        </div>
                    </div>
                </div>
            {/if}

            {#if !isWeaponCategory && (isSimpleType || allFeaturedItems.length > 1) && allFeaturedItems.length > 0}
                <div
                    class="bg-white dark:bg-[#383838] dark:border-[#444444] rounded-xl p-5 shadow-sm border border-gray-100"
                >
                    <h3
                        class="text-lg font-bold font-sdk text-[#21272C] dark:text-[#FDFDFD] mb-2"
                    >
                        {$t("global.featuredList") || "Featured Items"}
                    </h3>

                    <div class="flex flex-wrap gap-2">
                        {#each allFeaturedItems as item}
                            {@const resolved = resolveItem(item.name)}

                            <Tooltip
                                text={$t(
                                    resolved.isWeapon
                                        ? `weaponsList.${resolved.id}`
                                        : `characters.${resolved.id}`,
                                ) || item.name}
                            >
                                {#if resolved.isWeapon}
                                    <WeaponCard
                                        weapon={item}
                                        variant="small"
                                        hideName={true}
                                        className="w-[60px] h-[60px] shadow-sm"
                                    />
                                {:else}
                                    <OperatorCard
                                        operator={item}
                                        variant="small"
                                        hideName={true}
                                        className="w-[60px] h-[60px] shadow-sm border border-gray-100 dark:border-[#444444]"
                                    />
                                {/if}
                            </Tooltip>
                        {/each}
                    </div>
                </div>
            {/if}

            <div
                class="bg-white dark:bg-[#383838] dark:border-[#444444] rounded-xl p-5 shadow-sm border border-gray-100"
            >
                <div class="flex justify-between items-start mb-4">
                    <h3
                        class="text-lg font-bold font-sdk text-[#21272C] dark:text-[#FDFDFD]"
                    >
                        {$t("global.overview") || "Overview"}
                    </h3>
                </div>

                <div class="space-y-3">
                    <div class="flex justify-between items-center text-sm">
                        <span class="text-gray-600 dark:text-[#E4E4E4]"
                            >{$t("global.totalUsers") || "Total Users"}</span
                        >
                        <span
                            class="font-bold text-lg font-nums text-[#21272C] dark:text-[#FDFDFD]"
                            >{fmt(stats.totalUsers)}</span
                        >
                    </div>
                    <div class="flex justify-between items-center text-sm">
                        <span class="text-gray-600 dark:text-[#E4E4E4]"
                            >{$t("global.totalPulls") || "Total Pulls"}</span
                        >
                        <span
                            class="font-bold text-lg font-nums text-[#21272C] dark:text-[#FDFDFD]"
                            >{fmt(stats.totalPulls)}</span
                        >
                    </div>

                    {#if !isWeaponCategory && !isBeginner}
                        <div class="flex justify-between items-center text-sm">
                            <span class="text-gray-600 dark:text-[#E4E4E4]"
                                >{$t("global.spent") || "Oroberyl Spent"}</span
                            >
                            <span
                                class="font-bold text-gray-900 dark:text-[#FDFDFD] flex items-center gap-1.5 font-nums text-lg"
                            >
                                <Images
                                    id="oroberyl"
                                    variant="currency"
                                    size={20}
                                />
                                {fmt(stats.totalPulls * 500)}
                            </span>
                        </div>
                    {/if}
                </div>
            </div>

            <div
                class="bg-white dark:bg-[#383838] dark:border-[#444444] rounded-xl p-5 shadow-sm border border-gray-100"
            >
                <div class="flex justify-between items-center mb-4">
                    <h3
                        class="text-lg font-bold font-sdk text-[#21272C] dark:text-[#FDFDFD] flex items-center gap-1"
                    >
                        6 <Icon
                            name="star"
                            class="w-5 h-5 text-[#21272C] dark:text-[#FDFDFD]"
                        />
                        {$t("global.stats") || "Stats"}
                    </h3>
                </div>

                <div class="space-y-3">
                    <div class="flex justify-between items-center text-sm">
                        <span class="text-gray-600 dark:text-[#E4E4E4]"
                            >{$t("global.rate") || "Rate"}</span
                        >
                        <span
                            class="font-bold text-lg font-nums text-[#21272C] dark:text-[#FDFDFD]"
                            >{stats.rates.sixStar.percent}%</span
                        >
                    </div>
                    <div class="flex justify-between items-center text-sm">
                        <span class="text-gray-600 dark:text-[#E4E4E4]"
                            >{$t("global.count") || "Count"}</span
                        >
                        <span
                            class="font-bold text-lg font-nums text-[#21272C] dark:text-[#FDFDFD]"
                            >{fmt(stats.rates.sixStar.count)}</span
                        >
                    </div>
                    <div class="flex justify-between items-center text-sm">
                        <span class="text-gray-600 dark:text-[#E4E4E4]"
                            >{$t("global.median") || "Median Pity"}</span
                        >
                        <span
                            class="font-bold text-lg font-nums text-[#21272C] dark:text-[#FDFDFD]"
                            >{stats.median6}</span
                        >
                    </div>
                    {#if !isSimpleType && stats.winRate5050 > 0}
                        <div class="flex justify-between items-center">
                            <span
                                class="text-sm text-gray-600 dark:text-[#E4E4E4]"
                            >
                                {#if isWeaponCategory}
                                    {$t("global.won") || "Won"} 25:75
                                {:else}
                                    {$t("global.won") || "Won"} 50:50
                                {/if}
                            </span>
                            <span
                                class="text-lg font-nums text-[#21272C] dark:text-[#FDFDFD]"
                                >{stats.winRate5050}%</span
                            >
                        </div>
                    {/if}
                </div>
            </div>

            <div
                class="bg-white dark:bg-[#383838] dark:border-[#444444] rounded-xl p-5 shadow-sm border border-gray-100"
            >
                <div class="flex justify-between items-center mb-4">
                    <h3
                        class="text-lg font-bold font-sdk text-[#21272C] dark:text-[#FDFDFD] flex items-center gap-1"
                    >
                        5 <Icon
                            name="star"
                            class="w-5 h-5 text-[#21272C] dark:text-[#FDFDFD]"
                        />
                        {$t("global.stats") || "Stats"}
                    </h3>
                </div>
                <div class="space-y-3">
                    <div class="flex justify-between items-center text-sm">
                        <span class="text-gray-600 dark:text-[#E4E4E4]"
                            >{$t("global.rate") || "Rate"}</span
                        >
                        <span
                            class="font-bold text-lg font-nums text-[#21272C] dark:text-[#FDFDFD]"
                            >{stats.rates.fiveStar.percent}%</span
                        >
                    </div>
                    <div class="flex justify-between items-center text-sm">
                        <span class="text-gray-600 dark:text-[#E4E4E4]"
                            >{$t("global.count") || "Count"}</span
                        >
                        <span
                            class="font-bold text-lg font-nums text-[#21272C] dark:text-[#FDFDFD]"
                            >{fmt(stats.rates.fiveStar.count)}</span
                        >
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
                    on:keydown={(e) =>
                        (e.key === "Enter" || e.key === " ") && openModal()}
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
                            <div
                                class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90 pointer-events-none"
                            ></div>
                        </div>
                    {/key}

                    {#if bannerStatus}
                        <div
                            class="absolute bottom-6 left-6 right-6 z-20 pointer-events-none flex flex-col items-start gap-3"
                        >
                            <div
                                class="inline-flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-md border border-white/20 rounded-full shadow-lg"
                            >
                                <span
                                    class="w-2 h-2 rounded-full {bannerStatus ===
                                    'active'
                                        ? 'bg-[#FACC15] animate-pulse'
                                        : bannerStatus === 'upcoming'
                                          ? 'bg-blue-400'
                                          : 'bg-gray-400'}"
                                ></span>
                                <span
                                    class="text-xs font-bold text-white font-nums tracking-wide leading-none"
                                >
                                    {#if bannerStatus === "active" && timeLeftString}
                                        {timeLeftString}
                                    {:else}
                                        {$t(`status.${bannerStatus}`) ||
                                            bannerStatus}
                                    {/if}
                                </span>
                            </div>
                            <div>
                                <h1
                                    class="text-2xl md:text-4xl font-sdk font-bold text-white leading-tight drop-shadow-lg"
                                >
                                    {$t(`banners.${currentBanner.id}`) ||
                                        currentBanner.name}
                                </h1>
                            </div>
                        </div>
                    {/if}
                </div>
            {:else}
                <div
                    class="w-full aspect-[21/9] bg-gray-100 dark:bg-[#2C2C2C] rounded-xl flex items-center justify-center text-gray-400 dark:text-[#666] border border-dashed border-gray-300 dark:border-[#444]"
                >
                    {$t("global.selectBanner") || "Select Banner"}
                </div>
            {/if}
            <!-- График круток в день-->
            <div
                class="bg-white dark:bg-[#383838] dark:border-[#444444] rounded-xl p-5 shadow-sm border border-gray-100 h-[240px] flex flex-col relative group overflow-visible"
                role="figure"
            >
                <div
                    class="flex justify-between items-center mb-4 shrink-0 relative z-10"
                >
                    <div
                        class="text-xs font-bold text-gray-800 dark:text-[#FDFDFD]"
                    >
                        {$t("global.pullsPerDay") || "Pulls per Day"}
                    </div>
                </div>

                <div class="flex-1 flex flex-col min-h-0 relative">
                    <div class="flex-1 w-full relative min-h-0">
                        {#if chartData.length > 0}
                            {@const maxVal = Math.max(
                                ...chartData.map((t) => t.count),
                                1,
                            )}
                            {@const smoothPath = getSmoothPath(
                                chartData,
                                100,
                                100,
                            )}

                            <svg
                                viewBox="0 0 100 100"
                                preserveAspectRatio="none"
                                class="absolute inset-0 w-full h-full block overflow-visible pointer-events-none z-10"
                            >
                                <defs>
                                    <linearGradient
                                        id="chartGradient"
                                        x1="0"
                                        x2="0"
                                        y1="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="0%"
                                            stop-color="#FACC15"
                                            stop-opacity="0.4"
                                        />
                                        <stop
                                            offset="100%"
                                            stop-color="#FACC15"
                                            stop-opacity="0"
                                        />
                                    </linearGradient>
                                </defs>

                                <path
                                    d="{smoothPath} V 100 H 0 Z"
                                    fill="url(#chartGradient)"
                                    stroke="none"
                                />
                                <path
                                    d={smoothPath}
                                    fill="none"
                                    stroke="#FACC15"
                                    stroke-width="2"
                                    vector-effect="non-scaling-stroke"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                />
                            </svg>

                            <div
                                class="absolute inset-0 w-full h-full z-20 bg-transparent"
                                role="application"
                                aria-label="Interactive chart showing pulls history per day"
                                on:mousemove={(e) => {
                                    const rect =
                                        e.currentTarget.getBoundingClientRect();
                                    const x = e.clientX - rect.left;
                                    if (rect.width === 0) return;
                                    const idx = Math.floor(
                                        (x / rect.width) * chartData.length,
                                    );
                                    hoveredIndex = Math.min(
                                        Math.max(0, idx),
                                        chartData.length - 1,
                                    );
                                }}
                                on:mouseleave={() => (hoveredIndex = -1)}
                            ></div>

                            {#if hoveredIndex !== -1 && chartData[hoveredIndex]}
                                {@const point = chartData[hoveredIndex]}
                                {@const leftPos =
                                    (hoveredIndex / (chartData.length - 1)) *
                                    100}
                                {@const topPos =
                                    100 - (point.count / maxVal) * 100}

                                <div
                                    class="absolute inset-0 z-30 pointer-events-none"
                                >
                                    <div
                                        class="absolute top-0 bottom-0 w-px bg-gray-300 dark:bg-gray-600 border-r border-dashed border-gray-400"
                                        style="left: {leftPos}%;"
                                    ></div>

                                    <div
                                        class="absolute w-3 h-3 rounded-full border-2 border-white dark:border-[#383838] bg-[#FACC15] transform -translate-x-1/2 -translate-y-1/2"
                                        style="left: {leftPos}%; top: {topPos}%;"
                                    ></div>

                                    <div
                                        class="absolute top-0 transition-transform duration-75 ease-out"
                                        style="left: {leftPos}%; transform: translateX({leftPos >
                                        60
                                            ? '-105%'
                                            : '5%'});"
                                    >
                                        <div
                                            class="bg-white/95 dark:bg-[#2C2C2C]/95 backdrop-blur-sm text-xs rounded-md p-2 shadow-lg border border-black/5 dark:border-white/10 mt-1 min-w-[70px]"
                                        >
                                            <div
                                                class="text-gray-400 font-medium mb-0.5 text-[10px] uppercase tracking-wide"
                                            >
                                                {point.date}
                                            </div>
                                            <div
                                                class="flex items-center gap-1.5"
                                            >
                                                <span
                                                    class="font-black text-[#21272C] dark:text-[#FDFDFD] font-nums leading-none"
                                                >
                                                    {point.count}
                                                </span>
                                                <span
                                                    class="text-[#FACC15] font-bold text-[10px] leading-none mt-0.5"
                                                >
                                                    {(() => {
                                                        const n = point.count;
                                                        // Если есть currentLocale, используем его, иначе фоллбек
                                                        const loc =
                                                            $currentLocale ||
                                                            "ru";
                                                        const keySuffix =
                                                            new Intl.PluralRules(
                                                                loc,
                                                            ).select(n);
                                                        const fullKey = `global.pull_${keySuffix}`;
                                                        return $t(fullKey) ===
                                                            fullKey
                                                            ? $t("global.pulls")
                                                            : $t(fullKey);
                                                    })()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            {/if}
                        {:else}
                            <div
                                class="absolute inset-0 flex flex-col items-center justify-center text-gray-300 dark:text-[#666]"
                            >
                                <Icon
                                    name="noData"
                                    className="w-8 h-8 mb-2 opacity-30"
                                />
                                <span class="text-xs font-medium opacity-50"
                                    >{$t("global.noData") || "No Data"}</span
                                >
                            </div>
                        {/if}
                    </div>

                    <div
                        class="h-5 mt-1 flex justify-between items-center text-[9px] font-medium text-gray-400 dark:text-[#787878] select-none border-t border-dashed border-gray-100 dark:border-[#444] pt-1 shrink-0 z-0"
                    >
                        {#each displayDates as date}
                            <span>{date}</span>
                        {/each}
                    </div>
                </div>
            </div>
            <!-- График лег за крутку -->
            <div
                class="bg-white dark:bg-[#383838] dark:border-[#444444] rounded-xl p-5 shadow-sm border border-gray-100 h-[220px] flex flex-col z-0"
            >
                <div
                    class="text-xs font-bold text-gray-800 dark:text-[#FDFDFD] mb-4 flex items-center gap-0.5"
                >
                    {$t("global.pityDist") || "Pity Distribution"}
                    <Icon
                        name="star"
                        class="w-3 h-3 text-gray-800 dark:text-[#FDFDFD]"
                    />
                </div>
                <div class="flex-1 w-full relative flex items-end gap-[1px]">
                    {#if stats.pityDist.length > 0}
                        {@const maxCount = Math.max(
                            ...stats.pityDist.map((p) => p.count),
                            1,
                        )}

                        {#each Array(maxPity) as _, i}
                            {@const pity = i + 1}
                            {@const data = stats.pityDist.find(
                                (p) => p.pity === pity,
                            )}
                            {@const count = data ? data.count : 0}
                            {@const percent = data ? data.percent : 0}
                            {@const heightPct = (count / maxCount) * 100}

                            <div
                                class="flex-1 bg-gray-100 dark:bg-[#2C2C2C] relative group flex items-end rounded-t-sm"
                                style="height: 100%;"
                            >
                                {#if count > 0}
                                    <div
                                        class="w-full bg-[#D4BE48] hover:bg-[#FACC15] transition-all duration-200"
                                        style="height: {heightPct}%;"
                                    ></div>

                                    <div
                                        class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 opacity-0 group-hover:opacity-100 pointer-events-none z-50 transition-opacity duration-150"
                                    >
                                        <div
                                            class="bg-black/90 backdrop-blur text-white text-[10px] rounded-md px-2 py-1.5 shadow-xl border border-white/10 whitespace-nowrap"
                                        >
                                            <div
                                                class="font-mono text-gray-300"
                                            >
                                                {$t("global.roll") || "Roll"}:
                                                <span
                                                    class="text-white font-bold"
                                                    >{pity}</span
                                                >
                                            </div>
                                            <div
                                                class="font-mono text-gray-300"
                                            >
                                                {$t("global.total") || "Total"}:
                                                <span
                                                    class="text-white font-bold"
                                                    >{count}</span
                                                >
                                            </div>
                                            <div
                                                class="font-mono text-gray-300"
                                            >
                                                {$t("global.percent") ||
                                                    "Percent"}:
                                                <span
                                                    class="text-[#FACC15] font-bold"
                                                    >{percent}%</span
                                                >
                                            </div>
                                        </div>
                                    </div>
                                {/if}
                            </div>
                        {/each}
                    {:else}
                        <div
                            class="w-full h-full flex flex-col items-center justify-center text-gray-300 dark:text-[#666]"
                        >
                            <Icon
                                name="noData"
                                className="w-8 h-8 mb-2 opacity-50"
                            />
                            <span class="text-xs"
                                >{$t("global.noData") || "No Data"}</span
                            >
                        </div>
                    {/if}
                </div>
                <div
                    class="flex justify-between text-[10px] text-gray-400 dark:text-[#B7B6B3] mt-2 px-1"
                >
                    {#if maxPity === 40}
                        <span>1</span><span>10</span><span>20</span><span
                            >30</span
                        ><span>40</span>
                    {:else}
                        <span>1</span><span>20</span><span>40</span><span
                            >60</span
                        ><span>80</span>
                    {/if}
                </div>
            </div>
            <!-- Таблицы -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                    class="bg-white dark:bg-[#383838] dark:border-[#444444] rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col h-auto"
                >
                    <div
                        class="p-4 border-b border-gray-100 dark:border-[#444] flex items-center justify-center gap-2 shrink-0 bg-white dark:bg-[#383838]"
                    >
                        <h3
                            class="font-bold text-[#D0926E] text-lg flex items-center gap-1"
                        >
                            6 <Icon name="star" class="w-4 h-4" />
                            {$t("global.list") || "List"}
                        </h3>
                    </div>

                    <div class="w-full">
                        <table class="w-full text-sm text-left">
                            <thead
                                class="text-xs text-gray-500 dark:text-[#B7B6B3] uppercase bg-gray-50 dark:bg-[#2C2C2C]"
                            >
                                <tr>
                                    <th class="px-4 py-3 font-bold"
                                        >{$t("global.name") || "Name"}</th
                                    >
                                    <th class="px-4 py-3 font-bold text-right"
                                        >{$t("global.total") || "Total"}</th
                                    >
                                    <th class="px-4 py-3 font-bold text-right"
                                        >%</th
                                    >
                                </tr>
                            </thead>
                            <tbody
                                class="divide-y divide-gray-100 dark:divide-[#444]"
                            >
                                {#if stats.rates.sixStar.items && stats.rates.sixStar.items.length > 0}
                                    {#each stats.rates.sixStar.items as item, i}
                                        {@const resolved = resolveItem(
                                            item.name,
                                        )}

                                        <tr
                                            class="hover:bg-gray-50 dark:hover:bg-[#444] transition-colors group"
                                        >
                                            <td
                                                class="px-4 py-2 font-medium text-gray-900 dark:text-[#FDFDFD] flex items-center gap-3 relative"
                                            >
                                                {#if i === 0}
                                                    <div
                                                        class="absolute left-0 top-0 bottom-0 w-1 bg-[#D84C38]"
                                                    ></div>
                                                {/if}

                                                <div
                                                    class="w-10 h-10 rounded-full bg-gray-200 dark:bg-[#1E1E1E] overflow-hidden border-2 border-[#D84C38] shrink-0"
                                                >
                                                    <Images
                                                        id={resolved.id}
                                                        variant={resolved.isWeapon
                                                            ? "weapon-icon"
                                                            : "operator-icon"}
                                                        className="w-full h-full object-cover transform scale-110"
                                                        alt={item.name}
                                                    />
                                                </div>

                                                <span title={item.name}>
                                                    {$t(
                                                        resolved.isWeapon
                                                            ? `weaponsList.${resolved.id}`
                                                            : `characters.${resolved.id}`,
                                                    ) || item.name}
                                                </span>
                                            </td>
                                            <td
                                                class="px-4 py-2 text-right font-nums font-bold text-gray-900 dark:text-[#FDFDFD]"
                                            >
                                                {fmt(item.count)}
                                            </td>
                                            <td
                                                class="px-4 py-2 text-right font-nums text-gray-500 dark:text-[#B7B6B3]"
                                            >
                                                {item.percent}%
                                            </td>
                                        </tr>
                                    {/each}
                                {:else}
                                    <tr>
                                        <td colspan="3" class="px-4 py-10">
                                            <div
                                                class="flex flex-col items-center justify-center gap-2 text-gray-300 dark:text-[#666]"
                                            >
                                                <Icon
                                                    name="noData"
                                                    className="w-8 h-8 opacity-50"
                                                />
                                                <span class="text-xs"
                                                    >{$t("global.noData") ||
                                                        "No Data"}</span
                                                >
                                            </div>
                                        </td>
                                    </tr>
                                {/if}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div
                    class="bg-white dark:bg-[#383838] dark:border-[#444444] rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col h-auto"
                >
                    <div
                        class="p-4 border-b border-gray-100 dark:border-[#444] flex items-center justify-center gap-2 shrink-0 bg-white dark:bg-[#383838]"
                    >
                        <h3
                            class="font-bold text-[#E3BC55] text-lg flex items-center gap-1"
                        >
                            5 <Icon name="star" class="w-4 h-4" />
                            {$t("global.list") || "List"}
                        </h3>
                    </div>

                    <div class="w-full">
                        <table class="w-full text-sm text-left">
                            <thead
                                class="text-xs text-gray-500 dark:text-[#B7B6B3] uppercase bg-gray-50 dark:bg-[#2C2C2C]"
                            >
                                <tr>
                                    <th class="px-4 py-3 font-bold"
                                        >{$t("global.name") || "Name"}</th
                                    >
                                    <th class="px-4 py-3 font-bold text-right"
                                        >{$t("global.total") || "Total"}</th
                                    >
                                    <th class="px-4 py-3 font-bold text-right"
                                        >%</th
                                    >
                                </tr>
                            </thead>
                            <tbody
                                class="divide-y divide-gray-100 dark:divide-[#444]"
                            >
                                {#if stats.rates.fiveStar.items && stats.rates.fiveStar.items.length > 0}
                                    {#each stats.rates.fiveStar.items as item, i}
                                        {@const resolved = resolveItem(
                                            item.name,
                                        )}

                                        <tr
                                            class="hover:bg-gray-50 dark:hover:bg-[#444] transition-colors relative"
                                        >
                                            <td
                                                class="px-4 py-2 font-medium text-gray-900 dark:text-[#FDFDFD] flex items-center gap-3 relative"
                                            >
                                                {#if i === 0}
                                                    <div
                                                        class="absolute left-0 top-0 bottom-0 w-1 bg-[#E3BC55]"
                                                    ></div>
                                                {/if}

                                                <div
                                                    class="w-10 h-10 rounded-full bg-gray-200 dark:bg-[#1E1E1E] overflow-hidden border-2 border-[#E3BC55] shrink-0"
                                                >
                                                    <Images
                                                        id={resolved.id}
                                                        variant={resolved.isWeapon
                                                            ? "weapon-icon"
                                                            : "operator-icon"}
                                                        className="w-full h-full object-cover transform scale-110"
                                                        alt={item.name}
                                                    />
                                                </div>

                                                <span title={item.name}>
                                                    {$t(
                                                        resolved.isWeapon
                                                            ? `weaponsList.${resolved.id}`
                                                            : `characters.${resolved.id}`,
                                                    ) || item.name}
                                                </span>
                                            </td>
                                            <td
                                                class="px-4 py-2 text-right font-nums font-bold text-gray-900 dark:text-[#FDFDFD]"
                                            >
                                                {fmt(item.count)}
                                            </td>
                                            <td
                                                class="px-4 py-2 text-right font-nums text-gray-500 dark:text-[#B7B6B3]"
                                            >
                                                {item.percent}%
                                            </td>
                                        </tr>
                                    {/each}
                                {:else}
                                    <tr>
                                        <td colspan="3" class="px-4 py-10">
                                            <div
                                                class="flex flex-col items-center justify-center gap-2 text-gray-300 dark:text-[#666]"
                                            >
                                                <Icon
                                                    name="noData"
                                                    className="w-8 h-8 opacity-50"
                                                />
                                                <span class="text-xs"
                                                    >{$t("global.noData") ||
                                                        "No Data"}</span
                                                >
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

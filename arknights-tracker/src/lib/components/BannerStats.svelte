<script>
    import { t } from "$lib/i18n";
    import { characters } from "$lib/data/characters";
    import { weapons } from "$lib/data/weapons";
    import Icon from "$lib/components/Icons.svelte";
    import Tooltip from "$lib/components/Tooltip.svelte";
    import Images from "$lib/components/Images.svelte";

    export let pulls = [];
    export let banner = null;
    export let stats = {};

    $: isSpecial = banner?.type === "special";
    $: isNewPlayer =
        banner?.type === "new-player" || banner?.type === "new_player";
    $: isWeaponBanner =
        banner?.type === "weapon" ||
        banner?.id?.includes("weap") ||
        banner?.id?.includes("wepon");
    $: hasRateUp = isSpecial || isWeaponBanner;
    $: billableCount = (() => {
        // Оружие и Новичок = 0
        if (isWeaponBanner || isNewPlayer) return 0;
        
        // Сортируем по времени, чтобы правильно найти 30-ю и 40-ю крутку
        const sorted = [...pulls].sort((a, b) => new Date(a.time) - new Date(b.time));
        
        let count = 0;
        sorted.forEach((p, index) => {
            // index + 1 - это номер крутки (1, 2, 3...)
            const pullNumber = index + 1;
            
            let isFree = false;
            // Если Special баннер, то 31..40 бесплатно
            if (isSpecial && pullNumber > 30 && pullNumber <= 40) {
                isFree = true;
            }
            
            if (!isFree) {
                count++;
            }
        });
        return count;
    })();

    $: total = stats.total || 0;
    // Используем billableCount вместо total
    $: spent = (billableCount * 500).toLocaleString("ru-RU");
    $: count6 = stats.count6 || 0;
    $: count5 = stats.count5 || 0;
    $: percent6 = stats.percent6 || "0.00";
    $: percent5 = stats.percent5 || "0.00";
    $: avg6 = stats.avg6 || "0.0";
    $: avg5 = stats.avg5 || "0.0";
    $: avg6Max = isWeaponBanner || isNewPlayer ? 40 : 80;
    $: avg5Max = 10;
    $: avgMax = 0;
    $: avg = 0;
    $: winRateStats = stats.winRate || { won: 0, total: 0, percent: 0 };
    $: statsRows = [
        {
            label: "6",
            count: count6,
            percent: percent6,
            avg: avg6,
            winRate: winRateStats,
            avgMax: avg6Max,
        },
        {
            label: "5",
            count: count5,
            percent: percent5,
            avg: avg5,
            winRate: { won: 0, total: 0, percent: 0 },
            avgMax: avg5Max,
        },
    ];

    const normalize = (str) => str?.toLowerCase().replace(/\s+/g, "") || "";
    const itemMap = { ...characters, ...weapons };
    const lookupMap = Object.values(itemMap).reduce((acc, item) => {
        if (item.name) acc[normalize(item.name)] = item;
        acc[normalize(item.id)] = item;
        return acc;
    }, {});

    $: icons = pulls
        .filter((p) => p.rarity === 6)
        .sort((a, b) => new Date(a.time) - new Date(b.time))
        .map((p) => {
            const lookupKey = normalize(p.name);
            const itemData = lookupMap[lookupKey];
            const itemId = itemData?.id || normalize(p.name);
            const isWeaponItem = itemData
                ? !!weapons[itemData.id]
                : isWeaponBanner;

            return {
                id: itemId,
                pity: typeof p.pity === "number" ? p.pity : "?",
                name: p.name,
                isWeapon: isWeaponItem,
            };
        });

    function getPityColor(pity, isWeapon) {
        if (!pity || pity === "?") return "#21272C";
        const max = isWeapon ? 80 : 80;

        const p = (pity / max) * 100;

        if (p <= 25) return "#5DBE5A";
        if (p <= 40) return "#3CAF38";
        if (p <= 60) return "#D4AD3D";
        if (p <= 85) return "#C55E2F";
        return "#9A3404";
    }

    function getWeaponBg(rarity) {
        if (rarity === 6) return "bg-gradient-to-t from-[#591C00] to-[#BD896E]";
        if (rarity === 5) return "bg-gradient-to-t from-[#261E00] to-[#E3BC55]";
        return "bg-gradient-to-t from-[#1a1a1a] to-[#666666]";
    }

    function getAvgColor(val, max) {
        const num = parseFloat(val) || 0;
        const p = (num / max) * 100;
        if (p <= 35) return "#5DBE5A";
        if (p <= 50) return "#3CAF38";
        if (p <= 65) return "#D4AD3D";
        if (p <= 80) return "#C55E2F";
        return "#B03E09";
    }
</script>

<div class="space-y-4">
    <div class="flex items-center gap-2">
        <span
            class="text-gray-400 text-[10px] font-bold uppercase tracking-widest"
        >
            {$t("page.banner.stats") || "Statistics"}
        </span>
        <div class="h-px flex-1 bg-gray-100 dark:bg-[#444444]"></div>
    </div>

    <div
        class="bg-gray-50 dark:border-[#444444] dark:bg-[#343434] border rounded-lg p-3 flex items-center justify-between w-full"
    >
        <div class="flex-1 flex flex-col items-center justify-center">
            <span class="text-gray-500 dark:text-[#B7B6B3] text-xs block mb-0.5"
                >{$t("page.banner.total")}</span
            >
            <span
                class="font-bold text-gray-800 dark:text-[#E0E0E0] font-nums text-lg leading-none"
                >{total}</span
            >
        </div>

        {#if !isNewPlayer && !isWeaponBanner}
            <div class="w-px h-8 bg-gray-300 dark:bg-[#444444] mx-2"></div>
            <div class="flex-1 flex flex-col items-center justify-center">
                <span
                    class="text-gray-500 dark:text-[#B7B6B3] text-xs block mb-0.5"
                    >{$t("page.banner.spent")}</span
                >
                <div class="flex items-center gap-1.5">
                    <Images id="oroberyl" variant="currency" size={18} />
                    <span
                        class="font-bold text-gray-800 dark:text-[#E0E0E0] font-nums text-lg leading-none"
                        >{spent}</span
                    >
                </div>
            </div>
        {/if}
    </div>

    <div>
        <div
            class="grid grid-cols-4 text-xs dark:text-[#B7B6B3] text-gray-500 mb-1 font-medium"
        >
            <div>{$t("page.banner.rarity")}</div>
            <div class="text-right">{$t("page.banner.count")}</div>
            <div class="text-right">{$t("page.banner.percent")}</div>
            <div class="text-right">{$t("page.banner.avg")}</div>
        </div>

        {#each statsRows as row}
            <div
                class="border-b border-gray-50 dark:border-[#444444] last:border-0"
            >
                <div class="grid grid-cols-4 text-sm items-center py-1">
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
                        class="text-right text-gray-600 dark:text-[#B7B6B3] font-nums"
                    >
                        {row.percent}%
                    </div>
                    <div
                        class="text-right font-bold font-nums text-[#1D6F42]"
                        style="color: {getAvgColor(row.avg, row.avgMax)}"
                    >
                        {row.avg}
                    </div>
                </div>

                {#if hasRateUp && row.label === "6" && row.winRate.total > 0}
                    <div class="grid grid-cols-4 text-sm items-center py-1">
                        <div
                            class="text-gray-600 dark:text-[#E0E0E0] text-xs pl-6"
                        >
                            {#if isWeaponBanner}
                                25:75
                            {:else}
                                50:50
                            {/if}
                        </div>
                        <div
                            class="text-right font-nums dark:text-[#E0E0E0] text-[#21272C]"
                        >
                            {row.winRate.won}/{row.winRate.total}
                        </div>
                        <div
                            class="text-right text-gray-600 dark:text-[#B7B6B3] font-nums"
                        >
                            {row.winRate.percent}%
                        </div>
                        <div class="text-right"></div>
                    </div>
                {/if}
            </div>
        {/each}
    </div>

    {#if icons.length > 0}
        <div class="space-y-2">
            <h4
                class="text-xs font-bold text-[#21272C] dark:text-[#E0E0E0] flex items-center gap-1"
            >
                <span>{$t("page.banner.pulled")}</span>
                <span>6</span>
                <Icon name="star" class="w-3 h-3" />
                <span
                    >{$t(
                        isWeaponBanner
                            ? "page.banner.recent_weapons"
                            : "page.banner.operators",
                    )}</span
                >
            </h4>

            <div class="flex flex-wrap gap-2">
                {#each icons as icon}
                    <Tooltip
                        text={$t(
                            icon.isWeapon
                                ? `weaponsList.${icon.id}`
                                : `characters.${icon.id}`,
                        ) || icon.name}
                    >
                        <div
                            class="relative w-12 h-12 rounded-full cursor-pointer shadow-sm hover:scale-110 transition-transform"
                        >
                            <div
                                class="w-full h-full overflow-hidden bg-gradient-to-t from-[#591C00] to-[#CA774C] rounded-full border-2 {icon.isWeapon
                                    ? `border-[#ff6600] ${getWeaponBg(6)}`
                                    : 'border-[#ff6600] bg-gray-100'}"
                            >
                                <Images
                                    id={icon.id}
                                    variant={icon.isWeapon
                                        ? "weapon-icon"
                                        : "operator-icon"}
                                    size="100%"
                                    alt={icon.name}
                                    className={icon.isWeapon ? "scale-125" : ""}
                                />
                            </div>
                            <div
                                class="absolute -bottom-1 -right-1 min-w-7 px-2 py-1 rounded font-nums leading-none font-bold shadow-lg pointer-events-none flex items-center justify-center"
                                style="font-size: 0.85rem; min-width: 1.7rem;"
                            >
                                <div
                                    class="absolute inset-0 rounded opacity-90"
                                    style="background-color: {getPityColor(
                                        icon.pity,
                                        icon.isWeapon,
                                    )};"
                                ></div>
                                <span class="relative text-white z-10"
                                    >{icon.pity}</span
                                >
                            </div>
                        </div>
                    </Tooltip>
                {/each}
            </div>
        </div>
    {/if}
</div>

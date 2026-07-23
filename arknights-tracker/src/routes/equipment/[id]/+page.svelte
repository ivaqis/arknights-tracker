<script>
    import { page } from "$app/stores";
    import { t } from "$lib/i18n";
    import { currentLocale } from "$lib/stores/locale";
    import { equipment } from "$lib/data/items/equipment.js";
    import { browser } from "$app/environment";
    import { getRarityColor } from "$lib/utils/colorUtils.js";

    import Icon from "$lib/components/Icon.svelte";
    import Tooltip from "$lib/components/Tooltip.svelte";
    import ItemCard from "$lib/components/cards/ItemCard.svelte";
    import Button from "$lib/components/Button.svelte";
    import Image from "$lib/components/Image.svelte";
    import WeaponCard from "$lib/components/cards/WeaponCard.svelte";
    import NotFound from "$lib/components/NotFound.svelte";
    import { parseRichText, hyperlinkAction } from "$lib/utils/richText.js";

    function tOrFallback(key, fallback) {
        const translated = $t(key);
        if (typeof translated === "object") return fallback;
        return translated === key ? fallback : translated;
    }

    const localeModules = {
        en: import.meta.glob("/src/lib/locales/en/equipment.json"),
        ru: import.meta.glob("/src/lib/locales/ru/equipment.json"),
        de: import.meta.glob("/src/lib/locales/de/equipment.json"),
        es: import.meta.glob("/src/lib/locales/es/equipment.json"),
        fr: import.meta.glob("/src/lib/locales/fr/equipment.json"),
        id: import.meta.glob("/src/lib/locales/id/equipment.json"),
        it: import.meta.glob("/src/lib/locales/it/equipment.json"),
        ja: import.meta.glob("/src/lib/locales/ja/equipment.json"),
        ko: import.meta.glob("/src/lib/locales/ko/equipment.json"),
        pt: import.meta.glob("/src/lib/locales/pt/equipment.json"),
        th: import.meta.glob("/src/lib/locales/th/equipment.json"),
        vi: import.meta.glob("/src/lib/locales/vi/equipment.json"),
        zhcn: import.meta.glob("/src/lib/locales/zhcn/equipment.json"),
        zhtw: import.meta.glob("/src/lib/locales/zhtw/equipment.json"),
    };

    $: id = $page.params.id;
    $: equipData = equipment[id] || { rarity: 1, partType: 0 };

    let equipLocale = {};
    let copiedImageId = null;
    let selectedImageVariant = null;

    $: loadEquipData(id, $currentLocale);

    async function loadEquipData(targetId, lang) {
        if (!targetId) return;

        lang = lang || "en";
        const safeLang = lang.toLowerCase().replace("-", "");

        const localePath = `/src/lib/locales/${safeLang}/equipment.json`;
        const fallbackPath = `/src/lib/locales/en/equipment.json`;

        let localeLoader = localeModules[safeLang]?.[localePath];

        if (!localeLoader && safeLang !== "en") {
            localeLoader = localeModules["en"]?.[fallbackPath];
        }

        if (localeLoader) {
            const mod = await localeLoader();
            const allEquipLocale = mod.default || mod;
            equipLocale = allEquipLocale[targetId] || {};
        } else {
            equipLocale = {};
        }
    }

    $: equipName = equipLocale.name || id;
    $: rarity = equipData.rarity || 1;
    $: level = equipData.level || 70;
    $: pack = equipData.pack || "none";
    $: partTypeInt = equipData.partType !== undefined ? equipData.partType : 0;
    $: partTypeStr =
        partTypeInt === 0 ? "body" : partTypeInt === 1 ? "hand" : "edc";
    $: partTypeLabel = $t(`equipmentTypes.${partTypeStr}` || partTypeStr);
    $: rarityColor = getRarityColor(rarity);
    $: currentBlackboard = equipData.blackboard || {};
    function getScriptName(recipe, index) {
        if (!recipe) return "";
        const componentMat = recipe.find(m => m.name && m.name.endsWith("Component"));
        if (!componentMat) {
            return `${$t("recipes")} ${index + 1}`;
        }
        const techName = componentMat.name.replace("Component", "Technique");
        const key = `equipmentScriptNames.${techName}`;
        const translated = $t(key);
        if (translated && translated !== key) {
            return translated;
        }
        const baseName = componentMat.name.replace("Component", "");
        const formattedBase = baseName.charAt(0).toUpperCase() + baseName.slice(1);
        return `${formattedBase} Technique`;
    }

    function formatCostValue(val) {
        if (val >= 1000) {
            const formatted = val / 1000;
            return Number(formatted.toFixed(1)) + "K";
        }
        return val.toString();
    }

    function formatCostRange(materials) {
        if (!materials || materials.length === 0) return "0";
        const costs = materials.map(r => r[0]?.amount || 0).filter(v => v > 0);
        if (costs.length === 0) return "0";
        const minCost = Math.min(...costs);
        const maxCost = Math.max(...costs);
        if (minCost === maxCost) {
            return formatCostValue(minCost);
        }
        return `${formatCostValue(minCost)}-${formatCostValue(maxCost)}`;
    }

    $: neededMaterials = (equipData.materials && equipData.materials[0])
        ? equipData.materials[0].map((m) => ({
            id: m.name,
            name: m.name,
            amount: m.amount,
        }))
        : [];

    function interpolateBlackboard(text, bb) {
        if (!text) return "";
        if (!bb || Object.keys(bb).length === 0) return text;

        return text.replace(/\{([^}]+)\}/g, (match, content) => {
            let [expr, format] = content.split(":");
            let mathStr = expr.replace(/\b(\d+),(\d+)\b/g, (m, f) => Object.keys(bb)[f] || m);

            for (const key in bb) {
                const regex = new RegExp(`\\b${key}\\b`, "g");
                mathStr = mathStr.replace(regex, `(${bb[key]})`);
            }

            if (/[a-zA-Z_]/.test(mathStr)) return match;

            let result = 0;
            try {
                result = new Function("return " + mathStr)();
            } catch (e) {
                return match;
            }
            if (format) {
                if (format.includes("%")) {
                    result = parseFloat((result * 100).toFixed(2)) + "%";
                } else if (format === "0") {
                    result = Math.round(result);
                } else {
                    result = parseFloat(Number(result).toFixed(2));
                }
            }
            return `<span class="text-[#38BDF8] font-bold drop-shadow-sm">${result}</span>`;
        });
    }
    $: tiers = rarity >= 5 ? [0, 1, 2, 3] : [0];

    let isTableCopied = false;

    async function copyStatsTable() {
        let headers = [tOrFallback("sort.stats", "Атрибут")];
        for (let tier of tiers) {
            headers.push(`Tier ${tier}`);
        }
        let textData = headers.join("\t") + "\n";

        if (equipData.displayAttr) {
            equipData.displayAttr.forEach((attr) => {
                let row = [
                    tOrFallback(`equipSkills.${attr.attrType}`, attr.attrType),
                ];
                const isDef = attr.attrType.toLowerCase() === "def";
                const isAllDamage = attr.attrType.toLowerCase() === "alldamagetakenscalar";

                tiers.forEach((valIndex) => {
                    let val = attr.values[valIndex];
                    if (isDef && valIndex > 0) {
                        row.push("-");
                    } else if (val === 0 || !val) {
                        row.push("-");
                    } else if (Math.abs(val) > 0 && Math.abs(val) < 1) {
                        const displayVal = isAllDamage ? (1 - val) : val;
                        const pct = Math.round(displayVal * 1000) / 10;
                        row.push(`${pct}%`);
                    } else {
                        row.push(`${val}`);
                    }
                });
                textData += row.join("\t") + "\n";
            });
        }

        try {
            await navigator.clipboard.writeText(textData);
            isTableCopied = true;
            setTimeout(() => {
                isTableCopied = false;
            }, 2000);
        } catch (err) {
            console.error("Failed to copy table: ", err);
        }
    }

    const isPct = (vals) => (vals || []).some(v => v !== 0 && Math.abs(v) > 0 && Math.abs(v) < 1);

    $: usefulnessMap = (() => {
        if (equipData.rarity !== 5) return {};
        const slotItems = Object.entries(equipment)
            .filter(([_, data]) => data.rarity === 5 && data.partType === equipData.partType)
            .map(([eId, data]) => ({ id: eId, ...data }));

        const usefulness = {};
        for (const food of slotItems) {
            const foodAttrs = food.displayAttr || [];
            const foodNonDefAttrs = foodAttrs.filter((a) => a.attrType.toLowerCase() !== "def");
            if (foodNonDefAttrs.length === 0) {
                usefulness[food.id] = 0;
                continue;
            }
            const matchAttr = foodNonDefAttrs[0];
            const attrType = matchAttr.attrType;
            const matchIsPercent = isPct(matchAttr.values);
            const isInverted = attrType.toLowerCase().includes("damagetakenscalar");
            const foodValues = matchAttr.values.filter((v) => v !== undefined && v !== null);
            const foodBest = foodValues.length > 0
                ? (isInverted ? Math.min(...foodValues.map(Math.abs)) : Math.max(...foodValues.map(Math.abs)))
                : 0;

            let matchesCount = 0;
            for (const target of slotItems) {
                if (target.id === food.id) continue;
                const targetAttrs = target.displayAttr || [];
                const targetAttr = targetAttrs.find((a) => a.attrType === attrType && isPct(a.values) === matchIsPercent);
                if (!targetAttr) continue;
                const targetValues = targetAttr.values.filter((v) => v !== undefined && v !== null);
                const targetBest = targetValues.length > 0
                    ? (isInverted ? Math.min(...targetValues.map(Math.abs)) : Math.max(...targetValues.map(Math.abs)))
                    : 0;

                const isBetter = isInverted ? foodBest < targetBest : foodBest > targetBest;
                if (isBetter) {
                    matchesCount++;
                }
            }
            usefulness[food.id] = matchesCount;
        }
        return usefulness;
    })();

    function getUsefulnessClass(val) {
        if (val < 10) {
            return "text-yellow-600 bg-yellow-500/10 dark:text-yellow-200 dark:bg-yellow-400/10";
        } else if (val < 20) {
            return "text-yellow-700 bg-yellow-500/10 dark:text-yellow-300 dark:bg-yellow-400/10";
        } else if (val < 30) {
            return "text-yellow-800 bg-yellow-500/15 dark:text-yellow-400 dark:bg-yellow-400/15";
        } else {
            return "text-yellow-900 bg-yellow-500/20 dark:text-yellow-500 dark:bg-yellow-400/20";
        }
    }

    $: artificingMatches = (() => {
        if (equipData.rarity !== 5) return [];
        if (!equipData.displayAttr) return [];
        const pool = Object.entries(equipment).map(([eId, data]) => ({
            id: eId,
            ...data,
        }));
        const targetAttrs = equipData.displayAttr.filter(
            (a) => a.attrType.toLowerCase() !== "def",
        );
        return targetAttrs.map((targetAttr) => {
            const isInverted = targetAttr.attrType.toLowerCase().includes("damagetakenscalar");
            const targetValues = targetAttr.values.filter(
                (v) => v !== undefined && v !== null,
            );
            const targetBest =
                targetValues.length > 0
                    ? (isInverted
                        ? Math.min(...targetValues.map(Math.abs))
                        : Math.max(...targetValues.map(Math.abs)))
                    : 0;
            const targetIsPercent = isPct(targetValues);
            const matchesTargetAttr = (a) => {
                if (a.attrType !== targetAttr.attrType) return false;
                return isPct(a.values) === targetIsPercent;
            };

            const matchesMapped = pool
                .filter((food) => {
                    if (food.partType !== equipData.partType) return false;
                    if (food.rarity !== 5) return false;

                    const foodAttrs = food.displayAttr || [];
                    const foodAttr = foodAttrs.find(matchesTargetAttr);
                    if (!foodAttr) return false;
                    const foodValues = foodAttr.values.filter(
                        (v) => v !== undefined && v !== null,
                    );
                    const foodBest =
                        foodValues.length > 0
                            ? (isInverted
                                ? Math.min(...foodValues.map(Math.abs))
                                : Math.max(...foodValues.map(Math.abs)))
                            : 0;

                    const isWorse = isInverted ? foodBest > targetBest : foodBest < targetBest;
                    if (isWorse) return false;

                    return true;
                })
                .map((food) => {
                    const foodAttrs = food.displayAttr || [];

                    const foodAttr = foodAttrs.find(matchesTargetAttr);
                    const foodValues = foodAttr.values.filter(
                        (v) => v !== undefined && v !== null,
                    );
                    const foodBest =
                        foodValues.length > 0
                            ? (isInverted
                                ? Math.min(...foodValues.map(Math.abs))
                                : Math.max(...foodValues.map(Math.abs)))
                            : 0;

                    const isHigherStat = isInverted
                        ? foodBest < targetBest
                        : foodBest > targetBest;
                    const foodNonDefAttrs = foodAttrs.filter(
                        (a) => a.attrType.toLowerCase() !== "def",
                    );
                    const isFirstStat =
                        foodNonDefAttrs.length > 0 &&
                        matchesTargetAttr(foodNonDefAttrs[0]);
                    const craftCost = (food.materials && food.materials.length > 0 && food.materials[0].length > 0) ? food.materials[0][0].amount : Infinity;

                    return { ...food, isGoodMatch: isHigherStat && isFirstStat, foodMax: foodBest, isHigherStat, craftCost };
                });

            const absoluteBestStat =
                matchesMapped.length > 0
                    ? (isInverted
                        ? Math.min(...matchesMapped.map((m) => m.foodMax))
                        : Math.max(...matchesMapped.map((m) => m.foodMax)))
                    : 0;
            const matchesAtAbsoluteBest = matchesMapped.filter(m => m.foodMax === absoluteBestStat);
            const minCraftCostAtBestStat = matchesAtAbsoluteBest.length > 0 
                ? Math.min(...matchesAtAbsoluteBest.map(m => m.craftCost))
                : 0;

            const matches = matchesMapped
                .map((match) => {
                    const isBetterThanTarget = isInverted
                        ? match.foodMax < targetBest
                        : match.foodMax > targetBest;
                    const isRecommended =
                        isBetterThanTarget &&
                        match.foodMax === absoluteBestStat &&
                        match.craftCost === minCraftCostAtBestStat;

                    return { ...match, isRecommended };
                })
                .sort((a, b) => {
                    if (b.foodMax !== a.foodMax) {
                        return isInverted ? a.foodMax - b.foodMax : b.foodMax - a.foodMax;
                    }
                    if (a.isRecommended && !b.isRecommended) return -1;
                    if (!a.isRecommended && b.isRecommended) return 1;
                    if (a.isGoodMatch && !b.isGoodMatch) return -1;
                    if (!a.isGoodMatch && b.isGoodMatch) return 1;
                    if (a.craftCost !== b.craftCost) return a.craftCost - b.craftCost; 
                    return a.id.localeCompare(b.id);
                });

            return {
                attrType: targetAttr.attrType,
                matches,
            };
        });
    })();

    function extractShortCode(url) {
        if (!url) return null;
        try {
            const parsed = new URL(url);
            const x = parsed.searchParams.get("x");
            if (x) return x;
            const parts = parsed.pathname.split("/").filter(Boolean);
            if (parts.length > 0) return parts[parts.length - 1];
        } catch (e) {
        }
        const xMatch = url.match(/[?&]x=([^&]+)/);
        if (xMatch) return xMatch[1];
        const parts = url.split("/").filter(Boolean);
        if (parts.length > 0) {
            const last = parts[parts.length - 1];
            if (last.includes("?")) return last.split("?")[0];
            return last;
        }
        return null;
    }

    function getCleanUrlText(url) {
        if (!url) return "";
        return url.replace(/^https?:\/\//, "");
    }

    let showZoomModal = false;
</script>

<svelte:window on:keydown={(e) => showZoomModal && e.key === 'Escape' && (showZoomModal = false)} />

{#if !equipment[id]}
    <NotFound />
{:else}
<div class="min-h-screen md:px-8 md:py-3 font-sans transition-colors">
    <div class="w-full max-w-[1500px] mx-auto mb-6">
        <Button
            variant="roundSmall"
            color="white"
            onClick={() => history.back()}
        >
            <Icon name="arrowLeft" class="w-5 h-5" />
        </Button>
    </div>

    <div
        class="w-full max-w-[1500px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8 items-start"
    >
        <div class="col-span-1 xl:col-span-7 flex flex-col gap-6">
            <div
                class="bg-white dark:bg-[#2b2b2b] rounded-3xl flex flex-col overflow-hidden border border-gray-200 dark:border-[#444] transition-colors shadow-sm"
            >
                <div
                    class="relative min-h-[190px] flex p-6 overflow-hidden bg-white dark:bg-[#2b2b2b]"
                >
                    <div
                        class="absolute inset-0 z-0 pointer-events-none card-gradient"
                        style="--rarity-color: {rarityColor};"
                    ></div>

                    <div
                        class="absolute right-[-25px] md:right-[0px] top-1/2 -translate-y-1/2 w-[240px] h-[240px] md:w-[280px] md:h-[280px] z-10 pointer-events-none"
                    >
                        <Image
                            {id}
                            variant="equipment"
                            interactive={true}
                            className="w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)] transform-gpu scale-100"
                            alt={equipName}
                        />
                    </div>

                    <div
                        class="absolute top-4 right-4 z-20 flex flex-col gap-2"
                    >
                        <button
                            class="flex items-center justify-center w-8 h-8 bg-black/60 hover:bg-[#FFD800] text-white hover:text-black backdrop-blur rounded-full transition-all duration-300 shadow-md group/copy cursor-pointer"
                            title="Copy image"
                            on:click|stopPropagation={async () => {
                                try {
                                    const imageUrl = `/images/equipment/${id}.png`;
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
                                link.href = `/images/equipment/${id}.png`;
                                link.download = `${id}_equipment.png`;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                            }}
                        >
                            <Icon name="import" class="w-4 h-4 transition-transform group-hover/down:scale-110" />
                        </button>
                    </div>

                    <div
                        class="relative z-20 gap-1 flex flex-col h-full w-[65%]"
                    >
                        <h1
                            class="font-sdk text-3xl md:text-4xl font-bold text-[#21272C] dark:text-[#FDFDFD] leading-tight drop-shadow-sm mb-3"
                        >
                            {equipName}
                        </h1>

                        <div class="flex items-center gap-3 mb-6">
                            <Tooltip text={partTypeLabel}>
                                <div class="w-9 h-9 rounded bg-[#21272C] flex items-center justify-center shadow-sm">
                                    <Icon name={partTypeStr} class="w-7 h-7 text-white" />
                                </div>
                            </Tooltip>
                            <div class="w-[2px] h-5 bg-gray-300 dark:bg-[#555] rounded"></div>
                            <div class="flex -space-x-1">
                                {#each Array(rarity || 1) as _}
                                    <Icon name="strokeStar" class="w-9 h-9" style="color: {rarityColor}; stroke-opacity: 100%;" />
                                {/each}
                            </div>
                        </div>

                        <div class="mt-auto flex items-center gap-3">
                            <div
                                class="bg-gray-200 dark:bg-[#4A4A4A] w-fit rounded-md px-3 py-1 flex items-baseline gap-1.5 shadow-sm shrink-0"
                            >
                                <span
                                    class="text-[12px] font-bold text-gray-500 dark:text-gray-300 uppercase tracking-widest"
                                    >LV.</span
                                >
                                <span
                                    class="text-[26px] font-bold text-[#21272C] dark:text-white font-nums leading-none"
                                    >{level}</span
                                >
                            </div>

                            {#if pack === "none"}
                                <div
                                    class="bg-white/30 dark:bg-black/20 backdrop-blur-md border border-white/40 dark:border-white/10 px-2.5 py-1.5 rounded-md shadow-sm shrink-0 flex items-center justify-center"
                                >
                                    <span
                                        class="text-[11px] font-bold text-[#21272C] dark:text-white/90 uppercase tracking-widest leading-none"
                                    >
                                        {$t("packs.none" || "Non-Set")}
                                    </span>
                                </div>
                            {/if}
                        </div>
                    </div>
                </div>

                <div class="px-6 py-2">
                    <div class="overflow-x-auto custom-scrollbar pb-2">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr
                                    class="border-b border-gray-200 dark:border-[#444]"
                                >
                                    <th
                                        class="py-3 px-2 font-bold text-gray-500 dark:text-[#888] text-sm whitespace-nowrap w-[40%]"
                                    >
                                        {$t("sort.stats" || "Attribute")}
                                    </th>

                                    {#each tiers as tier}
                                        <th
                                            class="py-2 px-1 text-center w-[15%]"
                                        >
                                            <svg
                                                class="mx-auto w-[36px] h-[20px]"
                                                viewBox="0 0 54 30"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <rect
                                                    x="33.3789"
                                                    y="15"
                                                    width="4.23793"
                                                    height="14.7562"
                                                    rx="2.11897"
                                                    transform="rotate(30 33.3789 15)"
                                                    fill={tier >= 1
                                                        ? "#26BAFB"
                                                        : "#8F8F8F"}
                                                />
                                                <rect
                                                    x="41.8555"
                                                    y="15"
                                                    width="4.23793"
                                                    height="14.7562"
                                                    rx="2.11897"
                                                    transform="rotate(30 41.8555 15)"
                                                    fill={tier >= 2
                                                        ? "#26BAFB"
                                                        : "#8F8F8F"}
                                                />
                                                <rect
                                                    x="50.3281"
                                                    y="15"
                                                    width="4.23793"
                                                    height="14.7562"
                                                    rx="2.11897"
                                                    transform="rotate(30 50.3281 15)"
                                                    fill={tier >= 3
                                                        ? "#26BAFB"
                                                        : "#8F8F8F"}
                                                />

                                                <path
                                                    d="M28 17L20 29H8L0 17L8 5H20L28 17ZM14 12C11.2386 12 9 14.2386 9 17C9 19.7614 11.2386 22 14 22C16.7614 22 19 19.7614 19 17C19 14.2386 16.7614 12 14 12Z"
                                                    fill={tier >= 3
                                                        ? "#26BAFB"
                                                        : "#8F8F8F"}
                                                />
                                                {#if tier >= 1}
                                                    <path
                                                        d="M28.0068 17L20.0068 29H8.00684L4.39844 23.5859L9.8877 19.834C10.7895 21.1422 12.2978 22 14.0068 22C16.7683 22 19.0068 19.7614 19.0068 17C19.0068 15.9584 18.6885 14.9912 18.1436 14.1904L23.625 10.4453L28.0068 17Z"
                                                        fill="#26BAFB"
                                                    />
                                                {/if}

                                                <path
                                                    d="M31 0L36.1962 9H25.8038L31 0Z"
                                                    fill={tier >= 3
                                                        ? "#26BAFB"
                                                        : "#8F8F8F"}
                                                />
                                                {#if tier >= 1 && tier < 3}
                                                    <path
                                                        d="M33.5981 4.5L36.197 9H25.8047L33.5981 4.5Z"
                                                        fill="#26BAFB"
                                                    />
                                                {/if}
                                            </svg>
                                        </th>
                                    {/each}
                                </tr>
                            </thead>
                            <tbody
                                class="text-[14px] font-medium text-gray-800 dark:text-[#E4E4E4]"
                            >
                                {#if equipData.displayAttr}
                                    {#each equipData.displayAttr as attr, index}
                                        {@const iconName =
                                            attr.attrType.toLowerCase() ===
                                            "maxhp"
                                                ? "hp"
                                                : attr.attrType.toLowerCase()}
                                        {@const isDef =
                                            attr.attrType.toLowerCase() ===
                                            "def"}

                                        <tr
                                            class="border-b border-gray-100 dark:border-[#333] last:border-0 even:bg-gray-50 dark:even:bg-[#383838]/50 transition-colors"
                                        >
                                            <td
                                                class="py-2 px-2 flex items-center gap-3 whitespace-nowrap"
                                            >
                                                <Icon
                                                    name={iconName}
                                                    class="w-4 h-4 text-gray-700 dark:text-gray-200"
                                                />
                                                <span
                                                    class="text-[#21272C] dark:text-white"
                                                    >{$t(`equipSkills.${attr.attrType}` || attr.attrType)}</span
                                                >
                                            </td>

                                            {#each tiers as valIndex}
                                                {@const val =
                                                    attr.values[valIndex]}
                                                {@const isAllDamage =
                                                    attr.attrType.toLowerCase() ===
                                                    "alldamagetakenscalar"}
                                                {@const displayVal =
                                                    isAllDamage && val !== undefined
                                                        ? 1 - val
                                                        : val}
                                                <td
                                                    class="py-2 px-1 text-center font-nums text-[#21272C] dark:text-white"
                                                >
                                                    {#if isDef && valIndex > 0}
                                                        -
                                                    {:else if displayVal === 0 || !displayVal}
                                                        -
                                                    {:else if Math.abs(displayVal) > 0 && Math.abs(displayVal) < 1}
                                                        {Math.round(
                                                            displayVal * 1000,
                                                        ) / 10}%
                                                    {:else}
                                                        {Math.round(displayVal * 10) /
                                                            10}
                                                    {/if}
                                                </td>
                                            {/each}
                                        </tr>
                                    {/each}
                                {/if}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="px-6 pb-5 flex flex-col gap-1">
                    <div class="flex items-center justify-between pl-1">
                        <div>
                            {#if equipLocale.setBonus && pack !== "none"}
                                <h3
                                    class="text-sm font-bold text-gray-500 dark:text-[#888]"
                                >
                                    {$t(`packs.${pack}` || pack)}
                                </h3>
                            {/if}
                        </div>

                        <button
                            on:click={copyStatsTable}
                            class="p-0.5 rounded-md bg-white dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-600 dark:text-white transition-colors flex items-center gap-2 px-3 text-sm font-bold border border-gray-200 dark:border-transparent shadow-sm dark:shadow-none cursor-pointer"
                        >
                            {#if isTableCopied}
                                <Icon name="success" class="w-3.5 h-3.5 text-yellow-400" />
                            {:else}
                                <Icon name="copy" class="w-4 h-4" />
                            {/if}
                            <span>{$t("common.copy" || "Copy")}</span>
                        </button>
                    </div>

                    {#if equipLocale.setBonus && pack !== "none"}
                        <div
                            class="pl-1 text-gray-700 dark:text-[#E0E0E0] whitespace-pre-wrap text-[14px] leading-relaxed"
                            use:hyperlinkAction
                        >
                            {@html parseRichText(
                                interpolateBlackboard(
                                    equipLocale.setBonus,
                                    currentBlackboard,
                                ),
                            )}
                        </div>
                    {/if}
                    <hr class="border-gray-200 dark:border-[#444] my-2" />

                    {#if equipLocale.decoDesc}
                        <div
                            class="pl-1 text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-[13px] leading-relaxed"
                        >
                            {equipLocale.description}
                        </div>
                        <div
                            class="pl-1 text-gray-500 dark:text-[#A0A0A0] whitespace-pre-wrap text-[13px] leading-relaxed"
                        >
                            {equipLocale.decoDesc}
                        </div>
                    {/if}
                </div>
            </div>
            {#if artificingMatches.length > 0 && artificingMatches.some((group) => group.matches.length > 0)}
                <div
                    class="bg-white dark:bg-[#2b2b2b] p-6 rounded-3xl border border-gray-200 dark:border-[#444] flex flex-col gap-4 transition-colors shadow-sm"
                >
                    <h2
                        class="text-2xl font-bold text-[#21272C] dark:text-[#FDFDFD] font-sdk border-b border-gray-100 dark:border-[#444] pb-3"
                    >
                        {$t("stats.artificing" || "Artificing")}
                    </h2>

                    <div
                        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8 items-start"
                    >
                        {#each artificingMatches as attrGroup}
                            <div class="flex flex-col gap-3">
                                <div
                                    class="flex items-center gap-3 px-3 py-2.5 bg-gray-200 dark:bg-[#383838]/50 rounded-xl min-h-[48px] mb-1"
                                >
                                    <div
                                        class="w-8 h-8 bg-[#21272C] dark:bg-white/10 rounded-lg flex items-center justify-center shrink-0"
                                    >
                                        <Icon
                                            name={attrGroup.attrType.toLowerCase() ===
                                            "maxhp"
                                                ? "hp"
                                                : attrGroup.attrType.toLowerCase()}
                                            class="w-5 h-5 text-white"
                                        />
                                    </div>

                                    <span
                                        class="font-medium text-[15px] text-[#21272C] dark:text-white tracking-wide leading-tight"
                                    >
                                        {$t(`equipSkills.${attrGroup.attrType}` || attrGroup.attrType)}
                                    </span>
                                </div>

                                <div class="flex flex-col gap-2">
                                    {#each attrGroup.matches as match}
                                        <div
                                            class="relative flex items-center gap-3 p-1.5 rounded-xl border transition-all
                                            {match.isRecommended
                                                ? 'bg-[#22C55E]/5 border-[#22C55E]/30 hover:bg-[#22C55E]/15 hover:border-[#22C55E]/50 dark:bg-[#4ADE80]/10 dark:border-[#4ADE80]/30 dark:hover:bg-[#4ADE80]/20 dark:hover:border-[#4ADE80]/50'
                                                : match.isGoodMatch
                                                  ? 'bg-[#F9B90C]/5 border-[#F9B90C]/30 hover:bg-[#F9B90C]/15 hover:border-[#F9B90C]/50 dark:bg-[#F9B90C]/10 dark:border-[#F9B90C]/30 dark:hover:bg-[#F9B90C]/20 dark:hover:border-[#F9B90C]/50'
                                                  : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 dark:bg-[#333]/30 dark:border-[#444] dark:hover:bg-[#333]/60 dark:hover:border-[#666]'}"
                                        >
                                            <div class="relative w-[42px] h-[42px] shrink-0">
                                                <WeaponCard
                                                    weapon={match}
                                                    variant="small"
                                                    className="w-full h-full"
                                                    isEquipment={true}
                                                    hidePot={true}
                                                    hideName={true}
                                                    hideRarity={true}
                                                    disableHover={true}
                                                />
                                                {#if match.id === id}
                                                    <span
                                                        class="absolute bottom-0 left-0 right-0 py-[1.5px] bg-[#26BAFB]/60 dark:bg-[#26BAFB]/45 text-white text-[8px] font-bold uppercase leading-none text-center pointer-events-none rounded-b-[6px] shadow-sm z-30"
                                                    >
                                                        Same
                                                    </span>
                                                {/if}

                                            </div>

                                            <div class="flex flex-col flex-1 min-w-0 pr-2">
                                                
                                                <span
                                                    class="text-[13px] font-medium text-gray-800 dark:text-gray-200 leading-tight block whitespace-normal break-words"
                                                >
                                                    {$t(`equipment.${match.id}` || match.name || match.id)}
                                                </span>

                                                <div class="flex flex-col items-start gap-1.5 mt-1">
                                                    
                                                    {#if match.isRecommended}
                                                        <span
                                                            class="text-[11px] font-bold text-[#16A34A] dark:text-[#4ADE80] leading-none flex items-center gap-0.5"
                                                        >
                                                            {$t("stats.recommended" || "Recommended")}
                                                        </span>
                                                    {/if}

                                                    <div class="flex items-center gap-1.5 flex-wrap">
                                                        {#if match.isGoodMatch}
                                                            <span
                                                                class="text-[11px] font-medium {match.isRecommended
                                                                    ? 'text-[#F9B90C]/80'
                                                                    : 'text-[#F9B90C]'} leading-none"
                                                            >
                                                                {$t("stats.goodMatch" || "Good Match")}
                                                            </span>
                                                        {:else if !match.isRecommended}
                                                            <span
                                                                class="text-[11px] font-medium text-gray-400 dark:text-[#888] leading-none"
                                                            >
                                                                {$t("stats.standardMatch" || "Standard Match")}
                                                            </span>
                                                        {/if}
                                                    </div>
                                                </div>
                                            </div>

                                            <div class="absolute right-1 bottom-1 flex flex-col items-end gap-1">
                                                {#if usefulnessMap[match.id] !== undefined}
                                                    <Tooltip text={$t("stats.usefulnessTooltip" || "Number of items of this type for which this gear is a Good Match")}>
                                                        <span class="text-[10px] font-bold px-1 py-[1.5px] rounded-md select-none leading-none {getUsefulnessClass(usefulnessMap[match.id])}">
                                                            {usefulnessMap[match.id]}
                                                        </span>
                                                    </Tooltip>
                                                {/if}

                                                {#if match.craftCost !== Infinity && match.materials?.[0]?.[0]}
                                                    <Tooltip>
                                                        <div class="flex items-center gap-0.5 bg-white/50 dark:bg-black/30 border border-black/5 dark:border-white/5 px-1 py-0.5 rounded-md shadow-sm">
                                                            <div class="w-3.5 h-3.5 flex items-center justify-center shrink-0 pointer-events-none">
                                                                <Image
                                                                    id={match.materials[0][0].name}
                                                                    variant="item"
                                                                    className="max-w-full max-h-full object-contain drop-shadow-sm"
                                                                />
                                                            </div>
                                                            <span class="text-[11px] font-nums font-bold text-gray-600 dark:text-gray-300 leading-none mt-px pointer-events-none">
                                                                {formatCostRange(match.materials)}
                                                            </span>
                                                        </div>
                                                        <div slot="content" class="flex flex-col gap-1.5 p-1 text-xs">
                                                            {#each match.materials as recipe, i}
                                                                <div class="flex items-center gap-2 text-white/90">
                                                                    <span class="font-medium text-gray-300">{getScriptName(recipe, i)}:</span>
                                                                    
                                                                    {#if recipe[1]}
                                                                        <div class="flex items-center gap-1">
                                                                            <span class="font-bold text-yellow-400">{recipe[1].amount}</span>
                                                                            <div class="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                                                                                <Image id={recipe[1].name} variant="item" className="max-w-full max-h-full object-contain" />
                                                                            </div>
                                                                        </div>
                                                                    {/if}
                                                                    
                                                                    {#if recipe[0]}
                                                                        <div class="flex items-center gap-1 border-l border-white/20 pl-2">
                                                                            <span class="font-bold text-gray-300">{recipe[0].amount}</span>
                                                                            <div class="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                                                                                <Image id={recipe[0].name} variant="item" className="max-w-full max-h-full object-contain" />
                                                                            </div>
                                                                        </div>
                                                                    {/if}
                                                                </div>
                                                            {/each}
                                                        </div>
                                                    </Tooltip>
                                                {/if}
                                            </div>
                                        </div>
                                    {/each}

                                    {#if attrGroup.matches.length === 0}
                                        <div
                                            class="text-center py-4 text-gray-400 text-[13px] italic bg-gray-50/50 dark:bg-[#333]/20 rounded-xl border border-transparent dark:border-[#444]/50"
                                        >
                                            {$t("page.rating.noData" || "No data")}
                                        </div>
                                    {/if}
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>
            {/if}
        </div>

        <div class="col-span-1 xl:col-span-5 flex flex-col gap-6">
            <div
                class="bg-white dark:bg-[#2b2b2b] p-6 rounded-3xl border border-gray-200 dark:border-[#444] flex flex-col gap-4 transition-colors shadow-sm"
            >
                <div class="flex items-center justify-between border-b border-gray-100 dark:border-[#444] pb-3">
                    <h2 class="text-2xl font-bold text-[#21272C] dark:text-[#FDFDFD] font-sdk">
                        {$t("stats.materials" || "Materials")}
                    </h2>
                </div>
                <div class="pt-1">
                    {#if equipData.materials && equipData.materials.length > 1}
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {#each equipData.materials as recipe, i}
                                {@const techName = getScriptName(recipe, i)}
                                <div class="border border-gray-200 dark:border-[#444] rounded-2xl p-4 flex flex-col gap-3 transition-colors bg-transparent hover:border-gray-300 dark:hover:border-[#555] shadow-sm">
                                    {#if techName}
                                        <span class="font-bold text-sm text-gray-600 dark:text-gray-300 border-b border-gray-100 dark:border-[#383838] pb-1.5 leading-none">
                                            {techName}
                                        </span>
                                    {/if}
                                    <div class="flex flex-wrap gap-2.5">
                                        {#each recipe as mat}
                                            <ItemCard item={{ id: mat.name, name: mat.name }} amount={mat.amount} linkToRecipe={true} />
                                        {/each}
                                    </div>
                                </div>
                            {/each}
                        </div>
                    {:else}
                        <div class="flex flex-wrap gap-4">
                            {#if neededMaterials.length > 0}
                                {#each neededMaterials as mat (mat.id)}
                                    <ItemCard item={mat} amount={mat.amount} linkToRecipe={true} />
                                {/each}
                            {:else}
                                <div
                                    class="w-full text-gray-500 dark:text-[#B7B6B3] text-sm py-4 italic"
                                >
                                    {$t("systemNames.noMaterialsNeeded" || "No materials needed")}
                                </div>
                            {/if}
                        </div>
                    {/if}
                </div>
            </div>

            {#if equipData.url}
                {@const code = extractShortCode(equipData.url)}
                {#if code}
                    <div
                        class="bg-white dark:bg-[#2b2b2b] p-6 rounded-3xl border border-gray-200 dark:border-[#444] flex flex-col gap-4 transition-colors shadow-sm"
                    >
                        <h2
                            class="text-2xl font-bold text-[#21272C] dark:text-[#FDFDFD] font-sdk border-b border-gray-100 dark:border-[#444] pb-3"
                        >
                            {$t("systemNames.blueprintLocation")}
                        </h2>
                        
                        <div
                            class="relative rounded-2xl overflow-hidden aspect-[1200/630] w-full block shadow-md border border-gray-100 dark:border-[#444]"
                        >
                            <a
                                href={equipData.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                class="w-full h-full block group"
                            >
                                <img
                                    src="https://cdn.opendfieldmap.org/_dev/endfield/atlos/seo/og/r2/{code}.jpg"
                                    alt="Gear template location"
                                    class="w-full h-full object-cover transition-transform duration-500"
                                    loading="lazy"
                                    referrerpolicy="no-referrer"
                                />

                                <div class="absolute inset-0 pointer-events-none"></div>
                                
                                <div class="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white pointer-events-none">
                                    <div class="flex items-start gap-2.5">
                                        <div class="w-[3px] bg-white rounded self-stretch"></div>
                                        <span class="text-md font-bold tracking-wide drop-shadow-md max-w-[250px] group-hover:text-[#FFD800]">
                                            {$t("systemNames.gearTemplate")} - Open Endfield Map<Icon name="sendToLink" class="w-4 h-4 inline-block align-middle ml-1.5 text-current group-hover:text-[#FFD800]" />
                                        </span>
                                    </div>
                                </div>
                            </a>

                            <button
                                type="button"
                                class="absolute top-4 right-4 z-10 flex items-center justify-center w-11 h-11 rounded-xl bg-black/45 hover:bg-black/65 text-white transition-all duration-300 backdrop-blur-sm shadow-md cursor-pointer pointer-events-auto"
                                on:click={() => showZoomModal = true}
                            >
                                <Icon name="zoom-in" class="w-7 h-7 text-white" />
                            </button>
                        </div>
                    </div>

                    {#if showZoomModal}
                        <div
                            class="md:ml-[var(--sb-w)] fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 transition-opacity duration-300 cursor-default"
                            on:click={() => showZoomModal = false}
                            role="button"
                            tabindex="0"
                            on:keydown={(e) => e.key === 'Escape' && (showZoomModal = false)}
                        >
                            <div class="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center group pointer-events-none">
                                <img
                                    src="https://cdn.opendfieldmap.org/_dev/endfield/atlos/seo/og/r2/{code}.jpg"
                                    alt="Blueprint location map full screen"
                                    class="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-white/10 pointer-events-auto select-none"
                                    referrerpolicy="no-referrer"
                                />
                                
                                <button
                                    type="button"
                                    class="absolute -top-12 right-0 md:-right-12 flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer pointer-events-auto"
                                    on:click={() => showZoomModal = false}
                                >
                                    <Icon name="close" class="w-6 h-6 text-white" />
                                </button>
                            </div>
                        </div>
                    {/if}
                {/if}
            {/if}
        </div>
    </div>
</div>

{/if}

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

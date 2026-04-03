<script>
    import { page } from "$app/stores";
    import { t } from "$lib/i18n";
    import { currentLocale } from "$lib/stores/locale";
    import { equipment } from "$lib/data/items/equipment.js";

    import Icon from "$lib/components/Icons.svelte";
    import Tooltip from "$lib/components/Tooltip.svelte";
    import ItemCard from "$lib/components/ItemCard.svelte";
    import Button from "$lib/components/Button.svelte";
    import Images from "$lib/components/Images.svelte";
    import WeaponCard from "$lib/components/WeaponCard.svelte";

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
    $: partTypeLabel = tOrFallback(
        `equipmentTypes.${partTypeStr}`,
        partTypeStr,
    );

    function getRarityColors(r) {
        if (r === 6) return "#F87C32"; // Оранжевый из оружия
        if (r === 5) return "#F9B90C"; // Желтый
        if (r === 4) return "#9253F1"; // Фиолетовый
        if (r === 3) return "#25B9F9"; // Синий
        if (r === 2) return "#A5B100"; // Зеленый
        return "#888888";
    }
    $: rarityColor = getRarityColors(rarity);

    function parseRichText(text) {
        if (!text) return "";

        const styles = {
            "ba.natur": "text-[#4ADE80] font-bold", // Природный
            "ba.fire": "text-[#F87171] font-bold", // Огненный
            "ba.cryst": "text-[#67E8F9] font-bold", // Кристаллический
            "ba.pulse": "text-[#C084FC] font-bold", // Электрический
            "ba.phy": "text-[#A3A3A3] font-bold", // Физический
            "ba.poise": "text-[#FBBF24] font-bold", // Ошеломление
            "ba.vup": "text-[#38BDF8] font-bold", // Повышение
            "ba.key": "text-[#E3BC55] font-bold", // Ключевые термины
            "ba.conduct": "text-[#C084FC] font-bold", // Электризация
            "ba.spelldmg": "text-[#E3BC55] font-bold", // Урон от искусств
        };

        return text.replace(
            /<([@#])([^>]+)>([\s\S]*?)<\/>/g,
            (match, type, tag, content) => {
                if (tag === "profile.key") return content;

                let styleClass = styles[tag] || "text-[#E3BC55] font-bold";

                if (type === "#") {
                    styleClass +=
                        " underline decoration-dashed decoration-current underline-offset-4";
                }

                return `<span class="${styleClass}">${content}</span>`;
            },
        );
    }
    $: currentBlackboard = equipData.blackboard || {};
    $: neededMaterials = (equipData.materials || []).map((m) => ({
        id: m.name,
        name: m.name,
        amount: m.amount,
    }));

    function interpolateBlackboard(text, bb) {
        if (!text) return "";
        if (!bb || Object.keys(bb).length === 0) return text;

        return text.replace(/\{([^}]+)\}/g, (match, content) => {
            let [expr, format] = content.split(":");
            let mathStr = expr;

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
                let row = [tOrFallback(`equipSkills.${attr.attrType}`, attr.attrType)];
                const isDef = attr.attrType.toLowerCase() === 'def';
                
                tiers.forEach(valIndex => {
                    let val = attr.values[valIndex];
                    if (isDef && valIndex > 0) {
                        row.push("-");
                    } else if (val === 0 || !val) {
                        row.push("-");
                    } else if (Math.abs(val) > 0 && Math.abs(val) < 1) {
                        row.push(`${val * 100}%`);
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
            setTimeout(() => { isTableCopied = false; }, 2000);
        } catch (err) {
            console.error("Failed to copy table: ", err);
        }
    }

    $: artificingMatches = (() => {
        if (equipData.rarity !== 5) return [];
        if (!equipData.displayAttr) return [];
        const pool = Object.entries(equipment).map(([eId, data]) => ({ id: eId, ...data }));
        const targetAttrs = equipData.displayAttr.filter(a => a.attrType.toLowerCase() !== 'def');
        return targetAttrs.map(targetAttr => {
            const targetValues = targetAttr.values.filter(v => v !== undefined && v !== null);
            const targetMax = targetValues.length > 0 ? Math.max(...targetValues.map(Math.abs)) : 0;
            const matches = pool.filter(food => {
                if (food.partType !== equipData.partType) return false;
                if (food.rarity !== 5) return false;
                const foodAttrs = food.displayAttr || [];
                const foodAttrIndex = foodAttrs.findIndex(a => a.attrType === targetAttr.attrType);
                if (foodAttrIndex === -1) return false;
                const foodAttr = foodAttrs[foodAttrIndex];
                const foodValues = foodAttr.values.filter(v => v !== undefined && v !== null);
                const foodMax = foodValues.length > 0 ? Math.max(...foodValues.map(Math.abs)) : 0;
                if (foodMax < targetMax) return false;

                return true;
            }).map(food => {
                const foodAttrs = food.displayAttr || [];
                const foodNonDefAttrs = foodAttrs.filter(a => a.attrType.toLowerCase() !== 'def');
                const isGoodMatch = foodNonDefAttrs.length > 0 && foodNonDefAttrs[0].attrType === targetAttr.attrType;
                return { ...food, isGoodMatch };
            }).sort((a, b) => {
                if (a.isGoodMatch && !b.isGoodMatch) return -1;
                if (!a.isGoodMatch && b.isGoodMatch) return 1;
                return a.id.localeCompare(b.id);
            });

            return {
                attrType: targetAttr.attrType,
                matches
            };
        });
    })();
</script>

<div class="min-h-screen p-4 md:p-8 font-sans transition-colors">
    <div class="w-full max-w-[1500px] mx-auto mb-6">
        <Button
            variant="roundSmall"
            color="white"
            onClick={() => history.back()}
        >
            <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
            >
                <path d="M15 18l-6-6 6-6" />
            </svg>
        </Button>
    </div>

    <div
        class="w-full max-w-[1500px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8 items-start"
    >
        <div class="col-span-1 xl:col-span-7 flex flex-col gap-6">
        
        <div class="bg-white dark:bg-[#2b2b2b] rounded-3xl flex flex-col overflow-hidden border border-gray-200 dark:border-[#444] transition-colors shadow-sm">
            <div
                class="relative min-h-[190px] flex p-6 overflow-hidden bg-white dark:bg-[#2b2b2b]"
            >
                <div
                    class="absolute inset-0 z-0 pointer-events-none card-gradient"
                    style="--rarity-color: {rarityColor};"
                ></div>

                <div
                    class="absolute right-[0px] top-1/2 -translate-y-1/2 w-[240px] h-[240px] md:w-[280px] md:h-[280px] z-10 pointer-events-none"
                >
                    <Images
                        {id}
                        variant="equipment"
                        className="w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)] transform-gpu scale-100"
                        alt={equipName}
                    />
                </div>

                <div class="absolute top-4 right-4 z-20 flex flex-col gap-2">
                    <button
                        class="flex items-center justify-center w-8 h-8 bg-black/60 hover:bg-[#FFD800] text-white hover:text-black backdrop-blur rounded-full transition-all duration-300 shadow-md group/copy cursor-pointer"
                        title="Copy image"
                        on:click|stopPropagation={async () => {
                            try {
                                const imageUrl = `/images/equipment/${id}.png`;
                                const response = await fetch(imageUrl);
                                const blob = await response.blob();
                                await navigator.clipboard.write([
                                    new ClipboardItem({ [blob.type]: blob }),
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
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="3"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                class="animate-fadeIn text-[#FACC15] group-hover/copy:text-black"
                                ><polyline points="20 6 9 17 4 12"
                                ></polyline></svg
                            >
                        {:else}
                            <Icon
                                name="copy"
                                class="w-3.5 h-3.5 transition-transform group-hover/copy:scale-110"
                            />
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
                        <Icon
                            name="import"
                            class="w-4 h-4 transition-transform group-hover/down:scale-110"
                        />
                    </button>
                </div>

                <div class="relative z-20 gap-1 flex flex-col h-full w-[65%]">
                    <h1
                        class="font-sdk text-3xl md:text-4xl font-bold text-[#21272C] dark:text-[#FDFDFD] leading-tight drop-shadow-sm mb-3"
                    >
                        {equipName}
                    </h1>

                    <div class="flex items-center gap-3 mb-6">
                        <Tooltip text={partTypeLabel}>
                            <div
                                class="w-9 h-9 rounded bg-[#21272C] flex items-center justify-center shadow-sm"
                            >
                                <Icon
                                    name={partTypeStr}
                                    class="w-7 h-7 text-white"
                                />
                            </div>
                        </Tooltip>
                        <div
                            class="w-[2px] h-5 bg-gray-300 dark:bg-[#555] rounded"
                        ></div>
                        <div class="flex -space-x-1">
                            {#each Array(rarity || 1) as _}
                                <Icon
                                    name="strokeStar"
                                    class="w-9 h-9"
                                    style="color: {rarityColor}; stroke-opacity: 100%;"
                                />
                            {/each}
                        </div>
                    </div>

                    <div class="mt-auto flex items-center gap-3">
                        <div class="bg-gray-200 dark:bg-[#4A4A4A] w-fit rounded-md px-3 py-1 flex items-baseline gap-1.5 shadow-sm shrink-0">
                            <span class="text-[12px] font-bold text-gray-500 dark:text-gray-300 uppercase tracking-widest">LV.</span>
                            <span class="text-[26px] font-bold text-[#21272C] dark:text-white font-nums leading-none">{level}</span>
                        </div>
                        
                        {#if pack === 'none'}
                            <div class="bg-white/30 dark:bg-black/20 backdrop-blur-md border border-white/40 dark:border-white/10 px-2.5 py-1.5 rounded-md shadow-sm shrink-0 flex items-center justify-center">
                                <span class="text-[11px] font-bold text-[#21272C] dark:text-white/90 uppercase tracking-widest leading-none">
                                    {tOrFallback("packs.none", "Non-Set")}
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
                        <tr class="border-b border-gray-200 dark:border-[#444]">
                            <th
                                class="py-3 px-2 font-bold text-gray-500 dark:text-[#888] text-sm whitespace-nowrap w-[40%]"
                            >
                                {tOrFallback("sort.stats", "Attribute")}
                            </th>

                            {#each tiers as tier}
                                <th class="py-2 px-1 text-center w-[15%]">
                                    <svg class="mx-auto w-[36px] h-[20px]" viewBox="0 0 54 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect x="33.3789" y="15" width="4.23793" height="14.7562" rx="2.11897" transform="rotate(30 33.3789 15)" fill={tier >= 1 ? "#26BAFB" : "#8F8F8F"}/>
                                        <rect x="41.8555" y="15" width="4.23793" height="14.7562" rx="2.11897" transform="rotate(30 41.8555 15)" fill={tier >= 2 ? "#26BAFB" : "#8F8F8F"}/>
                                        <rect x="50.3281" y="15" width="4.23793" height="14.7562" rx="2.11897" transform="rotate(30 50.3281 15)" fill={tier >= 3 ? "#26BAFB" : "#8F8F8F"}/>
                                        
                                        <path d="M28 17L20 29H8L0 17L8 5H20L28 17ZM14 12C11.2386 12 9 14.2386 9 17C9 19.7614 11.2386 22 14 22C16.7614 22 19 19.7614 19 17C19 14.2386 16.7614 12 14 12Z" fill={tier >= 3 ? "#26BAFB" : "#8F8F8F"}/>
                                        {#if tier >= 1}
                                            <path d="M28.0068 17L20.0068 29H8.00684L4.39844 23.5859L9.8877 19.834C10.7895 21.1422 12.2978 22 14.0068 22C16.7683 22 19.0068 19.7614 19.0068 17C19.0068 15.9584 18.6885 14.9912 18.1436 14.1904L23.625 10.4453L28.0068 17Z" fill="#26BAFB"/>
                                        {/if}
                                        
                                        <path d="M31 0L36.1962 9H25.8038L31 0Z" fill={tier >= 3 ? "#26BAFB" : "#8F8F8F"}/>
                                        {#if tier >= 1 && tier < 3}
                                            <path d="M33.5981 4.5L36.197 9H25.8047L33.5981 4.5Z" fill="#26BAFB"/>
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
                                    attr.attrType.toLowerCase() === "maxhp"
                                        ? "hp"
                                        : attr.attrType.toLowerCase()}
                                {@const isDef =
                                    attr.attrType.toLowerCase() === "def"}

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
                                            >{tOrFallback(
                                                `equipSkills.${attr.attrType}`,
                                                attr.attrType,
                                            )}</span
                                        >
                                    </td>

                                    {#each tiers as valIndex}
                                        {@const val = attr.values[valIndex]}
                                        <td class="py-2 px-1 text-center font-nums text-[#21272C] dark:text-white">
                                            {#if isDef && valIndex > 0}
                                                -
                                            {:else if val === 0 || !val}
                                                -
                                            {:else if Math.abs(val) > 0 && Math.abs(val) < 1}
                                                {Math.round(val * 1000) / 10}%
                                            {:else}
                                                {Math.round(val * 10) / 10}
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
                            <h3 class="text-sm font-bold text-gray-500 dark:text-[#888] ">
                                {tOrFallback(`packs.${pack}`, pack)}
                            </h3>
                        {/if}
                    </div>

                    <button
                        on:click={copyStatsTable}
                        class="p-0.5 rounded-md bg-white dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-600 dark:text-white transition-colors flex items-center gap-2 px-3 text-sm font-bold border border-gray-200 dark:border-transparent shadow-sm dark:shadow-none cursor-pointer"
                    >
                        {#if isTableCopied}
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#FACC15"
                                stroke-width="3"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                class="animate-fadeIn"
                            >
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        {:else}
                            <Icon name="copy" class="w-4 h-4" />
                        {/if}
                        <span>{tOrFallback("common.copy", "Copy")}</span>
                    </button>
                </div>
                
                {#if equipLocale.setBonus && pack !== "none"}
                    <div class="pl-1 text-gray-700 dark:text-[#E0E0E0] whitespace-pre-wrap text-[14px] leading-relaxed">
                        {@html parseRichText(interpolateBlackboard(equipLocale.setBonus, currentBlackboard))}
                    </div>
                {/if}
                <hr class="border-gray-200 dark:border-[#444] my-2" />
                
                {#if equipLocale.decoDesc}
                    <div class="pl-1 text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-[13px] leading-relaxed">
                        {equipLocale.description}
                    </div>
                    <div class="pl-1 text-gray-500 dark:text-[#A0A0A0] whitespace-pre-wrap text-[13px] leading-relaxed">
                        {equipLocale.decoDesc}
                    </div>
                {/if}
            </div>
            
        </div>
        {#if artificingMatches.length > 0 && artificingMatches.some(group => group.matches.length > 0)}
                <div class="bg-white dark:bg-[#2b2b2b] p-6 rounded-3xl border border-gray-200 dark:border-[#444] flex flex-col gap-4 transition-colors shadow-sm">
                    <h2 class="text-2xl font-bold text-[#21272C] dark:text-[#FDFDFD] font-sdk border-b border-gray-100 dark:border-[#444] pb-3">
                        {tOrFallback("stats.artificing", "Artificing")}
                    </h2>
                    
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8 items-start">
                        {#each artificingMatches as attrGroup}
                            <div class="flex flex-col gap-3">
                                
                                <div class="flex items-center gap-2 pb-1 border-b border-gray-100 dark:border-[#383838] min-h-[48px]">
                                    <div class="w-7 h-7 bg-gray-100 dark:bg-[#333] rounded flex items-center justify-center shrink-0">
                                        <Icon name={attrGroup.attrType.toLowerCase() === 'maxhp' ? 'hp' : attrGroup.attrType.toLowerCase()} class="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                    </div>
                                    <span class="font-medium text-[15px] text-[#21272C] dark:text-white/90 leading-tight">
                                        {tOrFallback(`equipSkills.${attrGroup.attrType}`, attrGroup.attrType)}
                                    </span>
                                </div>
                                
                                <div class="flex flex-col gap-2">
                                    {#each attrGroup.matches as match}
                                        <div class="flex items-center gap-3 p-1.5 rounded-xl border transition-all 
                                            {match.isGoodMatch 
                                                ? 'bg-[#F9B90C]/5 border-[#F9B90C]/30 hover:bg-[#F9B90C]/15 hover:border-[#F9B90C]/50 dark:bg-[#F9B90C]/10 dark:border-[#F9B90C]/30 dark:hover:bg-[#F9B90C]/20 dark:hover:border-[#F9B90C]/50' 
                                                : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 dark:bg-[#333]/30 dark:border-[#444] dark:hover:bg-[#333]/60 dark:hover:border-[#666]'}">
                                            
                                            <WeaponCard 
                                                weapon={match} 
                                                variant="small" 
                                                className="w-[47px] h-[47px]" 
                                                isEquipment={true} 
                                                hidePot={true} 
                                                hideName={true} 
                                                hideRarity={true}
                                                disableHover={true} 
                                            />
                                            
                                            <div class="flex flex-col gap-0.5">
                                                <span class="text-[13px] font-medium text-gray-800 dark:text-gray-200 leading-tight">
                                                    {tOrFallback(`equipment.${match.id}`, match.name || match.id)}
                                                </span>
                                                
                                                <div class="flex items-center gap-2 mt-0.5">
                                                    {#if match.isGoodMatch}
                                                        <span class="text-[11px] font-medium text-[#F9B90C] leading-none">
                                                            {tOrFallback("stats.goodMatch", "Good Match")}
                                                        </span>
                                                    {:else}
                                                        <span class="text-[11px] font-medium text-gray-400 dark:text-[#888] leading-none">
                                                            {tOrFallback("stats.standardMatch", "Standard Match")} 
                                                        </span>
                                                    {/if}

                                                    {#if match.id === id}
                                                        <span class="px-1.5 py-[2px] rounded bg-[#26BAFB]/10 border border-[#26BAFB]/20 text-[#26BAFB] text-[9px] font-bold uppercase leading-none shadow-sm">
                                                            {tOrFallback("common.same", "Same")}
                                                        </span>
                                                    {/if}
                                                </div>
                                            </div>
                                        </div>
                                    {/each}

                                    {#if attrGroup.matches.length === 0}
                                        <div class="text-center py-4 text-gray-400 text-[13px] italic bg-gray-50/50 dark:bg-[#333]/20 rounded-xl border border-transparent dark:border-[#444]/50">
                                            {tOrFallback("page.rating.noData", "No data")}
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
                <h2
                    class="text-2xl font-bold text-[#21272C] dark:text-[#FDFDFD] font-sdk border-b border-gray-100 dark:border-[#444] pb-3"
                >
                    {tOrFallback("stats.materials", "Materials")}
                </h2>
                <div class="flex flex-wrap gap-4 pt-1">
                    {#if neededMaterials.length > 0}
                        {#each neededMaterials as mat (mat.id)}
                            <ItemCard item={mat} amount={mat.amount} />
                        {/each}
                    {:else}
                        <div
                            class="w-full text-gray-500 dark:text-[#B7B6B3] text-sm py-4 italic"
                        >
                            {tOrFallback(
                                "systemNames.noMaterialsNeeded",
                                "No materials needed",
                            )}
                        </div>
                    {/if}
                </div>
            </div>
            
        </div>
    </div>
</div>

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
